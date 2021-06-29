<!--
 * @Date: 2021-06-02 17:39:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-25 15:08:52
 * @FilePath: \cesium-web-vue\src\views\transform3Dtiles.vue
-->
<template>
  <div class="clip-Model">
    <div id="cesiumContainer"></div>
    <div class="container">
      <div class="slip">
        <span class="demonstration">绕X轴旋转</span>
        <el-slider
          v-model="state.rotateX"
          :min="-180"
          :max="180"
          :show-input="true"
          :show-input-controls="false"
          input-size="mini"
          @input="onChanged"
        ></el-slider>
      </div>
      <div class="slip">
        <span class="demonstration">绕Y轴旋转</span>
        <el-slider
          v-model="state.rotateY"
          :min="-180"
          :max="180"
          :show-input="true"
          :show-input-controls="false"
          input-size="mini"
          @input="onChanged"
        ></el-slider>
      </div>
      <div class="slip">
        <span class="demonstration">绕Z轴旋转</span>
        <el-slider
          v-model="state.rotateZ"
          :min="-180"
          :max="180"
          :show-input="true"
          :show-input-controls="false"
          input-size="mini"
          @input="onChanged"
        ></el-slider>
      </div>
      <div class="adjustPosition">
        <span class="demonstration">经度：</span>
        <el-input-number v-model="state.lng" @change="onChanged" :min="0" :max="180" label="请输入精度" :step="0.001"></el-input-number>
      </div>
      <div class="adjustPosition">
        <span class="demonstration">纬度：</span>
        <el-input-number
          v-model="state.lat"
          :min="0"
          :max="90"
          :step="0.001"
          @change="onChanged"
        ></el-input-number>
      </div>
      <div class="adjustPosition">
        <span class="demonstration">高度：</span>
        <el-input-number
          v-model="state.height"
          @input="onChanged"
        ></el-input-number>
      </div>
      <div class="adjustPosition">
        <span class="demonstration">绘制挖掘面：</span>
        <el-button round @click="onDraw">默认按钮</el-button>
      </div>

      <!-- <div class="slip">
        <span class="demonstration">默认</span>
        <el-slider v-model="value1"></el-slider>
      </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, onMounted } from "vue";

import {
  Matrix4,
  Cartesian3,
  Viewer,
  ScreenSpaceEventHandler,
  Cesium3DTileset,
  Rectangle,
} from "cesium";
import transform from "@/utils/vue-utils/transform/transform";
import DrawPolygon from '@/utils/js-utils/draw/CreatePolygon';
import TerrainClipPlan from '@/utils/js-utils/terrainClip/TerrainClipPlan';
import createWorldTerrain from 'cesium/Source/Core/createWorldTerrain';
import viewerCesium3DTilesInspectorMixin from 'cesium/Source/Widgets/Viewer/viewerCesium3DTilesInspectorMixin';

let tileset: Cesium3DTileset;
let boundingSphereCenter: Cartesian3;
let modelMatrix: Matrix4;
let viewer: Viewer

export default {
  // setup返回值应该怎么定义类型
  setup() {
    const state = reactive({
      rotateX: 17.9,
      rotateY: -7.3,
      rotateZ: 0,
      lng: 109.3062,
      lat: 21.66081,
      height: -500
    });

    onMounted(() => {
      viewer = new Viewer("cesiumContainer", {
      terrainProvider: createWorldTerrain(),
      });
      viewer.scene.globe.depthTestAgainstTerrain = true;
      // viewer.extend(viewerCesium3DTilesInspectorMixin);
      tileset = viewer.scene.primitives.add(
        new Cesium3DTileset({
          // url: "3DTiles/stratum/tileset.json",
          url: "3DTiles/tileset/tileset.json",
        })
      );
      
      tileset.readyPromise.then((tileset) => {
        boundingSphereCenter = tileset.boundingSphere.center.clone()
        modelMatrix = tileset.modelMatrix.clone()
        let trans = new transform(boundingSphereCenter, modelMatrix);
        const tmpMatrix = new Matrix4();
        Matrix4.multiply(
          trans.translation(state.lng, state.lat, state.height),
          trans.rotation(state.rotateX, state.rotateY, state.rotateZ),
          tmpMatrix
        );
        
        tileset.modelMatrix = tmpMatrix;

      });
      viewer.zoomTo(tileset)
    });

    const onChanged = () => {
      let trans = new transform(boundingSphereCenter, modelMatrix);
      let tmpMatrix = new Matrix4();
      Matrix4.multiply(
        trans.translation(state.lng, state.lat, state.height),
        trans.rotation(state.rotateX, state.rotateY, state.rotateZ),
        tmpMatrix
      );

      tileset.modelMatrix = tmpMatrix;
      // viewer.zoomTo(tileset)
    };

    const onDraw = () => {
      let drawed = new DrawPolygon(viewer);
      // drawed.startCreate((digPosition:Cartesian3[]) => {
      //   viewer.scene.globe.translucency.enabled = true;
      //   viewer.scene.globe.translucency.frontFaceAlpha = 0;
      //   viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;

      //   // digPosition为需要裁剪的地形边界
      //   viewer.scene.globe.translucency.rectangle = Rectangle.fromCartesianArray(digPosition)
      // })


      drawed.startCreate(digPosition => {
        new TerrainClipPlan(viewer, {
          points: digPosition,
          bottomMaterial: "image/excavate_bottom_min.jpg",
          wallMaterial: "image/excavate_bottom_min.jpg",
          height: 800,
          lerpInterval: 50
        })
      });
    }

    return {
      state,
      onChanged,
      onDraw
    };
  },
};
</script>
<style lang="scss" scoped>
.clip-Model {
  width: 100%;
  height: 100%;
  position: relative;

  #cesiumContainer {
    width: 100%;
    height: 100%;
  }

  .container {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: white;
    width: 400px;
    padding: 10px 20px;
    border-radius: 20px;
    .adjustPosition {
      display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    align-content: space-between;
    align-items: center;
    }
  }
}
</style>