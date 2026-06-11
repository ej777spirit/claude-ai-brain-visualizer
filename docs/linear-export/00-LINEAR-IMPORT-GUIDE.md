# Linear Import Guide

This folder contains comprehensive project documentation designed for import into Linear as a project folder.

> **Linear project name**: `AI Super Brain Visualizer`

---

## Document Structure

| File | Linear Equivalent | Purpose |
|------|-------------------|---------|
| `01-PROJECT-OVERVIEW.md` | Project Description | Executive summary, objectives, stack |
| `02-SETUP-GUIDE.md` | Document/Wiki | Reproducibility for academics/engineers |
| `03-ARCHITECTURE.md` | Document/Wiki | System design, module dependencies |
| `04-API-DOCUMENTATION.md` | Document/Wiki | Endpoint specs, schemas |
| `05-DEVELOPMENT-WORKFLOW.md` | Document/Wiki | Daily workflow, git, scripts |
| `06-FEATURE-SPECIFICATIONS.md` | Issues/Epics | Feature definitions, status |
| `07-TESTING-GUIDE.md` | Document/Wiki | Test strategy, examples |
| `08-TROUBLESHOOTING.md` | Document/Wiki | Diagnostic procedures |
| `09-CHANGELOG.md` | Document/Wiki | Version history |

---

## Linear Setup Instructions

### 1. Create Project

1. Open Linear workspace
2. Navigate to Projects
3. Create new project: **"AI Super Brain Visualizer"**
   (Linear project folder name — the codebase/app itself remains "AI Brain Visualizer Pro")
4. Set project lead, team, and dates

### 2. Add Project Documents

For each `.md` file:
1. Open project → Documents
2. Create new document
3. Paste markdown content
4. Organize in folder structure

### 3. Create Issues from Features

From `06-FEATURE-SPECIFICATIONS.md`, create issues:

| Issue Title | Status | Priority | Labels |
|-------------|--------|----------|--------|
| F001: Multi-Provider AI Integration | Done | P0 | feature, backend |
| F002: Structured Thought Extraction | Done | P0 | feature, backend |
| F003: 3D Visualization Engine | Done | P0 | feature, frontend |
| F004: Visualization Patterns | Done | P1 | feature, frontend |
| F005: Graph Analytics | Done | P1 | feature, analytics |
| F006: Node Interactivity | Done | P1 | feature, frontend |
| F007: Session Persistence | In Progress | P2 | feature, frontend |
| F008: Response History | Backlog | P2 | feature, frontend |
| F009: Multi-Model Comparison | Backlog | P3 | feature, research |
| F010: Export Capabilities | Backlog | P3 | feature, export |

### 4. Set Up Cycles

Create cycles for development phases:

**Cycle 1: Foundation (Complete)**
- F001, F002, F003

**Cycle 2: Enhancement (Complete)**
- F004, F005, F006

**Cycle 3: Polish (Current)**
- F007, F008

**Cycle 4: Advanced (Future)**
- F009, F010

### 5. Configure Labels

Create these labels:
- `feature` - New functionality
- `bug` - Defect fix
- `docs` - Documentation
- `frontend` - Client-side
- `backend` - Server-side
- `analytics` - Metrics/analysis
- `research` - Experimental

---

## Using This Documentation

### As Project Dashboard

- `01-PROJECT-OVERVIEW.md` is your single source of truth
- Quick links section provides navigation
- Status table shows completion at a glance

### As Operation Manual

- `02-SETUP-GUIDE.md` for environment setup
- `05-DEVELOPMENT-WORKFLOW.md` for daily operations
- `08-TROUBLESHOOTING.md` for issue resolution

### For Academic Reproducibility

- `02-SETUP-GUIDE.md` - Exact version pinning, deterministic builds
- `03-ARCHITECTURE.md` - System design documentation
- `07-TESTING-GUIDE.md` - Validation procedures
- Citation format included in setup guide

### For Engineering Reproducibility

- `02-SETUP-GUIDE.md` - Step-by-step installation
- `04-API-DOCUMENTATION.md` - Integration specs
- `05-DEVELOPMENT-WORKFLOW.md` - Development environment
- `09-CHANGELOG.md` - Version compatibility

---

## Keeping Documentation Updated

### After Each Release

1. Update `09-CHANGELOG.md` with changes
2. Update feature status in `06-FEATURE-SPECIFICATIONS.md`
3. Review `03-ARCHITECTURE.md` for structural changes
4. Sync Linear issues with current state

### Monthly Review

- Verify all links work
- Update statistics/metrics
- Archive completed cycles
- Plan next cycle issues

---

## Template Improvements

This documentation improves on typical project templates by:

1. **Multi-Purpose Design**: Same docs serve dashboard, manual, and reproducibility needs
2. **Linked Structure**: Clear navigation between related sections
3. **Executable Examples**: Copy-paste commands, not just descriptions
4. **Diagnostic Procedures**: Step-by-step troubleshooting, not just "contact support"
5. **Version Awareness**: Explicit upgrade paths and compatibility notes
