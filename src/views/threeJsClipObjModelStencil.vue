<!--
 * @Date: 2021-06-30 19:52:31
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-05 09:16:25
 * @FilePath: \cesium-web-vue\src\views\threeJsClipObjModelStencil.vue
-->
<template>
  <div class="threeJsClipObjModelStencil" id="threeJsClipObjModelStencil">

  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';

import * as THREE from 'three';
import { DDSLoader } from 'three/examples/jsm/loaders/DDSLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';


let renderer:THREE.WebGLRenderer;
let scene:THREE.Scene
let camera:THREE.PerspectiveCamera
let planes:THREE.Plane[] = [
  new THREE.Plane( new THREE.Vector3( - 1, 0, 0 ), 0 ),
  // new THREE.Plane( new THREE.Vector3( 0, - 1, 0 ), 0 ),
  // new THREE.Plane( new THREE.Vector3( 0, 0, - 1 ), 0 )
];


/**
 * 内容: 生成的模型切面(可见)
 * 作用: animation中,防止视角切换切面不显示
 */
let planeObjects:THREE.Mesh[] = []
export default defineComponent({
  setup() {
    onMounted(() => {
      init()
      animate()
    })
  }
})

function init():void {
  const container:HTMLElement|null = document.getElementById("threeJsClipObjModelStencil");
  if(!container) throw new Error("没有获取到container");
  

  // 配置camera
  camera = new THREE.PerspectiveCamera( 36, container.clientWidth / container.clientHeight, 1, 3 );
  camera.position.set(0, 0, 3);


  // 配置scene和光照
  scene = new THREE.Scene();
  const ambientLight:THREE.AmbientLight = new THREE.AmbientLight(0xcccccc, 0.6) // 无方向的环境光
  scene.add(ambientLight);
  const dirLight:THREE.DirectionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  camera.add(dirLight);
  scene.add(camera);

  // 辅助调试
  const axisHelper = new THREE.AxesHelper(250);
  scene.add(axisHelper);

  const planeHelpers:THREE.PlaneHelper[] = planes.map(p => new THREE.PlaneHelper(p, 1, 0xffffff));
  planeHelpers.forEach(ph => {ph.visible = false; scene.add(ph)});

  

  /**
   * 内容: 1.obj模型; 2.模型中每个geometry的stencil
   * 作用: 添加到scene并显示
   */
  const objectGroup = new THREE.Group();
  scene.add(objectGroup)

  // model加载
  const onProgress = function ( xhr ) {
    if ( xhr.lengthComputable ) {
      const percentComplete = xhr.loaded / xhr.total * 100;
      console.log( Math.round( percentComplete ) + '% downloaded' );
    }
  };
  new MTLLoader().setPath('obj/地层切割模型/').load('mdl1.mtl', (materials) => {
    materials.preload();
    new OBJLoader().setMaterials(materials).setPath('obj/地层切割模型/').load("mdl1.obj", (layerModel:THREE.Group) => {
      console.log('layerModel :>> ', layerModel);
      console.log('materials :>> ', materials);

      layerModel.scale.set(0.001,0.001,0.001);
      const boundingBox = new THREE.Box3().setFromObject(layerModel);
        
      const boundingBoxGeo = new THREE.BoxGeometry(boundingBox.max.x - boundingBox.min.x, boundingBox.max.y - boundingBox.min.y, boundingBox.max.z - boundingBox.min.z);
      // const boundingBoxGeo = new THREE.BoxGeometry(1, 1, 1);
      const mesh = new THREE.Mesh(
        boundingBoxGeo,
        new THREE.MeshBasicMaterial({
          transparent:true,
          opacity: 0.1
        })
      );
      console.log('boundingBox.max.y :>> ', boundingBox.max.y);
      console.log('boundingBox.min.y :>> ', boundingBox.min.y);
      scene.add(mesh)


      const x= (boundingBox.max.x+boundingBox.min.x)/2;
      const y= (boundingBox.max.y+boundingBox.min.y)/2;
      const z= (boundingBox.max.z+boundingBox.min.z)/2;
      console.log('boundingBox.max.z :>> ', boundingBox.max.z);
      console.log('boundingBox.min.z :>> ', boundingBox.min.z);
      layerModel.position.set(-x, -y, -z);
      
      layerModel.traverse((child:THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.material.clippingPlanes = planes
          child.castShadow = true; // ??
          child.renderOrder = 6; // ??
        }
      })
      objectGroup.add(layerModel);

      const planeGeom = new THREE.PlaneBufferGeometry( 1, 1 );
      

      for(let i = 0; i < planes.length; i++) {
        const poGroup:THREE.Group = new THREE.Group();
        const plane = planes[i]

        layerModel.children.forEach(itemModel => {
          const _itemModel = itemModel as THREE.Mesh;
          const geometry = _itemModel.geometry.clone();
          const meshMaterial = _itemModel.material as any;
          geometry.translate(-x/0.001, -y/0.001, -z/0.001);

          const stencilGroup = createPlaneStencilGroup( geometry, plane, i + 1, meshMaterial.color );
          stencilGroup.scale.set(0.001,0.001,0.001)
          objectGroup.add(stencilGroup)
        })

        // plane会被其他clipping planes裁剪
        const planeMat = new THREE.MeshStandardMaterial({
          color: 0xffff00,
          clippingPlanes: planes.filter( p => p !== plane ),

          stencilWrite: true,
          stencilRef: 0,
          stencilFunc: THREE.NotEqualStencilFunc,
          stencilFail: THREE.ReplaceStencilOp,
          stencilZFail: THREE.ReplaceStencilOp,
          stencilZPass: THREE.ReplaceStencilOp,
        })

        const po = new THREE.Mesh(planeGeom, planeMat);
        po.onAfterRender = renderer => { renderer.clearStencil() }
        po.renderOrder = i + 1.2;
        poGroup.add(po);
        planeObjects.push(po);
        scene.add(poGroup)
      }

      // UI添加
      const params = {
        planeX: {
          constant: x,
          negated: false,
          displayHelper: false
        },
        planeY: {
          constant: y,
          negated: false,
          displayHelper: false
        },
        planeZ: {
          constant: z,
          negated: false,
          displayHelper: false
        },
      };
      var gui = new GUI();
      var planeX = gui.addFolder( 'planeX' );
      planeX.add( params.planeX, 'displayHelper' ).onChange( v => planeHelpers[0].visible = v );
      planeX.add( params.planeX, 'constant' ).min(boundingBox.min.x).max(boundingBox.max.x).onChange( d => planes[0].constant = d );
      planeX.add( params.planeX, 'negated' ).onChange( () => {
        planes[0].negate();
        params.planeX.constant = planes[0].constant;

      } );
      planeX.open();

      var planeY = gui.addFolder( 'planeY' );
      planeY.add( params.planeY, 'displayHelper' ).onChange( v => planeHelpers[1].visible = v );
      planeY.add( params.planeY, 'constant' ).min(boundingBox.min.y).max(0.25).onChange( d => planes[1].constant = d );
      planeY.add( params.planeY, 'negated' ).onChange( () => {
        planes[1].negate();
        params.planeY.constant = planes[1].constant;

      } );
      planeY.open();

      var planeZ = gui.addFolder( 'planeZ' );
      planeZ.add( params.planeZ, 'displayHelper' ).onChange( v => planeHelpers[2].visible = v );
      planeZ.add( params.planeZ, 'constant' ).min(-0.08).max(boundingBox.max.z).onChange( d => planes[2].constant = d );
      planeZ.add( params.planeZ, 'negated' ).onChange( () => {
        planes[2].negate();
        params.planeZ.constant = planes[2].constant;

      } );
      planeZ.open();

    }, onProgress)
  })

  // render配置
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( container.clientWidth, container.clientHeight );
  renderer.setClearColor(0x263238);
  renderer.localClippingEnabled = true;

  container.appendChild( renderer.domElement );
  renderer.render( scene, camera );

  // 控制器添加
  const controls:OrbitControls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1.5;
  controls.maxDistance = 2.5;

  

}

function animate():void {
  requestAnimationFrame(animate);
  for ( let i = 0; i < planeObjects.length; i ++ ) {
    let plane = planes[ i ];
    let po = planeObjects[ i ];

    plane.coplanarPoint( po.position );
    
    // mesh.lookAt起什么作用
    po.lookAt(
        po.position.x - plane.normal.x,
        po.position.y - plane.normal.y,
        po.position.z - plane.normal.z,
    );
  }
  renderer.render( scene, camera );
}

/**
 * @description: 初始化地质模型的每一个格网的模板缓冲，分为正面和背面。背面模板缓冲的值设置为1，正面模板缓冲的值设置为-1
 * @param {*} layerModel
 * @param {*} plane
 * @param {*} renderOrder
 * @param {*} meshColor
 * @return {*}
 */
function createPlaneStencilGroup(layerModel:THREE.BufferGeometry, plane:THREE.Plane, renderOrder:number, meshColor:THREE.Color):THREE.Group {
  const group:THREE.Group = new THREE.Group();
  const baseMat:THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({
    color: meshColor
  });
  baseMat.depthWrite = false;
  baseMat.depthTest = false;
  baseMat.colorWrite = false;
  baseMat.stencilWrite = true;
  baseMat.stencilFunc = THREE.AlwaysStencilFunc;

  // 
  const mat0 = baseMat.clone();
  mat0.side = THREE.BackSide;
  mat0.clippingPlanes = [ plane ];
  // IncrementWrapStencilOp将当前stencil value增加1
  mat0.stencilFunc = THREE.AlwaysStencilFunc;
  // mat0.stencilFail = THREE.IncrementWrapStencilOp;
  mat0.stencilZFail = THREE.IncrementWrapStencilOp;
  mat0.stencilZPass = THREE.IncrementWrapStencilOp;

  const mesh0:THREE.Mesh = new THREE.Mesh( layerModel, mat0 );
  mesh0.renderOrder = renderOrder;
  group.add( mesh0 );

  // front faces
  const mat1 = baseMat.clone();
  mat1.side = THREE.FrontSide;
  mat1.clippingPlanes = [ plane ];
  // DecrementWrapStencilOp将当前stencil value减少1
  // mat1.stencilFail = THREE.DecrementWrapStencilOp;
  mat1.stencilZFail = THREE.DecrementWrapStencilOp;
  mat1.stencilZPass = THREE.DecrementWrapStencilOp;

  const mesh1 = new THREE.Mesh( layerModel, mat1 );
  mesh1.renderOrder = renderOrder;

  group.add( mesh1 );

  return group
}
</script>

<style>
.threeJsClipObjModelStencil{
  width: 100%;
  height: 100%;
}
</style>