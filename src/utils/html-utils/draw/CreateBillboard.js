import { ScreenSpaceEventHandler,defined,ScreenSpaceEventType,HorizontalOrigin,VerticalOrigin, HeightReference} from 'cesium'
import markPath from '@/assets/mark.png'
export default class DrawBillboard {
	constructor(arg) {
		this.objId = Number((new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0));
		this.viewer = arg.viewer;
		this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
		this._position = null;
		this._billboard = null;
	}

	get billboard() {
		return this._billboard;
	}
	get position() {
		return this._position;
	}
	startCreate() {
		var $this = this;
		this.handler.setInputAction(function (evt) { //单击开始绘制
			var cartesian = $this.getCatesian3FromPX(evt.position);
			if (!cartesian) return;
			if(!defined($this._billboard)){
				$this._billboard = $this.createBillboard(cartesian);
				$this.handler.destroy();
			}
		}, ScreenSpaceEventType.LEFT_CLICK);
	}
	createBillboard(cartesian) {
		var billboard = this.viewer.entities.add({
			position: cartesian,
			billboard: {
				image: '../../assets/mark.png',
				// image:markPath,
				scale: 1,
				horizontalOrigin: HorizontalOrigin.CENTER,	//获取或设置此广告牌的水平原点，确定该广告牌是否为在其锚定位置的左侧，中心或右侧。
				verticalOrigin: VerticalOrigin.BOTTOM,		//获取或设置此广告牌的垂直原点，以确定该广告牌是否为到其锚定位置的上方，下方或中心。
				heightReference:HeightReference.CLAMP_TO_GROUND,	//获取或设置此广告牌的高度参考
				disableDepthTestDistance:Number.MAX_VALUE				//获取或设置与相机的距离，在深度处禁用深度测试，例如，以防止剪切地形。设置为零时，将始终应用深度测试。设置为Number.POSITIVE_INFINITY时，永远不会应用深度测试。
			}
		});
		billboard.objId = this.objId;
		return billboard;
	}
	destroy() {
		if (this.handler) {
			this.handler.destroy();
			this.handler = null;
		}
		if (this._billboard) {
			this.viewer.entities.remove(this._billboard);
			this._billboard = null;
		}
		this._position = null;
	}
	getCatesian3FromPX(px) {
		var cartesian;
		console.log(px);
		var ray = this.viewer.camera.getPickRay(px);
		console.log(ray);
		if (!ray) return null;
		cartesian = this.viewer.scene.globe.pick(ray, this.viewer.scene);
		console.log(cartesian);
		let position = this.viewer.scene.pickPosition(px);
		console.log(position);
		return cartesian;
	}
}