# Costwave Claude Code Hook

Track Claude Code usage automatically with shell wrapper.

## Installation

1. Get API key from Costwave dashboard (Settings > API Keys)

2. Add to `.zshrc` or `.bashrc`:

```bash
export COSTWAVE_API_KEY="ck_live_..."
export COSTWAVE_URL="https://costwave.app"  # Optional, for self-hosted
export COSTWAVE_WORKFLOW_NAME="my-project"  # Optional, default: claude-code-session

alias claude="/path/to/costwave/hooks/costwave-claude.sh"
```

3. Reload shell:

```bash
source ~/.zshrc
```

4. Use Claude Code normally:

```bash
claude "Build a React component"
```

Events appear in Costwave dashboard under "claude-code-session" workflow.

## How It Works

- Wraps `claude` command
- Measures latency
- Extracts token counts from stderr (if available)
- Sends event to Costwave API
- Preserves original output and exit code

## Troubleshooting

### Tracking Fails Silently

- Claude Code still runs normally even if Costwave API is down
- Check wrapper is called: `type claude`
- Verify API key: `echo $COSTWAVE_API_KEY`
- Test endpoint: `curl -H "Authorization: Bearer $COSTWAVE_API_KEY" $COSTWAVE_URL/api/health`

### Events Not Appearing

- Wait 30 seconds (async sending)
- Check dashboard filters (workflow name must match)
- Verify API key wasn't revoked in Settings > API Keys
- Test with direct API call:
  ```bash
  curl -X POST $COSTWAVE_URL/api/v1/events/ingest \
    -H "Authorization: Bearer $COSTWAVE_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"type":"test","provider":"anthropic","model":"test","inputTokens":0,"outputTokens":0}'
  ```

### Alias Not Found

- Reload shell: `source ~/.zshrc`
- Check alias is set: `alias | grep claude`
- Ensure path is correct: `ls -la /path/to/costwave/hooks/costwave-claude.sh`
