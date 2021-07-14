<!--
 * @Date: 2021-06-02 17:39:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-12 15:56:28
 * @FilePath: \cesium-web-vue\src\views\clipModel3.vue
-->
<template>
  <div class="clip-Model">
    <div id="cesiumContainer"></div>
    <div class="container">
      <div class="slip">
        <span class="demonstration">Y轴裁剪</span>
        <el-slider
          v-model="state.targetTop"
          :min="-180"
          :max="180"
          :show-input="true"
          :show-input-controls="false"
          input-size="mini"
        ></el-slider>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, onMounted } from "vue";

import * as Cesium from "cesium";
import { createClippingPlanes, getPlaneDirection } from "../utils/vue-utils/clipping/clipModel";
import { createHandler } from "../utils/c-utils";
// direction存放表示方向的字符串常量
import { direction } from '@/constant/index';
import transform from "@/utils/vue-utils/transform/transform";

interface pickedObject {
  id: Cesium.Entity;
  primitive: Cesium.Primitive;
}

let tileset: Cesium.Cesium3DTileset;
let selectedPlane: any;
let selectedPlaneEntity: any;
const CLIP_TYPE = 'all'

export default {
  // setup返回值应该怎么定义类型
  setup() {
    const state = reactive({
      targetTop: 100,
      targetBottom: 0,
      targetWest: 330,
      targetEast: 330,
    });
    

    onMounted(() => {
      const viewer: Cesium.Viewer = new Cesium.Viewer("cesiumContainer");
      viewer.scene.globe.depthTestAgainstTerrain = true;

      // 鼠标左键down获取plane实体并且改变plane样式
      const mouseDownHandler: Cesium.ScreenSpaceEventHandler = createHandler(
        viewer.scene.canvas,
        (event) => {
          const pickedPlan: pickedObject = viewer.scene.pick(event.position);
          console.log("pickedPlan :>> ", pickedPlan);
          if (
            Cesium.defined(pickedPlan) &&
            Cesium.defined(pickedPlan.id) &&
            Cesium.defined(pickedPlan.id.plane)
          ) {
            selectedPlaneEntity = pickedPlan.id;
            selectedPlane = pickedPlan.id.plane;
            if (!selectedPlane) return;
            selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.05);
            selectedPlane.outlineColor = Cesium.Color.WHITE;
            // 禁用摄像头
            viewer.scene.screenSpaceCameraController.enableInputs = false;
          }
        },
        Cesium.ScreenSpaceEventType.LEFT_DOWN
      );

      // 鼠标左键up恢复样式并将selectedPlane置为undefined
      const mouseUpHandler: Cesium.ScreenSpaceEventHandler = createHandler(
        viewer.scene.canvas,
        () => {
          if (Cesium.defined(selectedPlane)) {
            selectedPlane.material = Cesium.Color.WHITE.withAlpha(0.8);
            selectedPlane.outlineColor = Cesium.Color.WHITE;
            selectedPlane = undefined;
          }
          viewer.scene.screenSpaceCameraController.enableInputs = true;
        },
        Cesium.ScreenSpaceEventType.LEFT_UP
      );

      const mouseMoveHandler: Cesium.ScreenSpaceEventHandler = createHandler(
        viewer.scene.canvas,
        (event) => {
          if (Cesium.defined(selectedPlane)) {
            console.log('selectedPlaneEntity :>> ', selectedPlaneEntity.name);
            

            switch (selectedPlaneEntity.name) {
              case direction.WEST:
                state.targetWest += event.startPosition.x - event.endPosition.x;
                break;
              case direction.EAST:
                state.targetEast += event.endPosition.x - event.startPosition.x;
                break;
              case direction.TOP:
                state.targetTop += event.startPosition.y - event.endPosition.y;
                break;
              case direction.BOTTOM:
                state.targetBottom += event.endPosition.y - event.startPosition.y;
                break;
              default:
                break;
            }
          }
        },
        Cesium.ScreenSpaceEventType.MOUSE_MOVE
      );

      tileset = viewer.scene.primitives.add(
        new Cesium.Cesium3DTileset({
          url: "3DTiles/stratum/tileset.json",
          // url: "3DTiles/tileset/tileset.json",
          clippingPlanes: createClippingPlanes(CLIP_TYPE),
          debugShowBoundingVolume: true
        })
      );
      tileset.readyPromise.then((tileset) => {
        // 模型偏移
        let boundingSphereCenter = tileset.boundingSphere.center.clone()
        let modelMatrix = tileset.modelMatrix.clone()
        let trans = new transform(boundingSphereCenter, modelMatrix);
        const tmpMatrix = new Cesium.Matrix4();
        Cesium.Matrix4.multiply(
          trans.translation(109.3062, 21.66081, 500),
          trans.rotation(17.9, -7.3, 0),
          tmpMatrix
        );
        
        tileset.modelMatrix = tmpMatrix;


        // state.targetTop = state.targetBottom = state.targetWest = state.targetEast = tileset.boundingSphere.radius  / 2;
        let tilesetCenter = tileset.boundingSphere.center.clone();
        let westPos = new Cesium.Cartesian3(tilesetCenter.x - 330, tilesetCenter.y, tilesetCenter.z);

        for (let i = 0; i < tileset.clippingPlanes.length; i++) {
          let plane = tileset.clippingPlanes.get(i);
          let planeName = getPlaneDirection(plane)
          viewer.entities.add({
            name: planeName,
            position: (planeName === direction.WEST || planeName === direction.EAST) ? westPos: tilesetCenter,
            // position: tilesetCenter,
            plane: {
              dimensions: new Cesium.Cartesian2(
                tileset.boundingSphere.radius*2 ,
                tileset.boundingSphere.radius*2
              ),
              material: Cesium.Color.WHITE.withAlpha(0.8),
              plane: new Cesium.CallbackProperty(
                createPlaneUpdateFunction(plane, `target${planeName}`),
                false
              ),
              outline: true,
              outlineColor: Cesium.Color.WHITE,
            },
          });
        }
        console.log("viewer", viewer.entities);
      });

      viewer.zoomTo(tileset);
    });

    const createPlaneUpdateFunction = (plane: Cesium.ClippingPlane, planeName:string):any => {
      return  () => {
        plane.distance = state[planeName]
        return plane;
      };
    }
    return {
      state
    };
  },
};

</script>
<style lang="scss" scoped>
.clip-Model {
  width: 100%;
  height: 100%;
  position: relative;

  #cesiumContainer {
    width: 100%;
    height: 100%;
  }

  .container {
    position: absolute;
    top: 10px;
    left: 10px;
    background-color: white;
    width: 400px;
    padding: 10px 20px;
    border-radius: 20px;
  }
}
</style>