# Kiraye EQ — Ubuntu-da Nginx ilə deploy (internetsiz mühit üçün)

Bu sənəd **şəbəkədən paket yükləmədən** (əvvəlcədən `apt`, `pip`, `npm` asılılıqları hazırdır) serverdə yerləşdirmə üçün yazılıb. Hansı faylı **hara** yazacağınız və **brauzer → Nginx → Uvicorn** zəncirində URL-lərin necə uyğunlaşdığını addım-addım göstərir.

---

## 1. Layihədə rollar (qısa)

| Tərəf | Nə işləyir | Hansı port (default) |
|--------|------------|----------------------|
| **Nginx** | Statik frontend + API sorğularını backend-ə ötürür | **80** / **443** (SSL) |
| **Uvicorn** | FastAPI (`backend.main:app`) | **8001** (yalnız `127.0.0.1` tövsiyə olunur) |
| **Brauzer** | `VITE_API_BASE_URL` ilə API-yə müraciət edir | — |

**Vacib:** Layihədəki nümunə Nginx konfiqi brauzerdə `/api/v1/...` prefiksi ilə sorğu göndərir, Nginx bu prefiksi **kəsib** backend-ə kök yolları (`/auth/login` və s.) ötürür. Ona görə `backend/.env`-də **`ROOT_PATH` boş qalmalıdır** (sətri yazmayın və ya `ROOT_PATH=` boş saxlayın). Əks halda FastAPI özünü `/api/v1` altında gözləyər, Uvicorn isə artıq kəsilmiş yolu alar — uyğunsuzluq yaranar.

---

## 2. Serverdə qovluq strukturu (tövsiyə olunan)

Bütün nümunələrdə layihə kökü **`/opt/rently`** qəbul edilir. Öz yolunuzu seçsəniz, **eyni yolu** həm `systemd` unit-də, həm Nginx-də, həm də əllə əmrlərdə dəyişin.

```
/opt/rently/                    ← layihə kökü (PYTHONPATH bura işarə edir)
├── backend/
│   ├── .env                    ← SİZ YARADIRSINIZ (məxfilik)
│   ├── main.py
│   └── ...
├── frontEND/
│   ├── .env.production         ← build üçün (VITE_API_BASE_URL)
│   └── dist/                   ← npm run build-dən sonra yaranır
├── nginx.example.conf          ← nümunə (kopyalayıb /etc/nginx-ə)
└── rently-api.service.example  ← nümunə (kopyalayıb systemd-ə)
```

Statik faylların Nginx-ə köçürülməsi (nümunə):

```
/var/www/rently/html/           ← index.html və Vite çıxışı buraya
```

---

## 3. Faylları hara yazmaq lazımdır (cədvəl)

| Mənbə (layihədə) | Hədəf (Ubuntu serverdə) | Nə üçün |
|------------------|-------------------------|--------|
| `backend/.env.example` | **`/opt/rently/backend/.env`** | `cp` edib doldurun; **git-ə qoymayın** |
| `frontEND/.env.production.example` | **`/opt/rently/frontEND/.env.production`** | `VITE_API_BASE_URL` build zamanı gömülür |
| `rently-api.service.example` | **`/etc/systemd/system/rently-api.service`** | `sudo cp` + `sudo nano` ilə yolları yoxlayın |
| `nginx.example.conf` | **`/etc/nginx/sites-available/rently`** | `sudo cp` + `server_name` və `root` düzəldin |
| — | **`/etc/nginx/sites-enabled/rently`** | `sites-available`-ə simvolik keçid: `sudo ln -sf ...` |
| `frontEND/dist/*` (build sonrası) | **`/var/www/rently/html/`** | `sudo cp -a dist/. /var/www/rently/html/` |

---

## 4. `backend/.env` — hansı sətirlər deploy üçün vacibdir

Fayl yolu: **`/opt/rently/backend/.env`** (yalnız bu faylı oxuyur; kökdəki `.env` istifadə olunmur).

| Dəyişən | Məqsəd | Nginx `/api/v1` sxemi ilə |
|---------|--------|---------------------------|
| `DATABASE_URL` və ya `DB_*` | SQL Server qoşulması | Nginx-dən asılı deyil |
| `JWT_SECRET` (və ya `SECRET_KEY`) | Production-da **mütləq** güclü dəyər | — |
| `ENV=production` | Təhlükəsizlik / JWT yoxlaması | — |
| `CORS_ALLOW_ORIGINS` | Eyni domen üzərindən SPA işləyirsə: `https://sizin-domain.com` (vergüllə bir neçə) və ya ehtiyac üzrə `*` | `*` olanda `allow_credentials` söndürülür (kodda belədir) |
| `ROOT_PATH` | **Boş saxlayın** bu Nginx nümunəsi ilə | Prefiksi Nginx kəsir |
| `UVICORN_HOST` | `127.0.0.1` — yalnız localhostdan qəbul (tövsiyə) | Nginx eyni maşındadır |
| `UVICORN_PORT` | `8001` — `nginx.example.conf` içindəki `upstream` ilə **eyni** olmalıdır | |
| `UVICORN_WORKERS` | Məs. `1` və ya CPU-ya uyğun | — |
| `BOOTSTRAP_*` | İlk işə düşmədə admin yaratmaq (istəyə görə) | — |

**İcazələr:** `systemd` unit nümunəsində `User=www-data` var. `www-data` istifadəçisi **`/opt/rently`** və **`/opt/rently/backend/.env`** faylını oxuya bilməlidir (məsələn `chmod 640 .env` və qrup `www-data`, və ya faylın sahibliyini uyğunlaşdırın).

---

## 5. `frontEND/.env.production` — build üçün

Fayl yolu: **`/opt/rently/frontEND/.env.production`**

Nginx nümunəsi **`location /api/v1/`** istifadə etdiyi üçün build-də belə olmalıdır:

```env
VITE_API_BASE_URL=/api/v1
```

Bu, brauzerin sorğularını **eyni host** üzərindən göndərir (məs. `https://sizin-domain.com/api/v1/auth/login`). Tam URL variantı (ayrı API domeni) üçün `frontEND/.env.production.example`-a baxın — onda Nginx-də ayrıca `server` bloku lazımdır.

**Qeyd:** `VITE_*` dəyərləri yalnız **`npm run build` zamanı** bundle-a düşür; `.env.production` dəyişəndən sonra **yenidən build** edin.

---

## 6. FastAPI marşrutları (Uvicorn-un gördüyü yollar)

Backend kodu: `backend/main.py`. Aşağıdakı cədvəldə **Uvicorn path** — Nginx prefiksi kəsiləndən sonra backend-ə çatan yoldur.

### 6.1. İctimai / monitorinq

| Metod | Uvicorn path | Qeyd |
|--------|----------------|------|
| GET | `/health` | Yoxlama; auth yoxdur |

### 6.2. Auth

| Metod | Uvicorn path | Auth / body |
|--------|----------------|-------------|
| POST | `/auth/login` | Body: `application/x-www-form-urlencoded` — sahələr `username`, `password` (OAuth2 password flow formu) |
| POST | `/auth/refresh` | JSON: `refresh_token` (Pydantic model: `RefreshTokenRequest`) |
| GET | `/auth/me` | Header: `Authorization: Bearer <access_token>` |

### 6.3. İstifadəçilər (admin)

| Metod | Uvicorn path | Auth |
|--------|----------------|------|
| GET | `/users` | Admin |
| POST | `/users` | Admin |
| PUT | `/users/{user_id}` | Admin |
| DELETE | `/users/{user_id}` | Admin |

### 6.4. Tenant-lar

| Metod | Uvicorn path | Auth |
|--------|----------------|------|
| GET | `/tenants` | Giriş etmiş istifadəçi |
| POST | `/tenants` | Giriş etmiş istifadəçi |
| GET | `/tenants/{tenant_id}` | Giriş etmiş istifadəçi |
| PUT | `/tenants/{tenant_id}` | Giriş etmiş istifadəçi |
| DELETE | `/tenants/{tenant_id}` | Giriş etmiş istifadəçi |

### 6.5. Sənədlər

| Metod | Uvicorn path | Auth |
|--------|----------------|------|
| GET | `/documents` | Giriş etmiş istifadəçi |
| POST | `/documents` | Giriş etmiş istifadəçi |
| PUT | `/documents/{document_id}` | Giriş etmiş istifadəçi |
| DELETE | `/documents/{document_id}` | Giriş etmiş istifadəçi |

### 6.6. Lookup-lar

| Metod | Uvicorn path | Auth |
|--------|----------------|------|
| GET | `/lookups/ranks` | Giriş etmiş istifadəçi |
| GET | `/lookups/sections` | Giriş etmiş istifadəçi |
| GET | `/lookups/receivers` | Giriş etmiş istifadəçi |

### 6.7. FastAPI avtomatik (Swagger)

| Metod | Uvicorn path | Qeyd |
|--------|----------------|------|
| GET | `/docs` | Swagger UI |
| GET | `/redoc` | ReDoc |
| GET | `/openapi.json` | OpenAPI sxemi |

**Brauzerdə Nginx ilə** (prefiks saxlanmaqla) məsələn: `https://sizin-domain.com/api/v1/health` → Nginx → upstream-ə **`/health`** kimi gedir.

Frontend kodu bu endpoint-ləri çağırır: `frontEND/src/lib/api.ts`, `frontEND/src/lib/documentsApi.ts` — hamısı `VITE_API_BASE_URL` + yuxarıdakı path-lərin birləşməsidir.

---

## 7. Nginx: `proxy_pass` və prefiks məntiqi

Layihə nümunəsi: **`nginx.example.conf`**

- `location /api/v1/` + `proxy_pass http://kira_api/;` (**proxy_pass URL-də sondakı `/` vacibdir**):  
  - Brauzer: `/api/v1/auth/login`  
  - Upstream-ə gedən URI: **`/auth/login`**

`upstream kira_api` içindəki **`127.0.0.1:8001`** ünvanı `backend/.env` faylındakı **`UVICORN_PORT`** ilə eyni olmalıdır.

Eyni `location /api/v1/` bloku Swagger üçün də kifayətdir — əlavə `location` lazım deyil: məsələn brauzerdə `https://sizin-domain.com/api/v1/docs` sorğusu upstream-də **`/docs`** olur.

---

## 8. systemd: API servisi

1. **`/opt/rently/rently-api.service.example`** faylını kopyalayın:  
   `sudo cp /opt/rently/rently-api.service.example /etc/systemd/system/rently-api.service`
2. **`/etc/systemd/system/rently-api.service`** içində yoxlayın:
   - `WorkingDirectory=/opt/rently`
   - `Environment=PYTHONPATH=/opt/rently`
   - `EnvironmentFile=-/opt/rently/backend/.env`
   - `User` / `Group` — `.env` oxuma icazəsi uyğun olsun
3. Əmrlər:

```bash
sudo systemctl daemon-reload
sudo systemctl enable rently-api
sudo systemctl start rently-api
sudo systemctl status rently-api
```

4. Yoxlama (birbaşa backend, internetsiz):

```bash
curl -sS http://127.0.0.1:8001/health
```

Xəta halında: `sudo journalctl -u rently-api -n 100 --no-pager`

---

## 9. Nginx quraşdırması (saytı aktiv etmək)

1. Nümunəni kopyalayın:  
   `sudo cp /opt/rently/nginx.example.conf /etc/nginx/sites-available/rently`
2. Redaktə edin: **`server_name`**, lazımsa **`root`**
3. Aktiv keçid:  
   `sudo ln -sf /etc/nginx/sites-available/rently /etc/nginx/sites-enabled/rently`
4. Default saytı söndürmək (adətən):  
   `sudo rm -f /etc/nginx/sites-enabled/default`
5. Sınaq və yenidən yükləmə:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

---

## 10. Frontend build və statik köçürmə (internetsiz)

Layihə qovluğunda `node_modules` artıq hazırdırsa:

```bash
cd /opt/rently/frontEND
cp .env.production.example .env.production
nano .env.production
# VITE_API_BASE_URL=/api/v1
npm run build
sudo mkdir -p /var/www/rently/html
sudo cp -a dist/. /var/www/rently/html/
```

Nginx-də `root /var/www/rently/html;` və SPA üçün `try_files` nümunə faylda verilib.

---

## 11. Yoxlama ardıcıllığı (tam sınaq)

1. `curl http://127.0.0.1:8001/health` → `{"status":"ok",...}` (production-da `env` ola bilər və ya olmaya bilər — koda görə)
2. Brauzerdən (və ya serverdən): `http://SIZIN_IP/api/v1/health` — Nginx işləyirsə eyni cavab gözlənilir
3. Saytın özü: `http://SIZIN_IP/` — SPA yüklənməlidir
4. Giriş: UI-dən login — şəbəkə tab-da sorğu **`/api/v1/auth/login`** olmalıdır

---

## 12. SSL (internetsiz mühitdə)

İnternet olmadan **Let’s Encrypt / certbot** işlətmək olmur. Variantlar:

- Şəbəkədə **daxili CA** və ya əl ilə **self-signed** sertifikat; Nginx-də `ssl_certificate` / `ssl_certificate_key` göstərmək
- və ya SSL-i **əvvəlcədən hazırlanmış** fayllarla qurmaq

Bu addımlar təşkilatınızın təhlükəsizlik siyasətindən asılıdır — layihə kodunda xüsusi SSL tələbi yoxdur.

---

## 13. Yeniləmə (kod dəyişəndə)

1. Kodu yeniləyin (`/opt/rently`)
2. Backend asılılıqları artıq quraşdırılıbsa, yalnız `requirements.txt` dəyişibsə: uyğun `pip install -r backend/requirements.txt` (sistem siyasətinizə uyğun: venv və ya sistem Python)
3. `sudo systemctl restart rently-api`
4. Frontend dəyişibsə: `npm run build` və yenidən `dist`-i `/var/www/rently/html/` üzərinə kopyalayın
5. `sudo nginx -t && sudo systemctl reload nginx` (konfiq dəyişibsə)

---

## 14. Qısa yekun

- **Brauzer API:** `/api/v1/...` (`VITE_API_BASE_URL=/api/v1`)
- **Uvicorn:** `127.0.0.1:8001`-də kök yollar (`/health`, `/auth/login`, ...)
- **`ROOT_PATH`:** bu Nginx sxemi ilə **boş**
- **Kritik fayllar:** `/opt/rently/backend/.env`, `/opt/rently/frontEND/.env.production`, `/etc/systemd/system/rently-api.service`, `/etc/nginx/sites-available/rently`, `/var/www/rently/html/`

Layihə kökündə həmçinin: `docker-compose.yml` — konteyner variantı üçün; bu sənəd əsasən **Nginx + systemd + Uvicorn** üçlüyünə yönəlib.
