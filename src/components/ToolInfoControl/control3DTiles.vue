<!--
 * @Date: 2021-10-26 21:56:32
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-11-27 13:45:21
 * @FilePath: \cesium-web-vue\src\components\ToolInfoControl\control3DTiles.vue
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
        @input="onChanged"
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
        @input="onChanged"
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
        @input="onChanged"
      ></el-slider>
    </div>
    <div class="adjustPosition">
      <span class="demonstration">经度：</span>
      <el-input-number
        v-model="state.lng"
        @change="onChanged"
        :min="0"
        :max="180"
        label="请输入精度"
        :step="0.001"
      ></el-input-number>
    </div>
    <div class="adjustPosition">
      <span class="demonstration">纬度：</span>
      <el-input-number v-model="state.lat" :min="0" :max="90" :step="0.001" @change="onChanged"></el-input-number>
    </div>
    <div class="adjustPosition">
      <span class="demonstration">高度：</span>
      <el-input-number v-model="state.height" @input="onChanged" :step="100"></el-input-number>
    </div>
    <el-button @click="zoomToTileset">视角定位至模型</el-button>
  </div>
</template>

<script lang="ts">
import { reactive, onMounted, defineComponent, inject } from "vue";

import {
  Viewer,
  Matrix4,
  Cartesian3,
  Cesium3DTileset,
} from "cesium";
import transform from "@/utils/vue-utils/transform/transform";

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
    const state = reactive({
      rotateX: 0,
      rotateY: 0,
      rotateZ: 0,
      lng: 113.805972,
      lat: 27.664014,
      height: -1500
    });

    onMounted(() => {
      props.selectedTileset.readyPromise.then((tileset) => {
        boundingSphereCenter = tileset.boundingSphere.center.clone();
        modelMatrix = tileset.modelMatrix.clone();

        console.log('boundingSphereCenter :>> ', boundingSphereCenter);
        console.log('modelMatrix :>> ', modelMatrix);
      });
    });


    const onChanged = () => {
      const selectedTileset = props.selectedTileset;
      
      let trans = new transform(boundingSphereCenter, modelMatrix);
      const tmpMatrix = new Matrix4();
      Matrix4.multiply(
        trans.translation(state.lng, state.lat, state.height),
        trans.rotation(state.rotateX, state.rotateY, state.rotateZ),
        tmpMatrix
      );
      

      selectedTileset.modelMatrix = tmpMatrix;
    };

    const zoomToTileset = () => {
      injectViewer.viewer.zoomTo(props.selectedTileset)
    }

    return {
      state,
      onChanged,
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