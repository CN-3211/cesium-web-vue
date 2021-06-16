<!--
 * @Date: 2021-06-05 14:02:53
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-06-10 13:04:54
 * @FilePath: \cesium-web-vue\src\components\utilsComponents\test.vue
-->
<template>
  <div class="test">
    <div v-for="item in state.list" :ref="setItemRef" :key="item">{{item}}</div>
    <button @click="onclick">点击更新视图</button>
  </div>
</template>

<script lang="ts">
import { ref, reactive, onBeforeUpdate, onUpdated, onMounted } from 'vue'
export default {
  setup() {
    const state = reactive({
      list: ['huang', 'zi', 'han']
    })
    let itemRefs:HTMLDivElement[] = [];
    const setItemRef = (el: HTMLDivElement) => {
      itemRefs.push(el);
    }

    onBeforeUpdate(() => {
      itemRefs = []
    })

    onUpdated(() => {
      itemRefs[0].innerHTML = "aaa"
    })

    const onclick = () => {
      state.list.reverse()
    }

    return {
      state,
      itemRefs,
      setItemRef,
      onclick
    }
  }
}
</script>

<style lang="scss" scoped>
</style>