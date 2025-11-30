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
}