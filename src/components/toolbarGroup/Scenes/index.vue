<!--
 * @Date: 2021-11-04 21:58:18
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-01-10 14:27:28
 * @FilePath: /cesium-web-vue/src/components/toolbarGroup/Scenes/index.vue
-->
<template>
  <div class="scene">
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
  import * as Cesium from "cesium";
  import { inject, ref, watch } from "vue";
  import Tool from '../tool.vue'
  import rainEffect from './rain';

  // 配置文件模块
  const WEATHER_RAIN = "雨";

  const otherTools = ref([
    { name: WEATHER_RAIN, icon: "icon-poumianxinxi" },
  ]);


  let viewer: Cesium.Viewer;
  const injectViewer: { viewer: Cesium.Viewer } | undefined = inject('_viewer');
  if (!injectViewer) {
    throw Error("provide/inject失败");
  }
  viewer = injectViewer.viewer;

  function activeFunc(toolName) {
    switch (toolName) {
      case WEATHER_RAIN:
        startRain();
        break;
    }
  }

  /** 剖面分析开始 */
  let rainEffectIns: rainEffect | undefined;
  function startRain() {
    rainEffectIns = new rainEffect();
    rainEffectIns.startRainEffect(viewer)
  }

  function stopRain() {
    rainEffectIns && rainEffectIns.stopRainEffect(viewer)
    rainEffectIns = undefined;
  }
  /** 剖面分析结束 */

  const stopFunction = (toolName) => {
    switch (toolName) {
      case WEATHER_RAIN:
        stopRain()
        break;
    }
  }

  // 图标高亮模块
  let activedTool = ref('');
  function onToolActive (tool){
    stopFunction(activedTool.value);
    if (activedTool.value === tool.name) {
      activedTool.value = '';
    } else {
      activedTool.value = tool.name;
      activeFunc(activedTool.value)
    }
  }
</script>

<style  lang="scss" scoped>
.scene {
  width: 100%;
  height: 100%;
}
</style>