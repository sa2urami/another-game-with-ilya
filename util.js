import vec3 from "./vec3.js";
export const isMouseLocked = () => !!document.pointerLockElement;
export const mapVector = (vector, callback) => {
  const c = ["x", "y", "z"];
  const newArray = vector.toArray().map((value, index) => callback(value, index, c[index]));
  vector.update(vec3(...newArray));
};
export const debug = (str) => {
  console.log(str);
};
export const entries = (obj) => {
  return Object.entries(obj);
};
export const keys = (obj) => {
  return Object.keys(obj);
};
export const createProgram = (gl, vertexShader, fragmentShader) => {
  const createShader = (gl2, type, source) => {
    const shader = gl2.createShader(type);
    gl2.shaderSource(shader, source);
    gl2.compileShader(shader);
    const success = gl2.getShaderParameter(shader, gl2.COMPILE_STATUS);
    if (!success) {
      const info = gl2.getShaderInfoLog(shader);
      gl2.deleteShader(shader);
      throw new Error("Shader compile error: " + info);
    }
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShader));
  gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShader));
  gl.linkProgram(program);
  const linkSuccess = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linkSuccess) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error("Program link error: " + info);
  }
  return program;
};
