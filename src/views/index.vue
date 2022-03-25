<!--
 * @Date: 2021-06-02 17:39:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-01-10 17:31:43
 * @FilePath: /cesium-web-vue/src/views/index.vue
-->
<template>
  <div class="index" id="mapContainer">
    <HViewer :infoBox="false" @ready="onViewerReady"></HViewer>
    <ToolbarGroup  v-if="isMapReady" class="toolbar-group" @onEdit3Dtiles="onEdit3Dtiles"></ToolbarGroup>
    <Control3DTiles v-if="selectedTileset" :selectedTileset="selectedTileset"></Control3DTiles>
    <MapInfo v-if="isMapReady"></MapInfo>

   <el-button class="btn btn-1" @click="flyToCity">城市模型</el-button>
   <el-button class="btn btn-2" type="primary" @click="flyToGModel">地质模型</el-button>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, Ref, provide, reactive, markRaw, defineComponent } from 'vue';

import transform from "@/utils/vue-utils/transform/transform";
import HViewer from '@/components/viewer/hViewer.vue'
import MapInfo from '@/components/mapInfo/mapInfo.vue'
import Control3DTiles from '@/components/ToolInfoControl/control3DTiles.vue';

import ToolbarGroup from '@/components/toolbarGroup/toolbarGroup.vue';
import * as Cesium from 'cesium';
import Cesium3DTilesInspector from 'cesium/Source/Widgets/Cesium3DTilesInspector/Cesium3DTilesInspector';
const isKeyboardModel = ref(false)

let tmp_viewer:Cesium.Viewer;
let tileset:undefined | Cesium.Cesium3DTileset;
let tileset2:undefined | Cesium.Cesium3DTileset;
const _viewer: { viewer: Cesium.Viewer|null } = reactive({ viewer: null });
// 判断Viewer组件是否准备完毕
const isMapReady = ref(false);

const onViewerReady = (viewer: Cesium.Viewer) => {
  tmp_viewer = viewer;
  // 修改ready状态并绑定provide值
  isMapReady.value = true;
  _viewer.viewer = markRaw(viewer);

  viewer.scene.globe.depthTestAgainstTerrain = true;
  // viewer.extend(Cesium.viewerCesium3DTilesInspectorMixin);
  // viewer.scene.globe.show = false;
  viewer.terrainProvider = Cesium.createWorldTerrain()
  // viewer.terrainProvider = new Cesium.CesiumTerrainProvider({
  //   url: "http://localhost:8099/chinaTerrain"
  // })
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
  
  tileset = new Cesium.Cesium3DTileset({
    url: "3DTiles/model3dtiles/tileset.json",
    // cullWithChildrenBounds: false,
    // cullRequestsWhileMoving: false,
    // maximumScreenSpaceError: 1
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
    let trans = new transform(boundingSphereCenter);
    const cartographic = Cesium.Cartographic.fromCartesian(
      tileset.boundingSphere.center
    );
    const surface = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      0.0
    );
    const offset = Cesium.Cartesian3.fromRadians(
      cartographic.longitude,
      cartographic.latitude,
      -2500
    );
    const translation = Cesium.Cartesian3.subtract(
      offset,
      surface,
      new Cesium.Cartesian3()
    );
    tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);

    setTimeout(() => {
      viewer.flyTo(tileset);
    }, 2000);
  })
 
  
  tileset2 = new Cesium.Cesium3DTileset({
    url: Cesium.IonResource.fromAssetId(354759)
  })
  viewer.scene.primitives.add(tileset2);
  
  tileset2.readyPromise.then(tileset => {
    let boundingSphereCenter = tileset.boundingSphere.center.clone()
    let modelMatrix = tileset.modelMatrix.clone()
    let trans = new transform(boundingSphereCenter);
    const tmpMatrix = new Cesium.Matrix4();
    Cesium.Matrix4.multiply(
      trans.translation(109.46266, 31.02533, 200), // -40
      trans.rotation(-107, 0, 128),
      tmpMatrix
    );
    
    tileset.modelMatrix = tmpMatrix;
  })

  const tileset3 = new Cesium.Cesium3DTileset({
    url: "3DTiles/drill_3dtiles/tileset.json",
  })
  // viewer.scene.primitives.add(tileset3);
  
  tileset3.readyPromise.then(tileset => {
    let boundingSphereCenter = tileset.boundingSphere.center.clone()
    let modelMatrix = tileset.modelMatrix.clone()
    let trans = new transform(boundingSphereCenter);
    const tmpMatrix = new Cesium.Matrix4();
    Cesium.Matrix4.multiply(
      trans.translation(113.805972, 27.664014, -1800), // -1800
      trans.rotation(1, 0, 0),
      tmpMatrix
    );
    
    tileset.modelMatrix = tmpMatrix;
    
    // viewer.zoomTo(tileset);
  })

 
};

export default defineComponent({
  // setup返回值应该怎么定义类型
  setup(props, context) {
    provide('_viewer', _viewer);
 
    /** selectedTileset赋值开始 */
    let selectedTileset: Ref<Cesium.Cesium3DTileset | undefined> = ref(undefined);
    const onEdit3Dtiles = tileset => {
      selectedTileset.value = tileset;
    }
    /** selectedTileset赋值结束 */

    /** 按钮跳转开始 */
    const flyToCity = () => {
      if(tileset2) {
        _viewer.viewer?.flyTo(tileset2)
      }
    }
    const flyToGModel = () => {
      if(tileset) {
        _viewer.viewer?.flyTo(tileset)
      }
    }
    /** 按钮跳转结束 */


    return {
      isKeyboardModel,
      isMapReady,
      onViewerReady,
      onEdit3Dtiles,
      selectedTileset,
      flyToCity,
      flyToGModel
    }
  },
  components: {
    ToolbarGroup,
    Control3DTiles,
    HViewer,
    MapInfo
  }
});

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