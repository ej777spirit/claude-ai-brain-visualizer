/**
 * API Integration Tests
 * These tests run against a running server instance
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

describe('API Integration Tests', () => {
  // Skip tests if server is not running
  const isServerRunning = async (): Promise<boolean> => {
    try {
      await axios.get(`${API_BASE_URL}/api/health`, { timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  };

  let serverRunning = false;

  beforeAll(async () => {
    serverRunning = await isServerRunning();
    if (!serverRunning) {
      console.warn('⚠️  API server not running on port 3001. Skipping integration tests.');
    }
  });

  (serverRunning ? describe : describe.skip)('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/health`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'healthy');
      expect(response.data).toHaveProperty('timestamp');
      expect(response.data).toHaveProperty('version', '2.0.0');
    });
  });

  (serverRunning ? describe : describe.skip)('GET /api/models', () => {
    it('should return available models', async () => {
      const response = await axios.get(`${API_BASE_URL}/api/models`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('models');
      expect(response.data.models).toEqual(['claude', 'gemini', 'gpt']);
      expect(response.data).toHaveProperty('providers');
    });
  });

  (serverRunning ? describe : describe.skip)('POST /api/generate', () => {
    it('should require prompt and model', async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/generate`, {});
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should reject invalid model', async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/generate`, {
          prompt: 'Test prompt',
          model: 'invalid-model'
        });
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.error).toContain('Unsupported model');
      }
    });

    it('should handle Claude API calls (simulated)', async () => {
      const response = await axios.post(`${API_BASE_URL}/api/generate`, {
        prompt: 'Explain quantum computing',
        model: 'claude'
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('response');
      expect(response.data).toHaveProperty('thoughts');
      expect(response.data).toHaveProperty('model');
      expect(response.data).toHaveProperty('confidence');
      expect(response.data).toHaveProperty('metadata');

      expect(response.data.model).toBe('CLAUDE');
      expect(response.data.confidence).toBeGreaterThanOrEqual(80);
      expect(Array.isArray(response.data.thoughts)).toBe(true);
    });

    it('should generate appropriate thought structures', async () => {
      const response = await axios.post(`${API_BASE_URL}/api/generate`, {
        prompt: 'Test prompt',
        model: 'claude'
      });

      const thoughts = response.data.thoughts;
      expect(thoughts.length).toBeGreaterThan(5);

      const firstThought = thoughts[0];
      expect(firstThought).toHaveProperty('id');
      expect(firstThought).toHaveProperty('text');
      expect(firstThought).toHaveProperty('category');
      expect(firstThought).toHaveProperty('weight');
      expect(firstThought).toHaveProperty('position');
      expect(firstThought).toHaveProperty('metadata');
    });
  });
});