// Test out flashing the enemy to indicate hit

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Angle from '../src/common/Angle.js';
import * as Grid from '../src/common/Grid.js';
import { vec2 } from '../lib/gl-matrix.js';

import * as Entities from '../src/Entities.js';
import { World } from '../src/World.js';


const world = new World();

world.entities.push( world.newPlayer() );

world.entities.push(
  world.newMonster( { pos: [ -1, 1 ], radius: 0.3, facing: 1, life: 1 } ),
  world.newMonster( { pos: [ -2, 2 ], radius: 0.4, facing: 0, life: 2 } ),
  world.newMonster( { pos: [  2, 1 ], radius: 0.5, facing: 1, life: 3 } ),
  world.newMonster( { pos: [  1, 2 ], radius: 0.6, facing: 0, life: 4 } ),
);


const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -3, -3, 3, 3 ];
gameCanvas.backgroundColor = '#123';


gameCanvas.update = ( dt ) => {
  world.entities.forEach( entity => {
    if ( entity.flashIntensity > 0 ) {
      entity.flashIntensity -= 0.005 * dt;
    }
    else {
      delete entity.flashIntensity;
    }
  } );
}

gameCanvas.draw = ( ctx ) => {
  world.draw( ctx );
  Grid.draw( ctx, gameCanvas.bounds );
}

gameCanvas.start();

document.addEventListener( 'keydown', _ => {
  world.entities.forEach( entity => {
    if ( Math.random() < 0.5 ) {
      entity.flashIntensity = 1;
    }
  } );
} );