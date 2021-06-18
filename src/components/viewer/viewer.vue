<!--
 * @Date: 2021-06-05 14:02:53
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-18 10:22:49
 * @FilePath: \cesium-web-vue\src\components\viewer\viewer.vue
-->
<template>
  <div :id="props.id" class="viewer" ></div>
</template>

<script lang="ts">
import { onMounted, defineComponent, ExtractPropTypes } from 'vue'
import { Viewer } from 'cesium';
import defaultViewerProps from './defaultViewerProps';


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
.viewer {
  width: 100%;
  height: 100%;
  cursor: auto !important;
}
</style>