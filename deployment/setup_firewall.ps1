# Script de Configuración de Blindaje 360° Extremo para Coontrasures
# Requiere permisos de Administrador
# Propósito: Invisibilidad total, bloqueo de RDP y política estricta de "Cerrar Todo".

Write-Host "--- Iniciando Blindaje 360° Extremo de Coontrasures ---" -ForegroundColor Cyan

# 1. POLÍTICA POR DEFECTO: BLOQUEAR TODO
# Esto asegura que cualquier puerto no mencionado explícitamente esté cerrado.
Write-Host "Configurando Política Global: Bloquear TODO lo entrante por defecto..."
Set-NetFirewallProfile -Profile Domain,Private,Public -DefaultInboundAction Block

# Función para verificar/crear reglas
function Set-SecureRule ($Name, $Port, $Action, $Protocol="TCP", $Direction="Inbound") {
    if (Get-NetFirewallRule -DisplayName $Name -ErrorAction SilentlyContinue) {
        Remove-NetFirewallRule -DisplayName $Name
    }
    Write-Host "Configurando regla: $Name ($Action puerto $Port)..."
    New-NetFirewallRule -DisplayName $Name -Direction $Direction -LocalPort $Port -Protocol $Protocol -Action $Action
}

# 2. ACCESOS PÚBLICOS MÍNIMOS (Solo la Web)
Set-SecureRule "Coontrasures-HTTP" 80 "Allow"
Set-SecureRule "Coontrasures-HTTPS" 443 "Allow"

# 3. MODO INVISIBLE (Bloqueo de Ping/ICMP)
if (Get-NetFirewallRule -DisplayName "Coontrasures-Invisible" -ErrorAction SilentlyContinue) {
    Remove-NetFirewallRule -DisplayName "Coontrasures-Invisible"
}
Write-Host "Activando MODO INVISIBLE (Bloqueando ICMP/Ping)..."
New-NetFirewallRule -DisplayName "Coontrasures-Invisible" -Direction Inbound -Protocol ICMPv4 -Action Block

# 4. CIERRE DE PUERTOS CRÍTICOS (Backdoors)
# AnyDesk NO necesita puertos abiertos porque usa una conexión de salida.
# Bloqueamos RDP, Node (interno) y Postgres (interno).
Set-SecureRule "Coontrasures-BlockRDP" 3389 "Block"
Set-SecureRule "Coontrasures-BlockNode" 3000 "Block"
Set-SecureRule "Coontrasures-BlockPostgres" 5432 "Block"

# 5. PREVENCIÓN DE ATAQUES COMUNES (Fuerza Bruta)
$RiskyPorts = @(21, 22, 23, 1433, 3306)
foreach ($P in $RiskyPorts) {
    Set-SecureRule "Coontrasures-Hardening-$P" $P "Block"
}

Write-Host "--- Blindaje 360° Extremo Completado ---" -ForegroundColor Green
Write-Host "ADVERTENCIA: RDP ha sido bloqueado. Usa AnyDesk para administración."
Write-Host "El servidor ahora solo atiende peticiones en 80/443 y es invisible a pings."
