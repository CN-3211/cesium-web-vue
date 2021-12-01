/*
 * @Date: 2021-11-26 10:02:19
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-12-01 08:56:45
 * @FilePath: /cesium-web-vue/src/utils/vue-utils/handle3DTiles/selectTileset.ts
 */
import { Color, Cesium3DTileStyle, Cesium3DTileset , Cesium3DTileFeature ,Viewer, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import { throttle } from '@/utils/index';

export default function pick3Dtiles(viewer: Viewer, callback: (params: Cesium3DTileset) => void) {
  let tileset:Cesium3DTileset | undefined
  let blinkInterval

  const handler: ScreenSpaceEventHandler = new ScreenSpaceEventHandler(viewer.canvas);
  const blinkStyle = new Cesium3DTileStyle({
    color: 'color("yellow")'
  })
  // 防抖，不要多次触发
  handler.setInputAction(throttle(movement => {

    const tilesetFeature = viewer.scene.pick(movement.position);
    if(tilesetFeature instanceof Cesium3DTileFeature) {
      // 点击触发模型闪烁
      tileset = tilesetFeature.primitive;
      tileset.style = blinkStyle;
      
      setTimeout(() => { if(tileset) { tileset.style = undefined; } }, 300);
      setTimeout(() => { if(tileset) { tileset.style = blinkStyle; } }, 600);
      setTimeout(() => { if(tileset) { tileset.style = undefined; } }, 900);

      callback(tileset)
    }
    
  }, 100), ScreenSpaceEventType.LEFT_CLICK)

  return handler;
}