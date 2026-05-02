#!/usr/bin/env bash
# Costwave Claude Code hook
# Usage: Set as alias in .zshrc / .bashrc

set -euo pipefail

# Configuration (via env vars)
COSTWAVE_API_KEY="${COSTWAVE_API_KEY:-}"
COSTWAVE_URL="${COSTWAVE_URL:-https://costwave.app}"
WORKFLOW_NAME="${COSTWAVE_WORKFLOW_NAME:-claude-code-session}"

if [ -z "$COSTWAVE_API_KEY" ]; then
  echo "[costwave] Warning: COSTWAVE_API_KEY not set, skipping tracking" >&2
  exec claude "$@"
  exit $?
fi

# Start time
START_TIME=$(date +%s%3N)

# Run Claude Code and capture output
OUTPUT=$(claude "$@" 2>&1)
EXIT_CODE=$?

# End time
END_TIME=$(date +%s%3N)
LATENCY_MS=$((END_TIME - START_TIME))

# Extract tokens from output (if available in stderr)
# Claude Code outputs: "Tokens: 1234 in, 567 out"
INPUT_TOKENS=$(echo "$OUTPUT" | grep -oE 'Tokens: ([0-9]+) in' | grep -oE '[0-9]+' || echo "0")
OUTPUT_TOKENS=$(echo "$OUTPUT" | grep -oE '([0-9]+) out' | grep -oE '[0-9]+' || echo "0")

# Determine status
if [ $EXIT_CODE -eq 0 ]; then
  STATUS="success"
else
  STATUS="error"
fi

# Send to Costwave
curl -X POST "$COSTWAVE_URL/api/v1/events/ingest" \
  -H "Authorization: Bearer $COSTWAVE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @- <<EOF 2>/dev/null || true
{
  "type": "claude_code_session",
  "provider": "anthropic",
  "model": "claude-sonnet-4-5-20250929",
  "inputTokens": ${INPUT_TOKENS:-0},
  "outputTokens": ${OUTPUT_TOKENS:-0},
  "latencyMs": $LATENCY_MS,
  "status": "$STATUS",
  "workflowName": "$WORKFLOW_NAME",
  "metadata": {
    "command": "$(echo "$@" | head -c 200)",
    "exitCode": $EXIT_CODE
  }
}
EOF

# Print original output
echo "$OUTPUT"

exit $EXIT_CODE
