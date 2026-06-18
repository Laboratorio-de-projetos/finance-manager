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


class Name(BaseModel):
    first_name: str


class AddTransaction(BaseModel):
    value: int
    type: str
    tag: str
    date: date


class PublicTransaction(BaseModel):
    value: int
    type: str
    tag: str
    date: date


class DateRange(BaseModel):
    first_date: date
    last_date: date