# API Reference

Costwave provides a REST API for ingesting cost events from custom workflows, agents, and automation tools.

## Base URL

- **SaaS**: `https://costwave.app`
- **Self-hosted**: Your deployment URL

## Authentication

All API requests require an API key passed via the `Authorization` header.

```http
Authorization: Bearer ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Getting an API Key

1. Navigate to **Settings > API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "Production Agent")
4. Copy the key - it's only shown once
5. Store it securely (environment variable recommended)

**Key Format**: `ck_[env]_[secret]`
- `ck_live_*` - Production keys
- `ck_test_*` - Test keys (reserved for future use)

**Security**: Keys are hashed with bcrypt before storage. Lost keys cannot be recovered.

## Rate Limits

- **1000 requests per minute** per API key
- Exceeding the limit returns `429 Too Many Requests`
- Rate limit window resets every 60 seconds

## Endpoints

### POST /api/v1/events/ingest

Ingest a cost tracking event.

**Request**

```http
POST /api/v1/events/ingest HTTP/1.1
Host: costwave.app
Authorization: Bearer ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
Content-Type: application/json

{
  "type": "llm_generation",
  "provider": "anthropic",
  "model": "claude-sonnet-4-5-20250929",
  "inputTokens": 1250,
  "outputTokens": 420,
  "cachedTokens": 0,
  "latencyMs": 850,
  "status": "success",
  "workflowName": "customer-support-agent",
  "runId": "550e8400-e29b-41d4-a716-446655440000",
  "metadata": {
    "user": "support@example.com",
    "conversation_id": "conv_123"
  }
}
```

**Request Schema**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Event type (1-100 chars) |
| `provider` | string | Yes | Provider ID: `anthropic`, `openai`, `groq`, `mistral`, `google` (1-50 chars) |
| `model` | string | Yes | Model identifier (1-100 chars) |
| `inputTokens` | integer | Yes | Input token count (>= 0) |
| `outputTokens` | integer | Yes | Output token count (>= 0) |
| `cachedTokens` | integer | No | Cached/prompt cache tokens (>= 0) |
| `latencyMs` | integer | No | Request latency in milliseconds (>= 0) |
| `status` | enum | No | `started`, `success`, `error` (default: `success`) |
| `workflowName` | string | No | Workflow identifier (1-200 chars, auto-creates workflow) |
| `runId` | UUID | No | Execution run ID (groups related events) |
| `parentRunId` | UUID | No | Parent run ID (for nested executions) |
| `metadata` | object | No | Arbitrary JSON metadata |

**Response (200 OK)**

```json
{
  "success": true,
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "costUsd": "0.00507000"
}
```

**Response Schema**

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Always `true` on success |
| `eventId` | UUID | Created event ID |
| `costUsd` | string | Calculated cost in USD (8 decimal precision) |

**Error Responses**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `Invalid event data` | Validation failed (check response for field details) |
| 401 | `Missing or invalid Authorization header` | No `Bearer` token provided |
| 401 | `Invalid API key format` | Key doesn't match `ck_live_*` or `ck_test_*` |
| 401 | `Invalid or revoked API key` | Key doesn't exist or was revoked |
| 429 | `Rate limit exceeded (1000 requests per minute)` | Too many requests |
| 500 | `Internal server error` | Server error (contact support) |

## Examples

### cURL

```bash
curl -X POST https://costwave.app/api/v1/events/ingest \
  -H "Authorization: Bearer ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "llm_generation",
    "provider": "openai",
    "model": "gpt-4o-2024-11-20",
    "inputTokens": 500,
    "outputTokens": 200,
    "workflowName": "summary-bot"
  }'
```

### Python

```python
import requests

response = requests.post(
    "https://costwave.app/api/v1/events/ingest",
    headers={
        "Authorization": "Bearer ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        "Content-Type": "application/json",
    },
    json={
        "type": "llm_generation",
        "provider": "anthropic",
        "model": "claude-haiku-4-20250514",
        "inputTokens": 100,
        "outputTokens": 50,
        "workflowName": "slack-bot",
    },
)

print(response.json())
# {"success": true, "eventId": "...", "costUsd": "0.00001875"}
```

### Node.js

```javascript
const response = await fetch("https://costwave.app/api/v1/events/ingest", {
  method: "POST",
  headers: {
    "Authorization": "Bearer ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    type: "llm_generation",
    provider: "groq",
    model: "llama-3.3-70b-versatile",
    inputTokens: 1000,
    outputTokens: 500,
    workflowName: "content-generator",
  }),
});

const data = await response.json();
console.log(data);
// {"success": true, "eventId": "...", "costUsd": "0.00098500"}
```

### Go

```go
package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    payload := map[string]interface{}{
        "type":         "llm_generation",
        "provider":     "mistral",
        "model":        "mistral-small-latest",
        "inputTokens":  300,
        "outputTokens": 150,
        "workflowName": "translation-service",
    }

    body, _ := json.Marshal(payload)
    req, _ := http.NewRequest("POST", "https://costwave.app/api/v1/events/ingest", bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    var result map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&result)
    fmt.Println(result)
    // map[costUsd:0.00015000 eventId:... success:true]
}
```

## Cost Calculation

Costs are calculated server-side using current pricing for each provider/model combination.

**Formula**:
```
cost = (inputTokens / 1M * inputPrice) + (outputTokens / 1M * outputPrice) + (cachedTokens / 1M * cachedPrice)
```

**Pricing** (per 1M tokens):

| Provider | Model | Input | Output | Cached |
|----------|-------|-------|--------|--------|
| Anthropic | claude-opus-4-5-20251101 | $15.00 | $75.00 | $1.50 |
| Anthropic | claude-sonnet-4-5-20250929 | $3.00 | $15.00 | $0.30 |
| Anthropic | claude-haiku-4-20250514 | $0.25 | $1.25 | $0.025 |
| OpenAI | gpt-4o-2024-11-20 | $2.50 | $10.00 | $1.25 |
| OpenAI | gpt-4o-mini-2024-07-18 | $0.15 | $0.60 | $0.075 |
| Groq | llama-3.3-70b-versatile | $0.59 | $0.79 | $0.10 |
| Mistral | mistral-large-latest | $2.00 | $6.00 | $0.40 |
| Google | gemini-2.0-flash-exp | $0.00 | $0.00 | $0.00 |

See [Pricing Constants](https://github.com/[username]/costwave/blob/main/app/src/lib/pricing/constants.ts) for the complete list.

## Best Practices

1. **Use environment variables** for API keys - never hardcode
2. **Implement retry logic** with exponential backoff for 429/500 errors
3. **Batch events** when possible (use Python SDK's BatchSender)
4. **Include `workflowName`** to group related events in the dashboard
5. **Use `runId`** to track end-to-end execution flows
6. **Store metadata** for debugging (user ID, conversation ID, etc.)

## Next Steps

- **[Python SDK](./sdk-python.md)** - Higher-level client with auto-batching
- **[Claude Code Hook](./claude-code-hook.md)** - Automatic tracking for Claude Code
- **[n8n Integration](./n8n-integration.md)** - No-code workflow tracking
