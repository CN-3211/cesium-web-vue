<!--
 * @Date: 2021-06-02 17:39:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-11-13 09:54:41
 * @FilePath: \cesium-web-vue\src\views\index.vue
-->
<template>
  <div class="index" id="mapContainer">
    <HViewer @ready="onViewerReady"></HViewer>
    <ToolbarGroup  v-if="isMapReady" class="toolbar-group"></ToolbarGroup>
    <MapInfo v-if="isMapReady"></MapInfo>
    
    <!-- <div class="btn" @click="drawPolyline">绘制线</div>
    <div class="btn2" @click="drawPolygon">绘制面</div>
    <div class="btn3" @click="clearPolygon">清除绘制</div> -->

    <!-- <div class="controlsGroup">
      <el-button @click="startDig">点击绘制挖掘面</el-button>
      <span style="color:red;font-weight: bold;">视角漫游</span><el-switch v-model="isKeyboardModel" @change="onChangeCameraModel" />
    </div> -->
  </div>
</template>

<script lang="ts">
import { onMounted, ref, provide, reactive, markRaw } from 'vue';

import { DrawPolygon } from "@/utils/vue-utils/draw/drawUtils";
import transform from "@/utils/vue-utils/transform/transform";
import limitClip from '@/utils/vue-utils/limitGlobe/index';
import TerrainClipPlan from '@/utils/js-utils/terrainClip/TerrainClipPlan';
import HViewer from '@/components/viewer/hViewer.vue'
import MapInfo from '@/components/mapInfo/mapInfo.vue'

import ToolbarGroup from '@/components/toolbarGroup/toolbarGroup.vue';
import * as Cesium from 'cesium';
const isKeyboardModel = ref(false)

let viewer:Cesium.Viewer;
const _viewer: { viewer: Cesium.Viewer|null } = reactive({ viewer: null });
// 判断Viewer组件是否准备完毕
const isMapReady = ref(false);

const onViewerReady = (viewer: Cesium.Viewer) => {
  
  // 修改ready状态并绑定provide值
  isMapReady.value = true;
  _viewer.viewer = markRaw(viewer);

  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.terrainProvider = Cesium.createWorldTerrain()
  const baseLayer = viewer.scene.globe.imageryLayers.get(0);
  viewer.imageryLayers.remove(baseLayer);
  
  const TDU_Key = "13556b1d4b234ad87a7c50a176f1ee79"//天地图申请的密钥
  
  //在线天地图影像服务地址(墨卡托投影)
  const TDT_IMG_W = "http://{s}.tianditu.gov.cn/img_w/wmts?service=wmts&request=GetTile&version=1.0.0" +
    "&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
    "&style=default&format=tiles&tk=" + TDU_Key;
  
  //在线天地图影像中文标记服务(墨卡托投影)
  const TDT_CIA_W = "http://{s}.tianditu.gov.cn/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0" +
    "&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}" +
    "&style=default.jpg&tk=" + TDU_Key;
  
  const Img = new Cesium.WebMapTileServiceImageryProvider({   //调用影响中文服务
    url: TDT_IMG_W,//url地址
    layer: "img_w",	//WMTS请求的层名称
    style: "default",//WMTS请求的样式名称
    format: "tiles",//MIME类型，用于从服务器检索图像
    tileMatrixSetID: "GoogleMapsCompatible",//	用于WMTS请求的TileMatrixSet的标识符
    subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],//天地图8个服务器
    minimumLevel: 0,//最小层级
    maximumLevel: 18,//最大层级
  });
  viewer.imageryLayers.addImageryProvider(Img);//添加到cesium图层上
  
  const cia = new Cesium.WebMapTileServiceImageryProvider({   //调用影响中文注记服务
    url: TDT_CIA_W,
    layer: "cia_w",
    style: "default",
    format: "tiles",
    tileMatrixSetID: "GoogleMapsCompatible",
    subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],//天地图8个服务器
    minimumLevel: 0,
    maximumLevel: 18,
  });
  viewer.imageryLayers.addImageryProvider(cia);//添加到cesium图层上
  
  
  // new limitClip(viewer);
  
  const tileset = new Cesium.Cesium3DTileset({
    url: "3DTiles/hzhnhgeo/tileset.json"
  });
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
      trans.translation(109.45966, 31.02833, 1000),
      trans.rotation(-9, -6, 79),
      tmpMatrix
    );
    
    tileset.modelMatrix = tmpMatrix;
    
    viewer.zoomTo(tileset);
  })
  
  const tileset2 = new Cesium.Cesium3DTileset({
    url: Cesium.IonResource.fromAssetId(354759)
  })
  // viewer.scene.primitives.add(tileset2);
  
  tileset2.readyPromise.then(tileset => {
    let boundingSphereCenter = tileset.boundingSphere.center.clone()
    let modelMatrix = tileset.modelMatrix.clone()
    let trans = new transform(boundingSphereCenter, modelMatrix);
    const tmpMatrix = new Cesium.Matrix4();
    Cesium.Matrix4.multiply(
      trans.translation(109.46266, 31.02533, -40),
      trans.rotation(-107, 0, 128),
      tmpMatrix
    );
    
    tileset.modelMatrix = tmpMatrix;
    
  })
};

export default {
  // setup返回值应该怎么定义类型
  setup() {
    provide('_viewer', _viewer);
 
    let lastTerrainClip:TerrainClipPlan;
    
    /**  大改，绘制逻辑变了 */
    const startDig = () => {
      // 每次挖地之前清除上一次的贴图和plane
      if (lastTerrainClip) {
        lastTerrainClip.destroy();
      }

      let drawed = new DrawPolygon(viewer);

      drawed.startCreate((DPosition: any) => {
        lastTerrainClip = new TerrainClipPlan(viewer, {
          points: drawed.positions,
          bottomMaterial: "image/excavate_bottom_min.jpg",
          wallMaterial: "image/excavate_bottom_min.jpg",
          height: 100,
          lerpInterval: 50
        })
      });
    }
    /**  大改，绘制逻辑变了 */

    return {
      startDig,
      isKeyboardModel,
      isMapReady,
      onViewerReady
    }
  },
  components: {
    ToolbarGroup,
    HViewer,
    MapInfo
  }
};

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