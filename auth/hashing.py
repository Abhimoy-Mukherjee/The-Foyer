from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password : str) -> str:
    """Convert plain password -> hashed string for storing in DB"""
    return pwd_context.hash(password)

def verify_password(plain_password : str , hashed_password : str) -> bool:
    """Check if plain password matches the hashed password"""
    return pwd_context.verify(plain_password, hashed_password)
