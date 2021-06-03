/*
 * @Date: 2021-06-02 18:14:09
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-03 11:10:56
 * @FilePath: \cesium-web-vue\src\utils\vue-utils\draw\createPolyline.ts
 */
import { Viewer, ScreenSpaceEventHandler, Cartesian3, Cartesian2, ScreenSpaceEventType, Ray, defined, PolylineGraphics, CallbackProperty, Color, PolygonGeometry
 } from 'cesium'
import Entity from 'cesium/Source/DataSources/Entity';

export default class DrawPolyline {
  private _objId: number;
  private _viewer: Viewer;
  private _handler: ScreenSpaceEventHandler;
  private _polyline: object|undefined;
  private _positions: Cartesian3[];

  constructor(viewer: Viewer) {
    this._objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
    this._viewer = viewer;
    this._handler = new ScreenSpaceEventHandler(this._viewer.scene.canvas);
    this._polyline = undefined;
    this._positions = [];
  }

  startCreate() {
    let $this:this = this;
    this._handler.setInputAction(Event => {
      let cartesian:Cartesian3|undefined = $this.getCatesian3FromPX(Event.position);
      if(!cartesian) {
        throw new Error("鼠标获取坐标点失败！");
      }
      if($this._positions.length === 0) {
        $this._positions.push(cartesian.clone())
      }

      $this._positions.push(cartesian);
    }, ScreenSpaceEventType.LEFT_CLICK)

    this._handler.setInputAction(Event => {
      let cartesian = $this.getCatesian3FromPX(Event.endPosition)
      if(!$this._positions.length || !cartesian) {
        return;
      }
      if($this._positions.length === 2 && !defined($this._polyline)) {
        $this._polyline = $this.createPolyline();
        console.log('$this._polyline :>> ', $this._polyline);
      }
      if ($this._polyline) {
				$this._positions.pop();
				$this._positions.push(cartesian);
			}
      console.log('Event :>> ', Event); 
    }, ScreenSpaceEventType.MOUSE_MOVE)
  }
  /**
   * @description: 将pick到的Cartesian2坐标转化为Cartesian3
   * @param {Cartesian2} px
   * @return {Cartesian3} cartesian
   */  
  getCatesian3FromPX(px:Cartesian2):Cartesian3|undefined {
    let cartesian:Cartesian3|undefined;
    let ray:Ray = this._viewer.camera.getPickRay(px);
    cartesian = this._viewer.scene.globe.pick(ray, this._viewer.scene);
    return cartesian
  }
  createPolyline():Entity {
    let $this:this = this;
    return this._viewer.entities.add({
      polyline: {
        positions: new CallbackProperty(() => $this._positions, false),
        material: Color.YELLOW,
        width: 3,
        show: true,
        clampToGround: true
      }
    })
  }
}