<!--
 * @Date: 2021-07-19 09:55:34
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-19 14:15:26
 * @FilePath: \cesium-web-vue\src\views\sandcastleExample\sandCartographicLimitRectangle.vue
-->
<template>
  <div class="sandCartographicLimitRectangle">
    <div id="cesiumContainer"></div>
  </div>
</template>

<script lang="ts">
import * as Cesium from 'cesium';
import { defineComponent, onMounted } from "vue";

export default defineComponent({
  setup() {
    onMounted(() => {
      const viewer = mapConfig()
      new limitClip(viewer)
    })
    return
  }
})

function mapConfig(): Cesium.Viewer {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    skyAtmosphere: false
  });

  // 关闭背部裁剪，并设置背面颜色全透明
  viewer.scene.globe.backFaceCulling = false
  viewer.scene.globe.undergroundColor = new Cesium.Color(0, 0, 0, 0)
  
  // new Cesium.AxisAlignedBoundingBox(Cesium.Cartesian3.ZERO, new Cesium.Cartesian3(1000000, 1000000, 1000000))
  return viewer
}

class limitClip {
  constructor(viewer: Cesium.Viewer) {
    // limitClip.createGlobeClip(viewer);
    limitClip.useGlobeLimit(viewer)
  }

  /**
   * @description: 通过地形裁剪的方式来切割地球
   * @param {*} viewer
   * @return {*}
   */  
  private static createGlobeClip(viewer: Cesium.Viewer) {
    const clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes: [
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 1.0, 0.0), 4000000.0),
        new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, -1.0, 0.0), 4000000.0),
      ],
      unionClippingRegions: true,
      edgeColor: Cesium.Color.WHITE,
      edgeWidth: 1.0
    })
    viewer.scene.globe.clippingPlanes = clippingPlanes
  }

  private static useGlobeLimit(viewer: Cesium.Viewer) {
    const limitRectangle = Cesium.Rectangle.fromDegrees(-180, -23, 180, 23);
    viewer.scene.globe.cartographicLimitRectangle = limitRectangle;

    // 添加切面边缘
    viewer.entities.add({
      rectangle: {
        fill: false,
        coordinates: limitRectangle,
        outline: true,
        outlineColor: Cesium.Color.WHITE
      }
    })
  }
}
</script>

<style lang="scss" scoped>
.sandCartographicLimitRectangle{
  width: 100%;
  height: 100%;
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }
}
</style>