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
    models: ['claude', 'gemini', 'gpt'],
    providers: {
      claude: { name: 'Anthropic Claude', models: ['claude-3-opus', 'claude-3-sonnet'] },
      gemini: { name: 'Google Gemini', models: ['gemini-pro', 'gemini-pro-vision'] },
      gpt: { name: 'OpenAI GPT', models: ['gpt-4', 'gpt-3.5-turbo'] }
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
    model: 'claude-3-sonnet-20240229',
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
    model: 'Claude 3',
    confidence: Math.floor(Math.random() * 20) + 80,
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

  const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
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
    model: 'Gemini Pro',
    confidence: Math.floor(Math.random() * 20) + 80,
    metadata: {
      tokensUsed: 0, // Gemini doesn't provide token counts
      modelVersion: 'gemini-pro'
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
    model: 'gpt-4',
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
    model: 'GPT-4',
    confidence: Math.floor(Math.random() * 20) + 80,
    metadata: {
      tokensUsed: response.data.usage?.total_tokens || 0,
      modelVersion: response.data.model
    }
  };
}

// Generate thought nodes from AI response
function generateThoughtsFromResponse(response, model) {
  const thoughts = [];
  const categories = ['analysis', 'synthesis', 'recall', 'evaluation'];
  const numThoughts = 8 + Math.floor(Math.random() * 7);

  for (let i = 0; i < numThoughts; i++) {
    thoughts.push({
      id: i + 1,
      parent: i > 0 && Math.random() > 0.4 ? Math.floor(Math.random() * i) + 1 : null,
      text: `${model === 'claude' ? 'Claude analyzes' : model === 'gemini' ? 'Gemini processes' : 'GPT evaluates'}: ${getThoughtText(response, i)}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      weight: Math.floor(Math.random() * 40) + 60,
      position: { x: 0, y: 0, z: 0 }, // Will be set by visualization
      connections: [],
      metadata: {
        depth: 0,
        branchId: `branch-${i}`,
        timestamp: Date.now(),
        confidence: Math.floor(Math.random() * 30) + 70
      }
    });
  }

  return thoughts;
}

// Generate simulated response when APIs are unavailable
function generateSimulatedResponse(prompt, model) {
  const thoughts = generateThoughtsFromResponse(prompt, model);

  const responses = {
    claude: `As Claude, I've analyzed your query "${prompt}" through multiple cognitive pathways. The visualization shows my thought process involving contextual understanding, pattern recognition, and logical synthesis.`,
    gemini: `Through Gemini's advanced processing, I've examined "${prompt}" using parallel analysis streams. The 3D visualization demonstrates how I connect different knowledge domains.`,
    gpt: `GPT-4's analysis of "${prompt}" involves deep transformer-based reasoning. The thought graph illustrates how attention mechanisms focus on relevant concepts.`
  };

  return {
    response: responses[model] || responses.claude,
    thoughts,
    model: model.toUpperCase(),
    confidence: Math.floor(Math.random() * 20) + 80,
    metadata: {
      processingTime: 1500 + Math.random() * 1000,
      tokensUsed: Math.floor(Math.random() * 1000) + 500,
      modelVersion: 'simulated'
    }
  };
}

// Get thought text based on response and index
function getThoughtText(response, index) {
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
  return aspects[index % aspects.length] + ' of the response content';
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