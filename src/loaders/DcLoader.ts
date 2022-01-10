/*
 * @Date: 2022-01-08 19:51:02
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-01-10 10:48:24
 * @FilePath: /cesium-web-vue/src/loaders/DcLoader.ts
 */
import DC from '@/DC/packages/base/index'
import DcCore from '@/DC/packages/core/index'
import '@dvgis/dc-sdk/dist/dc.core.min.css'

class DcLoader {
  load() {
    // 不知道怎么在ts中给global挂载变量
    // @ts-ignore
    global.DC = DC;
    DC.use(DcCore)

    return DC
    // global.DC = DC
    // DC.use(DcCore)
  }
}

export default DcLoader