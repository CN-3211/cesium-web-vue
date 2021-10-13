/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-09-27 16:55:58
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

Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2NjU0MGI3NC1iZjM2LTQzNzctYjM3Yy0zMmU2NGQyNTBiM2MiLCJpZCI6MjU5LCJpYXQiOjE2MzA0OTk1NzV9.xNFmNo8X26_nTRRouMiQSbmrOYel9uLf-eXp_q6htb4";
createApp(App).use(store).use(router).use(ElementPlus).mount('#app')
