import pytest
from app import create_app, db


@pytest.fixture()
def client():
    app = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret",
    })
    with app.app_context():
        db.drop_all()
        db.create_all()
    with app.test_client() as client:
        yield client


def register(client, email="user@example.com"):
    return client.post("/api/auth/register", json={
        "name": "Test User",
        "email": email,
        "password": "Password123!",
    })


def auth_header(client):
    data = register(client).get_json()
    return {"Authorization": f"Bearer {data['token']}"}


def test_register_success(client):
    response = register(client)
    assert response.status_code == 201
    assert response.get_json()["user"]["email"] == "user@example.com"


def test_register_duplicate_email_fails(client):
    register(client)
    response = register(client)
    assert response.status_code == 400


def test_login_wrong_password_fails(client):
    register(client)
    response = client.post("/api/auth/login", json={"email": "user@example.com", "password": "wrong"})
    assert response.status_code == 401


def test_create_ticket_requires_auth(client):
    response = client.post("/api/tickets", json={})
    assert response.status_code == 401


def test_create_and_get_ticket(client):
    headers = auth_header(client)
    created = client.post("/api/tickets", headers=headers, json={
        "title": "Broken classroom projector",
        "description": "The projector does not turn on during lectures.",
        "category": "Facilities",
        "priority": "high",
    })
    assert created.status_code == 201
    ticket_id = created.get_json()["id"]
    fetched = client.get(f"/api/tickets/{ticket_id}", headers=headers)
    assert fetched.status_code == 200
    assert fetched.get_json()["title"] == "Broken classroom projector"


def test_ticket_validation(client):
    headers = auth_header(client)
    response = client.post("/api/tickets", headers=headers, json={
        "title": "Bad",
        "description": "short",
        "category": "",
        "priority": "urgent",
    })
    assert response.status_code == 400
    assert "errors" in response.get_json()


def test_comment_crud(client):
    headers = auth_header(client)
    ticket = client.post("/api/tickets", headers=headers, json={
        "title": "WiFi problem in lab",
        "description": "WiFi disconnects every few minutes in the computer lab.",
        "category": "IT",
        "priority": "medium",
    }).get_json()
    created = client.post(f"/api/tickets/{ticket['id']}/comments", headers=headers, json={"body": "Please check this soon."})
    assert created.status_code == 201
    comment_id = created.get_json()["id"]
    updated = client.put(f"/api/comments/{comment_id}", headers=headers, json={"body": "Updated comment text."})
    assert updated.status_code == 200
    deleted = client.delete(f"/api/comments/{comment_id}", headers=headers)
    assert deleted.status_code == 200


def test_dashboard_returns_counts(client):
    headers = auth_header(client)
    client.post("/api/tickets", headers=headers, json={
        "title": "Library AC issue",
        "description": "The air conditioner on second floor is not cooling.",
        "category": "Facilities",
        "priority": "low",
    })
    response = client.get("/api/dashboard", headers=headers)
    assert response.status_code == 200
    assert response.get_json()["total"] == 1
