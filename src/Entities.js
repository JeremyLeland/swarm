const images = await loadImages( {
  'player': './images/marshmallow_earphone-01.png',
  'monster': './images/green1.png',
} );

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


export const Facing = {
  Left: 0,
  Right: 1,
};

export function draw( ctx, entity ) {
  const image = images[ entity.type ];

  ctx.save(); {
    ctx.translate( ...entity.pos );

    // player image faces left, need to flip if facing right
    const dir = entity.facing == Facing.Left ? 1 : -1;
    const ratio = image.width / image.height;
    ctx.scale( dir * ratio * entity.radius * 2, entity.radius * 2 );

    if ( entity.animation?.name == 'walk' ) {
      const walkOffset = 0.1 * Math.sin( entity.animation.time / 100 );
      ctx.translate( 0, -walkOffset / 2 );
      ctx.scale( 1, 1 + walkOffset );
    }

    if ( entity.animation?.name == 'bite' ) {
      const biteTime = Math.min( Math.PI, entity.animation.time / 100 );
      const biteOffset = 0.5 * Math.sin( biteTime );

      ctx.translate( -biteOffset / 2, 0 );

      // scaleX, skewY, skewX, scaleY, translateX, translateY
      ctx.transform( 1, 0, biteOffset, 1, 0, 0 );
    }

    ctx.drawImage( image, -0.5, -0.5, 1, 1 );

    entity.weapons?.forEach( weapon => {
      ctx.rotate( weapon.angle );
      ctx.translate( 0.75, 0 );

      ctx.scale( 0.2, 0.2 );

      ctx.fillStyle = '#c7b299';
      ctx.beginPath();
      ctx.arc( 0, 0, 0.5, 0, Math.PI * 2 );
      ctx.fill();
    } );
  }
  ctx.restore();
}