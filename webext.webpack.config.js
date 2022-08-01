const path = require("path");
const {DefinePlugin} = require("webpack");
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
    mode: "production",
    resolve: {
        alias: {
            Polyfill: path.resolve(__dirname, "src/polyfill.js")
        }
    },
    entry: {
        "tabby2-background": "./src/background/background.js",
        // "popup/popup": "./src/popup/popup.js",
        // "content/content": "./src/content/content.js",
        // "options/options": "./src/options/options.js"
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
        }),
        new DefinePlugin({
            TARGET: "\"webext\""
        })
    ]
};
