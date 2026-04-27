// Monster moves to player and bites player to death

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Grid from '../src/common/Grid.js';
import { vec2 } from '../lib/gl-matrix.js';

import * as Entities from '../src/Entities.js';

const PlayerSpeed = 0.003;

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
  weapons: [
    { type: 'pistol', angle: 0 },
  ],
};

const entities = [
  player,
  { type: 'monster', pos: [ -1, 1 ], radius: 0.3, facing: 0 },
  { type: 'monster', pos: [ -2, 2 ], radius: 0.4, facing: 0 },
  { type: 'monster', pos: [ 2, 1 ], radius: 0.5, facing: 0 },
  { type: 'monster', pos: [ 1, 2 ], radius: 0.6, facing: 0 },
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

  const target = entities[ 1 ];

  player.weapons.forEach( weapon => {
    const toTarget = vec2.subtract( [], target.pos, player.pos );
    weapon.angle = Math.atan2( toTarget[ 1 ], toTarget[ 0 ] );
  } );
}

gameCanvas.draw = ( ctx ) => {
  entities.forEach( enemy => Entities.draw( ctx, enemy ) );

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