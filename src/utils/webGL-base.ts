/*
 * @Date: 2021-06-23 19:53:02
 * @LastEditors: huangzh873
 * @LastEditTime: 2021-07-29 16:19:35
 * @FilePath: \cesium-web-vue\src\utils\webGL-base.ts
 */

function ready (callback:() => void):void {
	document.addEventListener('DOMContentLoaded', callback);
}
/**
 * Create a program object and make current
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return true, if the program object was created and successfully made current 
 */
function initShaders(gl:WebGLRenderingContext, vshader:string, fshader:string):WebGLProgram {
  const program = createProgram(gl, vshader, fshader);
  if (!program) {
    throw new Error("Failed to create program");
  }
  gl.useProgram(program);

  return program;
}

/**
 * Create the linked program object
 * @param gl GL context
 * @param vshader a vertex shader program (string)
 * @param fshader a fragment shader program (string)
 * @return created program object, or null if the creation has failed
 */
 function createProgram(gl:WebGLRenderingContext, vshader:string, fshader:string):WebGLProgram {
  // Create shader object
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);

  // Create a program object
  const program = gl.createProgram();
  if (!program) {
    throw new Error("created program failed");
  }

  // Attach the shader objects
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // Link the program object
  gl.linkProgram(program);

  // Check the result of linking
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    const error = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    throw new Error("Failed to link program: " + error);
    
  }
  return program;
}

/**
 * Create a shader object
 * @param gl GL context
 * @param type the type of the shader object to be created
 * @param source shader program (string)
 * @return created shader object, or null if the creation has failed.
 */
 function loadShader(gl:WebGLRenderingContext, type:number, source:string): WebGLShader {
  // Create shader object
  const shader = gl.createShader(type);
  if (shader == null) {
    throw new Error("unable to create shader");
  }

  // Set the shader program
  gl.shaderSource(shader, source);

  // Compile the shader
  gl.compileShader(shader);

  // Check the result of compilation
  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    const error = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("Failed to compile shader:" + error);
  }

  return shader;
}



export { ready, initShaders }