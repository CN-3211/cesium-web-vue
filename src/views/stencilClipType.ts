/*
 * @Date: 2022-03-24 15:52:16
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-24 16:40:32
 * @FilePath: /cesium-web-vue/src/views/stencilClipType.ts
 * @description: 需要改，好像可以不用export直接使用，要在tsconfig配置
 */
import { Ref } from 'vue';

interface routerClip {
  isSelecting: Ref<boolean>
}

interface threeFaceClip {
  onlyShowPlanes: boolean
  clipEachOther: boolean
  negateX?: boolean
  negateY?: boolean
  negateZ?: boolean
}
export { routerClip, threeFaceClip }