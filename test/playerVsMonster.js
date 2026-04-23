// Monster moves to player and bites player to death

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Grid from '../src/common/Grid.js';
import { vec2 } from '../lib/gl-matrix.js';

import * as Entities from '../src/Entities.js';

const image = new Image();
image.src = './images/green1.png';
await image.decode();

const ratio = image.width / image.height;

const player = {
  type: 'player',
  pos: [ 0, 0 ],
  radius: 0.5,
  facing: 0,
  // animation: {
  //   name: 'walking',
  //   time: 0,
  // },
};

const entities = [
  player,
  { type: 'monster', pos: [ 3, 3 ], radius: 0.5, facing: 0, },
];

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -3, -3, 3, 3 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.update = ( dt ) => {
  if ( player.animation ) {
    player.animation.time += dt;
  }
}

gameCanvas.draw = ( ctx ) => {
  entities.forEach( enemy => Entities.draw( ctx, enemy ) );

  Grid.draw( ctx, gameCanvas.bounds );
}

gameCanvas.start();

document.addEventListener( 'keydown', e => {
  if ( e.key == ' ' ) {
    gameCanvas.toggle();
  }
} );

// gameCanvas.pointerMove = ( m ) => {
//   gameCanvas.redraw();
// }