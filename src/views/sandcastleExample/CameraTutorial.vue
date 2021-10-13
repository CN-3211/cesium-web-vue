<!--
 * @Date: 2021-06-29 09:47:26
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-10-13 15:19:06
 * @FilePath: \cesium-web-vue\src\views\sandcastleExample\CameraTutorial.vue
-->
<template>
  <div class="sandCameraTutorial">
    <div id="cesiumContainer"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { createHandler } from '@/utils/c-utils';
import interaction from '@/utils/vue-utils/keyboardInteraction/index';
import * as Cesium from 'cesium';

export default defineComponent({
  setup() {
    onMounted(() => {
      initConfigMap()
    })
  },
});


/*--------------------------------*/
function initConfigMap() {
  const viewer = new Cesium.Viewer("cesiumContainer");
  
  const _interaction = new interaction(viewer)
  _interaction.onClockTick(viewer)
}


</script>

<style lang="scss" scoped>
.sandCameraTutorial {
  width: 100%;
  height: 100%;
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }
}
</style>