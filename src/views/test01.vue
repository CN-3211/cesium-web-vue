<!--
 * @Date: 2021-06-29 09:47:26
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-07 16:29:04
 * @FilePath: \cesium-web-vue\src\views\test01.vue
-->
<template>
  <div class="test">
    <div id="cesiumContainer"></div>
    <div id="ThreeContainer"></div>
  </div>
</template>

<script>
import { defineComponent, onMounted } from "vue";
import { pageload } from './test01_script/combine.ts';

export default defineComponent({
  setup() {
    onMounted(() => {
      pageload();
    });
  },
});

</script>

<style lang="scss" scoped>
.test {
  width: 100%;
  height: 100%;

  #cesiumContainer{
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    margin: 0;
    overflow: hidden;
    padding: 0;
    font-family: sans-serif;
  }

  #ThreeContainer{
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    margin: 0;
    overflow: hidden;
    padding: 0;
    font-family: sans-serif;
    pointer-events:none;
  }
}
</style>