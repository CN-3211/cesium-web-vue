<!--
 * @Date: 2022-03-28 10:24:46
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 21:44:57
 * @FilePath: /cesium-web-vue/src/components/viewer/index.vue
-->
<template>
  <HViewer :infoBox="false" @loaded="onViewerLoaded"></HViewer>
</template>

<script lang="ts" setup>
import * as Cesium from 'cesium';
import { ref, inject, onMounted, getCurrentInstance } from 'vue';

import type { CesiumRef } from '@/@types/index';
import { CESIUM_REF_KEY } from '@/libs/cesium-vue';
import transform from "@/utils/vue-utils/transform/transform";
import HViewer from '@/components/viewer/hViewer.vue'

import { LOADED_EVENT } from './constant';

const ins = getCurrentInstance()

const cesiumRef = inject<CesiumRef>(CESIUM_REF_KEY);
if (!cesiumRef) {
  throw new Error('No cesium reference exist.')
}

let tmp_viewer:Cesium.Viewer;
let tileset:undefined | Cesium.Cesium3DTileset;
let tileset2:undefined | Cesium.Cesium3DTileset;

// 判断Viewer组件是否准备完毕
const isMapReady = ref(false);

onMounted(() => {
  // 暂时用不了defineEmits，不知道为什么，下次更换项目用vite和vue3.2+再试试
  // const loaded = defineEmits([LOADED_EVENT]);
  ins?.emit(LOADED_EVENT, cesiumRef.viewer)
})

const onViewerLoaded = (viewer: Cesium.Viewer) => {
  
  tmp_viewer = viewer;
  // 修改ready状态并绑定provide值
  isMapReady.value = true;
  cesiumRef.viewer = viewer;

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
</script>