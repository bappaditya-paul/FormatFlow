"""
FormatFlow API — Pytest configuration
"""
import pytest


@pytest.fixture
def client():
    """Return a FastAPI TestClient for integration tests with startup lifespans."""
    from fastapi.testclient import TestClient
    from app.main import app
    with TestClient(app) as c:
        yield c

