/*
 * @Date: 2021-07-23 15:25:16
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-23 15:36:43
 * @FilePath: \cesium-web-vue\src\composables\use-promise.ts
 */
import { ref } from 'vue';

export default function usePromise(fn) {
  const loading = ref(false);
  const result = ref(null);
  const error = ref(null)

  const createPromise = async (...args: any[]) => {
    loading.value = true;
    error.value = null;
    result.value = null;
    try {
      result.value = await fn(...args)
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false
    }
  }
  return { result, loading, error, createPromise }
}

/*** 用法说明开始 ***

// getNameCode为模拟的接口
function getNameCode(params1: string, params2: number) {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      resolve(params1 + params2);
    }, 1000);
  })
}
const name = "huangzh";
const code = 873

// usePromise中穿的参数是形参，真正传形参的部分在下面一行
const test = usePromise((name: string, code: number) => getNameCode(name, code));
test.createPromise(name, code)

*** 用法说明结束 ***/