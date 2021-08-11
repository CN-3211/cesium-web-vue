/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-08-05 10:59:50
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

Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJkN2UwMzFmOC1mY2E3LTQ1ZDQtYjg4NC1mZDhlMzZmZjk4NTkiLCJpZCI6MjU5LCJpYXQiOjE2Mjc5MzM4NTJ9.Rv6Icz_hBcEDbR160A3jPJQfhdZKWo_MJ6KovN7HRpw";
createApp(App).use(store).use(router).use(ElementPlus).mount('#app')
