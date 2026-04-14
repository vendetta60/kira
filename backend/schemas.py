from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None


class User(UserBase):
    id: int
    is_active: bool
    role: str

    class Config:
        orm_mode = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str | None = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class Rank(BaseModel):
    id: int
    rank: str

    class Config:
        orm_mode = True


class Section(BaseModel):
    id: int
    section: Optional[str] = None

    class Config:
        orm_mode = True


class DocumentReceiver(BaseModel):
    id: int
    full_name: Optional[str] = None
    department: Optional[str] = None

    class Config:
        orm_mode = True


class TenantBase(BaseModel):
    full_name: str
    owner_name: Optional[str] = None
    rank: Optional[str] = None
    contract_number: Optional[str] = None
    contract_date: Optional[date] = None
    contract_end_date: Optional[date] = None

    has_guarantee: bool = False
    has_application_report: bool = False
    has_support_letter: bool = False
    has_flat_certificate: bool = False
    has_municipality_reference: bool = False
    has_real_estate_extract: bool = False
    has_real_estate_extract_spouse: bool = False
    has_marriage_certificate: bool = False
    has_id_copy: bool = False
    has_id_copy_spouse: bool = False
    has_18th_column_extract: bool = False

    municipality_number: Optional[str] = None
    municipality_date: Optional[date] = None
    mortgage_fund: bool = False
    protocol_number: Optional[str] = None
    protocol_date: Optional[date] = None
    order_number: Optional[str] = None
    order_date: Optional[date] = None

    family_status: Optional[str] = None
    children_count: int = 0

    notes: Optional[str] = None


class TenantCreate(TenantBase):
    pass


class TenantUpdate(TenantBase):
    pass


class Tenant(TenantBase):
    id: int

    class Config:
        orm_mode = True


class DocumentBase(BaseModel):
    rutbe: Optional[str] = None
    soyad_ad_ata: str
    unvan_sahibi: Optional[str] = None
    harbi_rutbe: Optional[str] = None
    odelik: Optional[str] = None
    protokol_no: Optional[str] = None
    protokol_tarixi: Optional[date] = None
    il: Optional[str] = None
    ay: Optional[str] = None
    calismayan_senedler: Optional[str] = None
    report_senedlerin_ucot_no: Optional[str] = None
    report_senedlerin_ucot_tarixi: Optional[date] = None
    report_senedlerin_tarixi: Optional[date] = None
    report_senedlerin_ucot_no2: Optional[str] = None
    kiraya_muqavilesi_tarixi: Optional[date] = None
    kiraya_muqavilesi_bitme_tarixi: Optional[date] = None
    daginmaz_emlak_arayisi: Optional[str] = None
    daginmaz_emlak_arayisi_avadl: Optional[str] = None
    nigah_haqqinda_sehadename: Optional[str] = None
    menzil_attestati: Optional[str] = None
    qrafeden_18ci_cixarig: Optional[str] = None
    sexsiyyet_vezigesinin_surati: Optional[str] = None
    sexsiyyet_vezigesinin_surati_avadl: Optional[str] = None
    menzil_atestati: Optional[str] = None
    belediyye_arayisi: Optional[str] = None
    ipoteka_kredit_zemaneti: Optional[str] = None
    protokol_nomresi: Optional[str] = None
    protokol_tarixi_2: Optional[date] = None
    kiraya_anirlarin_nomresi: Optional[str] = None
    kiraya_anirlarin_tarixi: Optional[date] = None
    senedler_qebul_eden_tarixi: Optional[date] = None
    huquqi_raportlar: bool = False
    husayyet_mektublar: bool = False
    kiraya_muqavilesi: bool = False
    menzil_attestat: bool = False
    belediyye_arayislari: bool = False
    ipoteka_kredit: bool = False
    protokol: bool = False
    kiraya_aniri: bool = False
    senedleri_qebul_eden: Optional[str] = None
    senedleri_qebul_tarixi: Optional[date] = None
    eli_vaziyyet: Optional[str] = None
    qeyd: Optional[str] = None
    daginmaz_emlak_arayisi_check: bool = False
    daginmaz_emlak_arayisi_avadl_check: bool = False
    nigah_haqqinda_sehadename_check: bool = False
    qrafeden_18ci_cixarig_check: bool = False
    sexsiyyet_vezigesinin_surati_check: bool = False
    sexsiyyet_vezigesinin_surati_avadl_check: bool = False


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(DocumentBase):
    pass


class Document(DocumentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True
