"""
Bütün əsas parametrlər backend/.env faylından oxunur.
Kökdəki .env artıq istifadə olunmur — yalnız backend/.env
"""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

_BACKEND_DIR = Path(__file__).resolve().parent
load_dotenv(_BACKEND_DIR / ".env", override=False)


def _split_origins(s: str) -> list[str]:
    return [x.strip() for x in s.split(",") if x.strip()]


APP_NAME = os.getenv("APP_NAME", "Kirayə müqavilələri API").strip()

# dev | prod | production
ENV = (os.getenv("ENV") or os.getenv("APP_ENV", "dev")).strip().lower()
IS_PRODUCTION = ENV in ("prod", "production")

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

# DATABASE_URL boşdursa köhnə DB_* ilə yığmaq (opsional)
DB_SERVER = os.getenv("DB_SERVER", r"555-PTSAKTB-Z\SQLEXPRESS").strip()
DB_NAME = os.getenv("DB_NAME", "Rently").strip()
DB_USER = os.getenv("DB_USER", "sa").strip()
DB_PASSWORD = os.getenv("DB_PASSWORD", "123").strip()
DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server").strip()
DB_TRUST_SERVER_CERT = os.getenv("DB_TRUST_SERVER_CERT", "yes").lower() in ("1", "true", "yes")

JWT_SECRET = (os.getenv("JWT_SECRET") or os.getenv("SECRET_KEY", "")).strip()
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256").strip()
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", "10080"))

# * — bütün origin-lər (allow_credentials=False olur)
CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "*").strip()

ROOT_PATH = os.getenv("ROOT_PATH", "").strip().rstrip("/")

# İlk işə düşəndə: DB boşdursa istifadəçi yaradılması
BOOTSTRAP_SUPERADMIN_ENABLED = os.getenv(
    "BOOTSTRAP_SUPERADMIN_ENABLED", "false"
).lower() in ("1", "true", "yes")
BOOTSTRAP_SUPERADMIN_USERNAME = os.getenv("BOOTSTRAP_SUPERADMIN_USERNAME", "").strip()
BOOTSTRAP_SUPERADMIN_PASSWORD = os.getenv("BOOTSTRAP_SUPERADMIN_PASSWORD", "").strip()
BOOTSTRAP_SUPERADMIN_FULL_NAME = os.getenv(
    "BOOTSTRAP_SUPERADMIN_FULL_NAME", "Super Admin"
).strip()

BOOTSTRAP_ADMIN_USERNAME = os.getenv("BOOTSTRAP_ADMIN_USERNAME", "").strip()
BOOTSTRAP_ADMIN_PASSWORD = os.getenv("BOOTSTRAP_ADMIN_PASSWORD", "").strip()
BOOTSTRAP_ADMIN_FULL_NAME = os.getenv(
    "BOOTSTRAP_ADMIN_FULL_NAME", "System Admin"
).strip()


def get_jwt_secret() -> str:
    if IS_PRODUCTION and not JWT_SECRET:
        raise RuntimeError(
            "JWT_SECRET (və ya SECRET_KEY) production-da mütləq backend/.env-də olmalıdır."
        )
    if not JWT_SECRET:
        return "change-me-dev-only"
    return JWT_SECRET


def build_database_url() -> str:
    if DATABASE_URL:
        return DATABASE_URL
    import urllib.parse

    params = urllib.parse.quote_plus(
        f"DRIVER={{{DB_DRIVER}}};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={DB_NAME};"
        f"UID={DB_USER};"
        f"PWD={DB_PASSWORD};"
        f"TrustServerCertificate={'yes' if DB_TRUST_SERVER_CERT else 'no'};"
    )
    return f"mssql+pyodbc:///?odbc_connect={params}"


def cors_middleware_settings() -> tuple[list[str], bool]:
    """(allow_origins, allow_credentials)"""
    if CORS_ALLOW_ORIGINS == "*":
        return ["*"], False
    origins = _split_origins(CORS_ALLOW_ORIGINS)
    if not origins:
        return ["*"], False
    return origins, True
