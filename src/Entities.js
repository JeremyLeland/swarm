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


const Facing = {
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

    if ( entity.animation?.name == 'walking' ) {
      const walkOffset = 0.125 * Math.cos( entity.animation.time / 150 );
      ctx.translate( 0, -walkOffset / 2 );
      ctx.scale( 1, 1 + walkOffset );
    }

    ctx.drawImage( image, -0.5, -0.5, 1, 1 );
  }
  ctx.restore();
}