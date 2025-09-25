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
- **Test Coverage**: Comprehensive unit and integration tests

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

The application uses a secure proxy server to handle API calls. **Never expose API keys in the frontend.**

### Supported APIs
- **Anthropic Claude**: Set `ANTHROPIC_API_KEY` in `.env`
- **OpenAI GPT**: Set `OPENAI_API_KEY` in `.env`
- **Google Gemini**: Set `GOOGLE_API_KEY` in `.env`

If no API keys are provided, the application will use simulated responses for demonstration.

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
