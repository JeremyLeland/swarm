// Try out different monster animations with transforms

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Grid from '../src/common/Grid.js';
import { vec2 } from '../lib/gl-matrix.js';

const image = new Image();
image.src = './images/green1.png';
await image.decode();

const ratio = image.width / image.height;

const enemies = [
  { pos: [ 0, -0.5 ], radius: 0.5 },
];

const EnemySpeed = 0.002;

const mousePos = [ 0, 0 ];

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -3, -3, 3, 3 ];
gameCanvas.backgroundColor = '#123';

let time = 0;
gameCanvas.update = ( dt ) => {
  time += dt;
}

gameCanvas.draw = ( ctx ) => {

  enemies.forEach( enemy => {

    ctx.save(); {
      ctx.translate( ...enemy.pos );

      const dir = mousePos[ 0 ] < enemy.pos[ 0 ] ? 1 : -1;
      ctx.scale( dir * ratio * enemy.radius * 2, enemy.radius * 2 );

      // const walkOffset = 0.125 * Math.cos( time / 150 );
      // ctx.translate( 0, -walkOffset / 2 );
      // ctx.scale( 1, 1 + walkOffset );

      const biteOffset = 0.25 + 0.25 * Math.cos( time / 150 );

      ctx.translate( -biteOffset / 2, 0 );

      // scaleX, skewY, skewX, scaleY, translateX, translateY
      ctx.transform( 1, 0, biteOffset, 1, 0, 0 );

      ctx.drawImage( image, -0.5, -0.5, 1, 1 );
    }
    ctx.restore();
  } );

  Grid.draw( ctx, gameCanvas.bounds );
}

gameCanvas.start();

document.addEventListener( 'keydown', e => {
  if ( e.key == ' ' ) {
    gameCanvas.toggle();
  }
} );

gameCanvas.pointerMove = ( m ) => {
  mousePos[ 0 ] = m.x;
  mousePos[ 1 ] = m.y;

  gameCanvas.redraw();
}