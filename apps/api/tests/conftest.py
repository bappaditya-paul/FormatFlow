"""
FormatFlow API — Pytest configuration
"""
import pytest


@pytest.fixture
def client():
    """Return a FastAPI TestClient for integration tests."""
    from fastapi.testclient import TestClient
    from app.main import app
    return TestClient(app)
