<!--
 * @Date: 2021-06-29 09:47:26
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-17 17:59:57
 * @FilePath: \cesium-web-vue\src\views\sandcastleExample\sandCardboard.vue
-->
<template>
  <div class="cardboard">
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
      new configModels(viewer)
    });
  },
});

function initConfigMap(): Cesium.Viewer {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: Cesium.createWorldTerrain(),
  });
  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.enableLighting = true;
  const clock = viewer.clock;

  /* clock配置开始 */
  clock.startTime = Cesium.JulianDate.now();
  clock.currentTime = clock.startTime.clone();
  clock.stopTime = Cesium.JulianDate.addSeconds(
    clock.startTime,
    360,
    new Cesium.JulianDate()
  );
  clock.clockRange = Cesium.ClockRange.LOOP_STOP;
  clock.multiplier = 1.0;
  clock.shouldAnimate = true;
  /* clock配置结束 */
  return viewer
}

/*--------------模型部分开始------------------*/
class configModels {
  private static readonly modelUri: string = "glb/CesiumBalloon.glb";
  private static startTime: Cesium.JulianDate;
  private static modelPosition: { lng: number; lat: number; height: number };
  constructor(viewer: Cesium.Viewer) {
    configModels.startTime = Cesium.JulianDate.now();
    configModels.modelPosition = {
      lng: -112.110693,
      lat: 36.0994841,
      height: 2800,
    };
    const entity = configModels.initModels(viewer);
    configModels.setCamera(entity, viewer)
  }
  private static initModels(viewer: Cesium.Viewer) {
    const entity = viewer.entities.add({
      position: configModels.moveRoute(),
      model: {
        uri: configModels.modelUri,
        // 防止模型太小看不见
        minimumPixelSize: 64,
      },
    });
    return entity
  }

  /**
   * @description: 配置模型绕圆运动
   * @param {*}
   * @return {Cesium.SampledPositionProperty} [SPProperty]
   */  
  private static moveRoute(): Cesium.SampledPositionProperty {
    const SPProperty = new Cesium.SampledPositionProperty();
    let time: Cesium.JulianDate;
    let position: Cesium.Cartesian3;
    let radians: number;
    // 初始方向角度为0，每次旋转固定45度，直至360度旋转一圈
    for (let i = 0; i <= 360; i += 45) {
      radians = Cesium.Math.toRadians(i);
      time = Cesium.JulianDate.addSeconds(
        configModels.startTime,
        i,
        new Cesium.JulianDate()
      );
      // 每次旋转45度，模型所经过的距离在此计算，其中0.05为距离常量，值越大圆的范围越大
      configModels.modelPosition.lng += Math.cos(radians) * 0.05;
      configModels.modelPosition.lat += Math.sin(radians) * 0.05;
      position = Cesium.Cartesian3.fromDegrees(
        configModels.modelPosition.lng,
        configModels.modelPosition.lat,
        configModels.modelPosition.height
      );

      SPProperty.addSample(time, position);
    }
    // 使用插值，使路径更平滑
    SPProperty.setInterpolationOptions({
      interpolationDegree: 2,
      interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
    });
    return SPProperty;
  }
  private static setCamera(entity: Cesium.Entity, viewer: Cesium.Viewer) {
    const camera = viewer.camera;
    camera.position = new Cesium.Cartesian3(-10.25, 0, 0);
    camera.direction = new Cesium.Cartesian3(1.0, 0.0, 0.0);
    camera.up = new Cesium.Cartesian3(0.0, 0.0, 1.0);
    camera.right = new Cesium.Cartesian3(0.0, -1.0, 0.0);

    // scene更新或者渲染结束后执行
    viewer.scene.postUpdate.addEventListener((scene: Cesium.Scene, time: Cesium.JulianDate) => {
      const modelPosition = entity.position?.getValue(time);
      if(!modelPosition) { throw new Error("modelPosition不存在"); }

      const originCameraPosition = Cesium.Cartesian3.clone(camera.position)
      const originCameraUp = Cesium.Cartesian3.clone(camera.up)
      const originCameraRight = Cesium.Cartesian3.clone(camera.right)
      const originCameradDirection = Cesium.Cartesian3.clone(camera.direction)

      const transform = Cesium.Transforms.eastNorthUpToFixedFrame(modelPosition);
      viewer.camera.lookAtTransform(transform);
      // viewer.camera.lookAtTransform(transform, new Cesium.Cartesian3(-10.25, 0, 0));
      Cesium.Cartesian3.clone(originCameraPosition, camera.position);
      Cesium.Cartesian3.clone(originCameraUp, camera.up);
      Cesium.Cartesian3.clone(originCameraRight, camera.right);
      Cesium.Cartesian3.clone(originCameradDirection, camera.direction);
    })
  }
}
/*-------------------模型部分结束------------------*/
</script>

<style lang="scss" scoped>
.cardboard {
  width: 100%;
  height: 100%;
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }
}
</style>