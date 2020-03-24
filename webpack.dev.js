const merge = require("webpack-merge");
const common = require("./webpack.common.js");
const path = require("path");

const apiUrl = "http://localhost:7777";

module.exports = merge(common, {
  mode: "development",

  devtool: "source-map",

  devServer: {
    contentBase: path.resolve(__dirname, "dist"),
    historyApiFallback: true,
    compress: true,
    publicPath: "/",
    host: "127.0.0.1",
    port: 8080,
    proxy: {
      "/v1": {
        target: apiUrl,
        secure: false
      }
    }
  }
});