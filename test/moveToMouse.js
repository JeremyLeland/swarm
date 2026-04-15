// Move monsters toward mouse

import { GameCanvas } from '../src/common/GameCanvas.js';
import { vec2 } from '../lib/gl-matrix.js';

const image = new Image();
image.src = './images/green1.png';
await image.decode();

const ratio = image.width / image.height;

const enemies = [
  { pos: [  1, 1 ] },
  // { pos: [ -1, 0 ] },
  // { pos: [  2, -2 ] },
];

const EnemySpeed = 0.002;

const mousePos = [ 0, 0 ];

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -3, -3, 3, 3 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.update = ( dt ) => {
  enemies.forEach( enemy => {
    const toMouse = vec2.subtract( [], mousePos, enemy.pos );
    const distanceFrom = vec2.len( toMouse );
    vec2.normalize( toMouse, toMouse );

    const moveDist = sigma( distanceFrom ) * EnemySpeed * dt;

    vec2.scaleAndAdd( enemy.pos, enemy.pos, toMouse, moveDist );
  } );
}

// Play with different functions here?
function sigma( x ) {
  return Math.tanh( 10 * x );
}

gameCanvas.start();

gameCanvas.draw = ( ctx ) => {

  enemies.forEach( enemy => {

    ctx.save(); {
      ctx.translate( ...enemy.pos );

      const dir = mousePos[ 0 ] < enemy.pos[ 0 ] ? 1 : -1;

      ctx.scale( dir * ratio, 1 );
      ctx.translate( -0.5, -0.5 );
      ctx.drawImage( image, 0, 0, 1, 1 );
    }
    ctx.restore();
  } );

  drawGrid( ctx, gameCanvas.bounds );
}

gameCanvas.pointerMove = ( m ) => {
  mousePos[ 0 ] = m.x;
  mousePos[ 1 ] = m.y;

  gameCanvas.redraw();
}

function drawGrid( ctx, bounds, thickness ) {

  const width = bounds[ 2 ] - bounds[ 0 ];
  const height = bounds[ 3 ] - bounds[ 1 ];

  // Make lines legible for any thickness (if none specified)
  thickness ??= Math.max( width, height ) / 1000;

  const ORIGIN = '#777', OTHER = '#5555';
  for ( let row = bounds[ 1 ]; row <= bounds[ 3 ]; row ++ ) {
    ctx.fillStyle = row == 0 ? ORIGIN : OTHER;
    ctx.fillRect( bounds[ 0 ], row, width, thickness );
  }
  for ( let col = bounds[ 0 ]; col <= bounds[ 2 ]; col ++ ) {
    ctx.fillStyle = col == 0 ? ORIGIN : OTHER;
    ctx.fillRect( col, bounds[ 1 ], thickness, height );
  }
}