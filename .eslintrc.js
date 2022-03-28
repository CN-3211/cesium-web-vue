/*
 * @Date: 2021-06-02 17:21:44
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 20:33:44
 * @FilePath: /cesium-web-vue/.eslintrc.js
 */

module.exports = {
  root: true,
  env: {
    node: true,
    browser: false,
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    // 'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  globals: {
    document: true, 
    window: true,
    requestAnimationFrame: true,
    HTMLElement: true
  },
  rules: {
    '@typescript-eslint/no-var-requires': 'off', // 允许在import中使用require
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-this-alias": [
      "off",
      "error",
      {
        "allowDestructuring": true, // Allow `const { props, state } = this`; false by default
        "allowedNames": ["vm", "$this"] // Allow `const vm= this`; `[]` by default
      }
    ]
  },
}