export const images = await loadImages( {
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

images[ 'background' ] = getBackgroundImage();

function getBackgroundImage() {
  const canvas = new OffscreenCanvas( 2000, 2000 );
  const ctx = canvas.getContext( '2d' );

  for ( let i = 0; i < 3000; i ++ ) {
    const size = Math.random();

    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = size * canvas.height / 12;

    ctx.beginPath();
    ctx.arc( x, y, r, 0, Math.PI * 2 );
    ctx.fillStyle = '#333';
    ctx.globalAlpha = 0.1 - 0.1 * size;
    ctx.fill();
  }

  return canvas;
}

export const masks = makeMasks( images );

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
