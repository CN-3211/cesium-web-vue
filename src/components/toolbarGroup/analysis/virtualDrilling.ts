/*
 * @Date: 2022-01-10 15:35:51
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 19:48:56
 * @FilePath: /cesium-web-vue/src/components/toolbarGroup/analysis/virtualDrilling.ts
 */
import { Math as CMath, Entity ,Viewer, ScreenSpaceEventHandler, ScreenSpaceEventType, Cartographic, Cartesian3, Ray, Color, Cesium3DTileFeature } from 'cesium';
import { ElNotification } from 'element-plus'

export default class virtualDrilling {
  private static _viewer: Viewer;
  handler: ScreenSpaceEventHandler;
  barEntities: Entity[] = []
  constructor(viewer: Viewer) {
    virtualDrilling._viewer = viewer;
    this.handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  }
  startSelectDrill() {
    this.handler.setInputAction(movement => {
      const cartesian1 = virtualDrilling._viewer.scene.pickPosition(movement.position);
      const cartographic = Cartographic.fromCartesian(cartesian1);
      
      const startPoint = Cartesian3.fromDegrees(
        CMath.toDegrees(cartographic.longitude),
        CMath.toDegrees(cartographic.latitude),
        cartographic.height + 1000
      );

      const endPoint = Cartesian3.fromDegrees(
        CMath.toDegrees(cartographic.longitude),
        CMath.toDegrees(cartographic.latitude),
        -9999
      );

      const greenRhumbLine = virtualDrilling._viewer.entities.add({
        name: "Green rhumb line",
        polyline: {
          positions: [
            startPoint, 
            endPoint, 
          ],
          width: 5,
          material: Color.GREEN,
        },
      });
      this.barEntities.push(greenRhumbLine);

      const direction = Cartesian3.normalize(
        Cartesian3.subtract(
          endPoint,
          startPoint,
          new Cartesian3()
        ),
        new Cartesian3()
      );
      const ray1 = new Ray(startPoint, direction);
      const scene:any = virtualDrilling._viewer.scene;
      const results = scene.drillPickFromRay(ray1); // 计算交互点

      const featureNames:string[] = results.map(result => {
        if(result.object) {
          const feature:Cesium3DTileFeature = result.object;
          return feature.getProperty('地层名称')
        }
      }).filter(item => item);
      console.log(featureNames);

      if(featureNames.length) {
        ElNotification({
          title: '地层名称',
          message: featureNames.join(','),
        })
      } else {
        ElNotification({
          title: '错误',
          message: '未拾取到地层信息',
          type: 'error',
        })
      }
    }, ScreenSpaceEventType.LEFT_CLICK)
  }
  stopSelectDrill() {
    this.handler.destroy();
    if(this.barEntities.length) {
      this.barEntities.forEach(item => {
        virtualDrilling._viewer.entities.remove(item);
      })
      this.barEntities = [];
    }
  }
}