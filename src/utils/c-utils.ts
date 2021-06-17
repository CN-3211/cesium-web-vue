/*
 * @Date: 2021-06-16 15:54:32
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-16 16:15:44
 * @FilePath: \cesium-web-vue\src\utils\c-utils.ts
 */
import ScreenSpaceEventHandler from "cesium/Source/Core/ScreenSpaceEventHandler";
import ScreenSpaceEventType from "cesium/Source/Core/ScreenSpaceEventType";
import Viewer from "cesium/Source/Widgets/Viewer/Viewer";

/**
 * @description: 根据用户输入的type来直接创建hanlder
 * @param {Viewer} viewer
 * @param {function} callback 事件发生时的回调函数
 * @param {ScreenSpaceEventType} type 事件类型
 * @return {ScreenSpaceEventHandler} 返回包装后的事件
 */
function createHandler(viewer:Viewer, callback: (...params: any[]) => any, type:ScreenSpaceEventType):ScreenSpaceEventHandler {
  const handler:ScreenSpaceEventHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
  
  handler.setInputAction(callback, type)

  return handler
}

export {
  createHandler
}