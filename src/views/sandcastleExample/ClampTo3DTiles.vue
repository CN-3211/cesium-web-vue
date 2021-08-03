<!--
 * @Date: 2021-06-29 09:47:26
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-21 09:43:42
 * @FilePath: \cesium-web-vue\src\views\sandcastleExample\sandClampTo3DTiles.vue
-->
<template>
  <div class="sandClampTo3DTiles">
    <div id="cesiumContainer"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import * as Cesium from "cesium";

export default defineComponent({
  setup() {
    onMounted(() => {
      const viewer = initConfigMap();
      loadTileset(viewer);
      createEntities(viewer);
    });
  },
});

function initConfigMap(): Cesium.Viewer {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: Cesium.createWorldTerrain(),
  });
  viewer.resolutionScale = 2.0;

  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.enableLighting = true;

  viewer.clock.startTime = Cesium.JulianDate.now();
  viewer.clock.currentTime = viewer.clock.startTime.clone();
  viewer.clock.stopTime = Cesium.JulianDate.addSeconds(
    viewer.clock.startTime,
    10,
    new Cesium.JulianDate()
  );
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
  viewer.clock.shouldAnimate = true;

  viewer.camera.setView({
    destination: new Cesium.Cartesian3(
      1216403.8845586285,
      -4736357.493351395,
      4081299.715698949
    ),
    orientation: new Cesium.HeadingPitchRoll(
      4.2892217081808806,
      -0.4799070147502502,
      6.279789177843313
    ),
    endTransform: Cesium.Matrix4.IDENTITY,
  });

  return viewer;
}

function loadTileset(viewer: Cesium.Viewer) {
  viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: Cesium.IonResource.fromAssetId(40866),
    })
  );
}

function createEntities(viewer: Cesium.Viewer) {
  const polyline = viewer.entities.add({
    polyline: {
      positions: [
        new Cesium.Cartesian3(
          1216348.1632364073,
          -4736348.958775471,
          4081284.5528982095
        ),
        new Cesium.Cartesian3(
          1216369.1229444197,
          -4736377.467107148,
          4081240.888485707
        ),
      ],
      clampToGround: true,
    },
  });

  const orientation = new Cesium.Quaternion(
    0.3084011337938999,
    0.3210181022701266,
    -0.45850421987074924,
    0.7686388857813198
  ) as unknown as Cesium.Property;
  const SPP = setTruckPosition(viewer);
  const truck = viewer.entities.add({
    position: SPP,
    orientation: orientation,
    model: {
      uri: "glb/CesiumMilkTruck/CesiumMilkTruck.glb",
    },
  });

  viewer.scene.postRender.addEventListener(
    (scene: Cesium.Scene, time: Cesium.JulianDate) => {
      const position = SPP.getValue(time);
      truck.position = new Cesium.ConstantPositionProperty(
        viewer.scene.clampToHeight(position, [truck])
      );
    }
  );
}

function setTruckPosition(
  viewer: Cesium.Viewer
): Cesium.SampledPositionProperty {
  const SPP = new Cesium.SampledPositionProperty();
  const position1 = new Cesium.Cartesian3(
    1216348.1632364073,
    -4736348.958775471,
    4081284.5528982095
  );
  const position2 = new Cesium.Cartesian3(
    1216369.1229444197,
    -4736377.467107148,
    4081240.888485707
  );
  SPP.addSample(viewer.clock.startTime, position1);
  SPP.addSample(viewer.clock.stopTime, position2);
  SPP.setInterpolationOptions({
    interpolationDegree: 2,
    interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
  });
  return SPP;
}
</script>

<style lang="scss" scoped>
.sandClampTo3DTiles {
  width: 100%;
  height: 100%;
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }
}
</style>