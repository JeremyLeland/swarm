export function draw( ctx, bounds, thickness ) {
  const width = bounds[ 2 ] - bounds[ 0 ];
  const height = bounds[ 3 ] - bounds[ 1 ];

  // Make lines legible for any thickness (if none specified)
  thickness ??= Math.max( width, height ) / 1000;

  const ORIGIN = '#777', OTHER = '#5555';
  for ( let row = bounds[ 1 ]; row <= bounds[ 3 ]; row ++ ) {
    ctx.fillStyle = row == 0 ? ORIGIN : OTHER;
    ctx.fillRect( bounds[ 0 ], row, width, thickness );
  }
  for ( let col = bounds[ 0 ]; col <= bounds[ 2 ]; col ++ ) {
    ctx.fillStyle = col == 0 ? ORIGIN : OTHER;
    ctx.fillRect( col, bounds[ 1 ], thickness, height );
  }
}