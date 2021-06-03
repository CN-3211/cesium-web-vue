/*
 * @Date: 2021-06-03 11:33:56
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-03 16:39:58
 * @FilePath: \cesium-webpack\src\index.js
 */
// import xxx form 'cesium';这里的cesium指的是node_modules文件夹下的index.js文件（这里指index.cjs文件），该文件export了cesium.js文件
// 因此我们可以通过import * as Cesium from "cesium"的方式，把cesium.js文件下的所有class都挂在Cesium变量下进行使用
// 我们也可以通过import { Viewer, Entity } from "cesium"的方式，按需引入cesium.js的部分class
// 但是不能使用import Cesium from "cesium";的方式使用，因为cesium.js并没有一个个最大的Cesium类

// import * as Cesium from 'cesium'; √
// import Cesium from "cesium"; ×
import { Viewer } from "cesium"

// 这里的$cesium是在webpack.config.js中定义的别名，路径为"node_modules/cesium/Source"
// node_modules文件夹下的cesium文件夹最外层的index.cjs文件中，没有export相关的css文件，不能够通过import "cesium/Source/Widgets/widgets";直接加载css
// 因此需要通过设置别名$cesium访问（暂时没想到更好的解决方法）
import "$cesium/Widgets/widgets.css"
var viewer = new Viewer('cesiumContainer');
console.log('Hello World!111222');