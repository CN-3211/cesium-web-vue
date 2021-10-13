<!--
 * @Date: 2021-07-14 14:39:23
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-10-11 10:30:27
 * @FilePath: \cesium-web-vue\src\views\digTerrian.vue
-->
<template>
  <div class="digTerrian">
    <div id="cesiumContainer"></div>
    <div class="controlsGroup">
      <el-button @click="startDig"></el-button>
      <el-input v-model="depth.value" placeholder="请指定挖掘深度"></el-input>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import * as Cesium from 'cesium';
import transform from "@/utils/vue-utils/transform/transform";
import { DrawPolygon } from '@/utils/vue-utils/draw/drawUtils';
import TerrainClipPlan from '@/utils/js-utils/terrainClip/TerrainClipPlan';

let viewer: Cesium.Viewer;
let tileset: Cesium.Cesium3DTileset;
export default defineComponent({
  setup(props, ctx) {
    const depth = ref(500);
    onMounted(() => {
      viewer = initMap()
      tileset = initTileset(viewer)
      
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
          height: depth.value,
          lerpInterval: 50
        })
      });
      
    }
    return { startDig, depth }
  }
});

function initMap(): Cesium.Viewer {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: Cesium.createWorldTerrain(),
  });
  viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
  viewer.scene.globe.show = true;

  return viewer
}
function initTileset(viewer: Cesium.Viewer): Cesium.Cesium3DTileset {
  const tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: "3DTiles/north/tileset.json",
    })
  );
  tileset.readyPromise.then((tileset: Cesium.Cesium3DTileset) => {
    const boundingSphereCenter = tileset.boundingSphere.center.clone()
    const modelMatrix = tileset.modelMatrix.clone()
    let trans = new transform(boundingSphereCenter, modelMatrix);
    const tmpMatrix = new Cesium.Matrix4();
    Cesium.Matrix4.multiply(
      trans.translation(109.3062, 21.66081, 5000),
      trans.rotation(17.9, -7.3, 0),
      tmpMatrix
    );
    
    tileset.modelMatrix = tmpMatrix;

  });

  viewer.zoomTo(tileset);

  return tileset
}
</script>

<style lang="scss" scoped>
.digTerrian {
  width: 100%;
  height: 100%;
  position: relative;
  #cesiumContainer {
    width: 100%;
    height: 100%;
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