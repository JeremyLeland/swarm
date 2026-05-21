// Move update and draw code to World, test that here

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Angle from '../src/common/Angle.js';
import * as Grid from '../src/common/Grid.js';
import { vec2 } from '../lib/gl-matrix.js';

import * as Entities from '../src/Entities.js';
import { MapSize, World } from '../src/World.js';

const ScreenWidth_2 = 16 / 2;
const ScreenHeight_2 = 10 / 2;

const world = new World();

const gameCanvas = new GameCanvas();
gameCanvas.setBounds( -ScreenWidth_2, -ScreenHeight_2, ScreenWidth_2, ScreenHeight_2 );
gameCanvas.backgroundColor = '#321';

const input = {
  left:   false,
  up:     false,
  right:  false,
  down:   false,
};

gameCanvas.update = ( dt ) => {
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
