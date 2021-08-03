<!--
 * @Date: 2021-06-29 09:47:26
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-17 15:44:35
 * @FilePath: \cesium-web-vue\src\views\sandcastleExample\sandCameraTutorial.vue
-->
<template>
  <div class="sandCameraTutorial">
    <div id="cesiumContainer"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { createHandler } from '@/utils/c-utils';
import * as Cesium from 'cesium';

export default defineComponent({
  setup() {
    onMounted(() => {
      initConfigMap()
    })
  },
});


/*--------------------------------*/
function initConfigMap() {
  const viewer = new Cesium.Viewer("cesiumContainer");
  const scene = viewer.scene;
  const canvas = viewer.canvas

  // 通过设置属性tabindex来获取焦点
  canvas.setAttribute('tabindex', '0');
  canvas.addEventListener('click', () => {
    canvas.focus()
  })

  // 禁用默认鼠标操作
  scene.screenSpaceCameraController.enableRotate = false;
  scene.screenSpaceCameraController.enableTranslate = false;
  scene.screenSpaceCameraController.enableZoom = false;
  scene.screenSpaceCameraController.enableTilt = false;
  scene.screenSpaceCameraController.enableLook = false;

  
  new interaction(viewer)
}

/*--------------交互部分开始------------------*/
class interaction {
  private static keyboardState: { looking: boolean; moveForward: boolean; moveBackward: boolean; moveUp: boolean; moveDown: boolean; moveLeft: boolean; moveRight: boolean; };
  private static moveRate: {
    keyboard: number,
    mouse: number[]
  } = {
    keyboard: 0,
    mouse: []
  };
  constructor(viewer: Cesium.Viewer) {
    interaction.keyboardState = {
      looking: false,
      moveForward: false,
      moveBackward: false,
      moveUp: false,
      moveDown: false,
      moveLeft: false,
      moveRight: false,
    }
    interaction.onClockTick(viewer)
  }

  /**
   * @description: 获取用户输入的keyboard案件，并触发对应move事件
   * @param {*}
   * @return {*}
   */  
  private static keyboardAction() {
    document.addEventListener('keydown', event => {
      const keyType = interaction.getKeyType(event.code);
      if(keyType) {
        interaction.keyboardState[keyType] = true
      }
    })
    document.addEventListener('keyup', event => {
      const keyType = interaction.getKeyType(event.code);
      if(keyType) {
        interaction.keyboardState[keyType] = false
      }
    })
  }
  private static getKeyType(keyCode: string) {
    switch (keyCode) {
      case 'KeyW':
        return "moveForward"
      case 'KeyS':
        return "moveBackward"
      case 'KeyQ':
        return "moveUp"
      case 'KeyE':
        return "moveDown"
      case 'KeyA':
        return "moveLeft"
      case 'KeyD':
        return "moveRight"
      default:
        break;
    }
  }

  /**
   * @description: 获取用户鼠标在canvas上的运动，根据Cartesian2坐标的变化来触发lookUp和lookRight事件
   * @param {*} canvas
   * @return {*}
   */  
  private static mouseAction(canvas: HTMLCanvasElement) {
    let startPosition: Cesium.Cartesian2;
    let currentPosition: Cesium.Cartesian2;

    createHandler(canvas, event => {
      interaction.keyboardState.looking = true;
      startPosition = currentPosition = event.position.clone()
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

    createHandler(canvas, event => {
      if(!interaction.keyboardState.looking) return
      currentPosition = event.endPosition;
      const x = (currentPosition.x - startPosition.x) / canvas.width
      const y = -(currentPosition.y - startPosition.y) / canvas.height
      const FACTOR = 0.05;
      interaction.moveRate.mouse = [x * FACTOR, y * FACTOR];
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    createHandler(canvas, event => {
      interaction.keyboardState.looking = false;
    }, Cesium.ScreenSpaceEventType.LEFT_UP)
  }
  
  private static onClockTick(viewer: Cesium.Viewer) {
    /*  before tick  */
    interaction.keyboardAction()
    interaction.mouseAction(viewer.canvas)
    /*  before tick  */

    viewer.clock.onTick.addEventListener(() => {
      interaction.moveRate.keyboard = Cesium.Cartographic.fromCartesian(viewer.camera.position, viewer.scene.globe.ellipsoid).height / 100;

      Object.keys(interaction.keyboardState).forEach(key => {
        if(!interaction.keyboardState[key]) {
          return
        }
        if(key === "looking") {
          if(!interaction.moveRate.mouse.length) { return }
          viewer.camera.lookRight(interaction.moveRate.mouse[0])
          viewer.camera.lookUp(interaction.moveRate.mouse[1])

          return
        }
        viewer.camera[key](interaction.moveRate.keyboard)
      })
    })
  }
}

/*-------------------交互部分结束------------------*/

</script>

<style lang="scss" scoped>
.sandCameraTutorial {
  width: 100%;
  height: 100%;
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }
}
</style>