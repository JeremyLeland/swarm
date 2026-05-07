const images = await loadImages( {
  'player': './images/marshmallow_earphone-01.png',
  'monster_green': './images/green1.png',
  'monster_blue': './images/blue.png',
  'monster_yellow': './images/spikey.png',
  'bullet': './images/bullet.png',
} );

images[ 'health' ] = getHealthImage();

function getHealthImage() {
  const canvas = new OffscreenCanvas( 100, 100 );
  const ctx = canvas.getContext( '2d' );

  ctx.translate( 50, 50 );

  ctx.beginPath();
  ctx.arc( 0, 0, 50, 0, Math.PI * 2 );

  ctx.fillStyle = 'gray';
  ctx.fill();

  const WIDTH = 15, HEIGHT = 35;

  ctx.fillStyle = 'red';
  ctx.fillRect( -WIDTH, -HEIGHT, WIDTH * 2, HEIGHT * 2 );
  ctx.fillRect( -HEIGHT, -WIDTH, HEIGHT * 2, WIDTH * 2 );

  return canvas;
}

const masks = makeMasks( images );

async function loadImages( sourceMap ) {
  const images = {};

  const promises = Object.entries( sourceMap ).map( ( [ key, src ] ) => {
    const img = new Image();
    img.src = src;
    images[ key ] = img;
    return img.decode();
  } );

  // TODO: try/catch for errors?
  await Promise.all( promises );
  return images;
}

function makeMasks( images ) {
  const masks = {};

  Object.entries( images ).map( ( [ key, image ] ) => {
    const mask = new OffscreenCanvas( image.width, image.height );
    const ctx = mask.getContext( '2d' );

    ctx.drawImage( image, 0, 0 );

    ctx.fillStyle = 'white';
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillRect( 0, 0, mask.width, mask.height );

    masks[ key ] = mask;
  } );

  return masks;
}


export const Facing = {
  Left: 0,
  Right: 1,
};

export const PlayerInfo = {
  Hand: {
    Radius: 0.2,
    Distance: 0.75,
  },
}

export const MonsterTypes = [
  'monster_green',
  'monster_blue',
  'monster_yellow',
];

export const PowerupTypes = [
  'health',
];

// TODO: Move this to World, just put it all in one place

export function draw( ctx, entity ) {
  const image = images[ entity.type ];

  ctx.save(); {
    ctx.translate( ...entity.pos );

    if ( entity.angle ) {
      ctx.rotate( entity.angle );
    }

    const ratio = image.width / image.height;
    ctx.scale( ratio * entity.radius * 2, entity.radius * 2 );


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
        ctx.drawImage( masks[ entity.type ], -0.5, -0.5, 1, 1 );
        ctx.globalAlpha = 1;
      }
    }
    ctx.restore();

    entity.weapons?.forEach( weapon => {
      ctx.save(); {
        ctx.rotate( weapon.angle );
        ctx.translate( PlayerInfo.Hand.Distance, 0 );

        ctx.scale( PlayerInfo.Hand.Radius, PlayerInfo.Hand.Radius );

        ctx.fillStyle = '#c7b299';
        ctx.beginPath();
        ctx.arc( 0, 0, 0.5, 0, Math.PI * 2 );
        ctx.fill();
      }
      ctx.restore();
    } );
  }
  ctx.restore();
}