const path = require("path");
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
    mode: "development",
    devtool: "inline-source-map",
    entry: {
        "background/background": "./src/background/background.js",
        "popup/popup": "./src/popup/popup.js",
        "content/content": "./src/content/content.js"
    },
    output: {
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
