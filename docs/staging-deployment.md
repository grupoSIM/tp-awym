# Guía de Configuración y Despliegue en Staging (Hostinger VPS)

Esta guía explica cómo desplegar y operar el entorno de pruebas/staging utilizando la **interfaz web de Hostinger (Docker Manager)** y la **Terminal Web del Navegador de hPanel**, sin necesidad de configurar clientes SSH locales.

---

## 1. Despliegue desde la Interfaz Web de Hostinger

Hostinger hPanel incluye herramientas integradas para gestionar Docker sin salir del navegador.

### Opción A: Mediante Hostinger Docker Manager (Interfaz Visual)

1. **Acceder a Docker Manager:**
   - Entrá a [hPanel de Hostinger](https://hpanel.hostinger.com) > **VPS** > Seleccioná tu servidor.
   - En el menú lateral izquierdo, seleccioná **Docker** o **Docker Manager**.
2. **Crear el Proyecto Compose:**
   - Hacé clic en **Crear contenedor** o **Add Project / Compose**.
   - Asigná el nombre del proyecto: `tp-awym-staging`.
   - Pegá el contenido del archivo [`docker-compose.staging.yml`](file:///c:/DEV/tp-awym-gemini/docker-compose.staging.yml) del repositorio.
3. **Configurar Variables de Entorno:**
   - En la sección **Environment Variables** / Archivo `.env`, ingresá los valores requeridos (basados en `.env.staging.example`):
     ```env
     MYSQL_ROOT_PASSWORD=un_password_root_robusto
     MYSQL_DATABASE=turnos_staging_db
     MYSQL_USER=turnos_staging_user
     MYSQL_PASSWORD=un_password_usuario_robusto
     JWT_SECRET=un_jwt_secret_largo_y_seguro
     COOKIE_SECRET=un_cookie_secret_largo_y_seguro
     STAGING_WEB_PORT=3080
     CLIENT_URL=https://turnos-staging.tudominio.com
     ```
4. **Iniciar el stack:**
   - Hacé clic en **Deploy** / **Iniciar**. Hostinger descargará las imágenes de GHCR y levantará los servicios (`mysql`, `server`, `client`).

---

### Opción B: Mediante la Terminal Web del Navegador (Browser Terminal)

Si preferís usar la línea de comandos pero sin configurar llaves ni programas en tu computadora local:

1. **Abrir la Terminal Web:**
   - En hPanel > **VPS** > seleccioná tu servidor.
   - En la parte superior derecha, hacé clic en el botón **Terminal Web** (Browser Terminal). Se abrirá una consola interactiva directamente en la pestaña del navegador.
2. **Crear el directorio y archivos:**
   ```bash
   mkdir -p /home/deploy/tp-awym-staging
   cd /home/deploy/tp-awym-staging
   ```
3. **Descargar o crear el `docker-compose.staging.yml`:**
   ```bash
   curl -O https://raw.githubusercontent.com/grupoSIM/tp-awym/develop/docker-compose.staging.yml
   ```
4. **Crear el archivo `.env`:**
   ```bash
   nano .env
   ```
   Pegá y completá tus variables seguras:
   ```env
   MYSQL_ROOT_PASSWORD=un_password_root_robusto
   MYSQL_DATABASE=turnos_staging_db
   MYSQL_USER=turnos_staging_user
   MYSQL_PASSWORD=un_password_usuario_robusto
   JWT_SECRET=un_jwt_secret_largo_y_seguro
   COOKIE_SECRET=un_cookie_secret_largo_y_seguro
   STAGING_WEB_PORT=3080
   CLIENT_URL=https://turnos-staging.tudominio.com
   ```
   *(Guardar con `Ctrl + O`, `Enter` y salir con `Ctrl + X`)*.
5. **Iniciar los Contenedores:**
   ```bash
   docker compose -f docker-compose.staging.yml up -d
   ```

---

## 2. Configuración del Reverse Proxy y Subdominio

En tu gestor de proxy inverso existente en el VPS (ej. Nginx Proxy Manager, Traefik o Nginx):

1. **Crear Proxy Host / Enrutamiento:**
   - **Domain Names:** `turnos-staging.tudominio.com` (apuntando previamente por DNS A-record a la IP del VPS).
   - **Scheme:** `http`
   - **Forward Hostname / IP:** `127.0.0.1`
   - **Forward Port:** `3080` (o el configurado en `STAGING_WEB_PORT`).
2. **Configuración SSL:**
   - Activar certificado SSL (Let's Encrypt o certificado comodín existente).
   - Habilitar `Force SSL`, `HTTP/2 Support` y `Websockets Support`.

---

## 3. Actualización y Redespliegue Continuo

Cuando el pipeline de GitHub Actions sube nuevas versiones a GitHub Packages (GHCR) tras un push en `staging`:

### Desde la Interfaz de Hostinger:
- En **Docker Manager**, ingresá al proyecto `tp-awym-staging` y hacé clic en **Restart** / **Re-deploy** para que descargue las últimas imágenes con el tag `:staging`.
- *Opcional:* Si Hostinger Docker Manager te proporciona una **Webhook URL de re-despliegue**, podés agregarla a GitHub Secrets como `HOSTINGER_WEBHOOK_URL` para que el workflow la invoque automáticamente mediante un simple `curl -X POST $HOSTINGER_WEBHOOK_URL`.

### Desde la Terminal Web del Navegador:
Abrí la Terminal Web en hPanel y ejecutá:
```bash
cd /home/deploy/tp-awym-staging
docker compose -f docker-compose.staging.yml pull
docker compose -f docker-compose.staging.yml up -d
```
El contenedor de backend ejecutará automáticamente cualquier nueva migración de base de datos (`npx prisma migrate deploy`) al iniciar.
