# Costwave Python SDK

Track AI costs from Python scripts, agents, and automation workflows.

## Installation

```bash
pip install -e .
```

## Usage

### Basic tracking

```python
from costwave import CostwaveClient

client = CostwaveClient(api_key="ck_live_...")

client.track(
    provider="anthropic",
    model="claude-sonnet-4-5-20250929",
    input_tokens=1250,
    output_tokens=420,
    latency_ms=850,
    workflow_name="my-automation",
)

client.close()
```

### Context manager

```python
with CostwaveClient(api_key="ck_live_...") as client:
    client.track(
        provider="openai",
        model="gpt-4o-2024-11-20",
        input_tokens=500,
        output_tokens=200,
    )
```

### Batch mode (async queue)

```python
from costwave import BatchSender

sender = BatchSender(api_key="ck_live_...", flush_interval=5.0)

for i in range(100):
    sender.track({
        "type": "llm_generation",
        "provider": "anthropic",
        "model": "claude-haiku-4-20250514",
        "inputTokens": 50,
        "outputTokens": 20,
    })

sender.close()  # Flushes remaining events
```

## Configuration

### Parameters

- `api_key`: Get from Costwave dashboard (Settings > API Keys)
- `base_url`: Default `https://costwave.app` (change for self-hosted)
- `timeout`: Request timeout in seconds (default: 10.0)

### Environment Variables

Set these to avoid hardcoding credentials:

```bash
export COSTWAVE_API_KEY="ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export COSTWAVE_URL="https://costwave.app"  # Optional, for self-hosted
export COSTWAVE_WORKFLOW_NAME="my-agent"    # Optional, default workflow name
```

Then use client without parameters:

```python
from costwave import CostwaveClient

# Reads from environment
client = CostwaveClient()
```

### Self-Hosted

```python
client = CostwaveClient(
    api_key="ck_live_...",
    base_url="https://your-domain.com",
)
```
