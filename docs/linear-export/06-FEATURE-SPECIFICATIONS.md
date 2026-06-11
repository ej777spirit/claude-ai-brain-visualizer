# Feature Specifications

## Feature Index

| ID | Feature | Status | Priority |
|----|---------|--------|----------|
| F001 | Multi-Provider AI Integration | ✅ Complete | P0 |
| F002 | Structured Thought Extraction | ✅ Complete | P0 |
| F003 | 3D Visualization Engine | ✅ Complete | P0 |
| F004 | Visualization Patterns | ✅ Complete | P1 |
| F005 | Graph Analytics | ✅ Complete | P1 |
| F006 | Node Interactivity | ✅ Complete | P1 |
| F007 | Session Persistence | ⚠️ Partial | P2 |
| F008 | Response History Navigation | 📋 Planned | P2 |
| F009 | Multi-Model Comparison | 📋 Planned | P3 |
| F010 | Export Capabilities | 📋 Planned | P3 |

---

## F001: Multi-Provider AI Integration

### Description
Unified interface for querying multiple AI providers through a single API endpoint.

### Supported Providers

| Provider | Model ID | API Version |
|----------|----------|-------------|
| Anthropic (Claude) | `claude-sonnet-4-6` | Messages v1 |
| Google (Gemini) | `gemini-2.0-flash` | GenerativeLanguage v1 |
| OpenAI (GPT) | `gpt-4o` | Chat Completions |
| Moonshot (Kimi) | `moonshot-v1-128k` | Chat Completions |

### Implementation Files
- `server/apiProxy.js` - Provider routing and API calls
- `src/services/api/APIClient.ts` - Client-side interface
- `src/ui/UIController.ts` - Model selector buttons

### User Flow
1. User clicks model selector button (Claude/Gemini/GPT/Kimi)
2. State updates `currentModel`
3. Next message routes to selected provider
4. Response normalized to common format

### Acceptance Criteria
- [x] All four providers callable via `/api/chat`
- [x] Model selector UI updates active state
- [x] Demo fallback when API keys missing
- [x] Error handling for provider failures

---

## F002: Structured Thought Extraction

### Description
Extract meaningful reasoning steps from AI responses, preferring model-reported structure over naive sentence splitting.

### Extraction Methods

#### Primary: Model-Reported
```json
{
  "reasoning_steps": [
    { "step": 1, "thought": "...", "category": "analysis", ... }
  ]
}
```

#### Fallback: Sentence-Derived
- Split response into sentences
- Assign sequential IDs
- Infer categories from keywords
- Linear parent chain

### Category Definitions

| Category | Keywords | Description |
|----------|----------|-------------|
| `analysis` | analyze, examine, consider, evaluate | Breaking down concepts |
| `synthesis` | combine, integrate, build, create | Constructing new ideas |
| `recall` | remember, know, fact, information | Retrieving knowledge |
| `evaluation` | judge, assess, conclude, determine | Making judgments |

### Implementation Files
- `server/apiProxy.js` - `extractStructuredThoughts()`, `normalizeStructuredThoughts()`

### Acceptance Criteria
- [x] Parse JSON blocks from model responses
- [x] Validate parent references
- [x] Clamp confidence to [0,1]
- [x] Fallback to sentence-derived when parsing fails
- [x] Flag `thoughtSource` in response

---

## F003: 3D Visualization Engine

### Description
Real-time 3D rendering of thought graphs using Three.js WebGL.

### Components

| Component | Purpose |
|-----------|---------|
| Scene | Container for all 3D objects |
| PerspectiveCamera | User viewpoint |
| WebGLRenderer | GPU rendering |
| OrbitControls | Mouse/touch interaction |
| AmbientLight | Base illumination |
| PointLight | Dynamic highlights |
| SphereGeometry | Thought nodes |
| LineBasicMaterial | Connections |

### Node Visualization

| Property | Visual Mapping |
|----------|----------------|
| `category` | Node color (see palette) |
| `weight` | Node opacity (0.4–1.0) |
| `depth` | Position in layout |

### Color Palette

```typescript
const categoryColors = {
  analysis: 0x4ECDC4,    // Teal
  synthesis: 0xFFE66D,   // Yellow
  recall: 0x95E1D3,      // Mint
  evaluation: 0xF38181   // Coral
};
```

### Implementation Files
- `src/visualization/VisualizationManager.ts`

### Acceptance Criteria
- [x] Canvas renders without errors
- [x] Nodes positioned according to pattern
- [x] Connections drawn after positioning
- [x] Camera orbits with mouse drag
- [x] 60 FPS on modern hardware

---

## F004: Visualization Patterns

### Description
Four distinct layout algorithms for different analytical perspectives.

### Patterns

#### Hierarchical (Default)
- **Algorithm**: Radial tree layout
- **X**: cos(angle) * depth
- **Y**: Height offset
- **Z**: sin(angle) * depth
- **Use Case**: Parent-child relationships

#### Network
- **Algorithm**: Fibonacci sphere distribution
- **Distribution**: Even coverage of sphere surface
- **Use Case**: Interconnected concepts without hierarchy

#### Timeline
- **Algorithm**: Linear progression
- **X**: Timestamp (normalized)
- **Y/Z**: Offset for readability
- **Use Case**: Temporal reasoning sequence

#### Matrix
- **Algorithm**: 2D grid with depth
- **X/Y**: Grid position
- **Z**: Weight mapping
- **Use Case**: Systematic enumeration

### Implementation Files
- `src/visualization/VisualizationManager.ts` - `layoutPosition()`, `applyPattern()`
- `src/main.ts` - Pattern selector UI

### Acceptance Criteria
- [x] Four pattern buttons in UI
- [x] Clicking pattern re-layouts existing nodes
- [x] Smooth transition (instant for MVP)
- [x] Active pattern highlighted in UI

---

## F005: Graph Analytics

### Description
Compute graph-theoretic metrics that characterize thought structure.

### Metrics

| Metric | Formula | Interpretation |
|--------|---------|----------------|
| Node Count | `n` | Reasoning complexity |
| Edge Count | `e` | Number of connections |
| Density | `2e / (n(n-1))` | Graph completeness |
| Avg Degree | `2e / n` | Connectivity per node |
| Weight Mean | `mean(weights)` | Average confidence |
| Weight Std | `std(weights)` | Confidence variance |
| Max Depth | `max(depths)` | Reasoning chain length |
| Central Node | `argmax(degree)` | Most connected thought |

### Implementation Files
- `src/services/analysis/GraphAnalysis.ts`
- `src/ui/UIController.ts` - `updateMetrics()`

### Acceptance Criteria
- [x] Metrics computed after each visualization
- [x] Results displayed in right panel
- [x] Uses mathjs for matrix operations
- [x] Handles empty graph gracefully

---

## F006: Node Interactivity

### Description
Hover and click interactions with 3D thought nodes.

### Interactions

| Action | Visual Feedback | Data Display |
|--------|-----------------|--------------|
| Hover | Tooltip with content | - |
| Click | Selection highlight | Node details panel |

### Implementation Details
- **Raycaster**: Detects mouse intersection with spheres
- **Tooltip**: Positioned at mouse coordinates
- **Selection**: Emissive material highlight
- **Callback**: `setNodeSelectionHandler()` for UI integration

### Implementation Files
- `src/visualization/VisualizationManager.ts` - `setupInteraction()`
- `src/ui/UIController.ts` - `showNodeDetails()`

### Acceptance Criteria
- [x] Tooltip appears on hover
- [x] Tooltip follows mouse
- [x] Click selects node
- [x] Selected node highlighted
- [x] Details shown in right panel
- [x] AbortController cleanup on dispose

---

## F007: Session Persistence

### Description
Save and load visualization states for comparison and research.

### Current State
- UI buttons exist (Save, Load, Export)
- State serialization scaffolded
- Full implementation pending

### Planned Functionality

| Feature | Format | Status |
|---------|--------|--------|
| Save session | JSON file | 📋 Planned |
| Load session | JSON file | 📋 Planned |
| Export image | PNG | 📋 Planned |
| Export data | CSV | 📋 Planned |

---

## F008–F010: Future Features

### F008: Response History Navigation
- Navigate through previous queries
- Compare visualizations side-by-side

### F009: Multi-Model Comparison
- Send same query to multiple models
- Render comparative visualization

### F010: Export Capabilities
- PNG screenshot
- SVG vector export
- CSV data export
- JSON full state export
