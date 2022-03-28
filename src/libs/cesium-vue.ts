/*
 * @Date: 2022-03-28 11:15:48
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 16:10:23
 * @FilePath: /cesium-web-vue/src/libs/cesium-vue.ts
 */
import { App } from 'vue';
import { CesiumRef } from '@/@types/index';

// 为什么要用Symbol
export const CESIUM_REF_KEY = Symbol('cesiumRef')

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    readonly $cesiumRef: CesiumRef
    readonly cesiumRef: CesiumRef
  }
}
export default {
  install: function (app: App<Element>): void {
    const cr: CesiumRef = {
      viewer: undefined,
      viewerContainer: undefined,
    }
    // 在根结点（APP）下通过provide挂载cr，用于获取cesiumRef
    app.config.globalProperties.$cesiumRef = cr
    app.provide<CesiumRef>(CESIUM_REF_KEY, cr)
  },
}