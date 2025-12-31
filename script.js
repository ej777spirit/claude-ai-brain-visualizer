// ==========================================
// REFACTORED ARCHITECTURE IMPLEMENTATION
// Complete AI Brain Visualizer with Claude Integration
// 
// FIXES APPLIED:
// 1. Node Y-drift accumulation bug - now oscillates around base position
// 2. Connection lines now update dynamically with node movement
// 3. Memory leak - proper disposal tracking with consistent format
// 4. Animation cancellation support for view changes
// ==========================================

/**
 * Configuration
 */
const CONFIG = {
  THOUGHT_CATEGORIES: {
    analysis: { color: 0x64ffda, name: 'Analysis' },
    synthesis: { color: 0xf5a742, name: 'Synthesis' },
    recall: { color: 0xa78bfa, name: 'Recall' },
    evaluation: { color: 0xfb7185, name: 'Evaluation' }
  },
  MODELS: {
    claude: { name: 'Claude 3', provider: 'anthropic' },
    gemini: { name: 'Gemini Pro', provider: 'google' },
    gpt: { name: 'GPT-4', provider: 'openai' }
  }
};

/**
 * State Manager - Centralized state management
 */
class StateManager {
  constructor(initialState) {
    this.state = { ...initialState };
    this.listeners = new Set();
    this.history = [];
  }

  getState() {
    return { ...this.state };
  }

  setState(updates) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...updates };
    this.history.push(prevState);
    if (this.history.length > 20) this.history.shift();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.getState()));
  }

  undo() {
    if (this.history.length > 0) {
      this.state = this.history.pop();
      this.notify();
    }
  }
}

/**
 * AI API Simulator (would be replaced with real API proxy in production)
 */
class AIAPISimulator {
  async generateResponse(prompt, model) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const thoughts = this.generateThoughts(prompt, model);
        const response = this.generateContextualResponse(prompt, model);

        resolve({
          response,
          thoughts,
          model: CONFIG.MODELS[model].name,
          confidence: Math.floor(Math.random() * 20) + 80
        });
      }, 1500);
    });
  }

  generateThoughts(prompt, model) {
    const thoughts = [];
    const categories = Object.keys(CONFIG.THOUGHT_CATEGORIES);
    const numThoughts = 8 + Math.floor(Math.random() * 7);

    for (let i = 0; i < numThoughts; i++) {
      thoughts.push({
        id: i + 1,
        parent: i > 0 && Math.random() > 0.4 ? Math.floor(Math.random() * i) + 1 : null,
        text: `${model === 'claude' ? 'Claude analyzes' : model === 'gemini' ? 'Gemini processes' : 'GPT evaluates'}: ${this.getThoughtText(prompt, i)}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        weight: Math.floor(Math.random() * 40) + 60
      });
    }

    return thoughts;
  }

  getThoughtText(prompt, index) {
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

  generateContextualResponse(prompt, model) {
    const responses = {
      claude: `As Claude, I've analyzed your query "${prompt}" through multiple cognitive pathways. The visualization shows my thought process involving contextual understanding, pattern recognition, and logical synthesis. Each node represents a concept or reasoning step, with connections showing how ideas relate and build upon each other.`,
      gemini: `Through Gemini's advanced processing, I've examined "${prompt}" using parallel analysis streams. The 3D visualization demonstrates how I connect different knowledge domains, evaluate multiple perspectives, and synthesize information into a coherent response.`,
      gpt: `GPT-4's analysis of "${prompt}" involves deep transformer-based reasoning. The thought graph illustrates how attention mechanisms focus on relevant concepts, building layers of understanding that culminate in this comprehensive response.`
    };
    return responses[model] || responses.claude;
  }
}

/**
 * Visualization Manager - Three.js scene management
 * 
 * FIXES APPLIED:
 * 1. Node Y-drift - stores originalY and oscillates around it
 * 2. Connection lines - dynamically update with node movement
 * 3. Memory leak - consistent disposal tracking
 * 4. Animation cancellation - prevents overlapping animations
 */
class VisualizationManager {
  constructor(canvas) {
    this.canvas = document.getElementById(canvas);
    this.nodes = [];
    this.lines = [];
    this.disposables = [];
    
    // FIX #2: Track connection data for dynamic updates
    this.connectionData = [];
    
    // FIX #4: Track active position animations
    this.activeAnimations = new Map();
    
    this.init();
  }

  init() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a192f);
    this.scene.fog = new THREE.Fog(0x0a192f, 50, 200);

    // Camera
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    this.camera.position.set(0, 0, 50);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Controls
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 100;
    this.controls.minDistance = 10;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x64ffda, 0.5, 100);
    pointLight.position.set(0, 20, 0);
    this.scene.add(pointLight);

    // Central sphere
    const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
    const sphereMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x64ffda,
      metalness: 0.7,
      roughness: 0.2,
      opacity: 0.3,
      transparent: true
    });
    this.centralSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    this.scene.add(this.centralSphere);
    // FIX #3: Consistent disposal tracking format
    this.disposables.push({ geometry: sphereGeometry, material: sphereMaterial });

    // Handle resize
    window.addEventListener('resize', () => this.handleResize());

    this.animate();
  }

  createVisualization(thoughts) {
    this.clearScene();
    const nodeMap = new Map();

    // Create nodes
    thoughts.forEach(thought => {
      const node = this.createNode(thought);
      nodeMap.set(thought.id, node);
      this.nodes.push(node);
    });

    // Create connections with tracking data
    thoughts.forEach(thought => {
      if (thought.parent && nodeMap.has(thought.parent)) {
        const parentNode = nodeMap.get(thought.parent);
        const childNode = nodeMap.get(thought.id);
        this.createConnection(parentNode, childNode, thought.parent, thought.id);
      }
    });
  }

  createNode(thought) {
    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: CONFIG.THOUGHT_CATEGORIES[thought.category].color,
      opacity: 0.8,
      transparent: true
    });

    const node = new THREE.Mesh(geometry, material);
    node.userData = thought;

    // Position based on parent
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 20;
    const height = (Math.random() - 0.5) * 20;

    node.position.set(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    );

    // FIX #1: Store original Y position for oscillation
    node.userData.originalY = height;

    const scale = 0.5 + (thought.weight / 100) * 0.5;
    node.scale.setScalar(scale);

    this.scene.add(node);
    // FIX #3: Consistent disposal tracking format
    this.disposables.push({ geometry, material });

    return node;
  }

  // FIX #2: Create connection with tracking for dynamic updates
  createConnection(node1, node2, fromId, toId) {
    const points = [node1.position.clone(), node2.position.clone()];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x2a4470,
      opacity: 0.5,
      transparent: true
    });

    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    this.lines.push(line);
    
    // FIX #2: Store connection data for dynamic updates
    this.connectionData.push({
      line,
      fromId,
      toId
    });
    
    // FIX #3: Consistent disposal tracking format
    this.disposables.push({ geometry, material });
  }

  // FIX #2: Update connection line positions
  updateConnectionPositions() {
    const nodeMap = new Map();
    this.nodes.forEach(node => {
      nodeMap.set(node.userData.id, node);
    });

    this.connectionData.forEach(conn => {
      const fromNode = nodeMap.get(conn.fromId);
      const toNode = nodeMap.get(conn.toId);
      
      if (fromNode && toNode && conn.line.geometry) {
        const positions = conn.line.geometry.attributes.position;
        if (positions) {
          const posArray = positions.array;
          
          // Update start point
          posArray[0] = fromNode.position.x;
          posArray[1] = fromNode.position.y;
          posArray[2] = fromNode.position.z;
          
          // Update end point
          posArray[3] = toNode.position.x;
          posArray[4] = toNode.position.y;
          posArray[5] = toNode.position.z;
          
          positions.needsUpdate = true;
        }
      }
    });
  }

  clearScene() {
    // FIX #4: Cancel all active animations
    this.activeAnimations.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
    this.activeAnimations.clear();

    // Remove nodes and lines
    this.nodes.forEach(node => this.scene.remove(node));
    this.lines.forEach(line => this.scene.remove(line));

    // FIX #3: Dispose of geometries and materials consistently
    this.disposables.forEach(({ geometry, material }) => {
      if (geometry && typeof geometry.dispose === 'function') geometry.dispose();
      if (material && typeof material.dispose === 'function') material.dispose();
    });

    this.nodes = [];
    this.lines = [];
    this.connectionData = [];
    this.disposables = [];
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const time = Date.now() * 0.001;

    // Animate central sphere
    if (this.centralSphere) {
      this.centralSphere.rotation.x += 0.001;
      this.centralSphere.rotation.y += 0.002;
    }

    // FIX #1: Animate nodes with oscillation around base position (not accumulating)
    this.nodes.forEach((node, i) => {
      // Get the stored original Y position, or use current position as fallback
      const baseY = node.userData.originalY !== undefined ? node.userData.originalY : node.position.y;
      
      // Oscillate around base position instead of adding to current position
      node.position.y = baseY + Math.sin(time + i * 0.1) * 0.3;
      node.rotation.y += 0.005;
    });

    // FIX #2: Update connection lines to follow node positions
    this.updateConnectionPositions();

    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  // FIX #4: Animate node to position with cancellation support
  animateNodeToPosition(node, target, duration = 500) {
    const nodeUuid = node.uuid;
    
    // Cancel existing animation for this node
    if (this.activeAnimations.has(nodeUuid)) {
      cancelAnimationFrame(this.activeAnimations.get(nodeUuid));
      this.activeAnimations.delete(nodeUuid);
    }

    const start = {
      x: node.position.x,
      y: node.position.y,
      z: node.position.z
    };
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      node.position.x = start.x + (target.x - start.x) * eased;
      node.position.y = start.y + (target.y - start.y) * eased;
      node.position.z = start.z + (target.z - start.z) * eased;

      if (progress < 1) {
        const frameId = requestAnimationFrame(animate);
        this.activeAnimations.set(nodeUuid, frameId);
      } else {
        this.activeAnimations.delete(nodeUuid);
        // FIX #1: Update base position after animation completes
        node.userData.originalY = target.y;
      }
    };

    const frameId = requestAnimationFrame(animate);
    this.activeAnimations.set(nodeUuid, frameId);
  }

  handleResize() {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  getMemoryUsage() {
    // Simplified memory estimation
    return (this.nodes.length * 0.1 + this.lines.length * 0.05).toFixed(1);
  }
}

/**
 * Application Controller
 */
class ApplicationController {
  constructor() {
    this.initializeModules();
    this.setupEventListeners();
    this.startPerformanceMonitoring();
  }

  initializeModules() {
    // Initialize state
    this.state = new StateManager({
      currentModel: 'claude',
      isProcessing: false,
      thoughts: [],
      response: null
    });

    // Initialize modules
    this.api = new AIAPISimulator();
    this.visualization = new VisualizationManager('brain-canvas');

    // Show ready status
    this.updateStatus('Ready to analyze', 'ready');
    document.getElementById('apiStatusDot').classList.add('connected');
  }

  setupEventListeners() {
    // Model selection
    document.querySelectorAll('.model-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.model-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.setState({ currentModel: btn.dataset.model });
        this.appendMessage(`Switched to ${CONFIG.MODELS[btn.dataset.model].name}`, 'system');
      });
    });

    // Send button
    document.getElementById('sendButton').addEventListener('click', () => this.processQuery());

    // Enter key
    document.getElementById('userInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.processQuery();
    });

    // Control buttons
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    document.getElementById('saveBtn').addEventListener('click', () => this.saveSession());
    document.getElementById('loadBtn').addEventListener('click', () => this.loadSession());
    document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
  }

  async processQuery() {
    const input = document.getElementById('userInput');
    const query = input.value.trim();

    if (!query || this.state.getState().isProcessing) return;

    this.state.setState({ isProcessing: true });
    this.updateStatus('AI is thinking...', 'thinking');

    // Add user message
    this.appendMessage(query, 'user');
    input.value = '';

    // Disable send button
    document.getElementById('sendButton').disabled = true;

    try {
      // Get AI response
      const result = await this.api.generateResponse(query, this.state.getState().currentModel);

      // Add AI response
      this.appendMessage(result.response, 'ai');

      // Update visualization
      this.visualization.createVisualization(result.thoughts);

      // Update response panel
      document.getElementById('responseContent').innerHTML = `
        <div style="margin-bottom: 10px; color: var(--primary-accent); font-weight: 600;">
          ${result.model} Analysis (${result.confidence}% confidence)
        </div>
        <div>${result.response}</div>
      `;

      // Update stats
      this.updateStats(result.thoughts);

      // Enable controls
      document.getElementById('saveBtn').disabled = false;
      document.getElementById('exportBtn').disabled = false;

      this.state.setState({
        isProcessing: false,
        thoughts: result.thoughts,
        response: result
      });

    } catch (error) {
      console.error('Processing error:', error);
      this.appendMessage('Error processing request', 'system');
    } finally {
      this.updateStatus('Ready to analyze', 'ready');
      document.getElementById('sendButton').disabled = false;
    }
  }

  updateStats(thoughts) {
    document.getElementById('totalNodes').textContent = thoughts.length;
    document.getElementById('activeNodes').textContent = thoughts.length;

    const avgWeight = Math.round(thoughts.reduce((sum, t) => sum + t.weight, 0) / thoughts.length);
    document.getElementById('avgWeight').textContent = avgWeight + '%';

    // Calculate max depth
    let maxDepth = 0;
    thoughts.forEach(t => {
      let depth = 0;
      let current = t;
      while (current.parent) {
        depth++;
        current = thoughts.find(th => th.id === current.parent);
        if (!current) break;
      }
      maxDepth = Math.max(maxDepth, depth);
    });
    document.getElementById('maxDepth').textContent = maxDepth;

    // Category breakdown
    const categories = {};
    thoughts.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + 1;
    });

    const breakdown = Object.entries(categories)
      .map(([cat, count]) => `${CONFIG.THOUGHT_CATEGORIES[cat].name}: ${count}`)
      .join(' • ');
    document.getElementById('categoryBreakdown').textContent = breakdown || 'No thoughts';
  }

  appendMessage(text, type) {
    const container = document.getElementById('chatContainer');
    const message = document.createElement('div');
    message.className = `message ${type}-message`;
    message.textContent = text;
    container.appendChild(message);
    container.scrollTop = container.scrollHeight;
  }

  updateStatus(text, status) {
    document.getElementById('statusText').textContent = text;
    const dot = document.getElementById('statusDot');
    dot.className = `status-dot ${status}`;
  }

  reset() {
    this.visualization.clearScene();
    document.getElementById('responseContent').innerHTML = `
      <p class="response-placeholder">
        Enter a question to see the AI's thought process visualized in 3D.
      </p>
    `;
    this.updateStats([]);
    document.getElementById('saveBtn').disabled = true;
    document.getElementById('exportBtn').disabled = true;
    this.appendMessage('Visualization reset', 'system');
  }

  saveSession() {
    const session = {
      timestamp: Date.now(),
      model: this.state.getState().currentModel,
      thoughts: this.state.getState().thoughts,
      response: this.state.getState().response
    };

    localStorage.setItem('ai_visualizer_session', JSON.stringify(session));
    this.appendMessage('Session saved', 'system');
  }

  loadSession() {
    const saved = localStorage.getItem('ai_visualizer_session');
    if (saved) {
      const session = JSON.parse(saved);
      this.visualization.createVisualization(session.thoughts);
      this.updateStats(session.thoughts);
      this.appendMessage('Session loaded', 'system');
    }
  }

  exportData() {
    const data = {
      timestamp: new Date().toISOString(),
      model: this.state.getState().currentModel,
      thoughts: this.state.getState().thoughts,
      response: this.state.getState().response
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-visualization-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.appendMessage('Data exported', 'system');
  }

  startPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();

    const updateMetrics = () => {
      frameCount++;
      const currentTime = performance.now();

      if (currentTime - lastTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (currentTime - lastTime));
        document.getElementById('fps').textContent = fps;
        document.getElementById('nodeCount').textContent = this.visualization.nodes.length;
        document.getElementById('memUsage').textContent = this.visualization.getMemoryUsage();

        frameCount = 0;
        lastTime = currentTime;
      }

      requestAnimationFrame(updateMetrics);
    };

    updateMetrics();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const loadingOverlay = document.getElementById('loadingOverlay');
  loadingOverlay.classList.add('active');

  setTimeout(() => {
    const app = new ApplicationController();
    loadingOverlay.classList.remove('active');
    console.log('AI Brain Visualizer Pro - Claude Integration initialized (with bug fixes)');

    // Announce to screen readers
    const announcer = document.getElementById('sr-announcer');
    announcer.textContent = 'Application ready. Enter a question to begin.';
  }, 500);
});
