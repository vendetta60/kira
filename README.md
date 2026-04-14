# Kiraye EQ

## Backend (port 8001)

**Vacib:** Backend **həmişə layihə kökündən** (Kiraye EQ qovluğundan) işə salınmalıdır.

- Layihə kökündə: `.\run-backend.ps1` (Windows, inkişaf: `uvicorn --reload`)
- və ya: `.\backend\run.ps1`
- Konfiqurasiya: **`backend/.env`** (`cp backend/.env.example backend/.env`)

**Ubuntu / production (Uvicorn):** paketlər **sistem Python** ilə; **`backend/.env`** (`UVICORN_*`) + **`rently-api.service.example`** — servis birbaşa `python3 -m uvicorn backend.main:app` işlədir (ayrıca runner skripti yoxdur).

Əl ilə yoxlama:

```bash
cd /opt/rently
export PYTHONPATH=/opt/rently
set -a && . backend/.env && set +a
python3 -m uvicorn backend.main:app --host "${UVICORN_HOST:-0.0.0.0}" --port "${UVICORN_PORT:-8001}" --workers "${UVICORN_WORKERS:-1}"
```

Ətraflı: **[UBUNTU-NGINX.md](UBUNTU-NGINX.md)** · Nginx nümunəsi: **`nginx.example.conf`**

Əl ilə inkişaf (reload, Windows):

```powershell
cd "C:\Users\...\Kiraye EQ"
python -m pip install -r backend\requirements.txt
python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001
```

API: http://localhost:8001 | Docs: http://localhost:8001/docs | Health: http://localhost:8001/health

## Frontend

```bash
cd frontEND
npm install
npm run dev
```

Tətbiq: http://localhost:5173

---

## Docker

```bash
cp backend/.env.example backend/.env
docker compose up -d --build
```

Konteynerdə **`python -m uvicorn backend.main:app`** işləyir; `UVICORN_*` environment ilə.

---

## Fayllar

| Fayl | Məna |
|------|------|
| `backend/.env` | Bütün backend tənzimləməsi (git-ə düşmür) |
| `backend/.env.example` | Nümunə |
| `rently-api.service.example` | systemd (Uvicorn) |
| `nginx.example.conf` | Nginx reverse proxy + statik frontend |
| `UBUNTU-NGINX.md` | Server quraşdırma addımları |

Statik frontend: `cd frontEND && npm run build` → `frontEND/dist` məzmununu veb server kökünə kopyalayın (`VITE_API_BASE_URL` üçün `frontEND/.env.production`).
