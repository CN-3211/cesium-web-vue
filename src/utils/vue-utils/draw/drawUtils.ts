/*
 * @Date: 2021-06-02 18:14:09
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-08-04 17:52:08
 * @FilePath: \cesium-web-vue\src\utils\vue-utils\draw\drawUtils.ts
 */
import { Viewer, ScreenSpaceEventHandler, Cartesian3, Cartesian2, ScreenSpaceEventType, Ray, defined, CallbackProperty, Color, Entity, PolygonHierarchy
 } from 'cesium'
import Cesium3DTile from 'cesium/Source/Scene/Cesium3DTile';

class DrawPolyline {
  static _viewer: Viewer;
  static _handler: ScreenSpaceEventHandler;
  static _polyline: Entity|undefined;
  _positions: Cartesian3[];

  constructor(viewer: Viewer) {
    DrawPolyline._viewer = viewer;
    DrawPolyline._handler = new ScreenSpaceEventHandler(DrawPolyline._viewer.scene.canvas);
    DrawPolyline._polyline = undefined;
    this._positions = [];
  }

  startCreate(callback?: (params: Cartesian3[]) => void): void {
    DrawPolyline._handler.setInputAction(Event => {
      const cartesian:Cartesian3 = this.getCatesian3FromPX(Event.position);
      if(this._positions.length === 0) {
        this._positions.push(cartesian.clone())
      }

      this._positions.push(cartesian);
    }, ScreenSpaceEventType.LEFT_CLICK)

    DrawPolyline._handler.setInputAction(Event => {
      if(!this._positions.length) {
        return;
      }
      const cartesian = this.getCatesian3FromPX(Event.endPosition)
      if(this._positions.length === 2 && !defined(DrawPolyline._polyline)) {
        DrawPolyline._polyline = this.createPolyline();
      }
      if (DrawPolyline._polyline) {
				this._positions.pop();
				this._positions.push(cartesian);
			}
    }, ScreenSpaceEventType.MOUSE_MOVE)
    DrawPolyline._handler.setInputAction(Event => {
      const cartesian = this.getCatesian3FromPX(Event.position);
      DrawPolyline._handler.destroy();
      this._positions.pop();
      this._positions.push(cartesian);
      callback && callback(this._positions);
    }, ScreenSpaceEventType.RIGHT_CLICK);
    return;
  }
  /**
   * @description: 将pick到的Cartesian2坐标转化为Cartesian3
   * @param {Cartesian2} px
   * @return {Cartesian3} cartesian
   */
  getCatesian3FromPX(px:Cartesian2):Cartesian3 {
    const ray:Ray = DrawPolyline._viewer.camera.getPickRay(px);
    const cartesian:Cartesian3|undefined = DrawPolyline._viewer.scene.globe.pick(ray, DrawPolyline._viewer.scene);
    if(!cartesian) { 
      throw new Error("未获取到正确坐标");
    }
    return cartesian
  }
  createPolyline():Entity {
    return DrawPolyline._viewer.entities.add({
      polyline: {
        positions: new CallbackProperty(() => this._positions, false),
        material: Color.YELLOW,
        width: 3,
        show: true,
        clampToGround: true
      }
    })
  }
  destroy():void {
    DrawPolyline._polyline = undefined;
    if(!DrawPolyline._handler.isDestroyed()) {
      DrawPolyline._handler.destroy()
    }
    DrawPolyline._viewer.entities.removeAll();
    return
  }
}

class DrawPolygon {
  handler: ScreenSpaceEventHandler
  positions: Cartesian3[]
  polyline: Entity|undefined
  polygon: Entity|undefined
  static _viewer: Viewer
  constructor(viewer: Viewer) {
    DrawPolygon._viewer = viewer;
    this.handler = new ScreenSpaceEventHandler(DrawPolygon._viewer.scene.canvas);
    this.positions = [];
    this.polyline = undefined;
    this.polygon = undefined;
  }
  startCreate(callback?) {
    /** 点击开始 **/
    this.handler.setInputAction(event => {
      const clickPosition = this.getCatesian3FromPX(event.position);
      this.positions.push(clickPosition);
    }, ScreenSpaceEventType.LEFT_CLICK)

    /** 鼠标移动 **/
    this.handler.setInputAction(event => {
      if(!this.positions.length) {
        return;
      }
      const movePosition = this.getCatesian3FromPX(event.endPosition);
      if(this.positions.length > 2) {
        if(this.polygon) {
          this.positions.pop();
          this.positions.push(movePosition);
        } else {
          this.positions.pop();
          this.positions.push(movePosition);
          this.createPolygon();
        }
      } else {
        if(this.polyline) {
          this.positions.pop();
          this.positions.push(movePosition);
        } else {
          this.positions.push(movePosition);
          this.createPolyLine();
        }
      }
      
    }, ScreenSpaceEventType.MOUSE_MOVE)
    /** 右键结束 **/
    this.handler.setInputAction(event => {
      const rClickPosition = this.getCatesian3FromPX(event.position);

      this.positions.pop();
      this.positions.push(rClickPosition);
      this.handler.destroy();
      if(callback) {
        callback(this.positions);
      }
      this.polygon = undefined;
      this.polyline = undefined;
    }, ScreenSpaceEventType.RIGHT_CLICK)
  }
  getCatesian3FromPX(px:Cartesian2):Cartesian3 {
    const ray:Ray = DrawPolygon._viewer.camera.getPickRay(px);
    const cartesian:Cartesian3|undefined = DrawPolygon._viewer.scene.globe.pick(ray, DrawPolygon._viewer.scene);
    if(!cartesian) { 
      throw new Error("未获取到正确坐标");
    }
    return cartesian
  }
  createPolyLine() {
    this.polyline = DrawPolygon._viewer.entities.add({
      polyline: {
        positions: new CallbackProperty(() => this.positions, false),
        material: Color.YELLOW,
        width: 3,
        show: false,
        clampToGround: true
      }
    })
  }
  createPolygon() {
    this.polygon = DrawPolygon._viewer.entities.add({
      polygon: {
        hierarchy: new CallbackProperty(() => new PolygonHierarchy(this.positions), false),
				material: new Color(0.1, 0.5, 0.9, 0.4),
				outline: true,
        // 想设置outline，必须要有高度
        outlineColor: Color.RED,
        outlineWidth: 1
      }
    })
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

class DrawOn3Dtiles {
  static _viewer: Viewer
  // handler: ScreenSpaceEventHandler
  constructor(viewer) {
    DrawOn3Dtiles._viewer = viewer;
    
  }
  startCreate() {
    console.log('111 :>> ', 111);
  }
}

export { DrawPolyline, DrawPolygon }