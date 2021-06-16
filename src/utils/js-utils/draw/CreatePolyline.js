import { ScreenSpaceEventHandler,defined,ScreenSpaceEventType,CallbackProperty ,PolygonHierarchy,Color} from 'cesium'
export default class DrawPolyline {
	constructor(arg) {
		//设置唯一id 备用
		this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
		this.viewer = arg.viewer;
		//事件
		this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this._polyline = null;
		this._positions = [];
	}

	//获取线
	get line(){
		return this._polyline;
	}
	//获取线的坐标数组
	get positions(){
		return this._positions;
	}
	//开始创建
	startCreate() {
		var $this = this;
		this.handler.setInputAction(function (evt) { //单击开始绘制
			//屏幕坐标转地形上坐标
			var cartesian = $this.getCatesian3FromPX(evt.position);
			if ($this._positions.length == 0) {
				$this._positions.push(cartesian.clone());
			}
			$this._positions.push(cartesian);
		}, ScreenSpaceEventType.LEFT_CLICK);
		this.handler.setInputAction(function (evt) { //移动时绘制线
			if ($this._positions.length < 1) return;
			var cartesian = $this.getCatesian3FromPX(evt.endPosition);
			if ($this._positions.length == 2) {
				if (!defined($this._polyline)) {
					$this._polyline = $this.createPolyline();
				}
			}
			if ($this._polyline) {
				$this._positions.pop();
				$this._positions.push(cartesian);
			}
		}, ScreenSpaceEventType.MOUSE_MOVE);
		this.handler.setInputAction(function (evt) { //右键结束绘制
			if (!$this._polyline) return;
			var cartesian = $this.getCatesian3FromPX(evt.position);
			$this.handler.destroy();
			$this._positions.pop();
			$this._positions.push(cartesian);
		}, ScreenSpaceEventType.RIGHT_CLICK);
	}
	createPolyline(obj) {
		if (!obj) obj = {};
		var $this = this;
		var polyline = this.viewer.entities.add({
			polyline: {
				//使用cesium的peoperty
				positions: new CallbackProperty(function () {
					return $this._positions
				}, false),
				show: true,
				material: Color.YELLOW,
				width: 3,
				clampToGround:true
			}
		});
		polyline.objId = this.objId;
		return polyline;
	}
	destroy() {
		this.linePointArr = [];
		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}
		if (this._polyline) {
			this.viewer.entities.remove(this._polyline);
			this._polyline = null;
		}
		this._positions = [];
	}
	getCatesian3FromPX(px) {
		var cartesian;
		var ray = this.viewer.camera.getPickRay(px);
		if (!ray) return null;
		cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
		return cartesian;
	}
}