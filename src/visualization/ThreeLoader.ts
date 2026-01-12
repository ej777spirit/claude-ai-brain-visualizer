/**
 * Lazy Three.js Loader - Enables code splitting for Three.js
 * @module visualization/ThreeLoader
 * 
 * This module lazy-loads Three.js on demand, reducing initial bundle size
 * and improving first contentful paint.
 */

// Cache for loaded modules
let cachedThree: typeof import('three') | null = null;
let cachedOrbitControls: typeof import('three/examples/jsm/controls/OrbitControls').OrbitControls | null = null;

/**
 * Lazy load Three.js core
 */
export async function loadThree(): Promise<typeof import('three')> {
  if (cachedThree) {
    return cachedThree;
  }
  
  cachedThree = await import('three');
  return cachedThree;
}

/**
 * Lazy load OrbitControls
 */
export async function loadOrbitControls(): Promise<typeof import('three/examples/jsm/controls/OrbitControls').OrbitControls> {
  if (cachedOrbitControls) {
    return cachedOrbitControls;
  }
  
  const module = await import('three/examples/jsm/controls/OrbitControls');
  cachedOrbitControls = module.OrbitControls;
  return cachedOrbitControls;
}

/**
 * Load all Three.js modules at once
 */
export async function loadAllThreeModules(): Promise<{
  THREE: typeof import('three');
  OrbitControls: typeof import('three/examples/jsm/controls/OrbitControls').OrbitControls;
}> {
  const [THREE, OrbitControls] = await Promise.all([
    loadThree(),
    loadOrbitControls(),
  ]);
  
  return { THREE, OrbitControls };
}

/**
 * Check if Three.js is already loaded
 */
export function isThreeLoaded(): boolean {
  return cachedThree !== null;
}
