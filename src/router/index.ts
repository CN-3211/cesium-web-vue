/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-21 09:56:06
 * @FilePath: \cesium-web-vue\src\router\index.ts
 */
import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import Draw from '@/views/draw.vue';

const routes: Array<RouteRecordRaw> = [
  { path: '/draw', name: 'Draw', component: Draw },
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
    component: () => import(/* webpackChunkName: "about" */ '../views/clipModel.vue')
  },
  {
    path: '/threeJsClipObjModelStencil',
    name: 'ThreeJsClipObjModelStencil',
    component: () => import(/* webpackChunkName: "about" */ '../views/threeJsClipObjModelStencil.vue')
  },
  {
    path: '/combineThreeAndCesium',
    name: 'combineThreeAndCesium',
    component: () => import(/* webpackChunkName: "about" */ '../views/combineThreeAndCesium.vue')
  },{
    path: "/sandCameraTutorial",
    name: "SandCameraTutorial",
    component: () => import(/* webpackChunkName: "about" */ '@/views/sandcastleExample/sandCameraTutorial.vue')
  },
  {
    path: "/sandCardboard",
    name: "sandCardboard",
    component: () => import(/* webpackChunkName: "about" */ '@/views/sandcastleExample/sandCardboard.vue')
  },
  {
    path: "/sandCartographicLimitRectangle",
    name: "sandCartographicLimitRectangle",
    component: () => import(/* webpackChunkName: "about" */ '@/views/sandcastleExample/sandCartographicLimitRectangle.vue')
  },
  {
    path: "/sandClampTo3DTiles",
    name: "sandClampTo3DTiles",
    component: () => import(/* webpackChunkName: "about" */ '@/views/sandcastleExample/sandClampTo3DTiles.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import(/* webpackChunkName: "about" */ '../views/test01.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
