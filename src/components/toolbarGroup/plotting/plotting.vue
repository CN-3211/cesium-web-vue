<template>
  <div class="plotting">
    <el-row :gutter="20">
      <el-col :span="8" v-for="item in plottingTools" :key="item">
        <div class="plotting-item" @click="onToolActive(item)">
          <div class="iconfont" :class="activedTool === item.name ? `iconfontActive ${item.icon}` : item.icon">
          </div>
          <div class="plotting-item-name" :class="activedTool === item.name && 'plottingItemNameActive'">{{item.name}}</div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
  import {ref, defineComponent, inject, onMounted, Ref, unref, watch, reactive} from "vue";
  import Cesium, { Viewer } from 'cesium';
  import { ElMessage } from 'element-plus'
  
  import { DrawPolyline, DrawPolygon, DrawBillboard } from "@/utils/vue-utils/draw/drawUtils";
  
  // 配置文件模块
  const PLOT_POINTER = "标记点";
  const PLOT_POLYLINE = "贴地线";
  const PLOT_POLYGON = "贴地面";
  
  const plottingTools = ref([
    { name: PLOT_POINTER, icon:"icon-Pointer" },
    { name: PLOT_POLYLINE, icon:"icon-polyline" },
    { name: PLOT_POLYGON, icon:"icon-tool_polygon" }
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
  
  let viewer: Viewer;
  let _viewer:{ viewer: Cesium.Viewer } | undefined;
  
  let DrawPolylineIns:DrawPolyline|undefined;
  const drawPolyline = ():void => {
    if(!viewer || !viewer) {
      ElMessage('viewer尚未初始化');
      return;
    }
    DrawPolylineIns = new DrawPolyline(viewer);
    /** 要支持连续绘制 */
    DrawPolylineIns.startCreate(() => {
      activedTool.value = '';
    });
    /** 要支持连续绘制 */
  };
  const stopPolyline = () => {
    DrawPolylineIns && DrawPolylineIns.stopDrawing();
    DrawPolylineIns = undefined;
  };
  
  let DrawPolygonIns: DrawPolygon|undefined;
  const drawPolygon = () => {
    if(!viewer || !viewer) {
      ElMessage('viewer尚未初始化');
      return;
    }
    DrawPolygonIns = new DrawPolygon(viewer);
    DrawPolygonIns.startCreate(() => {
      activedTool.value = '';
    });
  };
  const stopPolygon = () => {
    DrawPolygonIns && DrawPolygonIns.stopDrawing();
    DrawPolygonIns = undefined;
  };

  let DrawBillboardIns: DrawBillboard|undefined;
  const drawBillboard = () => {
    if(!viewer || !viewer) {
      ElMessage('viewer尚未初始化');
      return;
    }
    DrawBillboardIns = new DrawBillboard(viewer);
    DrawBillboardIns.startCreate();
  };
  const stopBillboard = () => {
    DrawBillboardIns && DrawBillboardIns.stopDrawing();
    DrawBillboardIns = undefined;
  };
 
  
  export default defineComponent({
    setup() {
      _viewer = inject('_viewer');
      
      /**  这里要改  */
      setTimeout(() => {
        if(!_viewer) {
          throw Error("provide/inject失败");
        }
        viewer = _viewer.viewer;
      }, 2000);
      /**  这里要改  */
  
  
      return {
        plottingTools,
        onToolActive,
        activedTool
      }
    }
  })
  
</script>

<style  lang="scss" scoped>
  .plotting {
    width: 100%;
    height: 100%;
    .plotting-item {
      width: 100%;
      height: 85px;
      padding-top: 5px;
      .iconfont {
        width: 40px;
        height: 40px;
        background-color: #fff;
        font-size: 20px;
        line-height: 40px;
        border-radius: 10px;
        margin: 0 auto;
        cursor: pointer;
      }
      .iconfontActive {
        background-color: #3B7CFF;
        color: #fff;
      }
      .plotting-item-name {
        line-height: 30px;
      }
      .plottingItemNameActive {
        color: #3B7CFF;
      }
    }
    .plotting-item:hover {
      cursor: pointer;
      color: rgb(8, 166, 187);
    }
  }
</style>