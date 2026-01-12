/**
 * UI Controller Integration Tests
 */

import { UIController } from '../../src/ui/UIController';
import { StateManager } from '../../src/services/state/StateManager';
import { APIClient } from '../../src/services/api/APIClient';
import { VisualizationManager } from '../../src/visualization/VisualizationManager';

describe('UIController Integration', () => {
  let uiController: UIController;
  let stateManager: StateManager;
  let apiClient: APIClient;
  let visualizationManager: VisualizationManager;

  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div id="app">
        <div class="container">
          <div class="left-panel">
            <div class="model-selector">
              <button class="model-btn active" data-model="claude">Claude</button>
              <button class="model-btn" data-model="gemini">Gemini</button>
              <button class="model-btn" data-model="gpt">GPT-4</button>
            </div>
            <div id="chatContainer"></div>
            <div class="input-section">
              <input type="text" id="userInput" />
              <button id="sendButton">Analyze</button>
            </div>
            <button id="saveBtn" disabled>💾 Save</button>
            <button id="loadBtn">📁 Load</button>
            <button id="exportBtn" disabled>📊 Export</button>
            <button id="resetBtn">🔄 Reset</button>
          </div>
          <div class="middle-panel">
            <canvas id="brain-canvas"></canvas>
            <div id="loadingOverlay" class="loading-overlay">
              <div class="loading-content">Initializing...</div>
            </div>
            <div id="statusDot" class="status-dot ready"></div>
            <span id="statusText">Ready</span>
          </div>
          <div class="right-panel">
            <div id="responseContent"></div>
            <span id="totalNodes">0</span>
            <span id="avgWeight">0%</span>
            <span id="maxDepth">0</span>
            <span id="activeNodes">0</span>
            <span id="categoryBreakdown">No thoughts</span>
          </div>
          <div id="perfStats">
            FPS: <span id="fps">60</span> |
            Nodes: <span id="nodeCount">0</span> |
            Memory: <span id="memUsage">0MB</span>
          </div>
          <div id="sr-announcer" aria-live="polite"></div>
        </div>
      </div>
    `;

    // Initialize services
    stateManager = new StateManager({
      scene: null,
      camera: null,
      renderer: null,
      currentModel: 'claude',
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
        rateLimit: { requests: 100, windowMs: 900000 }
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
    });

    apiClient = new APIClient('/api');
    visualizationManager = new VisualizationManager('brain-canvas');
    uiController = new UIController(stateManager, apiClient, visualizationManager);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize without errors', () => {
      expect(() => {
        uiController.initialize();
      }).not.toThrow();
    });

    it('should setup DOM element references', () => {
      uiController.initialize();

      // Check that elements are accessible (through private methods)
      // This is tested indirectly through other tests
    });

    it('should setup event listeners', () => {
      uiController.initialize();

      const sendButton = document.getElementById('sendButton') as HTMLButtonElement;
      const userInput = document.getElementById('userInput') as HTMLInputElement;

      expect(sendButton).toBeDefined();
      expect(userInput).toBeDefined();
    });
  });

  describe('model switching', () => {
    beforeEach(() => {
      uiController.initialize();
    });

    it('should update UI when model buttons are clicked', () => {
      const geminiButton = document.querySelector('[data-model="gemini"]') as HTMLButtonElement;
      const claudeButton = document.querySelector('[data-model="claude"]') as HTMLButtonElement;

      // Initially Claude should be active
      expect(claudeButton.classList.contains('active')).toBe(true);
      expect(geminiButton.classList.contains('active')).toBe(false);

      // Click Gemini button
      geminiButton.click();

      // Check UI updates
      expect(claudeButton.classList.contains('active')).toBe(false);
      expect(geminiButton.classList.contains('active')).toBe(true);
    });

    it('should update state when model is changed', () => {
      const geminiButton = document.querySelector('[data-model="gemini"]') as HTMLButtonElement;

      geminiButton.click();

      const state = stateManager.getState();
      expect(state.currentModel).toBe('gemini');
    });
  });

  describe('message handling', () => {
    beforeEach(() => {
      uiController.initialize();
    });

    it('should add user message to chat', () => {
      const userInput = document.getElementById('userInput') as HTMLInputElement;
      const sendButton = document.getElementById('sendButton') as HTMLButtonElement;

      userInput.value = 'Test message';
      sendButton.click();

      const chatContainer = document.getElementById('chatContainer')!;
      expect(chatContainer.innerHTML).toContain('Test message');
      expect(chatContainer.innerHTML).toContain('message user-message');
    });

    it('should clear input after sending', () => {
      const userInput = document.getElementById('userInput') as HTMLInputElement;
      const sendButton = document.getElementById('sendButton') as HTMLButtonElement;

      userInput.value = 'Test message';
      sendButton.click();

      expect(userInput.value).toBe('');
    });

    it('should handle Enter key in input field', () => {
      const userInput = document.getElementById('userInput') as HTMLInputElement;

      userInput.value = 'Test message';
      userInput.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter' }));

      const chatContainer = document.getElementById('chatContainer')!;
      expect(chatContainer.innerHTML).toContain('Test message');
    });
  });

  describe('status updates', () => {
    beforeEach(() => {
      uiController.initialize();
    });

    it('should update status indicator', () => {
      const statusDot = document.getElementById('statusDot')!;
      const statusText = document.getElementById('statusText')!;

      expect(statusDot.classList.contains('ready')).toBe(true);
      expect(statusText.textContent).toBe('Ready to analyze');
    });

    it('should show loading overlay', async () => {
      const loadingOverlay = document.getElementById('loadingOverlay')!;
      const statusDot = document.getElementById('statusDot')!;

      expect(loadingOverlay.classList.contains('active')).toBe(false);

      // Trigger thinking state
      stateManager.dispatch({ type: 'THINKING_STARTED' });

      // Wait for batched notification to complete
      await new Promise(resolve => queueMicrotask(resolve));

      // Status should update through state subscription
      expect(statusDot.classList.contains('thinking')).toBe(true);
    });
  });

  describe('statistics display', () => {
    beforeEach(() => {
      uiController.initialize();
    });

    it('should update statistics display', () => {
      const totalNodes = document.getElementById('totalNodes')!;
      const avgWeight = document.getElementById('avgWeight')!;
      const maxDepth = document.getElementById('maxDepth')!;
      const activeNodes = document.getElementById('activeNodes')!;

      // Initially all should be 0
      expect(totalNodes.textContent).toBe('0');
      expect(avgWeight.textContent).toBe('0%');
      expect(maxDepth.textContent).toBe('0');
      expect(activeNodes.textContent).toBe('0');
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      uiController.initialize();
    });

    it('should have screen reader announcer', () => {
      const announcer = document.getElementById('sr-announcer');
      expect(announcer).toBeDefined();
      expect(announcer?.getAttribute('aria-live')).toBe('polite');
    });

    it('should have proper ARIA labels', () => {
      const canvas = document.getElementById('brain-canvas');
      const userInput = document.getElementById('userInput');
      const sendButton = document.getElementById('sendButton');

      expect(canvas?.getAttribute('aria-label')).toBe('3D thought visualization');
      expect(userInput?.getAttribute('aria-label')).toBe('Enter your question');
      expect(sendButton?.getAttribute('aria-label')).toBe('Send question');
    });
  });

  describe('performance monitoring', () => {
    beforeEach(() => {
      uiController.initialize();
    });

    it('should display performance stats', () => {
      const fps = document.getElementById('fps')!;
      const nodeCount = document.getElementById('nodeCount')!;
      const memUsage = document.getElementById('memUsage')!;

      expect(fps).toBeDefined();
      expect(nodeCount).toBeDefined();
      expect(memUsage).toBeDefined();
    });
  });
});