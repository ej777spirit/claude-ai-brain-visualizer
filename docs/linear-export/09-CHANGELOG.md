# Changelog

All notable changes to AI Brain Visualizer Pro are documented in this file.

---

## [1.0.0] - 2026-06-11

### Summary
Major release implementing structured thought extraction, visualization patterns, graph analytics, and node interactivity. Fixed critical bug where TypeScript application was never loaded due to legacy standalone HTML.

### Added

#### Structured Thought Extraction (F002)
- `STRUCTURE_INSTRUCTION` prompt requesting JSON-formatted reasoning from models
- `extractStructuredThoughts()` function to parse ` ```json` blocks from responses
- `normalizeStructuredThoughts()` function to repair malformed data:
  - Invalid parent references → null
  - Missing categories → inferred or "recall"
  - Confidence out of range → clamped to [0, 1]
- `thoughtSource` field in API response: "model-reported" or "sentence-derived"
- Fallback to sentence-derived extraction when structured output unavailable

#### Visualization Patterns (F004)
- Four layout algorithms:
  - **Hierarchical**: Radial tree (root center, depth = radius)
  - **Network**: Fibonacci sphere distribution
  - **Timeline**: X = timestamp, Y/Z = offset
  - **Matrix**: 2D grid, Z = weight
- Pattern selector UI in visualization panel
- `applyPattern()` method for re-layout without data reload
- `seededOffset()` for deterministic pseudo-random positioning

#### Graph Analytics (F005)
- New `GraphAnalysis` service using mathjs
- Metrics computed:
  - Node count, edge count
  - Density: `2e / (n(n-1))`
  - Average degree: `2e / n`
  - Weight mean and standard deviation
  - Max depth
  - Central node (highest degree)
- Adjacency matrix construction with symmetric edges
- Metrics panel in right sidebar

#### Node Interactivity (F006)
- Raycaster-based hover detection
- Tooltip following mouse cursor
- Click selection with emissive highlight
- `setNodeSelectionHandler()` callback for UI integration
- Node details panel showing:
  - Content, category, weight
  - Parent reference
  - Timestamp

### Changed

#### Entry Point Architecture
- **BREAKING**: `index.html` now loads TypeScript via Vite module
- Legacy 1,560-line standalone app moved to `standalone.html`
- Build now produces 64 modules with proper chunk splitting

#### Model Updates
- Anthropic: `claude-3-sonnet-20240229` → `claude-sonnet-4-6`
- Google: `gemini-pro` → `gemini-2.0-flash`
- OpenAI: `gpt-4` → `gpt-4o`

#### State Management
- `THINKING_FINISHED` action now populates `knowledgeGraph.nodes` and `nodeMap`
- Fixed Set serialization: `Array.from(set)` instead of `.entries()`

### Fixed

#### Critical Bugs
- **TypeScript app never loaded**: index.html inline JS shadowed module entry
- **Connections at origin**: createConnection() called before positionNodes()
- **Lights stacking on reset**: clearScene() disposed then re-added lights
- **XSS vulnerability**: innerHTML injection → textContent/createElement
- **Demo mode not flagged**: Added `isSimulated: true` to simulated responses

#### Build Issues
- Removed duplicate `vite.config.js` (kept `.ts` version)
- Added `standalone.html` as second entry point
- Added `mathjs` to manual chunks

### Security

- XSS: Response content rendered via `textContent` instead of `innerHTML`
- Node details use safe DOM construction with `createElement`

### Tests

- 52 tests passing
- Added `GraphAnalysis.test.ts` with 5 test cases
- Type-check passing with no errors

---

## [0.1.0] - 2026-06-01

### Initial Development

- Project scaffolding with Vite + TypeScript
- Three.js 3D visualization setup
- Express.js API proxy with multi-provider support
- StateManager with observer pattern
- Basic UI layout (left/middle/right panels)
- Demo mode with simulated responses

---

## Upgrade Notes

### From 0.1.0 to 1.0.0

1. **Entry point change**: If you have custom builds referencing `index.html`, update to use the new Vite module entry

2. **Model IDs**: If hardcoding model IDs, update to:
   - `claude-sonnet-4-6`
   - `gemini-2.0-flash`
   - `gpt-4o`

3. **API response format**: Check for new fields:
   - `thoughtSource`: string
   - `isSimulated`: boolean

4. **Standalone access**: Legacy standalone available at `/standalone.html`

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/):
- MAJOR: Incompatible API changes
- MINOR: Backwards-compatible functionality
- PATCH: Backwards-compatible bug fixes
