/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-08 16:51:23
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
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/clipModel.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
