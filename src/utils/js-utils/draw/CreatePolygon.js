import * as Cesium from 'cesium';
export default class DrawPolygon {
	constructor(viewer) {
		this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
		this.viewer = viewer;
		this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
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
	startCreate(callback) {
		var $this = this;
		this.handler.setInputAction(function (evt) { //单机开始绘制
			var cartesian = $this.getCatesian3FromPX(evt.position);
			if ($this._positions.length == 0) {
				$this._positions.push(cartesian.clone());
			}
			$this._positions.push(cartesian);
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		this.handler.setInputAction(function (evt) { //移动时绘制面
			if ($this._positions.length < 1) return;
			var cartesian = $this.getCatesian3FromPX(evt.endPosition);
			if ($this._positions.length == 2) {
				if (!Cesium.defined($this._polyline)) {
					$this._polyline = $this.createPolyline();
				}
			}
			if ($this._positions.length == 3) {
				if ($this._polyline){
					$this.viewer.entities.remove($this._polyline);
					$this._polyline = null;
				}
				if (!Cesium.defined($this._polygon)) {
					$this._polygon = $this.createPolygon();
					$this._polygon.objId = $this.objId;
				}
			}
			$this._positions.pop();
			$this._positions.push(cartesian);
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		this.handler.setInputAction(function (evt) {
			if (!$this._polygon) return;
			$this.viewer.entities.remove($this._polygon) 
			var cartesian = $this.getCatesian3FromPX(evt.position);
			$this.handler.destroy();
			$this._positions.pop();
			$this._positions.push(cartesian);
			callback($this._positions)
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	}
	createPolygon() {
		var $this = this;
		return this.viewer.entities.add({
			polygon: {
				hierarchy: new Cesium.CallbackProperty(function () {
					return new Cesium.PolygonHierarchy($this._positions);
				}, false),
				clampToGround: true,
				show: true,
				fill: true,
				material: new Cesium.Color(0.1, 0.5, 0.9, 0.4),
				width: 2,
				outline: false
			}
		});
	}
	createPolyline() {
		var $this = this;
		return this.viewer.entities.add({
			polyline: {
				positions: new Cesium.CallbackProperty(function () {
					return $this._positions
				}, false),
				clampToGround: true,
				material: new Cesium.Color(0.1, 0.5, 0.9, 0.4),
				width: 2
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