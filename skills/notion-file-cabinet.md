# Skill: notion-file-cabinet

**Version:** 1.0.0
**Author:** Manus AI
**Last Updated:** 2026-02-21

---

## Purpose

This skill provides a complete, step-by-step workflow for filing any document into the **Manus Notion File Cabinet** — a hierarchical, four-level storage system for organizing documents, reports, and project files. It handles the full filing lifecycle: determining placement, creating the document as a Notion page, and updating all relevant index tables at every level of the hierarchy.

This skill is designed to be invoked by subtasks or agents that need to persist a document into the Notion workspace with proper categorization and indexing.

---

## Notion File Cabinet Architecture

The file cabinet follows a physical filing metaphor with four hierarchical levels:

```
Manus File Cabinet  (top-level page — the cabinet itself)
└── Drawer          (broad category, e.g., "Research Reports")
    └── Folder      (specific topic, e.g., "Longevity & Health")
        └── File    (individual document/report as a Notion page)
```

### Level 1 — File Cabinet (Top-Level Page)

- **Name:** Manus File Cabinet
- **URL:** `https://www.notion.so/30eb22635746812d9052f1210b2baa15`
- **Contains:** A **Master Index** table that catalogs all drawers.

| Master Index Column | Description |
|---|---|
| `Drawer Name` | Linked page name of the drawer |
| `Description` | Brief description of the drawer's contents |
| `Date Created` | Date the drawer was created (YYYY-MM-DD) |
| `Path` | Full path string, e.g., `Manus File Cabinet > Research Reports` |
| `Items Count` | Summary of folders and files, e.g., `2 folders, 5 files` |

### Level 2 — Drawers (Broad Category Sub-Pages)

Each drawer is a sub-page of the File Cabinet representing a broad category. Each drawer contains a **Drawer Index** table that catalogs all folders within it.

| Drawer Index Column | Description |
|---|---|
| `Folder Name` | Linked page name of the folder |
| `Description` | Brief description of the folder's topic |
| `Date Created` | Date the folder was created (YYYY-MM-DD) |
| `Path` | Full path string, e.g., `Manus File Cabinet > Research Reports > Longevity & Health` |
| `Items Count` | Number of files in the folder |

### Level 3 — Folders (Specific Topic Sub-Pages)

Each folder is a sub-page of a drawer representing a specific topic. Each folder contains a **Folder Index** table that catalogs all files within it.

| Folder Index Column | Description |
|---|---|
| `File Name` | Linked page name of the document |
| `Description` | Brief description of the document |
| `Date` | Date the document was filed (YYYY-MM-DD) |
| `Author` | Author of the document |
| `Path` | Full path string, e.g., `Manus File Cabinet > Research Reports > Longevity & Health > Best US Cities...` |
| `Key Finding` | One-sentence summary of the document's most important finding |

### Level 4 — Files (Individual Documents)

Each file is a Notion page within a folder containing the full document content.

---

## Existing Structure

The following structure already exists and must be used when filing documents that fit these categories:

| Level | Name | URL |
|---|---|---|
| File Cabinet | Manus File Cabinet | `https://www.notion.so/30eb22635746812d9052f1210b2baa15` |
| Drawer | Research Reports | `https://www.notion.so/30eb22635746816ea38af9129e541ecd` |
| Folder | Longevity & Health | `https://www.notion.so/30eb226357468192a343d82c51bda919` |
| File | Best US Cities for a Long and Healthy Life | `https://www.notion.so/30eb2263574681d891a5e4c0644d4058` |

---

## Filing Workflow

Execute the following steps in order. Steps 6, 7, and 8 are conditional and only apply when new structural elements are created.

### Step 1 — Determine the Appropriate Drawer

Examine the document's subject matter and determine which existing drawer best fits. If no existing drawer is appropriate, create a new one as a sub-page of the File Cabinet.

**To create a new drawer:**
```bash
manus-mcp-cli tool call notion-create-pages --server notion --input '{
  "pages": [{
    "parent_id": "30eb22635746812d9052f1210b2baa15",
    "title": "<DRAWER_NAME>",
    "content": "# <DRAWER_NAME>\n\n::: callout {icon=\"🗂️\" color=\"gray_bg\"}\n\t<DRAWER_NAME> — <DESCRIPTION>\n:::\n---\n## Drawer Index — Folders\n<table header-row=\"true\">\n<tr>\n<td>Folder Name</td>\n<td>Description</td>\n<td>Date Created</td>\n<td>Path</td>\n<td>Items Count</td>\n</tr>\n</table>"
  }]
}'
```

### Step 2 — Determine the Appropriate Folder

Within the chosen drawer, identify which existing folder best fits the document's specific topic. If no existing folder is appropriate, create a new one as a sub-page of the drawer.

**To create a new folder:**
```bash
manus-mcp-cli tool call notion-create-pages --server notion --input '{
  "pages": [{
    "parent_id": "<DRAWER_PAGE_ID>",
    "title": "<FOLDER_NAME>",
    "content": "# <FOLDER_NAME>\n\n::: callout {icon=\"📁\" color=\"yellow_bg\"}\n\t<FOLDER_NAME> — <DESCRIPTION>\n:::\n---\n## Folder Index — Files\n<table header-row=\"true\">\n<tr>\n<td>File Name</td>\n<td>Description</td>\n<td>Date</td>\n<td>Author</td>\n<td>Path</td>\n<td>Key Finding</td>\n</tr>\n</table>"
  }]
}'
```

### Step 3 — Convert Document Content to Notion-Flavored Markdown

Before creating the page, convert the document content to Notion-flavored Markdown. First, read the specification:

```bash
manus-mcp-cli resource read notion://docs/enhanced-markdown-spec --server notion
```

Key conversion rules:
- Use `# Heading 1`, `## Heading 2`, `### Heading 3` for headings.
- Use `::: callout {icon="..." color="..."}` for callout blocks.
- Use `---` for horizontal dividers.
- Use the Notion table format (see the **Critical Table Formatting** section below).
- Use `> blockquote` for quotes.
- Use `` `inline code` `` and fenced code blocks with language specifiers.

### Step 4 — Create the Document as a Notion Page

Create the document as a new Notion page inside the target folder:

```bash
manus-mcp-cli tool call notion-create-pages --server notion --input '{
  "pages": [{
    "parent_id": "<FOLDER_PAGE_ID>",
    "title": "<DOCUMENT_TITLE>",
    "content": "<FULL_DOCUMENT_CONTENT_IN_NOTION_MARKDOWN>"
  }]
}'
```

Record the URL of the newly created page for use in the index update steps.

### Step 5 — Update the Folder Index

Add a new row to the Folder Index table in the parent folder page. Use `notion-update-page` to append the new row to the existing table.

The new row must follow this format:
```html
<tr>
<td><mention-page url="{{<NEW_FILE_URL>}}"><DOCUMENT_TITLE></mention-page></td>
<td><DESCRIPTION></td>
<td><DATE_FILED></td>
<td><AUTHOR></td>
<td>Manus File Cabinet > <DRAWER_NAME> > <FOLDER_NAME> > <DOCUMENT_TITLE></td>
<td><KEY_FINDING></td>
</tr>
```

### Step 6 — Update the Drawer Index (if a new folder was created)

If a new folder was created in Step 2, add a new row to the Drawer Index table in the parent drawer page.

The new row must follow this format:
```html
<tr>
<td><mention-page url="{{<NEW_FOLDER_URL>}}"><FOLDER_NAME></mention-page></td>
<td><FOLDER_DESCRIPTION></td>
<td><DATE_CREATED></td>
<td>Manus File Cabinet > <DRAWER_NAME> > <FOLDER_NAME></td>
<td>1 file</td>
</tr>
```

### Step 7 — Update the Master Index (if a new drawer was created)

If a new drawer was created in Step 1, add a new row to the Master Index table in the File Cabinet page (`30eb22635746812d9052f1210b2baa15`).

The new row must follow this format:
```html
<tr>
<td><mention-page url="{{<NEW_DRAWER_URL>}}"><DRAWER_NAME></mention-page></td>
<td><DRAWER_DESCRIPTION></td>
<td><DATE_CREATED></td>
<td>Manus File Cabinet > <DRAWER_NAME></td>
<td>1 folder, 1 file</td>
</tr>
```

### Step 8 — Update Quick Stats (if new structural elements were created)

If new drawers or folders were created, update the Quick Stats table in the File Cabinet page to reflect the new counts.

---

## Critical Table Formatting Rules

**Notion does NOT support standard HTML tables** (`<thead>`, `<tbody>`, `<th>` tags) or Markdown pipe tables. Failure to follow these rules will cause table rendering errors.

**Correct format:**
```html
<table header-row="true">
<tr>
<td>Column Header 1</td>
<td>Column Header 2</td>
</tr>
<tr>
<td>Data Cell 1</td>
<td>Data Cell 2</td>
</tr>
</table>
```

**Rules:**
1. Use `<table header-row="true">` to designate the first row as a header.
2. Each `<tr>` and `<td>` tag MUST be on its own line.
3. Do NOT put the entire table on a single line.
4. Do NOT use bold (`**text**`), italic (`*text*`), or any other Markdown formatting inside `<td>` cells — use plain text only.
5. Do NOT use `<thead>`, `<tbody>`, or `<th>` tags.

---

## Parameters Reference

| Parameter | Type | Required | Description |
|---|---|---|---|
| `document_title` | string | Yes | The title of the document to be filed |
| `document_content` | string | Yes | Full document content in Notion-flavored Markdown |
| `drawer_name` | string | Yes | Name of the target drawer (existing or new) |
| `folder_name` | string | Yes | Name of the target folder (existing or new) |
| `author` | string | Yes | Author of the document (default: "Manus AI") |
| `key_finding` | string | Yes | One-sentence summary of the document's key finding |
| `description` | string | No | Brief description of the document for the index |
| `date_filed` | string | No | Date filed in YYYY-MM-DD format (default: today) |

---

## Decision Logic for Drawer and Folder Selection

When determining the appropriate drawer and folder, follow this logic:

1. **Fetch the File Cabinet page** to see the current list of drawers in the Master Index.
2. **Evaluate each existing drawer** against the document's subject matter. Choose the most specific match.
3. **If no drawer fits**, create a new drawer with a descriptive name and add it to the Master Index.
4. **Fetch the chosen drawer page** to see the current list of folders in the Drawer Index.
5. **Evaluate each existing folder** against the document's specific topic. Choose the most specific match.
6. **If no folder fits**, create a new folder with a descriptive name and add it to the Drawer Index.

---

## Notes for Subtask Agents

- Always **fetch the current state** of the target page before updating it to avoid overwriting existing content.
- When using `notion-update-page`, append new table rows to the existing table content rather than replacing the entire page.
- The `mention-page` syntax (`<mention-page url="{{URL}}">Title</mention-page>`) creates a linked page reference in Notion tables — always use this for the name column in index tables.
- If a page creation or update fails, check the Notion MCP tool documentation and verify the content format before retrying.
- All dates should be in `YYYY-MM-DD` format.
