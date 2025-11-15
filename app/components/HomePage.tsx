'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface Serie {
  id: number;
  nombre: string;
  descripcion?: string;
  estado?: string;
  temporada?: string;
  pais?: string;
  createAt: string;
  equipos: Equipo[];
}

interface Equipo {
  id: number;
  nombre: string;
  descripcion?: string;
  estadio?: string;
  ciudad?: string;
  series: Serie[];
  jugadores: Jugador[];
}

interface Jugador {
  id: number;
  nombre: string;
  numeroCamiseta: number;
  posicion: string;
  equipo?: Equipo;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);
  const [latestSeries, setLatestSeries] = useState<Serie[]>([]);
  const [equiposWithSeries, setEquiposWithSeries] = useState<Equipo[]>([]);
  const [jugadoresWithDetails, setJugadoresWithDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showSeriesView, setShowSeriesView] = useState(false);
  const [showSerieEquiposView, setShowSerieEquiposView] = useState(false);
  const [selectedSerie, setSelectedSerie] = useState<Serie | null>(null);
  const [allSeries, setAllSeries] = useState<Serie[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);

    // Verificar sesión activa
    const token = localStorage.getItem('wfl_token');
    const userData = localStorage.getItem('wfl_user');

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Cargar datos para todos los usuarios
      loadDashboardData(token);
    } else {
      // Si no hay sesión, redirigir al login
      window.location.href = '/';
    }
  }, []);

  const loadDashboardData = async (token: string) => {
    setLoading(true);
    try {
      const [seriesRes, equiposRes, jugadoresRes, allSeriesRes] = await Promise.all([
        axios.get('http://localhost:4000/api/series/latest', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:4000/api/equipos/with-series', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:4000/api/jugadores/with-details', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:4000/api/series', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setLatestSeries(seriesRes.data);
      setEquiposWithSeries(equiposRes.data);
      setJugadoresWithDetails(jugadoresRes.data);
      setAllSeries(allSeriesRes.data);
    } catch (error: any) {
      console.error('Error cargando datos del dashboard:', error);
      if (error.response?.status === 401) {
        // Token expirado o inválido
        localStorage.removeItem('wfl_token');
        localStorage.removeItem('wfl_user');
        window.location.href = '/';
      } else if (error.response?.status === 403) {
        // Sin permisos
        alert('No tienes permisos para acceder a esta información');
      } else {
        // Error general
        alert('Error al cargar los datos. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('wfl_token');
    localStorage.removeItem('wfl_user');
    window.location.href = '/';
  };

  const handleNavigateToStore = () => {
    // Placeholder para navegación a tienda
    alert('Funcionalidad de tienda próximamente');
  };

  const handleShowSeries = () => {
    setShowSeriesView(true);
  };

  const handleBackToHome = () => {
    setShowSeriesView(false);
    setShowSerieEquiposView(false);
    setSelectedSerie(null);
  };

  const handleShowSerieEquipos = (serie: Serie) => {
    setSelectedSerie(serie);
    setShowSerieEquiposView(true);
  };

  const handleBackToSeries = () => {
    setShowSerieEquiposView(false);
    setSelectedSerie(null);
  };

  const toggleUserDropdown = () => {
    setUserDropdownOpen(!userDropdownOpen);
  };

  // Ocultar footer si no hay sesión
  const shouldShowFooter = user !== null;

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{ backgroundColor: '#E7E6F7' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#26558D' }}></div>
          <p style={{ color: '#26558D' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ backgroundColor: '#E7E6F7' }}
    >
      {/* Vista de Equipos de una Serie */}
      {showSerieEquiposView && selectedSerie && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="min-h-screen relative">
            {/* Header de la vista de equipos */}
            <div className="bg-white shadow-lg border-b border-gray-200 p-4 sticky top-0 z-10">
              <div className="flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToSeries}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#26558D' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a Series
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#26558D' }}>
                      Equipos de {selectedSerie.nombre}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedSerie.equipos?.length || 0} equipos en esta serie
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido de equipos */}
            <div className="p-4 max-w-6xl mx-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#26558D' }}></div>
                  <p style={{ color: '#26558D' }}>Cargando equipos...</p>
                </div>
              ) : selectedSerie.equipos && selectedSerie.equipos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedSerie.equipos.map((equipo) => (
                    <div
                      key={equipo.id}
                      className="bg-white rounded-3xl shadow-2xl p-6 backdrop-blur-sm animate-fade-in border-2"
                      style={{
                        boxShadow: '0 20px 60px rgba(38, 85, 141, 0.2)',
                        borderColor: 'rgba(94, 205, 220, 0.2)',
                        animationDelay: `${Math.random() * 0.5}s`
                      }}
                    >
                      <div className="text-center mb-4">
                        <div
                          className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#F218FF' }}
                        >
                          <svg className="w-8 h-8" fill="none" stroke="white" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <h3
                          className="text-xl font-bold mb-2"
                          style={{ color: '#26558D' }}
                        >
                          {equipo.nombre}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2" style={{ color: '#26558D' }}>
                            Información:
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            {equipo.estadio && <p>Estadio: {equipo.estadio}</p>}
                            {equipo.ciudad && <p>Ciudad: {equipo.ciudad}</p>}
                            <p>Jugadores: {equipo.jugadores?.length || 0}</p>
                          </div>
                        </div>

                        {equipo.descripcion && (
                          <div>
                            <p className="text-sm font-medium mb-2" style={{ color: '#26558D' }}>
                              Descripción:
                            </p>
                            <p className="text-sm text-gray-600">
                              {equipo.descripcion}
                            </p>
                          </div>
                        )}

                        {equipo.jugadores && equipo.jugadores.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2" style={{ color: '#26558D' }}>
                              Jugadores destacados:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {equipo.jugadores.slice(0, 3).map((jugador) => (
                                <span
                                  key={jugador.id}
                                  className="text-xs px-2 py-1 rounded-full"
                                  style={{ backgroundColor: '#16FAD8', color: '#26558D' }}
                                >
                                  #{jugador.numeroCamiseta} {jugador.nombre}
                                </span>
                              ))}
                              {equipo.jugadores.length > 3 && (
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-200" style={{ color: '#26558D' }}>
                                  +{equipo.jugadores.length - 3} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div
                    className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#F218FF' }}
                  >
                    <svg className="w-12 h-12" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#26558D' }}>
                    No hay equipos en esta serie
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Esta serie aún no tiene equipos asignados.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-center gap-2 text-blue-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium">¡Mantente al pendiente!</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Los equipos serán agregados próximamente por el administrador.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Vista de Series para usuarios */}
      {showSeriesView && !showSerieEquiposView && (
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
          <div className="min-h-screen relative">
            {/* Header de la vista de series */}
            <div className="bg-white shadow-lg border-b border-gray-200 p-4 sticky top-0 z-10">
              <div className="flex items-center justify-between max-w-6xl mx-auto">
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleBackToHome}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
                    style={{ backgroundColor: '#26558D' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver
                  </button>
                  <h1 className="text-2xl font-bold" style={{ color: '#26558D' }}>
                    Series Disponibles
                  </h1>
                </div>
                <div className="text-sm text-gray-600">
                  Total: {allSeries.length} series
                </div>
              </div>
            </div>

            {/* Contenido de series */}
            <div className="p-4 max-w-6xl mx-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#26558D' }}></div>
                  <p style={{ color: '#26558D' }}>Cargando series...</p>
                </div>
              ) : allSeries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allSeries.map((serie) => (
                    <div
                      key={serie.id}
                      onClick={() => handleShowSerieEquipos(serie)}
                      className="bg-white rounded-3xl shadow-2xl p-6 backdrop-blur-sm animate-fade-in border-2 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-3xl"
                      style={{
                        boxShadow: '0 20px 60px rgba(38, 85, 141, 0.2)',
                        borderColor: 'rgba(94, 205, 220, 0.2)',
                        animationDelay: `${Math.random() * 0.5}s`
                      }}
                    >
                      <div className="text-center mb-4">
                        <div
                          className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: '#16FAD8' }}
                        >
                          <svg className="w-8 h-8" fill="none" stroke="#26558D" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <h3
                          className="text-xl font-bold mb-2"
                          style={{ color: '#26558D' }}
                        >
                          {serie.nombre}
                        </h3>
                        {serie.estado && (
                          <span
                            className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: serie.estado === 'activa' ? '#16FAD8' : '#F218FF',
                              color: '#26558D'
                            }}
                          >
                            {serie.estado}
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2" style={{ color: '#26558D' }}>
                            Descripción:
                          </p>
                          <p className="text-sm text-gray-600">
                            {serie.descripcion || 'Sin descripción disponible'}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-2" style={{ color: '#26558D' }}>
                            Información:
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Equipos: {serie.equipos?.length || 0}</p>
                            <p>Creada: {new Date(serie.createAt).toLocaleDateString()}</p>
                          </div>
                        </div>

                        {serie.equipos && serie.equipos.length > 0 && (
                          <div>
                            <p className="text-sm font-medium mb-2" style={{ color: '#26558D' }}>
                              Equipos participantes:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {serie.equipos.slice(0, 3).map((equipo) => (
                                <span
                                  key={equipo.id}
                                  className="text-xs px-2 py-1 rounded-full"
                                  style={{ backgroundColor: '#16FAD8', color: '#26558D' }}
                                >
                                  {equipo.nombre}
                                </span>
                              ))}
                              {serie.equipos.length > 3 && (
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-200" style={{ color: '#26558D' }}>
                                  +{serie.equipos.length - 3} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div
                    className="w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#F218FF' }}
                  >
                    <svg className="w-12 h-12" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#26558D' }}>
                    No hay series disponibles
                  </h3>
                  <p className="text-gray-600">
                    Las series aparecerán aquí cuando sean creadas por el administrador.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Sidebar izquierdo - Solo para admin */}
      {user?.role === 'admin' && (
        <div
          className="w-64 min-h-screen bg-white shadow-lg border-r border-gray-200 p-6 sidebar-mobile"
          style={{ backgroundColor: '#FFFFFF' }}
        >
        <div className="mb-8">
          <img
            src="/logos/LOGO_WFL.png"
            alt="Logo WFL"
            className="w-16 h-16 rounded-full shadow-lg object-cover mx-auto mb-4"
            style={{
              boxShadow: '0 8px 32px rgba(38, 85, 141, 0.4)'
            }}
          />
          <h2
            className="text-center text-lg font-bold"
            style={{ color: '#26558D' }}
          >
            Dashboard WFL
          </h2>
        </div>

        <nav className="space-y-4">
          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#16FAD8' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="#26558D" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-medium" style={{ color: '#26558D' }}>Series</span>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#F218FF' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="#26558D" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <span className="font-medium" style={{ color: '#26558D' }}>Equipos</span>
          </div>

          <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#5ECDDC' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="#26558D" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="font-medium" style={{ color: '#26558D' }}>Jugadores</span>
          </div>
        </nav>

      </div>
      )}

      {/* Contenido principal */}
      <div className={`${user?.role === 'admin' ? 'flex-1' : 'w-full'} flex flex-col items-center justify-center p-4 relative overflow-hidden`}>
        {/* Fondo animado con ondas */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg
            className="absolute bottom-0 left-0 w-full h-full opacity-20"
            viewBox="0 0 1200 800"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradientHome" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#26558D" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#16FAD8" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#F218FF" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              d="M0,400 Q300,300 600,400 T1200,400 L1200,800 L0,800 Z"
              fill="url(#waveGradientHome)"
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
          className={`w-full max-w-6xl relative z-10 transition-opacity duration-1000 container-responsive ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Header con logo */}
          <div className="flex justify-center items-center mb-8 header-responsive">
            <img
              src="/logos/LOGO_WFL.png"
              alt="Logo WFL"
              className="w-24 h-24 rounded-full shadow-lg object-cover animate-fade-in"
              style={{
                boxShadow: '0 8px 32px rgba(38, 85, 141, 0.4)'
              }}
            />
          </div>

          {/* Contenido principal */}
          <div className="w-full max-w-6xl mx-auto">
            {/* Dashboard con 3 rectángulos - Solo para admin */}
            {user?.role === 'admin' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 dashboard-grid">
                {/* Rectángulo 1: Últimas 3 Series */}
                <div
                  className="bg-white rounded-3xl shadow-2xl p-6 backdrop-blur-sm animate-fade-in"
                  style={{
                    boxShadow: '0 20px 60px rgba(38, 85, 141, 0.2)',
                    border: '1px solid rgba(94, 205, 220, 0.2)',
                    animationDelay: '0.4s'
                  }}
                >
                  <div className="text-center mb-4">
                    <div
                      className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#16FAD8' }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="#26558D" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ color: '#26558D' }}
                    >
                      Últimas Series
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto mb-2" style={{ borderColor: '#26558D' }}></div>
                        <p style={{ color: '#5ECDDC' }}>Cargando...</p>
                      </div>
                    ) : latestSeries.length > 0 ? (
                      latestSeries.map((serie, index) => (
                        <div key={serie.id} className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-semibold text-sm" style={{ color: '#26558D' }}>
                            {serie.nombre}
                          </h4>
                          <p className="text-xs" style={{ color: '#5ECDDC' }}>
                            {serie.temporada || 'Sin temporada'} • {serie.equipos.length} equipos
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm" style={{ color: '#5ECDDC' }}>
                        No hay series disponibles
                      </p>
                    )}
                  </div>
                </div>

                {/* Rectángulo 2: Equipos con Series */}
                <div
                  className="bg-white rounded-3xl shadow-2xl p-6 backdrop-blur-sm animate-fade-in"
                  style={{
                    boxShadow: '0 20px 60px rgba(38, 85, 141, 0.2)',
                    border: '1px solid rgba(94, 205, 220, 0.2)',
                    animationDelay: '0.6s'
                  }}
                >
                  <div className="text-center mb-4">
                    <div
                      className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#F218FF' }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="#26558D" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ color: '#26558D' }}
                    >
                      Equipos y Series
                    </h3>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto mb-2" style={{ borderColor: '#26558D' }}></div>
                        <p style={{ color: '#5ECDDC' }}>Cargando...</p>
                      </div>
                    ) : equiposWithSeries.length > 0 ? (
                      equiposWithSeries.map((equipo) => (
                        <div key={equipo.id} className="bg-gray-50 rounded-lg p-3">
                          <h4 className="font-semibold text-sm" style={{ color: '#26558D' }}>
                            {equipo.nombre}
                          </h4>
                          <p className="text-xs" style={{ color: '#5ECDDC' }}>
                            {equipo.series.length} series • {equipo.jugadores.length} jugadores
                          </p>
                          {equipo.series.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium" style={{ color: '#F218FF' }}>
                                Series:
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {equipo.series.slice(0, 2).map((serie) => (
                                  <span
                                    key={serie.id}
                                    className="text-xs px-2 py-1 rounded-full"
                                    style={{ backgroundColor: '#16FAD8', color: '#26558D' }}
                                  >
                                    {serie.nombre}
                                  </span>
                                ))}
                                {equipo.series.length > 2 && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-200" style={{ color: '#26558D' }}>
                                    +{equipo.series.length - 2}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm" style={{ color: '#5ECDDC' }}>
                        No hay equipos disponibles
                      </p>
                    )}
                  </div>
                </div>

                {/* Rectángulo 3: Jugadores */}
                <div
                  className="bg-white rounded-3xl shadow-2xl p-6 backdrop-blur-sm animate-fade-in"
                  style={{
                    boxShadow: '0 20px 60px rgba(38, 85, 141, 0.2)',
                    border: '1px solid rgba(94, 205, 220, 0.2)',
                    animationDelay: '0.8s'
                  }}
                >
                  <div className="text-center mb-4">
                    <div
                      className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#5ECDDC' }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="#26558D" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ color: '#26558D' }}
                    >
                      Jugadores Recientes
                    </h3>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 mx-auto mb-2" style={{ borderColor: '#26558D' }}></div>
                        <p style={{ color: '#5ECDDC' }}>Cargando...</p>
                      </div>
                    ) : jugadoresWithDetails.length > 0 ? (
                      jugadoresWithDetails.slice(0, 5).map((jugador) => (
                        <div key={jugador.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold text-sm" style={{ color: '#26558D' }}>
                                {jugador.nombre}
                              </h4>
                              <p className="text-xs" style={{ color: '#5ECDDC' }}>
                                #{jugador.numeroCamiseta} • {jugador.posicion}
                              </p>
                              {jugador.equipo && (
                                <p className="text-xs font-medium" style={{ color: '#F218FF' }}>
                                  {jugador.equipo.nombre}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              {jugador.equipo?.series && jugador.equipo.series.length > 0 && (
                                <span
                                  className="text-xs px-2 py-1 rounded-full"
                                  style={{ backgroundColor: '#16FAD8', color: '#26558D' }}
                                >
                                  {jugador.equipo.series[0].nombre}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-sm" style={{ color: '#5ECDDC' }}>
                        No hay jugadores disponibles
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="text-center mb-8">
              <h1
                className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in text-responsive"
                style={{
                  color: '#26558D',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '0.1em',
                  textShadow: '0 2px 10px rgba(22, 250, 216, 0.4)',
                  fontWeight: 800
                }}
              >
                ¡Bienvenido a WFL!
              </h1>
              <p
                className="text-lg md:text-xl mb-6 animate-fade-in text-responsive-lg"
                style={{
                  color: '#5ECDDC',
                  fontWeight: 600,
                  animationDelay: '0.2s'
                }}
              >
                Hola {user?.name}, estás en la plataforma de fútbol más emocionante
              </p>
            </div>

            {/* Decoración inferior */}
            <div className="flex justify-center gap-3 mt-8">
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
      </div>

      {/* Footer con navegación móvil */}
      {shouldShowFooter && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-4 pt-3 footer-mobile"
          style={{
            background: 'linear-gradient(to top, rgba(231, 230, 247, 0.95), transparent)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="max-w-md mx-auto flex justify-around items-center relative">
            {/* Ícono Home */}
            <button
              className="flex flex-col items-center gap-1 transition-transform duration-200 hover:scale-110"
              style={{ color: '#16FAD8' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs font-medium">Home</span>
            </button>

            {/* Ícono Series */}
            <button
              onClick={handleShowSeries}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-xs font-medium">Series</span>
            </button>

            {/* Ícono Tienda */}
            <button
              onClick={handleNavigateToStore}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="text-xs font-medium">Tienda</span>
            </button>

            {/* Ícono Usuario con Dropdown */}
            <div className="relative">
              <button
                onClick={toggleUserDropdown}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-medium">Usuario</span>
              </button>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div
                  className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-48 z-30"
                  style={{
                    boxShadow: '0 10px 25px rgba(38, 85, 141, 0.15)',
                    border: '1px solid rgba(94, 205, 220, 0.2)'
                  }}
                >
                  {/* Opción Perfil */}
                  <button
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3"
                    style={{ color: '#26558D' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium">Perfil</span>
                  </button>

                  {/* Separador */}
                  <div className="border-t border-gray-100 my-1"></div>

                  {/* Opción Cerrar Sesión */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left hover:bg-red-50 transition-colors flex items-center gap-3"
                    style={{ color: '#F218FF' }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}