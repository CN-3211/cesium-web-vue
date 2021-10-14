/*
 * @Date: 2021-09-20 09:26:23
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-10-13 15:56:13
 * @FilePath: \cesium-web-vue\src\utils\node-utils\groupFilesName.js
 */
var path = require("path");
var fs = require("fs");
 
var pathName = "D:/workCode/cesium-web-vue/public/obj/建模深度60米三维地质模型";
fs.readdir(pathName, function(err, files){
    var dirs = [];
    (function iterator(i){
      if(i == files.length) {
        console.log(dirs, dirs.length);
        return ;
      }
      fs.stat(path.join(pathName, files[i]), function(err, data){     
        if(data.isFile()){         
          if(files[i].slice(-4) === ".obj") {
            dirs.push(files[i].slice(0, -4));
          }
        }
        iterator(i+1);
       });   
    })(0);
});