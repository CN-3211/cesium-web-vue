<!--
 * @Date: 2021-06-30 19:52:31
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-25 14:57:23
 * @FilePath: /cesium-web-vue/src/views/threeJsClipObjModelStencil.vue
-->
<template>
  <div class="threeJsClipObjModelStencil" id="threeJsClipObjModelStencil">
    <div class="controlGroup">
      <el-tabs type="border-card" v-model="tabsName">
        <el-tab-pane v-for="tab in tabs" :key="tab" :label="tab" :name="tab">
          <el-switch v-show="tab === '三面裁剪'" v-model="isShowPlanes" active-text="显示切面" inactive-text="显示模型"></el-switch>
          <el-switch v-show="tab === '自定义切割'" v-model="isSelecting" active-text="开始选择" inactive-text="停止选择"></el-switch>
          <div v-show="tab === '三面裁剪'">
            <span class="demonstration">X平面距离</span>
            <el-slider v-model="distance.x" :min="-5" :max="5" :step="0.001" @input="onSlideX"></el-slider>
            <span class="demonstration">Y平面距离</span>
            <el-slider v-model="distance.y" :min="-5" :max="5" :step="0.001" @input="onSlideY"></el-slider>
            <span class="demonstration">Z平面距离</span>
            <el-slider v-model="distance.z" :min="-3" :max="3" :step="0.001" @input="onSlideZ"></el-slider>
          </div>
          <div>
            <span class="demonstration">Z轴拉伸</span>
            <el-slider v-model="zStretching" :min="1" :max="20" :step="1" @input="onStretchingZ"></el-slider>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script lang="ts" setup>
// #region
import { onMounted, reactive, ref, watch } from "vue";
 
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import stencilClip from '@/views/stencilClip';
import { routerClip, threeFaceClip } from './stencilClipType';

const distance = reactive({
  x: 0,
  y: 0,
  z: 0
});

const zStretching = ref(0)

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

const tabs = ref(["三面裁剪", "自定义切割"]);
const tabsName = ref('自定义切割')

const TFClip = {
  onlyShowPlanes: isShowPlanes.value,
  negateX: false,
  negateY: false,
  negateZ: false,
  clipEachOther: true
}

const RClip = {
  isSelecting: isSelecting
}

onMounted(async () => {
  const container = initScene();
  initClip(container, RClip);
  watch(tabsName, async val => {
    stencilClipIns.resetModel()
    if(val === '自定义切割') {
      initClip(container, RClip)
    } else {
      initClip(container, TFClip)
    }
  })
  /* 监听拾取点击坐标开始 */
  watch(isSelecting, val => {
    if(val) {
      stencilClipIns.selectRouter(container)
    } else {
      stencilClipIns.endSelectRouter(container)
    }
  })
  /* 监听拾取点击坐标结束 */
  watch(isShowPlanes, val => {
    stencilClipIns.onlyShowPlanes(val);
  })
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

const onStretchingZ = () => {
  if(stencilClipIns) {
    stencilClipIns.modelGroup.scale.set(1, 1, zStretching.value);
    stencilClipIns.stencilGroup.scale.set(1, 1, zStretching.value);
  }
}

function initScene(): HTMLElement {
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
  camera.lookAt(new THREE.Vector3(0, 10, 0))
  scene.add(camera);

  // 辅助调试
  const axisHelper = new THREE.AxesHelper(250);
  scene.add(axisHelper);
  
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

  return container
}
// #endregion



async function initClip(container: HTMLElement, clipOptions: routerClip | threeFaceClip) {
  stencilClipIns = new stencilClip(scene, camera, clipOptions);
  await stencilClipIns.loadModels("obj/惠南湖分层模型/", modelNameArr);
  const box = new THREE.Box3();
  const groupCenter = new THREE.Vector3()
  box.expandByObject(stencilClipIns.modelGroup);
  box.getCenter(groupCenter)
  stencilClipIns.modelGroup.translateX(-groupCenter.x);
  stencilClipIns.modelGroup.translateY(-groupCenter.y);
  stencilClipIns.modelGroup.translateZ(-groupCenter.z);

  stencilClipIns.stencilGroup.translateX(-groupCenter.x);
  stencilClipIns.stencilGroup.translateY(-groupCenter.y);
  stencilClipIns.stencilGroup.translateZ(-groupCenter.z);
  animate()
}

function animate(): void {
  requestAnimationFrame(animate);
  
  // lookaAtPlane的作用在于调整填充面的位置，可以在动态切割时调用
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