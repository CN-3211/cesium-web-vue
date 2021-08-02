<!--
 * @Date: 2021-06-02 17:39:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-08-02 21:14:51
 * @FilePath: \cesium-web-vue\src\views\draw.vue
-->
<template>
  <div class="draw">
    <div id="cesiumContainer"></div>
    <div class="btn" @click="drawPolyline">绘制线</div>
    <div class="btn2" @click="clearPolyline">清除线</div>
    <div class="btn3" @click="drawPolygon">绘制面</div>
    <div class="btn4" @click="clearPolygon">清除面</div>
  </div>
</template>

<script lang="ts">
import { reactive, onMounted } from 'vue';

import { DrawPolyline, DrawPolygon } from "@/utils/vue-utils/draw/drawUtils";
import * as Cesium from 'cesium';
export default {
  // setup返回值应该怎么定义类型
  setup() {
    let viewer:Cesium.Viewer;
    let DrawPolylineIns:DrawPolyline|undefined;
    let DrawPolygonIns:DrawPolygon|undefined;

    const state = reactive({
      
    });
    onMounted(() => {
      viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: Cesium.createWorldTerrain()
      })
    })

    const drawPolyline = ():void => {
      DrawPolylineIns = new DrawPolyline(viewer);
      DrawPolylineIns.startCreate()
    }

    const clearPolyline = () => {
      if(DrawPolylineIns) {
        DrawPolylineIns.destroy()
      }
      DrawPolylineIns = undefined;
    }

    const drawPolygon = ():void => {
      DrawPolygonIns = new DrawPolygon(viewer);
      DrawPolygonIns.startCreate()
    }

    const clearPolygon = () => {
      if(DrawPolygonIns) {
        DrawPolygonIns.destroy()
      }
      DrawPolygonIns = undefined;
    }

    return {
      drawPolyline,
      clearPolyline,
      drawPolygon,
      clearPolygon
    }
  }
};
</script>
<style lang="scss" scoped>
.draw {
  width: 100%;
  height: 100%;
  position: relative;
  
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }

  .btn, .btn2, .btn3, .btn4 {
    position: absolute;
    top: 10px;
    left: 10px;
    width: 80px;
    height: 25px;
    line-height: 25px;
    text-align: center;
    color: white;
    cursor: pointer;
    background-color: rgba(255, 0, 0, 0.8);
    border-radius: 25px;
    border: 1px white;
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
}
</style>