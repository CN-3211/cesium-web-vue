/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-03 11:17:03
 * @FilePath: \cesium-web-vue\src\main.ts
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "cesium/Build/Cesium/Widgets/widgets.css";

createApp(App).use(store).use(router).mount('#app')
