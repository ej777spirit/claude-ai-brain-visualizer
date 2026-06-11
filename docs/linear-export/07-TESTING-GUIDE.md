# Testing Guide

## Test Suite Overview

| Category | Test Count | Framework |
|----------|------------|-----------|
| Unit Tests | 52 | Vitest |
| Integration Tests | 0 | Planned |
| E2E Tests | 0 | Planned |

---

## Running Tests

### Full Test Suite

```bash
npm test
```

**Expected Output:**
```
 ✓ tests/unit/GraphAnalysis.test.ts (5)
 ✓ tests/unit/StateManager.test.ts (12)
 ✓ tests/unit/VisualizationManager.test.ts (15)
 ✓ tests/unit/APIClient.test.ts (8)
 ✓ tests/unit/UIController.test.ts (12)

 Test Files  5 passed (5)
      Tests  52 passed (52)
```

### Watch Mode

```bash
npm test -- --watch
```

### Coverage Report

```bash
npm test -- --coverage
```

### Single File

```bash
npm test -- GraphAnalysis.test.ts
```

---

## Test Structure

### Directory Layout

```
tests/
├── unit/
│   ├── GraphAnalysis.test.ts
│   ├── StateManager.test.ts
│   ├── VisualizationManager.test.ts
│   ├── APIClient.test.ts
│   └── UIController.test.ts
├── integration/
│   └── (planned)
└── e2e/
    └── (planned)
```

### Test Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts']
  }
});
```

---

## Unit Test Examples

### GraphAnalysis Tests

```typescript
// tests/unit/GraphAnalysis.test.ts

describe('GraphAnalysis', () => {
  describe('computeMetrics', () => {
    it('should return zero metrics for empty graph', () => {
      const result = analysis.computeMetrics([]);
      expect(result.nodeCount).toBe(0);
      expect(result.edgeCount).toBe(0);
      expect(result.density).toBe(0);
    });

    it('should compute density for connected graph', () => {
      const nodes = [
        { id: 't1', parentId: null, weight: 0.8 },
        { id: 't2', parentId: 't1', weight: 0.9 },
        { id: 't3', parentId: 't1', weight: 0.7 }
      ];
      const result = analysis.computeMetrics(nodes);
      expect(result.density).toBeCloseTo(0.67, 2);
    });

    it('should identify central node by degree', () => {
      const nodes = [
        { id: 't1', parentId: null },
        { id: 't2', parentId: 't1' },
        { id: 't3', parentId: 't1' },
        { id: 't4', parentId: 't1' }
      ];
      const result = analysis.computeMetrics(nodes);
      expect(result.centralNode).toBe('t1');
    });
  });
});
```

### StateManager Tests

```typescript
// tests/unit/StateManager.test.ts

describe('StateManager', () => {
  describe('dispatch', () => {
    it('should update model on SET_MODEL action', () => {
      stateManager.dispatch({ type: 'SET_MODEL', payload: 'gemini' });
      expect(stateManager.select('currentModel')).toBe('gemini');
    });

    it('should notify subscribers on state change', () => {
      const callback = vi.fn();
      stateManager.subscribe('currentModel', callback);
      stateManager.dispatch({ type: 'SET_MODEL', payload: 'gpt' });
      expect(callback).toHaveBeenCalledWith('gpt');
    });
  });
});
```

### VisualizationManager Tests

```typescript
// tests/unit/VisualizationManager.test.ts

describe('VisualizationManager', () => {
  describe('addThoughtNodes', () => {
    it('should create sphere for each thought', () => {
      const thoughts = [
        { id: 't1', content: 'Test', category: 'analysis', weight: 0.8 }
      ];
      visualizationManager.addThoughtNodes(thoughts);
      expect(scene.children.length).toBeGreaterThan(0);
    });
  });

  describe('layoutPosition', () => {
    it('should return different positions for hierarchical pattern', () => {
      const pos1 = visualizationManager.layoutPosition(0, 5, 'hierarchical', 0);
      const pos2 = visualizationManager.layoutPosition(1, 5, 'hierarchical', 1);
      expect(pos1).not.toEqual(pos2);
    });
  });
});
```

---

## Mocking Strategy

### Browser APIs (jsdom)

```typescript
// tests/setup.ts
import { vi } from 'vitest';

// Mock canvas
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  // ... other canvas methods
}));

// Mock WebGL
const mockWebGL = {
  getExtension: vi.fn(),
  createShader: vi.fn(),
  // ... other WebGL methods
};
```

### Three.js

```typescript
// Mock Three.js scene
vi.mock('three', () => ({
  Scene: vi.fn().mockImplementation(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    children: []
  })),
  // ... other Three.js classes
}));
```

### Fetch API

```typescript
// Mock fetch for API tests
global.fetch = vi.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ content: 'test', thoughts: [] })
  })
);
```

---

## Test Data Fixtures

### Standard Thought Nodes

```typescript
// tests/fixtures/thoughts.ts

export const singleNode = {
  id: 't1',
  content: 'Initial analysis',
  category: 'analysis' as const,
  weight: 0.9,
  parentId: null,
  timestamp: Date.now(),
  depth: 0,
  position: { x: 0, y: 0, z: 0 }
};

export const linearChain = [
  { id: 't1', content: 'Step 1', category: 'analysis', weight: 0.9, parentId: null },
  { id: 't2', content: 'Step 2', category: 'synthesis', weight: 0.85, parentId: 't1' },
  { id: 't3', content: 'Step 3', category: 'evaluation', weight: 0.8, parentId: 't2' }
];

export const tree = [
  { id: 't1', content: 'Root', category: 'analysis', weight: 0.9, parentId: null },
  { id: 't2', content: 'Branch A', category: 'recall', weight: 0.8, parentId: 't1' },
  { id: 't3', content: 'Branch B', category: 'recall', weight: 0.75, parentId: 't1' },
  { id: 't4', content: 'Leaf A1', category: 'synthesis', weight: 0.7, parentId: 't2' }
];
```

---

## Coverage Targets

| Module | Current | Target |
|--------|---------|--------|
| GraphAnalysis | 95% | 90% |
| StateManager | 88% | 85% |
| VisualizationManager | 72% | 80% |
| APIClient | 85% | 85% |
| UIController | 65% | 75% |

---

## Testing Best Practices

### DO

- Test behavior, not implementation
- Use descriptive test names
- Keep tests independent
- Test edge cases (empty, single, max)
- Use fixtures for consistent data

### DON'T

- Mock what you don't own
- Test private methods directly
- Rely on test execution order
- Write flaky async tests
- Over-mock dependencies

---

## Adding New Tests

### Checklist

1. [ ] Create test file in `tests/unit/`
2. [ ] Import test utilities and subject
3. [ ] Set up `beforeEach` for fresh instances
4. [ ] Group related tests with `describe`
5. [ ] Name tests clearly: "should [expected behavior]"
6. [ ] Run `npm test` to verify
7. [ ] Check coverage didn't decrease
