# Development Workflow

## Branch Strategy

```
main                    ← Production-ready code
  │
  └── claude/review-architecture-VH8Sx  ← Feature branch (current)
```

### Branch Naming Convention

- Feature: `claude/<description>-<session-id>`
- Bugfix: `fix/<issue-description>`
- Hotfix: `hotfix/<critical-fix>`

---

## Daily Development Cycle

### 1. Start Development Session

```bash
# Ensure on correct branch
git checkout claude/review-architecture-VH8Sx
git pull origin claude/review-architecture-VH8Sx

# Install any new dependencies
npm install

# Start both servers
npm run server &    # Backend on :3001
npm run dev         # Frontend on :3000
```

### 2. Development Loop

```bash
# Make changes to source files

# Type check continuously
npm run type-check

# Run tests
npm test

# Preview in browser
open http://localhost:3000
```

### 3. Commit Changes

```bash
# Stage specific files
git add src/path/to/changed/file.ts

# Commit with descriptive message
git commit -m "feat: description of change"

# Push to remote
git push -u origin claude/review-architecture-VH8Sx
```

---

## NPM Scripts Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `vite` | Start dev server with HMR |
| `build` | `tsc && vite build` | Production build |
| `preview` | `vite preview` | Serve production build |
| `type-check` | `tsc --noEmit` | Type validation only |
| `lint` | `eslint src/` | Code linting |
| `test` | `vitest` | Run test suite |
| `server` | `node server/apiProxy.js` | Start backend proxy |

---

## Code Style Guidelines

### TypeScript

```typescript
// Use explicit types for public APIs
function computeMetrics(nodes: ThoughtNode[]): GraphMetrics {
  // Implementation
}

// Prefer interfaces over types for objects
interface ThoughtNode {
  id: string;
  content: string;
  weight: number;
}

// Use const assertions for literals
const CATEGORIES = ['analysis', 'synthesis', 'recall', 'evaluation'] as const;
```

### File Organization

```
src/
├── main.ts              # Entry point only
├── types/
│   └── index.ts         # All shared types
├── services/
│   ├── api/             # External communication
│   ├── state/           # State management
│   └── analysis/        # Computation modules
├── visualization/       # Three.js rendering
├── ui/                  # DOM interaction
├── utils/               # Pure utility functions
└── styles/              # CSS
```

### Import Order

```typescript
// 1. Node/external modules
import { matrix } from 'mathjs';
import * as THREE from 'three';

// 2. Internal modules (absolute paths with @/)
import { StateManager } from '@/services/state/StateManager';
import { ThoughtNode } from '@/types';

// 3. Relative imports
import './styles.css';
```

---

## Testing Guidelines

### Test File Naming

```
src/services/analysis/GraphAnalysis.ts
tests/unit/GraphAnalysis.test.ts

src/visualization/VisualizationManager.ts
tests/unit/VisualizationManager.test.ts
```

### Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { GraphAnalysis } from '../../src/services/analysis/GraphAnalysis';

describe('GraphAnalysis', () => {
  let analysis: GraphAnalysis;

  beforeEach(() => {
    analysis = new GraphAnalysis();
  });

  describe('computeMetrics', () => {
    it('should return zero metrics for empty graph', () => {
      const result = analysis.computeMetrics([]);
      expect(result.nodeCount).toBe(0);
    });

    it('should compute density correctly', () => {
      const nodes = [/* test data */];
      const result = analysis.computeMetrics(nodes);
      expect(result.density).toBeCloseTo(0.5, 2);
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# Single file
npm test -- GraphAnalysis.test.ts
```

---

## Debugging

### Frontend (Browser)

1. Open Chrome DevTools (F12)
2. Sources tab → webpack://src/
3. Set breakpoints in TypeScript files
4. Console for state inspection

### Backend (Node.js)

```bash
# Start with inspector
node --inspect server/apiProxy.js

# Connect Chrome DevTools to node://
```

### Common Debug Points

| Location | What to Check |
|----------|--------------|
| `UIController.handleMessage()` | Request/response flow |
| `VisualizationManager.addThoughtNodes()` | Node creation |
| `StateManager.dispatch()` | State changes |
| `apiProxy.js:extractStructuredThoughts()` | Thought parsing |

---

## Performance Profiling

### Browser

1. Chrome DevTools → Performance tab
2. Record interaction
3. Analyze flame chart for bottlenecks

### Key Metrics to Monitor

| Metric | Target | Location |
|--------|--------|----------|
| FPS | 60 | Performance stats overlay |
| Node count | <1000 | Right panel stats |
| Memory | <100MB | Performance stats overlay |

### Three.js Optimization

```typescript
// Reuse geometries
const sphereGeometry = new THREE.SphereGeometry(0.3, 16, 16);

// Dispose unused objects
mesh.geometry.dispose();
mesh.material.dispose();

// Batch similar objects
// (future optimization opportunity)
```

---

## Pre-Commit Checklist

- [ ] `npm run type-check` passes
- [ ] `npm test` passes (52+ tests)
- [ ] No console.log() in production code
- [ ] Browser test: visualization renders
- [ ] Browser test: interactions work
- [ ] Browser test: no console errors

---

## Troubleshooting Development Issues

| Issue | Solution |
|-------|----------|
| Port 3000 in use | `lsof -i :3000` then `kill <pid>` |
| Port 3001 in use | `lsof -i :3001` then `kill <pid>` |
| HMR not working | Hard refresh (Ctrl+Shift+R) |
| Types not updating | Restart TypeScript server in IDE |
| Tests failing | Check jsdom mock completeness |
