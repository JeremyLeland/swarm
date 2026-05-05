import * as Angle from '../src/common/Angle.js';
import * as Entities from './Entities.js';

import { vec2 } from '../lib/gl-matrix.js';

export const MapSize = 5;

const PlayerSpeed = 0.003;
const PlayerHandSpeed = 0.003;
const PlayerTargetDeltaAngle = 0.1;

const PlayerMaxLife = 10;
const PlayerSpawnTime = 3000;

const FlashDecayRate = 0.005;

const PistolDelay = 500;
const PistolRange = 2;
const PistolBulletSpeed = 0.01;
const PistolBulletDamage = 1;

const EnemyBiteDist = 0.4;
const EnemyBiteDelay = 800;
const EnemySpeed = 0.002;

const UIBarWidth = 2;
const UIBarHeight = 0.2;
const UIBarLineWidth = 0.01;

export class World {
  entities = [];

  playerSpawnTimer = 0;


  newPlayer( vals ) {
    return Object.assign( {
      type: 'player',
      pos: [ 0, 0 ],
      radius: 0.5,
      facing: 0,
      life: PlayerMaxLife,
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

    if ( !player ) {
      if ( this.playerSpawnTimer > 0 ) {
        this.playerSpawnTimer -= dt;
      }
      else {
        this.playerSpawnTimer = PlayerSpawnTime;

        this.entities.push( this.newPlayer() );
      }
    }
    else {
      //
      // Player Movement
      //
      if ( input?.left ) {
        player.facing = Entities.Facing.Left;
      }
      else if ( input?.right ) {
        player.facing = Entities.Facing.Right;
      }

      const moveVector = [
        ( input?.left ? -1 : 0 ) + ( input?.right ? 1 : 0 ),
        ( input?.up   ? -1 : 0 ) + ( input?.down  ? 1 : 0 ),
      ];

      if ( moveVector[ 0 ] !== 0 || moveVector[ 1 ] !== 0 ) {
        vec2.normalize( moveVector, moveVector );
        vec2.scaleAndAdd( player.pos, player.pos, moveVector, PlayerSpeed * dt );

        if ( player.animation?.name != 'walk' ) {
          console.log( 'Player Walk!' );
          player.animation = { name: 'walk', time: 0 };
        }
      }
      else {
        delete player.animation;
      }

      //
      // Player Weapons
      //
      player.weapons.forEach( weapon => {
        if ( weapon.delay > 0 ) {
          weapon.delay -= dt;
        }

        let target, targetDist = Infinity, targetAngle;
        this.entities.forEach( other => {
          if ( other.type == 'monster' ) {
            const toOther = vec2.subtract( [], other.pos, player.pos );
            const dist = vec2.length( toOther ) - player.radius - other.radius;
            const angle = Math.atan2( toOther[ 1 ], toOther[ 0 ] );

            // TODO: Account for angle so we aren't making as dramatic a switch?
            if ( dist < targetDist ) {
              target = other;
              targetDist = dist;
              targetAngle = angle;
            }
          }
        } );

        if ( target ) {
          const handDist = Angle.deltaAngle( weapon.angle, targetAngle );
          weapon.angle += Math.tanh( 10 * handDist ) * PlayerHandSpeed * dt;

          if ( Math.abs( Angle.deltaAngle( weapon.angle, targetAngle ) ) < PlayerTargetDeltaAngle &&
                targetDist < PistolRange &&
                weapon.delay <= 0 ) {

            const dir = [ Math.cos( weapon.angle ), Math.sin( weapon.angle ) ];
            const pos = vec2.scaleAndAdd( [], player.pos, dir, Entities.PlayerInfo.Hand.Distance );
            const vel = vec2.scale( [], dir, PistolBulletSpeed );

            this.entities.push( { type: 'bullet', pos: pos, vel: vel, angle: weapon.angle, radius: 0.1, life: 1 } );

            weapon.delay += PistolDelay;
          }
        }
      } );
    }

    this.entities.forEach( entity => {
      if ( entity.animation ) {
        entity.animation.time += dt;
      }

      if ( entity.flashIntensity > 0 ) {
        entity.flashIntensity -= FlashDecayRate * dt;
      }

      //
      // Monsters
      //
      if ( entity.type === 'monster' ) {
        if ( entity.delay > 0 ) {
          entity.delay -= dt;
        }
        // TODO: Wander around if no player
        else if ( player ) {
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
            player.life -= 1;
            player.flashIntensity = 1;
          }
          else {
            if ( entity.animation?.name != 'walk' ) {
              console.log( 'Walk!' );
              entity.animation = { name: 'walk', time: 0 };
            }
          }
        }
        else {
          // TODO: Remove if we add wandering later
          delete entity.animation;
        }
      }

      //
      // Bullets
      //
      else if ( entity.type == 'bullet' ) {
        // if ( entity.vel ) {
          vec2.scaleAndAdd( entity.pos, entity.pos, entity.vel, dt );
        // }

        // Remove out-of-bounds bullets
        if ( entity.pos[ 0 ] < -MapSize || entity.pos[ 0 ] > MapSize ||
             entity.pos[ 1 ] < -MapSize || entity.pos[ 1 ] > MapSize ) {
          entity.life = 0;
        }

        // Check for collision against monsters
        // TODO: Sweep collision test to find hit time (and make partices there?)
        this.entities.forEach( other => {
          if ( entity != other && other.type == 'monster' ) {
            if ( vec2.distance( entity.pos, other.pos ) < entity.radius + other.radius ) {
              entity.life = 0;

              other.life -= PistolBulletDamage;
              other.flashIntensity = 1;
            }
          }
        } );
      }
    } );

    this.entities = this.entities.filter( e => e.life > 0 );
  }

  draw( ctx ) {
    // TODO: Should the entities draw code just go here, then?
    this.entities.forEach( entity => Entities.draw( ctx, entity ) );

    // UI
    const player = this.entities.find( e => e.type === 'player' );

    ctx.save(); {
      ctx.translate( -MapSize + 0.1, -MapSize + 0.1 );

      if ( player ) {
        ctx.fillStyle = 'red';
        ctx.fillRect( 0, 0, UIBarWidth * ( player.life / PlayerMaxLife ), UIBarHeight );
      }

      ctx.strokeStyle = 'black';
      ctx.lineWidth = UIBarLineWidth;
      ctx.strokeRect( 0, 0, UIBarWidth, UIBarHeight );
    }
    ctx.restore();
  }
}