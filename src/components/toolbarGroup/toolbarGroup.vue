<!--
 * @Date: 2021-10-20 19:33:49
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-10-21 09:07:15
 * @FilePath: \cesium-web-vue\src\components\toolBarGroup\plotting.vue
-->
<template>
  <div class="toolbar-group">
    <div class="toolbar">
      <div
        class="tool-item"
        v-for="item in tools"
        :key="item"
        @click="onToolClick(item)"
      >
        <!-- <div :class="`iconfont ${item.icon}`"></div> -->
        <div
          class="iconfont"
          :class="item.active ? `iconfontActive ${item.icon}` : item.icon"
        ></div>
      </div>
    </div>
    <div v-show="isDialogShow" class="tool-dialog">
      <div class="dialog-header">
        <span class="dialog-header-title">{{ activeItem.headerTxt }}</span>
        <span class="dialog-header-close" @click="closeDialog">x</span>
      </div>
      <Plotting></Plotting>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from "vue";
import Plotting from "./plotting/plotting.vue"

const tools = ref([
  { text: "测量", headerTxt: "测量工具", icon: "icon-celiang", active: true },
  { text: "标绘", headerTxt: "标记工具", icon: "icon-biaohui", active: false },
  { text: "其他", headerTxt: "其他工具", icon: "icon-qita", active: false }
]);
const isDialogShow = ref(true);
let activeItem = ref(tools.value[0]);

export default defineComponent({
  setup() {
    const onToolClick = item => {
      isDialogShow.value = true;
      tools.value.forEach(_item => (_item.active = false));
      item.active = true;
      activeItem.value = item;
    };
    const closeDialog = () => {
      tools.value.forEach(_item => (_item.active = false));
      isDialogShow.value = false;
    }

    return {
      tools,
      onToolClick,
      isDialogShow,
      activeItem,
      closeDialog
    };
  },
  components: {
    Plotting
  }
});
</script>

<style lang="scss" scoped>
.toolbar-group {
  width: 50px;
  position: relative;
  .tool-dialog {
    width: 260px;
    height: 400px;
    position: absolute;
    top: 0px;
    left: 50px;
    background-color: #f5f5f5;
    padding: 50px 30px 0px 30px;
    .dialog-header {
      width: 100%;
      height: 50px;
      padding: 0 30px;
      line-height: 50px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #ddd;
      position: absolute;
      top: 0px;
      left: 0px;
      .dialog-header-title {
        color: #333
      }
      .dialog-header-close {
        cursor: pointer;
      }
    }
  }
  .toolbar {
    border-radius: 10px 0 0 10px;
    background-color: #fff;
    .tool-item {
      width: 50px;
      height: 50px;
      border-bottom: 1px solid #ddd;
    }
    .tool-item:last-child {
      border-bottom: none;
    }
    .iconfont {
      color: rgb(148, 141, 141);
      font-size: 24px;
      line-height: 50px;
    }
    .iconfont:hover {
      color: rgb(39, 6, 6);
      cursor: pointer;
    }
    .iconfontActive {
      color: rgb(8, 166, 187);
      background-color: #f5f5f5;
    }
  }
}
</style>
