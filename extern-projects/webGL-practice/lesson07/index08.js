/*
 * @Date: 2021-07-05 09:49:35
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-05 19:24:29
 * @FilePath: \cesium-web-vue\extern-projects\webGL-practice\lesson07\index08.js
 */

/* ------------------------------ 顶点着色器和片元着色器开始 --------------------------------*/
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_MvpMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_MvpMatrix * a_Position;
    v_Color = a_Color;
  }
`

const FSHADER_SOURCE = `
  precision mediump float;
  varying vec4 v_Color;
  void main() {
    gl_FragColor = v_Color;
  }
`
/* ------------------------------ 顶点着色器和片元着色器结束 --------------------------------*/

window.onload = () => {
  const canvas = document.getElementById('webgl');
  const gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  const n = initVertexBuffer(gl);
  const u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');

  const modelMatrix = new Matrix4();
  const viewMatrix = new Matrix4();
  const projMatrix = new Matrix4();
  const mvpMatrix = new Matrix4();


  modelMatrix.setTranslate(0.75, 0, 0);
  viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
  projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

  // 这里注意
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix)

  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // 设置背景颜色
  gl.clearColor(0, 0, 0, 1);
  // 清除颜色缓冲区（类似清除模板缓冲区）
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);

  modelMatrix.setTranslate(-0.75, 0, 0);
  mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix)
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
  gl.drawArrays(gl.TRIANGLES, 0, n);

}

/**
 * @description: 设置顶点坐标和颜色，蓝色三角形在最前面
 * @param {WebGLRenderingContext}
 * @return {Number} [n] 顶点数
 */
function initVertexBuffer(gl) {
  const verticesColors = new Float32Array([
    0.0, 1.0, -4.0, 0.4, 1.0, 0.4, // 黑色在最后
    -0.5, -1.0, -4.0, 0.4, 1.0, 0.4,
    0.5, -1.0, -4.0, 1.0, 0.4, 0.4,

    0.0, 1.0, -2.0, 1.0, 1.0, 0.4, // 黄色在中间
    -0.5, -1.0, -2.0, 1.0, 1.0, 0.4,
    0.5, -1.0, -2.0, 1.0, 0.4, 0.4,

    0.0, 1.0, 0.0, 0.4, 0.4, 1.0, // 蓝色在正面 
    -0.5, -1.0, 0.0, 0.4, 0.4, 1.0,
    0.5, -1.0, 0.0, 1.0, 0.4, 0.4,
  ])
  const n = verticesColors.length / 6;

  const verticesColorBuffer = gl.createBuffer();
  if (!verticesColorBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, verticesColorBuffer);
  // gl.STATIC_DRAW:缓冲区的内容可能经常使用，而不会经常更改。内容被写入缓冲区，但不被读取。
  gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

  const FSIZE = verticesColors.BYTES_PER_ELEMENT;
  const a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  const a_Color = gl.getAttribLocation(gl.program, 'a_Color');

  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
  gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
  gl.enableVertexAttribArray(a_Position);
  gl.enableVertexAttribArray(a_Color);

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return n

}