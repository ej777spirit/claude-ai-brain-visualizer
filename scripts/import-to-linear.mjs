#!/usr/bin/env node
/**
 * Linear Project Import Script
 *
 * Creates the "AI Super Brain Visualizer" project in Linear and populates it
 * with documents, issues, milestones, and labels from docs/linear-export/.
 *
 * Usage:
 *   LINEAR_API_KEY=lin_api_... node scripts/import-to-linear.mjs [--team TEAM_KEY] [--dry-run]
 *
 * Requirements: Node 18+ (uses native fetch)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR = path.resolve(__dirname, '../docs/linear-export');
const PROJECT_NAME = 'AI Super Brain Visualizer';
const PROJECT_DESCRIPTION =
  '3D visualization of AI reasoning processes across multiple model providers. ' +
  'See project documents for complete operation manual, architecture, and reproducibility guides.';

const API_KEY = process.env.LINEAR_API_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
const teamFlagIdx = process.argv.indexOf('--team');
const TEAM_KEY_ARG = teamFlagIdx >= 0 ? process.argv[teamFlagIdx + 1] : null;

if (!API_KEY) {
  console.error('ERROR: LINEAR_API_KEY environment variable required');
  console.error('Get a key at: https://linear.app/settings/api');
  process.exit(1);
}

// ---------- GraphQL helper ----------
async function gql(query, variables = {}) {
  const res = await fetch('https://api.linear.app/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });
  const body = await res.json();
  if (body.errors) {
    throw new Error('Linear API error: ' + JSON.stringify(body.errors, null, 2));
  }
  return body.data;
}

// ---------- Issue / milestone definitions ----------
const LABELS = [
  { name: 'feature', color: '#5e6ad2' },
  { name: 'bug', color: '#eb5757' },
  { name: 'docs', color: '#26b5ce' },
  { name: 'frontend', color: '#f2c94c' },
  { name: 'backend', color: '#27ae60' },
  { name: 'analytics', color: '#9b51e0' },
  { name: 'research', color: '#bb87fc' },
  { name: 'security', color: '#e74c3c' },
];

const FEATURES = [
  { id: 'F001', title: 'Multi-Provider AI Integration', priority: 1, state: 'Done',         labels: ['feature', 'backend'],   milestone: 'Foundation' },
  { id: 'F002', title: 'Structured Thought Extraction', priority: 1, state: 'Done',         labels: ['feature', 'backend'],   milestone: 'Foundation' },
  { id: 'F003', title: '3D Visualization Engine',       priority: 1, state: 'Done',         labels: ['feature', 'frontend'],  milestone: 'Foundation' },
  { id: 'F004', title: 'Visualization Patterns',        priority: 2, state: 'Done',         labels: ['feature', 'frontend'],  milestone: 'Enhancement' },
  { id: 'F005', title: 'Graph Analytics',               priority: 2, state: 'Done',         labels: ['feature', 'analytics'], milestone: 'Enhancement' },
  { id: 'F006', title: 'Node Interactivity',            priority: 2, state: 'Done',         labels: ['feature', 'frontend'],  milestone: 'Enhancement' },
  { id: 'F007', title: 'Session Persistence',           priority: 3, state: 'In Progress',  labels: ['feature', 'frontend'],  milestone: 'Polish' },
  { id: 'F008', title: 'Response History Navigation',   priority: 3, state: 'Backlog',      labels: ['feature', 'frontend'],  milestone: 'Polish' },
  { id: 'F009', title: 'Multi-Model Comparison',        priority: 4, state: 'Backlog',      labels: ['feature', 'research'],  milestone: 'Advanced' },
  { id: 'F010', title: 'Export Capabilities',           priority: 4, state: 'Backlog',      labels: ['feature', 'frontend'],  milestone: 'Advanced' },
];

const MILESTONES = [
  { name: 'Foundation',  description: 'Core multi-provider integration, extraction, 3D engine' },
  { name: 'Enhancement', description: 'Patterns, analytics, interactivity' },
  { name: 'Polish',      description: 'Persistence, history, performance, accessibility' },
  { name: 'Advanced',    description: 'Multi-model comparison, export, research features' },
];

// ---------- Main ----------
async function main() {
  console.log(`${DRY_RUN ? '[DRY RUN] ' : ''}Importing "${PROJECT_NAME}" into Linear\n`);

  // 1. Identify viewer and team
  const { viewer, teams } = await gql(`
    query {
      viewer { id name email }
      teams { nodes { id key name } }
    }
  `);
  console.log(`Authenticated as: ${viewer.name} <${viewer.email}>`);

  let team;
  if (TEAM_KEY_ARG) {
    team = teams.nodes.find((t) => t.key === TEAM_KEY_ARG);
    if (!team) throw new Error(`Team with key "${TEAM_KEY_ARG}" not found`);
  } else if (teams.nodes.length === 1) {
    team = teams.nodes[0];
  } else {
    console.log('\nAvailable teams:');
    teams.nodes.forEach((t) => console.log(`  - ${t.key}: ${t.name}`));
    throw new Error('Multiple teams found. Re-run with --team <KEY>');
  }
  console.log(`Using team: ${team.key} (${team.name})\n`);

  if (DRY_RUN) {
    console.log('Would create:');
    console.log(`  - 1 project: "${PROJECT_NAME}"`);
    const docFiles = (await fs.readdir(DOCS_DIR)).filter((f) => f.endsWith('.md'));
    console.log(`  - ${docFiles.length} project documents`);
    console.log(`  - ${MILESTONES.length} project milestones`);
    console.log(`  - ${LABELS.length} labels`);
    console.log(`  - ${FEATURES.length} issues`);
    return;
  }

  // 2. Fetch workflow states for this team
  const { workflowStates } = await gql(
    `query($teamId: String!) {
       workflowStates(filter: { team: { id: { eq: $teamId } } }) {
         nodes { id name type }
       }
     }`,
    { teamId: team.id }
  );
  const stateByName = (name) => {
    const exact = workflowStates.nodes.find((s) => s.name.toLowerCase() === name.toLowerCase());
    if (exact) return exact.id;
    // Fuzzy fallback by type
    const typeMap = { Done: 'completed', 'In Progress': 'started', Backlog: 'backlog' };
    const t = typeMap[name];
    const fuzzy = workflowStates.nodes.find((s) => s.type === t);
    return fuzzy?.id;
  };

  // 3. Create project
  console.log('Creating project...');
  const { projectCreate } = await gql(
    `mutation($input: ProjectCreateInput!) {
       projectCreate(input: $input) { success project { id name url } }
     }`,
    {
      input: {
        name: PROJECT_NAME,
        description: PROJECT_DESCRIPTION,
        teamIds: [team.id],
        leadId: viewer.id,
      },
    }
  );
  const project = projectCreate.project;
  console.log(`  ✓ ${project.name} → ${project.url}\n`);

  // 4. Create labels (team-scoped)
  console.log('Creating labels...');
  const labelIds = {};
  const { issueLabels } = await gql(
    `query($teamId: String!) {
       issueLabels(filter: { team: { id: { eq: $teamId } } }) { nodes { id name } }
     }`,
    { teamId: team.id }
  );
  for (const lbl of LABELS) {
    const existing = issueLabels.nodes.find((l) => l.name === lbl.name);
    if (existing) {
      labelIds[lbl.name] = existing.id;
      console.log(`  • ${lbl.name} (exists)`);
      continue;
    }
    const { issueLabelCreate } = await gql(
      `mutation($input: IssueLabelCreateInput!) {
         issueLabelCreate(input: $input) { success issueLabel { id name } }
       }`,
      { input: { name: lbl.name, color: lbl.color, teamId: team.id } }
    );
    labelIds[lbl.name] = issueLabelCreate.issueLabel.id;
    console.log(`  ✓ ${lbl.name}`);
  }
  console.log('');

  // 5. Create project milestones
  console.log('Creating milestones...');
  const milestoneIds = {};
  for (const [i, ms] of MILESTONES.entries()) {
    const { projectMilestoneCreate } = await gql(
      `mutation($input: ProjectMilestoneCreateInput!) {
         projectMilestoneCreate(input: $input) { success projectMilestone { id name } }
       }`,
      {
        input: {
          projectId: project.id,
          name: ms.name,
          description: ms.description,
          sortOrder: i * 1000,
        },
      }
    );
    milestoneIds[ms.name] = projectMilestoneCreate.projectMilestone.id;
    console.log(`  ✓ ${ms.name}`);
  }
  console.log('');

  // 6. Upload markdown files as project documents
  console.log('Uploading documents...');
  const docFiles = (await fs.readdir(DOCS_DIR)).filter((f) => f.endsWith('.md')).sort();
  for (const file of docFiles) {
    const content = await fs.readFile(path.join(DOCS_DIR, file), 'utf-8');
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : file.replace(/\.md$/, '');
    const { documentCreate } = await gql(
      `mutation($input: DocumentCreateInput!) {
         documentCreate(input: $input) { success document { id title url } }
       }`,
      { input: { title, content, projectId: project.id } }
    );
    console.log(`  ✓ ${file} → "${documentCreate.document.title}"`);
  }
  console.log('');

  // 7. Create feature issues
  console.log('Creating issues...');
  const featureSpec = await fs.readFile(path.join(DOCS_DIR, '06-FEATURE-SPECIFICATIONS.md'), 'utf-8');
  for (const f of FEATURES) {
    // Pull the section for this feature from the spec doc
    const sectionRegex = new RegExp(`## ${f.id}:[\\s\\S]*?(?=\\n## |$)`, 'm');
    const section = featureSpec.match(sectionRegex)?.[0] ?? '';
    const description =
      `**Feature ID:** ${f.id}\n` +
      `**Status:** ${f.state}\n` +
      `**Priority:** P${f.priority - 1}\n` +
      `**Milestone:** ${f.milestone}\n\n` +
      '---\n\n' +
      section;

    const labelIdList = f.labels.map((n) => labelIds[n]).filter(Boolean);
    const stateId = stateByName(f.state);
    const milestoneId = milestoneIds[f.milestone];

    const { issueCreate } = await gql(
      `mutation($input: IssueCreateInput!) {
         issueCreate(input: $input) { success issue { id identifier title url } }
       }`,
      {
        input: {
          teamId: team.id,
          projectId: project.id,
          title: `${f.id}: ${f.title}`,
          description,
          priority: f.priority,
          labelIds: labelIdList,
          stateId,
          projectMilestoneId: milestoneId,
        },
      }
    );
    const issue = issueCreate.issue;
    console.log(`  ✓ ${issue.identifier} ${f.title}`);
  }
  console.log('');

  console.log('Import complete.');
  console.log(`Project URL: ${project.url}`);
}

main().catch((err) => {
  console.error('\nIMPORT FAILED:', err.message);
  process.exit(1);
});
