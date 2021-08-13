/* eslint-disable */
/**
 * @author跃焱邵隼
 * @host www.wellyyss.cn
 * @qq group 169470811
 */
import * as THREE from "three"
;const YsThree = (function (DOC, WIN, U) {
    /* 共享参数 ****/
    let  app, camera, renderer, scene, controls, el

    /**
     * 创建 app实例
     * @param element
     * @param options
     * @constructor
     */
    function YsThree(element, options) {
        options = options || {}
        app  = this
        el = element
        const t = app
        const width = el.offsetWidth
        const height = el.offsetHeight
        const asp = width / height

        // scene
        scene = new THREE.Scene()

        // camera
        if (options.camera) {
            camera = options.camera
        } else {
            camera = new THREE.PerspectiveCamera(45, asp, 1, 100000)
            WIN.addEventListener('resize', function() {
                camera.aspect = el.offsetWidth / el.offsetHeight
                renderer.setSize(el.offsetWidth, el.offsetHeight) // 重新获取
                camera.updateProjectionMatrix()
                renderer.render(scene, camera)
            }, false)
        }
        camera.position.set(30, 30, 30)

        // renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setPixelRatio(WIN.devicePixelRatio)
        renderer.setSize(width, height)
        el.append(renderer.domElement)
        renderer.setClearColor(options.clearColor || '#000')

        // 辅助
        if (options.axes) scene.add(new THREE.AxesHelper(10))// 坐标轴辅助红x 绿y 蓝z
        if (options.gridHelper) scene.add(new THREE.GridHelper(100, 100))// 网格参考线

        //按序渲染
        renderer.sortObjects = options.sortObjects

        // to the instance
        t.renderer = renderer
        t.scene = scene
        t.camera = camera
        t.el = el
    }


    /* 构造函数 start****/
    /**
     * 添加 css2d / css3d renderer
     * @param cssRender
     * @constructor
     */
    YsThree.prototype.CssRenderer = function (cssRender) {
        const T = this // 非app
        T.config = {}
        T.init = function () {
            const cssRenderer = new cssRender()
            cssRenderer.setSize( el.offsetWidth, el.offsetHeight )
            cssRenderer.domElement.style.position = 'absolute'
            cssRenderer.domElement.style.top = 0
            cssRenderer.domElement.style.pointerEvents = "none"
            el.appendChild(cssRenderer.domElement)
            T.cssRenderer = cssRenderer
            T.cssRendererDomElement = cssRenderer.domElement
        }
        T.add = function (option) {
            let list  = []
            if( Array.isArray(option))
                list = option
            else
                list.push(option)
            list.forEach(e => {
                DOC.body.insertAdjacentHTML('beforeend', e.element)
                const label = new e.cssObject( DOC.body.lastChild )
                label.userData.isCss23D  = true
                label.position.set(e.position[0], e.position[1], e.position[2])
                label.name = e.name
                if(e.scale) label.scale.set(e.scale[0], e.scale[1], e.scale[2])
                e.parent ? e.parent.add(label) : scene.add(label)
                T.config[e.name] = label
            })
        }
        T.update = function (name, innerHtml) {
            T.config[name].element.innerHTML = innerHtml
        }
        T.remove = function (name, parent) {
            parent = parent || scene
            parent.remove(parent.getObjectByName(name))
            // T.config[name].element.remove()
            if(T.config[name]) delete T.config[name]

        }
        T.search = function (name) {
            return  T.config[name]
        }
        T.removeAll = function(parent) {
            //需要倒序遍历
            for(let i = parent.children.length - 1 ; i>=0; i--) {
                const e = parent.children[i]
                if( e.userData.isCss23D ) {
                    const name = e.name
                    parent.remove(e)
                    if(T.config[name]) delete T.config[name]
                }
            }
        }
        T.init()
    }
    /**
     * 绘制点线面等
     * @constructor
     */
    YsThree.prototype.Draw = function(parent) {
        const T = this // 非app
        //配置项
        T.config = {
            enabled: true,
            drawPoint: false,
            drawLine: false,
            drawLineStraight: false,
            drawType: U, // point , line, lineStraight
            isDrawing: false,
            lineMaterial:  new THREE.LineBasicMaterial( { color:'red'}),
            lineStraightMaterial:  new THREE.LineBasicMaterial( { color:'red'}),
            fixPointPosition: {x : U, y : U, z : U,},
            fixLinePosition: {x : U, y : U, z : U,},
            fixLineStraightPosition: {x : U, y : U, z : U,},
            fixPolygonPosition: {x : U, y : U, z : U,},
            start: U,
            moving: U,
            stop: U
        }

        // points
        T.pointsGeometry = new THREE.BufferGeometry()
        T.pointsVertices = []
        T.points = new THREE.Points(T.pointsGeometry, new THREE.PointsMaterial({
            color: 'red',
            size: 1
        }))
        scene.add( T.points )

        // line
        T.lines = new THREE.Group()
        T.newLine  = null
        T.linePoints = []

        scene.add(T.lines)

        // drawLineStraight
        T.lineStraightsGroup = new THREE.Group()
        T.newLineStraight  = null
        T.lineStraightPoints = []

        scene.add(T.lineStraightsGroup)

        //Polygon
        T.polygonPoints = []
        T.polygonGroup = new THREE.Group()
        scene.add(T.polygonGroup)


        // event.button 0: LEFT,1:MIDDLE ,2: RIGHT

        DOC.oncontextmenu = () => false
        //开始
        el.addEventListener('mousedown',function (e) {
            if(!T.config.enabled) return
            e.preventDefault()
            if(e.button === 2 && T.config.drawType === 'lineStraight') {
                // 取消绘制线得单次绘制
                T.lineStraightPoints =  []
                return
            }
            if(e.button === 2 && T.config.drawType === 'polygon') {
                const geometry = new THREE.Geometry()
                geometry.vertices.push(...T.polygonPoints)
                T.polygonPoints.forEach((e, i) => {
                    if(i >=  T.polygonPoints.length - 2 ) return
                    geometry.faces.push(new THREE.Face3( 0, i+1, i+2 ))
                })
                geometry.computeFaceNormals()
                const material = new THREE.MeshBasicMaterial( {color: 'red',side: THREE.DoubleSide} );
                const mesh = new THREE.Mesh( geometry, material );
                T.polygonGroup.add( mesh )
                T.polygonPoints = []
                return
            }

            if(e.button !==0) return


            const objList =  app.getIntersectObject(el, e, parent || scene,  true).objectList
            if(objList &&　objList.length > 0) {
                const point = objList[0].point

                switch ( T.config.drawType ) {
                    case 'point': {
                        T.pointsVertices.push(T.config.fixPointPosition.x ||  point.x, T.config.fixPointPosition.y || point.y,  T.config.fixPointPosition.z || point.z)
                        T.pointsGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( T.pointsVertices, 3 ))
                        break
                    }
                    case 'line': {
                        T.config.isDrawing = true
                        const geometry = new THREE.BufferGeometry()//创建一个几何
                        T.newLine =  new THREE.Line( geometry, T.config.lineMaterial)
                        T.lines.add(T.newLine)
                        break
                    }
                    case 'lineStraight': {
                        T.config.isDrawing = true
                        const geometry = new THREE.BufferGeometry();//创建一个几何
                        T.newLineStraight =  new THREE.Line( geometry, T.config.lineStraightMaterial)
                        T.lineStraightPoints.push(new THREE.Vector3(T.config.fixLineStraightPosition.x ||  point.x, T.config.fixLineStraightPosition.y || point.y,  T.config.fixLineStraightPosition.z || point.z))
                        T.lineStraightsGroup.add(T.newLineStraight)
                        break
                    }

                    case 'polygon': {
                        //画点
                        T.pointsVertices.push(T.config.fixPolygonPosition.x ||  point.x, T.config.fixPolygonPosition.y || point.y,  T.config.fixPolygonPosition.z || point.z)
                        T.pointsGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( T.pointsVertices, 3 ))

                        //取点画面
                        T.polygonPoints.push(new THREE.Vector3(T.config.fixPolygonPosition.x ||  point.x, T.config.fixPolygonPosition.y || point.y,  T.config.fixPolygonPosition.z || point.z))
                    }
                }

                if(T.config.start) T.config.start(point)
            }

        }, false)

        //移动中
        el.addEventListener('mousemove',function (e) {
            if(!T.config.enabled) return
            e.preventDefault()
            if(e.button!== 0 ) return  //指定左击 生效

            const objList =  app.getIntersectObject(el, e, parent || scene,  true).objectList
            if(objList &&　objList.length > 0) {
                const point = objList[0].point
                switch ( T.config.drawType ) {
                    case 'line': {
                        if( T.config.isDrawing ) {
                            T.linePoints.push(new THREE.Vector3(T.config.fixLinePosition.x ||  point.x, T.config.fixLinePosition.y || point.y,  T.config.fixLinePosition.z || point.z))
                            T.newLine.geometry.setFromPoints( T.linePoints)
                        }
                        break
                    }
                    case 'lineStraight': {
                        if(T.config.isDrawing ) {
                            T.lineStraightPoints[1] = new THREE.Vector3(T.config.fixLineStraightPosition.x ||  point.x, T.config.fixLineStraightPosition.y || point.y,  T.config.fixLineStraightPosition.z || point.z)
                            T.newLineStraight.geometry.setFromPoints( T.lineStraightPoints)
                        }
                        break
                    }
                }

                if(T.config.moving && T.config.isDrawing ) T.config.moving(point)
            }
        }, false)

        //结束
        el.addEventListener('mouseup',function (e) {
            if(!T.config.enabled) return
            if(e.button !== 0 ) return  //指定左击 生效
            T.config.isDrawing = false
            switch ( T.config.drawType ) {
                case 'line': {
                    T.linePoints = []
                    break
                }
                case 'lineStraight': {
                    const objList =  app.getIntersectObject(el, e, parent || scene,  true).objectList
                    if(objList &&　objList.length > 0) {
                        const point = objList[0].point
                        T.lineStraightPoints[1] = new THREE.Vector3(T.config.fixLineStraightPosition.x ||  point.x, T.config.fixLineStraightPosition.y || point.y,  T.config.fixLineStraightPosition.z || point.z)
                        T.newLineStraight.geometry.setFromPoints( T.lineStraightPoints)
                    }

                    if(T.lineStraightPoints[1]) T.lineStraightPoints = [T.lineStraightPoints[1]]
                    else T.lineStraightPoints =  []
                    break
                }
            }

            if(T.config.stop) T.config.stop()
        }, false)
    }
    /**
     * 场景切换
     * @constructor
     */
    YsThree.prototype.SceneTransition = function(sceneA, sceneB, transitionParams) {
        const T = this
        //
        T.scene = new THREE.Scene()
        T.camera = new THREE.OrthographicCamera(el.offsetWidth / -2, el.offsetWidth / 2, el.offsetHeight / 2, el.offsetHeight / -2, -10, 10)

        //
        T.quadmaterial = new THREE.ShaderMaterial({
            uniforms: {
                tDiffuse1: {
                    value: null
                },
                tDiffuse2: {
                    value: null
                },
                mixRatio: {
                    value: 0.0
                },
                threshold: {
                    value: 0.1
                },
                useTexture: {
                    value: true
                },
                tMixTexture: {
                    value: transitionParams.texture
                }
            },
            vertexShader: `varying vec2 vUv;
            void main() {
            vUv = vec2( uv.x, uv.y );
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }`,
            fragmentShader: `uniform float mixRatio;
            uniform sampler2D tDiffuse1;
            uniform sampler2D tDiffuse2;
            uniform sampler2D tMixTexture;
            uniform bool useTexture;
            uniform float threshold;
            varying vec2 vUv;
            void main() {
            	vec4 texel1 = texture2D( tDiffuse1, vUv );
            	vec4 texel2 = texture2D( tDiffuse2, vUv );
            	if (useTexture==true) {
            		vec4 transitionTexel = texture2D( tMixTexture, vUv );
            		float r = mixRatio * (1.0 + threshold * 2.0) - threshold;
            		float mixf=clamp((transitionTexel.r - r)*(1.0/threshold), 0.0, 1.0);
            		gl_FragColor = mix( texel1, texel2, mixf );
            	} else {
            		gl_FragColor = mix( texel2, texel1, mixRatio );
            	}
            }`
        })
        const quadgeometry = new THREE.PlaneBufferGeometry(el.offsetWidth, el.offsetHeight)

        // 类似一种蒙层提供过度效果
        T.quad = new THREE.Mesh(quadgeometry, T.quadmaterial)
        T.scene.add(T.quad)

        T.update = function(sceneA, sceneB, animate) {
            T.sceneA = sceneA
            T.sceneB = sceneB
            T.quadmaterial.uniforms.tDiffuse1.value = T.sceneB.fbo.texture
            T.quadmaterial.uniforms.tDiffuse2.value = T.sceneA.fbo.texture
            T.quadmaterial.uniforms.mixRatio.value = 0.0
            T.quadmaterial.uniforms.threshold.value = 0.1
            T.quadmaterial.uniforms.useTexture.value = transitionParams.useTexture
            T.quadmaterial.uniforms.tMixTexture.value = transitionParams.texture

            transitionParams.animate = animate
            transitionParams.transition = 0
        }
        T.update(sceneA, sceneB, transitionParams.animate)
        T.needChange = false

        T.render = function(delta) {
            if (transitionParams.transition === 0) {
                T.sceneA.render(delta, false)
            } else if (transitionParams.transition >= 1) {
                T.sceneB.render(delta, false)
                transitionParams.animate = false // 停止
            } else {
                T.sceneA.render(delta, true)
                T.sceneB.render(delta, true)
                renderer.setRenderTarget(null)
                renderer.clear()
                renderer.render(T.scene, T.camera)
            }

            if (transitionParams.animate && transitionParams.transition <= 1) {
                transitionParams.transition = transitionParams.transition + transitionParams.transitionSpeed
                T.needChange = true
                T.quadmaterial.uniforms.mixRatio.value = transitionParams.transition
            }
        }
    }
    /* 一般函数 end****/

    /* 一般函数 start****/
    /** renderer */
    YsThree.prototype.setRenderer = newRenderer => renderer =  app.renderer  = newRenderer
    /** camera */
    YsThree.prototype.setCamera = newCamera =>  camera = app.camera = newCamera
    /** scene */
    YsThree.prototype.setScene = newScene => scene = app.scene = newScene
    /** controls */
    YsThree.prototype.setControls = newControls => controls = app.controls = newControls

    /**
     * 地理坐标转2d平面
     */
    YsThree.prototype.geographicToPlaneCoords = (radius, lng, lat) => {
        return { x: (lat / 180) * radius, y: (lng / 180) * radius }
    }

    /**
     * 地理坐标转三维坐标
     */
    YsThree.prototype.geographicToVector = (radius, lng, lat) => new THREE.Vector3().setFromSpherical(new THREE.Spherical(radius, (90 - lat) * (Math.PI / 180), (90 + lng) * (Math.PI / 180)))

    /**
     * 地理坐标转三维坐标添加了高度
     */
    YsThree.prototype.geographicToVectorPosition = (radius, lng, lat, height) => {
        const phi = (180 + lng) * (Math.PI / 180)
        const theta = (90 - lat) * (Math.PI / 180)
        return {
            x: -radius * Math.sin(theta) * Math.cos(phi),
            y: radius * Math.cos(theta) + (height || 0),
            z: radius * Math.sin(theta) * Math.sin(phi)
        }
    }

    /**
     * 三维坐标转屏幕坐标
     */
    YsThree.prototype.vectorToScreen = vectorOrObject => {
        let o
        if (vectorOrObject instanceof THREE.Vector3) {
            o = vectorOrObject
        } else if (vectorOrObject instanceof THREE.Object3D) {
            o = new THREE.Vector3(vectorOrObject.position.x, vectorOrObject.position.y, vectorOrObject.position.z)
        } else {
            console.error('the arguments is a object of Vector3 or Object3D ')
        }
        const sv = o.project(camera)
        const a = renderer.getSize(new THREE.Vector2()).width / 2
        const b = renderer.getSize(new THREE.Vector2()).height / 2
        const x = Math.round(sv.x * a + a)
        const y = Math.round(-sv.y * b + b)
        return { x, y }
    }

    /**
     * 判断是否是手机端
     */
    YsThree.prototype.isMobile = (navigator.userAgent.toLowerCase().match(/(ipod|ipad|iphone|android|coolpad|mmp|smartphone|midp|wap|xoom|symbian|j2me|blackberry|wince)/i) != null)

    /**
     * 计算三角形面积
     */
    YsThree.prototype.getTriangleArea = (v1, v2, v3) => new THREE.Vector3().crossVectors(v1.clone().sub(v2), v1.clone().sub(v3)).length() / 2

    /**
     * 随机颜色
     */
    YsThree.prototype.randomColor = () => `rgb(${parseInt(Math.random() * 256)},${parseInt(Math.random() * 256)},${parseInt(Math.random() * 256)})`

    /**
     * 计算网格对象体积
     */
    YsThree.prototype.getMeshVolume = mesh =>{
        let geometry = mesh.geometry.clone()
        if (geometry.isBufferGeometry) geometry = new THREE.Geometry().fromBufferGeometry(geometry)
        let V = 0
        geometry.faces.forEach(e => V += geometry.vertices[e.a].clone().cross(geometry.vertices[e.b]).dot(geometry.vertices[e.c]) / 6)
        return V
    }

    /**
     * 获取球体上的两点之间的制高点，用于绘制三维三次贝塞尔曲线
     */
    YsThree.prototype.getSphereHeightPoints = (v0, v3, n1, n2, p0) => {
        // 夹角
        const angle = (v0.angleTo(v3) * 180) / Math.PI / 10 // 0 ~ Math.PI
        const aLen = angle * (n1 || 10)
        const hLen = angle * angle * (n2 || 120)
        p0 = p0 || new THREE.Vector3(0, 0, 0) // 默认以 坐标原点为参考对象
        // 法线向量
        const rayLine = new THREE.Ray(p0, v0.clone().add(v3.clone()).divideScalar(2))
        // 顶点坐标
        const vtop = rayLine.at(hLen / rayLine.at(1).distanceTo(p0))
        // 计算制高点
        const getLenVector = (v1, v2, len) => v1.lerp(v2, len / v1.distanceTo(v2))
        // 控制点坐标
        return [getLenVector(v0.clone(), vtop, aLen), getLenVector(v3.clone(), vtop, aLen)]
    }

    /**
     * 获取与射线相交的对象数组
     */
    YsThree.prototype.getIntersectObject = (el, event, parent, recursive) => {
        event.preventDefault()
        const mouse = new THREE.Vector2()
        const raycaster = new THREE.Raycaster()
        let objectList = []
        try {
            mouse.x = (((event.clientX || (event.touches[0]? event.touches[0].pageX : event.changedTouches[0].pageX)) - el.getBoundingClientRect().left) / el.offsetWidth) * 2 - 1
            mouse.y = -(((event.clientY || (event.touches[0]? event.touches[0].pageY : event.changedTouches[0].pageY)) - el.getBoundingClientRect().top) / el.offsetHeight) * 2 + 1
            raycaster.setFromCamera(mouse, camera)
            // intersectObjects(object,recursive)object — 用来检测和射线相交的物体。recursive — 如果为true，它还检查所有后代。否则只检查该对象本身。缺省值为false。
            objectList = raycaster.intersectObjects((parent || scene).children, recursive)
        }
        catch (e) {
            // 鼠标越界
        }
        return {
            raycaster: raycaster,
            objectList: objectList
        }
    }

    /**
     * 点击取点
     * 用于测试取点
     */
    YsThree.prototype.getClickPoint = callback => {
        const T = app
        el.listen ? el.listen('tap',doIt) : '' // ys.event.js
        el.addEventListener('click',doIt,false)
        function doIt(e) {
            const objList = T.getIntersectObject(el,e,T.scene,true).objectList
            if(objList.length> 0){
                if(callback && typeof callback === 'function') callback(objList[0].point)
            }
        }
    }

    /**
     * 创建精灵文本
     */
    YsThree.prototype.createSpriteText = (text, options) => {
        if (!options) options = {}
        options.fontSize = options.fontSize || 12
        const average = el.offsetWidth > el.offsetHeight ? el.offsetHeight / 180 : el.offsetWidth / 360
        const canvas = DOC.createElement('canvas')
        canvas.width = text.length * (options.fontSize || 18) * average
        canvas.height = options.fontSize * average
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = options.backgroundColor || 'transparent'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.font = canvas.height + "px '微软雅黑'"
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = options.color
        ctx.fillText(text, canvas.width / 2, canvas.height / 2 * 1.15)
        const texture = new THREE.Texture(canvas)
        texture.needsUpdate = true
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }))
        sprite.renderOrder = 10
        sprite.scale.set(options.fontSize / average * text.length, options.fontSize / average, 1)
        return sprite
    }

    /**
     * 相机飞行
     */
    YsThree.prototype.flyTo = (TWEEN, option) => {
        option.position = option.position || [] // 相机新的位置
        option.controls = option.controls || [] // 控制器新的中心点位置(围绕此点旋转等)
        option.duration = option.duration || 1000 // 飞行时间
        option.easing = option.easing || TWEEN.Easing.Linear.None
        TWEEN.removeAll()
        const curPosition = camera.position
        const controlsTar = controls.target
        const tween = new TWEEN.Tween({
            x1: curPosition.x, // 相机当前位置x
            y1: curPosition.y, // 相机当前位置y
            z1: curPosition.z, // 相机当前位置z
            x2: controlsTar.x, // 控制当前的中心点x
            y2: controlsTar.y, // 控制当前的中心点y
            z2: controlsTar.z // 控制当前的中心点z
        }).to({
            x1: option.position[0], // 新的相机位置x
            y1: option.position[1], // 新的相机位置y
            z1: option.position[2], // 新的相机位置z
            x2: option.controls[0], // 新的控制中心点位置x
            y2: option.controls[1], // 新的控制中心点位置x
            z2: option.controls[2]  // 新的控制中心点位置x
        }, option.duration).easing(TWEEN.Easing.Linear.None) // TWEEN.Easing.Cubic.InOut //匀速
        tween.onUpdate(() => {
            controls.enabled = false
            camera.position.set(tween._object.x1, tween._object.y1, tween._object.z1)
            controls.target.set(tween._object.x2, tween._object.y2, tween._object.z2)
            controls.update()
            if (option.update instanceof Function) { option.update(tween) }
        })
        tween.onStart(() => {
            controls.enabled = false
            if (option.start instanceof Function) { option.start() }
        })
        tween.onComplete(() => {
            controls.enabled = true
            if (option.done instanceof Function) { option.done() }
        })
        tween.onStop(() => option.stop instanceof Function ? option.stop() : '')
        tween.start()
        TWEEN.add(tween)
        return tween
    }

    /**
     * 计算网格对象的面积
     */
    YsThree.prototype.getMeshArea = mesh => {
        let area = 0
        let geometry = mesh.geometry.clone()
        if (geometry.isBufferGeometry) geometry = new THREE.Geometry().fromBufferGeometry(geometry)
        geometry.faces.forEach(e => {
            area += app.getTriangleArea(
                geometry.vertices[e.a],
                geometry.vertices[e.b],
                geometry.vertices[e.c])
        })
        return area
    }

    /**
     * 初始化Status
     */
    YsThree.prototype.initStatus = Stat => {
        const stats = Stat ? new Stat() : new Stats()
        stats.setMode(0) // 0: fps, 1: ms
        stats.domElement.style.position = 'absolute'
        stats.domElement.style.left = '0px'
        stats.domElement.style.top = '0px'
        DOC.body.appendChild(stats.domElement)
        app.staus = stats
        return stats
    }

    /**
     * 初始化OrbitControls控制器
     */
    YsThree.prototype.initOrbitControls = (OrbitControls, dom) => {
        controls = OrbitControls ? new OrbitControls(camera, dom || renderer.domElement) : new THREE.OrbitControls(camera, dom || renderer.domElement)
        controls.enableDamping = true  // 使动画循环使用时阻尼或自转 意思是否有惯性
        // controls.dampingFactor = 0.25; // 动态阻尼系数 就是鼠标拖拽旋转灵敏度
        controls.enableZoom = true  // 是否可以缩放
        controls.autoRotate = true  // 开启自转
        controls.autoRotateSpeed = 0.3 //自传速度
        // controls.minDistance = 0   // 设置相机距离原点的最近距离
        // controls.maxDistance = 1000; // 设置相机距离原点的最远距离
        controls.enablePan = true   // 是否开启右键拖拽
       // controls.maxPolarAngle = Math.PI / 2.2// 禁止入地
        app.controls = controls

        return controls
    }
    /**
     * 创建 动态的线 包括 球面--meshLine，  球面--管道线， 曲线--meshLine， 曲线--管道线
     */
    YsThree.prototype.createAnimateLine = option => {
        let curve
        if (option.kind === 'sphere') { // 由两点之间连线成贝塞尔曲线
            const sphereHeightPointsArgs = option.sphereHeightPointsArgs
            const pointList = app.getSphereHeightPoints(...sphereHeightPointsArgs) // v0,v3,n1,n2,p0
            curve = new THREE.CubicBezierCurve3(sphereHeightPointsArgs[0], pointList[0], pointList[1], sphereHeightPointsArgs[1])
        } else { // 由多个点数组构成的曲线 通常用于道路
            const l = []
            option.pointList.forEach(e => l.push(new THREE.Vector3(e[0], e[1], e[2])))
            curve = new THREE.CatmullRomCurve3(l) // 曲线路径
        }
        if (option.type === 'pipe') { // 使用管道线
            // 管道体
            const tubeGeometry = new THREE.TubeGeometry(curve, option.number || 50, option.radius || 1, option.radialSegments)
            return new THREE.Mesh(tubeGeometry, option.material)
        } else { // 使用 meshLine
            if (!MeshLine || !MeshLineMaterial) console.error('you need import MeshLine & MeshLineMaterial!')
            else {
                const geo = new THREE.Geometry()
                geo.vertices = curve.getPoints(option.number || 50)
                const meshLine = new MeshLine()
                meshLine.setGeometry(geo)
                return new THREE.Mesh(meshLine.geometry, option.material)
            }
        }
    }

    /**
     * html2canvas材质
     */
    YsThree.prototype.addHtmlCanvas = (html2canvas, option) => {
        option.parent = option.parent || scene
        option.scale = option.scale || [1,1,1]
        option.position = option.position || [0,0,0]
        DOC.body.insertAdjacentHTML('beforeend', option.element)
        const element = DOC.body.lastChild
        element.style.zIndex = -1
        html2canvas(element,{ backgroundColor: 'transparent' }).then(canvas => {
            option.position = option.position || [0,0,0]
            let html
            if(option.type === 'plane') {
                html = new THREE.Mesh(new THREE.PlaneBufferGeometry(100,100,10), new THREE.MeshStandardMaterial({
                    map: new THREE.CanvasTexture(canvas),
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    side: THREE.DoubleSide
                }))
            }else {
                html = new THREE.Sprite( new THREE.SpriteMaterial( {
                    map: new THREE.CanvasTexture(canvas),
                    blending: THREE.AdditiveBlending,
                    transparent: true,
                    sizeAttenuation: option.sizeAttenuation || true
                }))
            }
            html.scale.set(option.scale[0],option.scale[1],option.scale[2])
            html.position.set(option.position[0],option.position[1],option.position[2])
            html.name = option.name || 'canvas-sprite'
            option.parent.add(html)
            DOC.body.removeChild(element)
            if(option.callback) option.callback(html)
        })
    }
    
    /**
     * 销毁
     * @param frameId
     */
    YsThree.prototype.destroy = frameId => {
        if(frameId) cancelAnimationFrame(frameId) //销毁requestAnimationFrame
        renderer.forceContextLoss() //销毁context
        scene.dispose()
        controls.dispose()
        renderer = null
        scene = null
        camera = null
    }
    /**
     * 渲染
     * @param callback
     */
    YsThree.prototype.render = callback => {
        const t = app
        callback()
        t.frameId = requestAnimationFrame(() =>  t.render(callback))
    }
    /* 一般函数 end****/

    return YsThree
})(document, window, undefined)
window.YsThree = YsThree
// export default YsThree


// 声明
console.log(['%c跃焱邵隼', '%c时间: 2020-05', '%c主页: www.wellyyss.cn', '%cQQ群: 169470811', '%c申明: 本站开源免费，可以重构修改，但请保留上方控制台输出内容 😊'].join('\n').toString(),
    `
            background:url(http://www.wellyyss.cn/images/logo.png) no-repeat left center;
            background-size:30px 40px;
            padding-left:40px;
            line-height:50px;
            font-size: 18px;
            font-weight:bold;
            color:#00D4FF
            `,
    `
            background:none;
            line-height:30px;
            font-size: 18px;
            font-weight:bold;
            color:#00D4FF
            `,
    `
             padding-left:40px;
            background:none;
            line-height:30px;
            font-size: 18px;
            font-weight:bold;
            color:#00D4FF
            `,
    `
            background:none;
            line-height:30px;
            font-size: 18px;
            font-weight:bold;
            color:#00D4FF
            `,
    `
            padding-left:40px;
            background:none;
            line-height:30px;
            font-size: 18px;
            font-weight:bold;
            color:#00D4FF
            `
)


export default YsThree;
/* eslint-disable */