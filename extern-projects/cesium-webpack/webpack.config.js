/*
 * @Date: 2021-06-03 11:36:41
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-10 10:59:51
 * @FilePath: \cesium-web-vue\extern-projects\cesium-webpack\webpack.config.js
 */
const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const cesiumSource = 'node_modules/cesium/Source';
const cesiumWorkers = '../Build/Cesium/Workers';

const CopywebpackPlugin = require('copy-webpack-plugin');
console.log(path.resolve(__dirname, 'dist'))

module.exports = {
  context: __dirname,
  entry: {
    app: './src/index.js' // app对应打包好js文件的名字
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    // 支持多行字符串的编译
    sourcePrefix: ''
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          // 配置加载器选项
          presets: ['@babel/preset-env']
        }
      }
    },{
      test: /\.css$/,
      // 加载器（loader）的顺序是从右到左，从下到上，需要先加载css-loader再加载style-loader
      use: ['style-loader', 'css-loader']
    }, {
      test: /\.(png|gif|jpg|jpeg|svg|xml|json)$/,
      use: ['url-loader']
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html'
    }),
    // Copy Cesium Assets, Widgets, and Workers to a static directory
    new CopywebpackPlugin({
      patterns: [{
          from: path.join(cesiumSource, cesiumWorkers),
          to: 'Workers'
        },
        {
          from: path.join(cesiumSource, 'Assets'),
          to: 'Assets'
        },
        {
          from: path.join(cesiumSource, 'Widgets'),
          to: 'Widgets'
        }
      ]
    }),
    new webpack.DefinePlugin({
      // Define relative base path in cesium for loading assets
      CESIUM_BASE_URL: JSON.stringify('')
    })
  ],
  devServer: {
    contentBase: path.join(__dirname, "dist")
  },
  // 某些流行的模块是按照 AMD 规范编写的，最引人瞩目的 jQuery 版本在 1.7.0 到 1.9.1，如果 loader 提示它对页面包含的多个版本采取了特殊许可时，才会注册为 AMD 模块。
  amd: {
    // 告诉CesiumJS, AMD webpack用于评估require语句的版本不符合标准toUrl功能。
    toUrlUndefined: true
  },
  // node: {
  //   // 处理了fs模块的某些第三方用途，该模块针对于Node环境而不是浏览器环境。
  //   fs: 'empty'
  // },
  resolve: {
    alias: {
      // 添加Cesium的别名，以便我们在项目中使用
      $cesium: path.resolve(__dirname, cesiumSource)
    }
  },
};