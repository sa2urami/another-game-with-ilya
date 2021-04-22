import _ from "./_snowpack/pkg/lodash.js";
import {activeControls} from "./controls.js";
import {Matrix4x4} from "./structures.js";
import {entries, mapVector} from "./util.js";
import vec3 from "./vec3.js";
const fNear = 0.1;
const fFar = 1e3;
const fFov = 90;
let fAspectRatio = 1;
const fFovRad = 1 / Math.tan(fFov * 0.5 / 180 * 3.14159);
const camera = vec3(0, 0, 0);
const getBlockSideCoordinates = (x, y, z) => {
  return [
    0,
    0,
    0,
    0
  ];
};
class Triangle {
  constructor(points) {
    this.points = points;
    Triangle.setNormal(this);
  }
  static setNormal(triangle) {
    const line1 = vec3(triangle.points[1].x - triangle.points[0].x, triangle.points[1].y - triangle.points[0].y, triangle.points[1].z - triangle.points[0].z), line2 = vec3(triangle.points[2].x - triangle.points[0].x, triangle.points[2].y - triangle.points[0].y, triangle.points[2].z - triangle.points[0].z), normal = vec3(line1.y * line2.z - line1.z * line2.y, line1.z * line2.x - line1.x * line2.z, line1.x * line2.y - line1.y * line2.x);
    normal.normalize();
    triangle.normal = normal;
  }
}
const blockSideToCoordinateMap = {
  west: ["x", 1],
  east: ["x", -1],
  south: ["z", 1],
  north: ["z", -1],
  top: ["y", 1],
  bottom: ["y", -1]
};
const getTriangles = (blockPosition) => {
  const blockSidesArr = {
    top: [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 0],
      [0, 1, 0]
    ],
    bottom: [
      [0, 0, 0],
      [1, 0, 0],
      [1, 0, 1],
      [0, 0, 1]
    ],
    south: [
      [1, 1, 1],
      [0, 1, 1],
      [0, 0, 1],
      [1, 0, 1]
    ],
    north: [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
      [0, 0, 0]
    ],
    west: [
      [1, 1, 0],
      [1, 1, 1],
      [1, 0, 1],
      [1, 0, 0]
    ],
    east: [
      [0, 0, 0],
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0]
    ]
  };
  const blockSidesTriangles = _.mapValues(blockSidesArr, (squareCoordinatesArr) => {
    const squareCoordinates = squareCoordinatesArr.map((coordinateArr) => {
      const point = vec3(...coordinateArr);
      point.add(blockPosition);
      return point;
    });
    const triangles = [
      squareCoordinates.slice(0, -1),
      [
        ...squareCoordinates.slice(2),
        squareCoordinates[0]
      ]
    ].map((triangleCoordinates) => new Triangle(triangleCoordinates));
    return triangles;
  });
  return blockSidesTriangles;
};
class World {
}
World.HEIGHT = 256;
class Block {
  constructor(position) {
    this.position = position;
  }
}
class Chunk {
  constructor(blocks2) {
  }
}
Chunk.SIZE = 16;
const triangleToClip = (buf) => {
  var count = 0;
  for (const i in buf) {
    if (buf[i][0] * buf[i][0] > 1 || buf[i][1] * buf[i][1] > 1)
      count++;
  }
  return count;
};
const multipleMatrix = (vector, {matrix}) => {
  mapVector(vector, (value, i) => {
    return matrix[0][i] * value + matrix[1][i] * value + matrix[2][i] * value + matrix[3][i];
  });
  const w = matrix[0][3] * vector.x + matrix[1][3] * vector.y + matrix[2][3] * vector.z + matrix[3][3];
  if (w != 0) {
    mapVector(vector, (val) => val / w);
  }
};
const vecbymat1 = (vector, {matrix}) => {
  mapVector(vector, (_2, i) => matrix[i][0] * vector.x + matrix[i][1] * vector.y + matrix[i][2] * vector.z);
};
const doesBlockExist = (position) => {
  for (const block of blocks) {
    if (block.position.equals(position))
      return true;
  }
  return false;
};
const blocks = [
  new Block(vec3(0, 0, 1))
];
const mesh = [];
const recalculateMesh = () => {
  for (const block of blocks) {
    const sideTriangles = getTriangles(block.position);
    const blockColor = (block.position.x + block.position.z % 2) % 2 === 0 ? [1, 0, 0] : [0, 1, 0];
    for (const [side, triangles] of entries(sideTriangles)) {
      const siblingBlockPos = block.position.clone();
      const [componentAdd, valueToAdd] = blockSideToCoordinateMap[side];
      mapVector(siblingBlockPos, (value, _index, component) => {
        if (component !== componentAdd)
          return value;
        return value + valueToAdd;
      });
      const siblingBlockExists = doesBlockExist(siblingBlockPos);
      if (!siblingBlockExists)
        mesh.push({
          triangles,
          color: blockColor
        });
    }
  }
};
_.times(10, (x) => {
  _.times(10, (z) => {
    blocks.push(new Block(vec3(x, 0, z)));
  });
});
recalculateMesh();
const matProj = new Matrix4x4();
matProj.matrix[0][0] = fAspectRatio * fFovRad;
matProj.matrix[1][1] = fFovRad;
matProj.matrix[2][2] = fFar / (fFar - fNear);
matProj.matrix[3][2] = -fFar * fNear / (fFar - fNear);
matProj.matrix[2][3] = 1;
matProj.matrix[3][3] = 0;
document.addEventListener("resize", () => {
  fAspectRatio = canvas.width / canvas.height;
  matProj.matrix[0][0] = fAspectRatio * fFovRad;
});
let rz = 0, ry = 0;
document.addEventListener("mousemove", (event) => {
  if (!document.pointerLockElement)
    return;
  const {movementX: deltaX, movementY: deltaY} = event;
  const delimeter = 500;
  rz -= deltaX / delimeter;
  if (ry - deltaY / delimeter > -1.54 && ry - deltaY / delimeter < 1.54)
    ry -= deltaY / delimeter;
});
const MOVEMENT_DIVIDER_MIN = 100;
const moveCamera = (vecAdd, subtract) => {
  let movementDivider = MOVEMENT_DIVIDER_MIN;
  if (activeControls.slowDown.query())
    movementDivider *= 2;
  mapVector(vecAdd, (val) => val / movementDivider);
  camera[subtract ? "subtract" : "add"](vecAdd);
};
export const physicsUpdate = () => {
  if (activeControls.jump.query()) {
    moveCamera(vec3(0, 1, 0), false);
  }
  if (activeControls.crouch.query()) {
    moveCamera(vec3(0, -1, 0), false);
  }
  const movement = activeControls.movement.query();
  if (movement.y) {
    moveCamera(vec3(-Math.sin(rz), 0, Math.cos(rz)), movement.y > 0);
  }
  if (movement.x) {
    moveCamera(vec3(-Math.cos(rz), 0, -Math.sin(rz)), movement.x > 0);
  }
};
const drawCrosshair = (gl) => {
  const vert = [
    -2e-3,
    -1e-3,
    2e-3
  ];
};
const drawTriangles = (gl, points, method = "fill") => {
  const triangles2dPoints = points.map(({x, y}) => [x, y]);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangles2dPoints.flat()), gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, points.length);
};
export const render = (gl, shaderProgram) => {
  let drawedTriangles = 0;
  const colorUniformLocation = gl.getUniformLocation(shaderProgram, "u_color");
  let RZ = new Matrix4x4(), RY = new Matrix4x4();
  RZ.matrix[1][1] = 1;
  RZ.matrix[2][2] = Math.cos(rz);
  RZ.matrix[0][2] = Math.sin(rz);
  RZ.matrix[2][0] = -Math.sin(rz);
  RZ.matrix[0][0] = Math.cos(rz);
  RY.matrix[0][0] = 1;
  RY.matrix[1][1] = Math.cos(ry);
  RY.matrix[2][1] = Math.sin(ry);
  RY.matrix[1][2] = -Math.sin(ry);
  RY.matrix[2][2] = Math.cos(ry);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform4f(colorUniformLocation, 1, 0, 0, 1);
  for (const {triangles, color} of mesh) {
    gl.uniform4f(colorUniformLocation, ...color, 1);
    triangle:
      for (const triangle of triangles) {
        if (triangle.normal.x * (triangle.points[0].x - camera.x) + triangle.normal.y * (triangle.points[0].y - camera.y) + triangle.normal.z * (triangle.points[0].z - camera.z) >= 0)
          continue;
        let {points} = triangle;
        points = points.map((vec) => vec.clone());
        for (const i in points) {
          points[i].subtract(camera);
          points[i].z += fNear;
          vecbymat1(points[i], RZ);
          vecbymat1(points[i], RY);
          points[i].z -= fNear;
          if (points[i].z <= fNear)
            continue triangle;
          multipleMatrix(points[i], matProj);
        }
        drawedTriangles++;
        drawTriangles(gl, points);
      }
  }
  drawCrosshair(gl);
  document.getElementById("triangles").innerText = drawedTriangles.toString();
};
