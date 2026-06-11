# Linear Import Script

Automated import of the `AI Super Brain Visualizer` project documentation into Linear.

## What it creates

In one run, this script populates your Linear workspace with:

- **1 project**: `AI Super Brain Visualizer` (lead = you)
- **11 project documents**: every `.md` file from `docs/linear-export/`
- **4 project milestones**: Foundation → Enhancement → Polish → Advanced
- **8 labels**: feature, bug, docs, frontend, backend, analytics, research, security
- **10 feature issues** (F001–F010): each with priority, labels, milestone, workflow state, and the feature spec section as description

## Prerequisites

- Node.js 18+ (uses native `fetch`)
- A Linear **personal API key**
  - Linear → Settings → Security & access → Personal API keys → New API key

## Run

```bash
# Dry run — shows what would be created, no API writes
LINEAR_API_KEY=lin_api_xxxxxxxx node scripts/import-to-linear.mjs --dry-run

# Real run (single-team workspace)
LINEAR_API_KEY=lin_api_xxxxxxxx node scripts/import-to-linear.mjs

# Multi-team workspace — specify which team
LINEAR_API_KEY=lin_api_xxxxxxxx node scripts/import-to-linear.mjs --team ENG
```

## After import

Visit the project URL printed at the end. Recommended follow-ups:

1. Assign yourself or teammates as issue assignees
2. Set project start/target dates
3. Add cycles for in-progress milestones
4. Revoke the API key in Linear settings (it's only needed for this one-time run)

## Re-running

The script is **not idempotent** by default — re-running will create a second project, duplicate milestones, and duplicate issues. Labels are skipped if they already exist on the team.

To re-import cleanly, delete the project in Linear first, then run again.

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Unauthorized` | Bad/expired API key | Generate a new key |
| `Team with key "X" not found` | Wrong `--team` arg | Run without `--team` to list available teams |
| `Multiple teams found` | Workspace has >1 team | Pick one with `--team <KEY>` |
| `documentCreate not found` | Linear API schema drift | Check Linear's changelog; the `Document` API may have moved |
