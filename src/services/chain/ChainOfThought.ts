/**
 * Chain of Thought Service - Manages sequential thought generation and streaming
 * @module services/chain/ChainOfThought
 * 
 * This service handles:
 * 1. Sequential thought generation with proper chain structure
 * 2. Streaming thought updates for real-time visualization
 * 3. Thought state management and history
 */

import { ThoughtNode, ThoughtCategory, AIModel } from '../../types';

export interface ChainOfThoughtConfig {
  /** Delay between thoughts in ms (for simulated streaming) */
  thoughtDelay: number;
  /** Maximum thoughts in a chain */
  maxThoughts: number;
  /** Enable streaming mode */
  streaming: boolean;
}

export interface ThoughtStreamCallback {
  onThoughtStart: () => void;
  onThought: (thought: ThoughtNode) => void;
  onThoughtComplete: (allThoughts: ThoughtNode[]) => void;
  onError: (error: Error) => void;
}

const DEFAULT_CONFIG: ChainOfThoughtConfig = {
  thoughtDelay: 800,
  maxThoughts: 15,
  streaming: true,
};

// Thought generation templates for more realistic chain-of-thought
const THOUGHT_TEMPLATES = {
  analysis: [
    'Breaking down the question into key components...',
    'Identifying the core concepts involved...',
    'Analyzing the relationships between elements...',
    'Examining the underlying assumptions...',
    'Evaluating the scope and constraints...',
  ],
  synthesis: [
    'Connecting related concepts together...',
    'Building a coherent framework...',
    'Integrating multiple perspectives...',
    'Forming a unified understanding...',
    'Synthesizing the key insights...',
  ],
  recall: [
    'Retrieving relevant knowledge...',
    'Accessing related examples...',
    'Drawing from similar problems...',
    'Recalling applicable patterns...',
    'Referencing established principles...',
  ],
  evaluation: [
    'Assessing the validity of conclusions...',
    'Weighing alternative approaches...',
    'Checking for logical consistency...',
    'Validating the reasoning chain...',
    'Confirming the solution meets requirements...',
  ],
};

// Chain structure templates - defines the flow of thought types
const CHAIN_STRUCTURES = {
  standard: ['analysis', 'recall', 'analysis', 'synthesis', 'evaluation'] as ThoughtCategory[],
  deep: ['analysis', 'analysis', 'recall', 'synthesis', 'analysis', 'synthesis', 'evaluation'] as ThoughtCategory[],
  creative: ['recall', 'synthesis', 'analysis', 'synthesis', 'synthesis', 'evaluation'] as ThoughtCategory[],
};

export class ChainOfThought {
  private config: ChainOfThoughtConfig;
  private currentChain: ThoughtNode[] = [];
  private isGenerating = false;
  private abortController: AbortController | null = null;

  constructor(config: Partial<ChainOfThoughtConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Generate a chain of thoughts for a given prompt
   * Supports both streaming and batch modes
   */
  async generateChain(
    prompt: string,
    model: AIModel,
    callbacks: ThoughtStreamCallback
  ): Promise<ThoughtNode[]> {
    if (this.isGenerating) {
      this.abort();
    }

    this.isGenerating = true;
    this.abortController = new AbortController();
    this.currentChain = [];

    callbacks.onThoughtStart();

    try {
      // Determine chain structure based on prompt complexity
      const structure = this.determineChainStructure(prompt);
      const numThoughts = Math.min(
        structure.length + Math.floor(Math.random() * 5),
        this.config.maxThoughts
      );

      // Generate thoughts sequentially
      for (let i = 0; i < numThoughts; i++) {
        if (this.abortController.signal.aborted) {
          break;
        }

        const category = structure[i % structure.length];
        const thought = this.generateThought(prompt, model, i, category);
        
        this.currentChain.push(thought);
        callbacks.onThought(thought);

        // Delay between thoughts for streaming effect
        if (this.config.streaming && i < numThoughts - 1) {
          await this.delay(this.config.thoughtDelay);
        }
      }

      callbacks.onThoughtComplete(this.currentChain);
      return this.currentChain;

    } catch (error) {
      callbacks.onError(error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    } finally {
      this.isGenerating = false;
      this.abortController = null;
    }
  }

  /**
   * Generate a single thought
   */
  private generateThought(
    prompt: string,
    model: AIModel,
    index: number,
    category: ThoughtCategory
  ): ThoughtNode {
    const templates = THOUGHT_TEMPLATES[category];
    const templateIndex = index % templates.length;
    const baseText = templates[templateIndex];

    // Create contextual thought text
    const contextualText = this.createContextualThought(baseText, prompt, model, index);

    // Calculate weight (importance) - earlier thoughts often set foundation
    const baseWeight = 70;
    const positionBonus = index === 0 ? 15 : (index < 3 ? 10 : 0);
    const categoryBonus = category === 'synthesis' ? 10 : (category === 'evaluation' ? 15 : 0);
    const weight = Math.min(100, baseWeight + positionBonus + categoryBonus + Math.floor(Math.random() * 10));

    // Confidence increases as chain progresses (building on previous thoughts)
    const confidence = Math.min(95, 60 + index * 3 + Math.floor(Math.random() * 10));

    return {
      id: index + 1,
      parent: index > 0 ? index : undefined, // Linear chain - each thought links to previous
      text: contextualText,
      category,
      weight,
      position: { x: 0, y: 0, z: 0 } as any, // Will be set by visualization
      connections: index > 0 ? [index] : [],
      metadata: {
        depth: index,
        branchId: 'main-chain',
        timestamp: Date.now(),
        confidence,
      },
    };
  }

  /**
   * Create contextual thought text based on prompt
   */
  private createContextualThought(
    baseText: string,
    prompt: string,
    model: AIModel,
    index: number
  ): string {
    const modelPrefix = {
      claude: 'Claude',
      gemini: 'Gemini',
      gpt: 'GPT-4',
    }[model];

    // Extract key terms from prompt (simple extraction)
    const keyTerms = this.extractKeyTerms(prompt);
    const term = keyTerms[index % keyTerms.length] || 'the query';

    // Build thought text
    const thoughtParts = [
      `[${modelPrefix}] ${baseText}`,
      `Focusing on "${term}"...`,
    ];

    // Add step indicator
    const stepIndicators = [
      'Initial assessment:',
      'Building on that:',
      'Furthermore:',
      'Additionally:',
      'This leads to:',
      'Considering:',
      'Importantly:',
      'In conclusion:',
    ];

    const indicator = stepIndicators[Math.min(index, stepIndicators.length - 1)];
    
    return `${indicator} ${thoughtParts.join(' ')}`;
  }

  /**
   * Extract key terms from prompt for contextual thoughts
   */
  private extractKeyTerms(prompt: string): string[] {
    // Simple keyword extraction - remove common words
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'shall',
      'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in',
      'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
      'through', 'during', 'before', 'after', 'above', 'below',
      'between', 'under', 'again', 'further', 'then', 'once',
      'what', 'how', 'why', 'when', 'where', 'which', 'who',
      'this', 'that', 'these', 'those', 'i', 'me', 'my', 'you',
      'your', 'it', 'its', 'we', 'our', 'they', 'their',
    ]);

    const words = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));

    // Return unique terms, max 5
    return [...new Set(words)].slice(0, 5);
  }

  /**
   * Determine chain structure based on prompt
   */
  private determineChainStructure(prompt: string): ThoughtCategory[] {
    const lowerPrompt = prompt.toLowerCase();
    
    // Creative prompts
    if (lowerPrompt.includes('create') || lowerPrompt.includes('imagine') || 
        lowerPrompt.includes('design') || lowerPrompt.includes('invent')) {
      return CHAIN_STRUCTURES.creative;
    }
    
    // Complex/deep analysis prompts
    if (lowerPrompt.includes('explain') || lowerPrompt.includes('analyze') ||
        lowerPrompt.includes('compare') || lowerPrompt.includes('evaluate') ||
        prompt.length > 100) {
      return CHAIN_STRUCTURES.deep;
    }
    
    // Standard prompts
    return CHAIN_STRUCTURES.standard;
  }

  /**
   * Abort current generation
   */
  abort(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.isGenerating = false;
  }

  /**
   * Check if currently generating
   */
  isActive(): boolean {
    return this.isGenerating;
  }

  /**
   * Get current chain
   */
  getCurrentChain(): ThoughtNode[] {
    return [...this.currentChain];
  }

  /**
   * Clear current chain
   */
  clear(): void {
    this.currentChain = [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ChainOfThoughtConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Helper: delay for streaming effect
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const chainOfThought = new ChainOfThought();
