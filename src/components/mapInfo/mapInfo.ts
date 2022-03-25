/*
 * @Date: 2021-12-28 20:05:14
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-12-29 10:00:04
 * @FilePath: /cesium-web-vue/src/components/mapInfo/mapInfo.ts
 */
import { throttle } from '@/utils/index';
import { Viewer, ScreenSpaceEventHandler, Cartesian2, ScreenSpaceEventType, EllipsoidGeodesic } from 'cesium';
import CMath from 'cesium/Source/Core/Math';
interface infos { lng: string, lat: string, height: string, ViewpointsHeight: string, scale: string }

const computeMapScale = (viewer: Viewer, infos: infos) => {
  const canvas = viewer.canvas;
  console.log('canvas :>> ', [canvas]);
  const globe = viewer.scene.globe;
  // 窗口坐标(canvas.width/2, canvas.height - 1)和(canvas.width/2 + 1, canvas.height - 1)
  // 二者相隔距离仅为一个像素
  const leftPixelPosition = new Cartesian2(canvas.width/2, canvas.height/2);
  const rightPixelPosition = new Cartesian2(canvas.width/2 + 1, canvas.height/2);
  viewer.scene.postRender.addEventListener(() => { 
    const leftPixelRay = viewer.scene.camera.getPickRay(leftPixelPosition)
    const rightPixelRay = viewer.scene.camera.getPickRay(rightPixelPosition)
    // 两个像素点在globe上对应的Cartesian3坐标
    const leftPixelCar3 = globe.pick(leftPixelRay, viewer.scene);
    const rightPixelCar3 = globe.pick(rightPixelRay, viewer.scene);
    if(!leftPixelCar3 || !rightPixelCar3) {
      return
    }
    const leftCartographic = globe.ellipsoid.cartesianToCartographic(leftPixelCar3);
    const rightCartographic = globe.ellipsoid.cartesianToCartographic(rightPixelCar3);

    const geodesic = new EllipsoidGeodesic(); // 椭球测地线
    // 设置测地线的起点和终点
    geodesic.setEndPoints(leftCartographic, rightCartographic);
    const pixelDistance = geodesic.surfaceDistance * 100 / 1000;

    if(pixelDistance < 1) {
      infos.scale = (pixelDistance * 1000).toFixed(2) + 'm'
    } else {
      infos.scale = pixelDistance.toFixed(2)  + 'km'
    }
  })
}

/**
 * @description: 实时拾取鼠标的坐标信息，并更新infos对象的内容
 * @param {*}
 * @return {*}
 */
const pickMousePosition = (viewer: Viewer, infos: infos): any => {
  console.log('viewer :>> ', viewer.scene.canvas);
  const handler3D = new ScreenSpaceEventHandler(viewer.scene.canvas);
  const handlerFunc = movement => {
    const pick = new Cartesian2(movement.endPosition.x, movement.endPosition.y);
    if (!pick) {
      return
    }
    const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(pick), viewer.scene);
    if (!cartesian) {
      return
    }
    const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
    // 经纬度
    const lat = CMath.toDegrees(cartographic.latitude);
    const lng = CMath.toDegrees(cartographic.longitude);
    // 海拔
    const height = viewer.scene.globe.getHeight(cartographic);
    // 视点海拔高度
    const ViewpointsHeight = viewer.scene.camera.positionCartographic.height;

    infos.lng = lng ? lng.toFixed(2) + '' : '';
    infos.lat = lat ? lat.toFixed(2) + '' : '';
    infos.height = height ? height.toFixed(2) + '' : '';
    infos.ViewpointsHeight = ViewpointsHeight ? ViewpointsHeight.toFixed(2) + '' : '';
  }

  handler3D.setInputAction(throttle(handlerFunc, 500), ScreenSpaceEventType.MOUSE_MOVE)

}

export { pickMousePosition, computeMapScale }