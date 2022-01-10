/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-01-08 22:42:20
 * @FilePath: /cesium-web-vue/src/main.ts
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "cesium/Build/Cesium/Widgets/widgets.css"
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';
import { Ion } from 'cesium';

import '@/assets/iconfont/iconfont.css'

import Names from '@/Dcomponents/index';
import { DcLoader } from '@/loaders/index';

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

(async () => {
  const hub = createApp(App)

  await new Promise((resolve) => {
    const DC = new DcLoader().load()
    hub.config.globalProperties.$DC = DC;
    resolve('resolved')
  })

  Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNzUyMTRlZS1jOWIzLTQyMGItODhiZC03MjJiNjhkZmM3MTAiLCJpZCI6NDU0MzYsImlhdCI6MTYxNTA4NTMxM30.0lWAcbNda5guP67iQ5OmJ4F9RI8FJEG_CsxyNQOT8I4"
  hub.use(store).use(router).use(ElementPlus).mount('#app')
})()


// import Vue from 'vue'
// import axios from 'axios'
// import { DcLoader, HttpLoader, UiLoader } from './loader';
// (async () => {
//   const hub = new Vue()
//   Vue.config.productionTip = false
//   global.Vue = Vue
//   Vue.prototype.$hub = hub

//   await axios.get('config/config.json').then(res => {
//     global.Config = res.data
//   })

//   await new Promise(resolve => {
//     new DcLoader().load()
//     new HttpLoader().load()
//     new UiLoader().load()
//     import('@/components')
//     resolve()
//   })

//   Promise.all([
//     import('./App.vue'),
//     import('./router'),
//     import('./store')
//   ]).then(([{ default: App }, { default: router }, { default: store }]) => {
//     new Vue({
//       el: '#app',
//       router,
//       store,
//       render: h => h(App)
//     })
//   })
// })()
