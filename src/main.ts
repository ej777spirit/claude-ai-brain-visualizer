/**
 * Main entry point for AI Brain Visualizer Pro
 * @module main
 */

import './styles/main.css';
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
    // Create the UI structure
    createUI();

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

/**
 * Create the UI structure
 */
function createUI(): void {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <!-- Skip to main content (Accessibility) -->
    <a href="#main-content" class="skip-link">Skip to main content</a>

    <!-- Screen reader announcements -->
    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true" id="sr-announcer"></div>

    <div class="container">
      <!-- Left Panel -->
      <div class="left-panel">
        <div class="header">
          <h1>AI Brain Visualizer Pro</h1>
          <p>Claude Integration Edition</p>
          <div class="api-status">
            <div class="api-status-dot" id="apiStatusDot"></div>
            <span id="apiStatusText">Demo Mode</span>
          </div>
          <div class="model-selector">
            <button class="model-btn active" data-model="claude">Claude</button>
            <button class="model-btn" data-model="gemini">Gemini</button>
            <button class="model-btn" data-model="gpt">GPT-4</button>
            <button class="model-btn" data-model="kimi">Kimi K2.5</button>
          </div>
        </div>
        <div class="chat-container" id="chatContainer">
          <div class="message ai-message">
            Welcome to AI Brain Visualizer Pro - Claude Integration Edition!
            This advanced tool visualizes AI thought processes in real-time with mathematical analysis.
          </div>
          <div class="message system-message">
            Demo mode active - Using simulated AI responses
          </div>
        </div>
        <div class="input-section">
          <div class="input-area">
            <input type="text" id="userInput" placeholder="Ask anything..." aria-label="Enter your question">
            <button id="sendButton" aria-label="Send question">Analyze</button>
          </div>
          <div class="controls-section">
            <button class="control-btn" id="saveBtn" disabled>💾 Save</button>
            <button class="control-btn" id="loadBtn">📁 Load</button>
            <button class="control-btn" id="exportBtn" disabled>📊 Export</button>
            <button class="control-btn" id="resetBtn">🔄 Reset</button>
          </div>
        </div>
      </div>

      <!-- Middle Panel -->
      <div class="middle-panel" id="main-content">
        <canvas id="brain-canvas" tabindex="0" aria-label="3D thought visualization"></canvas>

        <!-- Visualization pattern selector -->
        <div class="pattern-selector" role="group" aria-label="Visualization pattern">
          <button class="pattern-btn active" data-pattern="hierarchical">Hierarchy</button>
          <button class="pattern-btn" data-pattern="network">Network</button>
          <button class="pattern-btn" data-pattern="timeline">Timeline</button>
          <button class="pattern-btn" data-pattern="matrix">Matrix</button>
        </div>

        <!-- Performance Stats -->
        <div class="perf-stats" id="perfStats">
          FPS: <span id="fps">60</span> |
          Nodes: <span id="nodeCount">0</span> |
          Memory: <span id="memUsage">0</span>MB
        </div>

        <!-- Loading overlay -->
        <div class="loading-overlay" id="loadingOverlay">
          <div class="loading-content">
            <div class="loading-spinner"></div>
            <div>Initializing visualization...</div>
          </div>
        </div>

        <!-- Status indicator -->
        <div class="status-indicator">
          <div class="status-dot ready" id="statusDot"></div>
          <span id="statusText">Ready to analyze</span>
        </div>
      </div>

      <!-- Right Panel -->
      <div class="right-panel">
        <h2>💭 Analysis Results</h2>
        <div class="response-content" id="responseContent">
          <p class="response-placeholder">
            Enter a question to see the AI's thought process visualized in 3D.
            The visualization shows how AI models process and connect concepts.
          </p>
        </div>

        <div class="analysis-stats">
          <div class="stat-item">
            <div class="stat-value" id="totalNodes">0</div>
            <div class="stat-label">Total Thoughts</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="avgWeight">0%</div>
            <div class="stat-label">Avg Weight</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="maxDepth">0</div>
            <div class="stat-label">Max Depth</div>
          </div>
          <div class="stat-item">
            <div class="stat-value" id="activeNodes">0</div>
            <div class="stat-label">Active Nodes</div>
          </div>
        </div>

        <div style="margin-top: 1rem;">
          <div style="font-size: 0.9rem; color: var(--text-medium); margin-bottom: 0.5rem;">
            Thought Categories:
          </div>
          <div id="categoryBreakdown" style="font-size: 0.8rem; color: var(--text-light);">
            Analysis: 0 • Synthesis: 0 • Recall: 0 • Evaluation: 0
          </div>
        </div>

        <div class="metrics-section">
          <h3>📐 Graph Metrics</h3>
          <div class="metrics-content" id="metricsContent">
            Run an analysis to compute graph metrics.
          </div>
        </div>

        <div class="metrics-section">
          <h3>🔍 Selected Thought</h3>
          <div class="node-details" id="nodeDetails">
            Click a node in the 3D view to inspect it.
          </div>
        </div>
      </div>
    </div>
  `;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
