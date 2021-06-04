<!--
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-04 09:12:54
 * @FilePath: \cesium-web-vue\src\views\Home.vue
-->
<template>
  <div class="home">
    <Map msg="Welcome to Your Vue.js + TypeScript App"/>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import Map from '@/components/CesiumExample/map.vue'; // @ is an alias to /src

@Options({
  components: {
    Map,
  },
})
export default class Home extends Vue {}
</script>
<style scoped lang="scss">
.home {
  width: 100%;
  height: 100%;
}
</style>