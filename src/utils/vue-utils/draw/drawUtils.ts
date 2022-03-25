/*
 * @Date: 2021-06-02 18:14:09
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-01-10 16:52:20
 * @FilePath: /cesium-web-vue/src/utils/vue-utils/draw/drawUtils.ts
 */
import {
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  ClassificationType,
  Color,
  defined,
  Entity,
  HeightReference,
  HorizontalOrigin,
  PolygonHierarchy,
  Ray,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  VerticalOrigin,
  Viewer,
  clone
} from 'cesium'

import { ref, Ref, watchEffect } from 'vue';


// 选择绘制的模式是在地形上绘制，还是在3dtiles上绘制
export const CESIUM_3D_TILE = 'CESIUM_3D_TILE'
export const TERRAIN = 'TERRAIN'

class DrawBillboard{
  static _viewer;
  handler: ScreenSpaceEventHandler;
  billboardGroup: Entity[];
  positions: Cartesian3[];
  constructor(viewer: Viewer) {
    DrawBillboard._viewer = viewer;
    this.handler = new ScreenSpaceEventHandler(DrawBillboard._viewer.scene.canvas);
    this.positions = [];
    this.billboardGroup = [];
  }
  startCreate() {
    this.handler.setInputAction(Event => {
      const cartesian:Cartesian3 = this.getCatesian3FromPX(Event.position);
      if (!cartesian) return;
      const billboard = this.createBillboard(cartesian);
      this.billboardGroup.push(billboard);
      this.positions.push(cartesian);
    }, ScreenSpaceEventType.LEFT_CLICK)
  }
  createBillboard(cartesian:Cartesian3): Entity {
    return DrawBillboard._viewer.entities.add({
      position: cartesian,
      billboard: {
        image: 'image/map-marker.png',
        scale: 0.2,
        horizontalOrigin: HorizontalOrigin.CENTER,	//获取或设置此广告牌的水平原点，确定该广告牌是否为在其锚定位置的左侧，中心或右侧。
        verticalOrigin: VerticalOrigin.BOTTOM,		//获取或设置此广告牌的垂直原点，以确定该广告牌是否为到其锚定位置的上方，下方或中心。
        heightReference:HeightReference.NONE,	//获取或设置此广告牌的高度参考
        disableDepthTestDistance:Number.MAX_VALUE				//获取或设置与相机的距离，在深度处禁用深度测试，例如，以防止剪切地形。设置为零时，将始终应用深度测试。设置为Number.POSITIVE_INFINITY时，永远不会应用深度测试。
      }
    });
  }
  getCatesian3FromPX(px:Cartesian2):Cartesian3 {
    const cartesian = DrawBillboard._viewer.scene.pickPosition(px);
    if(!cartesian) {
      throw new Error("未获取到正确坐标");
    }
    return cartesian
  }
  stopDrawing() {
    this.handler.destroy();
  }

}

interface polylineOptions {
  drawType: string
}

class DrawPolyline {
  static _viewer: Viewer;
  handler: ScreenSpaceEventHandler;
  polyline: Entity|undefined = undefined;
  positions: Cartesian3[] = [];
  positionsGroup: (Cartesian3[])[] = [];
  polylineGroup: Entity[] = [];
  drawType: string = TERRAIN;
  constructor(viewer: Viewer, options?: polylineOptions) {
    DrawPolyline._viewer = viewer;
    this.handler = new ScreenSpaceEventHandler(DrawPolyline._viewer.scene.canvas);
    
    options && this.initOptions(options)
  }
  initOptions(options: polylineOptions) {
    Object.keys(options).forEach(item => {
      this[item] = options[item];
    })
  }
  /**
   * @description: 开始绘制
   * @param {function} callback1 - 左键点击后的回调
   * @param {function} callback2 - 右键结束后的回调
   * @return {*}
   */  
  startCreate(callback1?: (params: Cartesian3[]) => void, callback2?: (params: Cartesian3[]) => void): void {
    this.handler.setInputAction(Event => {
      const cartesian:Cartesian3 = this.getCatesian3FromPX(Event.position, this.drawType);
      if(this.positions.length === 0) {
        this.positions.push(cartesian.clone())
      }

      this.positions.push(cartesian);
      callback1 && callback1(clone(this.positions));
    }, ScreenSpaceEventType.LEFT_CLICK);
  
    this.handler.setInputAction(Event => {
      if(!this.positions.length) {
        return;
      }
      const cartesian = this.getCatesian3FromPX(Event.endPosition, this.drawType)
      if(this.positions.length === 2 && !defined(this.polyline)) {
        const _positions = this.positions;
        this.polyline = this.createPolyline(_positions);
      }
      if (this.polyline) {
				this.positions.pop();
				this.positions.push(cartesian);
			}
    }, ScreenSpaceEventType.MOUSE_MOVE);
    this.handler.setInputAction(() => {
      this.positions.pop();
      this.positionsGroup.push(this.positions);
      if(this.polyline) {
        this.polylineGroup.push(this.polyline);
      }
      
      this.positions = [];
      this.polyline = undefined;
      callback2 && callback2(this.positions);
    }, ScreenSpaceEventType.RIGHT_CLICK);
    return;
  }
  /**
   * @description: 将pick到的Cartesian2坐标转化为Cartesian3
   * @param {Cartesian2} px
   * @return {Cartesian3} cartesian
   */
  getCatesian3FromPX(px: Cartesian2, type: string):Cartesian3 {
    const cartesian = DrawPolyline._viewer.scene.pickPosition(px);
    if(!cartesian) {
      throw new Error("未获取到正确坐标");
    }
    return cartesian
  }
  createPolyline(_positions: Cartesian3[]):Entity {
    return DrawPolyline._viewer.entities.add({
      polyline: {
        positions: new CallbackProperty(() => _positions, false),
        material: Color.YELLOW,
        width: 3,
        show: true,
        clampToGround: true,
        zIndex: 100000
      }
    })
  }
  stopDrawing() {
    this.handler.destroy();
    this.polyline && DrawPolyline._viewer.entities.remove(this.polyline);
  }
  destroy():void {
    this.polyline = undefined;
    if(!this.handler.isDestroyed()) {
      this.handler.destroy()
    }
    DrawPolyline._viewer.entities.removeAll();
    return
  }
}

interface polygonOptions {
  drawType: string
}
class DrawPolygon {
  static _viewer: Viewer;
  handler: ScreenSpaceEventHandler;
  positions: Cartesian3[];
  polyline: Entity|undefined;
  polygon: Entity|undefined;
  positionsGroup: (Cartesian3[])[];
  polygonGroup: Entity[];
  drawType:string;
  constructor(viewer: Viewer, options?: polygonOptions) {
    DrawPolygon._viewer = viewer;
    this.handler = new ScreenSpaceEventHandler(DrawPolygon._viewer.scene.canvas);
    this.positions = [];
    this.polyline = undefined;
    this.polygon = undefined;
    
    this.positionsGroup = [];
    this.polygonGroup = [];
    this.drawType = 'TERRAIN';
    options && this.initOptions(options)
  }
  initOptions(options: polygonOptions) {
    Object.keys(options).forEach(item => {
      this[item] = options[item];
    })
  }
  startCreate(callback1?: (params: Cartesian3[]) => void, callback2?: (params: Cartesian3[]) => void) {
    /** 点击开始 **/
    this.handler.setInputAction(event => {
      const clickPosition = this.getCatesian3FromPX(event.position, this.drawType);
      this.positions.push(clickPosition);
      callback1 && callback1(clone(this.positions));
    }, ScreenSpaceEventType.LEFT_CLICK)

    /** 鼠标移动 **/
    this.handler.setInputAction(event => {
      if(!this.positions.length) {
        return;
      }
      const movePosition = this.getCatesian3FromPX(event.endPosition, this.drawType);
      if(this.positions.length > 2) {
        if(this.polygon) {
          this.positions.pop();
          this.positions.push(movePosition);
        } else {
          this.positions.pop();
          this.positions.push(movePosition);
          // 仅仅是改变指针
          const _positons = this.positions;
          this.createPolygon(_positons);
        }
      } else {
        if(this.polyline) {
          this.positions.pop();
          this.positions.push(movePosition);
        } else {
          this.positions.push(movePosition);
          const _positons = this.positions;
          this.createPolyLine(_positons);
        }
      }
      
    }, ScreenSpaceEventType.MOUSE_MOVE)
    /** 右键结束 **/
    this.handler.setInputAction(event => {
      this.positions.pop();
      
      // 这一段防止长度为2时。右键中止绘制后地图上留下线
      if(this.positions.length === 2) {
        this.positions.pop();
      }
      
      this.positionsGroup.push(this.positions);
      if(this.polygon) {
        this.polygonGroup.push(this.polygon);
      }
      callback2 && callback2(clone(this.positions));
  
      this.positions = [];
      this.polyline = undefined;
      this.polygon = undefined;
  
    }, ScreenSpaceEventType.RIGHT_CLICK)
  }
  getCatesian3FromPX(px: Cartesian2, type: string):Cartesian3 {
    const cartesian = DrawPolygon._viewer.scene.pickPosition(px);
    if(!cartesian) {
      throw new Error("未获取到正确坐标");
    }
    return cartesian
  }
  createPolyLine(_positions: Cartesian3[]) {
    this.polyline = DrawPolygon._viewer.entities.add({
      polyline: {
        positions: new CallbackProperty(() => _positions.length ? _positions.concat(_positions[0]) : _positions, false),
        // positions: new CallbackProperty(() => this.positions.length ? this.positions.concat(this.positions[0]) : this.positions, false),
        material: new Color(0.1, 0.5, 0.9, 0.8),
        width: 3,
        show: true,
        clampToGround: true,
      }
    })
  }
  createPolygon(_positions: Cartesian3[]) {
    this.polygon = DrawPolygon._viewer.entities.add({
      polygon: {
        hierarchy: new CallbackProperty(() => new PolygonHierarchy(_positions), false),
				material: new Color(0.1, 0.5, 0.9, 0.4),
      }
    })
  }
  stopDrawing() {
    this.handler.destroy();
    this.polygon && DrawPolygon._viewer.entities.remove(this.polygon);
    this.polyline && DrawPolygon._viewer.entities.remove(this.polyline);
  }
  destroy(): void {
    this.polygon = undefined;
    this.polyline = undefined;
    if(!this.handler.isDestroyed()) {
      this.handler.destroy()
    }
    DrawPolygon._viewer.entities.removeAll();
  }
}

export { DrawPolyline, DrawPolygon, DrawBillboard, polylineOptions }