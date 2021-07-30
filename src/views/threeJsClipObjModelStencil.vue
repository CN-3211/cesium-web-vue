<!--
 * @Date: 2021-06-30 19:52:31
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-30 17:10:50
 * @FilePath: \cesium-web-vue\src\views\threeJsClipObjModelStencil.vue
-->
<template>
  <div class="threeJsClipObjModelStencil" id="threeJsClipObjModelStencil">
    <div class="block">
      <span class="demonstration">平面距离</span>
      <el-slider v-model="distance" :min="-1" :max="1" :step="0.001" @input="onSlide"></el-slider>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";
const distance = ref(0);

let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let planes: THREE.Plane[] = [
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), distance.value),
  // new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
  // new THREE.Plane( new THREE.Vector3( 0, 0, - 1 ), 0 )
];
const planeObjects: THREE.Mesh[] = [];

export default defineComponent({
  setup() {
    onMounted(async () => {
      await init();
      animate();
    });
    const onSlide = () => {
      planes.forEach(item => {
        item.constant = distance.value;
      })
    }
    return { distance, onSlide }
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

  new handModels(scene);

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

function animate(): void {
  requestAnimationFrame(animate);
  for (let i = 0; i < planeObjects.length; i++) {
    let plane = planes[i];
    let po = planeObjects[i];

    plane.coplanarPoint(po.position);

    // mesh.lookAt起什么作用
    po.lookAt(
      po.position.x - plane.normal.x,
      po.position.y - plane.normal.y,
      po.position.z - plane.normal.z
    );
  }
  renderer.render(scene, camera);
}

class handModels {
  objectGroup = new THREE.Group();
  constructor(scene: THREE.Scene) {
    scene.add(this.objectGroup);
    this.loadModels(scene);
  }
  async loadModels(scene: THREE.Scene) {
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
    const objAndMtls: any[] = [];

    for (let i = 0; i < modelNameArr.length; i++) {
      const item = modelNameArr[i];
      const mtl = await new MTLLoader()
        .setPath("obj/分层地层切割模型/")
        .loadAsync(`${item}.mtl`);
      const obj = await new OBJLoader()
        .setMaterials(mtl)
        .setPath("obj/分层地层切割模型/")
        .loadAsync(`${item}.obj`);
      obj.scale.set(0.001, 0.001, 0.001);
      objAndMtls.push({
        obj,
        mtl,
      });
    }
    for (let i = 0; i < objAndMtls.length; i++) {
      const layerModel = objAndMtls[i].obj;
      const layerMaterial: MTLLoader.MaterialCreator = objAndMtls[i].mtl;
      layerModel.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.material.clippingPlanes = planes;
          child.castShadow = true; // ??
          child.renderOrder = 6; // ??
        }
      });

      // this.objectGroup.add(layerModel);

      const planeGeom = new THREE.PlaneBufferGeometry(1, 1);
      const poGroup: THREE.Group = new THREE.Group();
      const plane = planes[i];

      layerModel.children.forEach((itemModel) => {
        const _itemModel = itemModel as THREE.Mesh;
        const geometry = _itemModel.geometry.clone();
        const meshMaterial = _itemModel.material as any;

        const stencilGroup = this.createPlaneStencilGroup(
          geometry,
          plane,
          i + 1,
          meshMaterial.color
        );
        stencilGroup.scale.set(0.001, 0.001, 0.001);
        this.objectGroup.add(stencilGroup);
      });

      // plane会被其他clipping planes裁剪
      const planeMat = new THREE.MeshStandardMaterial({
        color: layerModel.children[0].material.color,
        // color: "#FFFF00",
        // clippingPlanes: planes.filter((p) => p !== plane),
        stencilWrite: true,
        stencilRef: 0,
        stencilFunc: THREE.NotEqualStencilFunc,
        stencilFail: THREE.ReplaceStencilOp,
        stencilZFail: THREE.ReplaceStencilOp,
        stencilZPass: THREE.ReplaceStencilOp,
      });

      const po = new THREE.Mesh(planeGeom, planeMat);
      po.onAfterRender = (renderer) => {
        renderer.clearStencil();
      };
      po.renderOrder = i + 1.2;
      poGroup.add(po);
      planeObjects.push(po);
      scene.add(poGroup);
    }
  }
  createPlaneStencilGroup(
    layerModel: THREE.BufferGeometry,
    plane: THREE.Plane,
    renderOrder: number,
    meshColor: THREE.Color
  ): THREE.Group {
    const group: THREE.Group = new THREE.Group();
    const baseMat: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
      color: meshColor,
    });
    baseMat.depthWrite = false;
    baseMat.depthTest = false;
    baseMat.colorWrite = false;
    baseMat.stencilWrite = true;
    baseMat.stencilFunc = THREE.AlwaysStencilFunc;

    //
    const mat0 = baseMat.clone();
    mat0.side = THREE.BackSide;
    mat0.clippingPlanes = [plane];
    // IncrementWrapStencilOp将当前stencil value增加1
    mat0.stencilFunc = THREE.AlwaysStencilFunc;
    // mat0.stencilFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZFail = THREE.IncrementWrapStencilOp;
    mat0.stencilZPass = THREE.IncrementWrapStencilOp;

    const mesh0: THREE.Mesh = new THREE.Mesh(layerModel, mat0);
    mesh0.renderOrder = renderOrder;
    group.add(mesh0);

    // front faces
    const mat1 = baseMat.clone();
    mat1.side = THREE.FrontSide;
    mat1.clippingPlanes = [plane];
    // DecrementWrapStencilOp将当前stencil value减少1
    // mat1.stencilFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;

    const mesh1 = new THREE.Mesh(layerModel, mat1);
    mesh1.renderOrder = renderOrder;

    group.add(mesh1);

    return group;
  }
}
</script>

<style>
.threeJsClipObjModelStencil {
  width: 100%;
  height: 100%;
}
</style>