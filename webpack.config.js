const path = require('path');

module.exports = {
  entry: './src/lib.js',
  output: {
    filename: 'lib.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
      open: true,
      static: {
          directory: path.join(__dirname,'public'),
      },
      compress: true,
      port: 9000,
  }
};
