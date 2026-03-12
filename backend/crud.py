from sqlalchemy.orm import Session

from . import models, schemas


def create_user(db: Session, data: schemas.UserCreate) -> models.User:
    from .auth import get_password_hash

    hashed = get_password_hash(data.password)
    user = models.User(username=data.username, full_name=data.full_name, password_hash=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_users(db: Session):
    return db.query(models.User).order_by(models.User.id).all()


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def update_user(db: Session, user_id: int, data: schemas.UserUpdate):
    from .auth import get_password_hash

    user = get_user(db, user_id)
    if not user:
        return None

    update_data = data.dict(exclude_unset=True)
    password = update_data.pop("password", None)
    if password:
        user.password_hash = get_password_hash(password)

    for key, value in update_data.items():
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    user = get_user(db, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True


def get_tenants(db: Session, skip: int = 0, limit: int = 100):
    # MSSQL OFFSET/LIMIT tələb edəndə mütləq ORDER BY olmalıdır,
    # ona görə id üzrə sıralayırıq.
    query = db.query(models.Tenant).order_by(models.Tenant.id)
    if skip:
        query = query.offset(skip)
    if limit:
        query = query.limit(limit)
    return query.all()


def get_tenant(db: Session, tenant_id: int):
    return db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()


def create_tenant(db: Session, data: schemas.TenantCreate, user: models.User | None = None):
    tenant = models.Tenant(**data.dict())
    if user:
        tenant.created_by = user
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant


def update_tenant(db: Session, tenant_id: int, data: schemas.TenantUpdate):
    tenant = get_tenant(db, tenant_id)
    if not tenant:
        return None
    for key, value in data.dict(exclude_unset=True).items():
        setattr(tenant, key, value)
    db.commit()
    db.refresh(tenant)
    return tenant


def delete_tenant(db: Session, tenant_id: int) -> bool:
    tenant = get_tenant(db, tenant_id)
    if not tenant:
        return False
    db.delete(tenant)
    db.commit()
    return True


def get_documents(db: Session):
    return db.query(models.Document).order_by(models.Document.id.desc()).all()


def get_document(db: Session, document_id: int):
    return db.query(models.Document).filter(models.Document.id == document_id).first()


def create_document(db: Session, data: schemas.DocumentCreate) -> models.Document:
    document = models.Document(**data.dict(exclude_unset=True))
    db.add(document)
    db.commit()
    db.refresh(document)
    return document


def update_document(db: Session, document_id: int, data: schemas.DocumentUpdate):
    document = get_document(db, document_id)
    if not document:
        return None
    for key, value in data.dict(exclude_unset=True).items():
        setattr(document, key, value)
    db.commit()
    db.refresh(document)
    return document


def delete_document(db: Session, document_id: int) -> bool:
    document = get_document(db, document_id)
    if not document:
        return False
    db.delete(document)
    db.commit()
    return True
