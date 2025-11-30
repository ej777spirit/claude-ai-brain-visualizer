/**
 * Vercel Serverless Function - Models List Endpoint
 */

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  res.status(200).json({
    models: ['claude', 'gemini', 'gpt'],
    providers: {
      claude: {
        name: 'Anthropic Claude',
        models: ['claude-3-5-sonnet-20241022'],
        description: 'Extended thinking mode enabled'
      },
      gemini: {
        name: 'Google Gemini',
        models: ['gemini-1.5-pro'],
        description: 'Multi-modal support'
      },
      gpt: {
        name: 'OpenAI GPT',
        models: ['gpt-4o'],
        description: 'Latest GPT-4 model'
      }
    }
  });
};
