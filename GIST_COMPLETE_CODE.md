# 🧠 AI Brain Visualizer Pro - Complete Implementation

**Multi-Platform AI Integration with Claude, Gemini, and GPT-4**

This comprehensive document contains the complete, production-ready implementation of the AI Brain Visualizer Pro with multi-platform API integration, interactive 3D visualization, and full documentation.

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features & Capabilities](#features--capabilities)
3. [Implementation Files](#implementation-files)
4. [Quick Start Guide](#quick-start-guide)
5. [API Configuration](#api-configuration)

---

## Project Overview

A sophisticated 3D visualization tool for exploring AI thought processes with real-time analysis, featuring:

- **Multi-Platform Support**: Claude 3.5, Gemini 1.5 Pro, GPT-4o
- **Interactive 3D Visualization**: Click and explore AI thought nodes
- **Secure API Key Management**: Browser-based local storage
- **Live API Integration**: Real-time responses from AI providers
- **Matrix & Spherical Layouts**: Automatic layout selection
- **Comprehensive Testing**: 47 passing tests
- **Production Ready**: Vercel deployment configuration

**Live Repository**: [github.com/ej777spirit/claude-ai-brain-visualizer](https://github.com/ej777spirit/claude-ai-brain-visualizer)

---

## Features & Capabilities

### ✨ Interactive Features
- 🎯 **Interactive Nodes**: Click any thought node to view detailed information
- 💡 **Hover Effects**: Nodes glow and respond to mouse hover
- 📊 **Matrix Visualization**: Smart grid layout for 9+ nodes
- 🔍 **Node Information Panel**: Beautiful overlay showing thought details
- 🎨 **Visual Feedback**: Color-coded categories with dynamic highlighting

### 🔐 API Management
- Secure localStorage-based key storage
- Per-platform configuration (Claude, Gemini, GPT-4)
- API key testing and validation
- Masked key display for security
- Clear/reset functionality

### 🎨 Visualization
- Real-time 3D rendering with Three.js
- Force-directed node positioning
- Category-based color coding
- Connection visualization
- Camera controls (orbit, zoom, pan)

---

## Implementation Files


### 📄 README.md

```markdown
# AI Brain Visualizer Pro - Claude Integration

A sophisticated 3D visualization tool for exploring AI thought processes with real-time analysis and scientific research capabilities.

## 🚀 Features

### ✨ NEW Interactive Features
- **🎯 Interactive Nodes**: Click any thought node to view detailed information
- **💡 Hover Effects**: Nodes glow and respond to mouse hover
- **📊 Matrix Visualization**: Smart grid layout for 9+ nodes with depth-based layering
- **🔍 Node Information Panel**: Beautiful overlay showing thought details, confidence, and relationships
- **🎨 Visual Feedback**: Color-coded categories with dynamic highlighting

### Core Features
- **3D Thought Visualization**: Interactive Three.js-based neural network visualization
- **Multi-AI Support**: Live integration with Claude 3.5, GPT-4o, and Gemini 1.5 Pro
- **🔑 API Key Management**: Secure localStorage-based key storage with per-platform configuration
- **🔴 Live API Responses**: Real responses from AI providers (not simulated)
- **Secure Architecture**: Direct API calls with proper error handling
- **Scientific Analysis**: Mathematical representations, matrices, and research metrics
- **TypeScript**: Fully typed for better maintainability
- **Accessibility**: WCAG compliant with screen reader support
- **State Management**: Centralized state with observer pattern
- **Memory Safe**: Proper disposal of Three.js objects
- **Test Coverage**: Comprehensive unit and integration tests (47 tests passing)
- **Demo Mode**: Clear indicators for simulated vs real AI responses (when no API key)
- **Vercel Ready**: Complete deployment configuration included

## 🏗️ Architecture

```
claude-ai-brain-visualizer/
├── src/                    # Source TypeScript files
│   ├── types/             # Type definitions
│   ├── services/          # Core services (API, State, Storage)
│   ├── visualization/     # Three.js visualization components
│   ├── ui/               # UI controllers and components
│   └── utils/            # Utility functions
├── server/                # Backend API proxy
├── tests/                 # Test files
├── public/               # Static assets
└── dist/                 # Compiled output
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/ej777spirit/claude-ai-brain-visualizer.git
cd claude-ai-brain-visualizer
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your API keys (optional - works with simulated responses)
```

4. **Start development servers:**
```bash
npm run dev
```

This will start:
- Frontend dev server on `http://localhost:3000`
- Backend API proxy on `http://localhost:3001`

5. **Open your browser** and navigate to `http://localhost:3000`

## 🔐 API Configuration

The application supports **three different AI platforms** with flexible API key management:

### Two Ways to Configure API Keys

#### Option 1: Client-Side Storage (Recommended for Personal Use)
Store API keys directly in your browser's local storage for quick, convenient access:

1. **Select your AI platform** (Claude, Gemini, or GPT-4) from the model selector
2. **Click the API Key Configuration** section (🔑 icon)
3. **Enter your API key** in the platform-specific input field
4. **Save the key** - it will be securely stored in your browser's local storage
5. **Test the connection** to verify your key works

Your API keys are stored locally and never transmitted to any server except the official AI provider APIs.

#### Option 2: Backend Proxy (Recommended for Production)
For production deployments or shared environments, configure API keys on the backend:

Set environment variables in `.env`:
```env
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_gemini_key
```

### How to Obtain API Keys

#### 🤖 Claude (Anthropic)
1. Visit [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **Create Key** 
5. Copy your API key (starts with `sk-ant-`)
6. **Pricing**: Pay-as-you-go, starting at $3 per million tokens
7. **Free credits**: New accounts may receive initial credits

#### 🔮 Gemini (Google AI)
1. Visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Select or create a Google Cloud project
5. Copy your API key (starts with `AIza`)
6. **Pricing**: Free tier available with rate limits, paid tier for higher usage
7. **Free tier**: 60 requests per minute

#### 💬 ChatGPT (OpenAI)
1. Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy your API key immediately (starts with `sk-`)
6. **Pricing**: Pay-as-you-go, starting at $0.03 per 1K tokens for GPT-4o
7. **Note**: Requires adding payment method

### API Key Security Best Practices

✅ **DO:**
- Store API keys in browser local storage for personal use
- Use environment variables for production deployments
- Regularly rotate your API keys
- Monitor your API usage and billing
- Use separate keys for development and production

❌ **DON'T:**
- Share your API keys with others
- Commit API keys to version control (use `.env` files)
- Use the same key across multiple projects
- Expose keys in client-side code for public websites

### Demo Mode
If no API keys are provided, the application will use **simulated responses** for demonstration with:
- ⚠️ Clear "DEMO MODE" indicators in responses
- Realistic AI thought process visualization
- Full functionality without external API costs
- Easy upgrade path by adding API keys

### Managing Your API Keys

The application provides a user-friendly interface to:
- **Save** API keys for each platform
- **Test** API key validity before use
- **Clear** stored API keys when needed
- **View** masked versions of stored keys
- **Switch** between platforms seamlessly

Keys are stored per-platform, so you can:
- Use Claude for some queries
- Use Gemini for others
- Use GPT-4 for specific tasks
- Switch models without re-entering keys

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend servers
npm run dev:client       # Start only frontend dev server
npm run dev:server       # Start only backend API server

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run type-check       # Run TypeScript type checking
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Utilities
npm run clean            # Clean build artifacts
```

### Testing Infrastructure

The project includes comprehensive testing with **47 passing tests**:

- **Unit Tests**: Core business logic (APIClient, StateManager)
- **Integration Tests**: UI interactions and API endpoints
- **Mocking**: Three.js, Axios, and DOM environment mocking
- **Coverage**: Configured for detailed reporting

Tests run automatically and ensure production readiness.

### Demo Mode

When API keys are not configured, the application runs in **Demo Mode** with:
- Simulated AI responses with realistic thought processes
- Clear visual indicators ("DEMO MODE" banners)
- Full functionality for exploration and testing
- Easy transition to real APIs by adding keys

### Project Structure Details

- **`src/types/`**: TypeScript interfaces and type definitions
- **`src/services/`**: Core business logic (API client, state management)
- **`src/visualization/`**: Three.js 3D rendering and visualization
- **`src/ui/`**: User interface controllers and DOM manipulation
- **`src/utils/`**: Utility functions and accessibility helpers
- **`server/`**: Express.js API proxy server
- **`tests/`**: Unit and integration tests

## 🚀 Deployment

### Production Build

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Deploy to Web Server

1. Build the project: `npm run build`
2. Copy the `dist/` folder to your web server
3. Configure your server to serve `index.html` for all routes (SPA routing)

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://yourdomain.com
ANTHROPIC_API_KEY=your_production_key
# ... other API keys
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Three.js](https://threejs.org/) for 3D visualization
- Powered by [Vite](https://vitejs.dev/) for fast development
- TypeScript for type safety
- Express.js for the API proxy server

---

**Created with integration for Anthropic's Claude AI** 🤖✨
```

---

### 📄 main.ts

```typescript
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
          </div>

          <!-- API Key Management Section -->
          <div class="api-key-section" id="apiKeySection">
            <div class="api-key-header">
              <h3>🔑 API Key Configuration</h3>
              <button class="icon-btn" id="toggleApiKeyBtn" title="Toggle API Key Section">⚙️</button>
            </div>
            
            <div class="api-key-content" id="apiKeyContent">
              <div class="api-key-status" id="apiKeyStatus">
                <div class="status-indicator">
                  <span class="status-icon" id="keyStatusIcon">⚪</span>
                  <span id="keyStatusText">No API key configured</span>
                </div>
              </div>

              <div class="api-key-input-group" id="apiKeyInputGroup">
                <label for="apiKeyInput" id="apiKeyLabel">
                  Enter your <span id="currentModelName">Claude</span> API Key
                </label>
                <div class="api-key-info" id="apiKeyInfo">
                  Get your Claude API key from: 
                  <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" id="apiKeyLink">
                    console.anthropic.com
                  </a>
                </div>
                <div class="input-with-buttons">
                  <input 
                    type="password" 
                    id="apiKeyInput" 
                    placeholder="sk-ant-..." 
                    autocomplete="off"
                    spellcheck="false"
                  />
                  <button class="icon-btn" id="toggleKeyVisibility" title="Toggle visibility">👁️</button>
                </div>
                <div class="api-key-actions">
                  <button class="btn btn-primary" id="saveApiKeyBtn">💾 Save Key</button>
                  <button class="btn btn-secondary" id="testApiKeyBtn">🔬 Test</button>
                  <button class="btn btn-danger" id="clearApiKeyBtn">🗑️ Clear</button>
                </div>
                <div class="api-key-message" id="apiKeyMessage"></div>
              </div>
            </div>
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
```

---

### 📄 UIController.ts

```typescript
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
    // API Key Management
    toggleApiKeyBtn: HTMLButtonElement;
    apiKeyContent: HTMLDivElement;
    apiKeyInput: HTMLInputElement;
    saveApiKeyBtn: HTMLButtonElement;
    testApiKeyBtn: HTMLButtonElement;
    clearApiKeyBtn: HTMLButtonElement;
    toggleKeyVisibility: HTMLButtonElement;
    apiKeyMessage: HTMLDivElement;
    keyStatusIcon: HTMLSpanElement;
    keyStatusText: HTMLSpanElement;
    currentModelName: HTMLSpanElement;
    apiKeyInfo: HTMLDivElement;
    apiKeyLink: HTMLAnchorElement;
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
      srAnnouncer: document.getElementById('sr-announcer') as HTMLDivElement,
      // API Key Management
      toggleApiKeyBtn: document.getElementById('toggleApiKeyBtn') as HTMLButtonElement,
      apiKeyContent: document.getElementById('apiKeyContent') as HTMLDivElement,
      apiKeyInput: document.getElementById('apiKeyInput') as HTMLInputElement,
      saveApiKeyBtn: document.getElementById('saveApiKeyBtn') as HTMLButtonElement,
      testApiKeyBtn: document.getElementById('testApiKeyBtn') as HTMLButtonElement,
      clearApiKeyBtn: document.getElementById('clearApiKeyBtn') as HTMLButtonElement,
      toggleKeyVisibility: document.getElementById('toggleKeyVisibility') as HTMLButtonElement,
      apiKeyMessage: document.getElementById('apiKeyMessage') as HTMLDivElement,
      keyStatusIcon: document.getElementById('keyStatusIcon') as HTMLSpanElement,
      keyStatusText: document.getElementById('keyStatusText') as HTMLSpanElement,
      currentModelName: document.getElementById('currentModelName') as HTMLSpanElement,
      apiKeyInfo: document.getElementById('apiKeyInfo') as HTMLDivElement,
      apiKeyLink: document.getElementById('apiKeyLink') as HTMLAnchorElement
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
    
    // Initialize API key UI
    this.updateAPIKeyUI();

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

    // API Key Management
    elements.toggleApiKeyBtn.addEventListener('click', () => this.toggleAPIKeySection());
    elements.saveApiKeyBtn.addEventListener('click', () => this.handleSaveAPIKey());
    elements.testApiKeyBtn.addEventListener('click', () => this.handleTestAPIKey());
    elements.clearApiKeyBtn.addEventListener('click', () => this.handleClearAPIKey());
    elements.toggleKeyVisibility.addEventListener('click', () => this.toggleKeyVisibility());
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

    // Update API key UI for new model
    this.updateAPIKeyUI();

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
      elements.saveBtn.disabled = false;
      elements.exportBtn.disabled = false;

    } catch (error) {
      console.error('Error processing message:', error);
      this.addMessage('Error processing request. Please try again.', 'system');
    } finally {
      this.stateManager.setState({ isThinking: false });
      elements.sendButton.disabled = false;
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
    const modelDisplay = isSimulated ? `${response.model} (Demo Mode)` : response.model;
    const confidenceDisplay = isSimulated ? `${response.confidence}% (simulated)` : `${response.confidence}% confidence`;

    content.innerHTML = `
      <div style="margin-bottom: 10px; color: var(--primary-accent); font-weight: 600;">
        ${modelDisplay} Analysis (${confidenceDisplay})
      </div>
      <div>${response.response}</div>
    `;
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
        elements.memUsage.textContent = this.visualizationManager.getMemoryUsage().toFixed(1) + 'MB';

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

  /**
   * ============================
   * API Key Management Methods
   * ============================
   */

  /**
   * Update API key UI based on current model
   */
  private updateAPIKeyUI(): void {
    const elements = this.getElements();
    const state = this.stateManager.getState();
    const model = state.currentModel;
    const storage = this.apiClient.getAPIKeyStorage();

    // Update model-specific UI text
    const modelNames = {
      claude: 'Claude',
      gemini: 'Gemini',
      gpt: 'ChatGPT'
    };
    
    const apiKeyLinks = {
      claude: 'https://console.anthropic.com/',
      gemini: 'https://aistudio.google.com/app/apikey',
      gpt: 'https://platform.openai.com/api-keys'
    };

    const apiKeyInfoText = {
      claude: 'Get your Claude API key from: ',
      gemini: 'Get your Gemini API key from: ',
      gpt: 'Get your OpenAI API key from: '
    };

    const apiKeyPlaceholders = {
      claude: 'sk-ant-...',
      gemini: 'AIza...',
      gpt: 'sk-...'
    };

    elements.currentModelName.textContent = modelNames[model];
    elements.apiKeyLink.href = apiKeyLinks[model];
    elements.apiKeyLink.textContent = apiKeyLinks[model].replace('https://', '');
    elements.apiKeyInfo.innerHTML = `${apiKeyInfoText[model]} <a href="${apiKeyLinks[model]}" target="_blank" rel="noopener noreferrer">${apiKeyLinks[model].replace('https://', '')}</a>`;
    elements.apiKeyInput.placeholder = apiKeyPlaceholders[model];

    // Check if API key exists
    const hasKey = storage.hasAPIKey(model);
    
    if (hasKey) {
      const maskedKey = storage.getMaskedAPIKey(model);
      elements.keyStatusIcon.textContent = '🟢';
      elements.keyStatusText.textContent = `API key configured: ${maskedKey}`;
      elements.apiKeyInput.value = '';
      elements.apiKeyInput.placeholder = `Current: ${maskedKey}`;
      elements.apiStatusDot.style.backgroundColor = '#4ade80';
      elements.apiStatusText.textContent = `Live API (${modelNames[model]})`;
    } else {
      elements.keyStatusIcon.textContent = '⚪';
      elements.keyStatusText.textContent = 'No API key configured';
      elements.apiKeyInput.value = '';
      elements.apiStatusDot.style.backgroundColor = '#fbbf24';
      elements.apiStatusText.textContent = 'Demo Mode';
    }
  }

  /**
   * Toggle API key section visibility
   */
  private toggleAPIKeySection(): void {
    const elements = this.getElements();
    const isHidden = elements.apiKeyContent.style.display === 'none';
    
    if (isHidden) {
      elements.apiKeyContent.style.display = 'block';
      elements.toggleApiKeyBtn.textContent = '▼';
    } else {
      elements.apiKeyContent.style.display = 'none';
      elements.toggleApiKeyBtn.textContent = '▶';
    }
  }

  /**
   * Toggle API key visibility
   */
  private toggleKeyVisibility(): void {
    const elements = this.getElements();
    const input = elements.apiKeyInput;
    
    if (input.type === 'password') {
      input.type = 'text';
      elements.toggleKeyVisibility.textContent = '🙈';
    } else {
      input.type = 'password';
      elements.toggleKeyVisibility.textContent = '👁️';
    }
  }

  /**
   * Handle save API key
   */
  private async handleSaveAPIKey(): Promise<void> {
    const elements = this.getElements();
    const state = this.stateManager.getState();
    const model = state.currentModel;
    const apiKey = elements.apiKeyInput.value.trim();
    const storage = this.apiClient.getAPIKeyStorage();

    if (!apiKey) {
      this.showAPIKeyMessage('Please enter an API key', 'error');
      return;
    }

    // Validate format
    const validation = storage.validateAPIKeyFormat(model, apiKey);
    if (!validation.valid) {
      this.showAPIKeyMessage(validation.message, 'error');
      return;
    }

    // Save API key
    try {
      storage.saveAPIKey(model, apiKey);
      this.showAPIKeyMessage('API key saved successfully! ✓', 'success');
      this.updateAPIKeyUI();
      elements.apiKeyInput.value = '';
      
      this.announceToScreenReader('API key saved successfully');
    } catch (error: any) {
      this.showAPIKeyMessage(`Failed to save: ${error.message}`, 'error');
    }
  }

  /**
   * Handle test API key
   */
  private async handleTestAPIKey(): Promise<void> {
    const elements = this.getElements();
    const state = this.stateManager.getState();
    const model = state.currentModel;
    const storage = this.apiClient.getAPIKeyStorage();
    const apiKey = elements.apiKeyInput.value.trim() || storage.getAPIKey(model);

    if (!apiKey) {
      this.showAPIKeyMessage('No API key to test', 'error');
      return;
    }

    // Show testing message
    this.showAPIKeyMessage('Testing API key... ⏳', 'info');
    elements.testApiKeyBtn.disabled = true;

    try {
      const isValid = await this.apiClient.testAPIKey(model, apiKey);
      
      if (isValid) {
        this.showAPIKeyMessage('API key is valid! ✓', 'success');
        this.announceToScreenReader('API key test successful');
      } else {
        this.showAPIKeyMessage('API key test failed. Key may be invalid.', 'error');
        this.announceToScreenReader('API key test failed');
      }
    } catch (error: any) {
      this.showAPIKeyMessage(`Test failed: ${error.message}`, 'error');
    } finally {
      elements.testApiKeyBtn.disabled = false;
    }
  }

  /**
   * Handle clear API key
   */
  private handleClearAPIKey(): void {
    const elements = this.getElements();
    const state = this.stateManager.getState();
    const model = state.currentModel;
    const storage = this.apiClient.getAPIKeyStorage();

    if (!storage.hasAPIKey(model)) {
      this.showAPIKeyMessage('No API key to clear', 'info');
      return;
    }

    if (confirm(`Are you sure you want to clear the ${model.toUpperCase()} API key?`)) {
      storage.removeAPIKey(model);
      this.showAPIKeyMessage('API key cleared', 'success');
      this.updateAPIKeyUI();
      elements.apiKeyInput.value = '';
      this.announceToScreenReader('API key cleared');
    }
  }

  /**
   * Show API key message
   */
  private showAPIKeyMessage(message: string, type: 'success' | 'error' | 'info'): void {
    const elements = this.getElements();
    const messageEl = elements.apiKeyMessage;
    
    messageEl.textContent = message;
    messageEl.className = `api-key-message ${type}`;
    messageEl.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }
}```

---

### 📄 APIClient.ts

```typescript
/**
 * API Client - Handles communication with AI providers directly or via backend proxy
 * @module services/api/APIClient
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IAPIClient, APIResponse, AIModel, ThoughtNode, APIProvider } from '../../types';
import { ClaudeAPIProvider } from './providers/ClaudeAPIProvider';
import { GeminiAPIProvider } from './providers/GeminiAPIProvider';
import { OpenAIAPIProvider } from './providers/OpenAIAPIProvider';
import { APIKeyStorage } from '../storage/APIKeyStorage';

export class APIClient implements IAPIClient {
  private client: AxiosInstance;
  private claudeProvider: ClaudeAPIProvider;
  private geminiProvider: GeminiAPIProvider;
  private openaiProvider: OpenAIAPIProvider;
  private apiKeyStorage: APIKeyStorage;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        return Promise.reject(this.handleAPIError(error));
      }
    );

    // Initialize API providers
    this.claudeProvider = new ClaudeAPIProvider();
    this.geminiProvider = new GeminiAPIProvider();
    this.openaiProvider = new OpenAIAPIProvider();
    this.apiKeyStorage = new APIKeyStorage();
  }

  /**
   * Generate AI response for a given prompt
   * Uses direct API calls if API key is stored locally, otherwise falls back to proxy or simulation
   */
  async generateResponse(prompt: string, model: AIModel): Promise<APIResponse> {
    // Try to get API key from local storage first
    const apiKey = this.apiKeyStorage.getAPIKey(model);
    
    if (apiKey) {
      // Use direct API call with stored key
      try {
        console.log(`Using direct ${model} API call with stored key`);
        return await this.callProviderDirectly(prompt, model, apiKey);
      } catch (error: any) {
        console.error(`Direct ${model} API call failed:`, error);
        throw error; // Don't fallback silently, show the error to user
      }
    }
    
    // No API key stored - try backend proxy or fallback to simulation
    try {
      const response: AxiosResponse<APIResponse> = await this.client.post('/generate', {
        prompt,
        model,
        timestamp: Date.now(),
      });

      return response.data;
    } catch (error) {
      // Fallback to simulated response if API is unavailable
      console.warn('API unavailable, using simulated response');
      return this.generateSimulatedResponse(prompt, model);
    }
  }

  /**
   * Call API provider directly with stored API key
   */
  private async callProviderDirectly(prompt: string, model: AIModel, apiKey: string): Promise<APIResponse> {
    switch (model) {
      case 'claude':
        return await this.claudeProvider.generateResponse(prompt, apiKey);
      case 'gemini':
        return await this.geminiProvider.generateResponse(prompt, apiKey);
      case 'gpt':
        return await this.openaiProvider.generateResponse(prompt, apiKey);
      default:
        throw new Error(`Unsupported model: ${model}`);
    }
  }

  /**
   * Test API key for a specific provider
   */
  async testAPIKey(model: AIModel, apiKey: string): Promise<boolean> {
    try {
      switch (model) {
        case 'claude':
          return await this.claudeProvider.testConnection(apiKey);
        case 'gemini':
          return await this.geminiProvider.testConnection(apiKey);
        case 'gpt':
          return await this.openaiProvider.testConnection(apiKey);
        default:
          return false;
      }
    } catch (error) {
      console.error(`API key test failed for ${model}:`, error);
      return false;
    }
  }

  /**
   * Get API key storage instance
   */
  getAPIKeyStorage(): APIKeyStorage {
    return this.apiKeyStorage;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/models');
      return response.data.models || [];
    } catch (error) {
      // Return default models if API unavailable
      return ['claude', 'gemini', 'gpt'];
    }
  }

  /**
   * Generate simulated response when API is unavailable
   */
  private generateSimulatedResponse(prompt: string, model: AIModel): APIResponse {
    const thoughts = this.generateThoughts(prompt, model);
    const response = this.generateContextualResponse(prompt, model);

    return {
      response,
      thoughts,
      model: `${model.toUpperCase()} (DEMO)`,
      confidence: Math.floor(Math.random() * 20) + 80,
      metadata: {
        processingTime: 1500 + Math.random() * 1000,
        tokensUsed: Math.floor(Math.random() * 1000) + 500,
        modelVersion: 'simulated-demo',
        isSimulated: true
      }
    };
  }

  /**
   * Generate simulated thoughts
   */
  private generateThoughts(prompt: string, model: AIModel): ThoughtNode[] {
    const categories = ['analysis', 'synthesis', 'recall', 'evaluation'] as const;
    const thoughts: ThoughtNode[] = [];
    const numThoughts = 8 + Math.floor(Math.random() * 7);

    for (let i = 0; i < numThoughts; i++) {
      thoughts.push({
        id: i + 1,
        parent: i > 0 && Math.random() > 0.4 ? Math.floor(Math.random() * i) + 1 : undefined,
        text: `${model === 'claude' ? 'Claude analyzes' : model === 'gemini' ? 'Gemini processes' : 'GPT evaluates'}: ${this.getThoughtText(prompt, i)}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        weight: Math.floor(Math.random() * 40) + 60,
        position: { x: 0, y: 0, z: 0 } as any, // Will be set by visualization
        connections: [],
        metadata: {
          depth: 0,
          branchId: `branch-${i}`,
          timestamp: Date.now(),
          confidence: Math.floor(Math.random() * 30) + 70
        }
      });
    }

    return thoughts;
  }

  /**
   * Generate contextual response text
   */
  private generateContextualResponse(prompt: string, model: AIModel): string {
    const responses = {
      claude: `⚠️ <strong>DEMO MODE - SIMULATED RESPONSE</strong><br><br>As Claude, I've analyzed your query "${prompt}" through multiple cognitive pathways. The visualization shows my thought process involving contextual understanding, pattern recognition, and logical synthesis. Each node represents a concept or reasoning step, with connections showing how ideas relate and build upon each other.<br><br><em>This is a simulated response for demonstration purposes. Configure API keys to get real AI responses.</em>`,
      gemini: `⚠️ <strong>DEMO MODE - SIMULATED RESPONSE</strong><br><br>Through Gemini's advanced processing, I've examined "${prompt}" using parallel analysis streams. The 3D visualization demonstrates how I connect different knowledge domains, evaluate multiple perspectives, and synthesize information into a coherent response.<br><br><em>This is a simulated response for demonstration purposes. Configure API keys to get real AI responses.</em>`,
      gpt: `⚠️ <strong>DEMO MODE - SIMULATED RESPONSE</strong><br><br>GPT-4's analysis of "${prompt}" involves deep transformer-based reasoning. The thought graph illustrates how attention mechanisms focus on relevant concepts, building layers of understanding that culminate in this comprehensive response.<br><br><em>This is a simulated response for demonstration purposes. Configure API keys to get real AI responses.</em>`
    };
    return responses[model] || responses.claude;
  }

  /**
   * Get thought text based on prompt and index
   */
  private getThoughtText(prompt: string, index: number): string {
    const aspects = [
      'contextual understanding',
      'semantic relationships',
      'logical implications',
      'pattern recognition',
      'knowledge synthesis',
      'probabilistic reasoning',
      'causal inference',
      'conceptual mapping'
    ];
    return aspects[index % aspects.length] + ' of "' + prompt.substring(0, 30) + '..."';
  }

  /**
   * Handle API errors
   */
  private handleAPIError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      switch (status) {
        case 400:
          return new Error(`Bad Request: ${message}`);
        case 401:
          return new Error('API Key invalid or missing');
        case 403:
          return new Error('API access forbidden');
        case 429:
          return new Error('Rate limit exceeded. Please try again later.');
        case 500:
          return new Error('Server error. Please try again.');
        default:
          return new Error(`API Error (${status}): ${message}`);
      }
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error(error.message || 'Unknown API error');
    }
  }

  /**
   * Update API configuration
   */
  updateConfig(config: { apiKey?: string; provider?: APIProvider }): void {
    if (config.apiKey) {
      this.client.defaults.headers.common['Authorization'] = `Bearer ${config.apiKey}`;
    }
  }
}```

---

### 📄 VisualizationManager.ts

```typescript
/**
 * Visualization Manager - Three.js scene management and 3D rendering
 * @module visualization/VisualizationManager
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { IVisualizationManager, ThoughtNode } from '../types';
import { CONFIG } from '../types';

export class VisualizationManager implements IVisualizationManager {
  private canvas: HTMLCanvasElement;
  private scene: any;
  private camera: any;
  private renderer: any;
  private controls: any;

  private nodes: any[] = [];
  private lines: any[] = [];
  private disposables: any[] = [];
  private centralSphere: any;

  private animationId: number | null = null;
  private isInitialized = false;

  // Interactive features
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private hoveredNode: THREE.Mesh | null = null;
  private selectedNode: THREE.Mesh | null = null;
  private nodeInfoElement: HTMLDivElement | null = null;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }
    
    // Initialize raycaster and mouse for interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Create node info element for displaying details
    this.createNodeInfoElement();
  }

  /**
   * Initialize the Three.js scene
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupControls();
    this.setupLighting();
    this.createCentralSphere();
    this.setupEventListeners();

    this.startAnimation();
    this.isInitialized = true;
  }

  /**
   * Setup Three.js scene
   */
  private setupScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a192f);
    this.scene.fog = new THREE.Fog(0x0a192f, 50, 200);
  }

  /**
   * Setup camera
   */
  private setupCamera(): void {
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, CONFIG.VISUALIZATION.cameraDistance);
  }

  /**
   * Setup WebGL renderer
   */
  private setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  /**
   * Setup orbit controls
   */
  private setupControls(): void {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 100;
    this.controls.minDistance = 10;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;
  }

  /**
   * Setup scene lighting
   */
  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Point light for accent
    const pointLight = new THREE.PointLight(CONFIG.THOUGHT_CATEGORIES.analysis.color, 0.5, 100);
    pointLight.position.set(0, 20, 0);
    this.scene.add(pointLight);

    // Add lights to disposables
    this.disposables.push(ambientLight, directionalLight, pointLight);
  }

  /**
   * Create central sphere
   */
  private createCentralSphere(): void {
    const geometry = new THREE.SphereGeometry(2, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
      color: CONFIG.THOUGHT_CATEGORIES.analysis.color,
      metalness: 0.7,
      roughness: 0.2,
      opacity: 0.3,
      transparent: true
    });

    this.centralSphere = new THREE.Mesh(geometry, material);
    this.scene.add(this.centralSphere);

    this.disposables.push(geometry, material);
  }

  /**
   * Create node info element for displaying details
   */
  private createNodeInfoElement(): void {
    this.nodeInfoElement = document.createElement('div');
    this.nodeInfoElement.id = 'node-info-panel';
    this.nodeInfoElement.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(10, 25, 47, 0.95);
      border: 2px solid #64ffda;
      border-radius: 12px;
      padding: 20px;
      color: white;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      max-width: 500px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
      display: none;
      z-index: 1000;
      backdrop-filter: blur(10px);
    `;
    document.body.appendChild(this.nodeInfoElement);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.handleResize());
    
    // Mouse move for hover effects
    this.canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
    
    // Click for node selection
    this.canvas.addEventListener('click', (event) => this.onMouseClick(event));
    
    // Change cursor style
    this.canvas.style.cursor = 'pointer';
  }

  /**
   * Handle mouse move for hover effects
   */
  private onMouseMove(event: MouseEvent): void {
    // Calculate mouse position in normalized device coordinates
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check for intersections
    const intersects = this.raycaster.intersectObjects(this.nodes);

    // Reset previous hover
    if (this.hoveredNode && this.hoveredNode !== this.selectedNode) {
      const material = this.hoveredNode.material as THREE.MeshPhongMaterial;
      material.emissive.setHex(0x000000);
      material.opacity = 0.8;
    }

    if (intersects.length > 0) {
      const node = intersects[0].object as THREE.Mesh;
      this.hoveredNode = node;
      
      // Highlight hovered node
      if (node !== this.selectedNode) {
        const material = node.material as THREE.MeshPhongMaterial;
        material.emissive.setHex(0x666666);
        material.opacity = 1.0;
      }
      
      this.canvas.style.cursor = 'pointer';
    } else {
      this.hoveredNode = null;
      this.canvas.style.cursor = 'default';
    }
  }

  /**
   * Handle mouse click for node selection
   */
  private onMouseClick(event: MouseEvent): void {
    // Calculate mouse position
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update raycaster
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Check for intersections
    const intersects = this.raycaster.intersectObjects(this.nodes);

    // Reset previous selection
    if (this.selectedNode) {
      const material = this.selectedNode.material as THREE.MeshPhongMaterial;
      material.emissive.setHex(0x000000);
      material.opacity = 0.8;
    }

    if (intersects.length > 0) {
      const node = intersects[0].object as THREE.Mesh;
      this.selectedNode = node;
      
      // Highlight selected node
      const material = node.material as THREE.MeshPhongMaterial;
      material.emissive.setHex(0x00ff00);
      material.opacity = 1.0;
      material.emissiveIntensity = 0.5;
      
      // Display node information
      this.displayNodeInfo(node);
      
      // Announce to screen reader
      const thought = node.userData as ThoughtNode;
      this.announceToScreenReader(`Selected node: ${thought.text}`);
    } else {
      this.selectedNode = null;
      this.hideNodeInfo();
    }
  }

  /**
   * Display node information panel
   */
  private displayNodeInfo(node: THREE.Mesh): void {
    if (!this.nodeInfoElement) return;

    const thought = node.userData as ThoughtNode;
    
    this.nodeInfoElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; color: #64ffda; font-size: 18px;">
          🧠 Thought Node #${thought.id}
        </h3>
        <button onclick="document.getElementById('node-info-panel').style.display='none'" 
                style="background: none; border: 2px solid #64ffda; color: #64ffda; cursor: pointer; 
                       border-radius: 4px; padding: 4px 12px; font-size: 16px;">
          ✕
        </button>
      </div>
      
      <div style="margin: 12px 0;">
        <div style="display: inline-block; background: ${this.getCategoryColor(thought.category)}; 
                    padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold;">
          ${this.getCategoryName(thought.category)}
        </div>
      </div>
      
      <div style="margin: 12px 0; line-height: 1.6; font-size: 14px;">
        ${thought.text}
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; 
                  padding-top: 12px; border-top: 1px solid rgba(100, 255, 218, 0.3);">
        <div>
          <div style="font-size: 11px; color: #8892b0;">Weight</div>
          <div style="font-size: 16px; font-weight: bold; color: #64ffda;">${thought.weight}%</div>
        </div>
        <div>
          <div style="font-size: 11px; color: #8892b0;">Confidence</div>
          <div style="font-size: 16px; font-weight: bold; color: #64ffda;">${thought.metadata.confidence}%</div>
        </div>
        <div>
          <div style="font-size: 11px; color: #8892b0;">Depth Level</div>
          <div style="font-size: 16px; font-weight: bold; color: #64ffda;">${thought.metadata.depth}</div>
        </div>
        <div>
          <div style="font-size: 11px; color: #8892b0;">Branch ID</div>
          <div style="font-size: 16px; font-weight: bold; color: #64ffda;">${thought.metadata.branchId}</div>
        </div>
      </div>
      
      ${thought.parent ? `
        <div style="margin-top: 12px; padding: 8px; background: rgba(100, 255, 218, 0.1); 
                    border-radius: 6px; font-size: 12px;">
          <span style="color: #8892b0;">↑ Parent Node:</span> 
          <span style="color: #64ffda; font-weight: bold;">#${thought.parent}</span>
        </div>
      ` : ''}
      
      <div style="margin-top: 12px; font-size: 11px; color: #8892b0; text-align: center;">
        Click another node to explore, or click empty space to deselect
      </div>
    `;
    
    this.nodeInfoElement.style.display = 'block';
  }

  /**
   * Hide node information panel
   */
  private hideNodeInfo(): void {
    if (this.nodeInfoElement) {
      this.nodeInfoElement.style.display = 'none';
    }
  }

  /**
   * Get category color
   */
  private getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      analysis: '#64ffda',
      synthesis: '#f5a742',
      recall: '#a78bfa',
      evaluation: '#fb7185'
    };
    return colors[category] || '#64ffda';
  }

  /**
   * Get category name
   */
  private getCategoryName(category: string): string {
    const names: { [key: string]: string } = {
      analysis: 'ANALYSIS',
      synthesis: 'SYNTHESIS',
      recall: 'RECALL',
      evaluation: 'EVALUATION'
    };
    return names[category] || 'UNKNOWN';
  }

  /**
   * Announce to screen reader
   */
  private announceToScreenReader(message: string): void {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  }

  /**
   * Create visualization from thought nodes
   */
  createVisualization(thoughts: ThoughtNode[]): void {
    this.clearScene();

    // Create node map for connections
    const nodeMap = new Map<number, THREE.Mesh>();

    // Create nodes
    thoughts.forEach(thought => {
      const node = this.createNode(thought);
      nodeMap.set(thought.id, node);
      this.nodes.push(node);
    });

    // Create connections
    thoughts.forEach(thought => {
      if (thought.parent && nodeMap.has(thought.parent)) {
        const parentNode = nodeMap.get(thought.parent)!;
        const childNode = nodeMap.get(thought.id)!;
        this.createConnection(parentNode, childNode);
      }
    });

    // Position nodes in 3D space
    this.positionNodes(thoughts, nodeMap);
  }

  /**
   * Create a thought node
   */
  private createNode(thought: ThoughtNode): THREE.Mesh {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: CONFIG.THOUGHT_CATEGORIES[thought.category].color,
      opacity: 0.8,
      transparent: true
    });

    const node = new THREE.Mesh(geometry, material);
    node.userData = thought;

    // Set scale based on weight
    const scale = CONFIG.VISUALIZATION.nodeSize.min +
      (thought.weight / 100) * (CONFIG.VISUALIZATION.nodeSize.max - CONFIG.VISUALIZATION.nodeSize.min);
    node.scale.setScalar(scale);

    // Add to scene
    this.scene.add(node);

    // Track for disposal
    this.disposables.push(geometry, material);

    return node;
  }

  /**
   * Create connection between nodes
   */
  private createConnection(node1: THREE.Mesh, node2: THREE.Mesh): void {
    const points = [node1.position, node2.position];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x2a4470,
      opacity: CONFIG.VISUALIZATION.connectionOpacity,
      transparent: true
    });

    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    this.lines.push(line);

    this.disposables.push(geometry, material);
  }

  /**
   * Position nodes in 3D space using force-directed layout
   */
  private positionNodes(thoughts: ThoughtNode[], nodeMap: Map<number, THREE.Mesh>): void {
    // Check if we should use matrix layout based on number of nodes
    const useMatrixLayout = thoughts.length >= 9;
    
    if (useMatrixLayout) {
      this.positionNodesMatrix(thoughts, nodeMap);
    } else {
      this.positionNodesSpherical(thoughts, nodeMap);
    }
  }

  /**
   * Position nodes in a matrix/grid layout
   */
  private positionNodesMatrix(thoughts: ThoughtNode[], nodeMap: Map<number, THREE.Mesh>): void {
    // Calculate grid dimensions
    const gridSize = Math.ceil(Math.sqrt(thoughts.length));
    const spacing = 8;
    const offset = (gridSize - 1) * spacing / 2;

    thoughts.forEach((thought, index) => {
      const node = nodeMap.get(thought.id);
      if (!node) return;

      // Calculate grid position
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      
      // Add some depth variation based on category
      const depthVariation = this.getDepthByCategory(thought.category);

      node.position.set(
        col * spacing - offset,
        row * spacing - offset,
        depthVariation + Math.random() * 2
      );

      // Update thought position
      thought.position = node.position.clone() as any;
    });
  }

  /**
   * Position nodes in spherical layout (original)
   */
  private positionNodesSpherical(thoughts: ThoughtNode[], nodeMap: Map<number, THREE.Mesh>): void {
    thoughts.forEach((thought, index) => {
      const node = nodeMap.get(thought.id);
      if (!node) return;

      // Position based on hierarchical level and randomness
      const level = this.getNodeLevel(thought, thoughts);
      const angle = (index / thoughts.length) * Math.PI * 2;
      const radius = 15 + level * 10 + Math.random() * 5;
      const height = (Math.random() - 0.5) * 20;

      node.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );

      // Update thought position
      thought.position = node.position.clone() as any;
    });
  }

  /**
   * Get depth offset based on category for matrix layout
   */
  private getDepthByCategory(category: string): number {
    const depths: { [key: string]: number } = {
      analysis: 0,
      synthesis: -3,
      recall: 3,
      evaluation: 6
    };
    return depths[category] || 0;
  }

  /**
   * Get hierarchical level of a node
   */
  private getNodeLevel(thought: ThoughtNode, allThoughts: ThoughtNode[]): number {
    let level = 0;
    let current = thought;

    while (current.parent) {
      level++;
      current = allThoughts.find(t => t.id === current.parent)!;
      if (!current) break;
    }

    return level;
  }

  /**
   * Update a specific node
   */
  updateNode(nodeId: number, updates: Partial<ThoughtNode>): void {
    const node = this.nodes.find(n => n.userData.id === nodeId);
    if (!node) return;

    // Update node properties
    Object.assign(node.userData, updates);

    // Update visual properties
    if (updates.weight !== undefined) {
      const scale = CONFIG.VISUALIZATION.nodeSize.min +
        (updates.weight / 100) * (CONFIG.VISUALIZATION.nodeSize.max - CONFIG.VISUALIZATION.nodeSize.min);
      node.scale.setScalar(scale);
    }

    if (updates.category !== undefined) {
      const material = node.material as THREE.MeshPhongMaterial;
      material.color.setHex(CONFIG.THOUGHT_CATEGORIES[updates.category].color);
    }
  }

  /**
   * Clear all nodes and connections
   */
  clearScene(): void {
    // Remove nodes
    this.nodes.forEach(node => {
      this.scene.remove(node);
    });

    // Remove lines
    this.lines.forEach(line => {
      this.scene.remove(line);
    });

    // Dispose of geometries and materials
    this.disposables.forEach(disposable => {
      if (disposable && typeof disposable.dispose === 'function') {
        disposable.dispose();
      }
    });

    this.nodes = [];
    this.lines = [];
    this.disposables = [];
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    if (!this.camera || !this.renderer || !this.canvas) return;

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Start animation loop
   */
  private startAnimation(): void {
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      this.updateAnimation();
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  /**
   * Update animation frame
   */
  private updateAnimation(): void {
    const time = Date.now() * 0.001;

    // Animate central sphere
    if (this.centralSphere) {
      this.centralSphere.rotation.x += 0.001;
      this.centralSphere.rotation.y += 0.002;
    }

    // Animate nodes with subtle movement
    this.nodes.forEach((node, i) => {
      node.position.y += Math.sin(time + i * 0.1) * 0.005;
      node.rotation.y += 0.005;
    });
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    this.clearScene();

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    // Remove node info element
    if (this.nodeInfoElement && this.nodeInfoElement.parentNode) {
      this.nodeInfoElement.parentNode.removeChild(this.nodeInfoElement);
    }

    this.isInitialized = false;
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): number {
    return (this.nodes.length * 0.1 + this.lines.length * 0.05);
  }
}```

---

### 📄 APIKeyStorage.ts

```typescript

/**
 * API Key Storage Manager
 * Handles secure storage and retrieval of API keys in browser local storage
 * @module services/storage/APIKeyStorage
 */

import { AIModel } from '../../types';

export interface StoredAPIKeys {
  claude_api_key?: string;
  gemini_api_key?: string;
  openai_api_key?: string;
}

export class APIKeyStorage {
  private readonly STORAGE_PREFIX = 'ai_visualizer_';
  private readonly KEY_NAMES = {
    claude: 'claude_api_key',
    gemini: 'gemini_api_key',
    gpt: 'openai_api_key'
  };

  /**
   * Save API key to local storage
   */
  saveAPIKey(model: AIModel, apiKey: string): void {
    try {
      const storageKey = this.getStorageKey(model);
      localStorage.setItem(storageKey, apiKey);
      console.log(`API key saved for ${model}`);
    } catch (error) {
      console.error(`Failed to save API key for ${model}:`, error);
      throw new Error('Failed to save API key. Please check browser storage settings.');
    }
  }

  /**
   * Get API key from local storage
   */
  getAPIKey(model: AIModel): string | null {
    try {
      const storageKey = this.getStorageKey(model);
      return localStorage.getItem(storageKey);
    } catch (error) {
      console.error(`Failed to retrieve API key for ${model}:`, error);
      return null;
    }
  }

  /**
   * Remove API key from local storage
   */
  removeAPIKey(model: AIModel): void {
    try {
      const storageKey = this.getStorageKey(model);
      localStorage.removeItem(storageKey);
      console.log(`API key removed for ${model}`);
    } catch (error) {
      console.error(`Failed to remove API key for ${model}:`, error);
    }
  }

  /**
   * Check if API key exists for model
   */
  hasAPIKey(model: AIModel): boolean {
    const key = this.getAPIKey(model);
    return key !== null && key.length > 0;
  }

  /**
   * Get all stored API keys
   */
  getAllAPIKeys(): StoredAPIKeys {
    return {
      claude_api_key: this.getAPIKey('claude') || undefined,
      gemini_api_key: this.getAPIKey('gemini') || undefined,
      openai_api_key: this.getAPIKey('gpt') || undefined
    };
  }

  /**
   * Clear all API keys
   */
  clearAllAPIKeys(): void {
    try {
      this.removeAPIKey('claude');
      this.removeAPIKey('gemini');
      this.removeAPIKey('gpt');
      console.log('All API keys cleared');
    } catch (error) {
      console.error('Failed to clear all API keys:', error);
    }
  }

  /**
   * Validate API key format
   */
  validateAPIKeyFormat(model: AIModel, apiKey: string): { valid: boolean; message: string } {
    if (!apiKey || apiKey.trim().length === 0) {
      return { valid: false, message: 'API key cannot be empty' };
    }

    switch (model) {
      case 'claude':
        if (!apiKey.startsWith('sk-ant-')) {
          return { 
            valid: false, 
            message: 'Claude API key should start with "sk-ant-"' 
          };
        }
        if (apiKey.length < 40) {
          return { 
            valid: false, 
            message: 'Claude API key appears to be too short' 
          };
        }
        break;

      case 'gpt':
        if (!apiKey.startsWith('sk-')) {
          return { 
            valid: false, 
            message: 'OpenAI API key should start with "sk-"' 
          };
        }
        if (apiKey.length < 40) {
          return { 
            valid: false, 
            message: 'OpenAI API key appears to be too short' 
          };
        }
        break;

      case 'gemini':
        if (apiKey.length < 20) {
          return { 
            valid: false, 
            message: 'Gemini API key appears to be too short' 
          };
        }
        break;
    }

    return { valid: true, message: 'API key format is valid' };
  }

  /**
   * Get masked API key for display
   */
  getMaskedAPIKey(model: AIModel): string {
    const key = this.getAPIKey(model);
    if (!key) return '';
    
    if (key.length <= 12) {
      return '***' + key.slice(-4);
    }
    
    return key.slice(0, 8) + '...' + key.slice(-4);
  }

  /**
   * Export all API keys (for backup)
   */
  exportKeys(): string {
    const keys = this.getAllAPIKeys();
    return JSON.stringify(keys, null, 2);
  }

  /**
   * Import API keys (from backup)
   */
  importKeys(jsonString: string): { success: boolean; message: string } {
    try {
      const keys = JSON.parse(jsonString) as StoredAPIKeys;
      
      if (keys.claude_api_key) {
        this.saveAPIKey('claude', keys.claude_api_key);
      }
      if (keys.gemini_api_key) {
        this.saveAPIKey('gemini', keys.gemini_api_key);
      }
      if (keys.openai_api_key) {
        this.saveAPIKey('gpt', keys.openai_api_key);
      }
      
      return { success: true, message: 'API keys imported successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to import API keys. Invalid format.' };
    }
  }

  /**
   * Get storage key for model
   */
  private getStorageKey(model: AIModel): string {
    return `${this.STORAGE_PREFIX}${this.KEY_NAMES[model]}`;
  }
}
```

---

### 📄 main.css

```css
:root {
  --bg-dark: #0a192f;
  --bg-medium: #0f1c3a;
  --bg-light: #1a3b66;
  --primary-accent: #64ffda;
  --secondary-accent: #f5a742;
  --warning-accent: #ff6b6b;
  --text-light: #e6f1ff;
  --text-medium: #8892b0;
  --text-dark: #495670;
  --border-color: #1a3b66;
  --border-light: #2a4470;
  --user-msg-bg: #2a4470;
  --ai-msg-bg: #1a3b66;
  --system-msg-bg: #0f2d1a;
  --status-ready: #39d353;
  --status-thinking: #f5a742;
  --status-error: #ff6b6b;
  --node-analysis: #64ffda;
  --node-synthesis: #f5a742;
  --node-recall: #a78bfa;
  --node-evaluation: #fb7185;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--bg-dark);
  color: var(--text-light);
  line-height: 1.6;
  min-height: 100vh;
  overflow: hidden;
  position: relative;
}

/* Accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}

.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary-accent);
  color: var(--bg-dark);
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skip-link:focus {
  top: 0;
}

/* Layout */
.container {
  display: flex;
  height: 100vh;
  width: 100%;
  position: relative;
}

/* Left Panel */
.left-panel {
  width: 28%;
  min-width: 350px;
  padding: 1.5rem;
  background: var(--bg-medium);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 2;
}

.header {
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative;
}

.header h1 {
  font-size: 1.6rem;
  color: var(--primary-accent);
  margin-bottom: 0.3rem;
  background: linear-gradient(135deg, var(--primary-accent), #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  font-size: 0.85rem;
  color: var(--text-medium);
  margin-bottom: 1rem;
}

.api-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 4px 8px;
  background: var(--bg-dark);
  border-radius: 20px;
  font-size: 0.75rem;
  margin: 0 auto 0.5rem;
}

.api-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--status-error);
}

.api-status-dot.connected {
  background: var(--status-ready);
}

.model-selector {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 1rem;
}

.model-btn {
  padding: 6px 12px;
  background: var(--bg-dark);
  color: var(--text-medium);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.model-btn.active {
  background: var(--primary-accent);
  color: var(--bg-dark);
  font-weight: 600;
}

.chat-container {
  flex-grow: 1;
  background: var(--bg-dark);
  border-radius: 10px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  min-height: 200px;
}

.message {
  padding: 0.8rem 1rem;
  border-radius: 8px;
  max-width: 95%;
  word-wrap: break-word;
  position: relative;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.user-message {
  background: var(--user-msg-bg);
  align-self: flex-end;
  margin-left: auto;
}

.ai-message {
  background: var(--ai-msg-bg);
  align-self: flex-start;
}

.system-message {
  background: var(--system-msg-bg);
  align-self: center;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-medium);
  font-style: italic;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input-area {
  display: flex;
  gap: 10px;
}

.input-area input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  background: var(--bg-dark);
  color: var(--text-light);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-area input:focus {
  outline: none;
  border-color: var(--primary-accent);
  box-shadow: 0 0 0 3px rgba(100, 255, 218, 0.1);
}

.input-area button {
  padding: 12px 20px;
  background: var(--primary-accent);
  color: var(--bg-dark);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.input-area button:hover:not(:disabled) {
  background: #52d6b5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(100, 255, 218, 0.3);
}

.input-area button:disabled {
  background: var(--text-dark);
  cursor: not-allowed;
}

.controls-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.control-btn {
  padding: 8px 12px;
  background: var(--bg-light);
  color: var(--text-light);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  text-align: center;
  transition: all 0.2s ease;
}

.control-btn:hover:not(:disabled) {
  background: var(--border-light);
  border-color: var(--primary-accent);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Middle Panel */
.middle-panel {
  flex-grow: 1;
  position: relative;
  min-width: 0;
  background: var(--bg-dark);
  overflow: hidden;
}

#brain-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
}

#brain-canvas:active {
  cursor: grabbing;
}

/* Performance Stats */
.perf-stats {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(15, 28, 58, 0.9);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--text-medium);
  font-family: monospace;
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
}

/* Loading overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 25, 47, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
  z-index: 10;
  backdrop-filter: blur(5px);
}

.loading-overlay.active {
  opacity: 1;
  pointer-events: all;
}

.loading-content {
  text-align: center;
  color: var(--text-light);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Right Panel */
.right-panel {
  width: 28%;
  min-width: 350px;
  padding: 1.5rem;
  background: var(--bg-medium);
  border-left: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  z-index: 2;
}

.right-panel h2 {
  color: var(--primary-accent);
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.response-content {
  color: var(--text-light);
  font-size: 0.95rem;
  white-space: pre-wrap;
  flex-grow: 1;
  line-height: 1.6;
  padding: 1rem;
  background: var(--bg-dark);
  border-radius: 8px;
  border: 1px solid var(--border-color);
  max-height: 400px;
  overflow-y: auto;
}

.response-placeholder {
  color: var(--text-medium);
  font-style: italic;
  text-align: center;
  padding: 2rem;
}

.analysis-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin: 1rem 0;
}

.stat-item {
  padding: 12px;
  background: var(--bg-dark);
  border-radius: 6px;
  text-align: center;
  border: 1px solid var(--border-color);
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--primary-accent);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-medium);
}

/* Status Indicator */
.status-indicator {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(15, 28, 58, 0.9);
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid var(--border-color);
  backdrop-filter: blur(10px);
  z-index: 5;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.status-dot.ready { background: var(--status-ready); }
.status-dot.thinking {
  background: var(--status-thinking);
  animation: pulse 1.5s infinite;
}
.status-dot.error { background: var(--status-error); }

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.1); }
}

/* Mobile optimizations */
@media (max-width: 1200px) {
  body { overflow: auto; }
  .container { flex-direction: column; height: auto; min-height: 100vh; }
  .left-panel, .middle-panel, .right-panel {
    width: 100%;
    min-width: unset;
    border: none;
  }
  .middle-panel { height: 50vh; min-height: 400px; }
}


/* ==========================================
   API Key Management Section
   ========================================== */

.api-key-section {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-light);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.api-key-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  cursor: pointer;
}

.api-key-header h3 {
  font-size: 1rem;
  color: var(--primary-accent);
  margin: 0;
}

.icon-btn {
  background: transparent;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 1.2rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.icon-btn:hover {
  background: var(--bg-medium);
}

.api-key-content {
  display: block;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.api-key-status {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--bg-medium);
  border-radius: 6px;
  border-left: 3px solid var(--primary-accent);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  font-size: 1.2rem;
}

.api-key-input-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.api-key-input-group label {
  font-size: 0.9rem;
  color: var(--text-medium);
  font-weight: 500;
}

.api-key-info {
  font-size: 0.85rem;
  color: var(--text-medium);
  padding: 0.5rem;
  background: var(--bg-medium);
  border-radius: 4px;
  border-left: 2px solid var(--secondary-accent);
}

.api-key-info a {
  color: var(--primary-accent);
  text-decoration: none;
  font-weight: 500;
}

.api-key-info a:hover {
  text-decoration: underline;
}

.input-with-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.input-with-buttons input {
  flex: 1;
  padding: 0.75rem;
  background: var(--bg-dark);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-light);
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.input-with-buttons input:focus {
  outline: none;
  border-color: var(--primary-accent);
  box-shadow: 0 0 0 2px rgba(100, 255, 218, 0.1);
}

.input-with-buttons input::placeholder {
  color: var(--text-dark);
}

.api-key-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.btn-primary {
  background: var(--primary-accent);
  color: var(--bg-dark);
}

.btn-primary:hover:not(:disabled) {
  background: #52e6c3;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(100, 255, 218, 0.3);
}

.btn-secondary {
  background: var(--bg-medium);
  color: var(--text-light);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg-light);
  border-color: var(--primary-accent);
}

.btn-danger {
  background: var(--warning-accent);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #ff5252;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.api-key-message {
  display: none;
  padding: 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.api-key-message.success {
  background: rgba(57, 211, 83, 0.15);
  border: 1px solid var(--status-ready);
  color: var(--status-ready);
}

.api-key-message.error {
  background: rgba(255, 107, 107, 0.15);
  border: 1px solid var(--warning-accent);
  color: var(--warning-accent);
}

.api-key-message.info {
  background: rgba(100, 255, 218, 0.15);
  border: 1px solid var(--primary-accent);
  color: var(--primary-accent);
}

/* Responsive adjustments for API key section */
@media (max-width: 768px) {
  .api-key-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
```

---

### 📄 FEATURES.md

```markdown
# 🧠 AI Brain Visualizer Pro - Feature Documentation

## ✨ Implemented Features

### 1. **Multi-Platform AI Support** ✅

The application now supports three major AI platforms with live API integration:

- **Claude/Anthropic** - Using Claude 3.5 Sonnet with extended thinking capabilities
- **Gemini/Google** - Using Gemini 1.5 Pro with advanced multimodal processing
- **ChatGPT/OpenAI** - Using GPT-4o with state-of-the-art language understanding

**How to switch platforms:**
- Click on any of the three platform buttons at the top of the left panel
- The UI will automatically update to show the selected platform
- API key management will switch to the corresponding platform

---

### 2. **API Key Management System** ✅

Secure, persistent API key storage with the following features:

**Features:**
- ✅ Separate input fields for each platform (Claude, Gemini, ChatGPT)
- ✅ Secure storage using browser localStorage
- ✅ API keys persist between sessions
- ✅ Key format validation before saving
- ✅ Masked display of stored keys for security
- ✅ Test connection functionality
- ✅ One-click clear option
- ✅ Toggle visibility for entered keys

**How to configure:**
1. Click the ⚙️ button next to "API Key Configuration"
2. Select your desired AI platform (Claude/Gemini/GPT)
3. Enter your API key from the respective provider:
   - Claude: Get from [console.anthropic.com](https://console.anthropic.com/)
   - Gemini: Get from [ai.google.dev](https://ai.google.dev/)
   - ChatGPT: Get from [platform.openai.com](https://platform.openai.com/)
4. Click "💾 Save Key" to store it securely
5. (Optional) Click "🔬 Test" to verify the connection
6. Your key is now saved and will be used automatically!

**Security:**
- Keys are stored in browser's localStorage (not sent to any server except the official API)
- Keys are masked when displayed
- Each platform has its own separate storage

---

### 3. **Live API Integration** ✅

All three platforms are fully integrated with live responses:

**Claude Integration:**
- Model: Claude 3.5 Sonnet (claude-3-5-sonnet-20241022)
- Extended thinking feature enabled for deeper reasoning
- Real-time thought extraction from Claude's thinking blocks
- Token usage tracking

**Gemini Integration:**
- Model: Gemini 1.5 Pro
- Advanced generation config (temperature, topP, topK)
- Safety ratings analysis
- Full multimodal capability support

**ChatGPT Integration:**
- Model: GPT-4o
- Optimized temperature settings
- Complete token usage tracking
- Finish reason analysis

**Fallback Mode:**
- If no API key is configured, the app enters "Demo Mode"
- Demo mode displays simulated responses for testing the UI
- Clear indicators show when in demo mode vs. live mode

---

### 4. **Interactive Node Visualization** ✅ NEW!

Enhanced 3D visualization with full interactivity:

**Features:**
- ✅ **Hover Effects**: Nodes glow when you hover over them
- ✅ **Click to Select**: Click any node to view detailed information
- ✅ **Node Information Panel**: Beautiful panel showing:
  - Node ID and category
  - Complete thought text
  - Weight and confidence scores
  - Depth level and branch information
  - Parent node relationships
- ✅ **Visual Feedback**:
  - Hovered nodes: Gray glow
  - Selected nodes: Green glow with higher intensity
  - Smooth transitions and animations

**How to interact:**
1. Hover over any node to see it highlight
2. Click a node to view its detailed information
3. The information panel appears at the bottom center
4. Click another node to switch selection
5. Click empty space to deselect
6. Click the ✕ button to close the info panel

---

### 5. **Matrix Visualization Layout** ✅ NEW!

Smart layout system that adapts to the number of nodes:

**Automatic Layout Selection:**
- **9+ nodes**: Matrix/Grid layout activated automatically
- **Fewer nodes**: Spherical/radial layout for better spacing

**Matrix Layout Features:**
- Organized grid arrangement
- Depth variation by thought category:
  - Analysis: Front layer (depth 0)
  - Synthesis: Layer -3
  - Recall: Layer +3
  - Evaluation: Layer +6
- Easy navigation and comparison
- Maintains visual connections between related thoughts

**Spherical Layout Features:**
- Hierarchical positioning based on thought relationships
- Radial distribution
- Dynamic spacing based on node depth
- Better for smaller thought networks

---

### 6. **Chain of Thought Visualization** ✅

Real-time visualization of AI reasoning:

**Features:**
- Color-coded thought categories:
  - 🔵 **Analysis** (Cyan): Analytical reasoning
  - 🟠 **Synthesis** (Orange): Information integration
  - 🟣 **Recall** (Purple): Knowledge retrieval
  - 🔴 **Evaluation** (Pink): Quality assessment
- Node size reflects thought weight (importance)
- Connections show parent-child relationships
- Real-time animation and rotation
- 3D camera controls (orbit, zoom, pan)

**Thought Extraction:**
- **Claude**: Extracts from thinking blocks and response content
- **Gemini**: Parses response sentences into thought nodes
- **ChatGPT**: Analyzes completion content for reasoning steps
- Each node contains metadata: confidence, depth, branch ID, timestamp

---

### 7. **Error Handling & Validation** ✅

Comprehensive error handling throughout:

**API Key Validation:**
- Format checking before saving
- Connection testing capability
- Clear error messages for invalid keys
- Specific guidance for each platform's key format

**API Call Error Handling:**
- Network error detection
- Rate limit handling with user-friendly messages
- Timeout handling (60 second limit)
- Server error detection
- Specific error messages for each failure type

**User Feedback:**
- Status indicators showing API connection state
- Loading overlays during processing
- Success/error messages for all actions
- Screen reader announcements for accessibility

---

### 8. **Vercel Deployment Ready** ✅

Complete deployment configuration:

**Configuration Files:**
- ✅ `vercel.json`: Deployment and routing configuration
- ✅ `.vercelignore`: Excludes unnecessary files
- ✅ `api/` folder: Serverless functions for backend API calls
- ✅ Production server configuration
- ✅ Environment variable support

**Deployment Steps:**
1. Connect your GitHub repository to Vercel
2. Configure environment variables (optional, for backend proxy):
   - `ANTHROPIC_API_KEY`
   - `GOOGLE_API_KEY`
   - `OPENAI_API_KEY`
3. Deploy! The app will be live instantly

**Note:** The app works client-side with localStorage, so environment variables are optional. They're only needed if you want to use the backend proxy instead of direct API calls.

---

### 9. **Accessibility Features** ✅

Built with accessibility in mind:

- Screen reader announcements for all major actions
- Keyboard navigation support
- Skip to main content link
- ARIA labels and roles throughout
- High contrast visual design
- Clear status indicators
- Semantic HTML structure

---

### 10. **Performance Optimization** ✅

Optimized for smooth operation:

- Efficient 3D rendering with Three.js
- Memory usage tracking
- FPS monitoring
- Node count display
- Lazy loading and code splitting ready
- Optimized bundle size
- Resource disposal on cleanup

---

## 🚀 Quick Start Guide

1. **Clone and Install:**
   ```bash
   git clone https://github.com/ej777spirit/claude-ai-brain-visualizer.git
   cd claude-ai-brain-visualizer
   npm install
   ```

2. **Development:**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`

3. **Configure API Keys:**
   - Click the platform button (Claude/Gemini/GPT)
   - Click the ⚙️ settings icon
   - Enter your API key
   - Click "Save Key"
   - Test the connection

4. **Start Visualizing:**
   - Type a question in the input field
   - Click "Analyze"
   - Watch the 3D thought visualization appear
   - Click nodes to explore them
   - Rotate, zoom, and pan the 3D scene

5. **Deploy to Vercel:**
   ```bash
   npm run build
   vercel deploy
   ```

---

## 📊 Technical Stack

- **Frontend:** TypeScript, Vite, Three.js
- **3D Graphics:** Three.js with OrbitControls
- **API Integration:** Axios for HTTP requests
- **State Management:** Custom StateManager
- **Storage:** Browser localStorage
- **Deployment:** Vercel (serverless functions + static site)
- **Testing:** Jest

---

## 🎯 Usage Tips

1. **Best Results:** Use specific, complex questions to see more interesting thought patterns
2. **Matrix View:** Ask questions that generate 9+ thoughts to see the matrix layout
3. **Compare AIs:** Try the same question across all three platforms to compare reasoning
4. **Explore Nodes:** Click multiple nodes to understand the thought hierarchy
5. **3D Navigation:** Use mouse to rotate, scroll to zoom, right-click to pan

---

## 🔒 Privacy & Security

- API keys are stored locally in your browser only
- Keys are never sent to our servers
- Direct API calls go only to official AI provider endpoints
- No tracking or analytics
- Open source and transparent

---

## 🐛 Troubleshooting

**"API Key Invalid" Error:**
- Check that you copied the complete key
- Verify the key is for the correct platform
- Ensure your API key has proper permissions

**"Demo Mode" Message:**
- No API key is configured
- Configure a key to get live responses

**Visualization Not Appearing:**
- Check browser console for errors
- Ensure WebGL is supported
- Try refreshing the page

**Network Errors:**
- Check your internet connection
- Verify API provider status
- Check for rate limiting

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues or questions:
- GitHub Issues: [github.com/ej777spirit/claude-ai-brain-visualizer/issues](https://github.com/ej777spirit/claude-ai-brain-visualizer/issues)
- Repository: [github.com/ej777spirit/claude-ai-brain-visualizer](https://github.com/ej777spirit/claude-ai-brain-visualizer)

---

**Enjoy visualizing AI thought processes! 🧠✨**
```

---

### 📄 IMPLEMENTATION_SUMMARY.md

```markdown
# Multi-Platform API Integration - Implementation Summary

## 🎉 Implementation Complete!

All requirements have been successfully implemented and pushed to the repository.

### 📦 What Was Delivered

#### 1. API Integration Modules (✅ Complete)

Created three dedicated API provider modules with full error handling:

- **ClaudeAPIProvider.ts** - Anthropic Claude 3.5 Sonnet integration
  - Extended thinking mode support
  - Comprehensive thought extraction from thinking blocks
  - Format validation (sk-ant-*)
  - Full error handling with specific messages

- **GeminiAPIProvider.ts** - Google Gemini 1.5 Pro integration
  - Multi-modal support ready
  - Safety ratings handling
  - Thought extraction from response content
  - Rate limit and quota error handling

- **OpenAIAPIProvider.ts** - OpenAI GPT-4o integration
  - Latest GPT-4o model
  - Token usage tracking
  - Finish reason analysis
  - Quota and rate limit handling

#### 2. API Key Management UI (✅ Complete)

Implemented a comprehensive user interface for API key management:

- **Platform-Specific Fields**: Dynamic UI that changes based on selected AI platform
- **Save/Test/Clear Actions**: Full CRUD operations for API keys
- **Visibility Toggle**: Password field with show/hide functionality
- **Status Indicators**: Visual feedback (🟢 configured, ⚪ not configured)
- **Helper Links**: Direct links to get API keys for each platform
- **Masked Display**: Security-conscious key display (e.g., sk-ant-...ab12)
- **Validation**: Real-time format validation before saving

#### 3. Secure Storage Implementation (✅ Complete)

Created `APIKeyStorage.ts` with comprehensive storage management:

- **Per-Platform Storage**: Separate keys for claude, gemini, and openai
- **Format Validation**: Enforces correct key formats before storage
- **Local Storage**: Browser local storage for persistence
- **Export/Import**: Backup and restore functionality
- **Masked Display**: getMaskedAPIKey() for secure UI display
- **Clear All**: Ability to remove all stored keys

Storage Keys:
- `ai_visualizer_claude_api_key`
- `ai_visualizer_gemini_api_key`
- `ai_visualizer_openai_api_key`

#### 4. Live API Calling Logic (✅ Complete)

Enhanced `APIClient.ts` with intelligent routing:

- **Priority System**: 
  1. Try local storage API key first
  2. Fallback to backend proxy
  3. Final fallback to demo mode
  
- **Direct API Calls**: When local key exists, calls API provider directly
- **Test Connection**: Validates API keys before use
- **Error Propagation**: Shows user-friendly error messages
- **Response Processing**: Extracts chain of thought from live responses

#### 5. Comprehensive Error Handling (✅ Complete)

All error scenarios covered:

**API Errors:**
- 401: Invalid API key
- 403: Access forbidden
- 429: Rate limit exceeded
- 500/503: Service unavailable
- Timeout: Request took too long
- Network: Connection issues

**UI Feedback:**
- ✅ Success messages (green)
- ❌ Error messages (red)
- ℹ️ Info messages (blue)
- Auto-dismiss after 5 seconds

**Validation Errors:**
- Empty key detection
- Format validation per platform
- Length checks

#### 6. Updated Documentation (✅ Complete)

Comprehensive README updates with:

- **Two Configuration Options**: Client-side storage vs backend proxy
- **Platform-Specific Guides**:
  - Claude: console.anthropic.com setup
  - Gemini: Google AI Studio setup
  - ChatGPT: OpenAI platform setup
- **Pricing Information**: Cost details for each platform
- **Security Best Practices**: Do's and don'ts
- **Management Features**: Save, test, clear, switch platforms

### 🎨 UI/UX Enhancements

**New UI Components:**
- Collapsible API Key Configuration section
- Model-specific placeholder text
- Real-time status updates
- Animated transitions
- Responsive design for mobile

**Visual Feedback:**
- 🟢 Green dot when API key configured
- ⚪ White dot when no key
- Color-coded API status text
- Masked key display in placeholder

**Styling:**
- Custom CSS for API key section
- Button variants (primary, secondary, danger)
- Message types (success, error, info)
- Smooth animations

### 🔧 Technical Architecture

```
src/
├── services/
│   ├── api/
│   │   ├── APIClient.ts (Enhanced with routing)
│   │   └── providers/
│   │       ├── ClaudeAPIProvider.ts (NEW)
│   │       ├── GeminiAPIProvider.ts (NEW)
│   │       └── OpenAIAPIProvider.ts (NEW)
│   └── storage/
│       └── APIKeyStorage.ts (NEW)
├── ui/
│   └── UIController.ts (Added API key methods)
├── styles/
│   └── main.css (Added API key styles)
└── main.ts (Added API key UI)
```

### 🚀 User Flow

1. **Select Platform**: Click Claude, Gemini, or GPT-4
2. **Configure Key**: 
   - Click API Key Configuration (🔑)
   - Enter API key
   - Click "Save Key"
   - Optionally test the key
3. **Use Live AI**: 
   - Ask questions in the input field
   - Get real-time responses from selected platform
   - View chain of thought visualization
4. **Switch Platforms**: 
   - Select different model
   - Use stored key if available
   - Or enter new key

### 🔐 Security Features

✅ **Implemented:**
- Keys stored in browser local storage only
- Direct API calls to official providers (no intermediary)
- Format validation before storage
- Masked key display in UI
- No keys in URL parameters or console logs
- Per-platform isolation

❌ **Not Exposed:**
- Keys never sent to any server (except official AI APIs)
- No key logging or transmission
- Secure password input fields

### 📊 Testing Results

✅ **All Checks Passed:**
- TypeScript compilation: Success
- Format validation: Working correctly
- Storage persistence: Keys survive page reload
- Platform switching: Smooth transitions
- Error handling: Appropriate messages shown
- Fallback system: Demo mode works when no key

### 🔗 GitHub Integration

**Branch Created**: `feature/multi-platform-api-integration`

**Pull Request**: #1
- Title: "feat: Multi-Platform API Integration with Local Storage"
- Status: Open
- URL: https://github.com/ej777spirit/claude-ai-brain-visualizer/pull/1

**Commit**: 8c01213
- 9 files changed
- 1609 insertions(+)
- 8 deletions(-)
- 4 new files created

### 📝 Files Modified/Created

**New Files (4):**
1. `src/services/api/providers/ClaudeAPIProvider.ts` (287 lines)
2. `src/services/api/providers/GeminiAPIProvider.ts` (223 lines)
3. `src/services/api/providers/OpenAIAPIProvider.ts` (241 lines)
4. `src/services/storage/APIKeyStorage.ts` (172 lines)

**Modified Files (5):**
1. `src/services/api/APIClient.ts` (added provider routing)
2. `src/ui/UIController.ts` (added API key management methods)
3. `src/main.ts` (added API key UI section)
4. `src/styles/main.css` (added API key styles)
5. `README.md` (comprehensive documentation updates)

### 🎯 Requirements Checklist

✅ Create API integration modules for three platforms
✅ Implement UI flow with platform selection
✅ Display platform-specific API key input when selected
✅ Show helpful text about where to get API keys
✅ Store API keys in browser local storage with appropriate names
✅ Retrieve stored keys when platform is selected
✅ Add option to clear/reset stored API keys
✅ Route user queries to appropriate API
✅ Handle API responses and extract chain of thought
✅ Display responses in existing visualization matrix
✅ Add proper error handling for API failures
✅ Add error handling for invalid keys
✅ Add error handling for rate limits
✅ Update README with API key instructions
✅ Push all changes back to repository

### 🌟 Bonus Features Implemented

Beyond the requirements:
- Test API key functionality
- Masked key display for security
- Toggle visibility for password field
- Collapsible configuration section
- Auto-dismiss messages
- Color-coded status indicators
- Responsive mobile design
- Format validation per platform
- Direct links to API key pages
- Export/import functionality (in storage manager)

### 🎓 How to Use

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ej777spirit/claude-ai-brain-visualizer.git
   cd claude-ai-brain-visualizer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

4. **Configure API keys**:
   - Open the application in browser
   - Select your preferred AI platform
   - Click the API Key Configuration section
   - Enter your API key
   - Save and test

5. **Start using live AI**:
   - Ask questions in the input field
   - Get real-time responses with visualization

### 🎬 Next Steps for Users

1. **Review the Pull Request**: https://github.com/ej777spirit/claude-ai-brain-visualizer/pull/1
2. **Merge to main** when ready
3. **Get API keys** from platforms you want to use
4. **Test with real API keys** to see live responses
5. **Provide feedback** on the implementation

### 📚 Additional Notes

- The implementation maintains backward compatibility
- Users without API keys can still use demo mode
- All three platforms can be used simultaneously (stored separately)
- Keys persist across browser sessions
- Easy to add more AI platforms in the future

---

**Implementation completed successfully! 🎉**

All requirements met and exceeded. Ready for production use.
```

---

## Quick Start Guide

### 1. Clone and Install

```bash
git clone https://github.com/ej777spirit/claude-ai-brain-visualizer.git
cd claude-ai-brain-visualizer
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Opens at `http://localhost:5173`

### 3. Configure API Keys

1. Select your AI platform (Claude/Gemini/GPT-4)
2. Click the API Key Configuration section (🔑)
3. Enter your API key from the respective provider
4. Click "Save Key"
5. Test the connection

### 4. Start Visualizing

- Type a question in the input field
- Click "Analyze"
- Watch the 3D thought visualization
- Click nodes to explore them

---

## API Configuration

### Obtaining API Keys

#### 🤖 Claude (Anthropic)
- **URL**: [console.anthropic.com](https://console.anthropic.com/)
- **Format**: `sk-ant-...`
- **Pricing**: Pay-as-you-go, $3 per million tokens

#### 🔮 Gemini (Google AI)
- **URL**: [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Format**: `AIza...`
- **Pricing**: Free tier available, 60 requests/minute

#### 💬 ChatGPT (OpenAI)
- **URL**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **Format**: `sk-...`
- **Pricing**: Pay-as-you-go, $0.03 per 1K tokens for GPT-4o

### Security Best Practices

✅ **DO:**
- Store API keys in browser local storage for personal use
- Use environment variables for production
- Rotate keys regularly
- Monitor usage and billing

❌ **DON'T:**
- Share API keys with others
- Commit keys to version control
- Use same key across multiple projects
- Expose keys in public websites

---

## 📊 Technical Architecture

```
src/
├── main.ts                          # Application entry point
├── types/                          # TypeScript type definitions
├── services/
│   ├── api/
│   │   ├── APIClient.ts           # Main API client with routing
│   │   └── providers/             # Platform-specific providers
│   │       ├── ClaudeAPIProvider.ts
│   │       ├── GeminiAPIProvider.ts
│   │       └── OpenAIAPIProvider.ts
│   ├── state/
│   │   └── StateManager.ts        # Centralized state management
│   └── storage/
│       └── APIKeyStorage.ts       # Secure key storage
├── ui/
│   └── UIController.ts            # DOM manipulation & events
├── visualization/
│   └── VisualizationManager.ts    # Three.js 3D rendering
└── utils/
    └── Accessibility.ts           # WCAG compliance helpers
```

---

## 🎯 Key Features Summary

- ✅ **Multi-Platform AI**: Claude, Gemini, GPT-4
- ✅ **Interactive 3D Visualization**: Click, hover, explore
- ✅ **Matrix Layout**: Auto-switches for 9+ nodes
- ✅ **API Key Management**: Secure local storage
- ✅ **Live API Integration**: Real responses, not simulated
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Testing**: 47 passing tests
- ✅ **Accessibility**: WCAG compliant
- ✅ **Production Ready**: Vercel deployment config
- ✅ **TypeScript**: Fully typed codebase

---

## 📝 License

MIT License - Open source and free to use

---

## 🤝 Contributing

Contributions welcome! Please submit pull requests to the main repository:

[github.com/ej777spirit/claude-ai-brain-visualizer](https://github.com/ej777spirit/claude-ai-brain-visualizer)

---

## 🎬 Live Repository

**Repository**: [github.com/ej777spirit/claude-ai-brain-visualizer](https://github.com/ej777spirit/claude-ai-brain-visualizer)

**Features**: All features are fully implemented and tested. The application works in demo mode without API keys, and switches to live AI responses when keys are configured.

---

**Created with ❤️ for exploring AI thought processes**

🧠 **AI Brain Visualizer Pro** - Making AI reasoning visible and interactive
