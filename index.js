import {physicsUpdate, render} from "./loop.js";
import {createProgram} from "./util.js";
import vec3 from "./vec3.js";
import "./integrations.js";
const glsl = (x) => x;
const downgradeResolution = 1;
if (downgradeResolution > 1) {
  canvas.style.imageRendering = "pixelated";
}
const resize = () => {
  const dpr = window.devicePixelRatio || 1;
  if (downgradeResolution > 1) {
    canvas.width = window.innerWidth / downgradeResolution;
    canvas.height = window.innerHeight / downgradeResolution;
  } else {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  document.querySelector("#resolution").innerText = `${canvas.width} X ${canvas.height}`;
};
resize();
window.addEventListener("resize", resize);
const gl = canvas.getContext("webgl2");
if (!gl) {
  throw new Error("WebGL 2 isn't supported on your platform. Probably you could enable it manually");
}
const vertexCode = glsl`#version 300 es

in vec4 a_position;

// in vec2 a_position;

// uniform vec2 u_resolution;

void main() {
    // vec2 clip_space = a_position / u_resolution * 2 - 1.0;
    
    // gl_Position = vec4(clip_space);
    gl_Position = a_position;
}
`;
const fragmentCode = glsl`#version 300 es
precision highp float;

uniform vec4 u_color;

out vec4 outColor;

void main() {
    outColor = u_color;
}
`;
const shaderProgram = createProgram(gl, vertexCode, fragmentCode);
const positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);
gl.enableVertexAttribArray(positionAttributeLocation);
gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
gl.useProgram(shaderProgram);
setInterval(physicsUpdate, 10);
let fps = 0;
setInterval(() => {
  const fpsElem = document.querySelector("#fps");
  fpsElem.innerText = fps + "";
  fps = 0;
  vec3(0, 0, 0);
}, 1e3);
const renderLoop = () => {
  fps++;
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  render(gl, shaderProgram);
  requestAnimationFrame(renderLoop);
};
renderLoop();
