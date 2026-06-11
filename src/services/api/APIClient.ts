/**
 * API Client - Handles communication with backend API proxy
 * @module services/api/APIClient
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { IAPIClient, APIResponse, AIModel, ThoughtNode, APIProvider } from '../../types';

export class APIClient implements IAPIClient {
  private client: AxiosInstance;

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
  }

  /**
   * Generate AI response for a given prompt
   */
  async generateResponse(prompt: string, model: AIModel): Promise<APIResponse> {
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
    // Deterministic per prompt so the same question always yields the same graph
    const numThoughts = 8 + (prompt.length % 7);

    for (let i = 0; i < numThoughts; i++) {
      const weight = 60 + ((i * 17 + prompt.length) % 40);
      thoughts.push({
        id: i + 1,
        // Binary-tree hierarchy keeps the layout stable and connected
        parent: i === 0 ? undefined : Math.floor((i - 1) / 2) + 1,
        text: `${model === 'claude' ? 'Claude analyzes' : model === 'gemini' ? 'Gemini processes' : model === 'gpt' ? 'GPT evaluates' : 'Kimi reasons'}: ${this.getThoughtText(prompt, i)}`,
        category: categories[i % categories.length],
        weight,
        position: { x: 0, y: 0, z: 0 } as any, // Will be set by visualization
        connections: [],
        metadata: {
          depth: i === 0 ? 0 : Math.floor(Math.log2(i + 1)),
          branchId: `branch-${i}`,
          timestamp: Date.now(),
          confidence: weight
        }
      });
    }

    return thoughts;
  }

  /**
   * Generate contextual response text
   */
  private generateContextualResponse(prompt: string, model: AIModel): string {
    // Plain text only: the UI renders responses with textContent to prevent
    // prompt echoes or model output from being interpreted as HTML
    const footer = 'This is a simulated response for demonstration purposes. Configure API keys to get real AI responses.';
    const responses = {
      claude: `⚠️ DEMO MODE - SIMULATED RESPONSE\n\nAs Claude, I've analyzed your query "${prompt}" through multiple cognitive pathways. The visualization shows my thought process involving contextual understanding, pattern recognition, and logical synthesis. Each node represents a concept or reasoning step, with connections showing how ideas relate and build upon each other.\n\n${footer}`,
      gemini: `⚠️ DEMO MODE - SIMULATED RESPONSE\n\nThrough Gemini's advanced processing, I've examined "${prompt}" using parallel analysis streams. The 3D visualization demonstrates how I connect different knowledge domains, evaluate multiple perspectives, and synthesize information into a coherent response.\n\n${footer}`,
      gpt: `⚠️ DEMO MODE - SIMULATED RESPONSE\n\nGPT-4's analysis of "${prompt}" involves deep transformer-based reasoning. The thought graph illustrates how attention mechanisms focus on relevant concepts, building layers of understanding that culminate in this comprehensive response.\n\n${footer}`,
      kimi: `⚠️ DEMO MODE - SIMULATED RESPONSE\n\nUsing Kimi K2.5's advanced reasoning capabilities, I've processed "${prompt}" through deep contextual analysis. The visualization reveals my multi-layered thinking process, combining semantic understanding with logical inference to construct a comprehensive response.\n\n${footer}`
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
}