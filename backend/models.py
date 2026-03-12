from sqlalchemy import Boolean, Column, Date, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    full_name = Column(String(150), nullable=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    role = Column(String(30), default="admin")

    tenants = relationship("Tenant", back_populates="created_by")


class Tenant(Base):
    __tablename__ = "Tenants"

    id = Column(Integer, primary_key=True, index=True)

    # Basic identity
    full_name = Column(String(200), nullable=False)
    owner_name = Column(String(200), nullable=True)
    rank = Column(String(100), nullable=True)

    # Contract info
    contract_number = Column(String(100), nullable=True)
    contract_date = Column(Date, nullable=True)
    contract_end_date = Column(Date, nullable=True)

    # Documents / flags (expanded to cover desktop fields roughly)
    has_guarantee = Column(Boolean, default=False)
    has_application_report = Column(Boolean, default=False)
    has_support_letter = Column(Boolean, default=False)
    has_flat_certificate = Column(Boolean, default=False)
    has_municipality_reference = Column(Boolean, default=False)
    has_real_estate_extract = Column(Boolean, default=False)
    has_real_estate_extract_spouse = Column(Boolean, default=False)
    has_marriage_certificate = Column(Boolean, default=False)
    has_id_copy = Column(Boolean, default=False)
    has_id_copy_spouse = Column(Boolean, default=False)
    has_18th_column_extract = Column(Boolean, default=False)

    # Municipality / protocol / order
    municipality_number = Column(String(100), nullable=True)
    municipality_date = Column(Date, nullable=True)
    mortgage_fund = Column(Boolean, default=False)
    protocol_number = Column(String(100), nullable=True)
    protocol_date = Column(Date, nullable=True)
    order_number = Column(String(100), nullable=True)
    order_date = Column(Date, nullable=True)

    # Family
    family_status = Column(String(50), nullable=True)  # Evli / Subay və s.
    children_count = Column(Integer, default=0)

    notes = Column(String(1000), nullable=True)

    created_by_id = Column(Integer, ForeignKey("Users.id"), nullable=True)
    created_by = relationship("User", back_populates="tenants")


class Document(Base):
    __tablename__ = "Documents"

    id = Column(Integer, primary_key=True, index=True)
    rutbe = Column(String(100), nullable=True)
    soyad_ad_ata = Column(String(200), nullable=False)
    unvan_sahibi = Column(String(200), nullable=True)
    harbi_rutbe = Column(String(100), nullable=True)
    odelik = Column(String(100), nullable=True)
    protokol_no = Column(String(50), nullable=True)
    protokol_tarixi = Column(Date, nullable=True)
    il = Column(String(10), nullable=True)
    ay = Column(String(15), nullable=True)
    calismayan_senedler = Column(String(100), nullable=True)
    report_senedlerin_ucot_no = Column(String(100), nullable=True)
    report_senedlerin_ucot_tarixi = Column(Date, nullable=True)
    report_senedlerin_tarixi = Column(Date, nullable=True)
    report_senedlerin_ucot_no2 = Column(String(100), nullable=True)
    kiraya_muqavilesi_tarixi = Column(Date, nullable=True)
    kiraya_muqavilesi_bitme_tarixi = Column(Date, nullable=True)
    daginmaz_emlak_arayisi = Column(String(200), nullable=True)
    daginmaz_emlak_arayisi_avadl = Column(String(200), nullable=True)
    nigah_haqqinda_sehadename = Column(String(200), nullable=True)
    menzil_attestati = Column(String(200), nullable=True)
    qrafeden_18ci_cixarig = Column(String(200), nullable=True)
    sexsiyyet_vezigesinin_surati = Column(String(200), nullable=True)
    sexsiyyet_vezigesinin_surati_avadl = Column(String(200), nullable=True)
    menzil_atestati = Column(String(200), nullable=True)
    belediyye_arayisi = Column(String(200), nullable=True)
    ipoteka_kredit_zemaneti = Column(String(200), nullable=True)
    protokol_nomresi = Column(String(50), nullable=True)
    protokol_tarixi_2 = Column(Date, nullable=True)
    kiraya_anirlarin_nomresi = Column(String(100), nullable=True)
    kiraya_anirlarin_tarixi = Column(Date, nullable=True)
    senedler_qebul_eden_tarixi = Column(Date, nullable=True)
    huquqi_raportlar = Column(Boolean, default=False)
    husayyet_mektublar = Column(Boolean, default=False)
    kiraya_muqavilesi = Column(Boolean, default=False)
    menzil_attestat = Column(Boolean, default=False)
    belediyye_arayislari = Column(Boolean, default=False)
    ipoteka_kredit = Column(Boolean, default=False)
    protokol = Column(Boolean, default=False)
    kiraya_aniri = Column(Boolean, default=False)
    senedleri_qebul_eden = Column(String(200), nullable=True)
    senedleri_qebul_tarixi = Column(Date, nullable=True)
    eli_vaziyyet = Column(String(50), nullable=True)
    qeyd = Column(String(1000), nullable=True)
    daginmaz_emlak_arayisi_check = Column(Boolean, default=False)
    daginmaz_emlak_arayisi_avadl_check = Column(Boolean, default=False)
    nigah_haqqinda_sehadename_check = Column(Boolean, default=False)
    qrafeden_18ci_cixarig_check = Column(Boolean, default=False)
    sexsiyyet_vezigesinin_surati_check = Column(Boolean, default=False)
    sexsiyyet_vezigesinin_surati_avadl_check = Column(Boolean, default=False)

    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Rank(Base):
    __tablename__ = "Ranks"

    id = Column(Integer, primary_key=True, index=True)
    rank = Column(String(100), nullable=False)
    is_deleted = Column(Boolean, default=False)
    # position sütunu mövcuddur, amma onu xüsusi istifadə etmirik


class Section(Base):
    __tablename__ = "Sections"

    id = Column(Integer, primary_key=True, index=True)
    section = Column(String(100), nullable=True)
    is_deleted = Column(Boolean, default=False)


class DocumentReceiver(Base):
    __tablename__ = "DocumentReceivers"

    id = Column(Integer, primary_key=True, index=True)
    rank_id = Column(Integer, nullable=True)
    full_name = Column(String(50), nullable=True)
    department = Column(String(50), nullable=True)
    is_deleted = Column(Boolean, default=False)
