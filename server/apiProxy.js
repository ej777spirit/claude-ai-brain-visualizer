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
const PORT = process.env.PORT || 3001;

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

    // Return simulated response if API fails
    res.json(generateSimulatedResponse(req.body.prompt, req.body.model));
  }
});

// Claude API integration
async function callClaudeAPI(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: 'claude-sonnet-4-6',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  }, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    }
  });

  const content = response.data.content[0].text;
  const thoughts = generateThoughtsFromResponse(content, 'claude');

  return {
    response: content,
    thoughts,
    model: 'Claude',
    metadata: {
      tokensUsed: response.data.usage?.input_tokens + response.data.usage?.output_tokens || 0,
      modelVersion: response.data.model
    }
  };
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
        text: prompt
      }]
    }]
  });

  const content = response.data.candidates[0].content.parts[0].text;
  const thoughts = generateThoughtsFromResponse(content, 'gemini');

  return {
    response: content,
    thoughts,
    model: 'Gemini',
    metadata: {
      tokensUsed: response.data.usageMetadata?.totalTokenCount || 0,
      modelVersion: 'gemini-2.0-flash'
    }
  };
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
      content: prompt
    }],
    max_tokens: 1000
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });

  const content = response.data.choices[0].message.content;
  const thoughts = generateThoughtsFromResponse(content, 'gpt');

  return {
    response: content,
    thoughts,
    model: 'GPT-4o',
    metadata: {
      tokensUsed: response.data.usage?.total_tokens || 0,
      modelVersion: response.data.model
    }
  };
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
      isSimulated: true
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 AI Brain Visualizer API Server running on port ${PORT}`);
  console.log(`📊 Rate limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 100} requests per ${process.env.RATE_LIMIT_WINDOW_MS || 900000}ms`);
  console.log(`🌐 CORS origin: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

module.exports = app;
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
      content: prompt
    }],
    max_tokens: 1000,
    temperature: 0.7
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }
  });

  const content = response.data.choices[0].message.content;
  const thoughts = generateThoughtsFromResponse(content, 'kimi');

  return {
    response: content,
    thoughts,
    model: 'Kimi K2.5',
    metadata: {
      tokensUsed: response.data.usage?.total_tokens || 0,
      modelVersion: response.data.model
    }
  };
}
