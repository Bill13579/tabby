const path = require("path");
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
  mode: "production",
  entry: {
    "extension-configurator.min": "./index.js"
  },
  output: {
    library: "ec",
    filename: "[name].js",
    path: path.resolve(__dirname, "dist")
  },
  plugins: [
    new CircularDependencyPlugin({
      exclude: /node_modules/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd()
    })
  ]
};
