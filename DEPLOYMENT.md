# 🚀 Guía de Despliegue a Producción - WFL

## 📋 Requisitos Previos

### ⚠️ IMPORTANTE: Requisitos del Servidor
- **Node.js**: versión 18.x o superior (obligatorio)
- **npm** o **pnpm**: versión 8.x o superior (obligatorio)
- **SQLite**: incluido con Node.js (no requiere instalación separada)
- **PM2** (opcional, recomendado para gestión de procesos): `npm install -g pm2`

### ⚠️ IMPORTANTE: Infraestructura Requerida
- **Servidor web** (Nginx/Apache) para servir archivos estáticos y proxy reverso
- **SSL Certificate** (Let's Encrypt recomendado - obligatorio para HTTPS)
- **Dominio** configurado apuntando al servidor (obligatorio)

## 🏗️ Paso 1: Preparación del Código

### 1.1 Clonar y configurar repositorio
```bash
git clone <tu-repositorio>
cd wfl
npm install
cd ../wfl_backend
npm install
```

### 1.2 Configurar variables de entorno

#### Backend (.env.production)
```bash
# Copiar el archivo de ejemplo
cp .env .env.production

# Editar con valores de producción
DATABASE_URL="file:./prisma/prod.db"
PORT=4000
JWT_SECRET="tu-clave-secreta-muy-segura-aqui-cambiar-por-una-real"
NODE_ENV=production
```

#### Frontend (.env.production)
```bash
# Crear archivo de variables de producción
echo "NEXT_PUBLIC_API_URL=https://tu-dominio.com/api" > .env.production
```

## 🏗️ Paso 2: Build de Producción

### 2.1 Build del Backend
```bash
cd ../wfl_backend
npm run build
```

### 2.2 Build del Frontend
```bash
cd ../wfl
npm run build
```

## 🚀 Paso 3: Despliegue

### Opción A: Despliegue Manual

#### 3.1 Configurar PM2 para el Backend
```bash
cd ../wfl_backend
pm2 start dist/main.js --name "wfl-backend"
pm2 save
pm2 startup
```

#### 3.2 Servir el Frontend
```bash
cd ../wfl
# Los archivos compilados estarán en la carpeta .next
# Configurar Nginx para servir desde .next/static y proxy al backend
```

### Opción B: Docker (Recomendado)

#### Dockerfile para Backend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "run", "start:prod"]
```

#### Dockerfile para Frontend
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: ./wfl_backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./wfl_backend/prisma:/app/prisma
    restart: unless-stopped

  frontend:
    build: ./wfl
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend
    restart: unless-stopped
```

## 🌐 Paso 4: Configuración del Servidor Web (Nginx)

### 4.1 Configuración básica de Nginx
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/tu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tu-dominio.com/privkey.pem;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔒 Paso 5: Configuración de Seguridad

### ⚠️ IMPORTANTE: 5.1 Configurar CORS en producción
En `main.ts` del backend, actualizar los orígenes permitidos:
```typescript
app.enableCors({
  origin: ['https://tu-dominio.com'], // ⚠️ CAMBIAR por tu dominio real
  credentials: true,
});
```

### ⚠️ CRÍTICO: 5.2 Configurar JWT Secret seguro
```bash
# ⚠️ IMPORTANTE: Generar una clave segura (nunca uses valores por defecto)
openssl rand -base64 32
# Copiar el resultado y usarlo como JWT_SECRET en .env.production
```

### 5.3 Configurar Firewall
```bash
# UFW (Ubuntu/Debian)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# O Firewalld (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## 📊 Paso 6: Monitoreo y Mantenimiento

### 6.1 Configurar logs
```bash
# PM2 logs
pm2 logs

# Ver logs específicos
pm2 logs wfl-backend
pm2 logs wfl-frontend
```

### 6.2 Configurar rotación de logs
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 6.3 Backup de base de datos
```bash
# Script de backup diario
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
cp ../wfl_backend/prisma/prod.db ../backups/prod_$DATE.db
```

## 🔄 Paso 7: Actualizaciones

### 7.1 Proceso de actualización
```bash
# Detener servicios
pm2 stop all

# Actualizar código
git pull origin main

# Reinstalar dependencias
npm install
cd ../wfl_backend && npm install

# Build
npm run build
cd ../wfl_backend && npm run build

# Reiniciar servicios
pm2 restart all
```

## 🚨 Solución de Problemas

### ⚠️ CRÍTICO: Problema de CORS
- Verificar que los orígenes en `main.ts` incluyan el dominio correcto
- Asegurarse de que las cookies estén configuradas correctamente
- ⚠️ IMPORTANTE: Nunca uses `*` en producción

### ⚠️ CRÍTICO: Error de conexión a BD
- Verificar permisos del archivo de base de datos
- Asegurarse de que la ruta en `DATABASE_URL` sea correcta
- ⚠️ IMPORTANTE: Hacer backup antes de cualquier cambio

### ⚠️ CRÍTICO: Frontend no carga
- Verificar que `NEXT_PUBLIC_API_URL` apunte al backend correcto
- Revisar logs de PM2: `pm2 logs wfl-frontend`
- ⚠️ IMPORTANTE: Verificar que el backend esté corriendo en el puerto correcto

## ⚠️ CRÍTICO: Consideraciones Importantes

1. ⚠️ **BACKUP OBLIGATORIO**: Hacer backup completo de base de datos antes del primer despliegue
2. ⚠️ **TESTING EN STAGING**: Probar exhaustivamente en entorno de staging antes de producción
3. ⚠️ **FIREWALL**: Configurar firewall correctamente (UFW/firewalld) - solo puertos necesarios
4. ⚠️ **SSL OBLIGATORIO**: Implementar HTTPS con certificado válido
5. ⚠️ **MONITOREO**: Configurar monitoreo continuo y alertas
6. ⚠️ **LOGS**: Configurar rotación y backup de logs
7. ⚠️ **SEGURIDAD**: Cambiar todas las claves por defecto y contraseñas

## 📈 Optimizaciones de Producción

1. **Configurar Redis** para sesiones si es necesario
2. **Implementar rate limiting** en el backend
3. **Configurar CDN** para archivos estáticos
4. **Implementar monitoring** (PM2 monitoring, Grafana + Prometheus)
5. **Configurar backups automáticos**

## 📞 Contactos de Emergencia

- **Administrador del servidor**: [tu-email@dominio.com]
- **Desarrollador**: [dev-email@dominio.com]
- **Documentación técnica**: [enlace-a-docs]

---

**Última actualización**: Noviembre 2025
**Versión**: 1.0.0