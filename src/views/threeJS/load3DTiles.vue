<!--
 * @Date: 2021-07-22 08:54:54
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-22 13:45:09
 * @FilePath: \cesium-web-vue\src\views\threeJS\load3DTiles.vue
-->
<template>
  <div class="load3DTiles" id="load3DTiles"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import * as THREE from 'three';
import { initScene, threeElements } from './initScene';
import { TilesRenderer } from '3d-tiles-renderer';

export default defineComponent({
  setup() {
    onMounted(() => {
      const container:HTMLElement|null = document.getElementById("load3DTiles");
      const SCRC: threeElements = initScene(container);
      const { scene, camera, renderer, controls } = SCRC;
      const helper = new THREE.CameraHelper( camera );
      scene.add( helper );

      const tilesRenderer = new TilesRenderer("3DTiles/data/tileset.json");
      // const tilesRenderer = new TilesRenderer("3DTiles/tileset/tileset.json");
      tilesRenderer.setCamera( camera );
      tilesRenderer.setResolutionFromRenderer( camera, renderer );
      scene.add( tilesRenderer.group );

      
      animate(renderer, scene, camera, tilesRenderer)
    })
    
    return
  }
})



function animate(renderer: THREE.Renderer, scene: THREE.Scene, camera: THREE.Camera, tilesRenderer: TilesRenderer):void {
  requestAnimationFrame(() => animate(renderer, scene, camera, tilesRenderer));

  camera.updateMatrixWorld();
	tilesRenderer.update();
  renderer.render( scene, camera );
}
</script>

<style lang="scss" scoped>
.load3DTiles{
  width: 100%;
  height: 100%;
}
</style>