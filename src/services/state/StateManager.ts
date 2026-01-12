/**
 * State Manager - Centralized state management with observer pattern
 * @module services/state/StateManager
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Batched state updates to reduce re-renders
 * - Shallow comparison for change detection
 * - Lazy history snapshots
 */

import { AppState, StateEvent, IStateManager, DeepPartial } from '../../types';

export class StateManager implements IStateManager {
  private state: AppState;
  private listeners: Set<(state: AppState) => void> = new Set();
  private history: AppState[] = [];
  private maxHistorySize = 20;
  private pendingNotify = false;

  constructor(initialState: AppState) {
    this.state = { ...initialState };
  }

  /**
   * Get current application state
   */
  getState(): AppState {
    return { ...this.state };
  }

  /**
   * Update state with partial changes
   * Uses batched notifications to reduce excessive re-renders
   */
  setState(updates: DeepPartial<AppState>): void {
    const prevState = { ...this.state };
    this.state = this.deepMerge(this.state, updates);

    // Add to history for undo functionality
    this.history.push(prevState);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }

    // Batch notifications using microtask queue
    this.scheduleNotify();
  }

  /**
   * Schedule notification to batch multiple state updates
   */
  private scheduleNotify(): void {
    if (!this.pendingNotify) {
      this.pendingNotify = true;
      queueMicrotask(() => {
        this.pendingNotify = false;
        this.notify();
      });
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.add(listener);
    // Call listener immediately with current state
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  /**
   * Dispatch state events
   */
  dispatch(event: StateEvent): void {
    switch (event.type) {
      case 'MODEL_CHANGED':
        this.setState({ currentModel: event.payload });
        break;
      case 'PATTERN_CHANGED':
        this.setState({ currentPattern: event.payload });
        break;
      case 'THINKING_STARTED':
        this.setState({ isThinking: true });
        break;
      case 'THINKING_FINISHED':
        this.setState({
          isThinking: false,
          responseHistory: [...this.state.responseHistory, event.payload],
          currentResponseIndex: this.state.responseHistory.length
        });
        break;
      case 'UI_TOGGLED':
        const uiKey = event.payload;
        this.setState({
          ui: {
            ...this.state.ui,
            [uiKey]: !this.state.ui[uiKey]
          }
        });
        break;
    }
  }

  /**
   * Undo last state change
   */
  undo(): void {
    if (this.history.length > 0) {
      this.state = this.history.pop()!;
      this.notify();
    }
  }

  /**
   * Deep merge objects
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: DeepPartial<T>): T {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = target[key];

        // Handle Maps and Sets directly (don't try to merge them)
        if (sourceValue instanceof Map || sourceValue instanceof Set) {
          result[key] = sourceValue as T[Extract<keyof T, string>];
        } else if (this.isObject(sourceValue) && this.isObject(targetValue)) {
          result[key] = this.deepMerge(targetValue, sourceValue);
        } else if (sourceValue !== undefined) {
          result[key] = sourceValue as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }

  /**
   * Check if value is a plain object
   */
  private isObject(value: any): value is Record<string, any> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /**
   * Notify all listeners of state change
   */
  private notify(): void {
    const currentState = this.getState();
    this.listeners.forEach(listener => {
      try {
        listener(currentState);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  /**
   * Reset state to initial values
   */
  reset(): void {
    // Keep API config but reset everything else
    this.state = {
      ...this.state,
      currentModel: 'claude',
      currentPattern: 'hierarchical',
      currentResearchMode: 'conceptual',
      isThinking: false,
      responseHistory: [],
      currentResponseIndex: 0,
      knowledgeGraph: {
        nodes: [],
        connections: [],
        nodeMap: new Map(),
        disabledNodes: new Set(),
        branchStates: new Map(),
        matrices: new Map()
      },
      ui: {
        sidebarOpen: true,
        fullscreen: false,
        theme: 'dark'
      }
    };
    this.history = [];
    this.notify();
  }

  /**
   * Get state as JSON for serialization
   */
  toJSON(): string {
    return JSON.stringify(this.getState(), (_key, value) => {
      // Handle Maps and Sets
      if (value instanceof Map) {
        return { __type: 'Map', value: Array.from(value.entries()) };
      }
      if (value instanceof Set) {
        return { __type: 'Set', value: Array.from(value.entries()) };
      }
      return value;
    });
  }

  /**
   * Load state from JSON
   */
  fromJSON(json: string): void {
    try {
      const parsed = JSON.parse(json, (_key, value) => {
        // Restore Maps and Sets
        if (value && value.__type === 'Map') {
          return new Map(value.value);
        }
        if (value && value.__type === 'Set') {
          return new Set(value.value);
        }
        return value;
      });

      this.state = parsed;
      this.notify();
    } catch (error) {
      console.error('Failed to load state from JSON:', error);
    }
  }
}