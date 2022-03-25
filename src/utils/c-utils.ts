/*
 * @Date: 2021-06-16 15:54:32
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-12-03 09:20:38
 * @FilePath: /cesium-web-vue/src/utils/c-utils.ts
 */

import { Viewer, Cartesian2, Cartesian3, Ellipsoid, EllipsoidTerrainProvider, Model, Cesium3DTileset, Cesium3DTileFeature, Cartographic, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium';
import CMath from 'cesium/Source/Core/Math';


/**
 * @description: 根据用户输入的type来直接创建hanlder
 * @param {HTMLCanvasElement} [canvas]
 * @param {function} [callback] 事件发生时的回调函数
 * @param {ScreenSpaceEventType} [type] 事件类型
 * @return {ScreenSpaceEventHandler} 返回包装后的事件
 */
function createHandler(canvas: HTMLCanvasElement, callback: (...params: any[]) => any, type: ScreenSpaceEventType): ScreenSpaceEventHandler {
  const handler: ScreenSpaceEventHandler = new ScreenSpaceEventHandler(canvas)

  handler.setInputAction(callback, type)

  return handler
}

function changeCar3ToLnglat(car3: Cartesian3) {
  const cartographic = Cartographic.fromCartesian(car3);
  const lng = CMath.toDegrees(cartographic.longitude);
  const lat = CMath.toDegrees(cartographic.latitude);
  const height = cartographic.height;
  return { 
    lng: Number(lng.toFixed(6)),
    lat: Number(lat.toFixed(6)),
    height: Number(height.toFixed(2)),
    _lng: lng,
    _lat: lat,
    _height: height
  }
}

/**
 * 拾取位置点，能够根据鼠标位置判断出是画在3dtils上，还是画在地球上，还是画在地形上
 *
 * @param {Object} px 屏幕坐标
 *
 * @return {Object} Cartesian3 三维坐标
 */
function getCatesian3FromPX(px: Cartesian2, viewer: Viewer) {
  const picks = viewer.scene.drillPick(px);
  let cartesian;
  let isOn3dtiles = false, isOnTerrain = false;
  // drillPick
  for (const i in picks) {
    const pick = picks[i];

    if (
      (pick && pick.primitive instanceof Cesium3DTileFeature) ||
      (pick && pick.primitive instanceof Cesium3DTileset) ||
      (pick && pick.primitive instanceof Model)
    ) {
      //模型上拾取
      isOn3dtiles = true;
    }
    // 3dtilset
    if (isOn3dtiles) {
      // viewer.scene.pick(px); // pick
      cartesian = viewer.scene.pickPosition(px);
      if (cartesian) {
        const cartographic = Cartographic.fromCartesian(cartesian);
        if (cartographic.height < 0) cartographic.height = 0;
        const lon = CMath.toDegrees(cartographic.longitude), lat = CMath.toDegrees(cartographic.latitude), height = cartographic.height;
        cartesian = transformWGS84ToCartesian({
          lng: lon,
          lat: lat,
          alt: height,
        }, viewer);
      }
    }
  }
  // 地形
  const isEllipsoidTerrainProvider = viewer.terrainProvider instanceof EllipsoidTerrainProvider;
  // Terrain
  if (!isOn3dtiles && !isEllipsoidTerrainProvider) {
    const ray = viewer.scene.camera.getPickRay(px);
    if (!ray) return null;
    cartesian = viewer.scene.globe.pick(ray, viewer.scene);
    isOnTerrain = true;
  }
  // 地球
  if (!isOn3dtiles && !isOnTerrain && isEllipsoidTerrainProvider) {
    cartesian = viewer.scene.camera.pickEllipsoid(px, viewer.scene.globe.ellipsoid);
  }
  if (cartesian) {
    const position = transformCartesianToWGS84(cartesian, viewer);
    if (position && position.alt < 0) {
      cartesian = transformWGS84ToCartesian(position, viewer, 0.1);
    }
    return cartesian;
  }
  return false;
}
/***
* 坐标转换 笛卡尔转84
*
* @param {Object} Cartesian3 三维位置坐标
*
* @return {Object} {lng,lat,alt} 地理坐标
*/
function transformCartesianToWGS84(cartesian, viewer: Viewer) {
  if (viewer && cartesian) {
    const ellipsoid = Ellipsoid.WGS84;
    const cartographic = ellipsoid.cartesianToCartographic(cartesian);
    return {
      lng: CMath.toDegrees(cartographic.longitude),
      lat: CMath.toDegrees(cartographic.latitude),
      alt: cartographic.height,
    };
  }
}
/***
* 坐标转换 84转笛卡尔
*
* @param {Object} {lng,lat,alt} 地理坐标
*
* @return {Object} Cartesian3 三维位置坐标
*/
function transformWGS84ToCartesian(position, viewer: Viewer, alt?) {
  if (viewer) {
    return position ?
      Cartesian3.fromDegrees(
        position.lng || position.lon,
        position.lat,
        position.alt = alt || position.alt,
        Ellipsoid.WGS84
      ) :
      Cartesian3.ZERO
  }
}

export {
  createHandler,
  changeCar3ToLnglat,
  getCatesian3FromPX
}