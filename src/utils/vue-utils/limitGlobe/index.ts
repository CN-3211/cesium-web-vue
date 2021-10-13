/*
 * @Date: 2021-10-11 09:52:07
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-10-11 09:58:53
 * @FilePath: \cesium-web-vue\src\utils\vue-utils\limitGlobe\index.ts
 */
import * as Cesium from 'cesium';

export default class limitClip {
  constructor(viewer: Cesium.Viewer) {
    // limitClip.createGlobeClip(viewer);
    limitClip.useGlobeLimit(viewer)
  }

  /**
   * @description: 通过地形裁剪的方式来切割地球
   * @param {*} viewer
   * @return {*}
   */  
  private static createGlobeClip(viewer: Cesium.Viewer) {
    const clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes: [
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), 4000000.0),
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), 4000000.0),
      ],
      unionClippingRegions: true,
      edgeColor: Cesium.Color.WHITE,
      edgeWidth: 1.0
    })
    viewer.scene.globe.clippingPlanes = clippingPlanes
  }

  private static useGlobeLimit(viewer: Cesium.Viewer) {
    const limitRectangle = Cesium.Rectangle.fromDegrees(109.33, 30.09, 110.33, 31.32);
    viewer.scene.globe.cartographicLimitRectangle = limitRectangle;

    // 添加切面边缘
    viewer.entities.add({
      rectangle: {
        fill: false,
        coordinates: limitRectangle,
        outline: true,
        outlineColor: Cesium.Color.WHITE
      }
    })
  }
}