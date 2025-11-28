'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';

export default function LoginCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    // Verificar si hay una sesión activa (podrías usar localStorage, cookies, etc.)
    const session = localStorage.getItem('wfl_session');
    if (session) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isRegistering ? 'register' : 'login';
      const payload = isRegistering
        ? { email, password, name, role: 'user' }
        : { email, password };

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/auth/${endpoint}`, payload);

      if (response.data.access_token) {
        localStorage.setItem('wfl_token', response.data.access_token);
        localStorage.setItem('wfl_user', JSON.stringify(response.data.user));
        setIsLoggedIn(true);
        setError('');

        // Mostrar mensaje de éxito para registro
        if (isRegistering) {
          setSuccess('¡Usuario registrado exitosamente! Ahora puedes iniciar sesión.');
          setIsRegistering(false); // Cambiar a modo login
          setName('');
          setEmail('');
          setPassword('');
        } else {
          // Redirigir según el rol del usuario
          if (response.data.user.role === 'admin') {
            window.location.href = '/dashboard';
          } else {
            // Usuarios normales van a la home page
            window.location.href = '/home';
          }
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error en la autenticación';

      // Manejar error específico de email duplicado
      if (errorMessage.includes('ya está en uso') || errorMessage.includes('already exists')) {
        setError('Este email ya está en uso. Intenta iniciar sesión o usar otro correo.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Ocultar footer si estamos en la página principal (login) o si no hay sesión
  const shouldShowFooter = isLoggedIn && pathname !== '/';

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ backgroundColor: '#e5cedc' }}
    >
      {/* Fondo animado con ondas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg 
          className="absolute bottom-0 left-0 w-full h-full opacity-20"
          viewBox="0 0 1200 800" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#26558D" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#16FAD8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F218FF" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path
            d="M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z"
            fill="url(#waveGradient)"
            className="animate-pulse"
            style={{ animation: 'wave 8s ease-in-out infinite' }}
          />
        </svg>
        {/* Líneas dinámicas decorativas */}
        <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-#16FAD8 to-transparent opacity-30"
              style={{
                background: 'linear-gradient(to right, transparent, #16FAD8, transparent)',
                animation: 'slide 10s linear infinite'
              }} />
        <div className="absolute top-40 right-0 w-px h-64 bg-gradient-to-b from-transparent via-#F218FF to-transparent opacity-20"
              style={{
                background: 'linear-gradient(to bottom, transparent, #F218FF, transparent)',
                animation: 'slideVertical 12s linear infinite'
              }} />
      </div>

      {/* Contenedor principal con fade-in */}
      <div 
        className={`w-full max-w-md relative z-10 transition-opacity duration-1000 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Logo WFL centrado */}
        <div className="flex justify-center mb-6 animate-fade-in">
          <img
            src="/logos/LOGO_WFL.png"
            alt="Logo WFL"
            className="w-32 h-32 rounded-full shadow-lg object-cover"
            style={{
              boxShadow: '0 8px 32px rgba(38, 85, 141, 0.4)'
            }}
          />
        </div>

        {/* Tarjeta de login */}
        <div 
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 backdrop-blur-sm"
          style={{
            boxShadow: '0 20px 60px rgba(38, 85, 141, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(94, 205, 220, 0.2)'
          }}
        >
          {/* Título */}
           <div className="text-center mb-8">
             <h1
               className="text-3xl md:text-4xl font-bold mb-3"
               style={{
                 color: '#26558d',
                 fontFamily: 'system-ui, -apple-system, sans-serif',
                 letterSpacing: '0.1em',
                 textShadow: '0 2px 10px rgba(22, 250, 216, 0.4)',
                 fontWeight: 800
               }}
             >
               {isRegistering ? 'Regístrate en Premios WFL' : 'Inicia Sesión en Premios WFL'}
             </h1>
             <div
               className="h-1 w-24 mx-auto rounded-full"
               style={{
                 backgroundColor: '#f218ff',
                 boxShadow: '0 2px 8px rgba(242, 24, 255, 0.5)'
               }}
             />
           </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nombre (solo en registro) */}
            {isRegistering && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: '#FFFFFF' }}
                >
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{ color: '#5ECDDC' }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(94, 205, 220, 0.1)',
                      borderColor: '#5ECDDC',
                      color: '#26558D',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#F218FF';
                      e.target.style.boxShadow = '0 0 0 4px rgba(242, 24, 255, 0.15)';
                      e.target.style.backgroundColor = 'rgba(94, 205, 220, 0.2)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#5ECDDC';
                      e.target.style.boxShadow = 'none';
                      e.target.style.backgroundColor = 'rgba(94, 205, 220, 0.1)';
                    }}
                    placeholder="Tu nombre completo"
                  />
                </div>
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold mb-2"
                style={{ color: '#26558D' }}
              >
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: '#5ECDDC' }}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete={isRegistering ? "username" : "email"}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 focus:outline-none transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(94, 205, 220, 0.1)',
                    borderColor: '#5ECDDC',
                    color: '#26558D',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#F218FF';
                    e.target.style.boxShadow = '0 0 0 4px rgba(242, 24, 255, 0.15)';
                    e.target.style.backgroundColor = 'rgba(94, 205, 220, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#5ECDDC';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'rgba(94, 205, 220, 0.1)';
                  }}
                  placeholder="tu@correo.com"
                />
              </div>
            </div>


            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold mb-2"
                style={{ color: '#26558D' }}
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg 
                    className="w-5 h-5" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    style={{ color: '#5ECDDC' }}
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isRegistering ? "new-password" : "current-password"}
                  className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 focus:outline-none transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(94, 205, 220, 0.1)',
                    borderColor: '#5ECDDC',
                    color: '#26558D',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#F218FF';
                    e.target.style.boxShadow = '0 0 0 4px rgba(242, 24, 255, 0.15)';
                    e.target.style.backgroundColor = 'rgba(94, 205, 220, 0.2)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#5ECDDC';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'rgba(94, 205, 220, 0.1)';
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200"
                  style={{ color: '#26558D' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#F218FF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#26558D';
                  }}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Enlace Olvidé mi contraseña - Solo visible en modo login */}
            {!isRegistering && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="text-sm font-semibold transition-all duration-300 hover:underline"
                  style={{ color: '#F218FF' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#16FAD8';
                    e.currentTarget.style.textShadow = '0 0 8px rgba(22, 250, 216, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#F218FF';
                    e.currentTarget.style.textShadow = 'none';
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="text-center text-red-500 text-sm font-semibold p-3 rounded-lg bg-red-50 border border-red-200">
                {error}
                {error.includes('ya está en uso') && (
                  <div className="mt-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(false);
                        setError('');
                        setSuccess('');
                        setEmail('');
                        setPassword('');
                      }}
                      className="block w-full text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Iniciar sesión con esta cuenta
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="block w-full text-xs text-purple-600 hover:text-purple-800 underline"
                    >
                      Recuperar contraseña
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mensaje de éxito */}
            {success && (
              <div className="text-center text-green-600 text-sm font-semibold p-3 rounded-lg bg-green-50 border border-green-200">
                {success}
              </div>
            )}

            {/* Botón de Login/Registro */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#26558D',
                boxShadow: '0 4px 20px rgba(38, 85, 141, 0.4)',
                letterSpacing: '0.05em',
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#16FAD8';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(22, 250, 216, 0.6)';
                  e.currentTarget.style.color = '#26558D';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = '#26558D';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(38, 85, 141, 0.4)';
                  e.currentTarget.style.color = 'white';
                }
              }}
            >
              {loading ? 'CARGANDO...' : (isRegistering ? 'REGISTRARSE' : 'INICIAR SESIÓN')}
            </button>

            {/* Enlace para alternar entre login y registro */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError('');
                  setSuccess('');
                  setName('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-sm font-semibold transition-all duration-300 hover:underline"
                style={{ color: '#F218FF' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#16FAD8';
                  e.currentTarget.style.textShadow = '0 0 8px rgba(22, 250, 216, 0.6)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#F218FF';
                  e.currentTarget.style.textShadow = 'none';
                }}
              >
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </form>

          {/* Decoración inferior */}
          <div className="mt-8 flex justify-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{ backgroundColor: '#16FAD8' }}
            />
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{
                backgroundColor: '#F218FF',
                animationDelay: '0.2s'
              }}
            />
            <div
              className="w-2.5 h-2.5 rounded-full animate-pulse"
              style={{
                backgroundColor: '#5ECDDC',
                animationDelay: '0.4s'
              }}
            />
          </div>
        </div>
      </div>

      {/* Footer con navegación móvil - Solo visible cuando está logueado y no en la página principal */}
      {shouldShowFooter && (
        <div 
          className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-3"
          style={{
            background: 'linear-gradient(to top, rgba(231, 230, 247, 0.95), transparent)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="max-w-md mx-auto flex justify-around items-center">
            {/* Ícono Inicio */}
            <button
              className="flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110"
              style={{ color: '#26558D' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#16FAD8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#26558D';
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Inicio</span>
            </button>

            {/* Ícono Perfil */}
            <button
              className="flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110"
              style={{ color: '#26558D' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#F218FF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#26558D';
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs font-medium">Perfil</span>
            </button>

            {/* Ícono Configuración */}
            <button
              className="flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110"
              style={{ color: '#26558D' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#5ECDDC';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#26558D';
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium">Ajustes</span>
            </button>
          </div>
        </div>
      )}

      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes wave {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes slideVertical {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

