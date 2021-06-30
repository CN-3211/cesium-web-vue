<!--
 * @Date: 2021-06-02 17:39:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-25 18:23:30
 * @FilePath: \cesium-web-vue\src\views\clipModel.vue
-->
<template>
  <div class="clip-Model">
    <HViewer @ready="onViewerReady"></HViewer>
    <div class="container">
      <!-- <el-button @click="clipTop">切顶部</el-button>
      <el-button @click="clipBottom">切底部</el-button>
      <el-button @click="clipEast">切东向</el-button>
      <el-button @click="clipWest">切西向</el-button>
      <el-button @click="clipSouth">切南向</el-button>
      <el-button @click="clipNorth">切北向</el-button> -->
      <div class="block">
        <span class="demonstration">顶部裁剪距离</span>
        <el-slider v-model="state.targetTop" @input="changeTargetTop" :min="-80" :max="150"></el-slider>
      </div>
      <div class="block">
        <span class="demonstration">底部裁剪距离</span>
        <el-slider v-model="state.targetBottom" @input="changeTargetBottom" :min="-80" :max="150"></el-slider>
      </div>
      <div class="block">
        <span class="demonstration">西部裁剪距离</span>
        <el-slider v-model="state.targetWest" @input="changeTargetWest" :min="0" :max="1000"></el-slider>
      </div>
      <div class="block">
        <span class="demonstration">东部裁剪距离</span>
        <el-slider v-model="state.targetEast" @input="changeTargetEast" :min="0" :max="500"></el-slider>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, onMounted, defineComponent } from "vue";

import * as Cesium from "cesium";
import { createClippingPlanes } from "../utils/vue-utils/clipping/clipModel";
import { direction } from '@/constant/index';

import HViewer from '@/components/viewer/hViewer.vue';
import transform from "@/utils/vue-utils/transform/transform";

interface pickedObject {
  id: Cesium.Entity;
  primitive: Cesium.Primitive;
}

let viewer: Cesium.Viewer
let tileset: Cesium.Cesium3DTileset;


export default defineComponent({
  components: {
    HViewer,
  },
  // setup返回值应该怎么定义类型
  setup() {
    const state = reactive({
      targetTop: 150,
      targetBottom: 150,
      targetWest: 0,
      targetEast: 0,
      distance: 0
    });
    const onViewerReady = (_viewer:Cesium.Viewer) => {
      viewer = _viewer;
      viewer.scene.globe.depthTestAgainstTerrain = true;
      tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: "3DTiles/stratum/tileset.json",
          clippingPlanes: createClippingPlanes("All")
        })
      );
    }
    onMounted(() => {
      tileset.readyPromise.then((tileset) => {
        // 模型偏移
        let boundingSphereCenter = tileset.boundingSphere.center.clone()
        let modelMatrix = tileset.modelMatrix.clone()
        let trans = new transform(boundingSphereCenter, modelMatrix);
        const tmpMatrix = new Cesium.Matrix4();
        Cesium.Matrix4.multiply(
          trans.translation(109.3062, 21.66081, 500),
          trans.rotation(17.9, -7.3, 0),
          tmpMatrix
        );
        
        tileset.modelMatrix = tmpMatrix;


      });

      viewer.zoomTo(tileset);
    });

    const clipTop = () => {
      tileset.clippingPlanes = createClippingPlanes(direction.TOP);
    }
    const clipBottom = () => {
      tileset.clippingPlanes = createClippingPlanes(direction.BOTTOM);
    }
    const clipEast = () => {
      tileset.clippingPlanes = createClippingPlanes(direction.EAST);
    }
    const clipWest = () => {
      tileset.clippingPlanes = createClippingPlanes(direction.WEST);
    }
    const clipSouth = () => {
      tileset.clippingPlanes = createClippingPlanes(direction.SOUTH);
    }
    const clipNorth = () => {
      tileset.clippingPlanes = createClippingPlanes(direction.NORTH);
    }
    const changeTargetWest = (val:number) => {
      if(!Cesium.defined(tileset.clippingPlanes)) {
        return
      }
      tileset.clippingPlanes.get(0).distance = val
    }
    const changeTargetEast = (val:number) => {
      if(!Cesium.defined(tileset.clippingPlanes)) {
        return
      }
      tileset.clippingPlanes.get(1).distance = val
    }
    const changeTargetTop = (val:number) => {
      if(!Cesium.defined(tileset.clippingPlanes)) {
        return
      }
      tileset.clippingPlanes.get(2).distance = val
    }
    const changeTargetBottom = (val:number) => {
      if(!Cesium.defined(tileset.clippingPlanes)) {
        return
      }
      tileset.clippingPlanes.get(3).distance = val
    }


    return {
      state,
      clipTop,
      clipBottom,
      clipEast,
      clipWest,
      clipSouth,
      clipNorth,
      changeTargetTop,
      changeTargetBottom,
      changeTargetWest,
      changeTargetEast,
      onViewerReady
    };
  },
  
});

</script>
<style lang="scss" scoped>
.clip-Model {
  width: 100%;
  height: 100%;
  position: relative;

  .container {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: white;
    width: 400px;
    padding: 10px 20px;
    border-radius: 20px;
  }
}
</style>