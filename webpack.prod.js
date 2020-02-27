const merge = require("webpack-merge");
const common = require("./webpack.common.js");

const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");

module.exports = merge(common, {
  mode: "production",

  plugins: [
    new CleanWebpackPlugin(["dist"]),

    new UglifyJSPlugin(),

    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.(css|js|html)$/,
      minRatio: 0.4
    })
  ]
});