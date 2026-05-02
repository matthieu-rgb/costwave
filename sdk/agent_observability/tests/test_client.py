import pytest
from costwave import CostwaveClient

def test_client_initialization():
    client = CostwaveClient(api_key="ck_test_fake")
    assert client.api_key == "ck_test_fake"
    assert client.base_url == "https://costwave.app"
    client.close()

def test_context_manager():
    with CostwaveClient(api_key="ck_test_fake") as client:
        assert client is not None
