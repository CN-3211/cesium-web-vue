/*
 * @Date: 2021-06-17 18:31:36
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-11-26 08:53:11
 * @FilePath: \cesium-web-vue\src\components\viewer\defaultViewerProps.ts
 */
import { PropType } from 'vue';
import { ClockViewModel, ProviderViewModel, ImageryProvider, TerrainProvider, SkyBox, SkyAtmosphere, MapProjection, Globe, DataSourceCollection } from 'cesium';

export default {
  id: {
    type: String,
    default: "cesiumContainer"
  },
  geocoder: {
    type: Boolean,
    default: false
  },
  cesiumPath: String,
  animation: {
    type: Boolean,
    default: false
  },
  baseLayerPicker: {
    type: Boolean,
    default: false
  },
  fullscreenButton: {
    type: Boolean,
    default: false
  },
  vrButton: {
    type: Boolean,
    default: false
  },
  homeButton: {
    type: Boolean,
    default: false
  },
  infoBox: {
    type: Boolean,
    default: true
  },
  sceneModePicker: {
    type: Boolean,
    default: false
  },
  selectionIndicator: {
    type: Boolean,
    default: true
  },
  timeline: {
    type: Boolean,
    default: false
  },
  navigationHelpButton: {
    type: Boolean,
    default: false
  },
  navigationInstructionsInitiallyVisible: {
    type: Boolean,
    default: false
  },
  scene3DOnly: {
    type: Boolean,
    default: false
  },
  shouldAnimate: {
    type: Boolean,
    default: false
  },
  clockViewModel: Object as PropType<ClockViewModel>,
  selectedImageryProviderViewModel: Object as PropType<ProviderViewModel>,
  imageryProviderViewModels: Array as PropType<Array<ProviderViewModel>>,
  selectedTerrainProviderViewModel: Object as PropType<ProviderViewModel>,
  terrainProviderViewModels: Array as PropType<Array<ProviderViewModel>>,
  imageryProvider: Object as PropType<ImageryProvider>,
  terrainProvider: Object as PropType<TerrainProvider>,
  skyBox: Object as PropType<SkyBox>,
  skyAtmosphere: Object as PropType<SkyAtmosphere>,
  fullscreenElement: {
    type: [String, Element] as PropType<string | Element>
  },
  useDefaultRenderLoop: {
    type: Boolean,
    default: true
  },
  targetFrameRate: Number,
  showRenderLoopErrors: {
    type: Boolean,
    default: true
  },
  useBrowserRecommendedResolution: {
    type: Boolean,
    default: true
  },
  automaticallyTrackDataSourceClocks: {
    type: Boolean,
    default: true
  },
  contextOptions: Object,
  sceneMode: {
    type: Number,
    default: 3
  },
  mapProjection: Object as PropType<MapProjection>,
  globe: Object as PropType<Globe>,
  orderIndependentTranslucency: {
    type: Boolean,
    default: true
  },
  creditContainer: String,
  creditViewport: String,
  dataSources: Object as PropType<DataSourceCollection>,
  terrainExaggeration: {
    type: Number,
    default: 1.0
  },
  shadows: {
    type: Boolean,
    default: false
  },
  terrainShadows: {
    type: Number,
    default: 3
  },
  mapMode2D: {
    type: Number,
    default: 1
  },
  projectionPicker: {
    type: Boolean,
    default: false
  },
  requestRenderMode: {
    type: Boolean,
    default: false
  },
  maximumRenderTimeChange: {
    type: Number,
    default: 0.0
  },
  debugShowFramesPerSecond: {
    type: Boolean,
    default: false
  },
  showCredit: {
    type: Boolean,
    default: false
  },
  accessToken: String,
  navigation: {
    // for supermap
    type: Boolean,
    default: false
  },
  TZCode: {
    type: String,
    default: new Date().getTimezoneOffset() === 0 ? 'UTC' : 'UTC' + '+' + -(new Date().getTimezoneOffset() / 60)
  },
  UTCOffset: {
    type: Number,
    default: -new Date().getTimezoneOffset()
  },
  removeCesiumScript: {
    type: Boolean,
    default: true
  },
  autoSortImageryLayers: {
    type: Boolean,
    default: true
  },
  enableMouseEvent: {
    type: Boolean,
    default: true
  },
  skeleton: {
    type: [Boolean, Object],
    default: {
      dark: false,
      animation: 'wave',
      square: true,
      bordered: true,
      color: undefined
    }
  }
}