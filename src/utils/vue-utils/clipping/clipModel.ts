/*
 * @Date: 2021-06-16 11:00:08
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-25 18:14:03
 * @FilePath: \cesium-web-vue\src\utils\vue-utils\clipping\clipModel.ts
 */
import * as Cesium from 'cesium';
// direction存放表示方向的字符串常量
import { direction } from '@/constant/index';


function createClippingPlanes(planeDirection:string):Cesium.ClippingPlaneCollection {
  let plansArr:Cesium.ClippingPlane[] = [];
  switch (planeDirection) {
    case direction.WEST:
      plansArr = [new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), 0.0),]
      break;
    case direction.EAST:
      plansArr = [new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), 0.0),]
      break;
    case direction.TOP:
      plansArr = [new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 0.0),]
      break;
    case direction.BOTTOM:
      plansArr = [new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, 1.0), 0.0),]
      break;
    case direction.SOUTH:
      plansArr = [new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), 0.0),]
      break;
    case direction.NORTH:
      plansArr = [new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), 0.0),]
      break;
    default:
      plansArr = [
        new Cesium.ClippingPlane(new Cesium.Cartesian3(1.0, 0.0, 0.0), 0.0),
        new Cesium.ClippingPlane(new Cesium.Cartesian3(-1.0, 0.0, 0.0), 0.0),
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 0.0),
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, 1.0), 0.0),
        // new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), 0.0),
        // new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), 0.0),
      ]
      break;
  }
  return new Cesium.ClippingPlaneCollection(
    {
      planes: plansArr,
      edgeColor: Cesium.Color.RED,
      edgeWidth: 2.0,
      unionClippingRegions: true
    }
  )
}


function getPlaneDirection(plane:Cesium.ClippingPlane):string {
  const { x, y, z } = plane.normal;
  if (x == 1 && y == 0 && z == 0) {
    return direction.WEST;
  }
  else if (x == -1 && y == 0 && z == 0) {
    return direction.EAST;
  }
  else if (x == 0 && y == -1 && z == 0) {
    return direction.NORTH;
  }
  else if (x == 0 && y == 1 && z == 0) {
    return direction.SOUTH;
  }
  else if (x == 0 && y == 0 && z == -1) {
    return direction.TOP;
  }
  else if (x == 0 && y == 0 && z == 1) {
    return direction.BOTTOM;
  }
  throw new Error("获取plane的方向时，发生错误");
  

}

export { createClippingPlanes, getPlaneDirection } 