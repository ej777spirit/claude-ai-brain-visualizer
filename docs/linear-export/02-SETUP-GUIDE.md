# Setup Guide - Reproducibility Documentation

This guide enables complete reproducibility of the AI Brain Visualizer Pro environment for academic reviewers and engineering teams.

---

## Prerequisites

### Required Software

| Software | Minimum Version | Verification Command |
|----------|-----------------|---------------------|
| Node.js | 18.0.0 | `node --version` |
| npm | 9.0.0 | `npm --version` |
| Git | 2.30.0 | `git --version` |

### Recommended Software

| Software | Purpose |
|----------|---------|
| VS Code | IDE with TypeScript support |
| Chrome DevTools | WebGL debugging |

---

## Installation Steps

### 1. Clone Repository

```bash
git clone <repository-url> claude-ai-brain-visualizer
cd claude-ai-brain-visualizer
git checkout claude/review-architecture-VH8Sx
```

### 2. Install Dependencies

```bash
npm install
```

**Expected output**: ~180 packages installed, no critical vulnerabilities

### 3. Verify Installation

```bash
npm run type-check  # Should pass with no errors
npm test            # Should show 52 tests passing
```

---

## Running the Application

### Development Mode (Recommended for First Run)

```bash
# Terminal 1: Start backend proxy
npm run server

# Terminal 2: Start frontend dev server
npm run dev
```

**Access**: http://localhost:3000

### Production Build

```bash
npm run build
npm run preview
```

---

## Environment Configuration

### API Keys (Optional)

The application works in demo mode without API keys. For live AI integration:

```bash
# Create environment file
cp .env.example .env

# Edit with your keys
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=AIza...
MOONSHOT_API_KEY=sk-...
```

### Demo Mode Behavior

Without API keys:
- All requests use simulated responses
- Responses are flagged with `isSimulated: true`
- Thought extraction uses sentence-derived fallback
- Full visualization functionality available

---

## Verification Checklist

### Installation Verification

- [ ] `npm install` completes without errors
- [ ] `npm run type-check` passes
- [ ] `npm test` shows 52 tests passing
- [ ] `npm run build` creates `dist/` directory

### Runtime Verification

- [ ] http://localhost:3000 loads without console errors
- [ ] 3D canvas renders with ambient lighting
- [ ] Typing a question and clicking "Analyze" shows visualization
- [ ] Pattern selector buttons change layout
- [ ] Hovering nodes shows tooltip
- [ ] Clicking nodes shows details in right panel

### Build Artifact Verification

```bash
ls -la dist/
# Expected: index.html, standalone.html, assets/
```

---

## Troubleshooting Quick Reference

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| Blank canvas | WebGL not supported | Use Chrome/Firefox with hardware acceleration |
| "Module not found" | Missing dependencies | Run `npm install` |
| Type errors | TypeScript version mismatch | Use Node 18+ |
| CORS errors | Backend not running | Start `npm run server` first |

See [Troubleshooting Guide](./08-TROUBLESHOOTING.md) for detailed diagnostics.

---

## Academic Reproducibility Notes

### Exact Version Pinning

For bit-exact reproducibility, use:

```bash
npm ci  # Uses package-lock.json exactly
```

### Environment Isolation

```bash
# Recommended: Use Node Version Manager
nvm install 22
nvm use 22
```

### Deterministic Builds

The visualization uses seeded pseudo-random positioning (`seededOffset()` in VisualizationManager.ts) to ensure identical node layouts given identical input graphs.

### Citation

If using this software in academic work:

```bibtex
@software{ai_brain_visualizer,
  title = {AI Brain Visualizer Pro},
  version = {1.0.0},
  year = {2026},
  url = {<repository-url>}
}
```
