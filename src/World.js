import * as Angle from '../src/common/Angle.js';
import * as Entities from './Entities.js';

import { vec2 } from '../lib/gl-matrix.js';

export const MapSize = 5;

const PlayerSpeed = 0.003;
const PlayerHandSpeed = 0.003;
const PlayerHandRadius = 0.2;
const PlayerHandDistance = 0.75;
const PlayerTargetDeltaAngle = 0.1;

const PlayerMaxLife = 10;
const PlayerSpawnTime = 3000;

const FlashDecayRate = 0.005;
const SpawnAnimationTime = 500;

const PistolDelay = 500;
const PistolRange = 2;
const PistolBulletSpeed = 0.01;
const PistolBulletDamage = 1;

const PowerupHealthBoost = 1;
const PowerupMinSpawnTime = 5000;
const PowerupMaxSpawnTime = 8000;

const EnemyMinSpawnTime = 300;
const EnemyMaxSpawnTime = 1000;

const EnemyBiteDist = 0.4;
const EnemyBiteDelay = 800;
const EnemyMinSize = 0.25;
const EnemyMaxSize = 1;
const EnemyMinLife = 1;
const EnemyMaxLife = 4;
const EnemyMinSpeed = 0.0005;
const EnemyMaxSpeed = 0.002;

const UIBarWidth = 2;
const UIBarHeight = 0.2;
const UIBarLineWidth = 0.01;

const Facing = {
  Left: 0,
  Right: 1,
};


const MonsterTypes = [
  'monster_green',
  'monster_blue',
  'monster_yellow',
];

const PowerupTypes = [
  'health',
];


export class World {
  entities = [];

  playerSpawnTimer = 0;
  enemySpawnTimer = EnemyMinSpawnTime;
  powerupSpawnTimer = PowerupMinSpawnTime;

  #targets = new Set();

  newPlayer( vals ) {
    return Object.assign( {
      type: 'player',
      group: 'players',
      pos: [ 0, 0 ],
      radius: 0.5,
      facing: 0,
      delay: SpawnAnimationTime,
      life: PlayerMaxLife,
      speed: PlayerSpeed,
      weapons: [
        { type: 'pistol', angle: 0 },
        { type: 'pistol', angle: 3 },
      ],
      animation: {
        name: 'spawn',
        time: 0,
      },
    }, vals );
  }

  newMonster( vals ) {
    return Object.assign( {
      group: 'monsters',
      pos: [ 0, 0 ],
      radius: 0.5,
      facing: 0,
      delay: SpawnAnimationTime,
      life: 1,
      speed: EnemyMinSpeed,
      animation: {
        name: 'spawn',
        time: 0,
      },
    }, vals );
  }

  newPowerup( vals ) {
    return Object.assign( {
      group: 'powerups',
      pos: [ 0, 0 ],
      radius: 0.25,
      life: 1,
      animation: {
        name: 'spawn',
        time: 0,
      },
    }, vals );
  }

  update( dt, input ) {

    // Spawning more enemies (for now, just hardcode this into world)
    if ( this.enemySpawnTimer > 0 ) {
      this.enemySpawnTimer -= dt;
    }
    else {
      this.enemySpawnTimer += EnemyMinSpawnTime + Math.random() * ( EnemyMaxSpawnTime - EnemyMinSpawnTime );

      const dist = Math.random() * MapSize + 2; //MapSize + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;

      // Weight more heavily toward smaller monsters
      const size = Math.random() ** 3;

      this.entities.push(
        this.newMonster( {
          type: randomFrom( MonsterTypes ),
          pos: [ Math.cos( angle ) * dist, Math.sin( angle ) * dist ],
          radius: EnemyMinSize  + size * ( EnemyMaxSize  - EnemyMinSize  ),
          life:   EnemyMinLife  + size * ( EnemyMaxLife  - EnemyMinLife  ),
          speed:  EnemyMaxSpeed - size * ( EnemyMaxSpeed - EnemyMinSpeed ),
        } )
      );
    }

    // Spawning powerups
    if ( this.powerupSpawnTimer > 0 ) {
      this.powerupSpawnTimer -= dt;
    }
    else {
      this.powerupSpawnTimer += PowerupMinSpawnTime + Math.random() * ( PowerupMaxSpawnTime - PowerupMinSpawnTime );

      const dist = Math.random() * MapSize;
      const angle = Math.random() * Math.PI * 2;

      this.entities.push(
        this.newPowerup( {
          type: randomFrom( PowerupTypes ),
          pos: [ Math.cos( angle ) * dist, Math.sin( angle ) * dist ],
          // TODO: random amount of life? decay life in update so they stick around temporarily
        } )
      );
    }

    // TODO: Handle multiple players?
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
      if ( player.delay > 0 ) {
        player.delay -= dt;
      }
      else {
        //
        // Player Movement
        //
        if ( input?.left ) {
          player.facing = Facing.Left;
        }
        else if ( input?.right ) {
          player.facing = Facing.Right;
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
        this.#targets.clear();  // keep track of targets chosen so weapons get different ones

        player.weapons.forEach( weapon => {
          weapon.delay ??= 0;
          if ( weapon.delay > 0 ) {
            weapon.delay -= dt;
          }

          let target, targetAngle, targetScore = Infinity;
          this.entities.forEach( other => {
            if ( other.group === 'monsters' && !this.#targets.has( other ) ) {
              const toOther = vec2.subtract( [], other.pos, player.pos );
              const dist = vec2.length( toOther ) - player.radius - other.radius;
              const angle = Math.atan2( toOther[ 1 ], toOther[ 0 ] );

              const angleDist = Math.abs( Angle.deltaAngle( weapon.angle, angle ) );

              const score = dist * angleDist;

              // TODO: Account for angle so we aren't making as dramatic a switch?
              if ( score < targetScore ) {
                target = other;
                targetAngle = angle;
                targetScore = score;
              }
            }
          } );

          if ( target ) {
            this.#targets.add( target );   // save target so future weapons can skip it

            const handDist = Angle.deltaAngle( weapon.angle, targetAngle );
            weapon.angle += Math.tanh( 10 * handDist ) * PlayerHandSpeed * dt;

            if ( Math.abs( Angle.deltaAngle( weapon.angle, targetAngle ) ) < PlayerTargetDeltaAngle &&
                  targetScore < PistolRange &&
                  weapon.delay <= 0 ) {

              const dir = [ Math.cos( weapon.angle ), Math.sin( weapon.angle ) ];
              const pos = vec2.scaleAndAdd( [], player.pos, dir, PlayerHandDistance );
              const vel = vec2.scale( [], dir, PistolBulletSpeed );

              this.entities.push( {
                type: 'bullet',
                group: 'bullets',
                pos: pos,
                vel: vel,
                angle: weapon.angle,
                radius: 0.1,
                life: 1
              } );

              weapon.delay += PistolDelay;
            }
          }
        } );
      }
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
      if ( entity.group === 'monsters' ) {
        if ( entity.delay > 0 ) {
          entity.delay -= dt;
        }
        // TODO: Wander around if no player
        else if ( player ) {
          // Move
          const moveVector = vec2.subtract( [], player.pos, entity.pos );
          const distanceFrom = vec2.len( moveVector );

          vec2.normalize( moveVector, moveVector );   // this is defaulting a weight of 1, maybe change later

          entity.facing = moveVector[ 0 ] <= 0 ? Facing.Left : Facing.Right;

          this.entities.forEach( other => {
            if ( entity != other && ( other.group === 'players' || other.group === 'monsters' ) ) {
              // Opposite direction so we avoid other
              const toOther = vec2.subtract( [], entity.pos, other.pos );
              const distToOther = Math.max( 1e-6, vec2.len( toOther ) - entity.radius - other.radius );
              vec2.normalize( toOther, toOther );

              // This function is infinite at f(0) and close to 0 at f(1)
              const weight = 1 / Math.tanh( 3 * distToOther ) - 1;

              vec2.scaleAndAdd( moveVector, moveVector, toOther, weight );
            }
          } );

          // Cap at length of 1 (normalizing might make short vectors longer) (should it use other weighting?)
          const moveLength = vec2.len( moveVector );
          if ( moveLength > 1 ) {
            moveVector[ 0 ] /= moveLength;
            moveVector[ 1 ] /= moveLength;
          }

          const moveDist = Math.tanh( 10 * distanceFrom ) * entity.speed * dt;
          vec2.scaleAndAdd( entity.pos, entity.pos, moveVector, moveDist );

          // Attack (if in range)
          if ( distanceFrom < player.radius + entity.radius + EnemyBiteDist ) {
            entity.animation = { name: 'bite', time: 0 };
            entity.delay += EnemyBiteDelay;

            console.log( 'Bite!' );

            // TODO: Scale bite based on monster size. Maybe have their damage as a entity property?
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
      else if ( entity.group === 'bullets' ) {
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
          if ( entity != other && other.group == 'monsters' ) {
            if ( vec2.distance( entity.pos, other.pos ) < entity.radius + other.radius ) {
              entity.life = 0;

              other.life -= PistolBulletDamage;
              other.flashIntensity = 1;
            }
          }
        } );
      }

      //
      // Powerups
      //
      else if ( entity.group === 'powerups' ) {
        if ( player && vec2.distance( entity.pos, player.pos ) < entity.radius + player.radius ) {
          entity.life = 0;

          if ( entity.type === 'health' ) {
            player.life = Math.min( PlayerMaxLife, player.life + PowerupHealthBoost );
          }
        }
      }
    } );

    this.entities = this.entities.filter( e => e.life > 0 );
  }

  draw( ctx ) {
    // TODO: Should the entities draw code just go here, then?
    this.entities.forEach( entity => {
      const image = Entities.images[ entity.type ];

      ctx.save(); {
        ctx.translate( ...entity.pos );

        if ( entity.angle ) {
          ctx.rotate( entity.angle );
        }

        const ratio = image.width / image.height;
        ctx.scale( ratio * entity.radius * 2, entity.radius * 2 );


        // Spawn animation should apply to weapons, too
        // TODO: Or maybe don't show hands until spawning complete?
        if ( entity.animation?.name == 'spawn' ) {
          const spawnPerc = Math.min( 1, entity.animation.time / SpawnAnimationTime );
          const spawnScale = Math.sin( spawnPerc * Math.PI / 2 );

          ctx.scale( spawnScale, spawnScale );
        }

        // Facing and animations should only apply to main entity, not weapons
        ctx.save(); {
          // player image faces left, need to flip if facing right
          // TODO: Would it make more sense to have everything face right (angle = 0) by default?
          if ( entity.facing ) {
            const dir = entity.facing == Facing.Left ? 1 : -1;
            ctx.scale( dir, 1 );
          }

          //
          // Animations
          //


          if ( entity.animation?.name == 'walk' ) {
            // TODO: Scale based on size instead of speed?
            const walkOffset = 0.1 * Math.sin( entity.animation.time * entity.speed * 5 );
            ctx.translate( 0, -walkOffset / 2 );
            ctx.scale( 1, 1 + walkOffset );
          }

          if ( entity.animation?.name == 'bite' ) {
            // TODO: Scale based on size? (so bigger enemies bite slower)
            const biteTime = Math.min( Math.PI, entity.animation.time / 100 );
            const biteOffset = 0.5 * Math.sin( biteTime );

            ctx.translate( -biteOffset / 2, 0 );

            // scaleX, skewY, skewX, scaleY, translateX, translateY
            ctx.transform( 1, 0, biteOffset, 1, 0, 0 );
          }

          ctx.drawImage( image, -0.5, -0.5, 1, 1 );

          if ( entity.flashIntensity ) {
            ctx.globalAlpha = Math.max( 0, Math.min( 1, entity.flashIntensity ) );
            ctx.drawImage( Entities.masks[ entity.type ], -0.5, -0.5, 1, 1 );
            ctx.globalAlpha = 1;
          }
        }
        ctx.restore();

        entity.weapons?.forEach( weapon => {
          ctx.save(); {
            ctx.rotate( weapon.angle );
            ctx.translate( PlayerHandDistance, 0 );

            ctx.scale( PlayerHandRadius, PlayerHandRadius );

            ctx.fillStyle = '#c7b299';
            ctx.beginPath();
            ctx.arc( 0, 0, 0.5, 0, Math.PI * 2 );
            ctx.fill();
          }
          ctx.restore();
        } );
      }
      ctx.restore();
    } );

    // UI
    // TODO: Base on edge of screen instead of world coords? (so not affected by zoom, etc)
    //       Maybe move this out of World, too
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

function randomFrom( array ) {
  return array[ Math.floor( Math.random() * array.length ) ];
}