<!--
 * @Date: 2021-06-30 19:52:31
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-10-10 16:06:26
 * @FilePath: \cesium-web-vue\src\views\threeJsClipObjModelStencil.vue
-->
<template>
  <div class="threeJsClipObjModelStencil" id="threeJsClipObjModelStencil">
    <div class="controlGroup">
      <el-tabs type="border-card" @tab-click="onTabClicked">
        <el-tab-pane v-for="tab in tabs" :key="tab" :label="tab">
          <el-switch v-show="tab === '三面裁剪'" v-model="isShowPlanes" active-text="显示切面" inactive-text="显示模型"></el-switch>
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
const modelNameArr = [ '①',
  '②-1',
  '②-10',
  '②-2',
  '②-3',
  '②-4',
  '②-5',
  '②-6',
  '②-7',
  '②-8',
  '②-9',
  '③',
  '④-1',
  '④-2',
  '④-3',
  '⑤',
  '⑥-1',
  '⑥-2',
  '⑦-1',
  '⑦-2',
  '⑦-3',
  '⑧',
  '⑨',
  '⑩',
  '⑾' ];


let stencilClipIns: stencilClip; 
const isSelecting = ref(false)
const isShowPlanes = ref(false)
const isClipMutual = ref(false);

export default defineComponent({
  setup() {
    const tabs = ref(["三面裁剪", "自定义切割"]);
    const negated = reactive({
      x: false,
      y: false,
      z: false
    })
    
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

    const onTabClicked = (vm) => {
      console.log('name :>> ', vm.props.label);
    }
    return { distance, onSlideX, onSlideY, onSlideZ, tabs, negated,  isClipMutual, onTabClicked, isSelecting, isShowPlanes }
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
    10000
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
  stencilClipIns = new stencilClip(scene, { 
    // routerClip: {
    //   isSelecting: isSelecting
    // },
    threeFaceClip: {
      onlyShowPlanes: isShowPlanes.value,
      negateX: false,
      negateY: false,
      negateZ: false
    },
    clipEachOther: true
  });
  await stencilClipIns.loadModels("obj/惠南湖分层模型/", modelNameArr);
  const box = new THREE.Box3();
  const groupCenter = new THREE.Vector3()
  box.expandByObject(stencilClipIns.modelGroup);
  box.getCenter(groupCenter)
  stencilClipIns.modelGroup.translateX(-groupCenter.x);
  stencilClipIns.modelGroup.translateY(-groupCenter.y);
  stencilClipIns.modelGroup.translateZ(-groupCenter.z);
  stencilClipIns.modelGroup.scale.set(1, 1, 10);
  stencilClipIns.stencilGroup.translateX(-groupCenter.x);
  stencilClipIns.stencilGroup.translateY(-groupCenter.y);
  stencilClipIns.stencilGroup.translateZ(-groupCenter.z);
  stencilClipIns.stencilGroup.scale.set(1, 1, 10);

  /* 监听拾取点击坐标开始 */
  watch(isSelecting, val => {
    if(val) {
      stencilClipIns.selectRouter(container, camera)
    } else {
      stencilClipIns.endSelectRouter()
    }
  })
  /* 监听拾取点击坐标结束 */

  watch(isShowPlanes, val => {
    stencilClipIns.onlyShowPlanes(val);
  })
  
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