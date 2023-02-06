const path = require("path");
const {DefinePlugin} = require("webpack");
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = {
    mode: "development",
    devtool: "cheap-module-source-map",
    resolve: {
        alias: {
            Polyfill: path.resolve(__dirname, "src/polyfill.js")
        },
        modules: [path.resolve(__dirname, "src"), "node_modules"]
    },
    entry: {
        "background/background": "./src/background/background.js",
        "background/captureTab": "./src/background/captureTab.js",
        "background/tmpClear": "./src/background/tmpClear.js",
        "background/commands": "./src/background/commands.js",
        "popup/popup": "./src/popup/popup.js",
        "content/content": "./src/content/content.js",
        "options/options": "./src/options/options.js"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist")
    },
    plugins: [
        new CircularDependencyPlugin({
            exclude: /node_modules|cartographer\/pkg/,
            failOnError: true,
            allowAsyncCycles: false,
            cwd: process.cwd()
        }),
        new DefinePlugin({
            TARGET: "\"chrome\""
        })
    ],
    experiments: {
        asyncWebAssembly: true,
        // buildHttp: true,
        // layers: true,
        // lazyCompilation: true,
        // outputModule: true,
        // syncWebAssembly: true,
        topLevelAwait: true,
    },
};
