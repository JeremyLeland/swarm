// Move update and draw code to World, test that here

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Angle from '../src/common/Angle.js';
import * as Grid from '../src/common/Grid.js';
import { vec2 } from '../lib/gl-matrix.js';

import * as Entities from '../src/Entities.js';
import { World } from '../src/World.js';

const PlayerSpeed = 0.003;
const PlayerHandSpeed = 0.003;
const PlayerTargetDeltaAngle = 0.1;

const PistolDelay = 500;
const PistolRange = 2;
const PistolBulletSpeed = 0.01;
const PistolBulletDamage = 1;

const world = new World();

world.player = world.spawnPlayer();

world.enemies.push(
  { type: 'monster', pos: [ -1, 1 ], radius: 0.3, facing: 1, life: 1 },
  { type: 'monster', pos: [ -2, 2 ], radius: 0.4, facing: 0, life: 2 },
  { type: 'monster', pos: [  2, 1 ], radius: 0.5, facing: 1, life: 3 },
  { type: 'monster', pos: [  1, 2 ], radius: 0.6, facing: 0, life: 4 },
);


const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -3, -3, 3, 3 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.update = ( dt ) => {
  world.update( dt );
}

gameCanvas.draw = ( ctx ) => {
  world.draw( ctx );
  Grid.draw( ctx, gameCanvas.bounds );
}

gameCanvas.start();


const keyDownAction = {
  ' ': () => gameCanvas.toggle(),
  'w': () => world.player.input.up = true,
  'a': () => world.player.input.left = true,
  's': () => world.player.input.down = true,
  'd': () => world.player.input.right = true,
}

const keyUpAction = {
  'w': () => world.player.input.up = false,
  'a': () => world.player.input.left = false,
  's': () => world.player.input.down = false,
  'd': () => world.player.input.right = false,
}

document.addEventListener( 'keydown', e => keyDownAction[ e.key ]?.() );
document.addEventListener( 'keyup', e => keyUpAction[ e.key ]?.() );