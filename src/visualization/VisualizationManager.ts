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

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!this.canvas) {
      throw new Error(`Canvas element with id '${canvasId}' not found`);
    }
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
   * Setup event listeners
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', () => this.handleResize());
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

    this.isInitialized = false;
  }

  /**
   * Get memory usage estimate
   */
  getMemoryUsage(): number {
    return (this.nodes.length * 0.1 + this.lines.length * 0.05);
  }
}