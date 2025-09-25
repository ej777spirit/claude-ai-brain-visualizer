/**
 * Main entry point for AI Brain Visualizer Pro
 * @module main
 */

import { StateManager } from './services/state/StateManager';
import { APIClient } from './services/api/APIClient';
import { VisualizationManager } from './visualization/VisualizationManager';
import { UIController } from './ui/UIController';
import { AccessibilityManager } from './utils/Accessibility';
import { AppState, AIModel } from './types';

// Initialize application
async function initializeApp(): Promise<void> {
  console.log('🚀 AI Brain Visualizer Pro - Initializing...');

  try {
    // Initial state
    const initialState: AppState = {
      scene: null,
      camera: null,
      renderer: null,
      currentModel: 'claude' as AIModel,
      currentPattern: 'hierarchical',
      currentResearchMode: 'conceptual',
      isThinking: false,
      responseHistory: [],
      currentResponseIndex: 0,
      apiConfig: {
        provider: 'anthropic',
        apiKey: '',
        configured: false,
        researchMode: 'conceptual',
        rateLimit: {
          requests: 100,
          windowMs: 900000
        }
      },
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

    // Initialize modules
    const stateManager = new StateManager(initialState);
    const apiClient = new APIClient('/api');
    const visualizationManager = new VisualizationManager('brain-canvas');
    const uiController = new UIController(stateManager, apiClient, visualizationManager);
    const accessibilityManager = new AccessibilityManager();

    // Setup accessibility
    accessibilityManager.announce('Application initialized and ready');

    // Initialize visualization
    visualizationManager.initialize();

    // Start application
    uiController.initialize();

    console.log('✅ AI Brain Visualizer Pro - Ready');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
