/*
 * @Date: 2021-08-07 09:42:39
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-26 16:46:10
 * @FilePath: /cesium-web-vue/src/views/stencilClip.ts
 */
import * as THREE from 'three';
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { routerClip, threeFaceClip } from './stencilClipType';

let _dbEvent
export default class stencilClip {
  objAndMtls: any[] = []
  stencilGroup = new THREE.Group();
  modelGroup = new THREE.Group;
  poGroup = new THREE.Group();
  lineGroup = new THREE.Group();
  _scene: THREE.Scene
  _camera: THREE.PerspectiveCamera
  clipOptions: routerClip | threeFaceClip
  planes: THREE.Plane[][] = [];
  planeObjects: THREE.Mesh[][] = [];
  planCenterMap: THREE.Vector3[] = []
  planLengthMap: number[] = []
  selectPolyline: THREE.Vector3[] = [];
  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, clipOptions: routerClip | threeFaceClip) {
    this._scene = scene;
    this._camera = camera;
    this.clipOptions = clipOptions
    
    // 初始化用于切割的planes和用于可视化的planeObjects
    this._scene.add(this.stencilGroup);
    this._scene.add(this.modelGroup);
    this._scene.add(this.poGroup);
    this._scene.add(this.lineGroup);
  }
  initPlanes(): void {
    // 如果为自定义切割模式，则默认返回空二维数组
    if('isSelecting' in this.clipOptions) {
      return
    }
    const planes: THREE.Plane[][] = [[], [], []];
    let plane0 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
    let plane1 = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    let plane2 = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    if(!('isSelecting' in this.clipOptions)) {
      plane0 = this.clipOptions.negateX ? plane0.negate() : plane0
      plane1 = this.clipOptions.negateY ? plane1.negate() : plane1
      plane2 = this.clipOptions.negateZ ? plane2.negate() : plane2
    }
    for (let i = 0; i < this.objAndMtls.length; i++) {
      planes[0].push(plane0);
      planes[1].push(plane1);
      planes[2].push(plane2);
    }
    this.planes = planes;
    this.planeObjects = this.planes.map(() => []);
  }
  async loadModels(modelPath: string, modelNameArr: string[]) {
    for (let i = 0; i < modelNameArr.length; i++) {
      const item = modelNameArr[i];
      const mtl = await new MTLLoader()
        .setPath(modelPath)
        .loadAsync(`${item}.mtl`);
      const obj = await new OBJLoader()
        .setMaterials(mtl)
        .setPath(modelPath)
        .loadAsync(`${item}.obj`);
      obj.scale.set(0.001, 0.001, 0.001);
      this.objAndMtls.push({
        obj,
        mtl,
      });
      this.modelGroup.add(obj)
    }
    this.initPlanes();
    // 当切割模式为三面裁剪时，在加载模型后立即开始切割模型
    if(!('isSelecting' in this.clipOptions)) {
      this.clipModel();
    }
  }
  clipModel() {
    let clippingPlanes:THREE.Plane[] = []
    this.planes.forEach(item => {
      clippingPlanes = clippingPlanes.concat(item);
    })
    for (let x = 0; x < this.planes.length; x++) {
      for (let i = 0; i < this.objAndMtls.length; i++) {
        const layerModel = this.objAndMtls[i].obj;

        layerModel.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.material.clippingPlanes = clippingPlanes;
            // child.material.clipIntersection = true;
            child.castShadow = true; // ??
            child.renderOrder = 6; // ??
          }
        });

        let planeGeom = new THREE.PlaneGeometry(1000, 1000);
        if(!('isSelecting' in this.clipOptions)) { 
          this.clipOptions.onlyShowPlanes && this._scene.remove(this.modelGroup)
        } else {
          // planeGeom.parameters.height = this.planLengthMap[x]
          planeGeom = new THREE.PlaneGeometry(1000, this.planLengthMap[x]);
        }

        const plane = this.planes[x][i];
        layerModel.children.forEach((itemModel) => {
          const _itemModel = itemModel as THREE.Mesh;
          const _itemModelMaterial = _itemModel.material as THREE.MeshBasicMaterial;
          const geometry = _itemModel.geometry.clone();
          // 线框模式
          _itemModelMaterial.wireframe = false

          const stencilGroup = this.createPlaneStencilGroup(
            geometry,
            plane,
            i + 2.2
          );
          stencilGroup.scale.set(0.001, 0.001, 0.001);
          this.stencilGroup.add(stencilGroup);
        });

        let result: THREE.Plane[] = [];
        this.planes.forEach((item, index) => {
          if(index !== x) {
            result = result.concat(item);
          }
        })
        // plane会被其他clipping planes裁剪
        const planeMat = new THREE.MeshStandardMaterial({
          side: THREE.DoubleSide,
          color: layerModel.children[0].material.color,
          stencilWrite: true,
          stencilRef: 0,
          stencilFunc: THREE.NotEqualStencilFunc,
          // clipIntersection: true,
        });

        // 若为threeFaceClip，且clipEachOther为true，此时让各个切平面互相裁剪
        if(!('isSelecting' in this.clipOptions) && this.clipOptions.clipEachOther) {
          planeMat.clippingPlanes = result
        }

        const po = new THREE.Mesh(planeGeom, planeMat);
        po.onAfterRender = (renderer) => {
          renderer.clearStencil();
        };
        // 设置填充面渲染优先级，需要和模版缓冲区域的优先级保持一致
        po.renderOrder = i + 2.2;
        this.poGroup.add(po);
        this.planeObjects[x].push(po);
      }
    }
    const tmp = new THREE.Vector3();
    this.poGroup.getWorldPosition(tmp)
  }
  /**
   * @description: 在切割后的模型所在位置创建模板缓冲区
   * @param {THREE.BufferGeometry} [layerModel] 模型的child geometry
   * @param {THREE.Plane} [plane] 切平面，该平面不是用来展示切面的平面，而是用来切割模型的plane
   * @param {number} [renderOrder] 设置每个缓冲mesh渲染顺序，用于renderOrder高的能在更上层显示
   * @return {THREE.Group}
   */  
  createPlaneStencilGroup(
    layerModel: THREE.BufferGeometry,
    plane: THREE.Plane,
    renderOrder: number
  ): THREE.Group {
    const group: THREE.Group = new THREE.Group();
    const baseMat: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial();
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
    mat0.stencilZPass = THREE.IncrementWrapStencilOp;

    const mesh0: THREE.Mesh = new THREE.Mesh(layerModel, mat0);
    mesh0.renderOrder = renderOrder;
    group.add(mesh0);

    // front faces
    const mat1 = baseMat.clone();
    mat1.side = THREE.FrontSide;
    mat1.clippingPlanes = [plane];
    // DecrementWrapStencilOp将当前stencil value减少1
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;

    const mesh1 = new THREE.Mesh(layerModel, mat1);
    mesh1.renderOrder = renderOrder;

    group.add(mesh1);

    return group;
  }
  /**
   * @description: 选择路径时，鼠标双击事件。用于removeEventListener
   * @param {HTMLElement} container
   * @param {*} e 鼠标参数
   * @return {*}
   */  
  dbEvent(container: HTMLElement, e: any): void {
    const mouse = new THREE.Vector2();
    mouse.x = ((e.clientX - container.getBoundingClientRect().left) / container.offsetWidth) * 2 - 1;
    mouse.y = -((e.clientY - container.getBoundingClientRect().top) / container .offsetHeight) * 2 + 1;
    const vector = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(this._camera);
    const raycaster = new THREE.Raycaster(this._camera.position, vector.sub(this._camera.position).normalize());
    const intersects = raycaster.intersectObjects(this.modelGroup.children[0].children, true);
    if (intersects.length > 0) {
        const point = intersects[0].point; //射线在模型表面拾取的点坐标
        this.selectPolyline.push(point);
    }
  
    if(this.selectPolyline.length === 2) {
      // 中点xy坐标
      const polyCenter = new THREE.Vector3();
      polyCenter.x = (this.selectPolyline[0].x + this.selectPolyline[1].x)/2;
      polyCenter.y = (this.selectPolyline[0].y + this.selectPolyline[1].y)/2;
      this.planCenterMap.push(polyCenter.clone())
      // 两点连线的距离
      const polyLen = new THREE.Vector3(this.selectPolyline[0].x - this.selectPolyline[1].x, this.selectPolyline[0].y - this.selectPolyline[1].y, 0).length();
      this.planLengthMap.push(polyLen)
      // 第二个点沿Z垂直向负方向的1单位的点
      const test = new THREE.Vector3(this.selectPolyline[1].x, this.selectPolyline[1].y, this.selectPolyline[1].z - 1)
      
      // 构成切面的法向量和原点距离
      const normalize = this.selectPolyline[1].clone().sub(this.selectPolyline[0]).cross(test.sub(this.selectPolyline[0])).normalize().negate();
      const distance = (-this.selectPolyline[0].dot(normalize)) / (Math.sqrt(normalize.x * normalize.x + normalize.y * normalize.y + normalize.z * normalize.z));
  
      const planex = new THREE.Plane(new THREE.Vector3(normalize.x, normalize.y, normalize.z), distance);
      this.planes.push([]);
      this.planeObjects.push([]);
      for (let i = 0; i < this.objAndMtls.length; i++) {
        this.planes[this.planes.length - 1].push(planex);
      }
  
      const material = new THREE.LineBasicMaterial({
        color: 0x0000ff
      });
  
      const geometry = new THREE.BufferGeometry().setFromPoints( this.selectPolyline );
      const line = new THREE.Line( geometry, material );
      this.lineGroup.add( line );
      this.selectPolyline.shift();
    }
  }
  selectRouter(container: HTMLElement) {
    _dbEvent = this.dbEvent.bind(this, container);
    container.addEventListener('dblclick', _dbEvent, false);
  }
  endSelectRouter(container: HTMLElement) {
    // this._scene.remove(this.lineGroup);
    this.clipModel();
    // this._scene.remove(this.modelGroup);
    container.removeEventListener('dblclick', _dbEvent)
  }
  onlyShowPlanes(isShowPlanes) {
    if(isShowPlanes) {
      this._scene.remove(this.modelGroup);
    } else {
      this._scene.add(this.modelGroup);
    }
  }
  lookAtPlane() {
    const _lookAtPlane = () => {
      for (let x = 0; x < this.planes.length; x++) {
        for (let i = 0; i < this.objAndMtls.length; i++) {
          const plane = this.planes[x][i];
          const po = this.planeObjects[x][i];
          // 确定po所在的坐标，即plane.position（plane坐标）* -constant（plane距离原点的位置）
          if('isSelecting' in this.clipOptions) {
            // 调整每一个路径对应的填充plan坐标
            po.position.copy(this.planCenterMap[x])
          } else {
            plane.coplanarPoint(po.position);
          }
          // // mesh.lookAt起什么作用
          // if(x == 1 && i == 2) {
          //   console.log('po.position :>> ', po.position);
          //   console.log('plane.normal :>> ', plane.normal);
          // }
          /* 本来lookAt用于camera，传入的(x, y, z)就代表camera所朝向的物体坐标
           * 在这里lookAt用于po上，此时(x,y,z)，代表po应该朝向的点。在这里该点在裁切面法线反向延长线
           * webGL中的lookAt函数三个变量分别是：eye，target，up，需要与threeJS封装后的lookAt区分
           * threeJS封装后的lookAt只需要关注物体（camera）朝向的坐标，无需关心up
          */
          po.lookAt(
            po.position.x - plane.normal.x,
            po.position.y - plane.normal.y,
            po.position.z - plane.normal.z,
          );
        }
      }
    }

    // 只有在clipOptions中传入了routerClip/threeFaceClip参数后，才允许调整plane的lookAt
    if('isSelecting' in this.clipOptions) {
      // 若为routerClip，需要在选取路径结束后调用_lookAtPlane
      if(!this.clipOptions.isSelecting.value) {
        _lookAtPlane()
      }
    } else {
      _lookAtPlane()
    }
  }
  /**
   * @description: 在三面裁剪和自定义切割之间切换时，重置模型
   * @param {*}
   * @return {*}
   */  
  resetModel() {
    this._scene.remove(this.stencilGroup);
    this._scene.remove(this.modelGroup);
    this._scene.remove(this.poGroup);
    this._scene.remove(this.lineGroup);
  }
}