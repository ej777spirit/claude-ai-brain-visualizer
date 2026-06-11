/**
 * API Proxy Server - Secure backend for AI API calls
 * Handles authentication and rate limiting for external AI services
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
require('dotenv').config();

const app = express();
const DEFAULT_API_PORT = 3001;
const API_PORT = getApiPort();

function getApiPort(env = process.env) {
  const parsed = Number.parseInt(String(env.API_PORT || ''), 10);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 65535
    ? parsed
    : DEFAULT_API_PORT;
}

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Get available models
app.get('/api/models', (req, res) => {
  res.json({
    models: ['claude', 'gemini', 'gpt', 'kimi'],
    providers: {
      claude: { name: 'Anthropic Claude', models: ['claude-sonnet-4-6', 'claude-opus-4-8'] },
      gemini: { name: 'Google Gemini', models: ['gemini-2.0-flash'] },
      gpt: { name: 'OpenAI GPT', models: ['gpt-4o', 'gpt-4o-mini'] },
      kimi: { name: 'Moonshot Kimi', models: ['moonshot-v1-128k'] }
    }
  });
});

// Main API endpoint for AI responses
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, model } = req.body;

    if (!prompt || !model) {
      return res.status(400).json({
        error: 'Missing required parameters: prompt and model'
      });
    }

    let response;
    const startTime = Date.now();

    switch (model) {
      case 'claude':
        response = await callClaudeAPI(prompt);
        break;
      case 'gemini':
        response = await callGeminiAPI(prompt);
        break;
      case 'gpt':
        response = await callOpenAIAPI(prompt);
        break;
      case 'kimi':
        response = await callKimiAPI(prompt);
        break;
      default:
        return res.status(400).json({
          error: 'Unsupported model'
        });
    }

    const processingTime = Date.now() - startTime;

    res.json({
      ...response,
      metadata: {
        ...response.metadata,
        processingTime
      }
    });

  } catch (error) {
    console.error('API Error:', error);

    if (isProviderNotConfigured(error)) {
      res.json(generateSimulatedResponse(req.body.prompt, req.body.model));
      return;
    }

    const providerError = formatProviderError(error, req.body.model);
    res.status(providerError.statusCode).json(providerError);
  }
});

// Instruction appended to real API calls so the model reports its own
// reasoning steps as structured data we can visualize faithfully
const STRUCTURE_INSTRUCTION = `

After your answer, append a fenced JSON code block (\`\`\`json ... \`\`\`) describing the reasoning steps you actually took, in exactly this shape:
{"thoughts":[{"id":1,"parent":null,"text":"short description of the reasoning step","category":"analysis","weight":75,"confidence":80}]}
Rules: 5-15 thoughts; ids are sequential integers starting at 1; "parent" is the id of an earlier thought this step builds on (null only for the first); "category" is one of "analysis", "synthesis", "recall", "evaluation"; "weight" and "confidence" are integers 0-100. Do not mention or explain the JSON block in your answer.`;

// Parse the trailing JSON block of a model response into validated thoughts.
// Returns { answer, thoughts } or null if no usable structure was found.
function extractStructuredThoughts(content) {
  const text = String(content || '');
  const match = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```\s*$/i);
  if (!match) return null;

  let parsed;
  try {
    parsed = JSON.parse(match[1]);
  } catch {
    return null;
  }

  const raw = Array.isArray(parsed) ? parsed : parsed.thoughts;
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const thoughts = normalizeStructuredThoughts(raw);
  if (thoughts.length === 0) return null;

  const answer = text.slice(0, match.index).trim();
  if (!answer) return null;

  return { answer, thoughts };
}

// Validate and repair model-reported thoughts so malformed output
// can't break the client (bad parents, categories, ranges)
function normalizeStructuredThoughts(raw) {
  const categories = ['analysis', 'synthesis', 'recall', 'evaluation'];
  const clamp = (v, fallback) => {
    const n = Math.round(Number(v));
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
  };

  const entries = raw
    .filter(t => t && typeof t.text === 'string' && t.text.trim().length > 0)
    .slice(0, 15);

  // Map original ids to sequential ones so parents stay resolvable
  const idMap = new Map();
  entries.forEach((t, i) => idMap.set(t.id, i + 1));

  return entries.map((t, i) => {
    const newId = i + 1;
    let parent = t.parent != null ? idMap.get(t.parent) : null;
    // Parents must reference an earlier node; repair with a binary-tree fallback
    if (i === 0) {
      parent = null;
    } else if (!parent || parent >= newId) {
      parent = Math.floor((newId - 2) / 2) + 1;
    }

    const category = categories.includes(String(t.category).toLowerCase())
      ? String(t.category).toLowerCase()
      : categories[i % categories.length];
    const weight = clamp(t.weight, 70);

    return {
      id: newId,
      parent,
      text: t.text.trim().slice(0, 200),
      category,
      weight,
      position: { x: 0, y: 0, z: 0 }, // Will be set by visualization
      connections: [],
      metadata: {
        depth: 0, // Recomputed below from parent chain
        branchId: `branch-${i}`,
        timestamp: Date.now(),
        confidence: clamp(t.confidence, weight)
      }
    };
  }).map((t, _i, all) => {
    let depth = 0;
    let current = t;
    while (current.parent != null && depth < all.length) {
      current = all[current.parent - 1];
      depth++;
    }
    t.metadata.depth = depth;
    return t;
  });
}

// Run a provider call and shape the result: prefer model-reported thoughts,
// fall back to sentence-derived ones
function shapeProviderResponse(content, model, displayName, metadata) {
  const structured = extractStructuredThoughts(content);
  return {
    response: structured ? structured.answer : content,
    thoughts: structured ? structured.thoughts : generateThoughtsFromResponse(content, model),
    model: displayName,
    metadata: {
      ...metadata,
      // 'model' = reasoning reported by the model itself; 'derived' = built from sentences
      thoughtSource: structured ? 'model' : 'derived'
    }
  };
}

function isProviderNotConfigured(error) {
  return /_API_KEY not configured/.test(String(error?.message || ''));
}

function providerMessageFrom(error) {
  const data = error?.response?.data;
  if (typeof data?.error?.message === 'string') return data.error.message;
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.message === 'string') return data.message;
  if (typeof error?.message === 'string') return error.message;
  return 'Provider request failed';
}

function formatProviderError(error, model) {
  const rawStatus = Number(error?.response?.status);
  const statusCode = Number.isInteger(rawStatus) && rawStatus >= 400 && rawStatus <= 599
    ? rawStatus
    : 502;
  const cause = providerMessageFrom(error);

  return {
    error: 'Provider request failed',
    message: `${String(model || 'AI')} provider request failed: ${cause}`,
    cause,
    provider: model || 'unknown',
    statusCode
  };
}

// Claude API integration
async function callClaudeAPI(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: prompt + STRUCTURE_INSTRUCTION
    }]
  }, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    }
  });

  const content = response.data.content[0].text;

  return shapeProviderResponse(content, 'claude', 'Claude', {
    tokensUsed: response.data.usage?.input_tokens + response.data.usage?.output_tokens || 0,
    modelVersion: response.data.model
  });
}

// Gemini API integration
async function callGeminiAPI(prompt) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not configured');
  }

  const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
    contents: [{
      parts: [{
        text: prompt + STRUCTURE_INSTRUCTION
      }]
    }]
  });

  const content = response.data.candidates[0].content.parts[0].text;

  return shapeProviderResponse(content, 'gemini', 'Gemini', {
    tokensUsed: response.data.usageMetadata?.totalTokenCount || 0,
    modelVersion: 'gemini-2.0-flash'
  });
}

// OpenAI API integration
async function callOpenAIAPI(prompt) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: prompt + STRUCTURE_INSTRUCTION
    }],
    max_tokens: 2000
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });

  const content = response.data.choices[0].message.content;

  return shapeProviderResponse(content, 'gpt', 'GPT-4o', {
    tokensUsed: response.data.usage?.total_tokens || 0,
    modelVersion: response.data.model
  });
}

// Generate thought nodes derived from the actual AI response content
function generateThoughtsFromResponse(response, model) {
  const categories = ['analysis', 'synthesis', 'recall', 'evaluation'];
  const verbs = {
    claude: 'Claude analyzes',
    gemini: 'Gemini processes',
    gpt: 'GPT evaluates',
    kimi: 'Kimi reasons'
  };
  const verb = verbs[model] || verbs.claude;

  // Each node reflects a sentence of the real response, so the graph
  // visualizes the response content rather than random noise
  const sentences = String(response || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 3)
    .slice(0, 15);

  // Pad short responses with generic reasoning aspects so the graph stays readable
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
  while (sentences.length < 8) {
    sentences.push(aspects[sentences.length % aspects.length] + ' of the response');
  }

  return sentences.map((sentence, i) => {
    const excerpt = sentence.length > 80 ? sentence.slice(0, 77) + '...' : sentence;
    // Weight scales with how much content the sentence carries
    const weight = Math.min(100, 50 + Math.round(Math.min(sentence.length, 200) / 4));
    return {
      id: i + 1,
      // Binary-tree hierarchy keeps the layout deterministic for the same response
      parent: i === 0 ? null : Math.floor((i - 1) / 2) + 1,
      text: `${verb}: ${excerpt}`,
      category: categories[i % categories.length],
      weight,
      position: { x: 0, y: 0, z: 0 }, // Will be set by visualization
      connections: [],
      metadata: {
        depth: i === 0 ? 0 : Math.floor(Math.log2(i + 1)),
        branchId: `branch-${i}`,
        timestamp: Date.now(),
        confidence: weight
      }
    };
  });
}

// Generate simulated response when APIs are unavailable
function generateSimulatedResponse(prompt, model) {
  const responses = {
    claude: `As Claude, I've analyzed your query "${prompt}" through multiple cognitive pathways. The visualization shows my thought process involving contextual understanding, pattern recognition, and logical synthesis.`,
    gemini: `Through Gemini's advanced processing, I've examined "${prompt}" using parallel analysis streams. The 3D visualization demonstrates how I connect different knowledge domains.`,
    gpt: `GPT-4's analysis of "${prompt}" involves deep transformer-based reasoning. The thought graph illustrates how attention mechanisms focus on relevant concepts.`,
    kimi: `Using Kimi K2.5's advanced reasoning capabilities, I've processed "${prompt}" through deep contextual analysis. The visualization reveals my multi-layered thinking process combining semantic understanding with logical inference.`
  };

  const responseText = responses[model] || responses.claude;

  return {
    response: responseText,
    thoughts: generateThoughtsFromResponse(responseText, model),
    model: model ? model.toUpperCase() : 'CLAUDE',
    confidence: Math.floor(Math.random() * 20) + 80,
    metadata: {
      processingTime: 1500 + Math.random() * 1000,
      tokensUsed: 0,
      modelVersion: 'simulated',
      // Always flag fallbacks so the client can show the demo-mode banner
      isSimulated: true,
      thoughtSource: 'derived'
    }
  };
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

function startServer(serverApp = app, port = API_PORT) {
  const server = serverApp.listen(port, () => {
    console.log(`🚀 AI Brain Visualizer API Server running on port ${port}`);
    console.log(`📊 Rate limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${process.env.RATE_LIMIT_WINDOW_MS || 900000}ms`);
    console.log(`🌐 CORS origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  });

  server.on('error', (error) => {
    if (error && error.code === 'EADDRINUSE') {
      console.warn(`Configured API_PORT ${port} is already bound. Choose a free API_PORT or stop the process using that port.`);
      return;
    }

    console.error('API server startup error:', error);
  });

  return server;
}

// Start server only when launched directly; tests import the app in-process.
if (require.main === module) {
  startServer();
}

module.exports = app;
// Internal helpers exposed for testing
module.exports.testables = {
  extractStructuredThoughts,
  normalizeStructuredThoughts,
  generateThoughtsFromResponse,
  getApiPort,
  startServer,
  isProviderNotConfigured,
  formatProviderError
};
// Moonshot Kimi API integration
async function callKimiAPI(prompt) {
  const apiKey = process.env.MOONSHOT_API_KEY;

  if (!apiKey) {
    throw new Error('MOONSHOT_API_KEY not configured');
  }

  const response = await axios.post('https://api.moonshot.cn/v1/chat/completions', {
    model: 'moonshot-v1-128k',
    messages: [{
      role: 'user',
      content: prompt + STRUCTURE_INSTRUCTION
    }],
    max_tokens: 2000,
    temperature: 0.7
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });

  const content = response.data.choices[0].message.content;

  return shapeProviderResponse(content, 'kimi', 'Kimi K2.5', {
    tokensUsed: response.data.usage?.total_tokens || 0,
    modelVersion: response.data.model
  });
}
