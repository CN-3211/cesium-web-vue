/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 19:56:03
 * @FilePath: /cesium-web-vue/src/main.ts
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "cesium/widgets.css"

import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
import { Ion } from 'cesium';
import cesiumVue from '@/libs/cesium-vue'

import '@/assets/iconfont/iconfont.css'

(async () => {
  const hub = createApp(App)
  Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNzUyMTRlZS1jOWIzLTQyMGItODhiZC03MjJiNjhkZmM3MTAiLCJpZCI6NDU0MzYsImlhdCI6MTYxNTA4NTMxM30.0lWAcbNda5guP67iQ5OmJ4F9RI8FJEG_CsxyNQOT8I4"
  hub.use(store).use(router).use(cesiumVue).use(ElementPlus).mount('#app')
})()

  /* DC相关 */
  // import Names from '@/Dcomponents/index';
  // import { DcLoader } from '@/loaders/index';
  // await new Promise((resolve) => {
  //   const DC = new DcLoader().load()
  //   hub.config.globalProperties.$DC = DC;
  //   resolve('resolved')
  // })
  /* DC相关 */

/** vue2和vue3的变化
// vue2
new Vue({
  render: h => h(App)
}).$mount('#app')

// vue3
import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')
 */
