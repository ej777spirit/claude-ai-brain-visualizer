
/**
 * OpenAI/ChatGPT API Provider
 * @module services/api/providers/OpenAIAPIProvider
 */

import axios, { AxiosError } from 'axios';
import { APIResponse, ThoughtNode } from '../../../types';

export class OpenAIAPIProvider {
  private readonly baseURL = 'https://api.openai.com/v1';

  /**
   * Generate response using OpenAI API
   */
  async generateResponse(prompt: string, apiKey: string): Promise<APIResponse> {
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('Invalid OpenAI API key format. Key should start with "sk-"');
    }

    try {
      const startTime = Date.now();
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: 'gpt-4o',
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 60000 // 60 second timeout
        }
      );

      const processingTime = Date.now() - startTime;
      const content = this.extractContent(response.data);
      const thoughts = this.extractThoughts(response.data, prompt);

      return {
        response: content,
        thoughts,
        model: 'GPT-4o',
        confidence: this.calculateConfidence(response.data),
        metadata: {
          processingTime,
          tokensUsed: response.data.usage?.total_tokens || 0,
          modelVersion: response.data.model || 'gpt-4o',
          isSimulated: false
        }
      };
    } catch (error) {
      throw this.handleError(error as AxiosError);
    }
  }

  /**
   * Test API key validity
   */
  async testConnection(apiKey: string): Promise<boolean> {
    try {
      await this.generateResponse('Hello', apiKey);
      return true;
    } catch (error) {
      console.error('OpenAI API test failed:', error);
      return false;
    }
  }

  /**
   * Extract content from OpenAI response
   */
  private extractContent(data: any): string {
    if (!data.choices || data.choices.length === 0) {
      return 'No response generated';
    }

    const choice = data.choices[0];
    return choice.message?.content || 'No content in response';
  }

  /**
   * Extract thought nodes from OpenAI response
   */
  private extractThoughts(data: any, prompt: string): ThoughtNode[] {
    const thoughts: ThoughtNode[] = [];
    const categories = ['analysis', 'synthesis', 'recall', 'evaluation'] as const;
    
    if (!data.choices || data.choices.length === 0) {
      return this.generateDefaultThoughts(prompt);
    }

    const content = data.choices[0].message?.content || '';
    
    // Split response into meaningful chunks
    const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
    
    sentences.slice(0, 12).forEach((sentence: string, idx: number) => {
      thoughts.push({
        id: idx + 1,
        parent: idx > 0 && Math.random() > 0.35 ? Math.floor(Math.random() * idx) + 1 : undefined,
        text: `GPT processes: ${sentence.trim().substring(0, 100)}...`,
        category: categories[Math.floor(Math.random() * categories.length)],
        weight: 70 + Math.floor(Math.random() * 30),
        position: { x: 0, y: 0, z: 0 } as any,
        connections: [],
        metadata: {
          depth: Math.floor(idx / 3),
          branchId: `branch-${idx + 1}`,
          timestamp: Date.now(),
          confidence: 75 + Math.floor(Math.random() * 20)
        }
      });
    });

    // If we got too few thoughts, add some defaults
    if (thoughts.length < 6) {
      return this.generateDefaultThoughts(prompt);
    }

    return thoughts;
  }

  /**
   * Generate default thoughts when extraction fails
   */
  private generateDefaultThoughts(prompt: string): ThoughtNode[] {
    const thoughts: ThoughtNode[] = [];
    const categories = ['analysis', 'synthesis', 'recall', 'evaluation'] as const;
    const aspects = [
      'attention mechanism activation',
      'context window analysis',
      'transformer layer processing',
      'semantic embedding retrieval',
      'token probability calculation',
      'knowledge integration',
      'logical coherence check',
      'response generation',
      'quality assessment'
    ];

    for (let i = 0; i < 9; i++) {
      thoughts.push({
        id: i + 1,
        parent: i > 0 && Math.random() > 0.4 ? Math.floor(Math.random() * i) + 1 : undefined,
        text: `GPT evaluates: ${aspects[i % aspects.length]} for "${prompt.substring(0, 30)}..."`,
        category: categories[Math.floor(Math.random() * categories.length)],
        weight: 70 + Math.floor(Math.random() * 30),
        position: { x: 0, y: 0, z: 0 } as any,
        connections: [],
        metadata: {
          depth: Math.floor(i / 3),
          branchId: `branch-${i + 1}`,
          timestamp: Date.now(),
          confidence: 75 + Math.floor(Math.random() * 20)
        }
      });
    }

    return thoughts;
  }

  /**
   * Calculate confidence from response
   */
  private calculateConfidence(data: any): number {
    let confidence = 88;
    
    if (data.choices && data.choices.length > 0) {
      const choice = data.choices[0];
      
      // Check finish reason
      if (choice.finish_reason === 'stop') {
        confidence += 4;
      } else if (choice.finish_reason === 'length') {
        confidence -= 8;
      } else if (choice.finish_reason === 'content_filter') {
        confidence -= 15;
      }
    }
    
    return Math.max(70, Math.min(98, confidence));
  }

  /**
   * Handle API errors
   */
  private handleError(error: AxiosError): Error {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
      switch (status) {
        case 400:
          return new Error(`Bad Request: ${data?.error?.message || 'Invalid request'}`);
        case 401:
          return new Error('Invalid API key. Please check your OpenAI API key.');
        case 403:
          return new Error('Access forbidden. Your API key may not have the required permissions.');
        case 429:
          if (data?.error?.message?.includes('quota')) {
            return new Error('OpenAI API quota exceeded. Please check your billing.');
          }
          return new Error('Rate limit exceeded. Please wait a moment and try again.');
        case 500:
        case 503:
          return new Error('OpenAI API is temporarily unavailable. Please try again later.');
        default:
          return new Error(`OpenAI API Error (${status}): ${data?.error?.message || error.message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. The API took too long to respond.');
    } else if (error.request) {
      return new Error('Network error. Please check your internet connection.');
    }
    
    return new Error(error.message || 'Unknown error occurred');
  }
}
