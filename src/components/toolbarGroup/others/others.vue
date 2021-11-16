import {Viewer} from "cesium";import Cesium from "cesium";
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
  import * as Cesium from "cesium";
  import {inject, ref} from "vue";
  import interaction from '@/utils/vue-utils/keyboardInteraction/index';
  import Tool from '../tool.vue'

  // 配置文件模块
  const CAMERA_TUTORIAL = "视角漫游";
  
  const otherTools = ref([
    { name: CAMERA_TUTORIAL, icon:"icon-Pointer" },
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
    }
  }

  function stopFunction(toolName) {
    switch (toolName) {
      case CAMERA_TUTORIAL:
        endTutorial();
        break;
    }
  }

  let _viewer:{ viewer: Cesium.Viewer };

  let _interaction: interaction;
  function startTutorial() {
    _interaction = new interaction(_viewer.viewer);
    _interaction.onClockTick(_viewer.viewer)
  }
  function endTutorial() {
    _interaction && _interaction.removeAllEventAndHandler(_viewer.viewer);
  }
  
  export default {
    setup() {
      const injectViewer: {viewer: Cesium.Viewer} | undefined = inject('_viewer');
      if(!injectViewer) {
        throw Error("provide/inject失败");
      }
      _viewer = injectViewer;
      return {
        otherTools,
        activedTool,
        onToolActive
      }
    },
    components: {
      Tool
    }
  }
</script>

<style  lang="scss" scoped>
  .plotting {
    width: 100%;
    height: 100%;
  }
</style>