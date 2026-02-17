"""Password hashing and verification using hashlib (SHA-256 with per-password salt)."""
import hashlib
import os

# Number of iterations to slow down brute-force (optional but recommended)
ITERATIONS = 100_000


def _hash_with_salt(salt: bytes, password: str) -> str:
    """Compute SHA-256 hash of salt + password with iterations."""
    key = (salt + password.encode("utf-8"))
    for _ in range(ITERATIONS):
        key = hashlib.sha256(key).digest()
    return key.hex()


def hash_password(plain_password: str) -> str:
    """Hash a plain password with a random salt. Never store plain passwords."""
    salt = os.urandom(32)
    hash_hex = _hash_with_salt(salt, plain_password)
    return f"{salt.hex()}:{hash_hex}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a stored hash (format salt_hex:hash_hex)."""
    if not hashed_password or ":" not in hashed_password:
        return False
    try:
        salt_hex, stored_hash = hashed_password.split(":", 1)
        salt = bytes.fromhex(salt_hex)
        computed = _hash_with_salt(salt, plain_password)
        return computed == stored_hash
    except (ValueError, TypeError):
        return False
