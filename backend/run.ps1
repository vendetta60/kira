# Backend MUTLAQ layihə kökündən (Kiraye EQ) işə salınmalıdır.
# Layihə kökündən: .\backend\run.ps1
# və ya backend qovluğundan: .\run.ps1
# Sistem Python (venv yox).
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
try {
    python -m pip install -q -r backend\requirements.txt
    python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001
} finally {
    Pop-Location
}
