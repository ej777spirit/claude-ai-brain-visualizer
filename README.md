# AI Brain Visualizer Pro - Claude Integration

A sophisticated 3D visualization tool for exploring AI thought processes with real-time analysis and scientific research capabilities.

## 🚀 Features

- **3D Thought Visualization**: Interactive Three.js-based neural network visualization
- **Multi-AI Support**: Integration with OpenAI, Anthropic Claude, Google Gemini, and more
- **Secure Architecture**: API proxy server to protect credentials
- **Scientific Analysis**: Mathematical representations, matrices, and research metrics
- **TypeScript**: Fully typed for better maintainability
- **Accessibility**: WCAG compliant with screen reader support
- **State Management**: Centralized state with observer pattern
- **Memory Safe**: Proper disposal of Three.js objects
- **Test Coverage**: Comprehensive unit and integration tests (47 tests passing)
- **Demo Mode**: Clear indicators for simulated vs real AI responses
- **Graceful Fallbacks**: Works without API keys using intelligent simulation

## 🏗️ Architecture

```
claude-ai-brain-visualizer/
├── src/                    # Source TypeScript files
│   ├── types/             # Type definitions
│   ├── services/          # Core services (API, State, Storage)
│   ├── visualization/     # Three.js visualization components
│   ├── ui/               # UI controllers and components
│   └── utils/            # Utility functions
├── server/                # Backend API proxy
├── tests/                 # Test files
├── public/               # Static assets
└── dist/                 # Compiled output
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Quick Start

1. **Clone the repository:**
```bash
git clone https://github.com/ej777spirit/claude-ai-brain-visualizer.git
cd claude-ai-brain-visualizer
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your API keys (optional - works with simulated responses)
```

4. **Start development servers:**
```bash
npm run dev
```

This will start:
- Frontend dev server on `http://localhost:3000`
- Backend API proxy on `http://localhost:3001`

5. **Open your browser** and navigate to `http://localhost:3000`

## 🔐 API Configuration

The application supports **three different AI platforms** with flexible API key management:

### Two Ways to Configure API Keys

#### Option 1: Client-Side Storage (Recommended for Personal Use)
Store API keys directly in your browser's local storage for quick, convenient access:

1. **Select your AI platform** (Claude, Gemini, or GPT-4) from the model selector
2. **Click the API Key Configuration** section (🔑 icon)
3. **Enter your API key** in the platform-specific input field
4. **Save the key** - it will be securely stored in your browser's local storage
5. **Test the connection** to verify your key works

Your API keys are stored locally and never transmitted to any server except the official AI provider APIs.

#### Option 2: Backend Proxy (Recommended for Production)
For production deployments or shared environments, configure API keys on the backend:

Set environment variables in `.env`:
```env
ANTHROPIC_API_KEY=your_claude_key
OPENAI_API_KEY=your_openai_key
GOOGLE_API_KEY=your_gemini_key
```

### How to Obtain API Keys

#### 🤖 Claude (Anthropic)
1. Visit [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in to your account
3. Navigate to **API Keys** section
4. Click **Create Key** 
5. Copy your API key (starts with `sk-ant-`)
6. **Pricing**: Pay-as-you-go, starting at $3 per million tokens
7. **Free credits**: New accounts may receive initial credits

#### 🔮 Gemini (Google AI)
1. Visit [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Select or create a Google Cloud project
5. Copy your API key (starts with `AIza`)
6. **Pricing**: Free tier available with rate limits, paid tier for higher usage
7. **Free tier**: 60 requests per minute

#### 💬 ChatGPT (OpenAI)
1. Visit [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign up or log in to your OpenAI account
3. Navigate to **API Keys** section
4. Click **Create new secret key**
5. Copy your API key immediately (starts with `sk-`)
6. **Pricing**: Pay-as-you-go, starting at $0.03 per 1K tokens for GPT-4o
7. **Note**: Requires adding payment method

### API Key Security Best Practices

✅ **DO:**
- Store API keys in browser local storage for personal use
- Use environment variables for production deployments
- Regularly rotate your API keys
- Monitor your API usage and billing
- Use separate keys for development and production

❌ **DON'T:**
- Share your API keys with others
- Commit API keys to version control (use `.env` files)
- Use the same key across multiple projects
- Expose keys in client-side code for public websites

### Demo Mode
If no API keys are provided, the application will use **simulated responses** for demonstration with:
- ⚠️ Clear "DEMO MODE" indicators in responses
- Realistic AI thought process visualization
- Full functionality without external API costs
- Easy upgrade path by adding API keys

### Managing Your API Keys

The application provides a user-friendly interface to:
- **Save** API keys for each platform
- **Test** API key validity before use
- **Clear** stored API keys when needed
- **View** masked versions of stored keys
- **Switch** between platforms seamlessly

Keys are stored per-platform, so you can:
- Use Claude for some queries
- Use Gemini for others
- Use GPT-4 for specific tasks
- Switch models without re-entering keys

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend servers
npm run dev:client       # Start only frontend dev server
npm run dev:server       # Start only backend API server

# Building
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run type-check       # Run TypeScript type checking
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Utilities
npm run clean            # Clean build artifacts
```

### Testing Infrastructure

The project includes comprehensive testing with **47 passing tests**:

- **Unit Tests**: Core business logic (APIClient, StateManager)
- **Integration Tests**: UI interactions and API endpoints
- **Mocking**: Three.js, Axios, and DOM environment mocking
- **Coverage**: Configured for detailed reporting

Tests run automatically and ensure production readiness.

### Demo Mode

When API keys are not configured, the application runs in **Demo Mode** with:
- Simulated AI responses with realistic thought processes
- Clear visual indicators ("DEMO MODE" banners)
- Full functionality for exploration and testing
- Easy transition to real APIs by adding keys

### Project Structure Details

- **`src/types/`**: TypeScript interfaces and type definitions
- **`src/services/`**: Core business logic (API client, state management)
- **`src/visualization/`**: Three.js 3D rendering and visualization
- **`src/ui/`**: User interface controllers and DOM manipulation
- **`src/utils/`**: Utility functions and accessibility helpers
- **`server/`**: Express.js API proxy server
- **`tests/`**: Unit and integration tests

## 🚀 Deployment

### Production Build

```bash
npm run build
```

This creates optimized files in the `dist/` directory.

### Deploy to Web Server

1. Build the project: `npm run build`
2. Copy the `dist/` folder to your web server
3. Configure your server to serve `index.html` for all routes (SPA routing)

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://yourdomain.com
ANTHROPIC_API_KEY=your_production_key
# ... other API keys
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Three.js](https://threejs.org/) for 3D visualization
- Powered by [Vite](https://vitejs.dev/) for fast development
- TypeScript for type safety
- Express.js for the API proxy server

---

**Created with integration for Anthropic's Claude AI** 🤖✨
