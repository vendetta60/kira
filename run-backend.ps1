# Layihə kökündən backendi 8001 portunda işə salır (sistem Python / PATH-dəki python).
# İstifadə: .\run-backend.ps1
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Push-Location $root
try {
    python -m pip install -q -r backend\requirements.txt
    python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001
} finally {
    Pop-Location
}
