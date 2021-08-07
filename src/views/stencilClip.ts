/*
 * @Date: 2021-08-07 09:42:39
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-08-07 15:03:58
 * @FilePath: \cesium-web-vue\src\views\stencilClip.ts
 */
import * as THREE from 'three';
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
interface clipOptions {
  negateX?: boolean
  negateY?: boolean
  negateZ?: boolean
  onlyShowPlans?: boolean
  clipEachOther?: boolean
}

export default class stencilClip {
  objectGroup = new THREE.Group();
  modelGroup = new THREE.Group;
  poGroup = new THREE.Group();
  _scene: THREE.Scene
  modelNames: string[]
  modelPath: string
  clipOptions: clipOptions
  planes: THREE.Plane[][]
  planeObjects: THREE.Mesh[][]
  constructor(scene: THREE.Scene, modelNames, modelPath, clipOptions: clipOptions) {
    this._scene = scene;
    this.modelNames = modelNames
    this.modelPath = modelPath
    this.clipOptions = clipOptions

    this.planes = this.initPlanes()
    this.planeObjects = [ [], [], [] ]
    this._scene.add(this.objectGroup);
    this._scene.add(this.modelGroup);
    this._scene.add(this.poGroup);
  }
  initPlanes(): THREE.Plane[][] {
    const planes: THREE.Plane[][] = [[], [], []];
    let plane0 = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
    let plane1 = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    let plane2 = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
    plane0 = this.clipOptions.negateX ? plane0.negate() : plane0
    plane1 = this.clipOptions.negateY ? plane1.negate() : plane1
    plane2 = this.clipOptions.negateZ ? plane2.negate() : plane2
    for (let i = 0; i < this.modelNames.length; i++) {
      planes[0].push(plane0);
      planes[1].push(plane1);
      planes[2].push(plane2);
    }
    return planes
  }
  async loadModels() {
    
    const objAndMtls: any[] = [];

    for (let i = 0; i < this.modelNames.length; i++) {
      const item = this.modelNames[i];
      const mtl = await new MTLLoader()
        .setPath(this.modelPath)
        .loadAsync(`${item}.mtl`);
      const obj = await new OBJLoader()
        .setMaterials(mtl)
        .setPath(this.modelPath)
        .loadAsync(`${item}.obj`);
      obj.scale.set(0.001, 0.001, 0.001);
      objAndMtls.push({
        obj,
        mtl,
      });
    }

    let clippingPlanes:THREE.Plane[] = []
    this.planes.forEach(item => {
      clippingPlanes = clippingPlanes.concat(item);
    })
    for (let x = 0; x < this.planes.length; x++) {
      for (let i = 0; i < this.modelNames.length; i++) {
        const layerModel = objAndMtls[i].obj;
        layerModel.traverse((child: THREE.Object3D) => {
          if (child instanceof THREE.Mesh) {
            child.material.clippingPlanes = clippingPlanes;
            child.castShadow = true; // ??
            child.renderOrder = 6; // ??
          }
        });
        !this.clipOptions.onlyShowPlans && this.modelGroup.add(layerModel);

        const planeGeom = new THREE.PlaneBufferGeometry(1, 1);
        const plane = this.planes[x][i];

        layerModel.children.forEach((itemModel) => {
          const _itemModel = itemModel as THREE.Mesh;
          const geometry = _itemModel.geometry.clone();

          const stencilGroup = this.createPlaneStencilGroup(
            geometry,
            plane,
            i + 2.2
          );
          stencilGroup.scale.set(0.001, 0.001, 0.001);
          this.objectGroup.add(stencilGroup);
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
          clippingPlanes: this.clipOptions.clipEachOther ? result : undefined,
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
        this.poGroup.add(po);
        this.planeObjects[x].push(po);
      }
    }
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
    mat0.stencilFunc = THREE.AlwaysStencilFunc;
    mat0.stencilFail = THREE.IncrementWrapStencilOp;
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
    mat1.stencilFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZFail = THREE.DecrementWrapStencilOp;
    mat1.stencilZPass = THREE.DecrementWrapStencilOp;

    const mesh1 = new THREE.Mesh(layerModel, mat1);
    mesh1.renderOrder = renderOrder;

    group.add(mesh1);

    return group;
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
  changeShowType(showType) {
    if(showType === "切面展示") {
      this._scene.remove(this.modelGroup);
    } else if(showType === "三面裁剪") {
      // this._scene.remove(this.modelGroup);
    }
  }
  lookAtPlane() {
    for (let x = 0; x < this.planes.length; x++) {
      for (let i = 0; i < this.modelNames.length; i++) {
        const plane = this.planes[x][i];
        const po = this.planeObjects[x][i];

        plane.coplanarPoint(po.position);

        // mesh.lookAt起什么作用
        po.lookAt(
          po.position.x - plane.normal.x,
          po.position.y - plane.normal.y,
          po.position.z - plane.normal.z
        );
      }
    }
  }
}