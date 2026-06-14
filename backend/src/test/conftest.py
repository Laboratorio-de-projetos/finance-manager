from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
import pytest
from fastapi.testclient import TestClient

from src.auth.models import User, Transaction
from src.auth.router import app
from src.auth.database import get_db
from src.auth.security import get_password_hash


load_dotenv()
TEST_DATABASE_URL = os.getenv('TEST_DATABASE_URL')

engine = create_engine(TEST_DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


@pytest.fixture
def session():
    with SessionLocal() as session:
        yield session
        session.query(User).delete()
        session.query(Transaction).delete()
        session.commit()


@pytest.fixture
def client_override(session):
    def get_db_override():
        yield session

    app.dependency_overrides[get_db] = get_db_override

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()


@pytest.fixture
def add_user_database(session):
    test_user = User(
        first_name='test',
        last_name='test',
        birth_date='2000-05-15',
        email='test@example.com',
        password=get_password_hash('testtest'),
    )

    session.add(test_user)
    session.commit

    return test_user
