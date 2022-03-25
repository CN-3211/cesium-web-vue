/*
 * @Date: 2022-01-10 11:41:52
 * @LastEditors: huangzh873
 * @LastEditTime: 2022-01-10 14:25:02
 * @FilePath: /cesium-web-vue/src/components/toolbarGroup/Scenes/rain.ts
 */
import { PostProcessStage, Viewer } from 'cesium';

// 要改
// const RainShader = require('./rain.glsl')
// console.log('RainShader :>> ', RainShader);

class rainEffect {
  rainPostProcessStage: undefined | PostProcessStage
  startRainEffect(viewer: Viewer) {
    this.rainPostProcessStage = this.createRainPostProcessStage()
    viewer.scene.postProcessStages.add(this.rainPostProcessStage)
  }
  stopRainEffect(viewer: Viewer) {
    if(this.rainPostProcessStage) {
      viewer.scene.postProcessStages.remove(this.rainPostProcessStage)
      this.rainPostProcessStage = undefined;
    }
  }
  createRainPostProcessStage() {
    return new PostProcessStage({
      fragmentShader: `uniform sampler2D colorTexture;
      varying vec2 v_textureCoordinates;
      uniform float speed;
      
      float hash(float x){
        return fract(sin(x*23.3)*13.13);
      }
      
      void main(){
        float time = czm_frameNumber * speed / 1000.0;
        vec2 resolution = czm_viewport.zw;
        vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);
        vec3 c=vec3(.1,.2,.3);
        float a=-.3;
        float si=sin(a),co=cos(a);
        uv*=mat2(co,-si,si,co);
        uv*=length(uv+vec2(0,4.9))*.3+1.;
        float v=1.-sin(hash(floor(uv.x*100.))*2.);
        float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*10.;
        c*=v*b;
        gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), 0.5);
      }`,
      uniforms: {
        speed: 10
      }
    })
  }
}
/** 下雨特效开始 */

export default rainEffect
/** 雨天特效结束 */