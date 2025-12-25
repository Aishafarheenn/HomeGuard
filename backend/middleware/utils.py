import os 
from dotenv import load_dotenv
from jose import jwt

load_dotenv()

SECRET_KEY= os.getenv("SECRET_KEY")
ALGORITHM= os.getenv("ALGORITHM")

def create_access_token(data:dict):
    access_token= jwt.encode(data,SECRET_KEY,ALGORITHM)
    return access_token
