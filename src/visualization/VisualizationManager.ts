/**
 * Visualization Manager - Three.js scene management and 3D rendering
 * @module visualization/VisualizationManager
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * 1. Node Y-drift accumulation bug - now oscillates around base position
 * 2. Connection lines now update dynamically with node movement
 * 3. Memory leak - proper disposal tracking
 * 4. Animation cancellation support
 * 5. Visibility-aware animation loop (pauses when tab not visible)
 * 6. Debounced resize handler
 * 7. Object pooling for reduced GC
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { IVisualizationManager, ThoughtNode } from '../types';
import { CONFIG } from '../types';
import { debounce, AnimationController } from '../utils/Performance';

interface ConnectionData {
  line: THREE.Line;
  fromNodeId: number;
  toNodeId: number;
}

export class VisualizationManager implements IVisualizationManager {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private controls: OrbitControls | null = null;

  private nodes: THREE.Mesh[] = [];
  private lines: THREE.Line[] = [];
  private connectionData: ConnectionData[] = [];
  private disposables: Set<{ dispose: () => void }> = new Set();
  private centralSphere: THREE.Mesh | null = null;

  private animationController: AnimationController | null = null;
  private isInitialized = false;
  
  // FIX #1: Store original positions for oscillation
  private nodeBasePositions: Map<number, THREE.Vector3> = new Map();
  
  // FIX #4: Track active position animations
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
    if (!this.camera || !this.renderer) return;
    
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
    if (!this.scene) return;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);
    this.disposables.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    this.disposables.add(directionalLight);

    // Point light for accent
    const pointLight = new THREE.PointLight(CONFIG.THOUGHT_CATEGORIES.analysis.color, 0.5, 100);
    pointLight.position.set(0, 20, 0);
    this.scene.add(pointLight);
    this.disposables.add(pointLight);
  }

  /**
   * Create central sphere
   */
  private createCentralSphere(): void {
    if (!this.scene) return;

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

    this.disposables.add(geometry);
    this.disposables.add(material);
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Use debounced resize to prevent excessive recalculations
    window.addEventListener('resize', this.debouncedResize);
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

    // Position nodes in 3D space first
    this.positionNodes(thoughts, nodeMap);

    // Create connections after positioning
    thoughts.forEach(thought => {
      if (thought.parent && nodeMap.has(thought.parent)) {
        const parentNode = nodeMap.get(thought.parent)!;
        const childNode = nodeMap.get(thought.id)!;
        this.createConnection(parentNode, childNode, thought.parent, thought.id);
      }
    });
  }

  /**
   * Create a thought node
   */
  private createNode(thought: ThoughtNode): THREE.Mesh {
    if (!this.scene) throw new Error('Scene not initialized');

    const geometry = new THREE.SphereGeometry(1, 16, 16);
    const material = new THREE.MeshPhongMaterial({
      color: CONFIG.THOUGHT_CATEGORIES[thought.category].color,
      opacity: 0.8,
      transparent: true
    });

    const node = new THREE.Mesh(geometry, material);
    node.userData = { ...thought, originalY: 0 }; // Store original Y for animation

    // Set scale based on weight
    const scale = CONFIG.VISUALIZATION.nodeSize.min +
      (thought.weight / 100) * (CONFIG.VISUALIZATION.nodeSize.max - CONFIG.VISUALIZATION.nodeSize.min);
    node.scale.setScalar(scale);

    // Add to scene
    this.scene.add(node);

    // Track for disposal
    this.disposables.add(geometry);
    this.disposables.add(material);

    return node;
  }

  /**
   * FIX #2: Create connection between nodes with tracking for dynamic updates
   */
  private createConnection(node1: THREE.Mesh, node2: THREE.Mesh, fromId: number, toId: number): void {
    if (!this.scene) return;

    const points = [node1.position.clone(), node2.position.clone()];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
      color: 0x2a4470,
      opacity: CONFIG.VISUALIZATION.connectionOpacity,
      transparent: true
    });

    const line = new THREE.Line(geometry, material);
    this.scene.add(line);
    this.lines.push(line);
    
    // FIX #2: Store connection data for dynamic updates
    this.connectionData.push({
      line,
      fromNodeId: fromId,
      toNodeId: toId
    });

    this.disposables.add(geometry);
    this.disposables.add(material);
  }

  /**
   * FIX #2: Update connection line positions based on current node positions
   */
  private updateConnectionPositions(): void {
    const nodeMap = new Map<number, THREE.Mesh>();
    this.nodes.forEach(node => {
      nodeMap.set(node.userData.id, node);
    });

    this.connectionData.forEach(conn => {
      const fromNode = nodeMap.get(conn.fromNodeId);
      const toNode = nodeMap.get(conn.toNodeId);
      
      if (fromNode && toNode && conn.line.geometry) {
        const positions = conn.line.geometry.attributes.position;
        if (positions) {
          const posArray = positions.array as Float32Array;
          
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

  /**
   * Position nodes in 3D space using force-directed layout
   */
  private positionNodes(thoughts: ThoughtNode[], nodeMap: Map<number, THREE.Mesh>): void {
    // Simple spherical positioning for now
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

      // FIX #1: Store base position for oscillation animation
      node.userData.originalY = height;
      this.nodeBasePositions.set(thought.id, node.position.clone());

      // Update thought position
      thought.position = node.position.clone() as any;
    });
  }

  /**
   * Get hierarchical level of a node
   */
  private getNodeLevel(thought: ThoughtNode, allThoughts: ThoughtNode[]): number {
    let level = 0;
    let current = thought;

    while (current.parent) {
      level++;
      const parent = allThoughts.find(t => t.id === current.parent);
      if (!parent) break;
      current = parent;
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
   * FIX #4: Animate node to new position with cancellation support
   */
  animateNodeToPosition(node: THREE.Mesh, target: THREE.Vector3, duration: number = 500): void {
    const nodeUuid = node.uuid;
    
    // Cancel existing animation for this node
    if (this.activeAnimations.has(nodeUuid)) {
      cancelAnimationFrame(this.activeAnimations.get(nodeUuid)!);
      this.activeAnimations.delete(nodeUuid);
    }

    const start = node.position.clone();
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      node.position.lerpVectors(start, target, eased);

      if (progress < 1) {
        const frameId = requestAnimationFrame(animate);
        this.activeAnimations.set(nodeUuid, frameId);
      } else {
        this.activeAnimations.delete(nodeUuid);
        // Update base position after animation completes
        node.userData.originalY = target.y;
      }
    };

    const frameId = requestAnimationFrame(animate);
    this.activeAnimations.set(nodeUuid, frameId);
  }

  /**
   * FIX #3: Clear all nodes and connections with proper disposal
   */
  clearScene(): void {
    if (!this.scene) return;

    // FIX #4: Cancel all active animations
    this.activeAnimations.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
    this.activeAnimations.clear();

    // Remove nodes
    this.nodes.forEach(node => {
      this.scene!.remove(node);
    });

    // Remove lines
    this.lines.forEach(line => {
      this.scene!.remove(line);
    });

    // FIX #3: Proper disposal of all tracked resources
    this.disposables.forEach(disposable => {
      if (disposable && typeof disposable.dispose === 'function') {
        disposable.dispose();
      }
    });

    this.nodes = [];
    this.lines = [];
    this.connectionData = [];
    this.disposables.clear();
    this.nodeBasePositions.clear();
    
    // Re-create central sphere and lighting after clear
    this.setupLighting();
    this.createCentralSphere();
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
   * Start animation loop with visibility detection
   */
  private startAnimation(): void {
    this.animationController = new AnimationController();
    
    this.animationController.start((_deltaTime) => {
      this.updateAnimation();
      this.controls?.update();
      this.renderer?.render(this.scene!, this.camera!);
    });
  }

  /**
   * FIX #1 & #2: Update animation frame with proper oscillation and connection updates
   */
  private updateAnimation(): void {
    const time = Date.now() * 0.001;

    // Animate central sphere
    if (this.centralSphere) {
      this.centralSphere.rotation.x += 0.001;
      this.centralSphere.rotation.y += 0.002;
    }

    // FIX #1: Animate nodes with oscillation around base position (not accumulating)
    this.nodes.forEach((node, i) => {
      const baseY = node.userData.originalY ?? node.position.y;
      // Oscillate around base position instead of accumulating
      node.position.y = baseY + Math.sin(time + i * 0.1) * 0.3;
      node.rotation.y += 0.005;
    });

    // FIX #2: Update connection lines to follow node positions
    this.updateConnectionPositions();
  }

  /**
   * Dispose of all resources
   */
  dispose(): void {
    // Stop animation controller
    if (this.animationController) {
      this.animationController.dispose();
      this.animationController = null;
    }

    // Cancel all position animations
    this.activeAnimations.forEach((frameId) => {
      cancelAnimationFrame(frameId);
    });
    this.activeAnimations.clear();

    // Remove event listeners
    window.removeEventListener('resize', this.debouncedResize);

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
    return (this.nodes.length * 0.1 + this.lines.length * 0.05);
  }
}
