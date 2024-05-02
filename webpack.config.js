const path = require('path');

module.exports = {
  mode: 'production',
  entry: './lib/jumon.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'jumon.min.js',
    library: 'Jumon',
    libraryTarget: 'umd',
  },
};
