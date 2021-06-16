/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-11 10:57:26
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
    component: () => import(/* webpackChunkName: "about" */ '../views/transform3Dtiles.vue')
  },
  {
    path: '/test',
    name: 'Test',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/utilsComponents/test.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
