// Move update and draw code to World, test that here

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Angle from '../src/common/Angle.js';
import * as Grid from '../src/common/Grid.js';
import { randomFrom } from '../src/common/Util.js';
import { vec2 } from '../lib/gl-matrix.js';

import * as Entities from '../src/Entities.js';
import { MapSize, World } from '../src/World.js';


const PowerupMinSpawnTime = 5000;
const PowerupMaxSpawnTime = 8000;

const EnemyMinSpawnTime = 300;
const EnemyMaxSpawnTime = 1000;

const MonsterTypes = [
  'monster_green',
  'monster_blue',
  'monster_yellow',
];

const PowerupTypes = [
  'health',
];


const ScreenWidth_2 = 16 / 2;
const ScreenHeight_2 = 10 / 2;

const gameCanvas = new GameCanvas();
gameCanvas.setBounds( -ScreenWidth_2, -ScreenHeight_2, ScreenWidth_2, ScreenHeight_2 );
gameCanvas.backgroundColor = '#321';


const world = new World();

world.entities.push( world.newPlayer() );

const input = {
  left:   false,
  up:     false,
  right:  false,
  down:   false,
};

let enemySpawnTimer = EnemyMinSpawnTime;
let powerupSpawnTimer = PowerupMinSpawnTime;

gameCanvas.update = ( dt ) => {

  // Spawning more enemies
  if ( enemySpawnTimer > 0 ) {
    enemySpawnTimer -= dt;
  }
  else {
    enemySpawnTimer += EnemyMinSpawnTime + Math.random() * ( EnemyMaxSpawnTime - EnemyMinSpawnTime );

    const dist = Math.random() * MapSize + 2; //MapSize + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;

    world.entities.push(
      world.newMonster( {
        type: randomFrom( MonsterTypes ),
        pos: [ Math.cos( angle ) * dist, Math.sin( angle ) * dist ],
        size: Math.random() ** 3,   // weight more heavily toward smaller monsters
      } )
    );
  }

  // Spawning powerups
  if ( powerupSpawnTimer > 0 ) {
    powerupSpawnTimer -= dt;
  }
  else {
    powerupSpawnTimer += PowerupMinSpawnTime + Math.random() * ( PowerupMaxSpawnTime - PowerupMinSpawnTime );

    const dist = Math.random() * MapSize;
    const angle = Math.random() * Math.PI * 2;

    world.entities.push(
      world.newPowerup( {
        type: randomFrom( PowerupTypes ),
        pos: [ Math.cos( angle ) * dist, Math.sin( angle ) * dist ],
        // TODO: random amount of life? decay life in update so they stick around temporarily
      } )
    );
  }

  world.update( dt, input );

  const player = world.entities.find( e => e.type === 'player' );

  if ( player ) {
    const x = Math.max( -MapSize + ScreenWidth_2, Math.min( MapSize - ScreenWidth_2, player.pos[ 0 ] ) );
    const y = Math.max( -MapSize + ScreenHeight_2, Math.min( MapSize - ScreenHeight_2, player.pos[ 1 ] ) );

    gameCanvas.setBounds(
      x - ScreenWidth_2,
      y - ScreenHeight_2,
      x + ScreenWidth_2,
      y + ScreenHeight_2,
    );
  }
}

const MapBounds = [ -MapSize, -MapSize, MapSize, MapSize ];

gameCanvas.draw = ( ctx, bounds ) => {
  world.draw( ctx, bounds );
  // Grid.draw( ctx, MapBounds );
}

gameCanvas.start();


const keyDownAction = {
  ' ': () => gameCanvas.toggle(),
  'w': () => input.up = true,
  'a': () => input.left = true,
  's': () => input.down = true,
  'd': () => input.right = true,
}

const keyUpAction = {
  'w': () => input.up = false,
  'a': () => input.left = false,
  's': () => input.down = false,
  'd': () => input.right = false,
}

document.addEventListener( 'keydown', e => keyDownAction[ e.key ]?.() );
document.addEventListener( 'keyup', e => keyUpAction[ e.key ]?.() );
