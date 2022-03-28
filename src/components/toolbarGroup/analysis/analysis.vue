<!--
 * @Date: 2021-11-04 21:58:18
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 21:43:53
 * @FilePath: /cesium-web-vue/src/components/toolbarGroup/analysis/analysis.vue
-->
<template>
  <div class="analysis" id="analysis">
    <el-row>
      <el-col :span="8" v-for="item in otherTools" :key="item">
        <Tool
          :name="item.name"
          :icon="item.icon"
          :isActive="item.name === activedTool"
          @click="onToolActive(item)"
        ></Tool>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
  import { inject, ref, watch } from "vue";
  import type { CesiumRef } from '@/@types/index';
  import { CESIUM_REF_KEY } from '@/libs/cesium-vue';

  import Tool from '../tool.vue'
  import { sectionAnalysis, } from './sectionAnalysis';
  import { digTerrainPlan } from './digAnalysis';
  import virtualDrilling from './virtualDrilling';
  import { CESIUM_3D_TILE } from '@/constant/index';

  // 配置文件模块
  const SECTION_ANALYSIS = "剖面分析";
  const TERRAIN_CLIP = "挖方分析";
  const VIRTUAL_DRilling = "虚拟钻孔";

  const otherTools = ref([
    { name: SECTION_ANALYSIS, icon: "icon-poumianxinxi" },
    { name: TERRAIN_CLIP, icon: "icon-wadong" },
    { name: VIRTUAL_DRilling, icon: "icon-wadong" },
  ]);

  const cesiumRef = inject<CesiumRef>(CESIUM_REF_KEY);
  if (!cesiumRef || !cesiumRef.viewer) {
    throw new Error('No cesium reference exist.')
  }

  // 图标高亮模块
  let activedTool = ref('');
  const onToolActive = tool => {
    stopFunction(activedTool.value);
    if (activedTool.value === tool.name) {
      activedTool.value = '';
    } else {
      activedTool.value = tool.name;
      activeFunc(activedTool.value)
    }
  };


  const viewer = cesiumRef.viewer;
  function activeFunc(toolName) {
    switch (toolName) {
      case SECTION_ANALYSIS:
        startSelectSection();
        break;
      case TERRAIN_CLIP:
        startTerrainClip();
        break;
      case VIRTUAL_DRilling:
        startSelectDrill();
        break;
    }
  }

  /** 剖面分析开始 */
  let sectionAnalysisIns: sectionAnalysis | undefined;
  function startSelectSection() {
    sectionAnalysisIns = new sectionAnalysis(viewer, { drawType: CESIUM_3D_TILE });
    sectionAnalysisIns.drawSectionsOnMap()
  }

  function stopSelectSection() {
    sectionAnalysisIns && sectionAnalysisIns.stopDrawing()
    sectionAnalysisIns = undefined;
  }
  /** 剖面分析结束 */

  /** 挖方分析开始 */
  let digTerrainPlanIns: digTerrainPlan | undefined;
  function startTerrainClip() {
    digTerrainPlanIns = new digTerrainPlan(viewer, {
      materials: {
        bottomMaterial: "image/excavate_bottom_min.jpg",
        wallMaterial: "image/excavate_bottom_min.jpg",
      },
      depth: 5000,
      lerpInterval: 50
    });
    digTerrainPlanIns.startClipTerrain()
  }
  function stopTerrainClip() {
    digTerrainPlanIns && digTerrainPlanIns.stopdigTerrainPlan()
    digTerrainPlanIns = undefined
  }
  /** 挖方分析结束 */

  /** 虚拟钻孔开始 */
  let virtualDrillingIns: virtualDrilling | undefined;
  function startSelectDrill() {
    virtualDrillingIns = new virtualDrilling(viewer);
    virtualDrillingIns.startSelectDrill()
  }
  function stopSelectDrill() {
    virtualDrillingIns && virtualDrillingIns.stopSelectDrill()
    virtualDrillingIns = undefined
  }
  /** 虚拟钻孔结束 */



  function stopFunction(toolName) {
    switch (toolName) {
      case SECTION_ANALYSIS:
        stopSelectSection()
        break;
      case TERRAIN_CLIP:
        stopTerrainClip();
        break;
      case VIRTUAL_DRilling:
        stopSelectDrill();
        break;
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