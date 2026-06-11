/**
 * UI Controller - Manages user interface interactions and DOM manipulation
 * @module ui/UIController
 */

import { IUIController, AppState, AIModel, ThoughtNode, VisualizationPattern, CONFIG } from '../types';
import { StateManager } from '../services/state/StateManager';
import { APIClient } from '../services/api/APIClient';
import { VisualizationManager } from '../visualization/VisualizationManager';
import { GraphAnalysis } from '../services/analysis/GraphAnalysis';

export class UIController implements IUIController {
  private stateManager: StateManager;
  private apiClient: APIClient;
  private visualizationManager: VisualizationManager;

  private lastPattern: VisualizationPattern = 'hierarchical';

  // DOM elements - will be initialized after DOM is ready
  private elements: {
    // Model selection
    modelButtons: NodeListOf<HTMLButtonElement>;
    // Pattern selection (absent in some test fixtures, hence nullable)
    patternButtons: NodeListOf<HTMLButtonElement>;
    metricsContent: HTMLDivElement | null;
    nodeDetails: HTMLDivElement | null;
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
   * Initialize DOM elements after DOM is ready
   */
  private initializeDOMElements(): void {
    this.elements = {
      // Model selection
      modelButtons: document.querySelectorAll('.model-btn') as NodeListOf<HTMLButtonElement>,
      // Pattern selection and analysis panels
      patternButtons: document.querySelectorAll('.pattern-btn') as NodeListOf<HTMLButtonElement>,
      metricsContent: document.getElementById('metricsContent') as HTMLDivElement | null,
      nodeDetails: document.getElementById('nodeDetails') as HTMLDivElement | null,
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

    // Show node details when a node is clicked in the 3D view
    this.visualizationManager.setNodeSelectionHandler(thought => this.showNodeDetails(thought));

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

    // Visualization pattern selection
    elements.patternButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const pattern = btn.dataset.pattern as VisualizationPattern;
        if (!pattern) return;
        this.stateManager.dispatch({ type: 'PATTERN_CHANGED', payload: pattern });
      });
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
   * Handle sending a message
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

    try {
      this.showLoading(true);

      // Get AI response
      const state = this.stateManager.getState();
      const response = await this.apiClient.generateResponse(message, state.currentModel);

      // Update visualization
      this.visualizationManager.createVisualization(response.thoughts, state.currentPattern);

      // Update response display, statistics and graph metrics
      this.updateResponseDisplay(response);
      this.updateStats(response.thoughts);
      this.updateMetrics(response.thoughts);

      // Finish thinking
      this.stateManager.dispatch({ type: 'THINKING_FINISHED', payload: response });

      // Enable controls
      elements.saveBtn.disabled = false;
      elements.exportBtn.disabled = false;

    } catch (error) {
      console.error('Error processing message:', error);
      this.addMessage('Error processing request. Please try again.', 'system');
    } finally {
      this.stateManager.setState({ isThinking: false });
      elements.sendButton.disabled = false;
      this.showLoading(false);
    }
  }

    /**
   * Handle reset button
   */
  private handleReset(): void {
    const elements = this.getElements();

    this.visualizationManager.clearScene();
    this.resetResponseDisplay();
    this.updateStats([]);
    this.updateMetrics([]);
    this.showNodeDetails(null);
    this.stateManager.reset();

    elements.saveBtn.disabled = true;
    elements.exportBtn.disabled = true;
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
          const pattern = this.stateManager.getState().currentPattern;
          this.visualizationManager.createVisualization(session.thoughts, pattern);
          this.updateStats(session.thoughts);
          this.updateMetrics(session.thoughts);
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
   * Update response display
   */
  private updateResponseDisplay(response: any): void {
    const elements = this.getElements();
    const content = elements.responseContent;

    const isSimulated = response.metadata?.isSimulated;
    // Some fallback paths already brand the model name (e.g. "CLAUDE (DEMO)")
    const alreadyLabeled = /demo/i.test(String(response.model ?? ''));
    const modelDisplay = isSimulated && !alreadyLabeled
      ? `${response.model} (Demo Mode)`
      : response.model;

    let headerText = `${modelDisplay} Analysis`;
    if (typeof response.confidence === 'number') {
      headerText += isSimulated
        ? ` (${response.confidence}% simulated)`
        : ` (${response.confidence}% confidence)`;
    }

    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom: 10px; color: var(--primary-accent); font-weight: 600;';
    header.textContent = headerText;

    // textContent keeps prompt echoes and model output from executing as HTML
    const body = document.createElement('div');
    body.style.whiteSpace = 'pre-wrap';
    body.textContent = response.response;

    content.replaceChildren(header, body);
  }

  /**
   * Reset response display
   */
  private resetResponseDisplay(): void {
    const elements = this.getElements();
    elements.responseContent.innerHTML = `
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
    const elements = this.getElements();

    elements.totalNodes.textContent = thoughts.length.toString();
    elements.activeNodes.textContent = thoughts.length.toString();

    if (thoughts.length > 0) {
      const avgWeight = Math.round(thoughts.reduce((sum: number, t: any) => sum + t.weight, 0) / thoughts.length);
      elements.avgWeight.textContent = `${avgWeight}%`;
    } else {
      elements.avgWeight.textContent = '0%';
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
    elements.maxDepth.textContent = maxDepth.toString();

    // Category breakdown
    const categories: Record<string, number> = {};
    thoughts.forEach((t: any) => {
      categories[t.category] = (categories[t.category] || 0) + 1;
    });

    const breakdown = Object.entries(categories)
      .map(([cat, count]) => `${cat}: ${count}`)
      .join(' • ');
    elements.categoryBreakdown.textContent = breakdown || 'No thoughts';
  }

  /**
   * Compute and render mathjs-based graph metrics; stores the adjacency
   * matrix in the knowledge graph state for downstream analysis
   */
  updateMetrics(thoughts: ThoughtNode[]): void {
    const container = this.elements?.metricsContent;
    if (!container) return;

    if (thoughts.length === 0) {
      container.textContent = 'Run an analysis to compute graph metrics.';
      return;
    }

    const metrics = GraphAnalysis.analyze(thoughts);

    this.stateManager.setState({
      knowledgeGraph: {
        matrices: new Map<string, any>([['adjacency', metrics.adjacency]])
      }
    });

    const rows: Array<[string, string]> = [
      ['Connections', metrics.edgeCount.toString()],
      ['Graph density', metrics.density.toFixed(3)],
      ['Avg degree', metrics.avgDegree.toFixed(2)],
      ['Weight μ / σ', `${metrics.weightMean.toFixed(1)} / ${metrics.weightStd.toFixed(1)}`],
      ['Most central', metrics.centralNode
        ? `#${metrics.centralNode.id} (${metrics.centralNode.category})`
        : '—']
    ];

    const fragment = document.createDocumentFragment();
    rows.forEach(([label, value]) => {
      const row = document.createElement('div');
      row.className = 'metric-row';
      const labelEl = document.createElement('span');
      labelEl.textContent = label;
      const valueEl = document.createElement('span');
      valueEl.className = 'metric-value';
      valueEl.textContent = value;
      row.append(labelEl, valueEl);
      fragment.appendChild(row);
    });
    container.replaceChildren(fragment);
  }

  /**
   * Display details for a node selected in the 3D view: the thought itself,
   * its full chain of thought (root → … → selected) and its direct children.
   * Chain steps and children are clickable to walk the graph.
   */
  showNodeDetails(thought: ThoughtNode | null): void {
    const container = this.elements?.nodeDetails;
    if (!container) return;

    if (!thought) {
      container.textContent = 'Click a node in the 3D view to inspect it.';
      return;
    }

    const all = this.visualizationManager.getThoughts();
    const byId = new Map(all.map((t): [number, ThoughtNode] => [t.id, t]));

    // Walk parent links to the root (cycle-guarded)
    const chain: ThoughtNode[] = [thought];
    const seen = new Set<number>([thought.id]);
    let cursor: ThoughtNode = thought;
    while (cursor.parent != null) {
      const parent = byId.get(cursor.parent);
      if (!parent || seen.has(parent.id)) break;
      seen.add(parent.id);
      chain.unshift(parent);
      cursor = parent;
    }
    const children = all.filter(t => t.parent === thought.id);

    const text = document.createElement('div');
    text.className = 'detail-text';
    text.textContent = thought.text;

    const meta = document.createElement('div');
    meta.textContent =
      `Category: ${thought.category} · Weight: ${thought.weight}` +
      ` · Confidence: ${thought.metadata?.confidence ?? '—'}` +
      (thought.parent != null ? ` · Parent: #${thought.parent}` : ' · Root node');

    container.replaceChildren(
      text,
      meta,
      this.buildChainSection(chain, thought, children)
    );
    this.announceToScreenReader(
      `Selected thought ${thought.id}: ${thought.text}. ` +
      `Chain of ${chain.length} step${chain.length === 1 ? '' : 's'}, ` +
      `${children.length} child thought${children.length === 1 ? '' : 's'}.`
    );
  }

  /**
   * Render the chain-of-thought list plus direct children. The step just
   * above the selection carries a "P" (parent) chip and children carry "C"
   * chips, mirroring the badges shown in the 3D view.
   */
  private buildChainSection(
    chain: ThoughtNode[],
    selected: ThoughtNode,
    children: ThoughtNode[]
  ): HTMLElement {
    const section = document.createElement('div');
    section.className = 'chain-section';

    const title = document.createElement('div');
    title.className = 'chain-title';
    title.textContent = `🧬 Chain of thought (${chain.length} step${chain.length === 1 ? '' : 's'})`;
    section.appendChild(title);

    const list = document.createElement('ol');
    list.className = 'chain-list';
    chain.forEach((step, i) => {
      const isSelected = step.id === selected.id;
      const isDirectParent = i === chain.length - 2;
      const chip = isSelected ? '●' : isDirectParent ? 'P' : String(i + 1);
      const chipClass = isSelected ? 'chip-current' : isDirectParent ? 'chip-p' : 'chip-step';
      list.appendChild(this.buildChainItem(step, chip, chipClass, isSelected));
    });
    section.appendChild(list);

    if (children.length > 0) {
      const childTitle = document.createElement('div');
      childTitle.className = 'chain-title chain-children-title';
      childTitle.textContent = `Child thoughts (${children.length})`;
      section.appendChild(childTitle);

      const childList = document.createElement('ol');
      childList.className = 'chain-list';
      children.forEach(child => {
        childList.appendChild(this.buildChainItem(child, 'C', 'chip-c', false));
      });
      section.appendChild(childList);
    }

    return section;
  }

  /**
   * One clickable row of the chain/children lists
   */
  private buildChainItem(
    step: ThoughtNode,
    chip: string,
    chipClass: string,
    isSelected: boolean
  ): HTMLLIElement {
    const item = document.createElement('li');
    item.className = 'chain-item' + (isSelected ? ' current' : '');

    const chipEl = document.createElement('span');
    chipEl.className = `chain-chip ${chipClass}`;
    chipEl.textContent = chip;

    const dot = document.createElement('span');
    dot.className = 'chain-cat-dot';
    const categoryColor = CONFIG.THOUGHT_CATEGORIES[step.category]?.color ?? 0xffffff;
    dot.style.backgroundColor = `#${categoryColor.toString(16).padStart(6, '0')}`;

    const textEl = document.createElement('span');
    textEl.className = 'chain-item-text';
    textEl.textContent = `#${step.id} ${step.text}`;
    textEl.title = step.text;

    item.append(chipEl, dot, textEl);

    if (!isSelected) {
      item.setAttribute('role', 'button');
      item.tabIndex = 0;
      item.setAttribute('aria-label', `Select thought ${step.id}: ${step.text}`);
      const select = (): void => this.visualizationManager.selectNodeById(step.id);
      item.addEventListener('click', select);
      item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          select();
        }
      });
    } else {
      item.setAttribute('aria-current', 'true');
    }

    return item;
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
      this.updateStatus('AI is thinking...', 'thinking');
      elements.sendButton.disabled = true;
    } else {
      this.updateStatus('Ready to analyze', 'ready');
      elements.sendButton.disabled = false;
    }

    // Update performance stats
    elements.nodeCount.textContent = state.knowledgeGraph.nodes.length.toString();

    // Re-layout visualization when the pattern changes
    if (state.currentPattern !== this.lastPattern) {
      this.lastPattern = state.currentPattern;
      this.visualizationManager.applyPattern(state.currentPattern);
      elements.patternButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.pattern === state.currentPattern);
      });
    }
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
        // Unit suffix lives in the HTML template ("…</span>MB")
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
    // Set ARIA labels for better accessibility
    const canvas = document.getElementById('brain-canvas');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    if (canvas) {
      canvas.setAttribute('aria-label', '3D thought visualization');
    }
    if (userInput) {
      userInput.setAttribute('aria-label', 'Enter your question');
    }
    if (sendButton) {
      sendButton.setAttribute('aria-label', 'Send question');
    }

    // Skip links are already in HTML
    // Screen reader announcements are handled via announceToScreenReader
  }

  /**
   * Announce message to screen readers
   */
  private announceToScreenReader(message: string): void {
    const elements = this.getElements();
    elements.srAnnouncer.textContent = message;
  }
}