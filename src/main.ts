/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-10 09:16:08
 * @FilePath: \cesium-web-vue\src\main.ts
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import "cesium/Build/Cesium/Widgets/widgets.css"
import ElementPlus from 'element-plus';
import 'element-plus/lib/theme-chalk/index.css';


createApp(App).use(store).use(router).use(ElementPlus).mount('#app')
