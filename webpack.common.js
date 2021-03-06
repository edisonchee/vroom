"use strict";

const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin')
const devMode = process.env.NODE_ENV !== "production";

module.exports = {
  entry: ["./src/app/index.js", "./src/app/static/scss/style.scss"],

  output: {
    filename: "js/bundle-[hash].js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/"
  },

  resolve: {
    // priority of lookup -> left to right
    modules: ["src", "node_modules"]
  },

  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env", 
                {
                  targets: {
                    esmodules: true,
                  },
                }
              ]
            ]
          }
        }
      },
      {
        test: /\.s?css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: ["file-loader"],
      },
      {
        test: /\.(eot|otf|svg|ttf|woff|woff2)$/i,
        use: ["file-loader"],
      },
      {
        test: /\.(json)$/i,
        use: ["file-loader"],
      }
    ]
  },

  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),

    new CopyWebpackPlugin([{
      from: 'src/app/static/assets',
      to: 'static/assets'
    }]),

    new HtmlWebpackPlugin({
      title: "Vroom",
      template: "templates/index.ejs",
      favicon: "templates/favicon.ico",
      inject: false
    }),

    new MiniCssExtractPlugin({
      path: 'dist/css',
      filename: devMode ? "[name].css" : "[name].[hash].css",
      chunkFilename: devMode ? "[id].css" : "[id].[hash].css"
    })
  ]
};