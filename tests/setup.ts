import 'jest-environment-jsdom';

/**
 * Jest test setup
 */

// Mock Three.js to avoid canvas/WebGL issues in tests
jest.mock('three', () => ({
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    lookAt: jest.fn(),
  })),
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    domElement: document.createElement('canvas'),
    dispose: jest.fn(),
  })),
  Mesh: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    geometry: {},
    material: {},
  })),
  SphereGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  Color: jest.fn(),
  Vector3: jest.fn().mockImplementation((x: number, y: number, z: number) => ({ x, y, z })),
  OrbitControls: jest.fn().mockImplementation(() => ({
    enableDamping: true,
    dampingFactor: 0.05,
    update: jest.fn(),
  })),
}));

// Mock the OrbitControls module specifically
jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: jest.fn().mockImplementation(() => ({
    enableDamping: true,
    dampingFactor: 0.05,
    update: jest.fn(),
  })),
}));

// Mock axios for API tests
jest.mock('axios');
const mockAxios = require('axios');
mockAxios.create.mockReturnValue(mockAxios);

// Global test utilities
(global as any).testUtils = {
  createMockElement: (tag = 'div') => {
    const element = document.createElement(tag);
    document.body.appendChild(element);
    return element;
  },

  cleanupMockElements: () => {
    const mocks = document.querySelectorAll('[data-testid]');
    mocks.forEach(mock => mock.remove());
  },

  waitFor: (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)),
};

// Cleanup after each test
afterEach(() => {
  jest.clearAllMocks();
  (global as any).testUtils.cleanupMockElements();
});