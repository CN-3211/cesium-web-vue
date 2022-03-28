<template>
  <div class="plotting">
    <el-row>
      <el-col :span="8" v-for="item in plottingTools" :key="item">
        <Tool :name="item.name" :icon="item.icon" :isActive="item.name === activedTool" @click="onToolActive(item)"></Tool>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
  import { ref, inject } from "vue";
  import type { CesiumRef } from '@/@types/index';
  import { CESIUM_REF_KEY } from '@/libs/cesium-vue';

  import { ElMessage } from 'element-plus'
  import Tool from '../tool.vue'
  
  import { DrawPolyline, DrawPolygon, DrawBillboard, CESIUM_3D_TILE, TERRAIN } from "@/utils/vue-utils/draw/drawUtils";
  
  // 配置文件模块
  const PLOT_POINTER = "标记点";
  const PLOT_POLYLINE = "贴地线";
  const PLOT_POLYGON = "贴地面";
  
  const plottingTools = ref([
    { name: PLOT_POINTER, icon:"icon-Pointer" },
    { name: PLOT_POLYLINE, icon:"icon-polyline" },
    { name: PLOT_POLYGON, icon:"icon-xuanmianmianji" }
  ]);
  
  const cesiumRef = inject<CesiumRef>(CESIUM_REF_KEY);
  if (!cesiumRef || !cesiumRef.viewer) {
    throw new Error('No cesium reference exist.')
  }
  const viewer = cesiumRef.viewer;
  
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
      case PLOT_POLYLINE:
        drawPolyline();
        break;
      case PLOT_POINTER:
        drawBillboard();
        break;
      case  PLOT_POLYGON:
        drawPolygon();
        break;
    }
  }
  
  function stopFunction(toolName) {
    switch (toolName) {
      case PLOT_POLYLINE:
        stopPolyline();
        break;
      case PLOT_POINTER:
        stopBillboard();
        break;
      case  PLOT_POLYGON:
        stopPolygon();
        break;
    }
  }
  

  
  let DrawPolylineIns:DrawPolyline|undefined;
  const drawPolyline = ():void => {

    DrawPolylineIns = new DrawPolyline(viewer);
    /** 要支持连续绘制 */
    DrawPolylineIns.startCreate();
    /** 要支持连续绘制 */
  };
  const stopPolyline = () => {
    DrawPolylineIns && DrawPolylineIns.stopDrawing();
    DrawPolylineIns = undefined;
  };
  
  let DrawPolygonIns: DrawPolygon|undefined;
  const drawPolygon = () => {
    DrawPolygonIns = new DrawPolygon(viewer);
    DrawPolygonIns.startCreate();
  };
  const stopPolygon = () => {
    DrawPolygonIns && DrawPolygonIns.stopDrawing();
    DrawPolygonIns = undefined;
  };

  let DrawBillboardIns: DrawBillboard|undefined;
  const drawBillboard = () => {
    DrawBillboardIns = new DrawBillboard(viewer);
    DrawBillboardIns.startCreate();
  };
  const stopBillboard = () => {
    DrawBillboardIns && DrawBillboardIns.stopDrawing();
    DrawBillboardIns = undefined;
  };
</script>

<style  lang="scss" scoped>
  .plotting {
    width: 100%;
    height: 100%;
  }
</style>