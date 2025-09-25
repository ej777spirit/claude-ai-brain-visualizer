/**
 * API Client Unit Tests
 */

import axios from 'axios';
import { APIClient } from '../../src/services/api/APIClient';

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('APIClient', () => {
  let apiClient: APIClient;

  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.warn for cleaner test output
    jest.spyOn(console, 'warn').mockImplementation();
    apiClient = new APIClient('/api');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should create axios instance with correct config', () => {
      expect(mockAxios.create).toHaveBeenCalledWith({
        baseURL: '/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should setup response interceptor', () => {
      expect(mockAxios.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('generateResponse', () => {
    const mockPrompt = 'Test prompt';
    const mockModel = 'claude' as const;

    it('should make successful API call', async () => {
      const mockResponse = {
        data: {
          response: 'Test response',
          thoughts: [],
          model: 'Claude',
          confidence: 85,
          metadata: {
            processingTime: 1000,
            tokensUsed: 500,
            modelVersion: 'claude-3'
          }
        }
      };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await apiClient.generateResponse(mockPrompt, mockModel);

      expect(mockAxios.post).toHaveBeenCalledWith('/generate', {
        prompt: mockPrompt,
        model: mockModel,
        timestamp: expect.any(Number),
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fallback to simulated response on API failure', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('API Error'));

      const result = await apiClient.generateResponse(mockPrompt, mockModel);

      expect(result.response).toContain('Claude');
      expect(result.response).toContain('DEMO MODE - SIMULATED RESPONSE');
      expect(result.model).toBe('CLAUDE (DEMO)');
      expect(result.thoughts).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(80);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(result.metadata.isSimulated).toBe(true);
    });

    it('should handle network errors gracefully', async () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };
      mockAxios.post.mockRejectedValueOnce(networkError);

      // Temporarily disable console.warn to avoid test noise
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await apiClient.generateResponse(mockPrompt, mockModel);

      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('thoughts');
      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('confidence');
      expect(consoleWarnSpy).toHaveBeenCalledWith('API unavailable, using simulated response');

      consoleWarnSpy.mockRestore();
    });

    it('should handle server errors gracefully', async () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' }
        }
      };
      mockAxios.post.mockRejectedValueOnce(serverError);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await apiClient.generateResponse(mockPrompt, mockModel);

      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('thoughts');
      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('confidence');
      expect(consoleWarnSpy).toHaveBeenCalledWith('API unavailable, using simulated response');

      consoleWarnSpy.mockRestore();
    });

    it('should handle rate limiting gracefully', async () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { message: 'Too many requests' }
        }
      };
      mockAxios.post.mockRejectedValueOnce(rateLimitError);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await apiClient.generateResponse(mockPrompt, mockModel);

      expect(result).toHaveProperty('response');
      expect(result).toHaveProperty('thoughts');
      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('confidence');
      expect(consoleWarnSpy).toHaveBeenCalledWith('API unavailable, using simulated response');

      consoleWarnSpy.mockRestore();
    });
  });

  describe('testConnection', () => {
    it('should return true on successful health check', async () => {
      mockAxios.get.mockResolvedValueOnce({ status: 200 });

      const result = await apiClient.testConnection();

      expect(mockAxios.get).toHaveBeenCalledWith('/health');
      expect(result).toBe(true);
    });

    it('should return false on connection failure', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await apiClient.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('getModels', () => {
    it('should return models from API', async () => {
      const mockModels = ['claude', 'gemini', 'gpt'];
      mockAxios.get.mockResolvedValueOnce({
        data: { models: mockModels }
      });

      const result = await apiClient.getModels();

      expect(mockAxios.get).toHaveBeenCalledWith('/models');
      expect(result).toEqual(mockModels);
    });

    it('should return default models when API fails', async () => {
      mockAxios.get.mockRejectedValueOnce(new Error('API Error'));

      const result = await apiClient.getModels();

      expect(result).toEqual(['claude', 'gemini', 'gpt']);
    });
  });

  describe('updateConfig', () => {
    beforeEach(() => {
      // Clear any existing authorization headers
      delete (mockAxios.defaults.headers.common as any)['Authorization'];
    });

    it('should update authorization header with API key', () => {
      const apiKey = 'test-api-key';

      apiClient.updateConfig({ apiKey });

      expect(mockAxios.defaults.headers.common['Authorization']).toBe('Bearer test-api-key');
    });

    it('should handle config without API key', () => {
      apiClient.updateConfig({ provider: 'anthropic' });

      // Should not throw and should not set authorization
      expect(mockAxios.defaults.headers.common['Authorization']).toBeUndefined();
    });
  });

  describe('simulated responses', () => {
    it('should generate appropriate thoughts for different models', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('API Error'));

      const claudeResult = await apiClient.generateResponse('test', 'claude');
      const geminiResult = await apiClient.generateResponse('test', 'gemini');
      const gptResult = await apiClient.generateResponse('test', 'gpt');

      expect(claudeResult.response).toContain('Claude');
      expect(geminiResult.response).toContain('Gemini');
      expect(gptResult.response).toContain('GPT-4');

      expect(claudeResult.thoughts.length).toBeGreaterThan(0);
      expect(geminiResult.thoughts.length).toBeGreaterThan(0);
      expect(gptResult.thoughts.length).toBeGreaterThan(0);
    });

    it('should generate thoughts with proper structure', async () => {
      mockAxios.post.mockRejectedValueOnce(new Error('API Error'));

      const result = await apiClient.generateResponse('test prompt', 'claude');

      expect(result.thoughts[0]).toHaveProperty('id');
      expect(result.thoughts[0]).toHaveProperty('text');
      expect(result.thoughts[0]).toHaveProperty('category');
      expect(result.thoughts[0]).toHaveProperty('weight');
      expect(result.thoughts[0]).toHaveProperty('position');
      expect(result.thoughts[0]).toHaveProperty('metadata');
    });
  });
});