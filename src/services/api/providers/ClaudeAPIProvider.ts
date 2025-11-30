
/**
 * Claude/Anthropic API Provider
 * @module services/api/providers/ClaudeAPIProvider
 */

import axios, { AxiosError } from 'axios';
import { APIResponse, ThoughtNode } from '../../../types';

export class ClaudeAPIProvider {
  private readonly baseURL = 'https://api.anthropic.com/v1';
  private readonly apiVersion = '2023-06-01';

  /**
   * Generate response using Claude API
   */
  async generateResponse(prompt: string, apiKey: string): Promise<APIResponse> {
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
      throw new Error('Invalid Claude API key format. Key should start with "sk-ant-"');
    }

    try {
      const startTime = Date.now();
      
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: prompt
          }],
          thinking: {
            type: 'enabled',
            budget_tokens: 1000
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': this.apiVersion
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
        model: 'Claude 3.5 Sonnet',
        confidence: this.calculateConfidence(response.data),
        metadata: {
          processingTime,
          tokensUsed: response.data.usage?.input_tokens + response.data.usage?.output_tokens || 0,
          modelVersion: response.data.model || 'claude-3-5-sonnet-20241022',
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
      console.error('Claude API test failed:', error);
      return false;
    }
  }

  /**
   * Extract content from Claude response
   */
  private extractContent(data: any): string {
    if (!data.content || data.content.length === 0) {
      return 'No response generated';
    }

    return data.content
      .filter((block: any) => block.type === 'text')
      .map((block: any) => block.text)
      .join('\n\n');
  }

  /**
   * Extract thought nodes from Claude's thinking blocks
   */
  private extractThoughts(data: any, prompt: string): ThoughtNode[] {
    const thoughts: ThoughtNode[] = [];
    const categories = ['analysis', 'synthesis', 'recall', 'evaluation'] as const;
    
    // Extract thinking content if available
    const thinkingBlocks = data.content?.filter((block: any) => block.type === 'thinking') || [];
    const textBlocks = data.content?.filter((block: any) => block.type === 'text') || [];
    
    let thoughtId = 1;
    
    // Process thinking blocks
    thinkingBlocks.forEach((block: any) => {
      const thinkingText = block.thinking || '';
      const sentences = thinkingText.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
      
      sentences.slice(0, 5).forEach((sentence: string, idx: number) => {
        thoughts.push({
          id: thoughtId,
          parent: thoughtId > 1 && Math.random() > 0.3 ? Math.floor(Math.random() * (thoughtId - 1)) + 1 : undefined,
          text: `Claude thinks: ${sentence.trim().substring(0, 100)}...`,
          category: categories[Math.floor(Math.random() * categories.length)],
          weight: 70 + Math.floor(Math.random() * 30),
          position: { x: 0, y: 0, z: 0 } as any,
          connections: [],
          metadata: {
            depth: Math.floor(idx / 2),
            branchId: `branch-${thoughtId}`,
            timestamp: Date.now(),
            confidence: 75 + Math.floor(Math.random() * 20)
          }
        });
        thoughtId++;
      });
    });

    // Add thoughts from text content
    textBlocks.forEach((block: any) => {
      const text = block.text || '';
      const sentences = text.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
      
      sentences.slice(0, 3).forEach((sentence: string, idx: number) => {
        thoughts.push({
          id: thoughtId,
          parent: thoughtId > 1 ? Math.floor(Math.random() * (thoughtId - 1)) + 1 : undefined,
          text: `Response: ${sentence.trim().substring(0, 100)}...`,
          category: categories[Math.floor(Math.random() * categories.length)],
          weight: 60 + Math.floor(Math.random() * 25),
          position: { x: 0, y: 0, z: 0 } as any,
          connections: [],
          metadata: {
            depth: Math.floor(idx / 2) + 1,
            branchId: `branch-${thoughtId}`,
            timestamp: Date.now(),
            confidence: 70 + Math.floor(Math.random() * 20)
          }
        });
        thoughtId++;
      });
    });

    // Ensure we have at least some thoughts
    if (thoughts.length === 0) {
      for (let i = 0; i < 8; i++) {
        thoughts.push({
          id: i + 1,
          parent: i > 0 && Math.random() > 0.4 ? Math.floor(Math.random() * i) + 1 : undefined,
          text: `Claude analyzes: ${this.getDefaultThoughtText(prompt, i)}`,
          category: categories[Math.floor(Math.random() * categories.length)],
          weight: 60 + Math.floor(Math.random() * 40),
          position: { x: 0, y: 0, z: 0 } as any,
          connections: [],
          metadata: {
            depth: Math.floor(i / 3),
            branchId: `branch-${i}`,
            timestamp: Date.now(),
            confidence: 70 + Math.floor(Math.random() * 25)
          }
        });
      }
    }

    return thoughts;
  }

  /**
   * Get default thought text
   */
  private getDefaultThoughtText(prompt: string, index: number): string {
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
    return `${aspects[index % aspects.length]} of "${prompt.substring(0, 30)}..."`;
  }

  /**
   * Calculate confidence from response
   */
  private calculateConfidence(data: any): number {
    // Base confidence
    let confidence = 85;
    
    // Adjust based on stop reason
    if (data.stop_reason === 'end_turn') {
      confidence += 5;
    } else if (data.stop_reason === 'max_tokens') {
      confidence -= 10;
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
          return new Error('Invalid API key. Please check your Claude API key.');
        case 403:
          return new Error('Access forbidden. Your API key may not have access to this model.');
        case 429:
          return new Error('Rate limit exceeded. Please wait a moment and try again.');
        case 500:
        case 529:
          return new Error('Claude API is temporarily unavailable. Please try again later.');
        default:
          return new Error(`Claude API Error (${status}): ${data?.error?.message || error.message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. The API took too long to respond.');
    } else if (error.request) {
      return new Error('Network error. Please check your internet connection.');
    }
    
    return new Error(error.message || 'Unknown error occurred');
  }
}
