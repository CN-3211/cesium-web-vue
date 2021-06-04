import { ScreenSpaceEventHandler,defined,ScreenSpaceEventType,CallbackProperty ,PolygonHierarchy,Color} from 'cesium'
export default class DrawPolygon {
	constructor(arg) {
		this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
		this.viewer = arg.viewer;
		this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this._polygon = null;
		this._polyline = null;
		this._positions = [];
	}

	get polygon() {
		return this._polygon;
	}
	get positions() {
		return this._positions;
	}
	startCreate() {
		var $this = this;
		this.handler.setInputAction(function (evt) { //单机开始绘制
			var cartesian = $this.getCatesian3FromPX(evt.position);
			if ($this._positions.length == 0) {
				$this._positions.push(cartesian.clone());
			}
			$this._positions.push(cartesian);
		}, ScreenSpaceEventType.LEFT_CLICK);
		this.handler.setInputAction(function (evt) { //移动时绘制面
			console.log($this._positions);
			if ($this._positions.length < 1) return;
			var cartesian = $this.getCatesian3FromPX(evt.endPosition);
			if ($this._positions.length == 2) {
				if (!defined($this._polyline)) {
					$this._polyline = $this.createPolyline();
				}
			}
			if ($this._positions.length == 3) {
				if ($this._polyline){
					$this.viewer.entities.remove($this._polyline);
					$this._polyline = null;
				}
				if (!defined($this._polygon)) {
					$this._polygon = $this.createPolygon();
					$this._polygon.objId = $this.objId;
				}
			}
			$this._positions.pop();
			$this._positions.push(cartesian);
			console.log($this._positions);
		}, ScreenSpaceEventType.MOUSE_MOVE);
		this.handler.setInputAction(function (evt) {
			if (!$this._polygon) return;
			var cartesian = $this.getCatesian3FromPX(evt.position);
			$this.handler.destroy();
			$this._positions.pop();
			$this._positions.push(cartesian);
		}, ScreenSpaceEventType.RIGHT_CLICK);
	}
	createPolygon(obj) {
		var $this = this;
		return this.viewer.entities.add({
			polygon: {
				hierarchy: new CallbackProperty(function () {
					return new PolygonHierarchy($this._positions);
				}, false),
				clampToGround: true,
				show: true,
				fill: true,
				material: Color.RED,
				width: 3,
				outlineColor: Color.BLACK,
				outlineWidth: 1,
				outline: false
			}
		});
	}
	createPolyline() {
		var $this = this;
		return this.viewer.entities.add({
			polyline: {
				positions: new CallbackProperty(function () {
					return $this._positions
				}, false),
				clampToGround: true,
				material: Color.YELLOW,
				width: 3
			}
		});
	}
	getCatesian3FromPX(px) {
		var cartesian;
		var ray = this.viewer.camera.getPickRay(px);
		if (!ray) return null;
		cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
		return cartesian;
	}
	destroy() {
		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}
		if (this._polygon) {
			this.viewer.entities.remove(this._polygon);
			this._polygon = null;
		}
		if (this._polyline) {
			this.viewer.entities.remove(this._polyline);
			this._polyline = null;
		}
		this._positions = [];
	}
}