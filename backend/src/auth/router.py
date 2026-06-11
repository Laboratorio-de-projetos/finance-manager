from fastapi import FastAPI, HTTPException, Depends
from http import HTTPStatus
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from src.auth.database import get_db
from src.auth.schemas import PrivateUser, Username
from src.auth.models import User, Transaction
from src.auth.security import get_password_hash

app = FastAPI()


@app.post("/create/", status_code=HTTPStatus.CREATED, response_model=Username)
def create_user(user: PrivateUser, session: Session = Depends(get_db)):

    existing_user = session.scalar(
        select(User).where(
            (User.username == user.username) | (User.email == user.email)
        )
    )

    if existing_user:
        if existing_user.email == user.email:
            raise HTTPException(
                status_code=HTTPStatus.CONFLICT,
                detail="Email already exists",
            )

    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, email=user.email, password=hashed_password)

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {"username": new_user.username}
