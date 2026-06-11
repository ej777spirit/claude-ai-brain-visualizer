# AI Brain Visualizer Pro - Project Overview

## Project Identity
- **Name**: AI Brain Visualizer Pro
- **Tagline**: Claude Integration Edition
- **Version**: 1.0.0
- **Repository**: claude-ai-brain-visualizer
- **Branch**: claude/review-architecture-VH8Sx
- **Last Updated**: 2026-06-11
- **Maintainer**: ej.regulation@gmail.com

---

## Executive Summary

AI Brain Visualizer Pro is an interactive web application that visualizes AI reasoning processes in real-time 3D. Users submit natural language queries to multiple AI providers (Claude, Gemini, GPT-4o, Kimi K2.5), and the system extracts structured thought representations from model responses, rendering them as an interactive knowledge graph using Three.js.

The application bridges the gap between opaque AI responses and human understanding by decomposing model outputs into discrete reasoning steps, visualizing conceptual relationships, and computing graph-theoretic metrics that characterize the thought structure.

---

## Core Objectives

### 1. Multi-Provider AI Integration
- **Goal**: Unified interface across Claude (Anthropic), Gemini (Google), GPT-4o (OpenAI), and Kimi K2.5 (Moonshot)
- **Status**: ✅ Implemented
- **Implementation**: Express.js proxy server with provider-specific routing (`server/apiProxy.js`)

### 2. Thought Process Extraction
- **Goal**: Extract meaningful reasoning steps from model responses, not random segmentation
- **Status**: ✅ Implemented (structured output prompting)
- **Implementation**: STRUCTURE_INSTRUCTION prompt requests JSON-formatted reasoning steps; fallback to sentence-derived extraction

### 3. Real-Time 3D Visualization
- **Goal**: Render knowledge graphs with smooth animations, multiple layout patterns, and interactive exploration
- **Status**: ✅ Implemented
- **Implementation**: Three.js with WebGL, four layout algorithms (hierarchical, network, timeline, matrix)

### 4. Graph Analytics
- **Goal**: Compute meaningful metrics that characterize thought structure
- **Status**: ✅ Implemented
- **Implementation**: mathjs-based adjacency matrix analysis (`src/services/analysis/GraphAnalysis.ts`)

### 5. Session Persistence
- **Goal**: Save/load visualization states for comparison and research
- **Status**: ⚠️ Partial (UI buttons exist, full serialization pending)

---

## Target Users

| User Type | Primary Use Case | Key Features |
|-----------|------------------|--------------|
| AI Researchers | Study model reasoning patterns | Graph metrics, export, multi-model comparison |
| Educators | Demonstrate AI thought processes | Interactive visualization, pattern selection |
| Developers | Debug prompt engineering | Structured output inspection, node details |
| General Users | Understand AI responses | Intuitive 3D exploration, chat interface |

---

## Technology Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| TypeScript | 5.0 | Type-safe application code |
| Vite | 5.0 | Build tooling, HMR, dev server |
| Three.js | 0.160 | 3D WebGL rendering |
| mathjs | 12.x | Matrix operations, graph metrics |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime environment |
| Express.js | 4.x | HTTP server, API routing |
| Helmet | 7.x | Security headers |
| cors | 2.x | Cross-origin handling |
| express-rate-limit | 7.x | DoS protection |

### Testing
| Technology | Purpose |
|------------|---------|
| Vitest | Unit/integration testing |
| jsdom | DOM simulation |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Client                          │
├─────────────────────────────────────────────────────────────────┤
│  main.ts → UIController → VisualizationManager → Three.js      │
│              ↓                    ↓                              │
│         StateManager         GraphAnalysis (mathjs)              │
│              ↓                                                   │
│          APIClient                                               │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTP
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express.js Proxy Server                     │
├─────────────────────────────────────────────────────────────────┤
│  /api/chat → Provider Router → Anthropic/Google/OpenAI/Moonshot │
│                    ↓                                             │
│           Thought Extraction (structured + sentence-derived)    │
│                    ↓                                             │
│           Response Normalization                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Key Metrics (Current State)

| Metric | Value |
|--------|-------|
| Source Files | ~20 TypeScript modules |
| Test Coverage | 52 tests passing |
| Build Output | 64 modules, 3 vendor chunks |
| Bundle Size (gzip) | ~150KB (excluding Three.js) |
| Lighthouse Score | Pending measurement |

---

## Quick Links

- [Setup Guide](./02-SETUP-GUIDE.md)
- [Architecture Deep Dive](./03-ARCHITECTURE.md)
- [API Documentation](./04-API-DOCUMENTATION.md)
- [Development Workflow](./05-DEVELOPMENT-WORKFLOW.md)
- [Feature Specifications](./06-FEATURE-SPECIFICATIONS.md)
- [Testing Guide](./07-TESTING-GUIDE.md)
- [Troubleshooting](./08-TROUBLESHOOTING.md)
- [Changelog](./09-CHANGELOG.md)
