/**
 * Performance Utilities - Debounce, throttle, and optimization helpers
 * @module utils/Performance
 */

/**
 * Debounce function - delays execution until after wait ms have passed since last call
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(this: any, ...args: Parameters<T>) {
    const context = this;

    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, args);
  };
}

/**
 * Throttle function - limits execution to once per wait ms
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function executedFunction(this: any, ...args: Parameters<T>) {
    const context = this;

    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;

      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(context, lastArgs);
          lastArgs = null;
        }
      }, wait);
    } else {
      lastArgs = args;
    }
  };
}

/**
 * RequestAnimationFrame with visibility detection
 * Pauses animation when tab is not visible
 */
export class AnimationController {
  private animationId: number | null = null;
  private isRunning = false;
  private isPaused = false;
  private callback: ((deltaTime: number) => void) | null = null;
  private lastTime = 0;

  constructor() {
    // Listen for visibility changes
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.pause();
    } else if (this.isRunning) {
      this.resume();
    }
  };

  /**
   * Start animation loop with callback
   */
  start(callback: (deltaTime: number) => void): void {
    this.callback = callback;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.loop();
  }

  /**
   * Stop animation completely
   */
  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Pause animation (can be resumed)
   */
  pause(): void {
    this.isPaused = true;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Resume paused animation
   */
  resume(): void {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.lastTime = performance.now();
      this.loop();
    }
  }

  private loop = () => {
    if (!this.isRunning || this.isPaused) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    if (this.callback) {
      this.callback(deltaTime);
    }

    this.animationId = requestAnimationFrame(this.loop);
  };

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stop();
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

/**
 * Object pool for reducing garbage collection
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;

  constructor(factory: () => T, reset: (obj: T) => void, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;

    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  /**
   * Get an object from the pool
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    this.reset(obj);
    this.pool.push(obj);
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * Get current pool size
   */
  get size(): number {
    return this.pool.length;
  }
}

/**
 * Simple LRU Cache for memoization
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Measure execution time of a function
 */
export function measureTime<T>(
  fn: () => T,
  label?: string
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (label) {
    console.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

/**
 * Batch DOM updates to reduce reflows
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
  // Use requestAnimationFrame to batch DOM reads/writes
  requestAnimationFrame(() => {
    updates.forEach((update) => update());
  });
}

/**
 * Check if requestIdleCallback is available
 */
export const hasIdleCallback = 'requestIdleCallback' in window;

/**
 * Schedule work during idle periods
 */
export function scheduleIdleWork(
  callback: () => void,
  options?: { timeout?: number }
): number {
  if (hasIdleCallback) {
    return (window as any).requestIdleCallback(callback, options);
  }
  // Fallback to setTimeout
  return window.setTimeout(callback, options?.timeout || 1) as unknown as number;
}

/**
 * Cancel scheduled idle work
 */
export function cancelIdleWork(id: number): void {
  if (hasIdleCallback) {
    (window as any).cancelIdleCallback(id);
  } else {
    clearTimeout(id);
  }
}
