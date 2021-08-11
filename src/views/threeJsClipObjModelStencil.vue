<!--
 * @Date: 2021-06-30 19:52:31
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-08-11 14:11:33
 * @FilePath: \cesium-web-vue\src\views\threeJsClipObjModelStencil.vue
-->
<template>
  <div class="threeJsClipObjModelStencil" id="threeJsClipObjModelStencil">
    <div class="controlGroup">
      <el-tabs type="border-card" @tab-click="onTabClicked">
        <el-tab-pane v-for="tab in tabs" :key="tab" :label="tab">
          <div v-show="tab === '切面展示'">
            <div class="checkboxGroup">
              <el-checkbox v-model="isClipMutual" label="不同切面直接是否相互剪切" @change="onClipMutual"></el-checkbox>
            </div>
          </div>
          <el-switch v-show="tab === '自定义切割'" v-model="isSelecting" active-text="开始选择" inactive-text="停止选择"></el-switch>
          <div>
            <span class="demonstration">X平面距离</span>
            <el-slider v-model="distance.x" :min="-1" :max="1" :step="0.001" @input="onSlideX"></el-slider>
            <span class="demonstration">Y平面距离</span>
            <el-slider v-model="distance.y" :min="-1" :max="1" :step="0.001" @input="onSlideY"></el-slider>
            <span class="demonstration">Z平面距离</span>
            <el-slider v-model="distance.z" :min="-1" :max="1" :step="0.001" @input="onSlideZ"></el-slider>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script lang="ts">
// #region
import { defineComponent, onMounted, reactive, ref, watch } from "vue";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import stencilClip from '@/views/stencilClip';
const distance = reactive({
  x: 0,
  y: 0,
  z: 0
});

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
const modelNameArr = [
  "1-2",
  "3-1",
  "3-2",
  "3-4",
  "4-1",
  "4-4",
  "8-1",
  "8-4",
  "11-1",
  "11-4",
  "17-1",
  "17-2",
  "17-3",
  "17-4",
  "17-5",
  "g孤石",
];


let stencilClipIns: stencilClip; 
const isSelecting = ref(false)
const mouse = new THREE.Vector2();
const selectPolyline: THREE.Vector3[] = [];

export default defineComponent({
  setup() {
    const tabs = ref(["三面裁剪", "切面展示", "自定义切割"]);
    const negated = reactive({
      x: false,
      y: false,
      z: false
    })
    const isClipMutual = ref(false);
    
    onMounted(async () => {
      await init();
      animate();
    });
    const onSlideX = () => {
      stencilClipIns.planes[0].forEach(item => {
        item.constant = distance.x;
      })
    }
    const onSlideY = () => {
      stencilClipIns.planes[1].forEach(item => {
        item.constant = distance.y;
      })
    }
    const onSlideZ = () => {
      stencilClipIns.planes[2].forEach(item => {
        item.constant = distance.z;
      })
    }
    const onNegatedChange = (planIndex) => {
      console.log('planIndex :>> ', planIndex);
      stencilClipIns.planes[planIndex].forEach(item => item.negate());
    }
    const onTabClicked = (vm) => {
      console.log('name :>> ', vm.props.label);
      if(vm.props.label === '切面展示') {
        stencilClipIns && stencilClipIns.changeShowType("切面展示");
      }
    }
    const onClipMutual = (mutualed) => {
      stencilClipIns && stencilClipIns.changeClippingPlaneShowModel(mutualed);
      console.log('mutualed :>> ', mutualed);
    }
    return { distance, onSlideX, onSlideY, onSlideZ, tabs, negated, onNegatedChange, onClipMutual, isClipMutual, onTabClicked, isSelecting }
  },
});

async function init(): Promise<void> {
  const container: HTMLElement | null = document.getElementById(
    "threeJsClipObjModelStencil"
  );
  if (!container) throw new Error("没有获取到container");

  // 配置camera
  camera = new THREE.PerspectiveCamera(
    36,
    container.clientWidth / container.clientHeight,
    1,
    1000
  );
  camera.position.set(0, 0, 3);

  // 配置scene和光照
  scene = new THREE.Scene();
  const ambientLight: THREE.AmbientLight = new THREE.AmbientLight(
    0xcccccc,
    0.6
  ); // 无方向的环境光
  scene.add(ambientLight);
  const dirLight: THREE.DirectionalLight = new THREE.DirectionalLight(
    0xffffff,
    1
  );
  camera.add(dirLight);
  scene.add(camera);

  // 辅助调试
  const axisHelper = new THREE.AxesHelper(250);
  scene.add(axisHelper);
  // debugger
  stencilClipIns = new stencilClip(scene, { 
    // routerClip: {
    //   isSelecting: isSelecting
    // },
    threeFaceClip: {
      onlyShowPlanes: true,
      negateX: true,
      negateY: false,
      negateZ: false
    },
    clipEachOther: true
  });
  await stencilClipIns.loadModels("obj/分层地层切割模型/", modelNameArr);

  /* 拾取点击坐标开始 */
  watch(isSelecting, val => {
    if(val) {
      stencilClipIns.selectRouter(container, camera)
    } else {
      stencilClipIns.endSelectRouter()
    }
  })
  /* 拾取点击坐标结束 */

  // render配置
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x263238);
  renderer.localClippingEnabled = true;

  container.appendChild(renderer.domElement);
  renderer.render(scene, camera);

  

  // 控制器添加
  const controls: OrbitControls = new OrbitControls(
    camera,
    renderer.domElement
  );
  controls.minDistance = 1.5;
}
// #endregion

function animate(): void {
  requestAnimationFrame(animate);
  stencilClipIns.lookAtPlane();
  renderer.render(scene, camera);
}
</script>

<style lang="scss">
.threeJsClipObjModelStencil {
  width: 100%;
  height: 100%;
  position: relative;
  .controlGroup {
    box-sizing: border-box;
    width: 328px;
    padding: 10px;
    border-radius: 3%;
    position: absolute;
    top: 30px;
    left: 10px;
    background-color: rgba($color: #FFFFFF, $alpha: 0.2);
    .el-tab-pane {
      position: relative;
      .threeClip {
        .spanText {
          position: absolute;
          top: -2px;
          left: 0;
          width: 80px;
          text-align: center;
        }
        .checkboxGroup {
          padding-left: 80px;
        }
      }
      
    }
  }
}
</style>