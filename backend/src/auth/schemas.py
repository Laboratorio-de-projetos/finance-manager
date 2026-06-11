from pydantic import BaseModel, EmailStr


class PrivateUser(BaseModel):
    username: str
    age: int
    email: EmailStr
    password: str


class Username(BaseModel):
    username: str
