# n8n Integration

Track costs from n8n workflows using the custom Costwave node.

## Overview

The Costwave n8n node allows you to track LLM API usage from n8n workflows without writing code. Useful for:

- Automation workflows calling OpenAI, Anthropic, etc.
- Multi-step pipelines with LLM processing
- Scheduled jobs with AI-powered tasks
- Cost monitoring for production n8n instances

## Prerequisites

- n8n self-hosted instance (community nodes not supported in n8n Cloud)
- Costwave account with API key
- Node.js 18+ (required by n8n)

## Installation

### 1. Install Custom Node

Clone the Costwave repository and install the n8n node:

```bash
cd /path/to/costwave/sdk/n8n-nodes-costwave
npm install
npm run build
npm link
```

### 2. Link to n8n

Navigate to your n8n installation directory:

```bash
cd ~/.n8n  # Default n8n user directory
npm link @costwave/n8n-nodes-costwave
```

### 3. Restart n8n

```bash
n8n restart
```

The Costwave node should now appear in the node palette under "Costwave".

## Configuration

### 1. Create Costwave Credentials

In n8n:

1. Go to **Credentials** > **New Credential**
2. Search for "Costwave"
3. Enter:
   - **API Key**: Your Costwave API key (`ck_live_...`)
   - **Base URL**: `https://costwave.app` (or your self-hosted URL)
4. Click **Save**

### 2. Test Connection

1. Create a new workflow
2. Add a Costwave node
3. Select your credential
4. Click **Test Connection**

Should return: "Connection successful".

## Usage

### Basic Tracking

Add the Costwave node after any LLM API call to track costs:

```
[Trigger] -> [OpenAI Node] -> [Costwave Track Node] -> [...]
```

**Costwave Node Configuration**:

| Field | Value | Example |
|-------|-------|---------|
| Provider | Select from dropdown | `anthropic` |
| Model | Model identifier | `claude-sonnet-4-5-20250929` |
| Input Tokens | Expression or static | `{{$json.usage.input_tokens}}` |
| Output Tokens | Expression or static | `{{$json.usage.output_tokens}}` |
| Workflow Name | Optional | `customer-email-automation` |
| Run ID | Optional (auto-generated if empty) | `{{$execution.id}}` |

### Extracting Token Counts

Most LLM nodes return usage metadata. Use n8n expressions to extract:

#### OpenAI Node

```javascript
// Input Tokens
{{$json.usage.prompt_tokens}}

// Output Tokens
{{$json.usage.completion_tokens}}
```

#### Anthropic Node (via HTTP Request)

```javascript
// Input Tokens
{{$json.usage.input_tokens}}

// Output Tokens
{{$json.usage.output_tokens}}
```

### Example Workflow

**Scenario**: Summarize customer emails with Claude, track costs.

```json
{
  "nodes": [
    {
      "name": "Trigger",
      "type": "n8n-nodes-base.webhook",
      "webhookId": "customer-email"
    },
    {
      "name": "Call Claude",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "https://api.anthropic.com/v1/messages",
        "authentication": "predefinedCredentialType",
        "method": "POST",
        "body": {
          "model": "claude-sonnet-4-5-20250929",
          "messages": [
            {
              "role": "user",
              "content": "Summarize: {{$json.email_body}}"
            }
          ]
        }
      }
    },
    {
      "name": "Track Cost",
      "type": "@costwave/n8n-nodes-costwave.costwave",
      "credentials": {
        "costwaveApi": "Costwave Production"
      },
      "parameters": {
        "provider": "anthropic",
        "model": "claude-sonnet-4-5-20250929",
        "inputTokens": "={{$json.usage.input_tokens}}",
        "outputTokens": "={{$json.usage.output_tokens}}",
        "workflowName": "email-summarizer",
        "runId": "={{$execution.id}}"
      }
    }
  ]
}
```

### Multi-Provider Workflow

Track costs from multiple LLM providers in a single workflow:

```
[Trigger]
  -> [OpenAI GPT-4] -> [Costwave Track: OpenAI]
  -> [Anthropic Claude] -> [Costwave Track: Anthropic]
  -> [Groq Llama] -> [Costwave Track: Groq]
  -> [Done]
```

Each Costwave node sends a separate event. They'll be grouped by `runId` if you use `{{$execution.id}}`.

## Advanced Configuration

### Conditional Tracking

Only track if LLM call succeeded:

1. Add an **IF** node after the LLM call
2. Condition: `{{$json.status}} === 'success'`
3. **True** branch: Costwave node
4. **False** branch: Error handler

### Metadata Enrichment

Add custom metadata to track additional context:

```javascript
// In Costwave node "Metadata" field (JSON)
{
  "customer_id": "{{$json.customer.id}}",
  "email_subject": "{{$json.subject}}",
  "priority": "{{$json.priority}}"
}
```

### Batch Processing

For bulk operations, use a loop:

```
[Trigger]
  -> [Split In Batches]
    -> [OpenAI Node]
    -> [Costwave Track Node]
  -> [Merge]
```

Each iteration tracks costs individually. Costs are aggregated in Costwave dashboard by `workflowName`.

## Viewing Tracked Costs

1. Navigate to **Workflows** in Costwave dashboard
2. Find your workflow by name (e.g., `email-summarizer`)
3. View:
   - Total runs
   - Success rate
   - Average cost per run
   - Total cost (MTD)
   - Recent executions

[screenshot: workflow detail view]

## Troubleshooting

### Node Not Appearing in Palette

- **Issue**: Costwave node doesn't show in n8n
- **Fix**:
  1. Verify `npm link` succeeded: `ls -la ~/.n8n/node_modules | grep costwave`
  2. Check n8n logs for errors: `n8n start --verbose`
  3. Ensure n8n version >= 1.0 (custom nodes require v1+)

### Authentication Errors

- **Issue**: `401 Unauthorized`
- **Fix**:
  1. Verify API key in Credentials is correct
  2. Check key wasn't revoked in Costwave dashboard
  3. Test with curl:
     ```bash
     curl -H "Authorization: Bearer ck_live_..." \
          https://costwave.app/api/health
     ```

### Token Counts Missing

- **Issue**: Costwave shows 0 tokens even though LLM was called
- **Fix**:
  1. Check LLM node returns `usage` in response
  2. Verify expression syntax: `{{$json.usage.prompt_tokens}}`
  3. Use **Code** node to log full response:
     ```javascript
     return [{json: $input.all()}];
     ```

### Rate Limit Errors

- **Issue**: `429 Too Many Requests`
- **Fix**:
  - Limit: 1000 requests/minute per API key
  - For high-volume workflows, use BatchSender in a custom Code node instead

## Example Workflows

### Customer Support Automation

Summarize support tickets and track Claude usage.

**Download**: [customer-support-workflow.json](../examples/n8n/customer-support-workflow.json)

### Content Generation Pipeline

Generate blog posts with GPT-4, track costs per article.

**Download**: [content-pipeline-workflow.json](../examples/n8n/content-pipeline-workflow.json)

### Translation Service

Translate documents with Mistral, track costs by language pair.

**Download**: [translation-workflow.json](../examples/n8n/translation-workflow.json)

## Best Practices

1. **Use execution ID as run ID**: `{{$execution.id}}` groups all events in a workflow run
2. **Name workflows descriptively**: Use kebab-case, e.g., `customer-email-summarizer`
3. **Add error handling**: Wrap LLM calls in Try/Catch blocks
4. **Track failures**: Send events with `status: "error"` when LLM calls fail
5. **Enrich metadata**: Include customer ID, source, priority for filtering
6. **Monitor regularly**: Set budgets in Costwave dashboard for n8n workflows

## Migration from Manual HTTP Requests

If you're currently calling Costwave API via HTTP Request nodes:

**Before**:
```
[OpenAI] -> [HTTP Request to /api/v1/events/ingest] -> [...]
```

**After**:
```
[OpenAI] -> [Costwave Node] -> [...]
```

**Benefits**:
- Simpler configuration (no manual JSON)
- Built-in validation
- Credential management
- Error handling

## Self-Hosted Costwave

Update credential **Base URL** to your deployment:

```
https://costwave.yourdomain.com
```

Ensure n8n can reach the URL (check firewall, DNS).

## Next Steps

- **[Python SDK](./sdk-python.md)** - Track custom Python agents
- **[Claude Code Hook](./claude-code-hook.md)** - Automatic Claude Code tracking
- **[API Reference](./api-reference.md)** - Build custom nodes
