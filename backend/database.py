from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import urllib


DB_SERVER = r"555-PTSAKTB-Z\SQLEXPRESS"
DB_NAME = "Rently"
DB_USER = "sa"
DB_PASSWORD = "123"

# You may need to adjust the driver name to what is installed on your system
params = urllib.parse.quote_plus(
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={DB_SERVER};"
    f"DATABASE={DB_NAME};"
    f"UID={DB_USER};"
    f"PWD={DB_PASSWORD};"
    "TrustServerCertificate=yes;"
)

SQLALCHEMY_DATABASE_URL = f"mssql+pyodbc:///?odbc_connect={params}"

engine = create_engine(SQLALCHEMY_DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
