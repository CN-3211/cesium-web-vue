<!--
 * @Date: 2021-06-29 09:47:26
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-29 14:07:02
 * @FilePath: \cesium-web-vue\src\views\test.vue
-->
<template>
  <div class="test">
    <div id="container"></div>
  </div>
</template>

<script>
import { defineComponent, onMounted } from 'vue';
import Simulation from '../scriptComponents/threeClip/Simulation.ts';


export default defineComponent({
  setup() {
    onMounted(() => {
      const divContainer = document.getElementById("container");
      if(!divContainer) return
      new Simulation(divContainer)
    })
  }
})
</script>

<style lang="scss" scoped>
.test {
  width: 100%;
  height: 100%;
  #container {
    width: 100%;
    height: 100%;
  }
}
</style>