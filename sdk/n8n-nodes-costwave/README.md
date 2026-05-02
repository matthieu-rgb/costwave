# Costwave n8n Custom Node

Track LLM costs from n8n workflows with the custom Costwave node.

## Installation

This custom node requires a self-hosted n8n instance (not available in n8n Cloud).

### 1. Build the Node

```bash
cd sdk/n8n-nodes-costwave
npm install
npm run build
```

### 2. Link to n8n

```bash
npm link
```

### 3. Link from n8n Directory

```bash
cd ~/.n8n  # Default n8n user directory
npm link @costwave/n8n-nodes-costwave
```

### 4. Restart n8n

```bash
n8n restart
```

The Costwave node should now appear in the node palette.

## Configuration

### Create Credentials

1. Go to **Credentials** in n8n
2. Click **New Credential**
3. Search for "Costwave"
4. Enter:
   - **API Key**: Your Costwave API key (get from Costwave dashboard > Settings > API Keys)
   - **Base URL**: `https://costwave.app` (or your self-hosted URL)
5. Click **Test** to verify connection
6. Click **Save**

## Usage

### Basic Example

Add the Costwave node after any LLM API call:

```
[Trigger] -> [OpenAI Node] -> [Costwave Track Node] -> [...]
```

### Node Parameters

| Field | Description | Example |
|-------|-------------|---------|
| **Provider** | LLM provider | `anthropic`, `openai`, `groq`, `mistral`, `google` |
| **Model** | Model identifier | `claude-sonnet-4-5-20250929` |
| **Input Tokens** | Number of input tokens | `{{$json.usage.prompt_tokens}}` |
| **Output Tokens** | Number of output tokens | `{{$json.usage.completion_tokens}}` |
| **Cached Tokens** | Cached/prompt cache tokens (optional) | `{{$json.usage.cached_tokens}}` |
| **Latency (ms)** | Request latency (optional) | `{{$json.latency_ms}}` |
| **Workflow Name** | Workflow identifier (optional) | `customer-email-summarizer` |
| **Run ID** | Execution run ID (optional) | `{{$execution.id}}` |
| **Metadata** | Custom JSON metadata (optional) | `{"customer_id": "123"}` |

### Extracting Token Counts

Use n8n expressions to extract usage from LLM node responses:

#### OpenAI Node

```javascript
// Input Tokens
{{$json.usage.prompt_tokens}}

// Output Tokens
{{$json.usage.completion_tokens}}

// Cached Tokens (if using prompt caching)
{{$json.usage.prompt_tokens_details.cached_tokens}}
```

#### Anthropic (via HTTP Request Node)

```javascript
// Input Tokens
{{$json.usage.input_tokens}}

// Output Tokens
{{$json.usage.output_tokens}}

// Cached Tokens
{{$json.usage.cache_read_input_tokens}}
```

#### Groq (via HTTP Request Node)

```javascript
// Input Tokens
{{$json.usage.prompt_tokens}}

// Output Tokens
{{$json.usage.completion_tokens}}
```

## Example Workflow

**Scenario**: Summarize customer emails with OpenAI, track costs in Costwave.

```json
{
  "nodes": [
    {
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "webhookId": "customer-email"
    },
    {
      "name": "OpenAI GPT-4",
      "type": "@n8n/n8n-nodes-langchain.openAi",
      "parameters": {
        "model": "gpt-4o-2024-11-20",
        "prompt": "Summarize this email: {{$json.email_body}}"
      }
    },
    {
      "name": "Track Cost",
      "type": "@costwave/n8n-nodes-costwave.costwave",
      "credentials": {
        "costwaveApi": "Production Costwave"
      },
      "parameters": {
        "provider": "openai",
        "model": "gpt-4o-2024-11-20",
        "inputTokens": "={{$json.usage.prompt_tokens}}",
        "outputTokens": "={{$json.usage.completion_tokens}}",
        "workflowName": "email-summarizer",
        "runId": "={{$execution.id}}",
        "metadata": {
          "customer_id": "={{$json.customer.id}}",
          "email_subject": "={{$json.subject}}"
        }
      }
    }
  ]
}
```

## Multi-Provider Workflows

Track costs from multiple providers in a single workflow:

```
[Trigger]
  -> [Branch A]
    -> [OpenAI Node] -> [Costwave: openai]
  -> [Branch B]
    -> [Anthropic Node] -> [Costwave: anthropic]
  -> [Merge]
```

Each Costwave node sends a separate event. Group them by `runId` using `{{$execution.id}}`.

## Conditional Tracking

Only track if LLM call succeeded:

```
[LLM Node]
  -> [IF Node: {{$json.status}} === 'success']
    -> True: [Costwave Node]
    -> False: [Error Handler]
```

## Viewing Costs in Dashboard

1. Open Costwave dashboard
2. Navigate to **Workflows**
3. Find your workflow by name (e.g., `email-summarizer`)
4. View metrics:
   - Total runs
   - Success rate
   - Average cost per run
   - Total cost (month-to-date)
   - Cost breakdown by model

## Troubleshooting

### Node Not Visible

- Verify `npm link` succeeded: `ls -la ~/.n8n/node_modules | grep costwave`
- Check n8n logs: `n8n start --verbose`
- Ensure n8n >= 1.0 (custom nodes require v1+)

### Authentication Fails

- Check API key is correct (copy from Costwave dashboard)
- Verify key wasn't revoked
- Test with curl:
  ```bash
  curl -H "Authorization: Bearer ck_live_..." https://costwave.app/api/health
  ```

### Token Counts Show 0

- Verify LLM node returns `usage` object in response
- Check expression syntax: `{{$json.usage.prompt_tokens}}`
- Use Code node to inspect full response:
  ```javascript
  return [{json: $input.all()}];
  ```

### Rate Limit Errors

- Limit: 1000 requests/minute per API key
- For high-volume workflows, consider batching or using separate API keys

## Development

### Project Structure

```
sdk/n8n-nodes-costwave/
├── credentials/
│   └── CostwaveApi.credentials.ts  # API credentials definition
├── nodes/
│   └── Costwave/
│       ├── Costwave.node.ts        # Node implementation
│       ├── Costwave.node.json      # Node metadata
│       └── costwave.svg            # Node icon
├── package.json
├── tsconfig.json
└── README.md
```

### Local Development

```bash
npm install
npm run build
npm link

# In n8n directory
npm link @costwave/n8n-nodes-costwave

# Rebuild after changes
npm run build && n8n restart
```

### Publishing (Maintainers)

```bash
npm version patch  # or minor, major
npm publish
```

## API Reference

See [Costwave API Reference](../../docs/api-reference.md) for complete API documentation.

## Support

- **Issues**: [GitHub Issues](https://github.com/[username]/costwave/issues)
- **Docs**: [n8n Integration Guide](../../docs/n8n-integration.md)
- **Email**: support@[domain]

## License

MIT - see [LICENSE](../../LICENSE)
