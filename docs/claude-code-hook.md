# Claude Code Hook

Automatically track Claude Code session costs with a shell wrapper.

## Why Use the Hook?

Claude Code sessions can consume significant tokens, especially when working on large projects or using Opus models. The hook automatically captures:

- Token usage per session
- Model used (Sonnet, Opus, Haiku)
- Session latency
- Input/output token breakdown

All tracked events appear in your Costwave dashboard under the `claude-code-session` workflow (or custom name).

## Installation

### 1. Get API Key

Navigate to **Settings > API Keys** in Costwave and create a new key.

### 2. Add to Shell Config

Edit `~/.zshrc` or `~/.bashrc`:

```bash
# Costwave Claude Code tracking
export COSTWAVE_API_KEY="ck_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
export COSTWAVE_URL="https://costwave.app"  # Optional, for self-hosted
export COSTWAVE_WORKFLOW_NAME="my-project-name"  # Optional, default: claude-code-session

alias claude="/path/to/costwave/hooks/costwave-claude.sh"
```

Replace `/path/to/costwave` with the actual path to your Costwave repository.

### 3. Reload Shell

```bash
source ~/.zshrc  # or source ~/.bashrc
```

### 4. Verify Installation

```bash
which claude
# Should output: claude: aliased to /path/to/costwave/hooks/costwave-claude.sh

echo $COSTWAVE_API_KEY
# Should output: ck_live_...
```

## Usage

Use Claude Code normally - the wrapper is transparent:

```bash
claude "Build a React component for user authentication"
```

**What happens**:
1. Wrapper measures start time
2. Calls real Claude Code CLI
3. Extracts token counts from stderr (if available)
4. Measures end time (latency)
5. Sends event to Costwave API
6. Preserves original exit code and output

## Configuration

### Custom Workflow Name

Group sessions by project:

```bash
export COSTWAVE_WORKFLOW_NAME="my-saas-project"
claude "Add Stripe integration"
# Tracked under "my-saas-project" workflow
```

Or set per-command:

```bash
COSTWAVE_WORKFLOW_NAME="refactor-auth" claude "Refactor authentication"
```

### Self-Hosted Costwave

```bash
export COSTWAVE_URL="https://costwave.yourdomain.com"
```

### Disable Tracking Temporarily

```bash
unset COSTWAVE_API_KEY
claude "Private session not tracked"

export COSTWAVE_API_KEY="ck_live_..."  # Re-enable
```

## How It Works

The wrapper script performs these steps:

1. **Pre-execution**:
   - Record start timestamp
   - Validate `COSTWAVE_API_KEY` is set

2. **Execution**:
   - Call real `claude` binary (via `$(which claude)` or hardcoded path)
   - Capture stdout, stderr, and exit code
   - Parse stderr for token usage metadata (if Claude Code exposes it)

3. **Post-execution**:
   - Calculate latency: `end_time - start_time`
   - Extract model from Claude Code output (if available)
   - Default to `claude-sonnet-4-5-20250929` if not detectable
   - Send event to `POST /api/v1/events/ingest`

4. **Cleanup**:
   - Restore original stdout/stderr
   - Exit with original exit code

**Failure handling**: If Costwave API is unreachable or returns an error, the script logs the issue but doesn't interrupt Claude Code execution.

## Limitations

### Token Extraction Requires Anthropic SDK

The wrapper can only extract exact token counts if:
- Claude Code is installed via npm/homebrew (official distribution)
- Anthropic SDK is accessible in the runtime
- Claude Code outputs usage metadata to stderr

If tokens can't be extracted, the wrapper estimates based on input/output length (less accurate).

### No Tracking for Subprocesses

Only top-level `claude` commands are tracked. If Claude Code spawns sub-agents or tools internally, those aren't individually tracked unless they also call the API.

### Environment-Specific Paths

The wrapper relies on shell aliases. If you use Claude Code from cron, systemd, or non-interactive shells, you must:
1. Source the environment (`source ~/.zshrc`)
2. Or use the full path to the wrapper script directly

## Troubleshooting

### Events Not Appearing in Dashboard

1. **Check API key is valid**:
   ```bash
   curl -X POST https://costwave.app/api/v1/events/ingest \
     -H "Authorization: Bearer $COSTWAVE_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"type":"test","provider":"anthropic","model":"test","inputTokens":0,"outputTokens":0}'
   ```
   Should return `{"success":true,"eventId":"...","costUsd":"0.00000000"}`.

2. **Verify wrapper is called**:
   ```bash
   type claude
   # Should show: claude is aliased to `/path/to/costwave-claude.sh`
   ```

3. **Check stderr output**:
   The wrapper logs to stderr if tracking fails. Run with stderr visible:
   ```bash
   claude "test" 2>&1 | grep -i costwave
   ```

### Alias Not Working

- **Issue**: `claude: command not found`
- **Fix**: Reload shell or check alias syntax
  ```bash
  source ~/.zshrc
  alias | grep claude
  ```

### Rate Limit Errors

- **Issue**: `429 Too Many Requests`
- **Fix**: Reduce Claude Code usage frequency or use a separate API key for hooks

### Token Counts Show as 0

- **Issue**: Wrapper can't extract usage from Claude Code output
- **Fix**: This is expected if Claude Code doesn't expose token metadata. Costs are still calculated based on model defaults or input/output estimates.

## Multi-Project Setup

Track different projects with separate workflows:

### Option 1: Directory-Specific Config

Create `.envrc` files per project (requires `direnv`):

```bash
# ~/projects/saas-app/.envrc
export COSTWAVE_WORKFLOW_NAME="saas-app"

# ~/projects/cli-tool/.envrc
export COSTWAVE_WORKFLOW_NAME="cli-tool"
```

Install `direnv` and allow each directory:
```bash
brew install direnv  # macOS
direnv allow ~/projects/saas-app
direnv allow ~/projects/cli-tool
```

### Option 2: Shell Functions

Define project-specific wrappers in `~/.zshrc`:

```bash
function claude-saas() {
  COSTWAVE_WORKFLOW_NAME="saas-app" claude "$@"
}

function claude-cli() {
  COSTWAVE_WORKFLOW_NAME="cli-tool" claude "$@"
}
```

Usage:
```bash
claude-saas "Add authentication"
claude-cli "Fix argument parsing"
```

## Security Considerations

- **API keys in shell config**: Shell config files (`~/.zshrc`) are readable by your user. Ensure proper file permissions:
  ```bash
  chmod 600 ~/.zshrc
  ```

- **Shared machines**: If multiple users share a machine, consider per-user API keys or workspace-scoped keys (future feature).

- **Key rotation**: Revoke old keys in Costwave dashboard when rotating credentials.

## Next Steps

- **[Python SDK](./sdk-python.md)** - Track custom Python agents
- **[n8n Integration](./n8n-integration.md)** - No-code workflow tracking
- **[API Reference](./api-reference.md)** - Build custom integrations
