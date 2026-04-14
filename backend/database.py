from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import build_database_url

SQLALCHEMY_DATABASE_URL = build_database_url()

engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
