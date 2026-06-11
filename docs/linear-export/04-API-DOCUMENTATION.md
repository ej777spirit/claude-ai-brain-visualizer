# API Documentation

## Overview

The backend exposes a RESTful API at `http://localhost:3001` that proxies requests to AI providers and extracts structured thought representations.

---

## Endpoints

### POST /api/chat

Primary endpoint for AI interaction and thought extraction.

#### Request

```http
POST /api/chat HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "prompt": "Explain how neural networks learn",
  "model": "claude",
  "researchMode": "conceptual"
}
```

| Field | Type | Required | Values |
|-------|------|----------|--------|
| `prompt` | string | Yes | User's question (max 10,000 chars) |
| `model` | string | Yes | `claude`, `gemini`, `gpt`, `kimi` |
| `researchMode` | string | No | `conceptual`, `analytical`, `creative` |

#### Response

```json
{
  "content": "Neural networks learn through a process called...",
  "thoughts": [
    {
      "id": "t1",
      "content": "Identify the core learning mechanism",
      "category": "analysis",
      "weight": 0.9,
      "parentId": null,
      "timestamp": 1718121600000,
      "depth": 0,
      "position": { "x": 0, "y": 0, "z": 0 }
    },
    {
      "id": "t2",
      "content": "Recall backpropagation algorithm",
      "category": "recall",
      "weight": 0.85,
      "parentId": "t1",
      "timestamp": 1718121600100,
      "depth": 1,
      "position": { "x": 0, "y": 0, "z": 0 }
    }
  ],
  "thoughtSource": "model-reported",
  "isSimulated": false,
  "timestamp": "2026-06-11T12:00:00.000Z"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `content` | string | Full AI response text |
| `thoughts` | array | Extracted thought nodes |
| `thoughtSource` | string | `"model-reported"` or `"sentence-derived"` |
| `isSimulated` | boolean | `true` if using demo fallback |
| `timestamp` | string | ISO 8601 timestamp |

#### Thought Node Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (`t1`, `t2`, ...) |
| `content` | string | Description of the reasoning step |
| `category` | string | `analysis`, `synthesis`, `recall`, `evaluation` |
| `weight` | number | Confidence score 0.0-1.0 |
| `parentId` | string \| null | ID of parent thought |
| `timestamp` | number | Unix timestamp (ms) |
| `depth` | number | Tree depth (0 = root) |
| `position` | object | 3D coordinates (computed client-side) |

#### Error Response

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 900
}
```

| HTTP Status | Meaning |
|-------------|---------|
| 400 | Invalid request body |
| 429 | Rate limit exceeded |
| 500 | Server or provider error |
| 503 | All providers unavailable |

---

### GET /api/health

Health check endpoint.

#### Request

```http
GET /api/health HTTP/1.1
Host: localhost:3001
```

#### Response

```json
{
  "status": "healthy",
  "timestamp": "2026-06-11T12:00:00.000Z",
  "providers": {
    "anthropic": true,
    "google": false,
    "openai": true,
    "moonshot": false
  }
}
```

---

## Provider Routing

| Model Value | Provider | API Endpoint | Model ID |
|-------------|----------|--------------|----------|
| `claude` | Anthropic | `api.anthropic.com/v1/messages` | `claude-sonnet-4-6` |
| `gemini` | Google | `generativelanguage.googleapis.com` | `gemini-2.0-flash` |
| `gpt` | OpenAI | `api.openai.com/v1/chat/completions` | `gpt-4o` |
| `kimi` | Moonshot | `api.moonshot.cn/v1/chat/completions` | `moonshot-v1-128k` |

---

## Rate Limiting

| Limit | Value |
|-------|-------|
| Requests per window | 100 |
| Window duration | 15 minutes |
| Rate limit header | `X-RateLimit-Remaining` |
| Retry-After header | Seconds until reset |

---

## Demo Mode Behavior

When no API keys are configured, the server returns simulated responses:

1. Response content is pre-defined based on query keywords
2. `isSimulated` is set to `true`
3. `thoughtSource` is set to `"sentence-derived"`
4. Thoughts are derived from sentence segmentation
5. No external API calls are made

To detect demo mode:

```javascript
if (response.isSimulated) {
  console.warn('Using simulated response - configure API keys for live AI');
}
```

---

## Client Integration

### TypeScript Client

```typescript
// src/services/api/APIClient.ts

class APIClient {
  private baseUrl: string;
  private abortController: AbortController | null;

  async sendMessage(
    prompt: string,
    model: AIModel,
    researchMode: string
  ): Promise<APIResponse> {
    // Cancel any pending request
    if (this.abortController) {
      this.abortController.abort();
    }
    this.abortController = new AbortController();

    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model, researchMode }),
      signal: this.abortController.signal
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }
}
```

### cURL Examples

```bash
# Basic request
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"What is machine learning?","model":"claude"}'

# With research mode
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Analyze this data","model":"gpt","researchMode":"analytical"}'

# Health check
curl http://localhost:3001/api/health
```

---

## Structured Output Protocol

The server instructs AI models to report their reasoning in a structured format:

### Prompt Augmentation

```
[User's original prompt]

---
After your response, please include a JSON block with your reasoning steps:
\`\`\`json
{
  "reasoning_steps": [
    {
      "step": 1,
      "thought": "First step description",
      "category": "analysis",
      "parent_step": null,
      "confidence": 0.9
    }
  ]
}
\`\`\`
```

### Extraction Process

1. Search for ` ```json` block in response
2. Parse JSON content
3. Validate and normalize each step
4. Convert to ThoughtNode format

### Fallback Extraction

If no JSON block found or parsing fails:
1. Split response into sentences
2. Assign sequential IDs
3. Infer categories from keywords
4. Chain thoughts linearly (each → previous as parent)
