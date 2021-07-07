/*
 * @Date: 2021-07-07 15:08:39
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-07 16:43:36
 * @FilePath: \cesium-web-vue\src\views\test01_script\combine.ts
 */
import * as Cesium from "cesium";
import * as THREE from 'three';
interface _cesium {
  viewer: Cesium.Viewer
}
interface _three {
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene
}
const _cesium:any = {
  viewer: null
};
const _three:any = {
  renderer: null,
  camera: null,
  scene: null
};
let cesiumContainer:HTMLElement|null
let ThreeContainer:HTMLElement|null
let minWGS84 = [115.23, 39.55];
let maxWGS84 = [116.23, 41.55];

class _3DObject {
  threeMesh: THREE.Group|null
  minWGS84: number[]
  maxWGS84: number[]
  constructor() {
    this.threeMesh = null;
    this.minWGS84 = [];
    this.maxWGS84 = [];
  }
}

function pageload():void {
  // boundaries in WGS84 around the object

  cesiumContainer = document.getElementById("cesiumContainer");
  ThreeContainer = document.getElementById("ThreeContainer");
  if (!cesiumContainer || !ThreeContainer) {
    throw new Error("container获取不到");
  }
  
  const _3Dobjects:_3DObject[] = []; //Could be any Three.js object mesh
  initCesium(cesiumContainer); // Initialize Cesium renderer
  initThree(ThreeContainer); // Initialize Three.js renderer
  init3DObject(); // Initialize Three.js object mesh with Cesium Cartesian coordinate system
  loop(cesiumContainer, ThreeContainer); // Looping renderer


  function initCesium(cesiumContainer:HTMLElement) {
   
    _cesium.viewer = new Cesium.Viewer(cesiumContainer, {
      useDefaultRenderLoop: false,
      selectionIndicator: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      infoBox: false,
      navigationInstructionsInitiallyVisible: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      contextOptions: {
        webgl: {
          alpha: false,
          antialias: true,
          preserveDrawingBuffer: true,
          failIfMajorPerformanceCaveat: false,
          depth: true,
          stencil: false,
          anialias: false
        },
      },
      targetFrameRate: 60,
      orderIndependentTranslucency: true,
      baseLayerPicker: true,
      geocoder: false,
      automaticallyTrackDataSourceClocks: false,
    });
    const center = Cesium.Cartesian3.fromDegrees(
      (minWGS84[0] + maxWGS84[0]) / 2,
      ((minWGS84[1] + maxWGS84[1]) / 2) - 1,
      200000
    );
    _cesium.viewer.camera.flyTo({
      destination: center,
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-60),
        roll: Cesium.Math.toRadians(0)
      },
      duration: 3
    });
  }

  function initThree(ThreeContainer:HTMLElement) {
    const fov = 45;
    const width = ThreeContainer.clientWidth;
    const height = ThreeContainer.clientHeight;
    const aspect = width / height;
    const near = 1;
    const far = 10 * 1000 * 1000;

    _three.scene = new THREE.Scene();
    _three.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    _three.renderer = new THREE.WebGLRenderer({
      alpha: true
    });
    const Amlight = new THREE.AmbientLight(0xffffff, 2);
    _three.scene.add(Amlight);
    ThreeContainer.appendChild(_three.renderer.domElement);
  }

  function init3DObject() {
    _cesium.viewer.entities.add({
      name: 'Polygon',
      polygon: {
        hierarchy: new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArray([
          minWGS84[0], minWGS84[1],
          maxWGS84[0], minWGS84[1],
          maxWGS84[0], maxWGS84[1],
          minWGS84[0], maxWGS84[1],
        ])),
        material: Cesium.Color.RED.withAlpha(0.2)
      }
    });
    //Three.js Objects
    // Lathe geometry
    const doubleSideMaterial = new THREE.MeshNormalMaterial({
      side: THREE.DoubleSide
    });
    const segments = 10;
    const points:THREE.Vector2[] = [];
    for (let i = 0; i < segments; i++) {
      points.push(new THREE.Vector2(Math.sin(i * 0.2) * segments + 5, (i - 5) * 2));
    }
    const geometry1 = new THREE.LatheGeometry(points);
    const latheMesh = new THREE.Mesh(geometry1, doubleSideMaterial);
    latheMesh.scale.set(1500, 1500, 1500); //scale object to be visible at planet scale
    latheMesh.position.z += 15000.0; // translate "up" in Three.js space so the "bottom" of the mesh is the handle
    latheMesh.rotation.x = Math.PI / 2; // rotate mesh for Cesium's Y-up system
    const latheMeshYup = new THREE.Group();
    latheMeshYup.add(latheMesh)
    _three.scene.add(latheMeshYup); // don’t forget to add it to the Three.js scene manually
    const _3DOB1 = new _3DObject();
    _3DOB1.threeMesh = latheMeshYup;
    _3DOB1.minWGS84 = minWGS84;
    _3DOB1.maxWGS84 = maxWGS84;
    _3Dobjects.push(_3DOB1);
    const geometry2 = new THREE.DodecahedronGeometry();
    const dodecahedronMesh = new THREE.Mesh(geometry2, new THREE.MeshNormalMaterial());
    dodecahedronMesh.scale.set(5000, 5000, 5000); //scale object to be visible at planet scale
    dodecahedronMesh.position.z +=
      15000.0; // translate "up" in Three.js space so the "bottom" of the mesh is the handle
    dodecahedronMesh.rotation.x = Math.PI / 2; // rotate mesh for Cesium's Y-up system
    const dodecahedronMeshYup = new THREE.Group();
    dodecahedronMeshYup.add(dodecahedronMesh)
    _three.scene.add(dodecahedronMeshYup); // don’t forget to add it to the Three.js scene manually
    const _3DOB2 = new _3DObject();
    _3DOB2.threeMesh = dodecahedronMeshYup;
    _3DOB2.minWGS84 = minWGS84;
    _3DOB2.maxWGS84 = maxWGS84;
    _3Dobjects.push(_3DOB2);
  }
  // Looping Renderer
  function renderCesium() {
    _cesium.viewer.render();
  }

  function renderThreeObj(cesiumContainer:HTMLElement, ThreeContainer:HTMLElement) {
    if(!(_cesium.viewer.camera.frustum instanceof Cesium.PerspectiveFrustum)) {
      throw new Error("camera.frustum不是Cesium.PerspectiveFrustum类型");
    }
    // register Three.js scene with Cesium
    _three.camera.fov = Cesium.Math.toDegrees(_cesium.viewer.camera.frustum.fovy) // ThreeJS FOV is vertical
    //three.camera.updateProjectionMatrix();
    const cartToVec = function (cart) {
      return new THREE.Vector3(cart.x, cart.y, cart.z);
    };
    for (const id in _3Dobjects) {
      minWGS84 = _3Dobjects[id].minWGS84;
      maxWGS84 = _3Dobjects[id].maxWGS84;
      const center = Cesium.Cartesian3.fromDegrees((minWGS84[0] + maxWGS84[0]) / 2, (minWGS84[1] + maxWGS84[1]) / 2);
      const centerHigh = Cesium.Cartesian3.fromDegrees((minWGS84[0] + maxWGS84[0]) / 2, (minWGS84[1] + maxWGS84[1]) /
        2, 1);
      const bottomLeft = cartToVec(Cesium.Cartesian3.fromDegrees(minWGS84[0], minWGS84[1]));
      const topLeft = cartToVec(Cesium.Cartesian3.fromDegrees(minWGS84[0], maxWGS84[1]));
      const latDir = new THREE.Vector3().subVectors(bottomLeft, topLeft).normalize();
      _3Dobjects[id].threeMesh?.position.set(center.x, center.y, center.z);
      _3Dobjects[id].threeMesh?.lookAt(centerHigh.x, centerHigh.y, centerHigh.z);
      _3Dobjects[id].threeMesh?.up.copy(latDir);
    }
    _three.camera.matrixAutoUpdate = false;
    const cvm = _cesium.viewer.camera.viewMatrix;
    const civm = _cesium.viewer.camera.inverseViewMatrix;
    _three.camera.lookAt(0, 0, 0);
    _three.camera.matrixWorld.set(
      civm[0], civm[4], civm[8], civm[12],
      civm[1], civm[5], civm[9], civm[13],
      civm[2], civm[6], civm[10], civm[14],
      civm[3], civm[7], civm[11], civm[15]
    );

    _three.camera.matrixWorldInverse.set(
      cvm[0], cvm[4], cvm[8], cvm[12],
      cvm[1], cvm[5], cvm[9], cvm[13],
      cvm[2], cvm[6], cvm[10], cvm[14],
      cvm[3], cvm[7], cvm[11], cvm[15]
    );

    const width = ThreeContainer.clientWidth;
    const height = ThreeContainer.clientHeight;
    const aspect = width / height;
    _three.camera.aspect = aspect;
    _three.camera.updateProjectionMatrix();
    _three.renderer.setSize(width, height);
    _three.renderer.clear();
    _three.renderer.render(_three.scene, _three.camera);
  }
  function loop(cesiumContainer:HTMLElement, ThreeContainer:HTMLElement) {
    requestAnimationFrame(() => loop(cesiumContainer, ThreeContainer));
    renderCesium();
    renderThreeObj(cesiumContainer, ThreeContainer);
  }
  return
}

export { pageload }