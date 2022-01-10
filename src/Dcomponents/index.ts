/*
 * @Date: 2022-01-08 16:12:36
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-01-08 22:20:20
 * @FilePath: /cesium-web-vue/src/DComponents/index.ts
 */
console.log('123 :>> ', 123);
const componentsWatcher = scanner => {
  return scanner.keys().map(key => {
    console.log('key :>> ', key);
    const name = scanner(key).default.name

    if (name) {
      console.log('name :>> ', name);
    }

    return name;
  })
}
const vueScanner = require.context(
  '@/Dcomponents',
  true,
  /^\.\/((?!\/)[\s\S])+\/index\.vue$/
  /* /以./开头 (后面不跟着/时 匹配任意字符) 以/index.vue结尾/ **/
  /* ./aaa/index.vue **/
)
const names = componentsWatcher(vueScanner)

export default names;