// Monster moves to player and bites player to death

import { GameCanvas } from '../src/common/GameCanvas.js';
import * as Grid from '../src/common/Grid.js';
import { vec2 } from '../lib/gl-matrix.js';

import * as Entities from '../src/Entities.js';

const EnemyBiteDist = 0.4;
const EnemySpeed = 0.002;

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
  { type: 'monster', pos: [ 3, 3 ], radius: 0.5, facing: 0 },
];

const gameCanvas = new GameCanvas();
gameCanvas.bounds = [ -3, -3, 3, 3 ];
gameCanvas.backgroundColor = '#123';

gameCanvas.update = ( dt ) => {
  entities.forEach( entity => {

    // Multiple timers? Or one delay for everything? (might want to track various actions being ready separately)
    entity.timers ??= { delay: 0 };
    for ( const timer in entity.timers ) {
      entity.timers[ timer ] -= dt;
    }

    if ( entity.animation ) {
      entity.animation.time += dt;
    }

    if ( entity.type == 'monster' ) {
      // Move
      const moveVector = vec2.subtract( [], player.pos, entity.pos );
      const distanceFrom = vec2.len( moveVector );
      vec2.normalize( moveVector, moveVector );

      entities.forEach( other => {
        if ( entity != other ) {
          // Opposite direction so we avoid other
          const toOther = vec2.subtract( [], entity.pos, other.pos );
          const distToOther = Math.max( 1e-6, vec2.len( toOther ) - entity.radius - other.radius );
          vec2.normalize( toOther, toOther );

          // This function is infinite at f(0) and close to 0 at f(1)
          const weight = 1 / Math.tanh( 3 * distToOther ) - 1;

          // TODO: Incorporate radius somehow, so bigger enemies push smaller ones around more?

          // vec2.scaleAndAdd( avoid, avoid, toOther, weight );
          vec2.scaleAndAdd( moveVector, moveVector, toOther, weight );
        }
      } );

      const moveDist = Math.tanh( 10 * distanceFrom ) * EnemySpeed * dt;
      vec2.scaleAndAdd( entity.pos, entity.pos, moveVector, moveDist );

      // Attack (if in range)
      if ( distanceFrom < player.radius + entity.radius + EnemyBiteDist ) {
        if ( entity.timers.delay <= 0 ) {
          console.log( 'Bite!' );
          entity.animation = { name: 'bite', time: 0 };
          entity.timers.delay += 800;

          // TODO: Do actual bite (damage player, etc)
        }
      }
      else {
        if ( entity.timers.delay <= 0 ) {
          if ( entity.animation?.name != 'walk' ) {
            console.log( 'Walk!' );
            entity.animation = { name: 'walk', time: 0 };
          }
        }
      }
    }
  } );
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