"""
FormatFlow — Health check tests
"""


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "FormatFlow"


def test_v1_ping(client):
    response = client.get("/v1/ping")
    assert response.status_code == 200
    assert response.json()["pong"] is True
