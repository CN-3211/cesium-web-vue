/*
 * @Date: 2021-06-03 09:53:17
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-12-30 14:35:38
 * @FilePath: /cesium-web-vue/vue.config.js
 */
const webpack = require('webpack')
const path = require('path')
const CopyWebpackPlugin = require("copy-webpack-plugin");
const dvgisDist = './node_modules/@dvgis'

module.exports = {
  publicPath: "./",
  configureWebpack: {
    plugins: [
      // Copy Cesium Assets, Widgets, and Workers to a static directory
      new CopyWebpackPlugin([{from: "node_modules/cesium/Build/Cesium/Workers", to: "Workers"}]),
      new CopyWebpackPlugin([{from: "node_modules/cesium/Build/Cesium/ThirdParty", to: "ThirdParty"}]),
      new CopyWebpackPlugin([{from: "node_modules/cesium/Build/Cesium/Assets", to: "Assets"}]),
      new CopyWebpackPlugin([{from: "node_modules/cesium/Build/Cesium/Widgets", to: "Widgets"}]),
      new CopyWebpackPlugin([{from: path.join(dvgisDist, "dc-sdk/dist/resources"), to: path.join(__dirname, 'dist', 'libs/dc-sdk/resources')}]),
      new webpack.DefinePlugin({
        // Define relative base path in cesium for loading assets
        CESIUM_BASE_URL: JSON.stringify("./") // 相对路径build可用
        // CESIUM_BASE_URL: JSON.stringify("") // 绝对路径dev环境可用
      })
    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: '@open-wc/webpack-import-meta-loader',
          },
        },
      ],
      // Removes these errors: "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted"
      // https://github.com/AnalyticalGraphicsInc/cesium-webpack-example/issues/6
      unknownContextCritical: false,
      unknownContextRegExp: /\/cesium\/cesium\/Source\/Core\/buildModuleUrl\.js/
    }
  }
};