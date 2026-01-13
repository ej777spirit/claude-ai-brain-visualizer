/**
 * UI Controller - Manages user interface interactions and DOM manipulation
 * @module ui/UIController
 * 
 * Features:
 * - Chain of Thought streaming visualization
 * - Real-time thought display
 * - Progressive response building
 */

import { IUIController, AppState, AIModel, ThoughtNode } from '../types';
import { StateManager } from '../services/state/StateManager';
import { APIClient } from '../services/api/APIClient';
import { VisualizationManager } from '../visualization/VisualizationManager';
import { ChainOfThought } from '../services/chain/ChainOfThought';

export class UIController implements IUIController {
  private stateManager: StateManager;
  private apiClient: APIClient;
  private visualizationManager: VisualizationManager;
  private chainOfThought: ChainOfThought;

  // DOM elements - will be initialized after DOM is ready
  private elements: {
    // Model selection
    modelButtons: NodeListOf<HTMLButtonElement>;
    // Chat interface
    chatContainer: HTMLDivElement;
    userInput: HTMLInputElement;
    sendButton: HTMLButtonElement;
    // Control buttons
    saveBtn: HTMLButtonElement;
    loadBtn: HTMLButtonElement;
    exportBtn: HTMLButtonElement;
    resetBtn: HTMLButtonElement;
    // Response display
    responseContent: HTMLDivElement;
    // Stats display
    totalNodes: HTMLSpanElement;
    avgWeight: HTMLSpanElement;
    maxDepth: HTMLSpanElement;
    activeNodes: HTMLSpanElement;
    categoryBreakdown: HTMLSpanElement;
    // Status indicators
    statusDot: HTMLDivElement;
    statusText: HTMLSpanElement;
    apiStatusDot: HTMLDivElement;
    apiStatusText: HTMLSpanElement;
    // Performance stats
    fps: HTMLSpanElement;
    nodeCount: HTMLSpanElement;
    memUsage: HTMLSpanElement;
    // Loading overlay
    loadingOverlay: HTMLDivElement;
    // Screen reader announcer
    srAnnouncer: HTMLDivElement;
  } | null = null;

  private performanceMonitor: {
    frameCount: number;
    lastTime: number;
    fps: number;
  } = {
    frameCount: 0,
    lastTime: performance.now(),
    fps: 60
  };

  // Track current thoughts for stats
  private currentThoughts: ThoughtNode[] = [];

  constructor(
    stateManager: StateManager,
    apiClient: APIClient,
    visualizationManager: VisualizationManager
  ) {
    this.stateManager = stateManager;
    this.apiClient = apiClient;
    this.visualizationManager = visualizationManager;
    this.chainOfThought = new ChainOfThought({
      thoughtDelay: 600,
      maxThoughts: 12,
      streaming: true,
    });
  }

  /**
   * Initialize DOM elements after DOM is ready
   */
  private initializeDOMElements(): void {
    this.elements = {
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
      apiStatusText: document.getElementById('apiStatusText') as HTMLSpanElement,
      // Performance stats
      fps: document.getElementById('fps') as HTMLSpanElement,
      nodeCount: document.getElementById('nodeCount') as HTMLSpanElement,
      memUsage: document.getElementById('memUsage') as HTMLSpanElement,
      // Loading overlay
      loadingOverlay: document.getElementById('loadingOverlay') as HTMLDivElement,
      // Screen reader announcer
      srAnnouncer: document.getElementById('sr-announcer') as HTMLDivElement
    };
  }

  /**
   * Safely access DOM elements
   */
  private getElements(): NonNullable<typeof this.elements> {
    if (!this.elements) {
      throw new Error('DOM elements not initialized. Call initialize() first.');
    }
    return this.elements;
  }

  /**
   * Initialize the UI controller
   */
  initialize(): void {
    this.initializeDOMElements();
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
    const elements = this.getElements();

    // Model selection
    elements.modelButtons.forEach(btn => {
      btn.addEventListener('click', () => this.handleModelChange(btn));
    });

    // Chat interface
    elements.sendButton.addEventListener('click', () => this.handleSendMessage());
    elements.userInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleSendMessage();
      }
    });

    // Control buttons
    elements.resetBtn.addEventListener('click', () => this.handleReset());
    elements.saveBtn.addEventListener('click', () => this.handleSave());
    elements.loadBtn.addEventListener('click', () => this.handleLoad());
    elements.exportBtn.addEventListener('click', () => this.handleExport());
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
    const elements = this.getElements();
    const model = button.dataset.model as AIModel;
    if (!model) return;

    // Update UI
    elements.modelButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // Update state
    this.stateManager.dispatch({ type: 'MODEL_CHANGED', payload: model });

    // Add system message
    this.addMessage(`Switched to ${model.toUpperCase()}`, 'system');
  }

  /**
   * Handle sending a message - Uses Chain of Thought streaming
   */
  private async handleSendMessage(): Promise<void> {
    const elements = this.getElements();
    const input = elements.userInput;
    const message = input.value.trim();

    if (!message || this.stateManager.getState().isThinking) return;

    // Clear input and disable send button
    input.value = '';
    elements.sendButton.disabled = true;

    // Add user message
    this.addMessage(message, 'user');

    // Start thinking
    this.stateManager.dispatch({ type: 'THINKING_STARTED' });
    this.updateStatus('Generating chain of thought...', 'thinking');

    // Clear previous visualization
    this.visualizationManager.clearScene();
    this.currentThoughts = [];

    // Update response display to show streaming state
    this.showStreamingResponse();

    try {
      const state = this.stateManager.getState();
      
      // Generate chain of thought with streaming visualization
      await this.chainOfThought.generateChain(message, state.currentModel, {
        onThoughtStart: () => {
          this.updateStatus('Starting thought chain...', 'thinking');
        },
        
        onThought: (thought: ThoughtNode) => {
          // Add thought to visualization
          this.visualizationManager.addThoughtToChain(thought);
          
          // Track thought
          this.currentThoughts.push(thought);
          
          // Update stats in real-time
          this.updateStats(this.currentThoughts);
          
          // Update streaming response
          this.appendThoughtToResponse(thought);
          
          // Update status
          this.updateStatus(`Thinking... (${this.currentThoughts.length} thoughts)`, 'thinking');
          
          // Announce to screen reader
          this.announceToScreenReader(`Thought ${thought.id}: ${thought.category}`);
        },
        
        onThoughtComplete: (allThoughts: ThoughtNode[]) => {
          // Generate final response
          this.showFinalResponse(message, state.currentModel, allThoughts);
          
          // Update state
          const response = {
            response: this.generateResponseText(message, state.currentModel),
            thoughts: allThoughts,
            model: `${state.currentModel.toUpperCase()} (Chain of Thought)`,
            confidence: this.calculateConfidence(allThoughts),
            metadata: {
              processingTime: allThoughts.length * 600,
              tokensUsed: allThoughts.length * 50,
              modelVersion: 'chain-of-thought-v1',
              isSimulated: true,
            },
          };
          
          this.stateManager.dispatch({ type: 'THINKING_FINISHED', payload: response });
          
          // Enable controls
          elements.saveBtn.disabled = false;
          elements.exportBtn.disabled = false;
          
          this.updateStatus(`Complete - ${allThoughts.length} thoughts`, 'ready');
        },
        
        onError: (error: Error) => {
          console.error('Chain of thought error:', error);
          this.addMessage('Error generating thoughts. Please try again.', 'system');
          this.updateStatus('Error occurred', 'error');
        },
      });

    } catch (error) {
      console.error('Error processing message:', error);
      this.addMessage('Error processing request. Please try again.', 'system');
      this.updateStatus('Error occurred', 'error');
    } finally {
      this.stateManager.setState({ isThinking: false });
      elements.sendButton.disabled = false;
    }
  }

  /**
   * Show streaming response placeholder
   */
  private showStreamingResponse(): void {
    const elements = this.getElements();
    elements.responseContent.innerHTML = `
      <div class="streaming-response">
        <div class="streaming-header">
          <span class="streaming-indicator"></span>
          <span>Generating chain of thought...</span>
        </div>
        <div class="thought-stream" id="thoughtStream"></div>
      </div>
      <style>
        .streaming-response { padding: 1rem; }
        .streaming-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary-accent);
          margin-bottom: 1rem;
          font-weight: 600;
        }
        .streaming-indicator {
          width: 8px;
          height: 8px;
          background: var(--primary-accent);
          border-radius: 50%;
          animation: pulse 1s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .thought-stream {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 300px;
          overflow-y: auto;
        }
        .thought-item {
          padding: 8px 12px;
          background: var(--bg-dark);
          border-radius: 6px;
          border-left: 3px solid var(--primary-accent);
          font-size: 0.85rem;
          animation: slideIn 0.3s ease-out;
        }
        .thought-item.analysis { border-left-color: #64ffda; }
        .thought-item.synthesis { border-left-color: #f5a742; }
        .thought-item.recall { border-left-color: #a78bfa; }
        .thought-item.evaluation { border-left-color: #fb7185; }
        .thought-item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 0.75rem;
          color: var(--text-medium);
        }
        .thought-item-text {
          color: var(--text-light);
          line-height: 1.4;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      </style>
    `;
  }

  /**
   * Append a thought to the streaming response
   */
  private appendThoughtToResponse(thought: ThoughtNode): void {
    const stream = document.getElementById('thoughtStream');
    if (!stream) return;

    const item = document.createElement('div');
    item.className = `thought-item ${thought.category}`;
    item.innerHTML = `
      <div class="thought-item-header">
        <span>#${thought.id} · ${thought.category}</span>
        <span>${thought.weight}% weight</span>
      </div>
      <div class="thought-item-text">${thought.text}</div>
    `;
    
    stream.appendChild(item);
    stream.scrollTop = stream.scrollHeight;
  }

  /**
   * Show final response after chain completes
   */
  private showFinalResponse(prompt: string, model: AIModel, thoughts: ThoughtNode[]): void {
    const elements = this.getElements();
    const confidence = this.calculateConfidence(thoughts);
    
    elements.responseContent.innerHTML = `
      <div class="final-response">
        <div class="response-header">
          <span class="model-badge">${model.toUpperCase()}</span>
          <span class="confidence-badge">${confidence}% confidence</span>
        </div>
        
        <div class="response-summary">
          <h4>🧠 Chain of Thought Analysis</h4>
          <p>Analyzed "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}" through ${thoughts.length} reasoning steps.</p>
        </div>
        
        <div class="thought-chain-summary">
          <h4>💭 Thought Chain</h4>
          <div class="chain-visualization">
            ${thoughts.map((t, i) => `
              <div class="chain-step ${t.category}">
                <div class="chain-number">${i + 1}</div>
                <div class="chain-content">
                  <div class="chain-category">${t.category}</div>
                  <div class="chain-text">${t.text}</div>
                </div>
              </div>
            `).join('<div class="chain-connector">→</div>')}
          </div>
        </div>
        
        <div class="response-conclusion">
          <h4>📊 Conclusion</h4>
          <p>${this.generateResponseText(prompt, model)}</p>
        </div>
      </div>
      
      <style>
        .final-response { padding: 1rem; }
        .response-header {
          display: flex;
          gap: 8px;
          margin-bottom: 1rem;
        }
        .model-badge {
          background: var(--primary-accent);
          color: var(--bg-dark);
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: bold;
        }
        .confidence-badge {
          background: var(--bg-light);
          color: var(--text-light);
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
        }
        .response-summary, .thought-chain-summary, .response-conclusion {
          margin-bottom: 1rem;
          padding: 1rem;
          background: var(--bg-dark);
          border-radius: 8px;
        }
        .response-summary h4, .thought-chain-summary h4, .response-conclusion h4 {
          color: var(--primary-accent);
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
        }
        .chain-visualization {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 4px;
          margin-top: 0.5rem;
        }
        .chain-step {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 8px;
          background: var(--bg-medium);
          border-radius: 6px;
          border-left: 3px solid var(--primary-accent);
          max-width: 200px;
        }
        .chain-step.analysis { border-left-color: #64ffda; }
        .chain-step.synthesis { border-left-color: #f5a742; }
        .chain-step.recall { border-left-color: #a78bfa; }
        .chain-step.evaluation { border-left-color: #fb7185; }
        .chain-number {
          background: var(--primary-accent);
          color: var(--bg-dark);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: bold;
          flex-shrink: 0;
        }
        .chain-content { flex: 1; min-width: 0; }
        .chain-category {
          font-size: 0.65rem;
          color: var(--text-medium);
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .chain-text {
          font-size: 0.75rem;
          color: var(--text-light);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .chain-connector {
          color: var(--text-medium);
          font-size: 0.8rem;
        }
        .response-conclusion p {
          color: var(--text-light);
          line-height: 1.6;
        }
      </style>
    `;
  }

  /**
   * Generate response text based on prompt and model
   */
  private generateResponseText(prompt: string, model: AIModel): string {
    const modelName = model === 'claude' ? 'Claude' : model === 'gemini' ? 'Gemini' : 'GPT-4';
    return `Based on the chain of thought analysis, ${modelName} has systematically examined "${prompt.substring(0, 30)}..." through multiple reasoning steps. The visualization shows the sequential thought process, with each node representing a distinct cognitive operation. The chain demonstrates how the AI breaks down complex queries into manageable components, synthesizes information, and arrives at conclusions through structured reasoning.`;
  }

  /**
   * Calculate confidence from thoughts
   */
  private calculateConfidence(thoughts: ThoughtNode[]): number {
    if (thoughts.length === 0) return 0;
    const avgConfidence = thoughts.reduce((sum, t) => sum + (t.metadata?.confidence || 70), 0) / thoughts.length;
    return Math.round(avgConfidence);
  }

  /**
   * Handle reset button
   */
  private handleReset(): void {
    const elements = this.getElements();

    // Abort any ongoing chain generation
    this.chainOfThought.abort();
    
    this.visualizationManager.clearScene();
    this.resetResponseDisplay();
    this.currentThoughts = [];
    this.updateStats([]);
    this.stateManager.reset();

    elements.saveBtn.disabled = true;
    elements.exportBtn.disabled = true;
    
    this.updateStatus('Reset complete', 'ready');
  }

  /**
   * Handle save button
   */
  private handleSave(): void {
    const state = this.stateManager.getState();
    const session = {
      timestamp: Date.now(),
      model: state.currentModel,
      thoughts: this.currentThoughts,
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

        // Load thoughts into visualization with streaming effect
        if (session.thoughts && session.thoughts.length > 0) {
          this.visualizationManager.clearScene();
          this.currentThoughts = [];
          
          // Add thoughts with delay for visual effect
          session.thoughts.forEach((thought: ThoughtNode, index: number) => {
            setTimeout(() => {
              this.visualizationManager.addThoughtToChain(thought);
              this.currentThoughts.push(thought);
              this.updateStats(this.currentThoughts);
            }, index * 200);
          });
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
      thoughts: this.currentThoughts,
      chainLength: this.currentThoughts.length,
      response: state.responseHistory[state.currentResponseIndex]
    };

    try {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chain-of-thought-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      this.addMessage('Chain of thought exported', 'system');
    } catch (error) {
      console.error('Failed to export data:', error);
      this.addMessage('Failed to export data', 'system');
    }
  }

  /**
   * Add message to chat
   */
  private addMessage(text: string, type: 'user' | 'ai' | 'system'): void {
    const elements = this.getElements();
    const container = elements.chatContainer;
    const message = document.createElement('div');
    message.className = `message ${type}-message`;
    message.textContent = text;
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;

    // Announce to screen readers
    this.announceToScreenReader(`${type} message: ${text}`);
  }

  /**
   * Reset response display
   */
  private resetResponseDisplay(): void {
    const elements = this.getElements();
    elements.responseContent.innerHTML = `
      <p class="response-placeholder">
        Enter a question to see the AI's chain of thought visualized in 3D.
        Watch as each thought builds on the previous one in real-time.
      </p>
    `;
  }

  /**
   * Update statistics display
   */
  updateStats(thoughts: ThoughtNode[]): void {
    const elements = this.getElements();

    elements.totalNodes.textContent = thoughts.length.toString();
    elements.activeNodes.textContent = thoughts.length.toString();

    if (thoughts.length > 0) {
      const avgWeight = Math.round(thoughts.reduce((sum, t) => sum + t.weight, 0) / thoughts.length);
      elements.avgWeight.textContent = `${avgWeight}%`;
    } else {
      elements.avgWeight.textContent = '0%';
    }

    // Max depth is just the chain length for linear chains
    elements.maxDepth.textContent = thoughts.length.toString();

    // Category breakdown
    const categories: Record<string, number> = {};
    thoughts.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + 1;
    });

    const breakdown = Object.entries(categories)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(' • ');
    elements.categoryBreakdown.textContent = breakdown || 'No thoughts yet';
  }

  /**
   * Update status indicator
   */
  updateStatus(text: string, status: 'ready' | 'thinking' | 'error'): void {
    const elements = this.getElements();

    elements.statusText.textContent = text;
    const dot = elements.statusDot;
    dot.className = `status-dot ${status}`;
  }

  /**
   * Show/hide loading overlay
   */
  showLoading(show: boolean): void {
    const elements = this.getElements();

    if (show) {
      elements.loadingOverlay.classList.add('active');
    } else {
      elements.loadingOverlay.classList.remove('active');
    }
  }

  /**
   * Update UI based on state changes
   */
  private updateUIFromState(state: AppState): void {
    const elements = this.getElements();

    // Update thinking status
    if (state.isThinking) {
      elements.sendButton.disabled = true;
    } else {
      elements.sendButton.disabled = false;
    }

    // Update performance stats
    elements.nodeCount.textContent = this.currentThoughts.length.toString();
  }

  /**
   * Start performance monitoring
   */
  private startPerformanceMonitoring(): void {
    const elements = this.getElements();

    const updateMetrics = () => {
      this.performanceMonitor.frameCount++;
      const currentTime = performance.now();

      if (currentTime - this.performanceMonitor.lastTime >= 1000) {
        this.performanceMonitor.fps = Math.round(
          this.performanceMonitor.frameCount * 1000 / (currentTime - this.performanceMonitor.lastTime)
        );
        elements.fps.textContent = this.performanceMonitor.fps.toString();
        elements.memUsage.textContent = this.visualizationManager.getMemoryUsage().toFixed(1);

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
    const canvas = document.getElementById('brain-canvas');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    if (canvas) {
      canvas.setAttribute('aria-label', '3D chain of thought visualization');
    }
    if (userInput) {
      userInput.setAttribute('aria-label', 'Enter your question');
    }
    if (sendButton) {
      sendButton.setAttribute('aria-label', 'Send question and generate chain of thought');
    }
  }

  /**
   * Announce message to screen readers
   */
  private announceToScreenReader(message: string): void {
    const elements = this.getElements();
    if (elements.srAnnouncer) {
      elements.srAnnouncer.textContent = message;
    }
  }

  /**
   * Check API connection status
   */
  async checkApiConnection(): Promise<boolean> {
    return this.apiClient.testConnection();
  }
}
