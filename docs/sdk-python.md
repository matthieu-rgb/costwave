# Python SDK

Track AI costs from Python scripts, agents, and automation workflows.

## Installation

### From PyPI (when published)

```bash
pip install costwave-sdk
```

### From Source (development)

```bash
cd sdk/agent_observability
pip install -e .
```

## Quick Start

```python
from costwave import CostwaveClient

client = CostwaveClient(api_key="ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX")

client.track(
    provider="anthropic",
    model="claude-sonnet-4-5-20250929",
    input_tokens=1250,
    output_tokens=420,
    workflow_name="customer-support-agent",
)

client.close()
```

## Configuration

### API Key

Set via parameter or environment variable:

```python
# Option 1: Parameter
client = CostwaveClient(api_key="ck_live_...")

# Option 2: Environment variable
import os
os.environ["COSTWAVE_API_KEY"] = "ck_live_..."
client = CostwaveClient()
```

### Base URL (Self-Hosted)

```python
client = CostwaveClient(
    api_key="ck_live_...",
    base_url="https://your-domain.com",
)
```

### Timeout

```python
client = CostwaveClient(
    api_key="ck_live_...",
    timeout=30.0,  # seconds (default: 10.0)
)
```

## Usage Patterns

### Context Manager (Recommended)

Automatically closes the client and flushes pending events.

```python
with CostwaveClient(api_key="ck_live_...") as client:
    client.track(
        provider="openai",
        model="gpt-4o-2024-11-20",
        input_tokens=500,
        output_tokens=200,
    )
```

### Manual Tracking

Full control over event parameters.

```python
client.track(
    type="llm_generation",
    provider="anthropic",
    model="claude-haiku-4-20250514",
    input_tokens=100,
    output_tokens=50,
    cached_tokens=20,
    latency_ms=350,
    status="success",
    workflow_name="slack-bot",
    run_id="550e8400-e29b-41d4-a716-446655440000",
    metadata={"user": "alice@example.com", "channel": "#support"},
)
```

### Decorator Pattern

Track function calls automatically.

```python
@client.track_call(provider="anthropic", model="claude-sonnet-4-5-20250929")
def generate_summary(text: str) -> str:
    # Your LLM call here
    response = anthropic_client.messages.create(
        model="claude-sonnet-4-5-20250929",
        messages=[{"role": "user", "content": f"Summarize: {text}"}],
    )
    return response.content[0].text

summary = generate_summary("Long article text...")
# Automatically tracked with token counts extracted
```

### Batch Mode (High Volume)

Async queue with periodic flushing for high-throughput scenarios.

```python
from costwave import BatchSender

sender = BatchSender(
    api_key="ck_live_...",
    flush_interval=5.0,  # Flush every 5 seconds
    max_batch_size=100,  # Or when 100 events queued
)

for i in range(1000):
    sender.track({
        "type": "llm_generation",
        "provider": "groq",
        "model": "llama-3.3-70b-versatile",
        "inputTokens": 50,
        "outputTokens": 20,
        "workflowName": "batch-processor",
    })

sender.close()  # Flushes remaining events
```

**Benefits**:
- Non-blocking - events queued in background thread
- Automatic batching reduces API calls
- Resilient - retries failed flushes

## Auto-Instrumentation

Automatically track SDK calls from popular LLM libraries.

### Anthropic SDK

```python
from costwave import auto_instrument_anthropic
from anthropic import Anthropic

anthropic_client = Anthropic(api_key="...")
auto_instrument_anthropic(anthropic_client, costwave_api_key="ck_live_...")

# All messages.create() calls are now tracked automatically
response = anthropic_client.messages.create(
    model="claude-sonnet-4-5-20250929",
    messages=[{"role": "user", "content": "Hello"}],
)
# Event sent to Costwave with actual token usage
```

### OpenAI SDK

```python
from costwave import auto_instrument_openai
from openai import OpenAI

openai_client = OpenAI(api_key="...")
auto_instrument_openai(openai_client, costwave_api_key="ck_live_...")

# All chat.completions.create() calls are now tracked
response = openai_client.chat.completions.create(
    model="gpt-4o-2024-11-20",
    messages=[{"role": "user", "content": "Hello"}],
)
# Event sent to Costwave with actual token usage
```

### Mistral SDK

```python
from costwave import auto_instrument_mistral
from mistralai import Mistral

mistral_client = Mistral(api_key="...")
auto_instrument_mistral(mistral_client, costwave_api_key="ck_live_...")

# All chat.complete() calls are now tracked
response = mistral_client.chat.complete(
    model="mistral-small-latest",
    messages=[{"role": "user", "content": "Hello"}],
)
```

**How it works**:
- Wraps SDK client methods
- Extracts token counts from responses
- Sends events to Costwave asynchronously
- Preserves original SDK behavior

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `COSTWAVE_API_KEY` | API key for authentication | Required |
| `COSTWAVE_URL` | Base URL for API | `https://costwave.app` |
| `COSTWAVE_TIMEOUT` | Request timeout (seconds) | `10.0` |
| `COSTWAVE_WORKFLOW_NAME` | Default workflow name | None |

Example `.env` file:

```bash
COSTWAVE_API_KEY=ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
COSTWAVE_URL=https://costwave.app
COSTWAVE_WORKFLOW_NAME=my-python-agent
```

## Examples

### Simple Agent

```python
import os
from anthropic import Anthropic
from costwave import CostwaveClient

anthropic_client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
costwave_client = CostwaveClient(api_key=os.getenv("COSTWAVE_API_KEY"))

def ask_claude(prompt: str) -> str:
    response = anthropic_client.messages.create(
        model="claude-sonnet-4-5-20250929",
        messages=[{"role": "user", "content": prompt}],
    )

    # Track cost
    costwave_client.track(
        provider="anthropic",
        model="claude-sonnet-4-5-20250929",
        input_tokens=response.usage.input_tokens,
        output_tokens=response.usage.output_tokens,
        workflow_name="simple-agent",
    )

    return response.content[0].text

answer = ask_claude("What is the capital of France?")
print(answer)
costwave_client.close()
```

### Multi-Provider Agent

```python
from costwave import CostwaveClient
from anthropic import Anthropic
from openai import OpenAI

costwave = CostwaveClient(api_key="ck_live_...")
anthropic = Anthropic(api_key="...")
openai = OpenAI(api_key="...")

def route_to_best_model(prompt: str, complexity: str):
    if complexity == "simple":
        # Use cheap model
        response = openai.chat.completions.create(
            model="gpt-4o-mini-2024-07-18",
            messages=[{"role": "user", "content": prompt}],
        )
        costwave.track(
            provider="openai",
            model="gpt-4o-mini-2024-07-18",
            input_tokens=response.usage.prompt_tokens,
            output_tokens=response.usage.completion_tokens,
            workflow_name="multi-provider-router",
        )
        return response.choices[0].message.content
    else:
        # Use powerful model
        response = anthropic.messages.create(
            model="claude-opus-4-5-20251101",
            messages=[{"role": "user", "content": prompt}],
        )
        costwave.track(
            provider="anthropic",
            model="claude-opus-4-5-20251101",
            input_tokens=response.usage.input_tokens,
            output_tokens=response.usage.output_tokens,
            workflow_name="multi-provider-router",
        )
        return response.content[0].text
```

### Batch Processing

```python
from costwave import BatchSender

sender = BatchSender(api_key="ck_live_...", flush_interval=10.0)

def process_batch(documents: list[str]):
    for doc in documents:
        # Simulate LLM call
        response = call_llm(doc)

        # Queue tracking event
        sender.track({
            "provider": "groq",
            "model": "llama-3.3-70b-versatile",
            "inputTokens": len(doc.split()),  # Simplified
            "outputTokens": len(response.split()),
            "workflowName": "document-processor",
        })

process_batch(["doc1", "doc2", "doc3", ...])
sender.close()
```

## Troubleshooting

### Authentication Errors

```
401 Unauthorized: Invalid API key
```

- Verify key format: `ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
- Check key wasn't revoked in dashboard
- Ensure key is set in environment or passed to client

### Rate Limiting

```
429 Too Many Requests: Rate limit exceeded
```

- Limit: 1000 requests per minute per API key
- Use `BatchSender` to reduce API calls
- Implement exponential backoff retry logic

### Connection Errors

```
ConnectionError: Failed to connect to Costwave API
```

- Check `base_url` is correct (especially for self-hosted)
- Verify firewall/network allows HTTPS to Costwave
- Increase `timeout` parameter if requests are slow

### Missing Token Counts

If auto-instrumentation doesn't capture tokens:

1. Ensure SDK version is supported
2. Check SDK response includes `usage` field
3. Fall back to manual `client.track()` calls
4. File an issue on GitHub with SDK version details

## API Reference

See full API details in [api-reference.md](./api-reference.md).

## Next Steps

- **[Claude Code Hook](./claude-code-hook.md)** - Track Claude Code sessions
- **[n8n Integration](./n8n-integration.md)** - No-code workflow tracking
- **[API Reference](./api-reference.md)** - Low-level REST API docs
