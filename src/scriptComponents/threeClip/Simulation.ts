/*
 * @Date: 2021-06-29 10:05:36
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-30 17:29:47
 * @FilePath: \cesium-web-vue\src\scriptComponents\threeClip\Simulation.ts
 */
import * as THREE from 'three';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

class Simulation {
  static DOM: HTMLElement;
  static _stats: Stats;
  scene: THREE.Scene = new THREE.Scene();
  capsScene: THREE.Scene = new THREE.Scene();
  backStencil: THREE.Scene = new THREE.Scene();
  frontStencil: THREE.Scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera | undefined;
  renderer: THREE.WebGLRenderer | undefined;
  controls: OrbitControls | undefined;
  showCaps = true;
  selection: Selection | undefined

  // 类的成员在构造函数中赋值和在上面赋值的区别是什么？
  constructor(divContainer: HTMLElement) {
    Simulation.DOM = divContainer;
    this.init()
    this.animate()
  }
  init(): void {
    this.loadModel()

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    this.camera.position.set(20, 20, 30);
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));


    // 用于渲染场景，antialias为抗锯齿
    this.renderer = new THREE.WebGLRenderer({ antialias: true});
    // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊
    this.renderer.setPixelRatio(window.devicePixelRatio);
    // 将输出canvas的大小调整为(width, height)并考虑设备像素比，且将视口从(0, 0)开始调整到适合大小 将
    this.renderer.setSize(Simulation.DOM.clientWidth, Simulation.DOM.clientHeight);
    // 设置场景颜色以及透明度
    this.renderer.setClearColor(0x00ffff);
    // 定义渲染器是否在渲染每一帧之前自动清除其输出。
    this.renderer.autoClear = false;
    Simulation.DOM.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    // this.controls.addEventListener( 'change', throttledRender );

    Simulation._stats = Stats()
    Simulation.DOM.appendChild(Simulation._stats.dom);

    this.selection = new Selection(
      new THREE.Vector3(-7, -14, -14),
      new THREE.Vector3(14, 8, 3)
    );

    // 切面红色图层
    this.capsScene.add( this.selection.boxMesh );

    // 红色的包围盒
    this.scene.add( this.selection.displayMeshes );

    return
  }
  /**
   * @description: 加载模型，可通过LoadingManager设置加强管理器
   * @param {*}
   * @return {*}
   */
  loadModel(): void {
    const loader = new ColladaLoader();
    // 载入dae模型
    loader.load('daeModel/house.dae', (collada) => {
      const _collada = collada.scene.children[0];

      function _setMaterial(node, material): void {
        node.material = material;
        if (node.children) {
          for (let i = 0; i < node.children.length; i++) {
            _setMaterial(node.children[i], material);
          }
        }
      }
      const back = collada.scene.clone();
      _setMaterial( back, MATERIAL.backStencil );
      this.backStencil.add( back );

      const front = collada.scene.clone();
      _setMaterial( front, MATERIAL.frontStencil );
      this.frontStencil.add( front );

      _setMaterial(_collada, MATERIAL.sheet);
      this.scene.add(collada.scene);
    });
  }
  animate(): void {
    requestAnimationFrame(() => {
      this.animate()
    });
    this.render()
    Simulation._stats.update();
  }
  render(): void {
    if (!this.renderer || !this.camera) return;
    this.renderer.clear();

    // 红色切面展示---其一
    if(this.backStencil.children.length) {
      const gl = this.renderer.getContext ();
      
      this.renderer.state.buffers.stencil.setTest(true);
      // this.renderer.getContext().stencilFunc(gl.ALWAYS, 1, 0xff);
      // this.renderer.getContext().stencilOp(gl.KEEP, gl.KEEP, gl.INCR)
      this.renderer.state.buffers.stencil.setFunc( gl.ALWAYS, 1, 0xff );
      this.renderer.state.buffers.stencil.setOp( gl.KEEP, gl.KEEP, gl.INCR );
      this.renderer.render( this.backStencil, this.camera );


      // this.renderer.getContext().stencilFunc(gl.ALWAYS, 12, 0xff);
      // this.renderer.getContext().stencilOp(gl.KEEP, gl.KEEP, gl.DECR)
      this.renderer.state.buffers.stencil.setFunc( gl.ALWAYS, 12, 0xff );
      this.renderer.state.buffers.stencil.setOp( gl.KEEP, gl.KEEP, gl.DECR );
      this.renderer.render( this.frontStencil, this.camera );


      // this.renderer.getContext().stencilFunc(gl.EQUAL, 1, 0xff);
      // this.renderer.getContext().stencilOp(gl.KEEP, gl.KEEP, gl.KEEP)
      this.renderer.state.buffers.stencil.setFunc( gl.EQUAL, 1, 0xff );
      this.renderer.state.buffers.stencil.setOp( gl.KEEP, gl.KEEP, gl.KEEP );
      this.renderer.render( this.capsScene, this.camera );

      this.renderer.state.buffers.stencil.setTest(false);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
/* eslint-disable */
const UNIFORMS = {

  clipping: {
    color: { type: "c", value: new THREE.Color(0x3d9ecb) },
    clippingLow: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
    clippingHigh: { type: "v3", value: new THREE.Vector3(0, 0, 0) }
  },

  caps: {
    color: { type: "c", value: new THREE.Color(0xf83610) }
  }

};

const SHADER = {

  vertex: '\
		uniform vec3 color;\
		varying vec3 pixelNormal;\
		\
		void main() {\
			\
			pixelNormal = normal;\
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
			\
		}',

  vertexClipping: '\
		uniform vec3 color;\
		uniform vec3 clippingLow;\
		uniform vec3 clippingHigh;\
		\
		varying vec3 pixelNormal;\
		varying vec4 worldPosition;\
		varying vec3 camPosition;\
		\
		void main() {\
			\
			pixelNormal = normal;\
			worldPosition = modelMatrix * vec4( position, 1.0 );\
			camPosition = cameraPosition;\
			\
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\
			\
		}',

  fragment: '\
		uniform vec3 color;\
		varying vec3 pixelNormal;\
		\
		void main( void ) {\
			\
			float shade = (\
				  3.0 * pow ( abs ( pixelNormal.y ), 2.0 )\
				+ 2.0 * pow ( abs ( pixelNormal.z ), 2.0 )\
				+ 1.0 * pow ( abs ( pixelNormal.x ), 2.0 )\
			) / 3.0;\
			\
			gl_FragColor = vec4( color * shade, 1.0 );\
			\
		}',

  fragmentClipping: '\
		uniform vec3 color;\
		uniform vec3 clippingLow;\
		uniform vec3 clippingHigh;\
		\
		varying vec3 pixelNormal;\
		varying vec4 worldPosition;\
		\
		void main( void ) {\
			\
			float shade = (\
				  3.0 * pow ( abs ( pixelNormal.y ), 2.0 )\
				+ 2.0 * pow ( abs ( pixelNormal.z ), 2.0 )\
				+ 1.0 * pow ( abs ( pixelNormal.x ), 2.0 )\
			) / 3.0;\
			\
			if (\
				   worldPosition.x < clippingLow.x\
				|| worldPosition.x > clippingHigh.x\
				|| worldPosition.y < clippingLow.y\
				|| worldPosition.y > clippingHigh.y\
				|| worldPosition.z < clippingLow.z\
				|| worldPosition.z > clippingHigh.z\
			) {\
				\
				discard;\
				\
			} else {\
				\
				gl_FragColor = vec4( color * shade, 1.0 );\
				\
			}\
			\
		}',

  fragmentClippingFront: '\
		uniform vec3 color;\
		uniform vec3 clippingLow;\
		uniform vec3 clippingHigh;\
		\
		varying vec3 pixelNormal;\
		varying vec4 worldPosition;\
		varying vec3 camPosition;\
		\
		void main( void ) {\
			\
			float shade = (\
				  3.0 * pow ( abs ( pixelNormal.y ), 2.0 )\
				+ 2.0 * pow ( abs ( pixelNormal.z ), 2.0 )\
				+ 1.0 * pow ( abs ( pixelNormal.x ), 2.0 )\
			) / 3.0;\
			\
			if (\
				   worldPosition.x < clippingLow.x  && camPosition.x < clippingLow.x\
				|| worldPosition.x > clippingHigh.x && camPosition.x > clippingHigh.x\
				|| worldPosition.y < clippingLow.y  && camPosition.y < clippingLow.y\
				|| worldPosition.y > clippingHigh.y && camPosition.y > clippingHigh.y\
				|| worldPosition.z < clippingLow.z  && camPosition.z < clippingLow.z\
				|| worldPosition.z > clippingHigh.z && camPosition.z > clippingHigh.z\
			) {\
				\
				discard;\
				\
			} else {\
				\
				gl_FragColor = vec4( color * shade, 1.0 );\
				\
			}\
			\
		}',

  invisibleVertexShader: '\
		void main() {\
			vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );\
			gl_Position = projectionMatrix * mvPosition;\
		}',

  invisibleFragmentShader: '\
		void main( void ) {\
			gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );\
			discard;\
		}'

};

const MATERIAL = {

  sheet: new THREE.ShaderMaterial({
    uniforms: UNIFORMS.clipping,
    vertexShader: SHADER.vertexClipping,
    fragmentShader: SHADER.fragmentClipping
  }),

  cap: new THREE.ShaderMaterial({
    uniforms: UNIFORMS.caps,
    vertexShader: SHADER.vertex,
    fragmentShader: SHADER.fragment
  }),

  backStencil: new THREE.ShaderMaterial({
    uniforms: UNIFORMS.clipping,
    vertexShader: SHADER.vertexClipping,
    fragmentShader: SHADER.fragmentClippingFront,
    colorWrite: false,
    depthWrite: false,
    side: THREE.BackSide
  }),

  frontStencil: new THREE.ShaderMaterial({
    uniforms: UNIFORMS.clipping,
    vertexShader: SHADER.vertexClipping,
    fragmentShader: SHADER.fragmentClippingFront,
    colorWrite: false,
    depthWrite: false,
  }),

  BoxBackFace: new THREE.MeshBasicMaterial({ color: 0xEEDDCC, transparent: true }),
  BoxWireframe: new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 }),
  BoxWireActive: new THREE.LineBasicMaterial({ color: 0xf83610, linewidth: 4 }),

  Invisible: new THREE.ShaderMaterial({
    vertexShader: SHADER.invisibleVertexShader,
    fragmentShader: SHADER.invisibleFragmentShader
  })

};

class Selection {
  limitLow: THREE.Vector3;
  limitHigh: THREE.Vector3;
  box: THREE.BoxGeometry;
  boxMesh: THREE.Mesh;
  vertices: THREE.Vector3[];
  displayMeshes: THREE.Object3D;
  touchMeshes: THREE.Object3D;
  selectables: any[];
  lineGeometries: any[];
  meshGeometries: any[];
  planes: any[];
  faces: any[];
  constructor(low, high) {
    this.limitLow = low;
    this.limitHigh = high;
    this.box = new THREE.BoxGeometry(1, 1, 1);
    this.boxMesh = new THREE.Mesh(this.box, MATERIAL.cap);
    this.vertices = [
      new THREE.Vector3(), new THREE.Vector3(),
      new THREE.Vector3(), new THREE.Vector3(),
      new THREE.Vector3(), new THREE.Vector3(),
      new THREE.Vector3(), new THREE.Vector3()
    ];

    this.updateVertices();
    let v = this.vertices;
    this.displayMeshes = new THREE.Object3D();
    this.touchMeshes = new THREE.Object3D();
    this.selectables = [];
    this.lineGeometries = []

    this.meshGeometries = [];
    this.planes = [];

    this.faces = [];
    var f = this.faces;
    this.faces.push(new SelectionBoxFace('y1', v[0], v[1], v[5], v[4], this));
    this.faces.push(new SelectionBoxFace('z1', v[0], v[2], v[3], v[1], this));
    this.faces.push(new SelectionBoxFace('x1', v[0], v[4], v[6], v[2], this));
    this.faces.push(new SelectionBoxFace('x2', v[7], v[5], v[1], v[3], this));
    this.faces.push(new SelectionBoxFace('y2', v[7], v[3], v[2], v[6], this));
    this.faces.push(new SelectionBoxFace('z2', v[7], v[6], v[4], v[5], this));

    new SelectionBoxLine(v[0], v[1], f[0], f[1], this);
    new SelectionBoxLine(v[0], v[2], f[1], f[2], this);
    new SelectionBoxLine(v[0], v[4], f[0], f[2], this);
    new SelectionBoxLine(v[1], v[3], f[1], f[3], this);
    new SelectionBoxLine(v[1], v[5], f[0], f[3], this);
    new SelectionBoxLine(v[2], v[3], f[1], f[4], this);
    new SelectionBoxLine(v[2], v[6], f[2], f[4], this);
    new SelectionBoxLine(v[3], v[7], f[3], f[4], this);
    new SelectionBoxLine(v[4], v[5], f[0], f[5], this);
    new SelectionBoxLine(v[4], v[6], f[2], f[5], this);
    new SelectionBoxLine(v[5], v[7], f[3], f[5], this);
    new SelectionBoxLine(v[6], v[7], f[4], f[5], this);

    this.setBox();
    this.setUniforms();

  }
  updateVertices() {

    this.vertices[0].set(this.limitLow.x, this.limitLow.y, this.limitLow.z);
    this.vertices[1].set(this.limitHigh.x, this.limitLow.y, this.limitLow.z);
    this.vertices[2].set(this.limitLow.x, this.limitHigh.y, this.limitLow.z);
    this.vertices[3].set(this.limitHigh.x, this.limitHigh.y, this.limitLow.z);
    this.vertices[4].set(this.limitLow.x, this.limitLow.y, this.limitHigh.z);
    this.vertices[5].set(this.limitHigh.x, this.limitLow.y, this.limitHigh.z);
    this.vertices[6].set(this.limitLow.x, this.limitHigh.y, this.limitHigh.z);
    this.vertices[7].set(this.limitHigh.x, this.limitHigh.y, this.limitHigh.z);

  }
  setBox() {
    var width = new THREE.Vector3();
    width.subVectors(this.limitHigh, this.limitLow);
    this.boxMesh.scale.copy(width);
    width.multiplyScalar(0.5).add(this.limitLow);
    this.boxMesh.position.copy(width);

  }

  setUniforms() {
    var uniforms = UNIFORMS.clipping;
    uniforms.clippingLow.value.copy(this.limitLow);
    uniforms.clippingHigh.value.copy(this.limitHigh);
  }
}

interface _frontBackFaceGeometry extends THREE.BufferGeometry {
  dynamic: boolean
}
interface _frontFaceMesh extends THREE.Mesh {
  axis: string,
  guardian: SelectionBoxFace
}
/**
 * @description: 创建包围盒的平面，分为两类，一类全透明front，一类带颜色back
 * @param {*}
 * @return {*}
 */
class SelectionBoxFace {
  lines: any[] = [];
  constructor(axis:string, v0:THREE.Vector3, v1:THREE.Vector3, v2:THREE.Vector3, v3:THREE.Vector3, selection:Selection) {
    const frontFaceGeometry = this.createPlaneGeometry(v0, v1, v2, v3);
    // 待定
    const _frontFaceGeometry: _frontBackFaceGeometry = Object.assign({}, frontFaceGeometry, {
      dynamic: true
    })

    selection.meshGeometries.push(_frontFaceGeometry);

    const frontFaceMesh = new THREE.Mesh(frontFaceGeometry, MATERIAL.Invisible);
    const _frontFaceMesh: _frontFaceMesh = Object.assign({}, frontFaceMesh, {
      axis: axis,
      guardian: this
    })
    selection.touchMeshes.add(frontFaceMesh);
    selection.selectables.push(_frontFaceMesh);
    selection.planes.push(_frontFaceMesh);

    const backFaceGeometry = this.createPlaneGeometry(v3, v2, v1, v0);
    const _backFaceGeometry: _frontBackFaceGeometry = Object.assign({}, backFaceGeometry, {
      dynamic: true
    })
    selection.meshGeometries.push(_backFaceGeometry);

    const backFaceMesh = new THREE.Mesh(backFaceGeometry, MATERIAL.BoxBackFace);
    selection.displayMeshes.add(backFaceMesh);
  }
  createPlaneGeometry(v0: THREE.Vector3, v1: THREE.Vector3, v2: THREE.Vector3, v3: THREE.Vector3) {
    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      v0.x, v0.y, v0.z,
      v1.x, v1.y, v1.z,
      v2.x, v2.y, v2.z,
      v2.x, v2.y, v2.z,
      v3.x, v3.y, v3.z,
      v0.x, v0.y, v0.z
    ]);
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    return geometry
  }
  rayOver() {
    this.highlightLines(true);
  }

  rayOut() {
    this.highlightLines(false);
  }

  highlightLines(b) {
    for (var i = 0; i < this.lines.length; i++) {
      this.lines[i].setHighlight(b);
    }
  }
}

class SelectionBoxLine {
  line: THREE.LineSegments;
  constructor(v0:THREE.Vector3, v1:THREE.Vector3, f0:SelectionBoxFace, f1:SelectionBoxFace, selection) {
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([v0, v1]);
    // lineGeometry.computeLineDistances();
    // lineGeometry.dynamic = true;
    selection.lineGeometries.push(lineGeometry);

    this.line = new THREE.LineSegments(lineGeometry, MATERIAL.BoxWireframe);
    selection.displayMeshes.add(this.line);

    f0.lines.push(this);
    f1.lines.push(this);
  }
  setHighlight(b) {
    this.line.material = b ? MATERIAL.BoxWireActive : MATERIAL.BoxWireframe;
  }
}


/* eslint-disable */
export default Simulation