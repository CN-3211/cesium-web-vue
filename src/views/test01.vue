<!--
 * @Date: 2021-06-29 09:47:26
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-23 15:28:19
 * @FilePath: \cesium-web-vue\src\views\test01.vue
-->
<template>
  <div class="test01">
    <p>isloading: {{loading}}</p>
    <p>result: {{result}}</p>
    <p>error: {{error}}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from "vue";
import usePromise from '@/composables/use-promise';

export default defineComponent({
  setup() {
    function getNameCode(params1: string, params2: number) {
      return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
          resolve(params1 + params2);
        }, 1000);
      })
    }
    const name = "huangzh";
    const code = 873
    const test = usePromise((name: string, code: number) => getNameCode(name, code));
    test.createPromise(name, code)
    return {
      ...test
    }
  }
})
</script>

<style lang="scss" scoped>
.test01{
  width: 100%;
  height: 100%;
}
</style>