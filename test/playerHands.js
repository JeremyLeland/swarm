// Monster moves to player and bites player to death

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Angle from '../src/common/Angle.js';
import * as Grid from '../src/common/Grid.js';
import { vec2 } from '../lib/gl-matrix.js';

import * as Entities from '../src/Entities.js';

const PlayerSpeed = 0.003;
const PlayerTargetDeltaAngle = 0.1;

const PistolDelay = 500;
const PistolRange = 2;
const PistolBulletSpeed = 0.01;
const PistolBulletDamage = 1;

const playerInput = {
  left:   false,
  up:     false,
  right:  false,
  down:   false,
};

const player = {
  type: 'player',
  pos: [ 0, 0 ],
  radius: 0.5,
  facing: 0,
  life: 100,
  weapons: [
    { type: 'pistol', angle: 0, delay: 0 },
  ],
};

let entities = [
  player,
  { type: 'monster', pos: [ -1, 1 ], radius: 0.3, facing: 1, life: 1 },
  { type: 'monster', pos: [ -2, 2 ], radius: 0.4, facing: 0, life: 2 },
  { type: 'monster', pos: [  2, 1 ], radius: 0.5, facing: 1, life: 3 },
  { type: 'monster', pos: [  1, 2 ], radius: 0.6, facing: 0, life: 4 },
];

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -3, -3, 3, 3 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.update = ( dt ) => {
  const moveVector = [
    ( playerInput.left ? -1 : 0 ) + ( playerInput.right ? 1 : 0 ),
    ( playerInput.up   ? -1 : 0 ) + ( playerInput.down  ? 1 : 0 ),
  ];
  vec2.normalize( moveVector, moveVector );

  vec2.scaleAndAdd( player.pos, player.pos, moveVector, PlayerSpeed * dt );

  player.weapons.forEach( weapon => {
    if ( weapon.delay > 0 ) {
      weapon.delay -= dt;
    }

    const target = entities[ 1 ];

    if ( target ) {
      const toTarget = vec2.subtract( [], target.pos, player.pos );
      const targetDist = vec2.length( toTarget );
      const targetAngle = Math.atan2( toTarget[ 1 ], toTarget[ 0 ] );

      // TODO: Move toward target (don't jump immediately there)
      weapon.angle = targetAngle;

      if ( Math.abs( Angle.deltaAngle( weapon.angle, targetAngle ) ) < PlayerTargetDeltaAngle &&
           targetDist < PistolRange &&
           weapon.delay <= 0 ) {

        const dir = [ Math.cos( weapon.angle ), Math.sin( weapon.angle ) ];
        const pos = vec2.scaleAndAdd( [], player.pos, dir, Entities.PlayerInfo.Hand.Distance );
        const vel = vec2.scale( [], dir, PistolBulletSpeed );

        entities.push( { type: 'bullet', pos: pos, vel: vel, angle: weapon.angle, radius: 0.1, life: 1 } );

        weapon.delay += PistolDelay;
      }
    }
  } );

  entities.forEach( entity => {
    if ( entity.vel ) {
      vec2.scaleAndAdd( entity.pos, entity.pos, entity.vel, dt );
    }

    if ( entity.type == 'bullet' ) {
      // Remove out-of-bounds bullets
      if ( entity.pos[ 0 ] < -3 || entity.pos[ 0 ] > 3 ||
           entity.pos[ 1 ] < -3 || entity.pos[ 1 ] > 3 ) {
        entity.life = 0;
      }

      // Check for collision against monsters
      // TODO: Sweep collision test to find hit time (and make partices there?)
      entities.forEach( other => {
        if ( entity != other && other.type == 'monster' ) {
          if ( vec2.distance( entity.pos, other.pos ) < entity.radius + other.radius ) {
            other.life -= PistolBulletDamage;
            entity.life = 0;
          }
        }
      } );
    }
  } );

  entities = entities.filter( e => e.life > 0 );
}

gameCanvas.draw = ( ctx ) => {
  entities.forEach( enemy => Entities.draw( ctx, enemy ) );

  ctx.beginPath();
  ctx.arc( player.pos[ 0 ], player.pos[ 1 ], PistolRange, 0, Math.PI * 2 );
  ctx.lineWidth = 0.01;
  ctx.strokeStyle = 'yellow';
  ctx.stroke();

  Grid.draw( ctx, gameCanvas.bounds );
}

gameCanvas.start();


const keyDownAction = {
  ' ': () => gameCanvas.toggle(),
  'w': () => playerInput.up = true,
  'a': () => playerInput.left = true,
  's': () => playerInput.down = true,
  'd': () => playerInput.right = true,
}

const keyUpAction = {
  'w': () => playerInput.up = false,
  'a': () => playerInput.left = false,
  's': () => playerInput.down = false,
  'd': () => playerInput.right = false,
}

document.addEventListener( 'keydown', e => keyDownAction[ e.key ]?.() );
document.addEventListener( 'keyup', e => keyUpAction[ e.key ]?.() );