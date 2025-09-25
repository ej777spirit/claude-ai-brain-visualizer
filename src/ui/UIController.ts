/**
 * UI Controller - Manages user interface interactions and DOM manipulation
 * @module ui/UIController
 */

import { IUIController, AppState, AIModel } from '../types';
import { StateManager } from '../services/state/StateManager';
import { APIClient } from '../services/api/APIClient';
import { VisualizationManager } from '../visualization/VisualizationManager';

export class UIController implements IUIController {
  private stateManager: StateManager;
  private apiClient: APIClient;
  private visualizationManager: VisualizationManager;

  // DOM elements
  private elements = {
    // Model selection
    modelButtons: document.querySelectorAll('.model-btn') as NodeListOf<HTMLButtonElement>,

    // Chat interface
    chatContainer: document.getElementById('chatContainer') as HTMLDivElement,
    userInput: document.getElementById('userInput') as HTMLInputElement,
    sendButton: document.getElementById('sendButton') as HTMLButtonElement,

    // Control buttons
    saveBtn: document.getElementById('saveBtn') as HTMLButtonElement,
    loadBtn: document.getElementById('loadBtn') as HTMLButtonElement,
    exportBtn: document.getElementById('exportBtn') as HTMLButtonElement,
    resetBtn: document.getElementById('resetBtn') as HTMLButtonElement,

    // Response display
    responseContent: document.getElementById('responseContent') as HTMLDivElement,

    // Stats display
    totalNodes: document.getElementById('totalNodes') as HTMLSpanElement,
    avgWeight: document.getElementById('avgWeight') as HTMLSpanElement,
    maxDepth: document.getElementById('maxDepth') as HTMLSpanElement,
    activeNodes: document.getElementById('activeNodes') as HTMLSpanElement,
    categoryBreakdown: document.getElementById('categoryBreakdown') as HTMLSpanElement,

    // Status indicators
    statusDot: document.getElementById('statusDot') as HTMLDivElement,
    statusText: document.getElementById('statusText') as HTMLSpanElement,
    apiStatusDot: document.getElementById('apiStatusDot') as HTMLDivElement,

    // Performance stats
    fps: document.getElementById('fps') as HTMLSpanElement,
    nodeCount: document.getElementById('nodeCount') as HTMLSpanElement,
    memUsage: document.getElementById('memUsage') as HTMLSpanElement,

    // Loading overlay
    loadingOverlay: document.getElementById('loadingOverlay') as HTMLDivElement,

    // Screen reader announcer
    srAnnouncer: document.getElementById('sr-announcer') as HTMLDivElement
  };

  private performanceMonitor: {
    frameCount: number;
    lastTime: number;
    fps: number;
  } = {
    frameCount: 0,
    lastTime: performance.now(),
    fps: 60
  };

  constructor(
    stateManager: StateManager,
    apiClient: APIClient,
    visualizationManager: VisualizationManager
  ) {
    this.stateManager = stateManager;
    this.apiClient = apiClient;
    this.visualizationManager = visualizationManager;
  }

  /**
   * Initialize the UI controller
   */
  initialize(): void {
    this.setupEventListeners();
    this.setupStateSubscriptions();
    this.startPerformanceMonitoring();
    this.initializeAccessibility();

    // Initial UI state
    this.updateStatus('Ready to analyze', 'ready');
    this.updateStats([]);
    this.showLoading(false);

    console.log('UI Controller initialized');
  }

  /**
   * Setup DOM event listeners
   */
  private setupEventListeners(): void {
    // Model selection
    this.elements.modelButtons.forEach(btn => {
      btn.addEventListener('click', () => this.handleModelChange(btn));
    });

    // Input handling
    this.elements.sendButton.addEventListener('click', () => this.handleSendMessage());
    this.elements.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.handleSendMessage();
    });

    // Control buttons
    this.elements.resetBtn.addEventListener('click', () => this.handleReset());
    this.elements.saveBtn.addEventListener('click', () => this.handleSave());
    this.elements.loadBtn.addEventListener('click', () => this.handleLoad());
    this.elements.exportBtn.addEventListener('click', () => this.handleExport());
  }

  /**
   * Setup state manager subscriptions
   */
  private setupStateSubscriptions(): void {
    this.stateManager.subscribe((state) => {
      this.updateUIFromState(state);
    });
  }

  /**
   * Handle model selection change
   */
  private handleModelChange(button: HTMLButtonElement): void {
    const model = button.dataset.model as AIModel;
    if (!model) return;

    // Update UI
    this.elements.modelButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update state
    this.stateManager.dispatch({ type: 'MODEL_CHANGED', payload: model });

    // Add system message
    this.addMessage(`Switched to ${model.toUpperCase()}`, 'system');
  }

  /**
   * Handle sending a message
   */
  private async handleSendMessage(): Promise<void> {
    const input = this.elements.userInput;
    const message = input.value.trim();

    if (!message || this.stateManager.getState().isThinking) return;

    // Clear input and disable send button
    input.value = '';
    this.elements.sendButton.disabled = true;

    // Add user message
    this.addMessage(message, 'user');

    // Start thinking
    this.stateManager.dispatch({ type: 'THINKING_STARTED' });

    try {
      // Get AI response
      const state = this.stateManager.getState();
      const response = await this.apiClient.generateResponse(message, state.currentModel);

      // Update visualization
      this.visualizationManager.createVisualization(response.thoughts);

      // Update response display
      this.updateResponseDisplay(response);

      // Finish thinking
      this.stateManager.dispatch({ type: 'THINKING_FINISHED', payload: response });

      // Enable controls
      this.elements.saveBtn.disabled = false;
      this.elements.exportBtn.disabled = false;

    } catch (error) {
      console.error('Error processing message:', error);
      this.addMessage('Error processing request. Please try again.', 'system');
    } finally {
      this.stateManager.setState({ isThinking: false });
      this.elements.sendButton.disabled = false;
    }
  }

  /**
   * Handle reset button
   */
  private handleReset(): void {
    this.visualizationManager.clearScene();
    this.resetResponseDisplay();
    this.updateStats([]);
    this.stateManager.reset();

    this.elements.saveBtn.disabled = true;
    this.elements.exportBtn.disabled = true;

    this.addMessage('Visualization reset', 'system');
  }

  /**
   * Handle save button
   */
  private handleSave(): void {
    const state = this.stateManager.getState();
    const session = {
      timestamp: Date.now(),
      model: state.currentModel,
      thoughts: state.knowledgeGraph.nodes,
      response: state.responseHistory[state.currentResponseIndex]
    };

    try {
      localStorage.setItem('ai_visualizer_session', JSON.stringify(session));
      this.addMessage('Session saved', 'system');
    } catch (error) {
      console.error('Failed to save session:', error);
      this.addMessage('Failed to save session', 'system');
    }
  }

  /**
   * Handle load button
   */
  private handleLoad(): void {
    try {
      const saved = localStorage.getItem('ai_visualizer_session');
      if (saved) {
        const session = JSON.parse(saved);

        // Load thoughts into visualization
        if (session.thoughts) {
          this.visualizationManager.createVisualization(session.thoughts);
          this.updateStats(session.thoughts);
        }

        this.addMessage('Session loaded', 'system');
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      this.addMessage('Failed to load session', 'system');
    }
  }

  /**
   * Handle export button
   */
  private handleExport(): void {
    const state = this.stateManager.getState();
    const data = {
      timestamp: new Date().toISOString(),
      model: state.currentModel,
      thoughts: state.knowledgeGraph.nodes,
      response: state.responseHistory[state.currentResponseIndex]
    };

    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-visualization-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      this.addMessage('Data exported', 'system');
    } catch (error) {
      console.error('Failed to export data:', error);
      this.addMessage('Failed to export data', 'system');
    }
  }

  /**
   * Add message to chat
   */
  private addMessage(text: string, type: 'user' | 'ai' | 'system'): void {
    const container = this.elements.chatContainer;
    const message = document.createElement('div');
    message.className = `message ${type}-message`;
    message.textContent = text;
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;

    // Announce to screen readers
    this.announceToScreenReader(`${type} message: ${text}`);
  }

  /**
   * Update response display
   */
  private updateResponseDisplay(response: any): void {
    const content = this.elements.responseContent;
    content.innerHTML = `
      <div style="margin-bottom: 10px; color: var(--primary-accent); font-weight: 600;">
        ${response.model} Analysis (${response.confidence}% confidence)
      </div>
      <div>${response.response}</div>
    `;
  }

  /**
   * Reset response display
   */
  private resetResponseDisplay(): void {
    this.elements.responseContent.innerHTML = `
      <p class="response-placeholder">
        Enter a question to see the AI's thought process visualized in 3D.
        The visualization shows how AI models process and connect concepts.
      </p>
    `;
  }

  /**
   * Update statistics display
   */
  updateStats(thoughts: any[]): void {
    this.elements.totalNodes.textContent = thoughts.length.toString();
    this.elements.activeNodes.textContent = thoughts.length.toString();

    if (thoughts.length > 0) {
      const avgWeight = Math.round(thoughts.reduce((sum: number, t: any) => sum + t.weight, 0) / thoughts.length);
      this.elements.avgWeight.textContent = `${avgWeight}%`;
    } else {
      this.elements.avgWeight.textContent = '0%';
    }

    // Calculate max depth
    let maxDepth = 0;
    thoughts.forEach((t: any) => {
      let depth = 0;
      let current = t;
      while (current.parent) {
        depth++;
        current = thoughts.find((th: any) => th.id === current.parent);
        if (!current) break;
      }
      maxDepth = Math.max(maxDepth, depth);
    });
    this.elements.maxDepth.textContent = maxDepth.toString();

    // Category breakdown
    const categories: Record<string, number> = {};
    thoughts.forEach((t: any) => {
      categories[t.category] = (categories[t.category] || 0) + 1;
    });

    const breakdown = Object.entries(categories)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(' • ');
    this.elements.categoryBreakdown.textContent = breakdown || 'No thoughts';
  }

  /**
   * Update status indicator
   */
  updateStatus(text: string, status: 'ready' | 'thinking' | 'error'): void {
    this.elements.statusText.textContent = text;
    const dot = this.elements.statusDot;
    dot.className = `status-dot ${status}`;
  }

  /**
   * Show/hide loading overlay
   */
  showLoading(show: boolean): void {
    if (show) {
      this.elements.loadingOverlay.classList.add('active');
    } else {
      this.elements.loadingOverlay.classList.remove('active');
    }
  }

  /**
   * Update UI based on state changes
   */
  private updateUIFromState(state: AppState): void {
    // Update thinking status
    if (state.isThinking) {
      this.updateStatus('AI is thinking...', 'thinking');
      this.elements.sendButton.disabled = true;
    } else {
      this.updateStatus('Ready to analyze', 'ready');
      this.elements.sendButton.disabled = false;
    }

    // Update performance stats
    this.elements.nodeCount.textContent = state.knowledgeGraph.nodes.length.toString();
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    const updateMetrics = () => {
      this.performanceMonitor.frameCount++;
      const currentTime = performance.now();

      if (currentTime - this.performanceMonitor.lastTime >= 1000) {
        this.performanceMonitor.fps = Math.round(
          this.performanceMonitor.frameCount * 1000 / (currentTime - this.performanceMonitor.lastTime)
        );
        this.elements.fps.textContent = this.performanceMonitor.fps.toString();
        this.elements.memUsage.textContent = this.visualizationManager.getMemoryUsage().toFixed(1) + 'MB';

        this.performanceMonitor.frameCount = 0;
        this.performanceMonitor.lastTime = currentTime;
      }

      requestAnimationFrame(updateMetrics);
    };

    updateMetrics();
  }

  /**
   * Initialize accessibility features
   */
  private initializeAccessibility(): void {
    // Skip links are already in HTML
    // Screen reader announcements are handled via announceToScreenReader
  }

  /**
   * Announce message to screen readers
   */
  private announceToScreenReader(message: string): void {
    this.elements.srAnnouncer.textContent = message;
  }
}