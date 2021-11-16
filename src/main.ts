/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-11-02 09:42:50
 * @FilePath: \cesium-web-vue\src\main.ts
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

Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkNmY0NTdiNi0yMWU0LTQ4ODYtOTI4ZC01YTNkMjBmOGJiNWIiLCJpZCI6MjU5LCJpYXQiOjE2MzU3ODA2MDR9.y50NF0p5ljbH7Tau2KiGsZdCNx0Icx905QiljL43nYM";
createApp(App).use(store).use(router).use(ElementPlus).mount('#app')
