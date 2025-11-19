import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para producción
  output: 'standalone',
  images: {
    unoptimized: true, // Para entornos sin Image Optimization
  },
  // Variables de entorno para el frontend
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  // Permitir orígenes de desarrollo para acceso desde otros dispositivos
  allowedDevOrigins: ['192.168.88.188'],
};

export default nextConfig;
