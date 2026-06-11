# Architecture Deep Dive

## System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER CLIENT                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────────────────────┐ │
│  │   main.ts   │───▶│ UIController │───▶│    VisualizationManager        │ │
│  │ (entry)     │    │              │    │    ├── Three.js Scene          │ │
│  └─────────────┘    │ Event        │    │    ├── Raycaster (interaction) │ │
│                     │ Handlers     │    │    ├── Layout Algorithms       │ │
│                     │              │    │    └── Animation Loop          │ │
│                     └──────┬───────┘    └─────────────────────────────────┘ │
│                            │                                                │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        StateManager                                  │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │ AppState {                                                      │ │   │
│  │  │   scene, camera, renderer,                                      │ │   │
│  │  │   currentModel, currentPattern, currentResearchMode,            │ │   │
│  │  │   isThinking, responseHistory, currentResponseIndex,            │ │   │
│  │  │   apiConfig, knowledgeGraph, ui                                 │ │   │
│  │  │ }                                                               │ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  │  Observers: Map<keyof AppState, Set<Function>>                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         APIClient                                    │   │
│  │  ├── sendMessage(prompt, model, researchMode)                       │   │
│  │  ├── checkHealth()                                                   │   │
│  │  └── AbortController for request cancellation                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                │
└────────────────────────────│────────────────────────────────────────────────┘
                             │ HTTP POST /api/chat
                             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                           EXPRESS.JS SERVER                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Middleware Stack                                                     │   │
│  │  1. Helmet (security headers)                                        │   │
│  │  2. CORS (localhost:3000 allowed)                                    │   │
│  │  3. express-rate-limit (100 req/15min)                               │   │
│  │  4. express.json() (body parsing)                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                │
│                            ▼                                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ POST /api/chat Handler                                               │   │
│  │  1. Extract { prompt, model, researchMode } from body                │   │
│  │  2. Route to provider (anthropic|google|openai|moonshot)             │   │
│  │  3. Call provider API with STRUCTURE_INSTRUCTION prompt              │   │
│  │  4. extractStructuredThoughts() - parse JSON from response           │   │
│  │  5. normalizeStructuredThoughts() - repair malformed data            │   │
│  │  6. shapeProviderResponse() - fallback to sentence-derived           │   │
│  │  7. Return { content, thoughts[], thoughtSource, isSimulated }       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                            │                                                │
└────────────────────────────│────────────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL AI PROVIDERS                                │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │  Anthropic  │  │   Google    │  │   OpenAI    │  │  Moonshot   │       │
│  │ claude-     │  │ gemini-2.0- │  │   gpt-4o    │  │ moonshot-   │       │
│  │ sonnet-4-6  │  │ flash       │  │             │  │ v1-128k     │       │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘       │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Module Dependency Graph

```
src/
├── main.ts ─────────────────────────────────────────────────────────────┐
│   imports: StateManager, APIClient, VisualizationManager,              │
│            UIController, AccessibilityManager, types                   │
│                                                                        │
├── ui/                                                                  │
│   └── UIController.ts ◄────────────────────────────────────────────────┤
│       imports: StateManager, APIClient, VisualizationManager,          │
│                GraphAnalysis, types                                    │
│                                                                        │
├── visualization/                                                       │
│   └── VisualizationManager.ts ◄────────────────────────────────────────┤
│       imports: three, types                                            │
│                                                                        │
├── services/                                                            │
│   ├── state/                                                           │
│   │   └── StateManager.ts ◄────────────────────────────────────────────┤
│   │       imports: types                                               │
│   │                                                                    │
│   ├── api/                                                             │
│   │   └── APIClient.ts ◄───────────────────────────────────────────────┤
│   │       imports: types                                               │
│   │                                                                    │
│   └── analysis/                                                        │
│       └── GraphAnalysis.ts ◄───────────────────────────────────────────┤
│           imports: mathjs, types                                       │
│                                                                        │
├── utils/                                                               │
│   └── Accessibility.ts ◄───────────────────────────────────────────────┤
│                                                                        │
├── types/                                                               │
│   └── index.ts ◄───────────────────────────────────────────────────────┘
│       (shared type definitions, no imports)
│
└── styles/
    └── main.css (imported by main.ts)
```

---

## State Management Pattern

The application uses an **Observer Pattern** for state management, implemented in `StateManager`:

```typescript
class StateManager {
  private state: AppState;
  private observers: Map<keyof AppState, Set<(value: any) => void>>;

  subscribe<K extends keyof AppState>(key: K, callback: (value: AppState[K]) => void): () => void
  dispatch(action: StateAction): void
  getState(): AppState
  select<K extends keyof AppState>(key: K): AppState[K]
}
```

### State Actions

| Action Type | Payload | Effect |
|-------------|---------|--------|
| `SET_MODEL` | `AIModel` | Updates `currentModel` |
| `SET_API_KEY` | `{ provider, apiKey }` | Configures API credentials |
| `THINKING_STARTED` | `void` | Sets `isThinking: true` |
| `THINKING_FINISHED` | `{ thoughts: ThoughtNode[] }` | Populates `knowledgeGraph`, sets `isThinking: false` |
| `PATTERN_CHANGED` | `string` | Updates `currentPattern`, triggers re-layout |
| `ADD_RESPONSE` | `APIResponse` | Appends to `responseHistory` |
| `TOGGLE_SIDEBAR` | `void` | Toggles `ui.sidebarOpen` |

---

## Visualization Pipeline

### Node Creation Flow

```
APIResponse.thoughts[]
       │
       ▼
┌──────────────────────────────────────┐
│ VisualizationManager.addThoughtNodes │
│   for each thought:                  │
│     1. Create SphereGeometry         │
│     2. Apply category color          │
│     3. Add to scene + nodeMap        │
│     4. Track in disposables          │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ positionNodes(pattern)               │
│   layoutPosition() computes (x,y,z)  │
│   seededOffset() adds determinism    │
└──────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ createConnection()                   │
│   for each thought with parentId:    │
│     1. Look up parent in nodeMap     │
│     2. Create LineBasicMaterial      │
│     3. Draw line between centers     │
└──────────────────────────────────────┘
```

### Layout Algorithms

| Pattern | Algorithm | Visual Characteristic |
|---------|-----------|----------------------|
| `hierarchical` | Radial tree, depth = radius | Root center, leaves outer |
| `network` | Fibonacci sphere distribution | Even sphere coverage |
| `timeline` | X = timestamp, Y/Z = offset | Left-to-right progression |
| `matrix` | Grid layout, Z = weight | Regular 2D grid with depth |

---

## Thought Extraction Pipeline

### Structured Output Prompting

```javascript
const STRUCTURE_INSTRUCTION = `
After your response, include a JSON block:
\`\`\`json
{
  "reasoning_steps": [
    {
      "step": 1,
      "thought": "description",
      "category": "analysis|synthesis|recall|evaluation",
      "parent_step": null,
      "confidence": 0.0-1.0
    }
  ]
}
\`\`\`
`;
```

### Extraction Priority

1. **Model-reported** (preferred): Parse ````json` block from response
2. **Sentence-derived** (fallback): Split response into sentences, assign synthetic structure

### Normalization

`normalizeStructuredThoughts()` repairs common issues:
- Invalid `parent_step` references → set to `null`
- Missing `category` → infer from keywords or default to `"recall"`
- `confidence` out of range → clamp to [0, 1]

---

## Graph Analytics

### Metrics Computed

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| Node Count | `n = thoughts.length` | Reasoning complexity |
| Edge Count | `e = sum(hasParent)` | Connectivity |
| Density | `2e / (n(n-1))` | Completeness of connections |
| Avg Degree | `2e / n` | Average connections per node |
| Weight Mean | `mean(confidence)` | Overall certainty |
| Weight Std | `std(confidence)` | Certainty variance |
| Max Depth | `max(depth)` | Reasoning chain length |
| Central Node | `argmax(degree)` | Most connected concept |

### Implementation

Uses mathjs for matrix operations:
- Adjacency matrix: `matrix(n x n)` with symmetric edges
- Degree vector: `multiply(A, ones(n))`
- Density: scalar computation

---

## Security Measures

### Server-Side

| Measure | Implementation |
|---------|----------------|
| XSS Prevention | Response `textContent` not `innerHTML` |
| CORS | Whitelist `localhost:3000` only |
| Rate Limiting | 100 requests per 15 minutes |
| Security Headers | Helmet middleware |
| Input Validation | Prompt length limits |

### Client-Side

| Measure | Implementation |
|---------|----------------|
| Safe DOM | `textContent` + `createElement` |
| Request Cancellation | `AbortController` on new requests |
| Error Boundaries | Try-catch in async handlers |
