/*
 * @Date: 2021-10-11 15:45:43
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-10-13 15:40:54
 * @FilePath: \cesium-web-vue\src\utils\vue-utils\keyboardInteraction\index.ts
 */
import * as Cesium from 'cesium';
import { createHandler } from '@/utils/c-utils';

/**
 * handler start
 */
let handler_LEFT_DOWN:Cesium.ScreenSpaceEventHandler
let handler_MOUSE_MOVE:Cesium.ScreenSpaceEventHandler
let handler_LEFT_UP:Cesium.ScreenSpaceEventHandler
/**
 * handler end
 */



export default class interaction {
  static keyboardState: { looking: boolean; moveForward: boolean; moveBackward: boolean; moveUp: boolean; moveDown: boolean; moveLeft: boolean; moveRight: boolean; };
  static moveRate: {
    keyboard: number,
    mouse: number[]
  }
  static viewer: Cesium.Viewer
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
    interaction.viewer = viewer
    interaction.moveRate = {
      keyboard: 0,
      mouse: []
    };
  }

  /**
   * event function start
   */

  static evKeydown(event: KeyboardEvent) {
    const keyType = interaction.getKeyType(event.code);
    if(keyType) {
      interaction.keyboardState[keyType] = true
    }
  }

  static _evKeydown(event: KeyboardEvent) {
    interaction.evKeydown(event)
  }

  static evKeyup(event: KeyboardEvent) {
    const keyType = interaction.getKeyType(event.code);
    if(keyType) {
      interaction.keyboardState[keyType] = false
    }
  }

  static _evKeyup(event: KeyboardEvent) {
    interaction.evKeyup(event)
  }

  static evOnTick() {
    interaction.moveRate.keyboard = Cesium.Cartographic.fromCartesian(interaction.viewer.camera.position, interaction.viewer.scene.globe.ellipsoid).height / 100;
  
    Object.keys(interaction.keyboardState).forEach(key => {
      if(!interaction.keyboardState[key]) {
        return
      }
      if(key === "looking") {
        if(!interaction.moveRate.mouse.length) { return }
        interaction.viewer.camera.lookRight(interaction.moveRate.mouse[0])
        interaction.viewer.camera.lookUp(interaction.moveRate.mouse[1])
  
        return
      }
      interaction.viewer.camera[key](interaction.moveRate.keyboard)
    })
  }

  /**
   * event function end
   */

  /**
   * @description: 获取用户输入的keyboard案件，并触发对应move事件
   * @param {*}
   * @return {*}
   */  
  keyboardAction() {
    document.addEventListener('keydown', interaction._evKeydown)
    document.addEventListener('keyup', interaction._evKeyup)
  }

  removeAllEventAndHandler(viewer: Cesium.Viewer) {
    this.resetDefaultEvents(viewer)

    document.removeEventListener('keydown', interaction._evKeydown)
    document.removeEventListener('keyup', interaction._evKeyup)
    viewer.clock.onTick.removeEventListener(interaction.evOnTick)

    handler_LEFT_DOWN.destroy()
    handler_MOUSE_MOVE.destroy()
    handler_LEFT_UP.destroy()
  }

  static getKeyType(keyCode: string) {
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
  mouseAction(canvas: HTMLCanvasElement) {
    let startPosition: Cesium.Cartesian2;
    let currentPosition: Cesium.Cartesian2;

    handler_LEFT_DOWN = createHandler(canvas, event => {
      interaction.keyboardState.looking = true;
      startPosition = currentPosition = event.position.clone()
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN)

    handler_MOUSE_MOVE = createHandler(canvas, event => {
      if(!interaction.keyboardState.looking) return
      currentPosition = event.endPosition;
      const x = (currentPosition.x - startPosition.x) / canvas.width
      const y = -(currentPosition.y - startPosition.y) / canvas.height
      const FACTOR = 0.05;
      interaction.moveRate.mouse = [x * FACTOR, y * FACTOR];
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler_LEFT_UP = createHandler(canvas, event => {
      interaction.keyboardState.looking = false;
    }, Cesium.ScreenSpaceEventType.LEFT_UP)
  }
  
  onClockTick(viewer: Cesium.Viewer) {
    this.disableMouseEvents(viewer)

    /*  before tick  */
    this.keyboardAction()
    this.mouseAction(viewer.canvas)
    /*  before tick  */

    viewer.clock.onTick.addEventListener(interaction.evOnTick)
  }

  disableMouseEvents(viewer: Cesium.Viewer) {
    // 通过设置属性tabindex来获取焦点
    viewer.canvas.setAttribute('tabindex', '0');
    viewer.canvas.addEventListener('click', () => {
      viewer.canvas.focus()
    })

    viewer.scene.screenSpaceCameraController.enableRotate = false;
    viewer.scene.screenSpaceCameraController.enableTranslate = false;
    viewer.scene.screenSpaceCameraController.enableZoom = false;
    viewer.scene.screenSpaceCameraController.enableTilt = false;
    viewer.scene.screenSpaceCameraController.enableLook = false;
  }

  resetDefaultEvents(viewer: Cesium.Viewer) {
    viewer.scene.screenSpaceCameraController.enableRotate = true;
    viewer.scene.screenSpaceCameraController.enableTranslate = true;
    viewer.scene.screenSpaceCameraController.enableZoom = true;
    viewer.scene.screenSpaceCameraController.enableTilt = true;
    viewer.scene.screenSpaceCameraController.enableLook = true;
  }
}