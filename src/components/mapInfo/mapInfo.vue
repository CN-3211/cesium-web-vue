<!--
 * @Date: 2021-10-28 22:04:56
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 20:55:54
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
  import { inject, reactive } from "vue";
  import type { CesiumRef } from '@/@types/index';
  import { CESIUM_REF_KEY } from '@/libs/cesium-vue';

  import { pickMousePosition, computeMapScale } from './mapInfo';
  // const infoHandler = new Cesium.ScreenSpaceEventHandler();
  const cesiumRef = inject<CesiumRef>(CESIUM_REF_KEY);
  if (!cesiumRef || !cesiumRef.viewer) {
    throw new Error('No cesium reference exist.')
  }
  const viewer = cesiumRef.viewer;

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