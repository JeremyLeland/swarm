// Move monsters toward mouse

import { GameCanvas } from '../src/common/GameCanvas.js';
import { vec2 } from '../lib/gl-matrix.js';

const image = new Image();
image.src = './images/green1.png';
await image.decode();

const ratio = image.width / image.height;

const enemies = [
  { pos: [  1, 1 ], radius: 0.5 },
  { pos: [ -1, 0 ], radius: 0.5 },
  { pos: [  2, -2 ], radius: 1 },
];

const EnemySpeed = 0.002;

const mousePos = [ 0, 0 ];

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -3, -3, 3, 3 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.update = ( dt ) => {
  enemies.forEach( enemy => {
    const moveVector = vec2.subtract( [], mousePos, enemy.pos );
    const distanceFrom = vec2.len( moveVector );
    vec2.normalize( moveVector, moveVector );

    // const avoid = vec2.create();

    enemies.forEach( other => {
      if ( enemy != other ) {
        // Opposite direction so we avoid other
        const toOther = vec2.subtract( [], enemy.pos, other.pos );
        const distToOther = vec2.len( toOther ) - enemy.radius - other.radius;
        vec2.normalize( toOther, toOther );

        // This function is infinite at f(0) and close to 0 at f(1)
        const weight = 1 / Math.tanh( 3 * distToOther ) - 1;

        // TODO: Incorporate radius somehow, so bigger enemies push smaller ones around more?

        // vec2.scaleAndAdd( avoid, avoid, toOther, weight );
        vec2.scaleAndAdd( moveVector, moveVector, toOther, weight );
      }
    } );

    const moveDist = sigma( distanceFrom ) * EnemySpeed * dt;
    vec2.scaleAndAdd( enemy.pos, enemy.pos, moveVector, moveDist );
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
      ctx.scale( dir * ratio * enemy.radius * 2, enemy.radius * 2 );

      ctx.drawImage( image, -0.5, -0.5, 1, 1 );

      ctx.beginPath();
      ctx.arc( 0, 0, 0.5, 0, Math.PI * 2 );
      ctx.lineWidth = 0.005 / enemy.radius;
      ctx.strokeStyle = 'red';
      ctx.stroke();
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