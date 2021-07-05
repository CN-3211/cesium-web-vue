/*
 * @Date: 2021-07-05 09:49:35
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-05 16:11:15
 * @FilePath: \cesium-web-vue\extern-projects\webGL-practice\lesson07\index05.js
 */

/* ------------------------------ 顶点着色器和片元着色器开始 --------------------------------*/
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec4 a_Color;
  uniform mat4 u_ProjMatrix;
  varying vec4 v_Color;
  void main() {
    gl_Position = u_ProjMatrix * a_Position;
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
  const u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
  const projMatrix = new Matrix4();
  const nearAndFarValue = {
    near: 0.0,
    far: 0.5
  }
  const nfDomElement = document.getElementById("nearFar")
  document.onkeydown = event => {
    _keydown(event, gl, u_ProjMatrix, projMatrix, nearAndFarValue, n, nfDomElement);
  }
  _draw(gl, u_ProjMatrix, projMatrix, nearAndFarValue, n, nfDomElement)
}

/**
 * @description: 设置顶点坐标和颜色，蓝色三角形在最前面
 * @param {WebGLRenderingContext}
 * @return {Number} [n] 顶点数
 */
function initVertexBuffer(gl) {
  const verticesColors = new Float32Array([
    0.0, 0.5, -0.4, 0.4, 1.0, 0.4, // 绿色三角形在最后面
    -0.5, -0.5, -0.4, 0.4, 1.0, 0.4,
    0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

    0.5, 0.4, -0.2, 1.0, 0.4, 0.4, // 黄色三角形在中间
    -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
    0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

    0.0, 0.5, 0.0, 0.4, 0.4, 1.0, // 蓝色三角形在最前面
    -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
    0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
  ])
  const n = verticesColors.length / 6;

  const verticesColorBuffer = gl.createBuffer();
  if(!verticesColorBuffer) {
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


function _keydown(event, gl, u_ProjMatrix, projMatrix, nearAndFarValue, n, nfDomElement) {
  switch(event.keyCode){
    case 39: nearAndFarValue.near += 0.01; break;  // The right arrow key was pressed
    case 37: nearAndFarValue.near -= 0.01; break;  // The left arrow key was pressed
    case 38: nearAndFarValue.far += 0.01;  break;  // The up arrow key was pressed
    case 40: nearAndFarValue.far -= 0.01;  break;  // The down arrow key was pressed
    default: console.log("仅支持上下左右键！"); return; // Prevent the unnecessary drawing
  }

  _draw(gl, u_ProjMatrix, projMatrix, nearAndFarValue, n, nfDomElement)
}

function _draw(gl, u_ProjMatrix, projMatrix, nearAndFarValue, n, nfDomElement) {
  projMatrix.setOrtho(-1.0, 1.0, -1.0, 1.0, nearAndFarValue.near, nearAndFarValue.far);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);
  nfDomElement.innerHTML = `near:${Math.round(nearAndFarValue.near * 100) / 100}, far:${Math.round(nearAndFarValue.far * 100) / 100}`

  // 设置背景颜色
  gl.clearColor(0, 0, 0, 1);
  // 清除颜色缓冲区（类似清除模板缓冲区）
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}