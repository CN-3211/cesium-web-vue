<!--
 * @Date: 2021-07-26 12:24:27
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-26 17:03:31
 * @FilePath: \cesium-web-vue\src\views\sandcastleExample\Clustering.vue
-->
<template>
  <div class="Clustering">
    <div id="cesiumContainer"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import usePromise from '@/composables/use-promise';
import * as Cesium from 'cesium';

export default defineComponent({
  setup() {
    onMounted(() => {
      const viewer = configMap()
      loadKmlPoints(viewer)
    })
  }
})

function configMap(): Cesium.Viewer {
  const viewer = new Cesium.Viewer("cesiumContainer")
  return viewer
}

const PIN_CONFIG_MAP = [
  { number: 3, color: Cesium.Color.VIOLET, size: 48 },
  { number: 4, color: Cesium.Color.VIOLET, size: 48 },
  { number: 5, color: Cesium.Color.VIOLET, size: 48 },
  { number: 6, color: Cesium.Color.VIOLET, size: 48 },
  { number: 7, color: Cesium.Color.VIOLET, size: 48 },
  { number: 8, color: Cesium.Color.VIOLET, size: 48 },
  { number: 9, color: Cesium.Color.VIOLET, size: 48 },
  { number: 10, color: Cesium.Color.BLUE, size: 48 },
  { number: 20, color: Cesium.Color.GREEN, size: 48 },
  { number: 30, color: Cesium.Color.YELLOW, size: 48 },
  { number: 40, color: Cesium.Color.ORANGE, size: 48 },
  { number: 50, color: Cesium.Color.RED, size: 48 },
]


async function loadKmlPoints(viewer: Cesium.Viewer) {
  const promise = Cesium.KmlDataSource.load("kml/facilities/facilities.kml", {
      camera: viewer.scene.camera,
      canvas: viewer.scene.canvas
  })
  const dataSource = await viewer.dataSources.add(promise);
  const PIXELRANGE = 15;
  const MINCLUSTERSIZE = 3;
  const ISENABLE = true;

  dataSource.clustering.enabled = ISENABLE;
  dataSource.clustering.minimumClusterSize = MINCLUSTERSIZE;
  dataSource.clustering.pixelRange = PIXELRANGE;

  const pinImgGroup = buildPinImg()
  customStyle(dataSource, pinImgGroup)
}

function buildPinImg() {
  const pinBuilder = new Cesium.PinBuilder()
  const pinImgGroup = {};
  PIN_CONFIG_MAP.forEach(({ number, color, size }) => {
    pinImgGroup[number] = pinBuilder.fromText(number > 9 ? number + '+' : number + '', color, size).toDataURL()
  })
  console.log('pinImgGroup :>> ', pinImgGroup);

  return pinImgGroup
}

function customStyle(dataSource: Cesium.DataSource, pinImgGroup: any) {
  dataSource.clustering.clusterEvent.addEventListener((entities: Cesium.Entity[], cluster: { billboard: Cesium.Billboard, label: Cesium.Label, point: Cesium.PointPrimitive }) => {
    cluster.billboard.show = true;
    cluster.label.show = false;
    cluster.point.show = false;
    if(entities.length > 50) {
      cluster.billboard.image = pinImgGroup[50]
    } else if (entities.length > 40) {
      cluster.billboard.image = pinImgGroup[40]
    } else if(entities.length > 30) {
      cluster.billboard.image = pinImgGroup[30]
    } else if(entities.length > 20) {
      cluster.billboard.image = pinImgGroup[20]
    } else if(entities.length > 10) {
      cluster.billboard.image = pinImgGroup[10]
    } else if(entities.length > 9) {
      cluster.billboard.image = pinImgGroup[9]
    } else if(entities.length > 8) {
      cluster.billboard.image = pinImgGroup[8]
    } else if(entities.length > 7) {
      cluster.billboard.image = pinImgGroup[7]
    } else if(entities.length > 6) {
      cluster.billboard.image = pinImgGroup[6]
    } else if(entities.length > 5) {
      cluster.billboard.image = pinImgGroup[5]
    } else if(entities.length > 4) {
      cluster.billboard.image = pinImgGroup[4]
    } else if(entities.length > 3) {
      cluster.billboard.image = pinImgGroup[3]
    }
  })
}
</script>

<style lang="scss" scoped>
.Clustering{
  width: 100%;
  height: 100%;
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }
}
</style>