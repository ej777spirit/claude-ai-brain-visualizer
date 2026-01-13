/**
 * Mock Three.js for Jest tests
 */

export class Scene {
  children: any[] = [];
  background = null;
  fog = null;
  add(obj: any) { this.children.push(obj); }
  remove(obj: any) {
    const idx = this.children.indexOf(obj);
    if (idx > -1) this.children.splice(idx, 1);
  }
}

export class PerspectiveCamera {
  position = new Vector3();
  aspect = 1;
  updateProjectionMatrix() {}
  lookAt() {}
}

export class WebGLRenderer {
  domElement = document.createElement('canvas');
  shadowMap = { enabled: false, type: 0 };
  setSize() {}
  setPixelRatio() {}
  render() {}
  dispose() {}
}

export class Vector3 {
  x = 0;
  y = 0;
  z = 0;
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  clone() { return new Vector3(this.x, this.y, this.z); }
  copy(v: Vector3) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  addVectors(a: Vector3, b: Vector3) {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    return this;
  }
  multiplyScalar(s: number) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    return this;
  }
  lerpVectors(a: Vector3, b: Vector3, t: number) {
    this.x = a.x + (b.x - a.x) * t;
    this.y = a.y + (b.y - a.y) * t;
    this.z = a.z + (b.z - a.z) * t;
    return this;
  }
}

export class Color {
  r = 0;
  g = 0;
  b = 0;
  constructor(c?: number | string) {}
  clone() { return new Color(); }
  lerp() { return this; }
  setHex() { return this; }
}

export class Mesh {
  position = new Vector3();
  rotation = new Vector3();
  scale = new Vector3(1, 1, 1);
  material: any = {};
  geometry: any = {};
  userData: any = {};
  children: any[] = [];
  uuid = Math.random().toString(36);
  add(obj: any) { this.children.push(obj); }
}

export class Line {
  position = new Vector3();
  geometry: any = {};
  material: any = {};
}

export class SphereGeometry {
  dispose() {}
}

export class BufferGeometry {
  attributes: any = { position: { array: new Float32Array(0), count: 0, needsUpdate: false, setXYZ: () => {} } };
  setFromPoints() { return this; }
  setAttribute() { return this; }
  dispose() {}
}

export class MeshPhongMaterial {
  color = new Color();
  opacity = 1;
  transparent = false;
  emissive = new Color();
  emissiveIntensity = 0;
  dispose() {}
}

export class MeshPhysicalMaterial {
  color = new Color();
  metalness = 0;
  roughness = 0;
  opacity = 1;
  transparent = false;
  emissive = new Color();
  emissiveIntensity = 0;
  dispose() {}
}

export class LineBasicMaterial {
  color = new Color();
  opacity = 1;
  transparent = false;
  vertexColors = false;
  linewidth = 1;
  dispose() {}
}

export class AmbientLight {
  dispose() {}
}

export class DirectionalLight {
  position = new Vector3();
  castShadow = false;
  shadow = { mapSize: { width: 0, height: 0 } };
  dispose() {}
}

export class PointLight {
  position = new Vector3();
  dispose() {}
}

export class Fog {
  constructor(color?: number, near?: number, far?: number) {}
}

export class Float32BufferAttribute {
  constructor(array: number[], itemSize: number) {}
}

export class QuadraticBezierCurve3 {
  constructor(v0: Vector3, v1: Vector3, v2: Vector3) {}
  getPoints(divisions: number) { return [new Vector3(), new Vector3()]; }
}

export const PCFSoftShadowMap = 2;
