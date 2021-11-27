<!--
 * @Date: 2021-07-26 19:22:58
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-09-27 22:27:58
 * @FilePath: \cesium-web-vue\src\views\sandcastleExample\Weather.vue
-->
<template>
  <div class="Weather">
    <div id="cesiumContainer"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import * as Cesium from 'cesium';
let viewer: Cesium.Viewer
let rainParticleSize: number
let rainRadius: number
let rainGravityScratch: Cesium.Cartesian3
let rainSystem: Cesium.ParticleSystem
let rainImageSize: Cesium.Cartesian2
export default defineComponent({
  setup() {
    onMounted(() => {
      viewer = configMap();
      var resetCameraFunction = function () {
        viewer.scene.camera.setView({
          destination: new Cesium.Cartesian3(
            277096.634865404,
            5647834.481964232,
            2985563.7039122293
          ),
          orientation: {
            heading: 4.731089976107251,
            pitch: -0.32003481981370063,
          },
        });
      };
      resetCameraFunction();
      const rainSystemIns = new createRainSystem();
      console.log('rainSystem :>> ', rainSystem);
      viewer.scene.primitives.add(rainSystem)

      
    })

    return
  }
})

function configMap(): Cesium.Viewer {
  const _viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: true,
    terrainProvider: Cesium.createWorldTerrain(),
  });
  _viewer.scene.globe.depthTestAgainstTerrain = true;
  return _viewer
}


class createRainSystem {

  constructor() {
    rainParticleSize = 15.0;
    rainRadius = 100000.0;
    rainImageSize = new Cesium.Cartesian2(
      rainParticleSize,
      rainParticleSize * 2.0
    );
    rainGravityScratch = new Cesium.Cartesian3(1, 1, 1);
    this.initSystem();
  }
  initSystem() {
    rainSystem = new Cesium.ParticleSystem({
      modelMatrix: Cesium.Matrix4.fromTranslation(
        viewer.scene.camera.position
      ),
      speed: -1.0,
      lifetime: 15.0,
      emitter: new Cesium.SphereEmitter(rainRadius),
      startScale: 1.0,
      endScale: 0.0,
      image: "image/circular_particle.png",
      emissionRate: 9000.0,
      startColor: new Cesium.Color(0.27, 0.5, 0.7, 0.0),
      endColor: new Cesium.Color(0.27, 0.5, 0.7, 0.98),
      imageSize: rainImageSize,
      updateCallback: this.rainUpdate,
    })
  }
  rainUpdate(particle: Cesium.Particle, dt: number) {
    rainGravityScratch = Cesium.Cartesian3.normalize(
      particle.position,
      rainGravityScratch
    );
    rainGravityScratch = Cesium.Cartesian3.multiplyByScalar(
      rainGravityScratch,
      -1050.0,
      rainGravityScratch
    );
    particle.position = Cesium.Cartesian3.add(
      particle.position,
      rainGravityScratch,
      particle.position
    );

    const distance = Cesium.Cartesian3.distance(
      viewer.scene.camera.position,
      particle.position
    );
    if (distance > rainRadius) {
      particle.endColor.alpha = 0.0;
    } else {
      particle.endColor.alpha =
        rainSystem.endColor.alpha / (distance / rainRadius + 0.1);
    }
  }
}



</script>

<style lang="scss" scoped>
.Weather {
  width: 100%;
  height: 100%;
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }
}
</style>