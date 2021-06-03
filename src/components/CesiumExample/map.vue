<!--
 * @Date: 2021-06-02 17:39:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-03 11:03:10
 * @FilePath: \cesium-web-vue\src\components\CesiumExample\map.vue
-->
<template>
  <div class="map-box">
    <div id="cesiumContainer"></div>
  </div>
</template>

<script> 
import DrawPolyline from '@/utils/vue-utils/draw/createPolyline';
import { Viewer } from "cesium";
export default {
  name: "", 
  mounted() {
    let viewer = new Viewer("cesiumContainer");
    let aaa = new DrawPolyline(viewer);
    aaa.startCreate()
    console.log('aaa :>> ', aaa);
  }
};
</script> 
<style scoped>
  .map-box{
    width: 100%;
    height: 100%;
  }
  #cesiumContainer{
    width: 100%;
    height: 100%;
  }
</style>
