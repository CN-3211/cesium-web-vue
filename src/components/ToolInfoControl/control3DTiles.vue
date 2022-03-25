<!--
 * @Date: 2021-10-26 21:56:32
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-12-03 10:34:58
 * @FilePath: /cesium-web-vue/src/components/ToolInfoControl/control3DTiles.vue
-->
<template>
  <div class="control3DTiles">
    <div class="slip">
      <span class="demonstration">绕X轴旋转</span>
      <el-slider
        v-model="state.rotateX"
        :min="-180"
        :max="180"
        :show-input="true"
        :show-input-controls="false"
        input-size="mini"
        @input="onTransChanged"
      ></el-slider>
    </div>
    <div class="slip">
      <span class="demonstration">绕Y轴旋转</span>
      <el-slider
        v-model="state.rotateY"
        :min="-180"
        :max="180"
        :show-input="true"
        :show-input-controls="false"
        input-size="mini"
        @input="onTransChanged"
      ></el-slider>
    </div>
    <div class="slip">
      <span class="demonstration">绕Z轴旋转</span>
      <el-slider
        v-model="state.rotateZ"
        :min="-180"
        :max="180"
        :show-input="true"
        :show-input-controls="false"
        input-size="mini"
        @input="onTransChanged"
      ></el-slider>
    </div>
    <div class="adjustPosition">
      <span class="demonstration">经度：</span>
      <el-input-number
        v-model="state.lng"
        @change="onTransChanged"
        :min="0"
        :max="180"
        label="请输入经度"
        :step="0.001"
      ></el-input-number>
    </div>
    <div class="adjustPosition">
      <span class="demonstration">纬度：</span>
      <el-input-number v-model="state.lat" :min="0" :max="90" :step="0.001" @change="onTransChanged"></el-input-number>
    </div>
    <div class="adjustPosition">
      <span class="demonstration">高度：</span>
      <el-input-number v-model="state.height" @input="onTransChanged" :step="100"></el-input-number>
    </div>
    <div class="adjustPosition">
      <span class="demonstration">缩放：</span>
      <el-input-number v-model="state.scale" @input="onScaleChanged" :precision="2" :step="0.1" :max="10" />
    </div>
    <el-button @click="zoomToTileset">视角定位至模型</el-button>
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent, inject } from "vue";

import {
  Viewer,
  Matrix4,
  Cartesian3,
  Cesium3DTileset,
} from "cesium";
import transform from "@/utils/vue-utils/transform/transform";
import { changeCar3ToLnglat } from '@/utils/c-utils';

let boundingSphereCenter: Cartesian3;
let modelMatrix: Matrix4;

export default defineComponent({
  props: {
    selectedTileset: {
      type: Cesium3DTileset,
      default: '',
    }
  },
  setup(props, context) {
    const injectViewer: {viewer: Viewer} | undefined = inject('_viewer');
    if(!injectViewer) {
      throw Error("provide/inject失败");
    }
    
    boundingSphereCenter = props.selectedTileset.boundingSphere.center.clone();
    modelMatrix = props.selectedTileset.modelMatrix.clone();
    const lnglat = changeCar3ToLnglat(boundingSphereCenter);
    const state = reactive({
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      lng: lnglat.lng,
      lat: lnglat.lat,
      height: lnglat.height,
      scale: 1
    });
    

    const onTransChanged = () => {
      const selectedTileset = props.selectedTileset;
      
      let trans = new transform(boundingSphereCenter);
      const tmpMatrix = new Matrix4();
      Matrix4.multiply(
        trans.translation(state.lng, state.lat, state.height),
        trans.rotation(state.rotateX, state.rotateY, state.rotateZ),
        tmpMatrix
      );

      Matrix4.multiply(
        tmpMatrix,
        modelMatrix,
        tmpMatrix
      );
  
      selectedTileset.modelMatrix = tmpMatrix;
    };

    const onScaleChanged = () => {
      console.log('112 :>> ', 112);
    }

    const zoomToTileset = () => {
      injectViewer.viewer.zoomTo(props.selectedTileset)
    }

    return {
      state,
      onTransChanged,
      onScaleChanged,
      zoomToTileset
    };
  },
});
</script>

<style  lang="scss" scoped>
.control3DTiles {
  width: 400px;
  padding: 10px 20px;
  border-radius: 10px;
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: white;
}
</style>