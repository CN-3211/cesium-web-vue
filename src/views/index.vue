<!--
 * @Date: 2021-06-02 17:39:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 21:53:03
 * @FilePath: /cesium-web-vue/src/views/index.vue
-->
<template>
  <div class="index" id="mapContainer">
    <Viewer @loaded="onLoaded"></Viewer>
    <ToolbarGroup  v-if="isMapReady" class="toolbar-group" @onEdit3Dtiles="onEdit3Dtiles"></ToolbarGroup>
    <Control3DTiles v-if="selectedTileset" :selectedTileset="selectedTileset"></Control3DTiles>
    <MapInfo v-if="isMapReady"></MapInfo>

   <!-- <el-button class="btn btn-1" @click="flyToCity">城市模型</el-button>
   <el-button class="btn btn-2" type="primary" @click="flyToGModel">地质模型</el-button> -->
  </div>
</template>

<script lang="ts" setup>
import { ref, inject } from 'vue';
import type { Ref } from 'vue'

import type { CesiumRef } from '@/@types/index';
import { CESIUM_REF_KEY } from '@/libs/cesium-vue';
import Viewer from '@/components/viewer/index.vue'
import MapInfo from '@/components/mapInfo/mapInfo.vue'
import Control3DTiles from '@/components/ToolInfoControl/control3DTiles.vue';

import ToolbarGroup from '@/components/toolbarGroup/toolbarGroup.vue';
import * as Cesium from 'cesium';

const cesiumRef = inject<CesiumRef>(CESIUM_REF_KEY);
if (!cesiumRef) {
  throw new Error('No cesium reference exist.')
}
// let tileset:undefined | Cesium.Cesium3DTileset;
// let tileset2:undefined | Cesium.Cesium3DTileset;
// 判断Viewer组件是否准备完毕
const isMapReady = ref(false);

/** selectedTileset赋值开始 */
let selectedTileset: Ref<Cesium.Cesium3DTileset | undefined> = ref(undefined);
const onEdit3Dtiles = tileset => {
  selectedTileset.value = tileset;
}
/** selectedTileset赋值结束 */


const onLoaded = () => {
  isMapReady.value = true
}
/** 按钮跳转开始 */
// const flyToCity = () => {
//   if(tileset2) {
//     _viewer.viewer?.flyTo(tileset2)
//   }
// }
// const flyToGModel = () => {
//   if(tileset) {
//     // _viewer.viewer?.flyTo(tileset)
//   }
// }
/** 按钮跳转结束 */

</script>
<style lang="scss">


.index {
  width: 100%;
  height: 100%;
  position: relative;
  .chart_panel {
  width: calc(100% - 220px);
  height: 200px;
  color: #fff;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  padding: 10px 15px;
  border: 1px solid rgba(128, 128, 128, 0.5);
  border-radius: 4px;
  box-shadow: '0 3px 14px rgb(128 128 128 / 50%)';
  position: absolute;
  top: auto;
  left: 100px;
  right: 100px;
  bottom: 30px;
  .chart_container {
    width: 100%;
    height: 100%;
  }
}
  .toolbar-group {
    position: absolute;
    top: 10px;
    left: 10px;
  }
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }

  .btn {
    position: absolute;
    top: 10px;
    right: 120px;
  }
  .btn-2 {
    right: 10px;
  }
  .btn2 {
    top: 45px;
  }
  .btn3 {
    top: 80px;
  }
  .btn4 {
    top: 115px;
  }

  .controlsGroup {
    box-sizing: border-box;
    width: 300px;
    padding: 10px;
    border-radius: 3%;
    position: absolute;
    top: 30px;
    left: 120px;
    background-color: rgba($color: #FFFFFF, $alpha: 0.2);
    .control-switch {
      color: #fff;
    }
    .control-alpha {
      width: 80%;
      margin: 0 auto;
      color: #fff;
    }
  }
}
</style>