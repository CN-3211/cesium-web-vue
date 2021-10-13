<!--
 * @Date: 2021-06-02 17:39:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-10-13 15:43:02
 * @FilePath: \cesium-web-vue\src\views\index.vue
-->
<template>
  <div class="index">
    <div id="cesiumContainer"></div>
    <div class="btn" @click="drawPolyline">绘制线</div>
    <div class="btn2" @click="drawPolygon">绘制面</div>
    <div class="btn3" @click="clearPolygon">清除绘制</div>

    <div class="controlsGroup">
      <el-button @click="startDig">点击绘制挖掘面</el-button>
      <el-switch v-model="isKeyboardModel" @change="onChangeCameraModel" />
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from 'vue';

import { DrawPolyline, DrawPolygon } from "@/utils/vue-utils/draw/drawUtils";
import transform from "@/utils/vue-utils/transform/transform";
import limitClip from '@/utils/vue-utils/limitGlobe/index';
import TerrainClipPlan from '@/utils/js-utils/terrainClip/TerrainClipPlan';
import interaction from '@/utils/vue-utils/keyboardInteraction/index';
import * as Cesium from 'cesium';
export default {
  // setup返回值应该怎么定义类型
  setup() {
    const isKeyboardModel = ref(false)


    let viewer:Cesium.Viewer;
    let DrawPolylineIns:DrawPolyline|undefined;
    let DrawPolygonIns:DrawPolygon|undefined;

    onMounted(() => {
      viewer = new Cesium.Viewer("cesiumContainer", {
        terrainProvider: Cesium.createWorldTerrain(),
        skyAtmosphere: false
      })
      new limitClip(viewer);

      // viewer.scene.globe.show = false;
      const tileset = new Cesium.Cesium3DTileset({
        url: "3DTiles/hzhnhgeo/tileset.json"
      })
      viewer.scene.primitives.add(tileset);

      /**
       * @description: 模型坐标变换至对应的位置
       * @param {*}
       * @return {*}
       */      
      tileset.readyPromise.then(tileset => {
        let boundingSphereCenter = tileset.boundingSphere.center.clone()
        let modelMatrix = tileset.modelMatrix.clone()
        let trans = new transform(boundingSphereCenter, modelMatrix);
        const tmpMatrix = new Cesium.Matrix4();
        Cesium.Matrix4.multiply(
          trans.translation(109.45966, 31.02833, 0),
          trans.rotation(-9, -6, 79),
          tmpMatrix
        );
        
        tileset.modelMatrix = tmpMatrix;

        viewer.zoomTo(tileset);
      })
    })

    let lastTerrainClip:TerrainClipPlan;
    const startDig = () => {
      // 每次挖地之前清除上一次的贴图和plane
      if (lastTerrainClip) {
        lastTerrainClip.destroy();
      }

      let drawed = new DrawPolygon(viewer);

      drawed.startCreate(DPosition => {
        lastTerrainClip = new TerrainClipPlan(viewer, {
          points: drawed.positions,
          bottomMaterial: "image/excavate_bottom_min.jpg",
          wallMaterial: "image/excavate_bottom_min.jpg",
          height: 100,
          lerpInterval: 50
        })
      });
    }

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

    const onChangeCameraModel = (val) => {
      console.log('val :>> ', val);
      const _interaction = new interaction(viewer);
      if(val) {
        _interaction.onClockTick(viewer)
      } else {
        _interaction.removeAllEventAndHandler(viewer)
      }

    }

    return {
      drawPolyline,
      clearPolyline,
      drawPolygon,
      clearPolygon,
      startDig,
      isKeyboardModel,
      onChangeCameraModel
    }
  }
};


</script>
<style lang="scss" scoped>
.index {
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

  .controlsGroup {
    box-sizing: border-box;
    width: 300px;
    padding: 10px;
    border-radius: 3%;
    position: absolute;
    top: 30px;
    left: 10px;
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