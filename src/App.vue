<!--
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-29 09:54:41
 * @FilePath: \cesium-web-vue\src\App.vue
-->
<template>
  <div id="layout">
    <div id="nav">
      <router-link to="/">Draw</router-link> |
      <router-link to="/Transform3Dtiles">Transform3Dtiles</router-link> |
      <router-link to="/clipModel">ClipModel</router-link> |
      <router-link to="/test">test</router-link> |
    </div>
    <router-view />
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
  #nav {
    padding: 30px;
    height: 20px;
    position: absolute;
    top: 0;
    left: 0;
    a {
      font-weight: bold;
      color: #2c3e50;

      &.router-link-exact-active {
        color: #42b983;
      }
    }
  }
}
#layout {
  height: 100%;
  padding-top: 80px;
  box-sizing: border-box;
}
</style>
