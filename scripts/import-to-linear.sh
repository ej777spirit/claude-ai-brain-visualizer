#!/usr/bin/env bash
# Linear Project Import Script (Bash/curl version)
#
# Creates the "AI Super Brain Visualizer" project in Linear and populates it
# with documents, issues, milestones, and labels from docs/linear-export/.
#
# Usage:
#   LINEAR_API_KEY=lin_api_... ./scripts/import-to-linear.sh [--team TEAM_KEY] [--dry-run]
#
# Requirements:
#   - bash 4+
#   - curl
#   - jq  (install: brew install jq | apt-get install jq | dnf install jq)

set -euo pipefail

# ---------- Configuration ----------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$(cd "$SCRIPT_DIR/../docs/linear-export" && pwd)"
PROJECT_NAME="AI Super Brain Visualizer"
PROJECT_DESCRIPTION="3D visualization of AI reasoning processes across multiple model providers. See project documents for complete operation manual, architecture, and reproducibility guides."
API_URL="https://api.linear.app/graphql"

# ---------- Argument parsing ----------
DRY_RUN=0
TEAM_KEY_ARG=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --team)    TEAM_KEY_ARG="$2"; shift 2 ;;
    -h|--help)
      sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

# ---------- Preflight ----------
if [[ -z "${LINEAR_API_KEY:-}" ]]; then
  echo "ERROR: LINEAR_API_KEY environment variable required" >&2
  echo "Get a key at: https://linear.app/settings/api" >&2
  exit 1
fi
command -v jq >/dev/null 2>&1 || { echo "ERROR: jq is required. Install: brew install jq" >&2; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "ERROR: curl is required" >&2; exit 1; }
[[ -d "$DOCS_DIR" ]] || { echo "ERROR: docs dir not found: $DOCS_DIR" >&2; exit 1; }

# ---------- GraphQL helper ----------
# Usage: gql "<query>" "<variables-json>"
# Echoes the data field of the response. Errors → exit 1.
gql() {
  local query="$1"
  local variables="${2:-{\}}"
  local payload response http_code body
  payload="$(jq -nc --arg q "$query" --argjson v "$variables" '{query:$q, variables:$v}')"
  response="$(curl -sS -m 60 -w "\n__HTTP_CODE__%{http_code}" -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Authorization: $LINEAR_API_KEY" \
    --data "$payload")"
  http_code="${response##*__HTTP_CODE__}"
  body="${response%__HTTP_CODE__*}"
  if ! echo "$body" | jq . >/dev/null 2>&1; then
    echo "ERROR: Non-JSON response from Linear (HTTP $http_code):" >&2
    echo "$body" | head -c 500 >&2
    echo >&2
    exit 1
  fi
  if echo "$body" | jq -e '.errors' >/dev/null 2>&1; then
    echo "Linear API error (HTTP $http_code):" >&2
    echo "$body" | jq '.errors' >&2
    exit 1
  fi
  echo "$body" | jq '.data'
}

echo "$([[ $DRY_RUN -eq 1 ]] && echo '[DRY RUN] ')Importing \"$PROJECT_NAME\" into Linear"
echo

# ---------- 1. Authenticate, list teams ----------
viewer_teams="$(gql 'query { viewer { id name email } teams { nodes { id key name } } }')"
viewer_id="$(echo "$viewer_teams" | jq -r '.viewer.id')"
viewer_name="$(echo "$viewer_teams" | jq -r '.viewer.name')"
viewer_email="$(echo "$viewer_teams" | jq -r '.viewer.email')"
echo "Authenticated as: $viewer_name <$viewer_email>"

if [[ -n "$TEAM_KEY_ARG" ]]; then
  team_json="$(echo "$viewer_teams" | jq --arg k "$TEAM_KEY_ARG" '.teams.nodes[] | select(.key==$k)')"
  [[ -z "$team_json" ]] && { echo "ERROR: Team with key \"$TEAM_KEY_ARG\" not found" >&2; exit 1; }
else
  team_count="$(echo "$viewer_teams" | jq '.teams.nodes | length')"
  if [[ "$team_count" -eq 1 ]]; then
    team_json="$(echo "$viewer_teams" | jq '.teams.nodes[0]')"
  else
    echo "Available teams:"
    echo "$viewer_teams" | jq -r '.teams.nodes[] | "  - \(.key): \(.name)"'
    echo "ERROR: Multiple teams found. Re-run with --team <KEY>" >&2
    exit 1
  fi
fi
team_id="$(echo "$team_json" | jq -r '.id')"
team_key="$(echo "$team_json" | jq -r '.key')"
team_name="$(echo "$team_json" | jq -r '.name')"
echo "Using team: $team_key ($team_name)"
echo

if [[ $DRY_RUN -eq 1 ]]; then
  doc_count="$(find "$DOCS_DIR" -maxdepth 1 -name '*.md' | wc -l | tr -d ' ')"
  echo "Would create:"
  echo "  - 1 project: \"$PROJECT_NAME\""
  echo "  - $doc_count project documents"
  echo "  - 4 project milestones"
  echo "  - 8 labels"
  echo "  - 10 issues"
  exit 0
fi

# ---------- 2. Fetch workflow states for the team ----------
states="$(gql 'query($teamId: ID!) { workflowStates(filter: { team: { id: { eq: $teamId } } }) { nodes { id name type } } }' \
  "$(jq -nc --arg id "$team_id" '{teamId:$id}')")"

# state_id_for "Done" / "In Progress" / "Backlog"
state_id_for() {
  local want="$1"
  local id
  id="$(echo "$states" | jq -r --arg n "$want" '.workflowStates.nodes[] | select((.name | ascii_downcase) == ($n | ascii_downcase)) | .id' | head -1)"
  if [[ -z "$id" ]]; then
    local type
    case "$want" in
      Done) type="completed" ;;
      "In Progress") type="started" ;;
      Backlog) type="backlog" ;;
      *) type="" ;;
    esac
    id="$(echo "$states" | jq -r --arg t "$type" '.workflowStates.nodes[] | select(.type==$t) | .id' | head -1)"
  fi
  echo "$id"
}

# ---------- 3. Create project ----------
echo "Creating project..."
project_input="$(jq -nc \
  --arg n "$PROJECT_NAME" \
  --arg d "$PROJECT_DESCRIPTION" \
  --arg t "$team_id" \
  --arg l "$viewer_id" \
  '{name:$n, description:$d, teamIds:[$t], leadId:$l}')"
project_resp="$(gql 'mutation($input: ProjectCreateInput!) { projectCreate(input: $input) { success project { id name url } } }' \
  "$(jq -nc --argjson i "$project_input" '{input:$i}')")"
project_id="$(echo "$project_resp" | jq -r '.projectCreate.project.id')"
project_url="$(echo "$project_resp" | jq -r '.projectCreate.project.url')"
echo "  ✓ $PROJECT_NAME → $project_url"
echo

# ---------- 4. Create / reuse labels ----------
echo "Creating labels..."
existing_labels="$(gql 'query($teamId: ID!) { issueLabels(filter: { team: { id: { eq: $teamId } } }) { nodes { id name } } }' \
  "$(jq -nc --arg id "$team_id" '{teamId:$id}')")"

declare -A LABEL_IDS=()
declare -a LABEL_LIST=(
  "feature:#5e6ad2"
  "bug:#eb5757"
  "docs:#26b5ce"
  "frontend:#f2c94c"
  "backend:#27ae60"
  "analytics:#9b51e0"
  "research:#bb87fc"
  "security:#e74c3c"
)
for entry in "${LABEL_LIST[@]}"; do
  name="${entry%%:*}"
  color="${entry##*:}"
  existing_id="$(echo "$existing_labels" | jq -r --arg n "$name" '.issueLabels.nodes[] | select(.name==$n) | .id' | head -1)"
  if [[ -n "$existing_id" ]]; then
    LABEL_IDS[$name]="$existing_id"
    echo "  • $name (exists)"
    continue
  fi
  resp="$(gql 'mutation($input: IssueLabelCreateInput!) { issueLabelCreate(input: $input) { success issueLabel { id name } } }' \
    "$(jq -nc --arg n "$name" --arg c "$color" --arg t "$team_id" '{input:{name:$n, color:$c, teamId:$t}}')")"
  LABEL_IDS[$name]="$(echo "$resp" | jq -r '.issueLabelCreate.issueLabel.id')"
  echo "  ✓ $name"
done
echo

# ---------- 5. Create project milestones ----------
echo "Creating milestones..."
declare -A MILESTONE_IDS=()
declare -a MILESTONES=(
  "Foundation|Core multi-provider integration, extraction, 3D engine"
  "Enhancement|Patterns, analytics, interactivity"
  "Polish|Persistence, history, performance, accessibility"
  "Advanced|Multi-model comparison, export, research features"
)
i=0
for entry in "${MILESTONES[@]}"; do
  name="${entry%%|*}"
  desc="${entry##*|}"
  sort=$((i * 1000))
  resp="$(gql 'mutation($input: ProjectMilestoneCreateInput!) { projectMilestoneCreate(input: $input) { success projectMilestone { id name } } }' \
    "$(jq -nc --arg p "$project_id" --arg n "$name" --arg d "$desc" --argjson s "$sort" '{input:{projectId:$p, name:$n, description:$d, sortOrder:$s}}')")"
  MILESTONE_IDS[$name]="$(echo "$resp" | jq -r '.projectMilestoneCreate.projectMilestone.id')"
  echo "  ✓ $name"
  i=$((i + 1))
done
echo

# ---------- 6. Upload markdown files as project documents ----------
echo "Uploading documents..."
for file in "$DOCS_DIR"/*.md; do
  fname="$(basename "$file")"
  # Title: first H1 in file, fallback to filename
  title="$(awk '/^# / { sub(/^# +/, ""); print; exit }' "$file")"
  [[ -z "$title" ]] && title="${fname%.md}"
  input="$(jq -nc --arg t "$title" --rawfile c "$file" --arg p "$project_id" '{input:{title:$t, content:$c, projectId:$p}}')"
  resp="$(gql 'mutation($input: DocumentCreateInput!) { documentCreate(input: $input) { success document { id title url } } }' \
    "$input")"
  doc_title="$(echo "$resp" | jq -r '.documentCreate.document.title')"
  echo "  ✓ $fname → \"$doc_title\""
done
echo

# ---------- 7. Create feature issues ----------
echo "Creating issues..."
SPEC_FILE="$DOCS_DIR/06-FEATURE-SPECIFICATIONS.md"

# Tab-separated table: id | title | priority | state | milestone | labels(comma-sep)
declare -a FEATURES=(
  "F001	Multi-Provider AI Integration	1	Done	Foundation	feature,backend"
  "F002	Structured Thought Extraction	1	Done	Foundation	feature,backend"
  "F003	3D Visualization Engine	1	Done	Foundation	feature,frontend"
  "F004	Visualization Patterns	2	Done	Enhancement	feature,frontend"
  "F005	Graph Analytics	2	Done	Enhancement	feature,analytics"
  "F006	Node Interactivity	2	Done	Enhancement	feature,frontend"
  "F007	Session Persistence	3	In Progress	Polish	feature,frontend"
  "F008	Response History Navigation	3	Backlog	Polish	feature,frontend"
  "F009	Multi-Model Comparison	4	Backlog	Advanced	feature,research"
  "F010	Export Capabilities	4	Backlog	Advanced	feature,frontend"
)

# Extract section "## Fxxx: ..." up to next "## " from the spec file
extract_section() {
  local fid="$1"
  awk -v id="## ${fid}:" '
    $0 ~ id {grab=1}
    grab && /^## / && $0 !~ id {grab=0}
    grab {print}
  ' "$SPEC_FILE"
}

for row in "${FEATURES[@]}"; do
  IFS=$'\t' read -r fid ftitle fprio fstate fmilestone flabels <<< "$row"
  state_id="$(state_id_for "$fstate")"
  milestone_id="${MILESTONE_IDS[$fmilestone]}"

  # Build labelIds JSON array from comma-separated label names
  label_json="$(
    IFS=',' read -ra arr <<< "$flabels"
    out="[]"
    for ln in "${arr[@]}"; do
      lid="${LABEL_IDS[$ln]:-}"
      [[ -z "$lid" ]] && continue
      out="$(echo "$out" | jq --arg v "$lid" '. + [$v]')"
    done
    echo "$out"
  )"

  section_body="$(extract_section "$fid")"
  description="$(printf "**Feature ID:** %s\n**Status:** %s\n**Priority:** P%d\n**Milestone:** %s\n\n---\n\n%s" \
    "$fid" "$fstate" "$((fprio - 1))" "$fmilestone" "$section_body")"

  input="$(jq -nc \
    --arg team "$team_id" \
    --arg proj "$project_id" \
    --arg title "${fid}: ${ftitle}" \
    --arg desc "$description" \
    --argjson prio "$fprio" \
    --argjson labels "$label_json" \
    --arg state "$state_id" \
    --arg milestone "$milestone_id" \
    '{input:{teamId:$team, projectId:$proj, title:$title, description:$desc, priority:$prio, labelIds:$labels, stateId:$state, projectMilestoneId:$milestone}}')"

  resp="$(gql 'mutation($input: IssueCreateInput!) { issueCreate(input: $input) { success issue { identifier title url } } }' "$input")"
  ident="$(echo "$resp" | jq -r '.issueCreate.issue.identifier')"
  echo "  ✓ $ident $ftitle"
done
echo

echo "Import complete."
echo "Project URL: $project_url"
