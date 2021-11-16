<!--
 * @Date: 2021-11-04 21:58:18
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-11-13 15:46:41
 * @FilePath: \cesium-web-vue\src\components\toolbarGroup\analysis\analysis.vue
-->
<template>
  <div class="analysis" id="analysis">
    <el-row>
      <el-col :span="8" v-for="item in otherTools" :key="item">
        <Tool :name="item.name" :icon="item.icon" :isActive="item.name === activedTool" @click="onToolActive(item)"></Tool>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
  import * as Cesium from "cesium";
  import { inject, ref, onMounted, watch } from "vue";
  import Tool from '../tool.vue'
  import { sectionAnalysis } from './sectionAnalysis';

  // 配置文件模块
  const SECTION_ANALYSIS = "剖面分析";
  
  const otherTools = ref([
    { name: SECTION_ANALYSIS, icon:"icon-Pointer" },
  ]);

  // 图标高亮模块
  let activedTool = ref('');
  const onToolActive = tool => {
    stopFunction(activedTool.value);
    if(activedTool.value === tool.name) {
      activedTool.value = '';
    } else {
      activedTool.value = tool.name;
      activeFunc(activedTool.value)
    }
  };


  // 标绘模块
  let viewer: Cesium.Viewer;
  function activeFunc(toolName) {
    switch (toolName) {
      case SECTION_ANALYSIS:
        startSelectSection();
        break;
    }
  }
  let sectionAnalysisIns: sectionAnalysis | undefined;
  function startSelectSection() {
    sectionAnalysisIns = new sectionAnalysis(viewer);
    sectionAnalysisIns.drawSectionsOnMap()
  }

  function stopSelectSection() {
    sectionAnalysisIns && sectionAnalysisIns.stopDrawing()
    sectionAnalysisIns = undefined;
  }

  function stopFunction(toolName) {
    switch (toolName) {
      case SECTION_ANALYSIS:
        stopSelectSection()
        break;
    }
  }
  
  
  export default {
    setup() {
      const injectViewer: {viewer: Cesium.Viewer} | undefined = inject('_viewer');
      if(!injectViewer) {
        throw Error("provide/inject失败");
      }
      viewer = injectViewer.viewer;

      const aaa = ref(0);
    setTimeout(() => {
      aaa.value = 2
    }, 5000);

    watch(aaa, (newVal, oldVal) => {
      console.log('val.length :>> ', newVal);
    })
      // onMounted(()=> {
      //   startSelectSection()
      // })

      // 创建echart
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
  .analysis {
    width: 100%;
    height: 100%;
    .section-chart {
      width: 100%;
      height: 400px;
      position: absolute;
      left: 0;
      bottom: 0;
      z-index: 1000;
    }
  }
</style>