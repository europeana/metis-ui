let config = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "tslint-loader",
        },
        enforce: "pre",
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$|\.tsx?$/,
        use: {
          loader: "ts-loader",
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
};

module.exports = config;
