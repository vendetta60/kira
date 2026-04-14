"""
DB tam boşdursa (heç bir User yoxdursa) bootstrap istifadəçiləri yaradır.
Konfiqurasiya: backend/.env
"""
from __future__ import annotations

from sqlalchemy import func

from . import config, crud, models, schemas
from .database import SessionLocal


def run_bootstrap() -> None:
    db = SessionLocal()
    try:
        n = db.query(func.count(models.User.id)).scalar()
        if n and n > 0:
            return

        super_pw = config.BOOTSTRAP_SUPERADMIN_PASSWORD or config.BOOTSTRAP_ADMIN_PASSWORD
        if config.BOOTSTRAP_SUPERADMIN_ENABLED and config.BOOTSTRAP_SUPERADMIN_USERNAME and super_pw:
            crud.create_user(
                db,
                schemas.UserCreate(
                    username=config.BOOTSTRAP_SUPERADMIN_USERNAME,
                    full_name=config.BOOTSTRAP_SUPERADMIN_FULL_NAME or None,
                    password=super_pw,
                ),
                role="superadmin",
            )

        admin_pw = config.BOOTSTRAP_ADMIN_PASSWORD or super_pw
        if config.BOOTSTRAP_ADMIN_USERNAME and admin_pw:
            if not crud.get_user_by_username(db, config.BOOTSTRAP_ADMIN_USERNAME):
                crud.create_user(
                    db,
                    schemas.UserCreate(
                        username=config.BOOTSTRAP_ADMIN_USERNAME,
                        full_name=config.BOOTSTRAP_ADMIN_FULL_NAME or None,
                        password=admin_pw,
                    ),
                    role="admin",
                )
    finally:
        db.close()
