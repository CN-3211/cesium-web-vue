<!--
 * @Date: 2021-06-29 09:47:26
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-01-08 22:36:56
 * @FilePath: /cesium-web-vue/src/views/test01.vue
-->
<template>
  <div class="test01">
    <Viewer></Viewer>
  </div>
</template>

<script lang="ts" setup>
import Viewer from '@/Dcomponents/Viewer/index.vue';
</script>

<style lang="scss" scoped>
.test01 {
  width: 100%;
  height: 100%;
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }
}
</style>