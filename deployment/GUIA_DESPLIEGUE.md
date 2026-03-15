# 🚀 Guía de Despliegue: Coontrasures
### Flujo de Doble Monitor | PC Potente Local + Servidor Remoto (AnyDesk)

---

## 📺 CONFIGURACIÓN DE PANTALLAS (SIEMPRE ACTIVA)

| Monitor 1 — Tu PC (Desarrollo) | Monitor 2 — AnyDesk (Servidor) |
|---|---|
| VS Code con el proyecto | pgAdmin 4 para ver la base de datos |
| Navegador con `localhost:5173` (dev) | IIS Manager para ver el sitio |
| Explorador de archivos con carpeta `dist` | PowerShell con `pm2 logs Coontrasures-API` |
| Esta guía / chat AI | Administrador de Tareas del servidor |

---

## 💡 POR QUÉ COMPILAR EN TU PC Y NO EN EL SERVIDOR

`npm run build` convierte todo tu código fuente en la pequeña carpeta `dist`.
Lo que viaja por AnyDesk es solo esa carpeta ya empaquetada:

| | En el Servidor | En tu PC ✅ |
|---|---|---|
| CPU usada | La del servidor (limitada) | La tuya (potente, 5-10x más rápido) |
| Lo que viaja por red | Nada, pero tarda mucho en compilar | Solo `dist` (~5–15 MB) |
| Riesgo | Sin memoria, puede fallar | Ninguno |

---

---
# SECCIÓN A: CONFIGURACIÓN INICIAL DEL SERVIDOR (SOLO UNA VEZ)
---

## A1 [Monitor 2 — Servidor]: Instalar el Software Necesario

Apenas abras AnyDesk en el servidor virgen, instala esto:

- [ ] **Node.js LTS** → [nodejs.org](https://nodejs.org) · Incluye `npm` automáticamente.
- [ ] **PostgreSQL 15+** → [postgresql.org/download/windows](https://www.postgresql.org/download/windows/) · Durante la instalación, pon una contraseña al usuario `postgres` y **anótala**.
- [ ] **pgAdmin 4** → Suele venir incluido con PostgreSQL. Si no, descárgalo por separado.
- [ ] **Git** → [git-scm.com/download/win](https://git-scm.com/download/win)
- [ ] **IIS** → Ya viene en Windows Server. Se activa desde Server Manager (ver A5).
- [ ] **IIS URL Rewrite Module 2.1** → [iis.net/downloads/microsoft/url-rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) · **Obligatorio** para que el `web.config` funcione.

---

## A2 [Monitor 2 — Servidor]: Crear la Base de Datos PostgreSQL

1. Abre **pgAdmin 4** en el servidor.
2. Conéctate con la contraseña del usuario `postgres`.
3. Clic derecho en **Databases** → **Create** → **Database...**.
4. Nombre de la base de datos: `cootransures_db` → **Save**.
5. En el panel izquierdo, expande `cootransures_db` → clic derecho en **Query Tool**.
6. Abre el archivo `server/db/init.sql` de tu proyecto y pega su contenido en el Query Tool.
7. Presiona ▶ **Execute**. Esto crea las tablas `reports` y `users`.

> Verifica que no haya errores en la consola inferior de pgAdmin.
> **Deja pgAdmin abierto en Monitor 2** para monitorear la BD cuando quieras.

---

## A3 [Monitor 2 — Servidor]: Obtener el Código en el Servidor

1. Abre **PowerShell** en el servidor (Monitor 2):
   ```powershell
   mkdir C:\SitiosWeb
   cd C:\SitiosWeb
   git clone https://github.com/SamuelGzpt/Coontrasures.git
   ```
   > Si no tienes el proyecto en Git, usa el File Manager de AnyDesk para copiar la carpeta del proyecto desde tu PC (Monitor 1).

---

## A4 [Monitor 2 — Servidor]: Configurar y Encender el Backend (Node.js)

El backend Express corre en el servidor en el **puerto 3000**. Es la única parte que debe ejecutarse allá.

### Paso 1: Instalar dependencias del servidor
```powershell
cd C:\SitiosWeb\Coontrasures\server
npm install
```

### Paso 2: Crear el archivo `.env`
Crea el archivo `C:\SitiosWeb\Coontrasures\server\.env` con el siguiente contenido,
reemplazando los valores de ejemplo por los reales:
```env
PORT=3000
CLIENT_URL=http://TU_IP_DEL_SERVIDOR_O_DOMINIO
JWT_SECRET=CambiaMePorUnaClaveMuyLargaYSegura2024!
DB_USER=postgres
DB_PASSWORD=LA_CONTRASEÑA_QUE_PUSISTE_EN_POSTGRESQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cootransures_db
```
> ⚠️ **IMPORTANTE:** `JWT_SECRET` es el token que protege las rutas de admin. Cámbialo
> por una cadena larga, aleatoria y secreta. **Nunca uses el valor de ejemplo.**

### Paso 3: Instalar PM2 (mantiene el backend vivo 24/7)
```powershell
npm install -g pm2
npm install -g pm2-windows-startup
pm2-startup install
```

### Paso 4: Encender el backend
El archivo de arranque del servidor es `index.js`:
```powershell
cd C:\SitiosWeb\Coontrasures\server
pm2 start index.js --name "Coontrasures-API"
pm2 save
```

### Paso 5: Verificar que está corriendo
```powershell
pm2 list
```
Debes ver `Coontrasures-API` con estado **online**.

### Paso 6: Ver logs en tiempo real (déjalo visible en Monitor 2)
```powershell
pm2 logs Coontrasures-API
```
Debes ver: `Server running secure on port 3000`

---

## A5 [Monitor 2 — Servidor]: Crear el Usuario Administrador

Las credenciales del admin **no van en el código**. Se crean directamente en la base
de datos con la contraseña ya encriptada (bcrypt). Tu proyecto incluye el script para esto.

```powershell
cd C:\SitiosWeb\Coontrasures\server

# Formato: node scripts/create_admin.js [usuario] [contraseña]
node scripts/create_admin.js admin TuContraseñaSegura2024!
```

Salida esperada:
```
✅ Admin user created/updated successfully.
User: admin
Password: [HIDDEN]
```

> Si en el futuro necesitas cambiar la contraseña, ejecuta el mismo comando con la nueva contraseña. El script hace Upsert (actualiza si ya existe).

---

## A6 [Monitor 1 — Tu PC]: Preparar el Frontend para Producción

Antes de compilar, hay **un cambio obligatorio en el código** para que el frontend
deje de usar datos de prueba y use el servidor real:

### ⚠️ Cambio CRÍTICO antes de compilar

Abre el archivo `src/services/reportService.ts` en VS Code (Monitor 1).

Busca la línea:
```typescript
const USE_MOCK = true;
```
Cámbiala a:
```typescript
const USE_MOCK = false;
```

> Esto hace que el frontend conecte con el backend real en el servidor en vez de
> usar los datos guardados en el navegador (modo de prueba). Sin este cambio,
> la app no funcionaría correctamente en producción.

### Compilar el frontend

Ahora sí, en la terminal de VS Code (Monitor 1):
```powershell
cd C:\Users\USUARIO\Desktop\Coontrasures
npm run build
```
Esto ejecuta TypeScript + Vite y genera la carpeta `dist` con la web ya optimizada.
En tu PC potente tardará pocos segundos.

---

## A7 [Monitor 1 → Monitor 2]: Transferir el `dist` al Servidor

La carpeta `dist` pesa ~5–15 MB — la transferencia es casi instantánea.

### Método A: Arrastrar y Soltar (más fácil) ✅
1. En tu PC (Monitor 1), en el Explorador de archivos ve a:
   `C:\Users\USUARIO\Desktop\Coontrasures\dist`
2. Activa la ventana de AnyDesk (Monitor 2).
3. En AnyDesk, navega hasta `C:\SitiosWeb\Coontrasures\`.
4. **Arrastra la carpeta `dist`** y suéltala dentro de la ventana de AnyDesk.

### Método B: File Manager de AnyDesk
1. En AnyDesk, clic en el ícono de carpeta en la barra superior → **File Manager**.
2. Panel izquierdo (tu PC): navega a `C:\Users\USUARIO\Desktop\Coontrasures\dist`.
3. Panel derecho (servidor): navega a `C:\SitiosWeb\Coontrasures\`.
4. Arrastra `dist` de izquierda a derecha.

---

## A8 [Monitor 2 — Servidor]: Colocar el `web.config` en el `dist`

El archivo `web.config` es el cerebro del proxy inverso: le dice a IIS que todo lo que
llegue a `/api/*` lo envíe al puerto 3000 (tu backend) y todo lo demás lo sirva como React.

```powershell
copy C:\SitiosWeb\Coontrasures\deployment\web.config C:\SitiosWeb\Coontrasures\dist\web.config
```

> Este paso debe repetirse cada vez que transfieras un nuevo `dist`, porque Vite borra
> y recrea esa carpeta completamente en cada compilación.

---

## A9 [Monitor 2 — Servidor]: Activar y Configurar IIS

### Activar IIS
1. Abre **Server Manager** en el servidor.
2. Ve a **Add roles and features** → **Server Roles** → marca **Web Server (IIS)** → instala.

### Crear el sitio web en IIS
1. Abre **Internet Information Services (IIS) Manager**.
2. Panel izquierdo: clic derecho en **Sites** → **Add Website...**
3. Llena los datos:
   - **Site name:** `Coontrasures`
   - **Physical path:** `C:\SitiosWeb\Coontrasures\dist`
   - **Port:** `80`
4. Haz clic en **OK**.

### Dar permisos de lectura a IIS
1. Explorador de archivos del servidor → navega a `C:\SitiosWeb\Coontrasures\dist`.
2. Clic derecho → **Propiedades** → Pestaña **Seguridad** → **Editar** → **Agregar**.
3. Escribe `IIS_IUSRS` → **Aceptar**.
4. Marca **Lectura y ejecución** → Acepta todo.

### Deja IIS Manager abierto en Monitor 2 para monitorear el sitio.

---

## A10 [Monitor 2 — Servidor]: Abrir el Firewall

Ejecuta el script ya preparado en tu proyecto:
```powershell
cd C:\SitiosWeb\Coontrasures\deployment
powershell -ExecutionPolicy Bypass -File setup_firewall.ps1
```

O manualmente:
1. Busca **Windows Defender Firewall with Advanced Security**.
2. **Inbound Rules** → **New Rule...** → **Port** → **TCP** → Puertos: `80, 443`.
3. **Allow the connection** → Nombrarlo **"Puertos IIS Web"** → Finalizar.

---

✅ **¡Tu aplicación Coontrasures ya está en línea!**
Visita `http://IP_DE_TU_SERVIDOR` desde cualquier navegador para verificarlo.

---

---
# SECCIÓN B: FLUJO DIARIO DE ACTUALIZACIONES
---

Cuando modifiques algo en el código y quieras verlo en producción:

## B1 [Monitor 1 — Tu PC]: Modifica y prueba localmente

1. Edita lo que necesites en VS Code.
2. Verifica que funciona con `npm run dev` en `http://localhost:5173`.

## B2 [Monitor 1 — Tu PC]: Compila con tu PC potente

Asegúrate de que `USE_MOCK = false` en `src/services/reportService.ts` (solo necesitas
verificarlo la primera vez; ya debería estar en `false` si seguiste la guía).

```powershell
cd C:\Users\USUARIO\Desktop\Coontrasures
npm run build
```

## B3 [Monitor 1 → Monitor 2]: Transfiere el nuevo `dist`

Arrastra la carpeta `dist` a la ventana de AnyDesk (reemplaza la anterior).

## B4 [Monitor 2 — Servidor]: Restaura el `web.config`

```powershell
copy C:\SitiosWeb\Coontrasures\deployment\web.config C:\SitiosWeb\Coontrasures\dist\web.config
```

> 💡 **Tip:** Puedes crear un script `.bat` en el servidor que haga este paso automáticamente.
> Pídele a la AI que te lo cree.

## B5 [Monitor 2 — Servidor]: Reinicia el backend (solo si cambiaste el servidor)

Si solo cambiaste React (frontend), **no necesitas hacer nada** — IIS ya sirve los nuevos
archivos automáticamente.

Si cambiaste archivos dentro de **`server/`**:
```powershell
# Primero copia los archivos del server actualizados usando el File Manager de AnyDesk
# Luego reinicia PM2:
pm2 restart Coontrasures-API
```

## B6 [Monitor 1]: Verifica en el navegador

Abre tu navegador y visita `http://IP_DEL_SERVIDOR`. Confirma que los cambios se ven.

---

## 🔑 REFERENCIA RÁPIDA: Comandos PM2

```powershell
pm2 list                        # Ver estado de todos los procesos
pm2 logs Coontrasures-API       # Ver logs en tiempo real
pm2 restart Coontrasures-API    # Reiniciar el backend
pm2 stop Coontrasures-API       # Detener el backend
pm2 start index.js --name "Coontrasures-API"  # Iniciarlo si está detenido
```

## 📁 REFERENCIA RÁPIDA: Rutas Importantes en el Servidor

| Qué | Ruta |
|---|---|
| Backend (Node.js) | `C:\SitiosWeb\Coontrasures\server\` |
| Archivo de inicio del backend | `C:\SitiosWeb\Coontrasures\server\index.js` |
| Variables de entorno del backend | `C:\SitiosWeb\Coontrasures\server\.env` |
| PDFs subidos por los admins | `C:\SitiosWeb\Coontrasures\server\uploads\` |
| Frontend compilado (lo que ve IIS) | `C:\SitiosWeb\Coontrasures\dist\` |
| Configuración del proxy IIS | `C:\SitiosWeb\Coontrasures\dist\web.config` |
| Script de configuración del firewall | `C:\SitiosWeb\Coontrasures\deployment\setup_firewall.ps1` |
| Script SQL para crear tablas | `C:\SitiosWeb\Coontrasures\server\db\init.sql` |
| Script para crear usuario admin | `C:\SitiosWeb\Coontrasures\server\scripts\create_admin.js` |

## 🌐 REFERENCIA RÁPIDA: Cómo Funciona el Proxy (web.config)

```
Usuario → http://tudominio.com/          → IIS → dist/index.html (React)
Usuario → http://tudominio.com/api/...   → IIS → localhost:3000/api/... (Node.js)
Usuario → http://tudominio.com/uploads/  → IIS → localhost:3000/uploads/ (PDFs)
```

---

---
# SECCIÓN C: CONECTAR TU DOMINIO DE GODADDY (OPCIONAL PERO RECOMENDADO)
---

Si tienes un dominio comprado en GoDaddy (ej: `cootransures.com`), estos son los
pasos para que la gente acceda por esa URL en vez de por la IP del servidor.

## C1: Obtener la IP Pública del Servidor

En el servidor (Monitor 2), abre PowerShell y ejecuta:
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```
Esto te muestra la IP pública del servidor. **Anótala**, la necesitarás en GoDaddy.

> ⚠️ Si tu servidor tiene IP dinámica (cambia cada vez que reinicia), necesitas
> contratar una IP estática con tu proveedor de internet antes de continuar.

## C2 [En GoDaddy]: Apuntar el Dominio a tu Servidor

1. Entra a **[dcc.godaddy.com](https://dcc.godaddy.com)** e inicia sesión.
2. Selecciona tu dominio → clic en **DNS** (o "Administrar DNS").
3. Busca el registro de tipo **A** que apunte a `@` (el dominio raíz).
4. Haz clic en **Editar** (el lápiz) y cambia el valor por la **IP pública del servidor**.
5. Si quieres que también funcione `www.tudominio.com`, busca el registro **CNAME** de `www`
   y asegúrate de que apunte a `@` (o crea uno si no existe).
6. Guarda los cambios.

> ⏱️ Los cambios de DNS tardan entre **10 minutos y 48 horas** en propagarse por internet.
> Puedes verificar si ya propagó en [dnschecker.org](https://dnschecker.org).

## C3 [Monitor 2 — Servidor]: Actualizar IIS para usar el Dominio

1. Abre **IIS Manager**.
2. Panel izquierdo → expande tu servidor → **Sites** → clic en `Coontrasures`.
3. Panel derecho → clic en **Bindings...**
4. Selecciona el binding del puerto 80 → clic en **Edit...**
5. En **Host name**, escribe tu dominio: `cootransures.com`
6. Haz clic en **OK**. Repite para agregar otro binding con `www.cootransures.com`.

## C4 [Monitor 2 — Servidor]: Actualizar el `.env` del Backend

Edita el archivo `C:\SitiosWeb\Coontrasures\server\.env` y cambia `CLIENT_URL`:
```env
CLIENT_URL=http://cootransures.com
```
Luego reinicia el backend:
```powershell
pm2 restart Coontrasures-API
```

## C5 (Futuro): Agregar HTTPS con Certificado SSL Gratuito

Cuando el dominio ya resuelva correctamente en HTTP, puedes agregar SSL (candado verde)
con **Win-ACME** (Let's Encrypt para Windows + IIS):
- Descarga: [win-acme.com](https://www.win-acme.com/)
- Ejecuta el programa y sigue el asistente — detecta tu sitio en IIS automáticamente
  y configura el certificado gratis. Se renueva solo cada 90 días.
