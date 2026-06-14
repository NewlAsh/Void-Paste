#schemas.py

from pydantic import Field, BaseModel, EmailStr, ConfigDict
import datetime


##User Section

#base class for users table
class UserBase(BaseModel):
    username: str = Field(min_length=1)
    email: EmailStr = Field(max_length=150)

#creating a new user
class UserCreate(UserBase):
    password: str = Field(min_length=8)
    private_account: bool

#public showcase
class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str

#private showcase
class UserPrivate(UserPublic):
    email: EmailStr


#updating user info
class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None




##Clip Section

#creating basic post class
class ClipBase(BaseModel):
    title: str | None = Field(default=None, min_length=5)
    content: str | None = Field(default=None, min_length=10)

#creating a post
class ClipCreate(BaseModel):
    title: str = Field(min_length=10, max_length=100)
    content: str = Field(min_length=10)

#update the post
class ClipUpdate(ClipBase):
    pass

#what you get from a post
class ClipResponse(ClipBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    username: str
    user_id: int
    date_posted: datetime.datetime
    title: str       # Overrides ClipBase to guarantee it's not None
    content: str