<!--
 * @Date: 2021-06-05 14:02:53
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-12 09:49:18
 * @FilePath: \cesium-web-vue\src\components\viewer\hViewer.vue
-->

<script lang="ts">
import { onMounted, defineComponent, ExtractPropTypes, h, reactive } from 'vue'
import { Viewer } from 'cesium';
import defaultViewerProps from './defaultViewerProps';


export default defineComponent({
  props: defaultViewerProps,
  emits: ["ready"],
  setup(props:ExtractPropTypes<typeof defaultViewerProps>, { emit }) {
    onMounted(() => {
      const { id, ...options } = reactive(props);
      const viewer:Viewer = new Viewer(id, options);
      viewer.cesiumWidget.creditContainer.remove();
      emit("ready", viewer);
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