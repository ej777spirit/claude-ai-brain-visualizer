/**
 * Core type definitions for AI Brain Visualizer Pro
 * @module types
 */

import * as THREE from 'three';

// Type aliases for THREE.js classes (using any for now to avoid type issues)
export type Vector3 = any;
export type Scene = any;
export type PerspectiveCamera = any;
export type WebGLRenderer = any;

// Thought categories for visualization
export type ThoughtCategory = 'analysis' | 'synthesis' | 'recall' | 'evaluation';

// AI model providers
export type AIModel = 'claude' | 'gemini' | 'gpt' | 'kimi';

// API providers
export type APIProvider = 'anthropic' | 'google' | 'openai' | 'moonshot';

// Research modes for different analysis types
export type ResearchMode = 'conceptual' | 'mathematical' | 'logical' | 'creative';

// Visualization patterns
export type VisualizationPattern = 'hierarchical' | 'network' | 'timeline' | 'matrix';

// Thought node structure
export interface ThoughtNode {
  id: number;
  parent?: number;
  text: string;
  category: ThoughtCategory;
  weight: number;
  position: THREE.Vector3;
  connections: number[];
  metadata: {
    depth: number;
    branchId: string;
    timestamp: number;
    confidence: number;
  };
}

// Connection between thought nodes
export interface ThoughtConnection {
  id: string;
  sourceId: number;
  targetId: number;
  strength: number;
  type: 'parent-child' | 'related' | 'contradiction';
}

// API response structure
export interface APIResponse {
  response: string;
  thoughts: ThoughtNode[];
  model: string;
  confidence: number;
  metadata: {
    processingTime: number;
    tokensUsed: number;
    modelVersion: string;
    isSimulated?: boolean;
  };
}

// Knowledge graph structure
export interface KnowledgeGraph {
  nodes: ThoughtNode[];
  connections: ThoughtConnection[];
  nodeMap: Map<number, ThoughtNode>;
  disabledNodes: Set<number>;
  branchStates: Map<string, boolean>;
  matrices: Map<string, any>;
}

// API configuration
export interface APIConfig {
  provider: APIProvider;
  apiKey: string;
  configured: boolean;
  researchMode: ResearchMode;
  rateLimit: {
    requests: number;
    windowMs: number;
  };
}

// Application state
export interface AppState {
  // Three.js scene objects
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;

  // Current settings
  currentModel: AIModel;
  currentPattern: VisualizationPattern;
  currentResearchMode: ResearchMode;

  // Processing state
  isThinking: boolean;
  responseHistory: APIResponse[];
  currentResponseIndex: number;

  // Configuration
  apiConfig: APIConfig;

  // Data
  knowledgeGraph: KnowledgeGraph;

  // UI state
  ui: {
    sidebarOpen: boolean;
    fullscreen: boolean;
    theme: 'dark' | 'light';
  };
}

// Event types for state management
export type StateEvent =
  | { type: 'MODEL_CHANGED'; payload: AIModel }
  | { type: 'PATTERN_CHANGED'; payload: VisualizationPattern }
  | { type: 'THINKING_STARTED' }
  | { type: 'THINKING_FINISHED'; payload: APIResponse }
  | { type: 'NODE_ADDED'; payload: ThoughtNode }
  | { type: 'CONNECTION_ADDED'; payload: ThoughtConnection }
  | { type: 'UI_TOGGLED'; payload: keyof AppState['ui'] };

// Service interfaces
export interface IStateManager {
  getState(): AppState;
  setState(updates: Partial<AppState>): void;
  subscribe(listener: (state: AppState) => void): () => void;
  dispatch(event: StateEvent): void;
}

export interface IAPIClient {
  generateResponse(prompt: string, model: AIModel): Promise<APIResponse>;
  testConnection(): Promise<boolean>;
  getModels(): Promise<string[]>;
}

export interface IVisualizationManager {
  initialize(canvas: HTMLCanvasElement): void;
  createVisualization(thoughts: ThoughtNode[]): void;
  updateNode(nodeId: number, updates: Partial<ThoughtNode>): void;
  clearScene(): void;
  dispose(): void;
}

export interface IUIController {
  initialize(): void;
  updateStats(thoughts: ThoughtNode[]): void;
  showLoading(show: boolean): void;
  updateStatus(message: string, type: 'ready' | 'thinking' | 'error'): void;
}

export interface IStorageManager {
  saveSession(session: AppState): Promise<void>;
  loadSession(): Promise<AppState | null>;
  exportData(): Promise<string>;
  clearData(): Promise<void>;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Vector3Tuple = [number, number, number];

// Configuration constants
export const CONFIG = {
  THOUGHT_CATEGORIES: {
    analysis: { color: 0x64ffda, name: 'Analysis' },
    synthesis: { color: 0xf5a742, name: 'Synthesis' },
    recall: { color: 0xa78bfa, name: 'Recall' },
    evaluation: { color: 0xfb7185, name: 'Evaluation' }
  },
  MODELS: {
    claude: { name: 'Claude 3', provider: 'anthropic' as APIProvider },
    gemini: { name: 'Gemini Pro', provider: 'google' as APIProvider },
    gpt: { name: 'GPT-4', provider: 'openai' as APIProvider },
    kimi: { name: 'Kimi K2.5', provider: 'moonshot' as APIProvider }
  },
  VISUALIZATION: {
    nodeSize: { min: 0.5, max: 2.0 },
    connectionOpacity: 0.6,
    animationDuration: 1000,
    cameraDistance: 50
  }
} as const;