/*
 * @Date: 2021-11-04 21:29:17
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-11-08 17:07:16
 * @FilePath: \cesium-web-vue\src\utils\index.ts
 */

/**
 * @description: 节流函数，防止短时间内函数多次调用
 * @param {function} fn - 需要节流的函数
 * @param {number} wait - 设置wait时间内函数没有触发，则调用函数
 * @return {*}
 */
function throttle(fn: (...args: any[]) => any, wait: number) {
  let timer:unknown;
  return function(movement) {
    const context = this;
    if(!timer) {
      timer = setTimeout(() => {
        fn.apply(context, [movement]);
        timer = null
      }, wait);
    }
  }
}

/**
 * @description: Proxy 代理模式深度监听对象、数组变化
 * @param {*} obj - 需要监听的对象或者数组
 * @param {*} callback - 变化后触发的回调函数
 * @return {*} - proxy对象
 */
function deepWatcher(obj, callback) {
  if(typeof obj === 'object') {
    for(const key in obj) {
      if(typeof obj[key] === 'object') {
        obj[key] = deepWatcher(obj[key], callback);
      }
    }
  }

  return new Proxy(obj, {
    set: function(target, key, value, receiver) {
      if(typeof value === 'object') {
        value = deepWatcher(value, callback);
      }
      const callbackType = target[key] === undefined ? 'create' : 'modify';

      // 避免target是数组的情况下，因修改数组时length的变化触发回调
      if (!(Array.isArray(target) && key === 'length')) {
        callback(callbackType, { target, key, value });
      }
      return Reflect.set(target, key, value, receiver);
    }
  })
}

export { throttle, deepWatcher }