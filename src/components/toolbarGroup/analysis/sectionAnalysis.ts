/*
 * @Date: 2021-11-05 20:44:03
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 19:48:46
 * @FilePath: /cesium-web-vue/src/components/toolbarGroup/analysis/sectionAnalysis.ts
 */
import * as echarts from 'echarts/core';
import {
  GridComponent,
  ToolboxComponent,
  TooltipComponent,
  DatasetComponent,
} from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';


import { DrawPolyline, polylineOptions } from '@/utils/vue-utils/draw/drawUtils';
import { CESIUM_3D_TILE, TERRAIN } from '@/constant/index';

import { Math as CMath, HeightReference, Viewer, Cartesian3, sampleTerrainMostDetailed, Cartographic, createWorldTerrain, EllipsoidGeodesic, Entity, VerticalOrigin, NearFarScalar, ConstantPositionProperty } from 'cesium';

echarts.use([GridComponent, LineChart, CanvasRenderer, UniversalTransition, ToolboxComponent, TooltipComponent, DatasetComponent]);




class sectionAnalysis {
  viewer: Viewer;
  DrawPolylineIns: DrawPolyline;
  firstPoint: Cartesian3 = new Cartesian3();
  start: Cartesian3 = new Cartesian3();
  end: Cartesian3 = new Cartesian3();
  echartDataGroup: {
    distance: number,
    height: number,
    lng: number,
    lat: number
  }[] = []
  echartOptions: any = {}
  echartIns: echarts.ECharts | undefined = undefined
  tipGraphic: Entity | undefined = undefined
  drawType = TERRAIN

  constructor(viewer: Viewer, options?: polylineOptions) {
    this.viewer = viewer;
    this.DrawPolylineIns = new DrawPolyline(viewer, options);
    options && this.initOptions(options)

    this.echartOptions = {
      tooltip: {
        trigger: 'axis',
        textStyle: {
          align: 'left',
        },
        position: function (pt) {
          return [pt[0], '10%'];
        },
        formatter: (params) => {
          let inhtml = "";
          if (params.length === 0) {
            // hideTipMarker();
            return inhtml;
          }

          const height = params[0].value.height; // 海拔高度
          const lng = params[0].value.lng; // 所在经纬度
          const lat = params[0].value.lat; // 所在经纬度
          const len = params[0].value.distance; // 距起点
          // const hbgdStr = haoutil.str.formatLength(Number(params[0].value));

          inhtml = `当前位置<br />
                    距起点：${len.toFixed(2)}米<br />
                    海拔：<span style='color:${params[0].color};'>${height.toFixed(2)}米</span><br />
                    经度：${lng.toFixed(2)}<br />
                    纬度：${lat.toFixed(2)}`;

          this.showTipMarker(height, lng, lat, inhtml);

          return inhtml;
        },
      },
      dataset: {
        source: this.echartDataGroup,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLabel: {
          color: "#FFF",
          // formatter: '{value}米'
          formatter: (value) => {
            const value2 = Math.round(value*100)
            return value2/100 + '米'
          }
        },
        axisLine: {
          lineStyle: {
            color: "#ccc"
          }
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: "#ccc"
          }
        }
      },
      yAxis: {
        axisLabel: {
          color: "#FFF",
          formatter: "{value} 米"
        },
      },
      grid: {
        width: 'auto',
        height: 'auto',
        left: '3%',
        right: '3%',
        top: '20%',
        bottom: '0%',
        containLabel: true,
        show: true
      },
      series: [
        {
          type: 'line',
          showSymbol: false,
          lineStyle: {
            color: '#ff4683'
          },
          areaStyle: {
            opacity: 0.8,
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: 'rgb(255, 158, 68)'
              },
              {
                offset: 1,
                color: 'rgb(255, 70, 131)'
              }
            ])
          }
        }
      ]
    };
  }
  initOptions(options: polylineOptions) {
    Object.keys(options).forEach(item => {
      this[item] = options[item];
    })
  }
  /**
   * @description: 鼠标触发tooltip和地图的交互，在地图上增加marker
   * @param {*} point
   * @param {*} z
   * @param {*} inthtml
   * @return { void }
   */  
  showTipMarker(height, lng, lat, inhtml): void {
    // 标记Marker的地点
    const drawPosition = Cartesian3.fromDegrees(lng, lat, height);
  
    if (!this.tipGraphic) {
      this.tipGraphic = this.viewer.entities.add({
        name: "当前点",
        position: drawPosition,
        billboard: {
          image: 'image/map-marker.png',
          scale: 0.2,
          heightReference: this.drawType === TERRAIN ? HeightReference.CLAMP_TO_GROUND : HeightReference.NONE,
          verticalOrigin: VerticalOrigin.BOTTOM,
          scaleByDistance: new NearFarScalar(10000, 1.0, 500000, 0.2)
        }
      })
      // this.tipGraphic._setPositionsToCallback();
    }
    if(drawPosition) {
      this.tipGraphic.position = new ConstantPositionProperty(drawPosition);
    }
    // this.tipGraphic.bindPopup(inthtml).openPopup();
  }
  /**
   * @description: 借助DrawPolyline的方法来在地形上绘制剖面
   * @param {*}
   * @return {*}
   */  
  drawSectionsOnMap() {

    let sampleIndex = 0;

    this.DrawPolylineIns.startCreate(

      positions => {
        if (sampleIndex) {
          this.start = positions[sampleIndex - 1];
          this.end = positions[sampleIndex];
          this.getSampledData()
        } else {
          // 每次开始新的绘制时，要把数据清空
          this.echartDataGroup = [];
          this.firstPoint = positions[sampleIndex];
        }
        sampleIndex++;

      },
      () => {
        // 下次点击还可以画线但是需要把index重置为0
        sampleIndex = 0;
        // 创建echart的div
        if(!this.echartIns) {
          this.echartIns = this.createEchartContainer();
        }
      }
    );
  }
  /**
   * @description: 两点之间采样100个点，在每次右键点击时掉用该方法，异步获取和更新数据，避免效率过低
   * @param {*}
   * @return {*}
   */  
  getSampledData() {
    const sampledPositions = [Cartographic.fromCartesian(this.start)];
    // 用于配置在3dtiles上采样
    const sampledPositions_3dtiles = [this.start]
    const COUNT = 100;
    for (let i = 1; i < COUNT; i++) {
      const cart = Cartesian3.lerp(this.start, this.end, i / COUNT, new Cartesian3());
      sampledPositions.push(Cartographic.fromCartesian(cart));
      sampledPositions_3dtiles.push(cart);
    }

    sampledPositions.push(Cartographic.fromCartesian(this.end));
    sampledPositions_3dtiles.push(this.end);

    /* 这里要改，代码太臃肿了 */
    if(this.drawType === CESIUM_3D_TILE) {
      this.viewer.scene.clampToHeightMostDetailed(sampledPositions_3dtiles).then((res) => {
        const dataGroup = res.map(_item => {
          const item = Cartographic.fromCartesian(_item)
          const geodesic = new EllipsoidGeodesic();
          geodesic.setEndPoints(Cartographic.fromCartesian(this.firstPoint), item);
          const distance = geodesic.surfaceDistance;
  
          return {
            distance: distance,
            height: item.height,
            lng: CMath.toDegrees(item.longitude),
            lat: CMath.toDegrees(item.latitude)
          }
        })
  
        this.echartDataGroup = this.echartDataGroup.concat(dataGroup)
  
        // 异步获取和更新数据
        if (this.echartOptions.dataset) {
          this.echartOptions.dataset.source = this.echartDataGroup
        }
        this.echartIns && this.echartIns.setOption(this.echartOptions)
      })
    } else {
      sampleTerrainMostDetailed(createWorldTerrain(), sampledPositions).then((res) => {
        const dataGroup = res.map(item => {
          const geodesic = new EllipsoidGeodesic();
          geodesic.setEndPoints(Cartographic.fromCartesian(this.firstPoint), item);
          const distance = geodesic.surfaceDistance;
  
          return {
            distance: distance,
            height: item.height,
            lng: CMath.toDegrees(item.longitude),
            lat: CMath.toDegrees(item.latitude)
          }
        })
  
        this.echartDataGroup = this.echartDataGroup.concat(dataGroup)
  
        // 异步获取和更新数据
        if (this.echartOptions.dataset) {
          this.echartOptions.dataset.source = this.echartDataGroup
        }
        this.echartIns && this.echartIns.setOption(this.echartOptions)
      })
    }

  }
  /**
   * @description: 创建echart的div并挂载至最外层的index.vue文件下，div样式也是写在该文件中
   * @param {*}
   * @return {echarts.ECharts} myChart
   */  
  createEchartContainer(): echarts.ECharts {
    const chart_panel = document.createElement('div');
    const chart_container = document.createElement('div');
    const indexDom = document.getElementById('mapContainer');
    if (!indexDom) {
      throw new Error("echart初始化失败")
    }
    chart_panel.setAttribute('class', 'chart_panel')
    chart_container.setAttribute('class', 'chart_container')

    indexDom.appendChild(chart_panel);
    chart_panel.appendChild(chart_container)

    const myChart = echarts.init(chart_container);

    myChart.setOption(this.echartOptions)

    return myChart
  }
  stopDrawing() {
    const echartDiv = document.getElementsByClassName('chart_panel')[0];
    if(echartDiv) {
      echartDiv.parentNode?.removeChild(echartDiv);
    }
    if(this.tipGraphic) {
      this.viewer.entities.remove(this.tipGraphic);
    }
    this.DrawPolylineIns.polylineGroup.forEach(item => {
      this.viewer.entities.remove(item);
    })
    this.DrawPolylineIns.stopDrawing();
  }
}


export { sectionAnalysis }