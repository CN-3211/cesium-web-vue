<!--
 * @Date: 2021-06-02 17:39:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-26 10:17:40
 * @FilePath: \cesium-web-vue\src\views\draw.vue
-->
<template>
  <div class="draw">
    <div id="cesiumContainer"></div>
    <div class="btn" @click="doDraw">点击绘制</div>
    <div class="btn2" @click="doClear">点击清除</div>
  </div>
</template>

<script lang="ts">
import { reactive, onMounted } from 'vue';

import DrawPolyline from "@/utils/vue-utils/draw/createPolyline";
import * as Cesium from 'cesium';
import { createHandler } from '@/utils/c-utils';
export default {
  // setup返回值应该怎么定义类型
  setup() {
    let viewer:Cesium.Viewer;
    let DrawPolylineIns:DrawPolyline|undefined;

    const state = reactive({
      
    });
    onMounted(() => {
      viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: Cesium.createWorldTerrain()
      })
    })

    const doDraw = ():void => {
      if(DrawPolylineIns) {
        console.log("正在绘制！");
        return;
      }
      DrawPolylineIns = new DrawPolyline(viewer);
      DrawPolylineIns.startCreate()
    }

    const doClear = () => {
      if(DrawPolylineIns) {
        DrawPolylineIns.destroy()
      }
      DrawPolylineIns = undefined;
    }

    return {
      doDraw,
      doClear
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

  .btn, .btn2 {
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
}
</style>