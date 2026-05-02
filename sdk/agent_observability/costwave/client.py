import httpx
from typing import Optional, Dict, Any

class CostwaveClient:
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://costwave.app",
        timeout: float = 10.0,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._client = httpx.Client(
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=timeout,
        )

    def track(
        self,
        *,
        provider: str,
        model: str,
        input_tokens: int,
        output_tokens: int,
        cached_tokens: int = 0,
        latency_ms: Optional[int] = None,
        type: str = "llm_generation",
        status: str = "success",
        workflow_name: Optional[str] = None,
        run_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Track a single LLM event.

        Returns:
            {"success": True, "eventId": "...", "costUsd": "0.00012345"}
        """
        payload = {
            "type": type,
            "provider": provider,
            "model": model,
            "inputTokens": input_tokens,
            "outputTokens": output_tokens,
            "cachedTokens": cached_tokens,
            "latencyMs": latency_ms,
            "status": status,
            "workflowName": workflow_name,
            "runId": run_id,
            "metadata": metadata or {},
        }

        response = self._client.post(
            f"{self.base_url}/api/v1/events/ingest",
            json=payload,
        )
        response.raise_for_status()
        return response.json()

    def close(self):
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
