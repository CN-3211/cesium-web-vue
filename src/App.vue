<!--
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-08-04 14:16:39
 * @FilePath: \cesium-web-vue\src\App.vue
-->
<template>
  <div id="app">
    <el-container class="EContainer">
      <el-aside>
        <el-menu :default-openeds="['1', '2', '3']" :router="true">
          <el-submenu index="1">
            <template #title>
              <i class="el-icon-menu"></i>cesium功能
            </template>
            <el-menu-item-group>
              <template #title>3D tiles</template>
              <el-menu-item index="/transform3Dtiles">平移旋转变换</el-menu-item>
              <el-menu-item index="/digTerrian">地表挖掘</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group title="基础功能">
              <el-menu-item index="/draw">画点线面</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="2">
            <template #title>
              <i class="el-icon-menu"></i>Cesium沙盒学习
            </template>
            <el-menu-item-group>
              <template #title>camera相关</template>
              <el-menu-item index="/sand/CameraTutorial">camera tutorial</el-menu-item>
              <el-menu-item index="/sand/Cardboard">cardboard</el-menu-item>
            </el-menu-item-group>
            <el-menu-item-group>
              <template #title>未分类</template>
              <el-menu-item index="/sand/CartographicLimitRectangle">Cartographic Limit Rectangle</el-menu-item>
              <el-menu-item index="/sand/ClampTo3DTiles">Clamp To 3D Tiles</el-menu-item>
              <el-menu-item index="/sand/classification">Classification</el-menu-item>
              <el-menu-item index="/sand/Clustering">Clustering</el-menu-item>
              <el-menu-item index="/sand/CustomDataSource">CustomDataSource</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          <el-submenu index="3">
            <template #title>
              <i class="el-icon-menu"></i>threeJS功能学习
            </template>
            <el-menu-item-group>
              <template #title>分组一</template>
              <el-menu-item index="/combineThreeAndCesium">整合three和Cesium</el-menu-item>
              <el-menu-item index="/threeJsClipObjModelStencil">模板缓冲剖切</el-menu-item>
              <el-menu-item index="/load3DTiles">three加载3D tiles</el-menu-item>
            </el-menu-item-group>
          </el-submenu>
          
          <el-menu-item index="/test"><i class="el-icon-s-tools"></i>test</el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 右侧视图开始 -->
      <el-container class="EInnerContainer">
        <!-- <el-header>
        </el-header> -->
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    <!-- 右侧视图结束 -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    const item = {
      date: '2016-05-02',
      name: '王小虎',
      address: '上海市普陀区金沙江路 1518 弄'
    };
    return {
      tableData: Array(20).fill(item)
    }
  }
})
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width: 100%;
  .EContainer {
    width: 100%;
    height: 100%;
    .el-aside {
      border-right: solid 1px #e6e6e6;
      .el-menu {
        border: none;
        text-align: left;
      }
    }
    .EInnerContainer {
      .el-header {
        border-bottom: solid 1px #e6e6e6;
      }
    }
    
  }
}
</style>
