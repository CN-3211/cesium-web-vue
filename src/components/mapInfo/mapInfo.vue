<!--
 * @Date: 2021-10-28 22:04:56
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-11-04 22:02:42
 * @FilePath: \cesium-web-vue\src\components\mapInfo\mapInfo.vue
-->
<template>
  <div class="mapInfo">
    <div class="map-coordinates">
      <!-- <span id='cd_label' style='font-size:13px;text-align:center;font-family:微软雅黑;color:#edffff;'>暂无坐标信息</span> -->
      <span id='cd_label' style='font-size:13px;text-align:center;font-family:微软雅黑;color:#edffff;'>
        经度：{{infos.lng}} 纬度：{{infos.lat}}
        海拔高度：{{infos.height}} 视点高度：{{infos.ViewpointsHeight}}
      </span>
    </div>
  </div>
</template>

<script lang="ts">
  import * as Cesium from "cesium";
  import { inject, reactive } from "vue";

  import { throttle } from '@/utils/index';
  
  /**
   * @description: 
   * @param {*}
   * @return {*}
   */  
  const pick3D = (viewer: Cesium.Viewer, infos: { lng: string, lat:string, height: string, ViewpointsHeight: string }) => {
    console.log('viewer :>> ', viewer.scene.canvas);
    const handler3D = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    const handlerFunc = movement => {
      const pick = new Cesium.Cartesian2(movement.endPosition.x,movement.endPosition.y);
      if(!pick) {
        return
      }
      const cartesian = viewer.scene.globe.pick(viewer.camera.getPickRay(pick), viewer.scene);
      if(!cartesian) {
        return
      }
      const cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      // 经纬度
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      // 海拔
      const height = viewer.scene.globe.getHeight(cartographic);
      // 视点海拔高度
      const ViewpointsHeight = viewer.scene.camera.positionCartographic.height;

      infos.lng = lng ? lng.toFixed(2) + '' : '';
      infos.lat = lat ? lat.toFixed(2) + '' : '';
      infos.height = height ? height.toFixed(2) + '' : '';
      infos.ViewpointsHeight = ViewpointsHeight ? ViewpointsHeight.toFixed(2) + '' : '';
    }

    handler3D.setInputAction(throttle(handlerFunc, 500), Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    
  }
      

  // const infoHandler = new Cesium.ScreenSpaceEventHandler();

  export default {
    setup() {
      const injectViewer: {viewer: Cesium.Viewer} | undefined = inject('_viewer');
      if(!injectViewer) {
        throw Error("provide/inject失败");
      }
      const viewer:Cesium.Viewer = injectViewer.viewer;

      const infos = reactive({
        lat: '',
        lng: '',
        height: '',
        ViewpointsHeight: ''
      })
      pick3D(viewer, infos)

      return {
        infos
      }
    }
  }
</script>

<style lang="scss">
  .mapInfo {
    width: 100%;
    height: 25px;
    line-height: 25px;
    background-color: rgba(0, 0, 0, .5);
    position: absolute;
    bottom: 0;
    right: 0;
  }
</style>