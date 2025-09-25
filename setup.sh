#!/bin/bash

# AI Brain Visualizer Pro - Complete Project Setup Script
# This script creates the entire project structure for your GitHub repository

echo "🚀 Setting up AI Brain Visualizer Pro - Claude Integration"
echo "================================================"

# Create main directories
echo "📁 Creating directory structure..."
mkdir -p src/types
mkdir -p src/services/api
mkdir -p src/services/state
mkdir -p src/services/storage
mkdir -p src/visualization
mkdir -p src/ui
mkdir -p src/utils
mkdir -p server
mkdir -p tests/unit
mkdir -p tests/integration
mkdir -p public
mkdir -p dist

# Create README.md
echo "📝 Creating README.md..."
cat > README.md << 'EOF'
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

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/ej777spirit/claude-ai-brain-visualizer.git
cd claude-ai-brain-visualizer
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Start development servers:
```bash
npm run dev
```

## 🔐 API Configuration

The application uses a secure proxy server to handle API calls. Never expose API keys in the frontend.

## 📝 License

MIT License

---

Created with integration for Anthropic's Claude AI
EOF

# Create package.json
echo "📦 Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "ai-brain-visualizer-pro",
  "version": "2.0.0",
  "description": "Scientific AI thought process visualization tool with Claude integration",
  "main": "dist/main.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite",
    "dev:server": "nodemon server/apiProxy.js",
    "build": "tsc && vite build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "three": "^0.160.0",
    "mathjs": "^12.0.0",
    "express": "^4.18.0",
    "axios": "^1.6.0",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^7.0.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0",
    "@types/jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "nodemon": "^3.0.0",
    "concurrently": "^8.0.0"
  },
  "keywords": [
    "ai",
    "visualization",
    "threejs",
    "claude",
    "anthropic",
    "brain",
    "neural-network"
  ],
  "author": "ej777spirit",
  "license": "MIT"
}
EOF

# Create tsconfig.json
echo "⚙️ Creating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF

# Create .env.example
echo "🔐 Creating .env.example..."
cat > .env.example << 'EOF'
# Server Configuration
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# API Keys (Keep secure - never commit to version control)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_ai_api_key_here

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# Create .gitignore
echo "🚫 Creating .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.sublime-workspace

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.nyc_output

# Temporary files
tmp/
temp/
*.tmp
EOF

# Create index.html
echo "📄 Creating index.html..."
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="AI Brain Visualizer Pro - Visualize AI thought processes in 3D">
  <title>AI Brain Visualizer Pro - Claude Integration</title>
  <link rel="stylesheet" href="/src/styles/main.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
EOF

# Create main TypeScript file
echo "💻 Creating src/main.ts..."
cat > src/main.ts << 'EOF'
/**
 * Main entry point for AI Brain Visualizer Pro
 * @module main
 */

import { StateManager } from './services/state/StateManager';
import { APIClient } from './services/api/APIClient';
import { VisualizationManager } from './visualization/VisualizationManager';
import { UIController } from './ui/UIController';
import { AccessibilityManager } from './utils/Accessibility';
import { AppState } from './types';

// Initialize application
async function initializeApp(): Promise<void> {
  console.log('🚀 AI Brain Visualizer Pro - Initializing...');

  try {
    // Initial state
    const initialState: AppState = {
      scene: null,
      camera: null,
      renderer: null,
      currentModel: 'gemini',
      currentPattern: 'hierarchical',
      currentResearchMode: 'conceptual',
      isThinking: false,
      responseHistory: [],
      currentResponseIndex: 0,
      apiConfig: {
        provider: 'openai',
        apiKey: '',
        configured: false,
        researchMode: 'standard'
      },
      knowledgeGraph: {
        nodes: [],
        lines: [],
        nodeMap: new Map(),
        disabledNodes: new Set(),
        branchStates: new Map(),
        matrices: new Map()
      }
    };

    // Initialize modules
    const stateManager = new StateManager(initialState);
    const apiClient = new APIClient('/api');
    const visualizationManager = new VisualizationManager('canvas');
    const uiController = new UIController(stateManager, apiClient, visualizationManager);
    const accessibilityManager = new AccessibilityManager();

    // Setup accessibility
    accessibilityManager.announce('Application initialized and ready');

    // Start application
    uiController.initialize();

    console.log('✅ AI Brain Visualizer Pro - Ready');
  } catch (error) {
    console.error('Failed to initialize application:', error);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
EOF

# Create LICENSE
echo "📜 Creating LICENSE..."
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2024 ej777spirit

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Run: npm install"
echo "2. Copy .env.example to .env and add your API keys"
echo "3. Run: npm run dev"
echo ""
echo "🎉 Your AI Brain Visualizer Pro project is ready!"
echo "Repository: https://github.com/ej777spirit/claude-ai-brain-visualizer"