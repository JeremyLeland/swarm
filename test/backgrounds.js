// Test out some procedural backgrounds

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


gameCanvas.draw = ( ctx ) => {

  for ( let i = 0; i < 10000; i ++ ) {
    const size = Math.random();

    const x = MapSize * ( 1 - 2 * Math.random() );
    const y = MapSize * ( 1 - 2 * Math.random() );
    const r = size * MapSize / 10;

    ctx.beginPath();
    ctx.arc( x, y, r, 0, Math.PI * 2 );
    ctx.fillStyle = '#111';
    ctx.globalAlpha = 0.1 - 0.1 * size;
    ctx.fill();
  }

}
