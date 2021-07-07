<!--
 * @Date: 2021-07-06 16:14:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-07 16:45:15
 * @FilePath: \cesium-web-vue\src\views\combineThreeAndCesium.vue
-->
<template>
  <div class="combineThreeAndCesium">
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
.combineThreeAndCesium {
  width: 100%;
  height: 100%;
  position: relative;
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