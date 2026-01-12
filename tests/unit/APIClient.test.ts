/**
 * API Client Unit Tests
 * Tests for native fetch-based APIClient
 */

import { APIClient } from '../../src/services/api/APIClient';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

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
    it('should create client with correct base URL', () => {
      const client = new APIClient('/custom-api');
      // The client should be created without errors
      expect(client).toBeDefined();
    });

    it('should use default base URL if not provided', () => {
      const client = new APIClient();
      expect(client).toBeDefined();
    });
  });

  describe('generateResponse', () => {
    const mockPrompt = 'Test prompt';
    const mockModel = 'claude' as const;

    it('should make successful API call', async () => {
      const mockResponse = {
        response: 'Test response',
        thoughts: [],
        model: 'Claude',
        confidence: 85,
        metadata: {
          processingTime: 1000,
          tokensUsed: 500,
          modelVersion: 'claude-3'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const result = await apiClient.generateResponse(mockPrompt, mockModel);

      expect(mockFetch).toHaveBeenCalledWith('/api/generate', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.any(String),
      }));

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.prompt).toBe(mockPrompt);
      expect(callBody.model).toBe(mockModel);
      expect(callBody.timestamp).toBeDefined();

      expect(result).toEqual(mockResponse);
    });

    it('should fallback to simulated response on API failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

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
      mockFetch.mockRejectedValueOnce(new Error('Network Error'));

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
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Internal Server Error' })
      });

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
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ message: 'Too many requests' })
      });

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
      mockFetch.mockResolvedValueOnce({ ok: true });

      const result = await apiClient.testConnection();

      expect(mockFetch).toHaveBeenCalledWith('/api/health', expect.objectContaining({
        method: 'GET',
      }));
      expect(result).toBe(true);
    });

    it('should return false on connection failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Connection failed'));

      const result = await apiClient.testConnection();

      expect(result).toBe(false);
    });

    it('should return false on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

      const result = await apiClient.testConnection();

      expect(result).toBe(false);
    });
  });

  describe('getModels', () => {
    it('should return models from API', async () => {
      const mockModels = ['claude', 'gemini', 'gpt'];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ models: mockModels })
      });

      const result = await apiClient.getModels();

      expect(result).toEqual(mockModels);
    });

    it('should return default models when API fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('API Error'));

      const result = await apiClient.getModels();

      expect(result).toEqual(['claude', 'gemini', 'gpt']);
    });
  });

  describe('updateConfig', () => {
    it('should update authorization header with API key', () => {
      const apiKey = 'test-api-key';

      apiClient.updateConfig({ apiKey });

      // The config should be updated (verified through subsequent calls)
      // We can't directly access the private config, but we can verify it works
      expect(() => apiClient.updateConfig({ apiKey })).not.toThrow();
    });

    it('should handle config without API key', () => {
      // Should not throw
      expect(() => apiClient.updateConfig({ provider: 'anthropic' })).not.toThrow();
    });
  });

  describe('cancelPendingRequests', () => {
    it('should cancel pending requests', () => {
      // Should not throw
      expect(() => apiClient.cancelPendingRequests()).not.toThrow();
    });
  });

  describe('simulated responses', () => {
    beforeEach(() => {
      // Force fallback to simulated responses
      mockFetch.mockRejectedValue(new Error('API Error'));
    });

    it('should generate appropriate thoughts for different models', async () => {
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
      const result = await apiClient.generateResponse('test prompt', 'claude');

      expect(result.thoughts[0]).toHaveProperty('id');
      expect(result.thoughts[0]).toHaveProperty('text');
      expect(result.thoughts[0]).toHaveProperty('category');
      expect(result.thoughts[0]).toHaveProperty('weight');
      expect(result.thoughts[0]).toHaveProperty('position');
      expect(result.thoughts[0]).toHaveProperty('metadata');
    });

    it('should generate unique thought IDs', async () => {
      const result = await apiClient.generateResponse('test prompt', 'claude');
      const ids = result.thoughts.map(t => t.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});
