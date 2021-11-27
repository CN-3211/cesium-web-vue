/*
 * @Date: 2021-08-07 09:42:39
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-11-20 11:17:03
 * @FilePath: \cesium-web-vue\src\views\stencilClip.ts
 */
import * as THREE from 'three';
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

import { Ref } from 'vue';
interface threeFaceClip {
  onlyShowPlanes: boolean
  negateX?: boolean
  negateY?: boolean
  negateZ?: boolean
}
interface routerClip {
  isSelecting: Ref<boolean>
}

interface clipOptions {
  routerClip?: routerClip
  threeFaceClip?: threeFaceClip
  clipEachOther?: boolean
}

export default class stencilClip {
  objAndMtls: any[]
  stencilGroup = new THREE.Group();
  modelGroup = new THREE.Group;
  poGroup = new THREE.Group();
  lineGroup = new THREE.Group();
  _scene: THREE.Scene
  clipOptions: clipOptions
  planes: THREE.Plane[][] = [];
  planeObjects: THREE.Mesh[][] = [];
  selectPoints: THREE.Vector3[] = [];
  testCenter: THREE.Vector3 = new THREE.Vector3();
  testNumber = 1;
  constructor(scene: THREE.Scene, clipOptions: clipOptions) {
    this._scene = scene;
    this.objAndMtls = [];
    this.clipOptions = clipOptions
    
    // 初始化用于切割的planes和用于可视化的planeObjects
    
    this._scene.add(this.stencilGroup);
    this._scene.add(this.modelGroup);
    this._scene.add(this.poGroup);
    this._scene.add(this.lineGroup);
  }
  initPlanes(): void {
    // 如果为自定义切割模式，则默认返回空二维数组
    if(this.clipOptions.routerClip) {
      return
    }
    const planes: THREE.Plane[][] = [[], [], []];
    let plane0 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
    let plane1 = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    let plane2 = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    plane0 = this.clipOptions.threeFaceClip?.negateX ? plane0.negate() : plane0
    plane1 = this.clipOptions.threeFaceClip?.negateY ? plane1.negate() : plane1
    plane2 = this.clipOptions.threeFaceClip?.negateZ ? plane2.negate() : plane2
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
    if(this.clipOptions.threeFaceClip) {
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
        if(this.clipOptions.threeFaceClip) { 
          this.clipOptions.threeFaceClip?.onlyShowPlanes && this._scene.remove(this.modelGroup)
        }
        // const planeGeom = new THREE.PlaneGeometry(10000, this.testNumber);
        const planeGeom = new THREE.PlaneGeometry(10000, 10000);

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
        this.clipOptions.clipEachOther && (planeMat.clippingPlanes = result)
        const po = new THREE.Mesh(planeGeom, planeMat);
        console.log('po', po);
        po.onAfterRender = (renderer) => {
          renderer.clearStencil();
        };
        po.renderOrder = i + 2.2;
        this.poGroup.add(po);

        this.planeObjects[x].push(po);
      }
    }
    const tmp = new THREE.Vector3();
    this.poGroup.getWorldPosition(tmp)
    console.log('this.poGroup.getWorldPosition', tmp);
    console.log('this.poGroup.normal', this.poGroup.up);
    setTimeout(() => {
      // this.poGroup.position.setX(this.testCenter.x);
      // this.poGroup.position.setY(this.testCenter.y);
    }, 2000)
    console.log('this.poGroup.position2', this.poGroup.position);
    console.log('this.poGroup', this.poGroup);
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
  selectRouter2(container: HTMLElement, camera: THREE.PerspectiveCamera) {
    const selectPolyline: THREE.Vector3[] = [new THREE.Vector3(0.5, 2, 0), new THREE.Vector3(1.2, 2, 0)];
    console.log('object :>> ', selectPolyline);
    this.testCenter.x = (selectPolyline[0].x + selectPolyline[1].x)/2;
    this.testCenter.y = (selectPolyline[0].y + selectPolyline[1].y)/2;
    this.testNumber = selectPolyline[1].clone().sub(selectPolyline[0]).length();
    const test = new THREE.Vector3(selectPolyline[1].x, selectPolyline[1].y, selectPolyline[1].z - 1)
    const normalize = selectPolyline[1].clone().sub(selectPolyline[0]).cross(test.sub(selectPolyline[0])).normalize();
    const distance = (-selectPolyline[0].dot(normalize)) / (Math.sqrt(normalize.x * normalize.x + normalize.y * normalize.y + normalize.z * normalize.z));
    console.log('distance', distance);
    const planex = new THREE.Plane(new THREE.Vector3(normalize.x, normalize.y, normalize.z), distance);
    this.planes.push([]);
    this.planeObjects.push([]);
    for (let i = 0; i < this.objAndMtls.length; i++) {
      this.planes[this.planes.length - 1].push(planex);
    }

    const material = new THREE.LineBasicMaterial({
      color: 0x0000ff,
      
    });
    const geometry = new THREE.BufferGeometry().setFromPoints( selectPolyline );
    const line = new THREE.Line( geometry, material );
    this.lineGroup.add( line );
  }
  createBoxStencil(selectPolyline: THREE.Vector3[]) {

    const geometry = new THREE.BoxGeometry( this.testNumber, this.testNumber, this.testNumber );
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    material.colorWrite = false;
    material.depthWrite = false;
    material.depthTest = false;
    material.colorWrite = false;
    material.stencilWrite = true;
    material.stencilFunc = THREE.AlwaysStencilFunc;
    const mat0 = material.clone();
    mat0.side = THREE.BackSide;
    // IncrementWrapStencilOp将当前stencil value增加1
    mat0.stencilZPass = THREE.IncrementWrapStencilOp;

    const mat1 = material.clone();
    mat1.side = THREE.FrontSide;
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;

    const cube = new THREE.Mesh( geometry, material );
    cube.position.set(this.testCenter.x, this.testCenter.y, this.testCenter.z);
    cube.lookAt(new THREE.Vector3(0, 0, 0))
    this._scene.add( cube );
    console.log('',111);
  }

  selectRouter(container: HTMLElement, camera: THREE.PerspectiveCamera) {
    const mouse = new THREE.Vector2();
    const selectPolyline: THREE.Vector3[] = [];
    const dbEvent = e => {
      mouse.x = ((e.clientX - container.getBoundingClientRect().left) / container.offsetWidth) * 2 - 1;
      mouse.y = -((e.clientY - container  .getBoundingClientRect().top) / container .offsetHeight) * 2 + 1;
      const vector = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(camera);
      const raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
      const intersects = raycaster.intersectObjects(this.modelGroup.children[0].children, true);
      if (intersects.length > 0) {
          const point = intersects[0].point; //射线在模型表面拾取的点坐标
        console.log('intersects', intersects);
          selectPolyline.push(point);
      }
  
      if(selectPolyline.length === 2) {
        console.log('selectPolyline :>> ', selectPolyline);
        this.testCenter.x = (selectPolyline[0].x + selectPolyline[1].x)/2;
        this.testCenter.y = (selectPolyline[0].y + selectPolyline[1].y)/2;
        this.testNumber = selectPolyline[1].clone().sub(selectPolyline[0]).length();
        const test = new THREE.Vector3(selectPolyline[1].x, selectPolyline[1].y, selectPolyline[1].z - 1)
        console.log('sub :>> ', selectPolyline[1].clone().sub(selectPolyline[0]));
        const normalize = selectPolyline[1].clone().sub(selectPolyline[0]).cross(test.sub(selectPolyline[0])).normalize().negate();
        console.log('normalize :>> ', normalize);
        const distance = (-selectPolyline[0].dot(normalize)) / (Math.sqrt(normalize.x * normalize.x + normalize.y * normalize.y + normalize.z * normalize.z));
        console.log('distance', distance);
        const planex = new THREE.Plane(new THREE.Vector3(normalize.x, normalize.y, normalize.z), distance);
        this.planes.push([]);
        this.planeObjects.push([]);
        for (let i = 0; i < this.objAndMtls.length; i++) {
          this.planes[this.planes.length - 1].push(planex);
        }
  
        const material = new THREE.LineBasicMaterial({
          color: 0x0000ff
        });

       

        const geometry = new THREE.BufferGeometry().setFromPoints( selectPolyline );
        const line = new THREE.Line( geometry, material );
        this.lineGroup.add( line );
        // this.createBoxStencil(selectPolyline)
        selectPolyline.shift();
      }
    };
    container.addEventListener('dblclick', dbEvent, false);
  }
  endSelectRouter() {
    this._scene.remove(this.lineGroup);
    this.clipModel();
    this._scene.remove(this.modelGroup);
    // setTimeout(() => {
    //   this.stencilGroup.visible = false;
    //   this.modelGroup.children.forEach(layerModel => {
    //     layerModel.traverse((child: THREE.Object3D) => {
    //       if (child instanceof THREE.Mesh) {
    //         child.material.clippingPlanes = '';
    //         child.castShadow = true; // ??
    //         child.renderOrder = 6; // ??
    //       }
    //     });
    //   })
    // }, 5000)
  }
  changeClippingPlaneShowModel(mutualed: boolean) {
    
    this.poGroup.children.forEach(item => {
      const _item = item as any;
      if(!_item.material) {
        throw new Error("material不存在");
      }
      _item.material.clippingPlanes = null;
    })
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
  
          plane.coplanarPoint(po.position);
          // mesh.lookAt起什么作用
          po.lookAt(
            po.position.x - plane.normal.x,
            po.position.y - plane.normal.y,
            po.position.z - plane.normal.z,
          );
        }
      }
    }

    // 只有在clipOptions中传入了routerClip/threeFaceClip参数后，才允许调整plane的lookAt
    if(this.clipOptions.routerClip) {
      // 若为routerClip，需要在选取路径结束后调用_lookAtPlane
      if(!this.clipOptions.routerClip.isSelecting.value) {
        _lookAtPlane()
      }
    } else if(this.clipOptions.threeFaceClip) {
      _lookAtPlane()
    }
  }
}