/**
 * Visualization Manager - Three.js scene management and 3D rendering
 * @module visualization/VisualizationManager
 * 
 * FEATURES:
 * 1. True chain-of-thought visualization with sequential node revelation
 * 2. Text labels on nodes showing thought content
 * 3. Linear chain structure with animated connections
 * 4. Incremental node addition for streaming support
 * 5. Visibility-aware animation loop
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { IVisualizationManager, ThoughtNode } from '../types';
import { CONFIG } from '../types';
import { debounce, AnimationController } from '../utils/Performance';

interface ConnectionData {
  line: THREE.Line;
  fromNodeId: number;
  toNodeId: number;
}

interface NodeData {
  mesh: THREE.Mesh;
  label: CSS2DObject;
  thought: ThoughtNode;
}

export class VisualizationManager implements IVisualizationManager {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private labelRenderer: CSS2DRenderer | null = null;
  private controls: OrbitControls | null = null;

  private nodes: THREE.Mesh[] = [];
  private nodeDataMap: Map<number, NodeData> = new Map();
  private lines: THREE.Line[] = [];
  private connectionData: ConnectionData[] = [];
  private disposables: Set<{ dispose: () => void }> = new Set();
  private centralSphere: THREE.Mesh | null = null;

  private animationController: AnimationController | null = null;
  private isInitialized = false;
  
  // Chain of thought state
  private chainPosition = 0;
  private readonly CHAIN_SPACING = 8;
  private readonly CHAIN_CURVE_AMPLITUDE = 3;
  
  // Track active position animations
  private activeAnimations: Map<string, number> = new Map();

  // Debounced resize handler
  private debouncedResize: () => void;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }
    
    // Create debounced resize handler (150ms delay)
    this.debouncedResize = debounce(() => this.handleResize(), 150);
  }

  /**
   * Initialize the Three.js scene
   */
  initialize(): void {
    if (this.isInitialized) return;

    this.setupScene();
    this.setupCamera();
    this.setupRenderer();
    this.setupLabelRenderer();
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
    this.scene.fog = new THREE.Fog(0x0a192f, 80, 250);
  }

  /**
   * Setup camera
   */
  private setupCamera(): void {
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.camera.position.set(0, 15, 50);
    this.camera.lookAt(0, 0, 0);
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
   * Setup CSS2D renderer for text labels
   */
  private setupLabelRenderer(): void {
    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.labelRenderer.domElement.style.position = 'absolute';
    this.labelRenderer.domElement.style.top = '0';
    this.labelRenderer.domElement.style.left = '0';
    this.labelRenderer.domElement.style.pointerEvents = 'none';
    
    // Insert label renderer after canvas
    this.canvas.parentElement?.appendChild(this.labelRenderer.domElement);
  }

  /**
   * Setup orbit controls
   */
  private setupControls(): void {
    if (!this.camera || !this.renderer) return;
    
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 150;
    this.controls.minDistance = 20;
    this.controls.enablePan = true;
    this.controls.enableZoom = true;
    this.controls.enableRotate = true;
  }

  /**
   * Setup scene lighting
   */
  private setupLighting(): void {
    if (!this.scene) return;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);
    this.disposables.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
    this.disposables.add(directionalLight);

    // Point light following chain
    const pointLight = new THREE.PointLight(0x64ffda, 0.6, 100);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);
    this.disposables.add(pointLight);
  }

  /**
   * Create central "brain" sphere as starting point
   */
  private createCentralSphere(): void {
    if (!this.scene) return;

    const geometry = new THREE.SphereGeometry(2.5, 32, 32);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x64ffda,
      metalness: 0.3,
      roughness: 0.4,
      opacity: 0.6,
      transparent: true,
      emissive: 0x64ffda,
      emissiveIntensity: 0.2
    });

    this.centralSphere = new THREE.Mesh(geometry, material);
    this.centralSphere.position.set(0, 0, 0);
    this.scene.add(this.centralSphere);

    // Add "Start" label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'thought-label thought-label-start';
    labelDiv.textContent = '🧠 Input';
    labelDiv.style.cssText = `
      color: #64ffda;
      font-size: 14px;
      font-weight: bold;
      background: rgba(10, 25, 47, 0.9);
      padding: 4px 12px;
      border-radius: 12px;
      border: 1px solid #64ffda;
      white-space: nowrap;
    `;
    
    const label = new CSS2DObject(labelDiv);
    label.position.set(0, 4, 0);
    this.centralSphere.add(label);

    this.disposables.add(geometry);
    this.disposables.add(material);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', this.debouncedResize);
  }

  /**
   * Create full visualization from thought nodes (batch mode)
   */
  createVisualization(thoughts: ThoughtNode[]): void {
    this.clearScene();
    this.chainPosition = 0;

    // Add thoughts sequentially with delay for animation effect
    thoughts.forEach((thought, index) => {
      setTimeout(() => {
        this.addThoughtToChain(thought);
      }, index * 300); // 300ms delay between each thought
    });
  }

  /**
   * Add a single thought to the chain (for streaming/incremental updates)
   */
  addThoughtToChain(thought: ThoughtNode): void {
    if (!this.scene) return;

    this.chainPosition++;
    
    // Calculate position along a gentle curve
    const position = this.calculateChainPosition(this.chainPosition);
    
    // Create the thought node
    const nodeData = this.createThoughtNode(thought, position);
    this.nodeDataMap.set(thought.id, nodeData);
    this.nodes.push(nodeData.mesh);

    // Connect to previous node
    if (this.chainPosition > 1) {
      const prevThought = this.nodes[this.nodes.length - 2];
      if (prevThought) {
        this.createAnimatedConnection(prevThought, nodeData.mesh);
      }
    } else {
      // First thought - connect to central sphere
      if (this.centralSphere) {
        this.createAnimatedConnection(this.centralSphere, nodeData.mesh);
      }
    }

    // Animate node appearance
    this.animateNodeAppearance(nodeData.mesh);

    // Update camera to follow chain
    this.updateCameraToFollowChain(position);
  }

  /**
   * Calculate position along a curved chain path
   */
  private calculateChainPosition(index: number): THREE.Vector3 {
    // Create a gentle S-curve path
    const x = index * this.CHAIN_SPACING;
    const y = Math.sin(index * 0.5) * this.CHAIN_CURVE_AMPLITUDE;
    const z = Math.cos(index * 0.3) * this.CHAIN_CURVE_AMPLITUDE * 0.5;
    
    return new THREE.Vector3(x, y, z);
  }

  /**
   * Create a thought node with label
   */
  private createThoughtNode(thought: ThoughtNode, position: THREE.Vector3): NodeData {
    if (!this.scene) throw new Error('Scene not initialized');

    // Create sphere geometry
    const geometry = new THREE.SphereGeometry(1.2, 24, 24);
    const color = CONFIG.THOUGHT_CATEGORIES[thought.category].color;
    const material = new THREE.MeshPhongMaterial({
      color: color,
      opacity: 0.9,
      transparent: true,
      emissive: color,
      emissiveIntensity: 0.15
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.scale.setScalar(0.01); // Start small for animation
    mesh.userData = { ...thought, originalY: position.y };

    // Create text label
    const labelDiv = document.createElement('div');
    labelDiv.className = `thought-label thought-label-${thought.category}`;
    
    // Truncate text for display
    const displayText = thought.text.length > 60 
      ? thought.text.substring(0, 57) + '...' 
      : thought.text;
    
    labelDiv.innerHTML = `
      <div class="thought-number">#${thought.id}</div>
      <div class="thought-text">${displayText}</div>
      <div class="thought-meta">${thought.category} · ${thought.weight}%</div>
    `;
    
    labelDiv.style.cssText = `
      color: #e6f1ff;
      font-size: 11px;
      background: rgba(10, 25, 47, 0.95);
      padding: 8px 12px;
      border-radius: 8px;
      border-left: 3px solid #${color.toString(16).padStart(6, '0')};
      max-width: 200px;
      backdrop-filter: blur(4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    // Style inner elements
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .thought-label .thought-number {
        color: #64ffda;
        font-weight: bold;
        font-size: 10px;
        margin-bottom: 4px;
      }
      .thought-label .thought-text {
        line-height: 1.4;
        margin-bottom: 4px;
      }
      .thought-label .thought-meta {
        color: #8892b0;
        font-size: 9px;
        text-transform: capitalize;
      }
    `;
    if (!document.querySelector('#thought-label-styles')) {
      styleEl.id = 'thought-label-styles';
      document.head.appendChild(styleEl);
    }

    const label = new CSS2DObject(labelDiv);
    label.position.set(0, 2.5, 0);
    mesh.add(label);

    // Add to scene
    this.scene.add(mesh);

    // Track for disposal
    this.disposables.add(geometry);
    this.disposables.add(material);

    return { mesh, label, thought };
  }

  /**
   * Create animated connection line between nodes
   */
  private createAnimatedConnection(fromNode: THREE.Mesh, toNode: THREE.Mesh): void {
    if (!this.scene) return;

    // Create curved line using QuadraticBezierCurve3
    const start = fromNode.position.clone();
    const end = toNode.position.clone();
    
    // Control point for curve (slightly above midpoint)
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y += 2;

    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(20);
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // Gradient material using vertex colors
    const colors: number[] = [];
    const startColor = new THREE.Color(0x64ffda);
    const endColor = new THREE.Color(0xa78bfa);
    
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const color = startColor.clone().lerp(endColor, t);
      colors.push(color.r, color.g, color.b);
    }
    
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    const material = new THREE.LineBasicMaterial({
      vertexColors: true,
      opacity: 0.7,
      transparent: true,
      linewidth: 2
    });

    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    this.lines.push(line);

    // Animate line drawing
    this.animateLineDrawing(line, geometry);

    this.disposables.add(geometry);
    this.disposables.add(material);
  }

  /**
   * Animate line being drawn
   */
  private animateLineDrawing(_line: THREE.Line, geometry: THREE.BufferGeometry): void {
    const positions = geometry.attributes.position;
    const totalPoints = positions.count;
    
    // Store original positions
    const originalPositions = new Float32Array(positions.array);
    
    // Start with all points at the first position
    for (let i = 0; i < totalPoints; i++) {
      positions.setXYZ(i, originalPositions[0], originalPositions[1], originalPositions[2]);
    }
    positions.needsUpdate = true;

    // Animate revealing points
    let currentPoint = 0;
    const animateStep = () => {
      if (currentPoint >= totalPoints) return;
      
      const idx = currentPoint * 3;
      positions.setXYZ(currentPoint, originalPositions[idx], originalPositions[idx + 1], originalPositions[idx + 2]);
      positions.needsUpdate = true;
      
      currentPoint++;
      requestAnimationFrame(animateStep);
    };
    
    animateStep();
  }

  /**
   * Animate node appearing (scale up)
   */
  private animateNodeAppearance(node: THREE.Mesh): void {
    const targetScale = 1;
    const duration = 400;
    const startTime = Date.now();
    const startScale = 0.01;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Elastic ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const overshoot = progress < 1 ? Math.sin(progress * Math.PI) * 0.1 : 0;
      
      const scale = startScale + (targetScale - startScale) * eased + overshoot;
      node.scale.setScalar(scale);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }

  /**
   * Update camera to follow the chain
   */
  private updateCameraToFollowChain(targetPosition: THREE.Vector3): void {
    if (!this.camera || !this.controls) return;

    const targetLookAt = targetPosition.clone();
    const targetCameraPos = new THREE.Vector3(
      targetPosition.x - 10,
      targetPosition.y + 15,
      targetPosition.z + 40
    );

    // Smooth camera transition
    const duration = 800;
    const startTime = Date.now();
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();

    const animateCamera = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      this.camera!.position.lerpVectors(startPos, targetCameraPos, eased);
      this.controls!.target.lerpVectors(startTarget, targetLookAt, eased);
      this.controls!.update();

      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };

    animateCamera();
  }

  /**
   * Clear all nodes and connections
   */
  clearScene(): void {
    if (!this.scene) return;

    // Cancel all active animations
    this.activeAnimations.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
    this.activeAnimations.clear();

    // Remove nodes and their labels
    this.nodes.forEach(node => {
      // Remove CSS2D labels
      node.children.forEach(child => {
        if (child instanceof CSS2DObject) {
          child.element.remove();
        }
      });
      this.scene!.remove(node);
    });

    // Remove lines
    this.lines.forEach(line => {
      this.scene!.remove(line);
    });

    // Dispose all tracked resources
    this.disposables.forEach(disposable => {
      if (disposable && typeof disposable.dispose === 'function') {
        disposable.dispose();
      }
    });

    this.nodes = [];
    this.lines = [];
    this.connectionData = [];
    this.nodeDataMap.clear();
    this.disposables.clear();
    this.chainPosition = 0;
    
    // Re-create central sphere and lighting
    this.setupLighting();
    this.createCentralSphere();

    // Reset camera
    if (this.camera && this.controls) {
      this.camera.position.set(0, 15, 50);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    if (!this.camera || !this.renderer || !this.labelRenderer || !this.canvas) return;

    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.labelRenderer.setSize(width, height);
  }

  /**
   * Start animation loop
   */
  private startAnimation(): void {
    this.animationController = new AnimationController();
    
    this.animationController.start((_deltaTime) => {
      this.updateAnimation();
      this.controls?.update();
      this.renderer?.render(this.scene!, this.camera!);
      this.labelRenderer?.render(this.scene!, this.camera!);
    });
  }

  /**
   * Update animation frame
   */
  private updateAnimation(): void {
    const time = Date.now() * 0.001;

    // Animate central sphere
    if (this.centralSphere) {
      this.centralSphere.rotation.y += 0.005;
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      this.centralSphere.scale.setScalar(pulse);
    }

    // Subtle node animation
    this.nodes.forEach((node, i) => {
      const baseY = node.userData.originalY ?? node.position.y;
      node.position.y = baseY + Math.sin(time * 1.5 + i * 0.3) * 0.15;
      node.rotation.y += 0.002;
    });
  }

  /**
   * Update a specific node
   */
  updateNode(nodeId: number, updates: Partial<ThoughtNode>): void {
    const nodeData = this.nodeDataMap.get(nodeId);
    if (!nodeData) return;

    const { mesh } = nodeData;
    Object.assign(mesh.userData, updates);

    if (updates.category !== undefined) {
      const material = mesh.material as THREE.MeshPhongMaterial;
      material.color.setHex(CONFIG.THOUGHT_CATEGORIES[updates.category].color);
    }
  }

  /**
   * Get current chain length
   */
  getChainLength(): number {
    return this.chainPosition;
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.connectionData.length;
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    if (this.animationController) {
      this.animationController.dispose();
      this.animationController = null;
    }

    this.activeAnimations.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
    this.activeAnimations.clear();

    window.removeEventListener('resize', this.debouncedResize);

    // Remove label renderer
    if (this.labelRenderer) {
      this.labelRenderer.domElement.remove();
    }

    this.clearScene();

    if (this.controls) {
      this.controls.dispose();
    }

    if (this.renderer) {
      this.renderer.dispose();
    }

    this.isInitialized = false;
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): number {
    return (this.nodes.length * 0.15 + this.lines.length * 0.05);
  }
}
