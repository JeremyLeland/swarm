// Load PNG of monster and animate it

import { GameCanvas } from '../src/common/GameCanvas.js';


const image = new Image();
image.src = './images/green1.png';
await image.decode();

const ratio = image.width / image.height;

console.log( 'width = ', image.width );
console.log( 'height = ', image.height );
console.log( 'ratio = ', ratio );

const enemies = [
  { pos: [  1, 1 ] },
  { pos: [ -1, 0 ] },
];

let mouseX = 0, mouseY = 0;

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -3, -3, 3, 3 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.draw = ( ctx ) => {

  enemies.forEach( enemy => {

    ctx.save(); {
      ctx.translate( ...enemy.pos );

      const dir = mouseX < enemy.pos[ 0 ] ? 1 : -1;

      ctx.scale( dir * ratio, 1 );
      ctx.translate( -0.5, -0.5 );
      ctx.drawImage( image, 0, 0, 1, 1 );
    }
    ctx.restore();
  } );

  drawGrid( ctx, gameCanvas.bounds );
}

gameCanvas.pointerMove = ( m ) => {
  mouseX = m.x;
  mouseY = m.y;

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