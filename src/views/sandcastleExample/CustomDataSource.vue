<!--
 * @Date: 2021-07-26 19:22:58
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-27 19:07:28
 * @FilePath: \cesium-web-vue\src\views\sandcastleExample\CustomDataSource.vue
-->
<template>
  <div class="CustomDataSource">
    <div id="cesiumContainer"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import * as Cesium from 'cesium';
import { createHandler } from '@/utils/c-utils';

export default defineComponent({
  setup() {
    onMounted(() => {
      const viewer = configMap();
      new configModel(viewer)
    })
    return
  }
})

function configMap(): Cesium.Viewer {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    shouldAnimate: true
  });
  return viewer
}

class configModel {
  constructor(viewer: Cesium.Viewer) {
    const CesiumMan = configModel.loadModel(viewer)
    configModel.processModel(viewer, CesiumMan)
  }
  private static loadModel(viewer: Cesium.Viewer): Cesium.Entity {
    const CesiumMan = viewer.entities.add({
      name: 'CesiumMan',
      position: Cesium.Cartesian3.fromDegrees(-123.0744619, 44.0503706),
      model: {
        uri: "glb/CesiumMan/Cesium_Man.glb"
      }
    })
    viewer.trackedEntity = CesiumMan;

    return CesiumMan
  }
  private static processModel(viewer: Cesium.Viewer, CesiumMan: Cesium.Entity) {
    const fragmentShaderSource = 
    ` uniform sampler2D colorTexture;
      uniform float gradations;
      
      varying vec2 v_textureCoordinates;
      
      void main(void)
      {
          vec3 rgb = texture2D(colorTexture, v_textureCoordinates).rgb;
      #ifdef CZM_SELECTED_FEATURE
          if (czm_selected()) {
              float luminance = czm_luminance(rgb);
              float darkness = luminance * gradations;
              darkness = (darkness - fract(darkness)) / gradations;
              gl_FragColor = vec4(vec3(darkness), 1.0);
              return;
          }
      #endif
          gl_FragColor = vec4(rgb, 1.0);
      }
      `
    const stage = viewer.scene.postProcessStages.add(new Cesium.PostProcessStage({
      name: "czm_black_and_white",
      fragmentShader: fragmentShaderSource,
      uniforms: {
        gradations: 5.0,
      },
    }))

    createHandler(viewer.canvas, (movement) => {
      const pick = viewer.scene.pick(movement.position);
      if(Cesium.defined(pick)) {
        stage.selected = [pick.primitive]
      } else {
        stage.selected = []
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }
}



</script>

<style lang="scss" scoped>
.CustomDataSource{
  width: 100%;
  height: 100%;
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }
}
</style>