<!--
 * @Date: 2021-06-29 09:47:26
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-26 11:25:08
 * @FilePath: \cesium-web-vue\src\views\test01.vue
-->
<template>
  <div class="test01">
    <div id="cesiumContainer">
      {{myReactive.a}}
      {{myRef}}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted, toRefs, unref, isRef } from "vue";
import * as Cesium from "cesium";

export default defineComponent({
  setup(props, ctx) {
    const myReactive = reactive({
      a: 1,
      b: 2
    })
    const myRef = ref(3)
    console.log('myReactive :>> ', myReactive.a);
    console.log('myRef :>> ', myRef.value);

    const { a, b } = toRefs(myReactive);
    console.log('a :>> ', a.value);
    console.log('b :>> ', b.value);

    const unA = unref(a);
    console.log('unA :>> ', unA);


    return { myReactive, myRef }
  }
});

function test1() {
  const aaa = 1;
  onMounted(() => {
    console.log('aaa :>> ', aaa);
  })
}

function test2() {
  const bbb = 2;
  onMounted(() => {
    console.log('bbb :>> ', bbb);
  })
}
</script>

<style lang="scss" scoped>
.test01 {
  width: 100%;
  height: 100%;
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }
}
</style>