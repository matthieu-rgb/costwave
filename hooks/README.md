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

- If tracking fails, Claude Code still runs normally
- Check API key is valid: `echo $COSTWAVE_API_KEY`
- Test endpoint: `curl -H "Authorization: Bearer $COSTWAVE_API_KEY" $COSTWAVE_URL/api/health`
