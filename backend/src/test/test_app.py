from sqlalchemy import select
from fastapi.testclient import TestClient
from http import HTTPStatus
import os
from dotenv import load_dotenv

from src.auth.database import get_db
from src.auth.router import app
from src.auth.models import User
from src.auth.security import decode

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
client = TestClient(app)
test_user = {
    'first_name': 'test',
    'last_name': 'test',
    'birth_date': '2000-05-15',
    'email': 'test@example.com',
    'password': 'testtest',
}


def test_create_user_success(client_override, session):

    response = client_override.post('/create/', json=test_user)

    new_user = session.scalar(
        select(User).where(User.email == test_user['email'])
    )

    assert response.json() == {'first_name': test_user['first_name']}
    assert new_user.first_name == test_user['first_name']
    assert response.status_code == HTTPStatus.CREATED


def test_create_user_conflict_email(client_override, add_user_database):
    response = client_override.post('/create/', json=test_user)

    assert response.status_code == HTTPStatus.CONFLICT


def test_login_user_success(client_override, session, add_user_database):
    response = client_override.post(
        '/login/',
        json={'email': test_user['email'], 'password': test_user['password']},
    )

    existing_user = session.scalar(
        select(User).where(User.email == test_user['email'])
    )

    token = response.json()['access_token']
    payload = decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    subject_id = payload.get('id')

    assert subject_id == existing_user.id


def test_login_email_not_found(client_override, session):
    response = client_override.post(
        '/login/',
        json={'email': test_user['email'], 'password': test_user['password']},
    )

    assert response.status_code == HTTPStatus.NOT_FOUND


def test_login_user_incorrect_password(
    client_override, session, add_user_database
):
    response = client_override.post(
        '/login/', json={'email': test_user['email'], 'password': ''}
    )

    assert response.status_code == HTTPStatus.UNAUTHORIZED
