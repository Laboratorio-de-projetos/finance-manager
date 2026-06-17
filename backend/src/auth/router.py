from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from http import HTTPStatus
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from src.auth.database import get_db
from src.auth.schemas import (
    PrivateUser,
    Name,
    RequestLogin,
    AddTransaction,
    PublicTransaction,
)
from src.auth.models import User, Transaction
from src.auth.security import (
    get_password_hash,
    verify_password,
    create_token,
    get_current_user,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.post('/create/', status_code=HTTPStatus.CREATED, response_model=Name)
def create_user(user: PrivateUser, session: Session = Depends(get_db)):

    existing_user = session.scalar(
        select(User).where(User.email == user.email)
    )

    if existing_user:
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail='Email already exists',
        )

    hashed_password = get_password_hash(user.password)

    new_user = User(
        first_name=user.first_name,
        last_name=user.last_name,
        birth_date=user.birth_date,
        email=user.email,
        password=hashed_password,
    )

    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {'first_name': new_user.first_name}


@app.post('/login/', status_code=HTTPStatus.OK)
def login_user(data: RequestLogin, session: Session = Depends(get_db)):

    existing_user = session.scalar(
        select(User).where(User.email == data.email)
    )

    if existing_user is None:
        raise HTTPException(
            status_code=HTTPStatus.NOT_FOUND,
            detail='Email not found',
        )

    if not verify_password(data.password, existing_user.password):
        raise HTTPException(
            status_code=HTTPStatus.UNAUTHORIZED,
            detail='Incorrect password',
        )

    access_token = create_token(
        data={
            'first_name': str(existing_user.first_name),
            'sub': str(existing_user.id),
        }
    )

    return {'access_token': access_token, 'token_type': 'bearer'}


@app.post(
    '/create_transaction/',
    status_code=HTTPStatus.OK,
    response_model=PublicTransaction,
)
def create_transaction(
    data: AddTransaction,
    session: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):

    new_transaction = Transaction(
        value=data.value,
        type=data.type,
        tag=data.tag,
        date=data.date,
        user_id=current_user.id,
    )

    session.add(new_transaction)
    session.commit()
    session.refresh(new_transaction)

    return {
        'value': new_transaction.value,
        'type': new_transaction.type,
        'tag': new_transaction.tag,
        'date': new_transaction.date,
    }
