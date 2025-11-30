
/**
 * API Key Storage Manager
 * Handles secure storage and retrieval of API keys in browser local storage
 * @module services/storage/APIKeyStorage
 */

import { AIModel } from '../../types';

export interface StoredAPIKeys {
  claude_api_key?: string;
  gemini_api_key?: string;
  openai_api_key?: string;
}

export class APIKeyStorage {
  private readonly STORAGE_PREFIX = 'ai_visualizer_';
  private readonly KEY_NAMES = {
    claude: 'claude_api_key',
    gemini: 'gemini_api_key',
    gpt: 'openai_api_key'
  };

  /**
   * Save API key to local storage
   */
  saveAPIKey(model: AIModel, apiKey: string): void {
    try {
      const storageKey = this.getStorageKey(model);
      localStorage.setItem(storageKey, apiKey);
      console.log(`API key saved for ${model}`);
    } catch (error) {
      console.error(`Failed to save API key for ${model}:`, error);
      throw new Error('Failed to save API key. Please check browser storage settings.');
    }
  }

  /**
   * Get API key from local storage
   */
  getAPIKey(model: AIModel): string | null {
    try {
      const storageKey = this.getStorageKey(model);
      return localStorage.getItem(storageKey);
    } catch (error) {
      console.error(`Failed to retrieve API key for ${model}:`, error);
      return null;
    }
  }

  /**
   * Remove API key from local storage
   */
  removeAPIKey(model: AIModel): void {
    try {
      const storageKey = this.getStorageKey(model);
      localStorage.removeItem(storageKey);
      console.log(`API key removed for ${model}`);
    } catch (error) {
      console.error(`Failed to remove API key for ${model}:`, error);
    }
  }

  /**
   * Check if API key exists for model
   */
  hasAPIKey(model: AIModel): boolean {
    const key = this.getAPIKey(model);
    return key !== null && key.length > 0;
  }

  /**
   * Get all stored API keys
   */
  getAllAPIKeys(): StoredAPIKeys {
    return {
      claude_api_key: this.getAPIKey('claude') || undefined,
      gemini_api_key: this.getAPIKey('gemini') || undefined,
      openai_api_key: this.getAPIKey('gpt') || undefined
    };
  }

  /**
   * Clear all API keys
   */
  clearAllAPIKeys(): void {
    try {
      this.removeAPIKey('claude');
      this.removeAPIKey('gemini');
      this.removeAPIKey('gpt');
      console.log('All API keys cleared');
    } catch (error) {
      console.error('Failed to clear all API keys:', error);
    }
  }

  /**
   * Validate API key format
   */
  validateAPIKeyFormat(model: AIModel, apiKey: string): { valid: boolean; message: string } {
    if (!apiKey || apiKey.trim().length === 0) {
      return { valid: false, message: 'API key cannot be empty' };
    }

    switch (model) {
      case 'claude':
        if (!apiKey.startsWith('sk-ant-')) {
          return { 
            valid: false, 
            message: 'Claude API key should start with "sk-ant-"' 
          };
        }
        if (apiKey.length < 40) {
          return { 
            valid: false, 
            message: 'Claude API key appears to be too short' 
          };
        }
        break;

      case 'gpt':
        if (!apiKey.startsWith('sk-')) {
          return { 
            valid: false, 
            message: 'OpenAI API key should start with "sk-"' 
          };
        }
        if (apiKey.length < 40) {
          return { 
            valid: false, 
            message: 'OpenAI API key appears to be too short' 
          };
        }
        break;

      case 'gemini':
        if (apiKey.length < 20) {
          return { 
            valid: false, 
            message: 'Gemini API key appears to be too short' 
          };
        }
        break;
    }

    return { valid: true, message: 'API key format is valid' };
  }

  /**
   * Get masked API key for display
   */
  getMaskedAPIKey(model: AIModel): string {
    const key = this.getAPIKey(model);
    if (!key) return '';
    
    if (key.length <= 12) {
      return '***' + key.slice(-4);
    }
    
    return key.slice(0, 8) + '...' + key.slice(-4);
  }

  /**
   * Export all API keys (for backup)
   */
  exportKeys(): string {
    const keys = this.getAllAPIKeys();
    return JSON.stringify(keys, null, 2);
  }

  /**
   * Import API keys (from backup)
   */
  importKeys(jsonString: string): { success: boolean; message: string } {
    try {
      const keys = JSON.parse(jsonString) as StoredAPIKeys;
      
      if (keys.claude_api_key) {
        this.saveAPIKey('claude', keys.claude_api_key);
      }
      if (keys.gemini_api_key) {
        this.saveAPIKey('gemini', keys.gemini_api_key);
      }
      if (keys.openai_api_key) {
        this.saveAPIKey('gpt', keys.openai_api_key);
      }
      
      return { success: true, message: 'API keys imported successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to import API keys. Invalid format.' };
    }
  }

  /**
   * Get storage key for model
   */
  private getStorageKey(model: AIModel): string {
    return `${this.STORAGE_PREFIX}${this.KEY_NAMES[model]}`;
  }
}
