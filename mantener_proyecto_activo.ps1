# Script para mantener el proyecto activo
# Guardar como: mantener_proyecto_activo.ps1

Write-Host "🚀 Iniciando Tablero Pavas Demo..." -ForegroundColor Green

# Ir al directorio del proyecto
Set-Location "c:\Users\ASUS\OneDrive\Documentos\Programacion\TableroPavasCopia"

# Función para verificar si Docker está ejecutándose
function Test-DockerRunning {
    try {
        docker ps | Out-Null
        return $true
    } catch {
        return $false
    }
}

# Función para verificar si los contenedores están activos
function Test-ContainersRunning {
    $containers = docker ps --filter "name=tableropavascopia" --format "{{.Names}}"
    return ($containers.Count -ge 3)
}

# Función para iniciar Docker si no está ejecutándose
function Start-ProjectContainers {
    Write-Host "📦 Iniciando contenedores Docker..." -ForegroundColor Yellow
    docker-compose up -d
    Start-Sleep 10
}

# Función para iniciar túneles
function Start-Tunnels {
    Write-Host "🌐 Iniciando túneles públicos..." -ForegroundColor Yellow
    
    # LocalTunnel con subdominio personalizado
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx localtunnel --port 80 --subdomain tablero-pavas-demo"
    
    # LocalTunnel aleatorio
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npx localtunnel --port 80"
    
    # Serveo (sin contraseña)
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "ssh -R 80:localhost:80 serveo.net"
}

# Loop principal
while ($true) {
    Write-Host "🔍 Verificando estado del proyecto..." -ForegroundColor Cyan
    
    if (-not (Test-DockerRunning)) {
        Write-Host "❌ Docker no está ejecutándose. Iniciando..." -ForegroundColor Red
        Start-ProjectContainers
    }
    elseif (-not (Test-ContainersRunning)) {
        Write-Host "❌ Contenedores no están activos. Reiniciando..." -ForegroundColor Red
        Start-ProjectContainers
    }
    else {
        Write-Host "✅ Proyecto funcionando correctamente" -ForegroundColor Green
    }
    
    # Mostrar URLs activas
    Write-Host "`n🌐 URLs disponibles:" -ForegroundColor Magenta
    Write-Host "   Local: http://192.168.20.90" -ForegroundColor White
    Write-Host "   Público 1: https://tablero-pavas-demo.loca.lt (contraseña: 181.51.32.133)" -ForegroundColor White
    Write-Host "   Público 2: https://rude-vans-ask.loca.lt (contraseña: 181.51.32.133)" -ForegroundColor White
    Write-Host "   Público 3: https://a277bde371454c999ff508606b7ba1db.serveo.net (sin contraseña)" -ForegroundColor White
    
    # Esperar 5 minutos antes de la siguiente verificación
    Write-Host "`n⏰ Próxima verificación en 5 minutos..." -ForegroundColor Gray
    Start-Sleep 300
}
