from datetime import date

from pydantic import BaseModel, EmailStr


class PrivateUser(BaseModel):
    first_name: str
    last_name: str
    birth_date: date
    email: EmailStr
    password: str


class RequestLogin(BaseModel):
    email: EmailStr
    password: str


class Username(BaseModel):
    first_name: str


