/*
 * @Date: 2021-07-22 09:03:48
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-22 13:48:46
 * @FilePath: \cesium-web-vue\src\views\threeJS\initScene.ts
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface threeElements {
  scene: THREE.Scene
  camera: THREE.Camera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
}

function initScene(container: HTMLElement|null): threeElements {
  if(!container) throw new Error("没有获取到container");

  // 配置camera
  const camera:THREE.PerspectiveCamera = new THREE.PerspectiveCamera( 36, container.clientWidth / container.clientHeight, 1, 1000000 );
  camera.position.set( 400, 400, 400 );
  
  // 配置scene和光照
  const scene:THREE.Scene = new THREE.Scene();
  const ambientLight:THREE.AmbientLight = new THREE.AmbientLight(0xcccccc, 0.6) // 无方向的环境光
  scene.add(ambientLight);
  const dirLight:THREE.DirectionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  camera.add(dirLight);
  scene.add(camera);

  // 辅助调试
  const axisHelper = new THREE.AxesHelper(250);
  scene.add(axisHelper);

  // render配置
  const renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( container.clientWidth, container.clientHeight );
  renderer.setClearColor(0x263238);
  renderer.localClippingEnabled = true;

  container.appendChild( renderer.domElement );
  renderer.render( scene, camera );

  // 控制器添加
  const controls:OrbitControls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1.5;
  return {
    scene,
    camera,
    renderer,
    controls
  }
}

export { threeElements, initScene }