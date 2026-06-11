/**
 * API Integration Tests
 * These tests exercise the Express app in-process with supertest.
 */

import net from 'net';
import { EventEmitter } from 'events';
import { TextDecoder, TextEncoder } from 'util';
import axios from 'axios';

Object.assign(global, { TextDecoder, TextEncoder });

process.env.NODE_ENV = 'test';
process.env.PORT = '38987';
delete process.env.ANTHROPIC_API_KEY;
delete process.env.GOOGLE_API_KEY;
delete process.env.OPENAI_API_KEY;
delete process.env.MOONSHOT_API_KEY;

const appModule = require('../../server/apiProxy');
const app = appModule;
const request = require('supertest');
const mockAxios = axios as jest.Mocked<typeof axios>;
const {
  extractStructuredThoughts,
  getApiPort,
  startServer,
  normalizeStructuredThoughts
} = appModule.testables;

const canBindPort = (port: number): Promise<boolean> => new Promise((resolve) => {
  const server = net.createServer();

  server.once('error', () => resolve(false));
  server.once('listening', () => {
    server.close(() => resolve(true));
  });
  server.listen(port, '127.0.0.1');
});

describe('API Integration Tests', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GOOGLE_API_KEY;
    delete process.env.OPENAI_API_KEY;
    delete process.env.MOONSHOT_API_KEY;
    mockAxios.post.mockReset();
  });

  it('does not bind a network port when imported by tests', async () => {
    await expect(canBindPort(Number(process.env.PORT))).resolves.toBe(true);
  });

  it('uses API_PORT for the backend listener instead of platform PORT', () => {
    expect(getApiPort({ API_PORT: '38988', PORT: '3000' })).toBe(38988);
    expect(getApiPort({ PORT: '3000' })).toBe(3001);
  });

  it('logs a startup warning when the configured API port is already bound', () => {
    const fakeServer = new EventEmitter();
    const fakeApp = {
      listen: jest.fn((_port: number, _callback: () => void) => fakeServer)
    };
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    startServer(fakeApp, 38988);
    fakeServer.emit('error', Object.assign(new Error('busy'), { code: 'EADDRINUSE' }));

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('38988'));
    consoleWarnSpy.mockRestore();
  });

  describe('GET /api/health', () => {
    it('returns health status and version metadata', async () => {
      const response = await request(app).get('/api/health').expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        version: '2.0.0'
      });
      expect(Date.parse(response.body.timestamp)).not.toBeNaN();
    });
  });

  describe('GET /api/models', () => {
    it('returns all available model providers', async () => {
      const response = await request(app).get('/api/models').expect(200);

      expect(response.body.models).toEqual(['claude', 'gemini', 'gpt', 'kimi']);
      expect(Object.keys(response.body.providers)).toEqual(['claude', 'gemini', 'gpt', 'kimi']);
    });
  });

  describe('POST /api/generate', () => {
    it('validates required prompt and model inputs', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({})
        .expect(400);

      expect(response.body.error).toContain('Missing required parameters');
    });

    it('rejects unsupported models', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Test prompt', model: 'invalid-model' })
        .expect(400);

      expect(response.body.error).toContain('Unsupported model');
    });

    it('returns a provenance-tagged simulated response when provider keys are unavailable', async () => {
      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Explain quantum computing', model: 'claude' })
        .expect(200);

      expect(response.body).toMatchObject({
        model: 'CLAUDE',
        metadata: {
          isSimulated: true,
          thoughtSource: 'derived',
          tokensUsed: 0,
          modelVersion: 'simulated'
        }
      });
      expect(response.body.response).toContain('Explain quantum computing');
      expect(response.body.confidence).toBeGreaterThanOrEqual(80);
      expect(response.body.confidence).toBeLessThanOrEqual(99);
      expect(response.body.metadata.processingTime).toBeGreaterThanOrEqual(0);
      expect(response.body.thoughts).toHaveLength(8);
      expect(response.body.thoughts[0]).toMatchObject({
        id: 1,
        parent: null,
        text: expect.stringContaining('Claude analyzes: As Claude'),
        category: 'analysis',
        position: { x: 0, y: 0, z: 0 },
        connections: []
      });
    });

    it('surfaces configured provider authentication failures instead of simulating a response', async () => {
      process.env.ANTHROPIC_API_KEY = 'bad-key';
      mockAxios.post.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: { message: 'invalid x-api-key' } }
        }
      });

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Use the real provider', model: 'claude' })
        .expect(401);

      expect(response.body).toMatchObject({
        error: 'Provider request failed',
        provider: 'claude',
        statusCode: 401
      });
      expect(response.body.message).toContain('invalid x-api-key');
      expect(response.body.thoughts).toBeUndefined();
      expect(response.body.metadata).toBeUndefined();
    });

    it('returns 502 when a configured provider fails without an HTTP status', async () => {
      process.env.ANTHROPIC_API_KEY = 'bad-key';
      mockAxios.post.mockRejectedValueOnce(new Error('provider network timeout'));

      const response = await request(app)
        .post('/api/generate')
        .send({ prompt: 'Use the real provider', model: 'claude' })
        .expect(502);

      expect(response.body).toMatchObject({
        error: 'Provider request failed',
        provider: 'claude',
        statusCode: 502
      });
      expect(response.body.message).toContain('provider network timeout');
    });
  });

  describe('structured thought helpers', () => {
    it('extracts trailing JSON thoughts and removes the structure block from the answer', () => {
      const result = extractStructuredThoughts(`Answer only.

\`\`\`json
{"thoughts":[{"id":"root","parent":null,"text":"First step","category":"analysis","weight":75,"confidence":80}]}
\`\`\``);

      expect(result?.answer).toBe('Answer only.');
      expect(result?.thoughts).toHaveLength(1);
      expect(result?.thoughts[0]).toMatchObject({
        id: 1,
        parent: null,
        text: 'First step',
        category: 'analysis',
        weight: 75,
        metadata: {
          depth: 0,
          confidence: 80
        }
      });
    });

    it('repairs malformed structured thoughts before exposing them to the client', () => {
      const thoughts = normalizeStructuredThoughts([
        { id: 'root', parent: null, text: ' Root ', category: 'analysis', weight: 150, confidence: -10 },
        { id: 'child', parent: 'future', text: 'Forward parent', category: 'not-a-category', weight: -4, confidence: 'bad' },
        { id: 'future', parent: 'child', text: 'Existing parent', category: 'SYNTHESIS', weight: 42.4, confidence: 87.6 }
      ]);

      expect(thoughts.map((thought: any) => thought.id)).toEqual([1, 2, 3]);
      expect(thoughts.map((thought: any) => thought.parent)).toEqual([null, 1, 2]);
      expect(thoughts.map((thought: any) => thought.category)).toEqual(['analysis', 'synthesis', 'synthesis']);
      expect(thoughts.map((thought: any) => thought.weight)).toEqual([100, 0, 42]);
      expect(thoughts.map((thought: any) => thought.metadata.confidence)).toEqual([0, 0, 88]);
      expect(thoughts.map((thought: any) => thought.metadata.depth)).toEqual([0, 1, 2]);
    });
  });
});
