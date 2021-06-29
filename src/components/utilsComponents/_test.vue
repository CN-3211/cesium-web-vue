<!--
 * @Date: 2021-06-05 14:02:53
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-18 10:25:01
 * @FilePath: \cesium-web-vue\src\components\utilsComponents\test.vue
-->
<template>
  <div :id="props.id" class="cesium-map" ></div>
</template>

<script lang="ts">
import { onMounted, defineComponent, ExtractPropTypes } from 'vue'
import { Viewer } from 'cesium';
import defaultViewerProps from '../viewer/defaultViewerProps';


export default defineComponent({
  props: defaultViewerProps,
  emits: ["ready"],
  setup(props:ExtractPropTypes<typeof defaultViewerProps>, { emit }) {
    onMounted(() => {
      const { id, ...options } = props
      const viewer:Viewer = new Viewer(id, options);
      emit("ready", viewer);
    })
    return {
      props
    }

    // 返回空函数的话无法创建组件，为什么？
    // return () => {
    //   const children = [];

    // }
  }
})
</script>

<style lang="scss" scoped>
.cesium-map {
  width: 100%;
  height: 100%;
  cursor: auto !important;
}
</style>