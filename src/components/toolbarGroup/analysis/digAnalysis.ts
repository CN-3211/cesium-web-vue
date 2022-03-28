/*
 * @Date: 2021-11-17 12:01:46
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-03-28 19:48:26
 * @FilePath: /cesium-web-vue/src/components/toolbarGroup/analysis/digAnalysis.ts
 */
import { Math as CMath, WallGraphics, sampleTerrainMostDetailed, PolygonHierarchy, Entity, Viewer, Cartesian3, ClippingPlane, ClippingPlaneCollection, Cartographic, Color, ImageMaterialProperty, Cartesian2 } from 'cesium';
import { DrawPolygon } from "@/utils/vue-utils/draw/drawUtils";

/**
 * 地形开挖
 */
interface options {
  depth?: number // 挖掘深度
  lerpInterval: number //每两点之间插值个数
  materials?: { // 井面和井底的材质
    bottomMaterial: string,
    wallMaterial: string
  }
}
class digTerrainPlan {
  static _viewer: Viewer
  points: Cartesian3[] = [] // 后面加上保存全部挖掘面
  depth = 50
  private lerpInterval = 50
  bottomHeight = 99999
  wallEntity: Entity|undefined
  bottomEntity: Entity|undefined

  materials: { bottomMaterial: string, wallMaterial: string} = {
    bottomMaterial: "image/excavate_bottom_min.jpg",
    wallMaterial: "image/excavate_bottom_min.jpg"
  }
  DrawPolygonIns: DrawPolygon
  constructor(viewer: Viewer, options: options) {
    digTerrainPlan._viewer = viewer;
    this.DrawPolygonIns = new DrawPolygon(viewer);
    for (const option in options) {
      if (Object.prototype.hasOwnProperty.call(options, option)) {
        this[option] = options[option]
      }
    }
  }

  startClipTerrain() {
    this.DrawPolygonIns.startCreate(undefined, (positions) => {
      // 每次挖掘的时候清空上次的数据
      this.clearDigEntities()
      this.wallEntity = undefined;
      this.bottomEntity = undefined;
      this.points = positions;
      //创建裁剪面
      this._clippingTerrain(positions)
      //获取最低点高度
      this.bottomHeight = this._getMinPointHeight(positions)
      //创建井底部
      this._createBottomSurface(positions)
      //创建井壁
      this._createWellWall(positions)
    })
  }

  /**
   * 裁剪地形
   * @param {Cesium.Cartesian3[]} points
   */
  private _clippingTerrain(points: Cartesian3[]){
    //判断点的顺序是顺时针还是逆时针
    const isRight = this._judgeDirection(points);
    const clippingPlanes: ClippingPlane[] = [];
    const length = points.length;

    for (let i = 0; i < length; ++i) {
      const nextIndex = (i + 1) % length

      // up指标准化后的一个Cartesian3坐标
      const up = Cartesian3.normalize(points[i], new Cartesian3())
      // right是一个向量，通过subtract相减两个坐标点
      let right = !isRight
        ? Cartesian3.subtract(points[i], points[nextIndex], new Cartesian3())
        : Cartesian3.subtract(points[nextIndex], points[i], new Cartesian3())
      // 向量标准化处理
      right = Cartesian3.normalize(right, right)

      // 叉乘得到对应裁剪平面的法向量
      let normal = Cartesian3.cross(right, up, new Cartesian3())
      normal = Cartesian3.normalize(normal, normal)
      clippingPlanes.push(new ClippingPlane(normal, 0))
    }

    //创建地形裁剪
    digTerrainPlan._viewer.scene.globe.clippingPlanes = new ClippingPlaneCollection({
      planes: clippingPlanes,
      edgeWidth: 1,
      edgeColor: Color.WHITE
    })
  }

  /**
   * 获取最低点的高度
   */
  _getMinPointHeight(points: Cartesian3[]) {
    let lowestDepth = 99999;
    points.forEach(point => {
      const pointCartographic = Cartographic.fromCartesian(point)
      if (pointCartographic.height < lowestDepth) {
        lowestDepth = pointCartographic.height
      }
    })

    //找出最低点的高度
    return lowestDepth - this.depth
  }

  /**
   * 判断点的顺序是顺时针还是逆时针
   * @param {Cesium.Cartesian3[]} points
   */
  _judgeDirection(points: Cartesian3[]): boolean {
    const lonlat1 = Cartographic.fromCartesian(points[0])
    const lonlat2 = Cartographic.fromCartesian(points[1])
    const lonlat3 = Cartographic.fromCartesian(points[2])
    const x1 = lonlat1.longitude,
      y1 = lonlat1.latitude,
      x2 = lonlat2.longitude,
      y2 = lonlat2.latitude,
      x3 = lonlat3.longitude,
      y3 = lonlat3.latitude,
      dirRes = (x2 - x1) * (y3 - y2) - (y2 - y1) * (x3 - x2)

    const isR = dirRes > 0
    return isR
  }

  //创建井壁
  async _sampleLerpPositions(points: Cartesian3[]) {
    const lerpInterval = this.lerpInterval,
      len = points.length,
      lerpPositions: Cartographic[] = []

    for (let i = 0; i < len; i++) {
      const nextIndex = (i + 1) % len
      const currRad = Cartographic.fromCartesian(points[i])
      const nextRad = Cartographic.fromCartesian(points[nextIndex])
      const position1 = [currRad.longitude, currRad.latitude]
      const position2 = [nextRad.longitude, nextRad.latitude]

      for (let j = 0; j < lerpInterval; j++) {
        // 经纬度设置插值
        const longitude = CMath.lerp(position1[0], position2[0], j / lerpInterval),
          latitude = CMath.lerp(position1[1], position2[1], j / lerpInterval)
        lerpPositions.push(new Cartographic(longitude, latitude))
      }
    }

    //增加开始点构造闭合环
    lerpPositions.push(lerpPositions[0].clone())
    await sampleTerrainMostDetailed(digTerrainPlan._viewer.terrainProvider, lerpPositions)

    return lerpPositions
  }

  /**
   * 创建墙体
   * @param {Cesium.Cartesian3[]} lerpPositions
   */
  _createWellWall(points: Cartesian3[]) {
    const wellPositions:Cartesian3[] = [];
    const maximumHeights:number[] = [];
    const minimumHeights:number[] = [];
    const material = new ImageMaterialProperty({
      image: this.materials.wallMaterial,
      repeat: new Cartesian2(5, 5)
    })

    const lerpPositions = this._sampleLerpPositions(points).then(lerpPositions => {
      lerpPositions.forEach(lerpPosition => {
        const { longitude, latitude, height } = lerpPosition
        wellPositions.push(Cartesian3.fromRadians(longitude, latitude, height))
        maximumHeights.push(height)
        minimumHeights.push(this.bottomHeight)
      })

      this.wallEntity = new Entity({
        wall: new WallGraphics({
          positions: wellPositions,
          maximumHeights,
          minimumHeights,
          material
        })
      })

      digTerrainPlan._viewer.entities.add(this.wallEntity);
    });
  }

  /**
   * 创建井底
   * @param {Cesium.Cartesian3[]} points
   */
  _createBottomSurface(points) {
    const material = new ImageMaterialProperty({
      image: this.materials.bottomMaterial,
      repeat: new Cartesian2(5, 5)
    })
    this.bottomEntity = new Entity({
      polygon: {
        hierarchy: new PolygonHierarchy(points),
        height: this.bottomHeight,
        material
      }
    })

    digTerrainPlan._viewer.entities.add(this.bottomEntity)
  }

  /**
   * 更新挖掘深度
   * @param {Number} depth
   */
  _updateExcavateDepth(depth) {
    if (this.bottomEntity) {
      digTerrainPlan._viewer.scene.primitives.remove(this.bottomEntity)
    }
    if (this.wallEntity) {
      digTerrainPlan._viewer.scene.primitives.remove(this.wallEntity)
    }
    this.depth = depth
    this._getMinPointHeight(this.points)
    //创建井底部
    this._createBottomSurface(this.points)
    //创建井壁
    this._createWellWall(this.points)
  }
  clearDigEntities() {
    this.bottomEntity && digTerrainPlan._viewer.entities.remove(this.bottomEntity);
    this.wallEntity && digTerrainPlan._viewer.entities.remove(this.wallEntity);
    this.DrawPolygonIns.polygon && digTerrainPlan._viewer.entities.remove(this.DrawPolygonIns.polygon)
    this.DrawPolygonIns.polyline && digTerrainPlan._viewer.entities.remove(this.DrawPolygonIns.polyline)
  }
  /**
   * 销毁挖掘体(取消选中时应该是停止绘制，而不是删除全部entity)
   */
  stopdigTerrainPlan() {
    // this.clearDigEntities();
    // 移除所有地形裁剪的平面
    // digTerrainPlan._viewer.scene.globe.clippingPlanes.removeAll();
    this.DrawPolygonIns.stopDrawing();
  }

}


export { digTerrainPlan }