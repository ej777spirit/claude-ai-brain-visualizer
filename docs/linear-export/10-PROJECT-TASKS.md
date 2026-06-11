# Project Tasks & Roadmap

## Current Sprint (2026-06-11)

### Completed This Session

| Task | Type | Status | Commit |
|------|------|--------|--------|
| Architecture review | Analysis | ✅ Done | - |
| Root cause diagnosis: TS app not loading | Bug | ✅ Fixed | 633f69e |
| Entry point restructure (index.html → module) | Fix | ✅ Done | 633f69e |
| Structured thought extraction | Feature | ✅ Done | 633f69e |
| Four visualization patterns | Feature | ✅ Done | 633f69e |
| Graph analytics (mathjs) | Feature | ✅ Done | 633f69e |
| Node interactivity | Feature | ✅ Done | 633f69e |
| XSS vulnerability fix | Security | ✅ Done | 633f69e |
| Model ID updates | Maintenance | ✅ Done | 633f69e |
| Documentation suite | Docs | ✅ Done | - |

---

## Backlog

### Priority 0 - Critical

| Task | Type | Assignee | Notes |
|------|------|----------|-------|
| - | - | - | No critical items |

### Priority 1 - High

| Task | Type | Estimate | Notes |
|------|------|----------|-------|
| Complete session persistence | Feature | 2d | Save/load JSON state |
| Add animated pattern transitions | Enhancement | 1d | GSAP or Three.js tween |
| WebGL fallback for mobile | Compatibility | 1d | Canvas 2D backup |

### Priority 2 - Medium

| Task | Type | Estimate | Notes |
|------|------|----------|-------|
| Response history navigation | Feature | 2d | Navigate prior queries |
| PNG/SVG export | Feature | 1d | Screenshot + vector |
| CSV data export | Feature | 0.5d | Thought data dump |
| Accessibility audit | Enhancement | 1d | ARIA, keyboard nav |
| Performance optimization | Technical | 2d | Batch rendering, LOD |

### Priority 3 - Low

| Task | Type | Estimate | Notes |
|------|------|----------|-------|
| Multi-model comparison view | Feature | 3d | Side-by-side render |
| Custom color themes | Enhancement | 1d | Theme configuration |
| Touch gesture support | Compatibility | 1d | Pinch zoom, swipe |
| Offline mode | Feature | 2d | Service worker cache |
| Plugin architecture | Architecture | 5d | Custom analyzers |

---

## Technical Debt

| Item | Severity | Location | Remediation |
|------|----------|----------|-------------|
| Test coverage < 80% | Low | `src/ui/`, `src/visualization/` | Add integration tests |
| No E2E tests | Medium | - | Add Playwright/Cypress |
| Magic numbers in layout | Low | `VisualizationManager.ts` | Extract constants |
| Console.log statements | Low | Various | Remove or convert to debug |
| API key in env (not secrets) | Medium | `.env` | Use secrets manager |

---

## Completed Milestones

### Milestone 1: Foundation
**Date**: 2026-06-01
- Project scaffolding
- Three.js integration
- Express proxy setup
- Basic UI layout

### Milestone 2: Core Features
**Date**: 2026-06-11
- Structured thought extraction
- Visualization patterns
- Graph analytics
- Node interactivity
- Entry point fix

---

## Upcoming Milestones

### Milestone 3: Polish
**Target**: 2026-06-25
- Session persistence complete
- Export capabilities
- Performance optimization
- Accessibility compliance

### Milestone 4: Advanced Research
**Target**: 2026-07-15
- Multi-model comparison
- Custom analyzers
- Academic publication support

---

## Sprint Planning Template

### Sprint [N]: [Name]
**Dates**: YYYY-MM-DD to YYYY-MM-DD
**Goal**: [One sentence objective]

| Task | Assignee | Points | Status |
|------|----------|--------|--------|
| | | | |

**Retrospective**:
- What went well:
- What to improve:
- Action items:

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Model API changes | Medium | High | Abstract provider layer |
| WebGL compatibility | Low | Medium | Canvas 2D fallback |
| Rate limit changes | Medium | Medium | Caching layer |
| Package vulnerabilities | Medium | High | Regular npm audit |
| Browser API deprecation | Low | Low | Polyfills |

---

## Definition of Done

A task is "Done" when:
- [ ] Code implemented and type-checking
- [ ] Unit tests passing
- [ ] Manual testing completed
- [ ] No console errors
- [ ] Documentation updated (if applicable)
- [ ] Code reviewed (if applicable)
- [ ] Committed to feature branch
