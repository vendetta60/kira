# Layihə kökündən: API (8001) + Vite birlikdə.
# İstifadə: .\dev.ps1
# Vite proxy xətaları (ECONNREFUSED) adətən API işləməyəndə çıxır — bu skript əvvəl uvicorn-u qaldırır.
$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

$api = Start-Process -FilePath "python" `
    -ArgumentList @(
        "-m", "uvicorn", "backend.main:app",
        "--reload", "--host", "127.0.0.1", "--port", "8001"
    ) `
    -WorkingDirectory $root `
    -PassThru `
    -WindowStyle Normal

try {
    $ready = $false
    for ($i = 0; $i -lt 90; $i++) {
        $tnc = Test-NetConnection -ComputerName 127.0.0.1 -Port 8001 `
            -WarningAction SilentlyContinue `
            -ErrorAction SilentlyContinue
        if ($tnc.TcpTestSucceeded) {
            $ready = $true
            break
        }
        Start-Sleep -Milliseconds 300
    }
    if (-not $ready) {
        Write-Warning "127.0.0.1:8001 hazir deyil. Python/uvicorn yoxlayin: python -m uvicorn backend.main:app --host 127.0.0.1 --port 8001"
    }

    Push-Location "$root\frontEND"
    npm run dev
}
finally {
    if ($api -and -not $api.HasExited) {
        Stop-Process -Id $api.Id -Force -ErrorAction SilentlyContinue
    }
}
