import * as Entities from './Entities.js';

import { vec2 } from '../lib/gl-matrix.js';

const PlayerSpeed = 0.003;

const EnemyBiteDist = 0.4;
const EnemyBiteDelay = 800;
const EnemySpeed = 0.002;

export class World {
  // player;
  // enemies = [];
  // bullets = [];

  entities = [];

  newPlayer( vals ) {
    return Object.assign( {
      type: 'player',
      pos: [ 0, 0 ],
      radius: 0.5,
      facing: 0,
      life: 100,
      weapons: [
        { type: 'pistol', angle: 0, delay: 0 },
      ],
    }, vals );
  }

  newMonster( vals ) {
    return Object.assign( {
      type: 'monster',
      pos: [ 0, 0 ],
      radius: 0.5,
      facing: 0,
      delay: 0,
      life: 1,
    }, vals );
  }

  update( dt, input ) {

    const player = this.entities.find( e => e.type === 'player' );

    if ( player ) {
      const moveVector = [
        ( input.left ? -1 : 0 ) + ( input.right ? 1 : 0 ),
        ( input.up   ? -1 : 0 ) + ( input.down  ? 1 : 0 ),
      ];
      vec2.normalize( moveVector, moveVector );

      vec2.scaleAndAdd( player.pos, player.pos, moveVector, PlayerSpeed * dt );
    }

    this.entities.forEach( entity => {
      if ( entity.animation ) {
        entity.animation.time += dt;
      }

      if ( entity.delay > 0 ) {
        entity.delay -= dt;
      }
      else {
        if ( entity.type === 'monster' ) {
          // Move
          const moveVector = vec2.subtract( [], player.pos, entity.pos );
          const distanceFrom = vec2.len( moveVector );

          vec2.normalize( moveVector, moveVector );   // this is defaulting a weight of 1, maybe change later

          entity.facing = moveVector[ 0 ] <= 0 ? Entities.Facing.Left : Entities.Facing.Right;

          this.entities.forEach( other => {
            if ( entity != other && ( other.type === 'player' || other.type === 'monster' ) ) {
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

          // Cap at length of 1 (normalizing might make short vectors longer) (should it use other weighting?)
          const moveLength = vec2.len( moveVector );
          if ( moveLength > 1 ) {
            moveVector[ 0 ] /= moveLength;
            moveVector[ 1 ] /= moveLength;
          }

          const moveDist = Math.tanh( 10 * distanceFrom ) * EnemySpeed * dt;
          vec2.scaleAndAdd( entity.pos, entity.pos, moveVector, moveDist );

          // Attack (if in range)
          if ( distanceFrom < player.radius + entity.radius + EnemyBiteDist ) {
            entity.animation = { name: 'bite', time: 0 };
            entity.delay += EnemyBiteDelay;

            console.log( 'Bite!' );
            // TODO: Do actual bite (damage player, etc)
          }
          else {
            if ( entity.animation?.name != 'walk' ) {
              console.log( 'Walk!' );
              entity.animation = { name: 'walk', time: 0 };
            }
          }
        }
      }
    } );
  }

  draw( ctx ) {
    // TODO: Should the entities draw code just go here, then?
    this.entities.forEach( entity => Entities.draw( ctx, entity ) );
  }
}