# WFL Frontend

Aplicación frontend para el sistema de gestión de la World Football League (WFL), construida con Next.js.

## Descripción

Esta aplicación proporciona una interfaz de usuario moderna y responsiva para gestionar series, equipos, jugadores y autenticación de usuarios en la liga de fútbol.

## Tecnologías Utilizadas

- **Next.js 16** - Framework de React para aplicaciones web
- **React 19** - Biblioteca para interfaces de usuario
- **TypeScript** - JavaScript con tipado estático
- **Tailwind CSS** - Framework de CSS utilitario
- **Axios** - Cliente HTTP para solicitudes a la API

## Requisitos Previos

- Node.js 18+
- pnpm (recomendado) o npm/yarn

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd wfl
```

2. Instala las dependencias:
```bash
pnpm install
```

3. Crea un archivo `.env.local` con las variables de entorno necesarias:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Ejecución en Desarrollo

Ejecuta el servidor de desarrollo:

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Construcción para Producción

```bash
pnpm build
pnpm start
```

## Configuración

### Variables de Entorno

- `NEXT_PUBLIC_API_URL`: URL base de la API del backend

### Configuración de Desarrollo

Para permitir acceso desde otros dispositivos en desarrollo, configura `allowedDevOrigins` en `next.config.ts`:

```typescript
allowedDevOrigins: ['192.168.88.188'] // Agrega las IPs necesarias
```

## Estructura del Proyecto

```
app/
├── components/     # Componentes reutilizables
├── dashboard/      # Página del dashboard
├── home/          # Página de inicio
├── globals.css    # Estilos globales
├── layout.tsx     # Layout principal
└── page.tsx       # Página principal

public/            # Archivos estáticos
```

## Scripts Disponibles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm start` - Inicia el servidor de producción
- `pnpm lint` - Ejecuta el linter

## Despliegue

La aplicación está configurada para despliegue standalone. Consulta `DEPLOYMENT.md` para instrucciones detalladas de despliegue completo (backend + frontend).

### Instalación en Hosting

#### Opción 1: Vercel (Recomendado para Frontend)

1. **Crear cuenta en Vercel**:
   - Ve a [vercel.com](https://vercel.com) y crea una cuenta
   - Conecta tu repositorio de GitHub/GitLab

2. **Configurar proyecto**:
   ```bash
   # En Vercel dashboard, importa el proyecto frontend (carpeta wfl)
   # Configurar variables de entorno:
   NEXT_PUBLIC_API_URL=https://tu-backend-url.com/api
   ```

3. **Desplegar**:
   - Vercel detectará automáticamente Next.js
   - El despliegue se hará automáticamente en cada push

#### Opción 2: Netlify

1. **Crear cuenta en Netlify**:
   - Ve a [netlify.com](https://netlify.com) y crea una cuenta

2. **Conectar repositorio**:
   - Importa el proyecto desde Git
   - Configura el directorio de build: `./` (raíz del proyecto)

3. **Configurar build settings**:
   ```
   Build command: npm run build
   Publish directory: .next
   ```

4. **Variables de entorno**:
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend-url.com/api
   ```

5. **Desplegar**:
   - Netlify desplegará automáticamente

#### Opción 3: VPS/Servidor Dedicado

1. **Preparar el servidor**:
   ```bash
   # Conectar al servidor
   ssh user@tu-servidor

   # Instalar Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Instalar PM2
   sudo npm install -g pm2
   ```

2. **Desplegar la aplicación**:
   ```bash
   # Clonar el repositorio
   git clone <tu-repositorio>
   cd wfl

   # Instalar dependencias
   npm install

   # Configurar variables de entorno
   echo "NEXT_PUBLIC_API_URL=https://tu-dominio.com/api" > .env.production

   # Build de producción
   npm run build

   # Iniciar con PM2
   pm2 start npm --name "wfl-frontend" -- start
   pm2 save
   pm2 startup
   ```

3. **Configurar Nginx**:
   ```nginx
   server {
       listen 80;
       server_name tu-dominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /_next/static/ {
           proxy_pass http://localhost:3000;
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

4. **Configurar SSL**:
   ```bash
   # Instalar Certbot
   sudo apt install certbot python3-certbot-nginx

   # Obtener certificado SSL
   sudo certbot --nginx -d tu-dominio.com
   ```

#### Opción 4: Docker

1. **Crear Dockerfile**:
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

2. **Construir y ejecutar**:
   ```bash
   docker build -t wfl-frontend .
   docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://tu-backend.com/api wfl-frontend
   ```

### Notas Importantes

- **Backend requerido**: El frontend necesita un backend WFL funcionando para operar completamente
- **Variables de entorno**: Configura `NEXT_PUBLIC_API_URL` apuntando a tu backend
- **CORS**: Asegúrate de que el backend permita orígenes del dominio del frontend
- **SSL**: Siempre usa HTTPS en producción

## Contribución

1. Crea una rama para tu feature
2. Realiza tus cambios
3. Ejecuta los tests y linting
4. Crea un pull request

## Licencia

Este proyecto es privado y no tiene licencia pública.
