from pwdlib import PasswordHash
import os
from dotenv import load_dotenv
from jwt import DecodeError, decode, encode
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Depends, HTTPException
from fastapi.security import (
    OAuth2PasswordBearer,
    HTTPBearer,
    HTTPAuthorizationCredentials,
)
from http import HTTPStatus

from src.auth.database import get_db
from src.auth.models import User


load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
ALGORITHM = os.getenv('ALGORITHM')
pwd_context = PasswordHash.recommended()
oauth2_scheme = HTTPBearer()


def get_password_hash(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)


def create_token(data: dict):
    to_encode = data.copy()

    encoded_jwt = encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    return encoded_jwt


def get_current_user(
    session: Session = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
):

    try:
        payload = decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        subject_id = int(payload.get('sub'))

        if not subject_id:
            raise HTTPException(
                status_code=HTTPStatus.UNAUTHORIZED, detail='id not found'
            )

    except DecodeError:
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail='Could not validate credentials',
        )

    user = session.scalar(select(User).where(User.id == subject_id))

    if not user:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='User not found',
        )

    return user
