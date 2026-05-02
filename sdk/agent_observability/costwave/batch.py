import httpx
import threading
import time
from queue import Queue
from typing import Dict, Any

class BatchSender:
    def __init__(
        self,
        api_key: str,
        base_url: str = "https://costwave.app",
        max_batch_size: int = 100,
        flush_interval: float = 5.0,
    ):
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.max_batch_size = max_batch_size
        self.flush_interval = flush_interval
        self._queue: Queue = Queue()
        self._client = httpx.Client(
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=30.0,
        )
        self._running = True
        self._worker = threading.Thread(target=self._worker_loop, daemon=True)
        self._worker.start()

    def track(self, event: Dict[str, Any]):
        """Queue event for batch sending."""
        self._queue.put(event)

    def _worker_loop(self):
        batch = []
        last_flush = time.time()

        while self._running:
            try:
                # Get event with timeout
                event = self._queue.get(timeout=1.0)
                batch.append(event)

                # Flush if batch full or interval reached
                should_flush = (
                    len(batch) >= self.max_batch_size
                    or (time.time() - last_flush) >= self.flush_interval
                )

                if should_flush:
                    self._flush_batch(batch)
                    batch = []
                    last_flush = time.time()

            except:
                # Timeout or error: flush if pending
                if batch:
                    self._flush_batch(batch)
                    batch = []
                    last_flush = time.time()

    def _flush_batch(self, batch: list):
        if not batch:
            return

        # Send each event individually (no batch endpoint yet)
        for event in batch:
            try:
                self._client.post(
                    f"{self.base_url}/api/v1/events/ingest",
                    json=event,
                )
            except Exception as e:
                print(f"[costwave] Failed to send event: {e}")

    def close(self):
        self._running = False
        self._worker.join(timeout=5.0)
        self._client.close()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
