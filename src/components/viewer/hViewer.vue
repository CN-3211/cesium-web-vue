<!--
 * @Date: 2021-06-05 14:02:53
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 16:21:17
 * @FilePath: /cesium-web-vue/src/components/viewer/hViewer.vue
-->

<script lang="ts">
import { onMounted, defineComponent, ExtractPropTypes, h, reactive } from 'vue'
import { Viewer } from 'cesium';
import defaultViewerProps from './defaultViewerProps';

import { LOADED_EVENT } from './constant';


export default defineComponent({
  props: defaultViewerProps,
  setup(props:ExtractPropTypes<typeof defaultViewerProps>, { emit }) {
    onMounted(() => {
      const { id, ...options } = reactive(props);
      // @ts-ignore
      const viewer:Viewer = new Viewer(id, options);
      viewer.cesiumWidget.creditContainer.remove();
      emit(LOADED_EVENT, viewer);
    });
    return () => h('div', {
      id: props.id,
      class: "h-viewer"
    }) 

  }
})
</script>

<style lang="scss" scoped>
.h-viewer {
  width: 100%;
  height: 100%;
  cursor: auto !important;
}
</style>