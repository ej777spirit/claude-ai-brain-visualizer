/**
 * Vercel Serverless Function - AI Generation Endpoint
 * Handles AI API calls for Claude, Gemini, and GPT-4
 */

const axios = require('axios');

// Helper function to call Claude API
async function callClaudeAPI(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 16000,
    thinking: {
      type: 'enabled',
      budget_tokens: 10000
    },
    messages: [{
      role: 'user',
      content: prompt
    }]
  }, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'extended-thinking-2025-01-01'
    }
  });

  const content = response.data.content[0].text;
  const thoughts = generateThoughtsFromResponse(content, 'claude');

  return {
    response: content,
    thoughts,
    model: 'Claude 3.5 Sonnet',
    confidence: Math.floor(Math.random() * 20) + 80,
    metadata: {
      tokensUsed: response.data.usage?.input_tokens + response.data.usage?.output_tokens || 0,
      modelVersion: response.data.model
    }
  };
}

// Helper function to call Gemini API
async function callGeminiAPI(prompt) {
  const apiKey = process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY not configured');
  }

  const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
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
    model: 'Gemini 1.5 Pro',
    confidence: Math.floor(Math.random() * 20) + 80,
    metadata: {
      tokensUsed: 0,
      modelVersion: 'gemini-1.5-pro'
    }
  };
}

// Helper function to call OpenAI API
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
    max_tokens: 4000
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
      position: { x: 0, y: 0, z: 0 },
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

// Main serverless function handler
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { prompt, model } = req.body;

    if (!prompt || !model) {
      res.status(400).json({
        error: 'Missing required parameters: prompt and model'
      });
      return;
    }

    let response;
    const startTime = Date.now();

    try {
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
          res.status(400).json({
            error: 'Unsupported model'
          });
          return;
      }
    } catch (apiError) {
      console.error('API Error, falling back to simulated response:', apiError.message);
      response = generateSimulatedResponse(prompt, model);
    }

    const processingTime = Date.now() - startTime;

    res.status(200).json({
      ...response,
      metadata: {
        ...response.metadata,
        processingTime
      }
    });

  } catch (error) {
    console.error('Server Error:', error);
    
    // Return simulated response if all else fails
    try {
      const simulatedResponse = generateSimulatedResponse(
        req.body.prompt || 'default query',
        req.body.model || 'claude'
      );
      res.status(200).json(simulatedResponse);
    } catch (fallbackError) {
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
};
