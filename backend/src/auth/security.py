from pwdlib import PasswordHash
import os
from dotenv import load_dotenv
from jwt import DecodeError, decode, encode
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from http import HTTPStatus

from src.auth.database import get_db
from src.auth.models import User


load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
pwd_context = PasswordHash.recommended()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

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
    token: str = Depends(oauth2_scheme),
):
    credentials_exception = HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        subject_id = payload.get("id")

        if not subject_id:
            raise credentials_exception

    except DecodeError:
        raise credentials_exception

    user = session.scalar(select(User).where(User.id == subject_id))

    if not user:
        raise credentials_exception
    
    return user