/**
 * Mock Three.js examples for Jest tests
 */

import { Vector3 } from './three';

export class OrbitControls {
  target = new Vector3();
  enableDamping = false;
  dampingFactor = 0;
  maxDistance = 0;
  minDistance = 0;
  enablePan = false;
  enableZoom = false;
  enableRotate = false;
  
  constructor(camera: any, domElement: any) {}
  update() {}
  dispose() {}
}

export class CSS2DRenderer {
  domElement = document.createElement('div');
  setSize() {}
  render() {}
}

export class CSS2DObject {
  position = new Vector3();
  element: HTMLElement;
  
  constructor(element: HTMLElement) {
    this.element = element;
  }
}
