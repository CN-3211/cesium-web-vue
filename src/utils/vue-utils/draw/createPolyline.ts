/*
 * @Date: 2021-06-02 18:14:09
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-05 11:51:37
 * @FilePath: \cesium-web-vue\src\utils\vue-utils\draw\createPolyline.ts
 */
import { Viewer, ScreenSpaceEventHandler, Cartesian3, Cartesian2, ScreenSpaceEventType, Ray, defined, CallbackProperty, Color
 } from 'cesium'
import Entity from 'cesium/Source/DataSources/Entity';

export default class DrawPolyline {
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
    const $this:this = this;
    DrawPolyline._handler.setInputAction(Event => {
      const cartesian:Cartesian3|undefined = $this.getCatesian3FromPX(Event.position);
      if(!cartesian) {
        throw new Error("鼠标获取坐标点失败！");
      }
      if($this._positions.length === 0) {
        $this._positions.push(cartesian.clone())
      }

      $this._positions.push(cartesian);
    }, ScreenSpaceEventType.LEFT_CLICK)

    DrawPolyline._handler.setInputAction(Event => {
      const cartesian = $this.getCatesian3FromPX(Event.endPosition)
      if(!$this._positions.length || !cartesian) {
        return;
      }
      if($this._positions.length === 2 && !defined(DrawPolyline._polyline)) {
        DrawPolyline._polyline = $this.createPolyline();
      }
      if (DrawPolyline._polyline) {
				$this._positions.pop();
				$this._positions.push(cartesian);
			}
    }, ScreenSpaceEventType.MOUSE_MOVE)
    DrawPolyline._handler.setInputAction(Event => {
      const cartesian = $this.getCatesian3FromPX(Event.position);
      if(!cartesian) {
        throw new Error("鼠标获取坐标点失败！");
      }
      DrawPolyline._handler.destroy();
      $this._positions.pop();
      $this._positions.push(cartesian);
      callback && callback($this._positions);
    }, ScreenSpaceEventType.RIGHT_CLICK)
    return;
  }
  /**
   * @description: 将pick到的Cartesian2坐标转化为Cartesian3
   * @param {Cartesian2} px
   * @return {Cartesian3} cartesian
   */
  getCatesian3FromPX(px:Cartesian2):Cartesian3|undefined {
    const ray:Ray = DrawPolyline._viewer.camera.getPickRay(px);
    const cartesian:Cartesian3|undefined = DrawPolyline._viewer.scene.globe.pick(ray, DrawPolyline._viewer.scene);
    return cartesian
  }
  createPolyline():Entity {
    const $this:this = this;
    return DrawPolyline._viewer.entities.add({
      polyline: {
        positions: new CallbackProperty(() => $this._positions, false),
        material: Color.YELLOW,
        width: 3,
        show: true,
        clampToGround: true
      }
    })
  }
  destroy():void {
    if(DrawPolyline._polyline) {
      DrawPolyline._viewer.entities.remove(DrawPolyline._polyline);
      this._positions =[];
    }
    return
  }
}