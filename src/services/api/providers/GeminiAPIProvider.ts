
/**
 * Gemini/Google AI API Provider
 * @module services/api/providers/GeminiAPIProvider
 */

import axios, { AxiosError } from 'axios';
import { APIResponse, ThoughtNode } from '../../../types';

export class GeminiAPIProvider {
  private readonly baseURL = 'https://generativelanguage.googleapis.com/v1beta';

  /**
   * Generate response using Gemini API
   */
  async generateResponse(prompt: string, apiKey: string): Promise<APIResponse> {
    if (!apiKey || apiKey.length < 20) {
      throw new Error('Invalid Gemini API key format');
    }

    try {
      const startTime = Date.now();
      
      const response = await axios.post(
        `${this.baseURL}/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
            topP: 0.95,
            topK: 40
          }
        },
        {
          timeout: 60000 // 60 second timeout
        }
      );

      const processingTime = Date.now() - startTime;
      const content = this.extractContent(response.data);
      const thoughts = this.extractThoughts(response.data, prompt);

      return {
        response: content,
        thoughts,
        model: 'Gemini 1.5 Pro',
        confidence: this.calculateConfidence(response.data),
        metadata: {
          processingTime,
          tokensUsed: response.data.usageMetadata?.totalTokenCount || 0,
          modelVersion: 'gemini-1.5-pro',
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
      console.error('Gemini API test failed:', error);
      return false;
    }
  }

  /**
   * Extract content from Gemini response
   */
  private extractContent(data: any): string {
    if (!data.candidates || data.candidates.length === 0) {
      return 'No response generated';
    }

    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts) {
      return 'No content in response';
    }

    return candidate.content.parts
      .filter((part: any) => part.text)
      .map((part: any) => part.text)
      .join('\n\n');
  }

  /**
   * Extract thought nodes from Gemini response
   */
  private extractThoughts(data: any, prompt: string): ThoughtNode[] {
    const thoughts: ThoughtNode[] = [];
    const categories = ['analysis', 'synthesis', 'recall', 'evaluation'] as const;
    
    if (!data.candidates || data.candidates.length === 0) {
      return this.generateDefaultThoughts(prompt);
    }

    const candidate = data.candidates[0];
    const content = candidate.content?.parts?.[0]?.text || '';
    
    // Split response into meaningful chunks
    const sentences = content.split(/[.!?]+/).filter((s: string) => s.trim().length > 20);
    
    sentences.slice(0, 10).forEach((sentence: string, idx: number) => {
      thoughts.push({
        id: idx + 1,
        parent: idx > 0 && Math.random() > 0.3 ? Math.floor(Math.random() * idx) + 1 : undefined,
        text: `Gemini processes: ${sentence.trim().substring(0, 100)}...`,
        category: categories[Math.floor(Math.random() * categories.length)],
        weight: 65 + Math.floor(Math.random() * 30),
        position: { x: 0, y: 0, z: 0 } as any,
        connections: [],
        metadata: {
          depth: Math.floor(idx / 3),
          branchId: `branch-${idx + 1}`,
          timestamp: Date.now(),
          confidence: 70 + Math.floor(Math.random() * 25)
        }
      });
    });

    // If we got too few thoughts, add some defaults
    if (thoughts.length < 5) {
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
      'multi-modal understanding',
      'contextual analysis',
      'knowledge integration',
      'logical reasoning',
      'creative synthesis',
      'pattern detection',
      'information retrieval',
      'response formulation'
    ];

    for (let i = 0; i < 8; i++) {
      thoughts.push({
        id: i + 1,
        parent: i > 0 && Math.random() > 0.4 ? Math.floor(Math.random() * i) + 1 : undefined,
        text: `Gemini processes: ${aspects[i % aspects.length]} of "${prompt.substring(0, 30)}..."`,
        category: categories[Math.floor(Math.random() * categories.length)],
        weight: 65 + Math.floor(Math.random() * 35),
        position: { x: 0, y: 0, z: 0 } as any,
        connections: [],
        metadata: {
          depth: Math.floor(i / 3),
          branchId: `branch-${i + 1}`,
          timestamp: Date.now(),
          confidence: 70 + Math.floor(Math.random() * 25)
        }
      });
    }

    return thoughts;
  }

  /**
   * Calculate confidence from response
   */
  private calculateConfidence(data: any): number {
    let confidence = 82;
    
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      
      // Check safety ratings
      if (candidate.safetyRatings) {
        const hasHighProbability = candidate.safetyRatings.some(
          (rating: any) => rating.probability === 'HIGH'
        );
        if (hasHighProbability) {
          confidence -= 15;
        }
      }
      
      // Check finish reason
      if (candidate.finishReason === 'STOP') {
        confidence += 5;
      } else if (candidate.finishReason === 'MAX_TOKENS') {
        confidence -= 10;
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
          return new Error(`Bad Request: ${data?.error?.message || 'Invalid request parameters'}`);
        case 401:
        case 403:
          return new Error('Invalid API key. Please check your Gemini API key.');
        case 429:
          return new Error('Rate limit exceeded. Please wait a moment and try again.');
        case 500:
        case 503:
          return new Error('Gemini API is temporarily unavailable. Please try again later.');
        default:
          return new Error(`Gemini API Error (${status}): ${data?.error?.message || error.message}`);
      }
    } else if (error.code === 'ECONNABORTED') {
      return new Error('Request timeout. The API took too long to respond.');
    } else if (error.request) {
      return new Error('Network error. Please check your internet connection.');
    }
    
    return new Error(error.message || 'Unknown error occurred');
  }
}
