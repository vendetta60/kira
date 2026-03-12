from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from . import auth, crud, models, schemas
from .auth import create_access_token, get_current_active_user, require_admin
from .database import Base, engine, get_db


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Rently API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/auth/login", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="İstifadəçi adı və ya şifrə yalnışdır",
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=schemas.User)
def read_me(current_user: models.User = Depends(get_current_active_user)):
    return current_user


@app.post("/auth/seed-admin", response_model=schemas.User)
def seed_admin(db: Session = Depends(get_db)):
    """
    İlk dəfə üçün sadə admin istifadəçi yaradır:
    username=admin, password=admin123
    """
    existing = crud.get_user_by_username(db, "admin")
    if existing:
        return existing
    data = schemas.UserCreate(username="admin", full_name="Admin", password="admin123")
    return crud.create_user(db, data)


@app.get("/users", response_model=list[schemas.User])
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    return crud.get_users(db)


@app.post("/users", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(
    data: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    existing = crud.get_user_by_username(db, data.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu istifadəçi adı artıq mövcuddur",
        )
    return crud.create_user(db, data)


@app.put("/users/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    user = crud.update_user(db, user_id, data)
    if not user:
        raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")
    return user


@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin),
):
    ok = crud.delete_user(db, user_id)
    if not ok:
        raise HTTPException(status_code=404, detail="İstifadəçi tapılmadı")
    return None


@app.get("/tenants", response_model=list[schemas.Tenant])
def list_tenants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_user)):
    return crud.get_tenants(db, skip=skip, limit=limit)


@app.post("/tenants", response_model=schemas.Tenant)
def create_tenant(
    data: schemas.TenantCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return crud.create_tenant(db, data, user=current_user)


@app.get("/tenants/{tenant_id}", response_model=schemas.Tenant)
def get_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    tenant = crud.get_tenant(db, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@app.put("/tenants/{tenant_id}", response_model=schemas.Tenant)
def update_tenant(
    tenant_id: int,
    data: schemas.TenantUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    tenant = crud.update_tenant(db, tenant_id, data)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@app.delete("/tenants/{tenant_id}")
def delete_tenant(
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    ok = crud.delete_tenant(db, tenant_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"success": True}


@app.get("/documents", response_model=list[schemas.Document])
def list_documents(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return crud.get_documents(db)


@app.post("/documents", response_model=schemas.Document, status_code=status.HTTP_201_CREATED)
def create_document(
    data: schemas.DocumentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return crud.create_document(db, data)


@app.put("/documents/{document_id}", response_model=schemas.Document)
def update_document(
    document_id: int,
    data: schemas.DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    document = crud.update_document(db, document_id, data)
    if not document:
        raise HTTPException(status_code=404, detail="Sənəd tapılmadı")
    return document


@app.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    ok = crud.delete_document(db, document_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Sənəd tapılmadı")
    return {"success": True}


@app.get("/lookups/ranks", response_model=list[schemas.Rank])
def list_ranks(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return (
        db.query(models.Rank)
        .filter(models.Rank.is_deleted == False)  # noqa: E712
        .order_by(models.Rank.id)
        .all()
    )


@app.get("/lookups/sections", response_model=list[schemas.Section])
def list_sections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return (
        db.query(models.Section)
        .filter(models.Section.is_deleted == False)  # noqa: E712
        .order_by(models.Section.id)
        .all()
    )


@app.get("/lookups/receivers", response_model=list[schemas.DocumentReceiver])
def list_receivers(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    return (
        db.query(models.DocumentReceiver)
        .filter(models.DocumentReceiver.is_deleted == False)  # noqa: E712
        .order_by(models.DocumentReceiver.full_name)
        .all()
    )
