<!--
 * @Date: 2021-10-28 22:04:56
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-12-28 21:50:00
 * @FilePath: /cesium-web-vue/src/components/mapInfo/mapInfo.vue
-->
<template>
  <div class="mapInfo">
    <div class="map-coordinates">
      <!-- <span id='cd_label' style='font-size:13px;text-align:center;font-family:微软雅黑;color:#edffff;'>暂无坐标信息</span> -->
      <span id='cd_label' style='font-size:13px;text-align:center;font-family:微软雅黑;color:#edffff;'>
        经度：{{infos.lat}} 纬度：{{infos.lat}}
        海拔高度：{{infos.height}} 视点高度：{{infos.ViewpointsHeight}}
        比例尺：{{infos.scale}}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Viewer } from "cesium";
  import { inject, reactive } from "vue";
  import { pickMousePosition, computeMapScale } from './mapInfo';


  // const infoHandler = new Cesium.ScreenSpaceEventHandler();
  const injectViewer: {viewer: Viewer} | undefined = inject('_viewer');
  if(!injectViewer) {
    throw Error("provide/inject失败");
  }
  const viewer:Viewer = injectViewer.viewer;

  const infos = reactive({
    lat: '',
    lng: '',
    height: '',
    ViewpointsHeight: '',
    scale: ''
  })
  pickMousePosition(viewer, infos)
  computeMapScale(viewer, infos)

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