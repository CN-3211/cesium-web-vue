/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-06 19:24:46
 * @FilePath: \cesium-web-vue\src\router\index.ts
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Draw from '@/views/draw.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Draw',
    component: Draw
  },
  {
    path: '/transform3Dtiles',
    name: 'Transform3Dtiles',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/transform3Dtiles.vue')
  },
  {
    path: '/clipModel',
    name: 'ClipModel',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/clipModel.vue')
  },
  {
    path: '/threeJsClipObjModelStencil',
    name: 'threeJsClipObjModelStencil',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/threeJsClipObjModelStencil.vue')
  },
  {
    path: '/combineThreeAndCesium',
    name: 'combineThreeAndCesium',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/combineThreeAndCesium.vue')
  },
  {
    path: '/test',
    name: 'test',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/test01.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
