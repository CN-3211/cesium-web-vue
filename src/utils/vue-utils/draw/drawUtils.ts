/*
 * @Date: 2021-06-02 18:14:09
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-08-04 17:52:08
 * @FilePath: \cesium-web-vue\src\utils\vue-utils\draw\drawUtils.ts
 */
import {
  CallbackProperty,
  Cartesian2,
  Cartesian3,
  ClassificationType,
  Color,
  defined,
  Entity, HeightReference, HorizontalOrigin,
  PolygonHierarchy,
  Ray,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType, VerticalOrigin,
  Viewer
} from 'cesium'

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
        heightReference:HeightReference.CLAMP_TO_GROUND,	//获取或设置此广告牌的高度参考
        disableDepthTestDistance:Number.MAX_VALUE				//获取或设置与相机的距离，在深度处禁用深度测试，例如，以防止剪切地形。设置为零时，将始终应用深度测试。设置为Number.POSITIVE_INFINITY时，永远不会应用深度测试。
      }
    });
  }
  getCatesian3FromPX(px:Cartesian2):Cartesian3 {
    const ray:Ray = DrawBillboard._viewer.camera.getPickRay(px);
    const cartesian:Cartesian3|undefined = DrawBillboard._viewer.scene.globe.pick(ray, DrawBillboard._viewer.scene);
    if(!cartesian) {
      throw new Error("未获取到正确坐标");
    }
    return cartesian
  }
  stopDrawing() {
    this.handler.destroy();
  }

}

class DrawPolyline {
  static _viewer: Viewer;
  handler: ScreenSpaceEventHandler;
  polyline: Entity|undefined;
  positions: Cartesian3[];

  constructor(viewer: Viewer) {
    DrawPolyline._viewer = viewer;
    this.handler = new ScreenSpaceEventHandler(DrawPolyline._viewer.scene.canvas);
    this.polyline = undefined;
    this.positions = [];
  }

  startCreate(callback?: (params: Cartesian3[]) => void): void {
    this.handler.setInputAction(Event => {
      const cartesian:Cartesian3 = this.getCatesian3FromPX(Event.position);
      if(this.positions.length === 0) {
        this.positions.push(cartesian.clone())
      }

      this.positions.push(cartesian);
    }, ScreenSpaceEventType.LEFT_CLICK)
  
    this.handler.setInputAction(Event => {
      if(!this.positions.length) {
        return;
      }
      const cartesian = this.getCatesian3FromPX(Event.endPosition)
      if(this.positions.length === 2 && !defined(this.polyline)) {
        this.polyline = this.createPolyline();
      }
      if (this.polyline) {
				this.positions.pop();
				this.positions.push(cartesian);
			}
    }, ScreenSpaceEventType.MOUSE_MOVE)
    this.handler.setInputAction(Event => {
      const cartesian = this.getCatesian3FromPX(Event.position);
      this.handler.destroy();
      this.positions.pop();
      this.positions.push(cartesian);
      callback && callback(this.positions);
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
        positions: new CallbackProperty(() => this.positions, false),
        material: Color.YELLOW,
        width: 3,
        show: true,
        clampToGround: true,
        classificationType: ClassificationType.TERRAIN
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

class DrawPolygon {
  handler: ScreenSpaceEventHandler;
  positions: Cartesian3[];
  polyline: Entity|undefined;
  polygon: Entity|undefined;
  static _viewer: Viewer;
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
      callback && callback(this.positions);
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
        positions: new CallbackProperty(() => this.positions.concat(this.positions[0]), false),
        material: new Color(0.1, 0.5, 0.9, 0.8),
        width: 3,
        show: true,
        clampToGround: true,
        classificationType: ClassificationType.TERRAIN
      }
    })
  }
  createPolygon() {
    this.polygon = DrawPolygon._viewer.entities.add({
      polygon: {
        hierarchy: new CallbackProperty(() => new PolygonHierarchy(this.positions), false),
				material: new Color(0.1, 0.5, 0.9, 0.4),
        classificationType: ClassificationType.TERRAIN
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

export { DrawPolyline, DrawPolygon, DrawBillboard }