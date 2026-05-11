// Move update and draw code to World, test that here

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Angle from '../src/common/Angle.js';
import * as Grid from '../src/common/Grid.js';
import { vec2 } from '../lib/gl-matrix.js';

import * as Entities from '../src/Entities.js';
import { MapSize, World } from '../src/World.js';


const world = new World();

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -MapSize, -MapSize, MapSize, MapSize ];
gameCanvas.backgroundColor = '#321';

const input = {
  left:   false,
  up:     false,
  right:  false,
  down:   false,
};

gameCanvas.update = ( dt ) => {
  world.update( dt, input );
}

gameCanvas.draw = ( ctx ) => {
  world.draw( ctx );
  // Grid.draw( ctx, gameCanvas.bounds );
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
