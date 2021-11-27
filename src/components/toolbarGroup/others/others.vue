<!--
 * @Date: 2021-10-26 21:56:32
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-11-27 09:47:04
 * @FilePath: \cesium-web-vue\src\components\toolbarGroup\others\others.vue
-->
<template>
  <div class="others">
    <el-row>
      <el-col :span="8" v-for="item in otherTools" :key="item">
        <Tool :name="item.name" :icon="item.icon" :isActive="item.name === activedTool" @click="onToolActive(item)"></Tool>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
  import { Cesium3DTileset, Viewer, ScreenSpaceEventHandler } from "cesium";
  import {inject, ref, Ref, defineComponent, watch } from "vue";
  import interaction from '@/utils/vue-utils/keyboardInteraction/index';
  import Tool from '../tool.vue'
  import { selectTileset } from '@/utils/vue-utils/handle3DTiles/index';

  // 配置文件模块
  const CAMERA_TUTORIAL = "键盘漫游";
  const EDIT_3DTILES = "模型编辑";
  
  const otherTools = ref([
    { name: CAMERA_TUTORIAL, icon:"icon-manyou" },
    { name: EDIT_3DTILES, icon:"icon-manyou" },
  ]);

  // 图标高亮模块
  let activedTool = ref('');
  const onToolActive = tool => {
    stopFunction(activedTool.value);
    if(activedTool.value === tool.name) {
      /** 画到一半停了怎么解决 */
      activedTool.value = '';
    
      /** 画到一半停了怎么解决 */
    } else {
      activedTool.value = tool.name;
      activeFunc(activedTool.value)
    }
  };

  // 标绘模块
  function activeFunc(toolName) {
    switch (toolName) {
      case CAMERA_TUTORIAL:
        startTutorial();
        break;
      case EDIT_3DTILES:
        startModelEdit();
        break;
    }
  }

  let _viewer:{ viewer: Viewer };

  /** 键盘漫游开始 */
  let _interaction: interaction;
  function startTutorial() {
    _interaction = new interaction(_viewer.viewer);
    _interaction.onClockTick(_viewer.viewer)
  }
  function stopTutorial() {
    _interaction && _interaction.removeAllEventAndHandler(_viewer.viewer);
  }
  /** 键盘漫游结束 */

  /** 模型编辑开始 */
  let pickHandler: ScreenSpaceEventHandler
  let selectedTileset: Ref<Cesium3DTileset|undefined> = ref(undefined)
  function startModelEdit() {
    pickHandler = selectTileset(_viewer.viewer, tileset => {
      selectedTileset.value = tileset;
    });
  }
  function stopModelEdit() {
    selectedTileset.value = undefined;
    if(pickHandler) {
      pickHandler.destroy()
    }
  }
  /** 模型编辑开始 */

  function stopFunction(toolName) {
    switch (toolName) {
      case CAMERA_TUTORIAL:
        stopTutorial();
        break;
      case EDIT_3DTILES:
        stopModelEdit();
        break;
    }
  }
  
  export default defineComponent({
    setup(props, context) {
      const injectViewer: {viewer: Viewer} | undefined = inject('_viewer');
      if(!injectViewer) {
        throw Error("provide/inject失败");
      }
      _viewer = injectViewer;

      watch(selectedTileset, (val) => {
        context.emit('onEdit3Dtiles', val)
      })
      return {
        otherTools,
        activedTool,
        onToolActive
      }
    },
    components: {
      Tool
    }
  })
</script>

<style  lang="scss" scoped>
  .plotting {
    width: 100%;
    height: 100%;
  }
</style>