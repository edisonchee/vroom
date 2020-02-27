const merge = require("webpack-merge");
const common = require("./webpack.common.js");

const TerserPlugin = require("terser-webpack-plugin");
const CompressionPlugin = require("compression-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = merge(common, {
  mode: "production",

  plugins: [
    new CleanWebpackPlugin(),

    new CompressionPlugin({
      filename: "[path].gz[query]",
      test: /\.(css|js|html)$/,
      minRatio: 0.4
    })
  ],

  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
});