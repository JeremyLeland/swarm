import * as Entities from './Entities.js';

import { vec2 } from '../lib/gl-matrix.js';

const PlayerSpeed = 0.003;


export class World {
  player;
  enemies = [];
  bullets = [];

  spawnPlayer( pos, vel ) {
    return {
      type: 'player',
      pos: pos ?? [ 0, 0 ],
      vel: vel ?? [ 0, 0 ],
      radius: 0.5,
      facing: 0,
      life: 100,
      weapons: [
        { type: 'pistol', angle: 0, delay: 0 },
      ],

      input: { left: false, up: false, right: false, down: false },
    };
  }

  update( dt ) {
    if ( this.player ) {
      const moveVector = [
        ( this.player.input.left ? -1 : 0 ) + ( this.player.input.right ? 1 : 0 ),
        ( this.player.input.up   ? -1 : 0 ) + ( this.player.input.down  ? 1 : 0 ),
      ];
      vec2.normalize( moveVector, moveVector );

      vec2.scaleAndAdd( this.player.pos, this.player.pos, moveVector, PlayerSpeed * dt );
    }
  }

  draw( ctx ) {
    if ( this.player) {
      Entities.draw( ctx, this.player );
    }

    this.enemies.forEach( enemy => Entities.draw( ctx, enemy ) );
    this.bullets.forEach( bullet => Entities.draw( ctx, bullet ) );
  }
}