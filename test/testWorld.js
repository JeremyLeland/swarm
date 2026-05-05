// Move update and draw code to World, test that here

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Angle from '../src/common/Angle.js';
import * as Grid from '../src/common/Grid.js';
import { vec2 } from '../lib/gl-matrix.js';

import * as Entities from '../src/Entities.js';
import { MapSize, World } from '../src/World.js';


const MinSpawnTime = 1000;
const MaxSpawnTime = 2000;

let spawnTimer = MinSpawnTime;

const world = new World();

world.entities.push( world.newPlayer() );

world.entities.push(
  world.newMonster( { pos: [ -1, 1 ], radius: 0.3, facing: 1, life: 1 } ),
  world.newMonster( { pos: [ -2, 2 ], radius: 0.4, facing: 0, life: 2 } ),
  world.newMonster( { pos: [  2, 1 ], radius: 0.5, facing: 1, life: 3 } ),
  world.newMonster( { pos: [  1, 2 ], radius: 0.6, facing: 0, life: 4 } ),
);


const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -MapSize, -MapSize, MapSize, MapSize ];
gameCanvas.backgroundColor = '#123';

const input = {
  left:   false,
  up:     false,
  right:  false,
  down:   false,
};

gameCanvas.update = ( dt ) => {

  if ( spawnTimer > 0 ) {
    spawnTimer -= dt;
  }
  else {
    spawnTimer += MinSpawnTime + Math.random() * ( MaxSpawnTime - MinSpawnTime );

    const dist = MapSize + Math.random() * 4;
    const angle = Math.random() * Math.PI * 2;

    // TODO: Weight more heavily toward smaller monsters
    const size = Math.random();

    world.entities.push(
      world.newMonster( {
        pos: [ Math.cos( angle ) * dist, Math.sin( angle ) * dist ],
        radius: 0.3 + size * 0.3,
        life: Math.ceil( size * 4 ),
      } )
    );
  }

  world.update( dt, input );
}

gameCanvas.draw = ( ctx ) => {
  world.draw( ctx );
  Grid.draw( ctx, gameCanvas.bounds );
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