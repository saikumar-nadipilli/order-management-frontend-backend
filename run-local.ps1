# Run backend + frontend locally (no Docker required)
$root = $PSScriptRoot

Write-Host "Starting Inventory & Order Management System (local mode)" -ForegroundColor Cyan
Write-Host "Database: SQLite (inventory_dev.db in backend folder)" -ForegroundColor Gray
Write-Host ""

# Backend
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:root\backend
    $env:DATABASE_URL = "sqlite:///./inventory_dev.db"
    $env:CORS_ORIGINS = "http://localhost:3000,http://localhost:5173"
    & py -3.11 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
}

Start-Sleep -Seconds 3

# Frontend
Set-Location "$root\frontend"
$env:VITE_API_URL = "http://localhost:8000"
Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "dev"

Write-Host ""
Write-Host "  Frontend:  http://localhost:3000" -ForegroundColor Green
Write-Host "  Backend:   http://localhost:8000" -ForegroundColor Green
Write-Host "  API docs:  http://localhost:8000/docs" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop. Backend runs in a background job." -ForegroundColor Yellow

Wait-Job $backendJob
