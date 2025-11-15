#!/bin/bash

# Script de despliegue para WFL
# Uso: ./deploy.sh [environment]
# environment: dev, staging, prod (default: prod)

set -e

ENVIRONMENT=${1:-prod}
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Iniciando despliegue para entorno: $ENVIRONMENT"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes coloreados
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar requisitos
check_requirements() {
    print_status "Verificando requisitos del sistema..."

    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado. Por favor instala Docker primero."
        exit 1
    fi

    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
        exit 1
    fi

    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js primero."
        exit 1
    fi

    print_status "✅ Todos los requisitos están instalados"
}

# Configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno para $ENVIRONMENT..."

    # Backend
    if [ ! -f "wfl_backend/.env.$ENVIRONMENT" ]; then
        print_warning "Archivo wfl_backend/.env.$ENVIRONMENT no encontrado. Creando con valores por defecto..."
        cat > "wfl_backend/.env.$ENVIRONMENT" << EOF
DATABASE_URL="file:./prisma/$ENVIRONMENT.db"
PORT=4000
JWT_SECRET="$(openssl rand -base64 32)"
NODE_ENV=$ENVIRONMENT
EOF
    fi

    # Frontend
    if [ ! -f ".env.$ENVIRONMENT" ]; then
        print_warning "Archivo .env.$ENVIRONMENT no encontrado. Creando con valores por defecto..."
        cat > ".env.$ENVIRONMENT" << EOF
NEXT_PUBLIC_API_URL=http://localhost:4000
EOF
    fi

    print_status "✅ Variables de entorno configuradas"
}

# Build de aplicaciones
build_applications() {
    print_status "Construyendo aplicaciones..."

    # Build backend
    print_status "Construyendo backend..."
    cd "$PROJECT_ROOT/wfl_backend"
    npm install
    npm run build

    # Build frontend
    print_status "Construyendo frontend..."
    cd "$PROJECT_ROOT"
    npm install
    npm run build

    print_status "✅ Aplicaciones construidas exitosamente"
}

# Desplegar con Docker
deploy_with_docker() {
    print_status "Desplegando con Docker..."

    # Detener contenedores existentes
    print_status "Deteniendo contenedores existentes..."
    docker-compose down || true

    # Construir y levantar servicios
    print_status "Construyendo y levantando servicios..."
    docker-compose up --build -d

    # Esperar a que los servicios estén listos
    print_status "Esperando a que los servicios estén listos..."
    sleep 30

    # Verificar health checks
    print_status "Verificando estado de los servicios..."

    # Verificar backend
    if curl -f http://localhost:4000/api/auth/users &> /dev/null; then
        print_status "✅ Backend está funcionando correctamente"
    else
        print_error "❌ Backend no responde correctamente"
        exit 1
    fi

    # Verificar frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        print_status "✅ Frontend está funcionando correctamente"
    else
        print_error "❌ Frontend no responde correctamente"
        exit 1
    fi

    print_status "✅ Despliegue completado exitosamente"
}

# Función principal
main() {
    print_status "Iniciando despliegue de WFL..."

    check_requirements
    setup_environment
    build_applications
    deploy_with_docker

    echo ""
    print_status "🎉 Despliegue completado exitosamente!"
    echo ""
    echo "📊 Servicios disponibles:"
    echo "   🌐 Frontend: http://localhost:3000"
    echo "   🚀 Backend API: http://localhost:4000"
    echo "   📚 API Docs: http://localhost:4000/api/docs"
    echo ""
    echo "🔧 Comandos útiles:"
    echo "   Ver logs: docker-compose logs -f"
    echo "   Detener servicios: docker-compose down"
    echo "   Reiniciar: docker-compose restart"
    echo ""
    print_warning "Recuerda configurar tu servidor web (Nginx/Apache) para producción"
}

# Manejo de errores
trap 'print_error "El despliegue falló. Revisa los logs para más detalles."' ERR

# Ejecutar función principal
main "$@"