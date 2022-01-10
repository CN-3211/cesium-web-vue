<!--
 * @Date: 2022-01-08 22:20:54
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-01-10 10:13:53
 * @FilePath: /cesium-web-vue/src/Dcomponents/Viewer/index.vue
-->
<template>
  <div id="viewer-container" class="viewer-container">
    <slot></slot>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Viewer'
}
</script>

<script lang="ts" setup>
  import { getCurrentInstance, onMounted } from 'vue';
  const ins = getCurrentInstance()
  if(!ins) {
    throw new Error("ins 不存在")
  }
  const DC = ins.appContext.config.globalProperties.$DC
  onMounted(() => {
  console.log('DC :>> ', DC);
    DC.ready(() => {
      const viewer = new DC.Viewer('viewer-container')
    })
  })
  
</script>

<style lang="scss" scoped>
.viewer-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
