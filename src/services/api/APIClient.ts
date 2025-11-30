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
}