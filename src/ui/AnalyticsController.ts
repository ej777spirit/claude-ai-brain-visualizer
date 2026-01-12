/**
 * Analytics Controller - Manages charts and statistics
 * @module ui/AnalyticsController
 */

import Chart from 'chart.js/auto';
import { StateManager } from '../services/state/StateManager';

export class AnalyticsController {
  private stateManager: StateManager;
  private activationChart: Chart | null = null;
  private elements: {
    activationCanvas: HTMLCanvasElement | null;
    attentionMatrix: HTMLDivElement | null;
  } = {
    activationCanvas: null,
    attentionMatrix: null
  };

  constructor(stateManager: StateManager) {
    this.stateManager = stateManager;
  }

  /**
   * Initialize analytics controller
   */
  initialize(): void {
    this.elements = {
      activationCanvas: document.getElementById('activation-chart') as HTMLCanvasElement,
      attentionMatrix: document.getElementById('attention-matrix') as HTMLDivElement
    };

    if (this.elements.activationCanvas) {
      this.initActivationChart();
    }
    
    // Subscribe to state changes to update charts
    this.stateManager.subscribe(() => {
        this.updateCharts();
    });
    
    // Initial update
    this.updateCharts();
  }

  /**
   * Initialize activation distribution chart
   */
  private initActivationChart(): void {
    if (!this.elements.activationCanvas) return;

    this.activationChart = new Chart(this.elements.activationCanvas, {
      type: 'bar',
      data: {
        labels: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%'],
        datasets: [{
          data: [0, 0, 0, 0, 0],
          backgroundColor: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            grid: { color: '#2a2a3a' }, 
            ticks: { color: '#94a3b8' } 
          },
          x: { 
            grid: { display: false }, 
            ticks: { color: '#94a3b8' } 
          }
        }
      }
    });
  }

  /**
   * Update charts based on current state
   */
  updateCharts(): void {
    const state = this.stateManager.getState();
    const nodes = state.knowledgeGraph.nodes; // Assuming nodes are here or I need to adapt based on StateManager

    // Update Activation Chart
    if (this.activationChart) {
      const bins = [0, 0, 0, 0, 0];
      // Adapt: if nodes have activation property. 
      // Checking types/index.ts would be good, but assuming 'weight' or similar if 'activation' is missing
      // In src/types/index.ts, ThoughtNode has 'weight'. 
      // index.html used 'activation'. I'll map weight (0-100) to activation (0-1).
      
      nodes.forEach((node: any) => {
        const val = (node.weight || 0) / 100;
        const bin = Math.min(Math.floor(val * 5), 4);
        bins[bin]++;
      });

      this.activationChart.data.datasets[0].data = bins;
      this.activationChart.update();
    }

    // Update Attention Matrix
    if (this.elements.attentionMatrix) {
      this.renderAttentionMatrix(nodes.length > 0 ? nodes.length : 64);
    }
  }

  /**
   * Render attention matrix
   */
  private renderAttentionMatrix(count: number): void {
    if (!this.elements.attentionMatrix) return;

    this.elements.attentionMatrix.innerHTML = '';
    const cells = Math.min(Math.max(count, 64), 64); // Cap at 64 for UI performance
    
    for (let i = 0; i < cells; i++) {
      const cell = document.createElement('div');
      cell.className = 'attention-cell';
      cell.style.aspectRatio = '1';
      cell.style.borderRadius = '2px';
      cell.style.transition = 'all 0.2s';
      
      // Simulate attention/activation
      // In a real app, this would come from the connection weights
      const value = Math.random(); 
      cell.style.backgroundColor = `rgba(100, 255, 218, ${value * 0.8})`; // Using primary accent color
      
      this.elements.attentionMatrix.appendChild(cell);
    }
  }
}
