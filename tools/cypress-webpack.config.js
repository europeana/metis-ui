const config = {
  module: {
    rules: [
      {
        test: /\.jsx?$|\.tsx?$/,
        use: {
          loader: 'ts-loader'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};

module.exports = config;
