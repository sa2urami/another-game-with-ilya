export const coordinateComponents = ["x", "y", "z"];
export class Matrix4x4 {
  constructor() {
    this.matrix = new Array(4).fill(void 0).map(() => {
      return new Array(4).fill(0);
    });
  }
}
