/*
 * @Date: 2022-03-28 11:19:05
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 11:19:06
 * @FilePath: /cesium-web-vue/src/@types/index.ts
 */
import type { Viewer } from 'cesium';
interface CesiumRef {
  viewer: Viewer | undefined
  viewerContainer: HTMLElement | undefined
}

export {
  CesiumRef
}