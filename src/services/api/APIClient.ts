/**
 * API Client - Handles communication with backend API proxy
 * Uses native fetch for smaller bundle size
 * @module services/api/APIClient
 */

import { IAPIClient, APIResponse, AIModel, ThoughtNode, APIProvider } from '../../types';

interface FetchConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
}

export class APIClient implements IAPIClient {
  private config: FetchConfig;
  private abortController: AbortController | null = null;

  constructor(baseURL: string = '/api') {
    this.config = {
      baseURL,
      timeout: 30000, // 30 second timeout
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  /**
   * Perform a fetch request with timeout and error handling
   */
  private async fetchWithTimeout<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Cancel any pending request
    this.abortController?.abort();
    this.abortController = new AbortController();

    const timeoutId = setTimeout(() => {
      this.abortController?.abort();
    }, this.config.timeout);

    try {
      const response = await fetch(`${this.config.baseURL}${url}`, {
        ...options,
        headers: {
          ...this.config.headers,
          ...options.headers,
        },
        signal: this.abortController.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.handleAPIError(response.status, errorData);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      throw error;
    }
  }

  /**
   * Generate AI response for a given prompt
   */
  async generateResponse(prompt: string, model: AIModel): Promise<APIResponse> {
    try {
      const response = await this.fetchWithTimeout<APIResponse>('/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          model,
          timestamp: Date.now(),
        }),
      });

      return response;
    } catch (error) {
      // Fallback to simulated response if API is unavailable
      console.warn('API unavailable, using simulated response');
      return this.generateSimulatedResponse(prompt, model);
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseURL}/health`, {
        method: 'GET',
        headers: this.config.headers,
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get available models
   */
  async getModels(): Promise<string[]> {
    try {
      const data = await this.fetchWithTimeout<{ models: string[] }>('/models');
      return data.models || [];
    } catch {
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
        isSimulated: true,
      },
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
        parent:
          i > 0 && Math.random() > 0.4
            ? Math.floor(Math.random() * i) + 1
            : undefined,
        text: `${
          model === 'claude'
            ? 'Claude analyzes'
            : model === 'gemini'
            ? 'Gemini processes'
            : 'GPT evaluates'
        }: ${this.getThoughtText(prompt, i)}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        weight: Math.floor(Math.random() * 40) + 60,
        position: { x: 0, y: 0, z: 0 } as any, // Will be set by visualization
        connections: [],
        metadata: {
          depth: 0,
          branchId: `branch-${i}`,
          timestamp: Date.now(),
          confidence: Math.floor(Math.random() * 30) + 70,
        },
      });
    }

    return thoughts;
  }

  /**
   * Generate contextual response text
   */
  private generateContextualResponse(prompt: string, model: AIModel): string {
    const responses: Record<AIModel, string> = {
      claude: `⚠️ <strong>DEMO MODE - SIMULATED RESPONSE</strong><br><br>As Claude, I've analyzed your query "${prompt}" through multiple cognitive pathways. The visualization shows my thought process involving contextual understanding, pattern recognition, and logical synthesis. Each node represents a concept or reasoning step, with connections showing how ideas relate and build upon each other.<br><br><em>This is a simulated response for demonstration purposes. Configure API keys to get real AI responses.</em>`,
      gemini: `⚠️ <strong>DEMO MODE - SIMULATED RESPONSE</strong><br><br>Through Gemini's advanced processing, I've examined "${prompt}" using parallel analysis streams. The 3D visualization demonstrates how I connect different knowledge domains, evaluate multiple perspectives, and synthesize information into a coherent response.<br><br><em>This is a simulated response for demonstration purposes. Configure API keys to get real AI responses.</em>`,
      gpt: `⚠️ <strong>DEMO MODE - SIMULATED RESPONSE</strong><br><br>GPT-4's analysis of "${prompt}" involves deep transformer-based reasoning. The thought graph illustrates how attention mechanisms focus on relevant concepts, building layers of understanding that culminate in this comprehensive response.<br><br><em>This is a simulated response for demonstration purposes. Configure API keys to get real AI responses.</em>`,
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
      'conceptual mapping',
    ];
    return (
      aspects[index % aspects.length] +
      ' of "' +
      prompt.substring(0, 30) +
      '..."'
    );
  }

  /**
   * Handle API errors
   */
  private handleAPIError(status: number, data: any): Error {
    const message = data?.message || 'Unknown error';

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
  }

  /**
   * Update API configuration
   */
  updateConfig(config: { apiKey?: string; provider?: APIProvider }): void {
    if (config.apiKey) {
      this.config.headers['Authorization'] = `Bearer ${config.apiKey}`;
    }
  }

  /**
   * Cancel any pending requests
   */
  cancelPendingRequests(): void {
    this.abortController?.abort();
    this.abortController = null;
  }
}
