<!--
 * @Date: 2021-06-29 09:47:26
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-23 21:23:19
 * @FilePath: \cesium-web-vue\src\views\sandcastleExample\Classification.vue
-->
<template>
  <div class="Classification">
    <div id="cesiumContainer"></div>
    <div class="controlsGroup">
      <el-checkbox class="control-switch" v-model="invertControl.isInvert">反转classification</el-checkbox>
      <div class="control-alpha">
        <span>调整反转颜色透明度</span>
        <el-slider v-model="invertControl.invertAlpha" :min="0" :max="1" :step="0.1"></el-slider>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, watch } from "vue";
import * as Cesium from "cesium";
interface InvertControl {
  isInvert: boolean,
  invertAlpha: number
}

interface base_Config {
  geometry: Cesium.BoxGeometry | Cesium.EllipseGeometry // 墙面上用于分类的geometry
  attributes: any,             // 配置geometry的颜色和显示
  id: string                   // 配置geometry的id
}

interface native_config extends base_Config {
  center: Cesium.Cartesian3    // 参照该中心进行矩阵变换
  hpr: Cesium.HeadingPitchRoll // 矩阵的左上部分，用于表示旋转
  translate: Cesium.Cartesian3 // 矩阵的右上部分，用于表示平移
}
interface processed_config extends base_Config {
  modelMatrix: Cesium.Matrix4
}

const PRIMITIVECONFIGS: native_config[] = [
  {
    center: new Cesium.Cartesian3(1216389.3637977627, -4736323.641980423, 4081321.7428341154),
    hpr: new Cesium.HeadingPitchRoll(2.619728786416368, 0.0, 0.0),
    translate: new Cesium.Cartesian3(0.0, 0.0, -2.0),
    geometry: Cesium.BoxGeometry.fromDimensions({
      vertexFormat: Cesium.PerInstanceColorAppearance.VERTEX_FORMAT,
      dimensions: new Cesium.Cartesian3(8.0, 5.0, 8.0),
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 0.5)),
      show: new Cesium.ShowGeometryInstanceAttribute(true)
    },
    id: "building"
  }, {
    center: new Cesium.Cartesian3(1216404.8844045496, -4736255.287065536, 4081392.010192471),
    hpr: new Cesium.HeadingPitchRoll(5.785339046755887, 0.0, 0.0),
    translate: new Cesium.Cartesian3(-0.25, 0.0, -2.0),
    geometry: new Cesium.EllipsoidGeometry({
      radii: new Cesium.Cartesian3(3.25, 5.0, 4.0)
    }),
    attributes: {
      color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.fromCssColorString("#F03A47").withAlpha(0.5)),
      show: new Cesium.ShowGeometryInstanceAttribute(true)
    },
    id: "tree"
  }
]



export default defineComponent({
  setup() {
    const invertControl: InvertControl = reactive({
      isInvert: false,
      invertAlpha: 1
    })
    onMounted(() => {
      const viewer = initConfigMap();
      loadTileset(viewer);
      new handleHighlight(viewer, PRIMITIVECONFIGS, invertControl);
    });

    return {
      invertControl
    }
  },
});

function initConfigMap(): Cesium.Viewer {
  const viewer = new Cesium.Viewer("cesiumContainer", {
    terrainProvider: Cesium.createWorldTerrain(),
  });
  viewer.extend(Cesium.viewerCesiumInspectorMixin);

  viewer.scene.globe.depthTestAgainstTerrain = true;
  viewer.scene.globe.enableLighting = true;
  viewer.scene.globe.show = false;

  return viewer;
}

function loadTileset(viewer: Cesium.Viewer) {
  const tileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: Cesium.IonResource.fromAssetId(40866),
    })
  );
  viewer.zoomTo(tileset);
}


class handleHighlight {
  primitiveGroup: Cesium.ClassificationPrimitive[];
  invertControl: InvertControl
  constructor(viewer: Cesium.Viewer, primitiveConfigs: native_config[], invertControl: InvertControl) {
    this.invertControl = invertControl
    const processed_configs = this.handleConfigData(primitiveConfigs)
    
    this.primitiveGroup = this.createPrimitiveForClassify(processed_configs, viewer.scene)
    
    this.watchInvertState(viewer.scene, primitiveConfigs)
  }
  /**
   * @description: 处理数据，返回primitive所需要的数据格式
   * @param {native_config[]} primitiveConfigs
   * @return {processed_config[]} processed_configs
   */  
  handleConfigData(primitiveConfigs: native_config[]): processed_config[] {
    const processed_configs: processed_config[] = [];
    for (let i = 0; i < primitiveConfigs.length; i++) {
      const primitiveConfig = primitiveConfigs[i];
      const modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(primitiveConfig.center);
      const hprRotation = Cesium.Matrix3.fromHeadingPitchRoll(primitiveConfig.hpr)
      const hprMatrix = Cesium.Matrix4.fromRotationTranslation(hprRotation, primitiveConfig.translate);
      Cesium.Matrix4.multiply(modelMatrix, hprMatrix, modelMatrix);

      processed_configs.push({
        modelMatrix,
        geometry: primitiveConfig.geometry,
        attributes: primitiveConfig.attributes,
        id: primitiveConfig.id
      })
    }
    
    return processed_configs
  }
  /**
   * @description: 创建用于分类的primitive
   * @param {processed_config[]} processed_configs
   * @param {Cesium.Scene} scene
   * @return {Cesium.ClassificationPrimitive[]} primitiveGroup
   */  
  createPrimitiveForClassify(processed_configs: processed_config[], scene: Cesium.Scene): Cesium.ClassificationPrimitive[] {
    const primitiveGroup: Cesium.ClassificationPrimitive[] = []
    for (let i = 0; i < processed_configs.length; i++) {
      const processed_config = processed_configs[i];
      const { geometry, modelMatrix, attributes, id }  = processed_config;
      const tmp = new Cesium.ClassificationPrimitive({
        geometryInstances: new Cesium.GeometryInstance({
          geometry,
          modelMatrix,
          attributes,
          id
        }),
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
      })
      
      primitiveGroup.push(tmp);
      scene.primitives.add(tmp);
    }
    return primitiveGroup
  }
  /**
   * @description: 用于反转tileset的分类
   * @param {Cesium.Scene} [scene]
   * @param {native_config[]} [primitiveConfigs]
   * @return {void}
   */  
  watchInvertState(scene: Cesium.Scene, primitiveConfigs: native_config[]): void {
    console.log('this.primitiveGroup :>> ', this.primitiveGroup);
    const ids = primitiveConfigs.map(item => item.id);

    watch(() => this.invertControl.isInvert, () => {
      // 不可以在第一次renderloop开始之前执行，因为他和Cesium的render机制有关，函数正常执行到invertHightlight时，
      // 第一次renderloop还没开始，仅仅是触发了requestAnimationFrame，因此primitives还没有加载完毕，
      // 这个时候根据id获取ClassificationPrimitive就会报错
      scene.invertClassification = this.invertControl.isInvert;
      scene.invertClassificationColor = new Cesium.Color(0.25, 0.25, 0.25, this.invertControl.invertAlpha);
      ids.forEach(id => {
        const geometryInstance = this.primitiveGroup.find(item => item.getGeometryInstanceAttributes(id))?.getGeometryInstanceAttributes(id);
        if(!geometryInstance) {
          throw new Error("err");
        }
        geometryInstance.show = Cesium.ShowGeometryInstanceAttribute.toValue(!this.invertControl.isInvert);
      })
    })

    watch(() => this.invertControl.invertAlpha, () => {
      scene.invertClassificationColor = new Cesium.Color(0.25, 0.25, 0.25, this.invertControl.invertAlpha);
    })
  }
}

</script>

<style lang="scss">
// style加上scope则只能控制templete中div的样式，不能控制viewer等的样式
.Classification {
  width: 100%;
  height: 100%;
  position: relative;
  #cesiumContainer {
    width: 100%;
    height: 100%;
  }
  .controlsGroup {
    box-sizing: border-box;
    width: 300px;
    padding: 10px;
    border-radius: 3%;
    position: absolute;
    top: 30px;
    left: 10px;
    background-color: rgba($color: #FFFFFF, $alpha: 0.2);
    .control-switch {
      color: #fff;
    }
    .control-alpha {
      width: 80%;
      margin: 0 auto;
      color: #fff;
    }
  }
}
</style>