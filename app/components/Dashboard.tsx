'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export default function Dashboard() {
    const [user, setUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState<'inicio' | 'series' | 'equipos' | 'jugadores' | 'usuarios' | 'modificar-series' | 'modificar-equipos' | 'modificar-jugadores' | 'modificar-usuarios' | 'editar-serie' | 'editar-equipo' | 'editar-jugador' | 'editar-usuario'>('inicio');
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState('');
     const [success, setSuccess] = useState('');
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para formularios
  const [serieForm, setSerieForm] = useState({ nombre: '', descripcion: '', estado: '' });
  const [equipoForm, setEquipoForm] = useState({ nombre: '', descripcion: '', estadio: '', ciudad: '', serieId: '' });
  const [jugadorForm, setJugadorForm] = useState({
    nombre: '',
    numeroCamiseta: '',
    posicion: '',
    fechaNacimiento: '',
    nacionalidad: '',
    descripcion: '',
    estatura: '',
    peso: '',
    posicionSecundaria1: '',
    posicionSecundaria2: '',
    rareza: '',
    equipoId: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [jugadores, setJugadores] = useState<any[]>([]);
  const [editingSerie, setEditingSerie] = useState<any>(null);
  const [editSerieForm, setEditSerieForm] = useState({ nombre: '', descripcion: '', estado: '' });
  const [editingEquipo, setEditingEquipo] = useState<any>(null);
  const [editEquipoForm, setEditEquipoForm] = useState({ nombre: '', descripcion: '', estadio: '', ciudad: '', serieId: '' });
  const [editingJugador, setEditingJugador] = useState<any>(null);
  const [editJugadorForm, setEditJugadorForm] = useState({
    nombre: '',
    numeroCamiseta: '',
    posicion: '',
    fechaNacimiento: '',
    nacionalidad: '',
    descripcion: '',
    estatura: '',
    peso: '',
    posicionSecundaria1: '',
    posicionSecundaria2: '',
    rareza: '',
    equipoId: ''
  });
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [usuarioForm, setUsuarioForm] = useState({ email: '', name: '', role: '' });
  const [editingUsuario, setEditingUsuario] = useState<any>(null);
  const [editUsuarioForm, setEditUsuarioForm] = useState({ email: '', name: '', role: '' });

  // Estados para estadísticas del dashboard
  const [stats, setStats] = useState({
    series: 0,
    equipos: 0,
    jugadores: 0
  });

  // Estados de paginación
  const [currentPageSeries, setCurrentPageSeries] = useState(1);
  const [currentPageEquipos, setCurrentPageEquipos] = useState(1);
  const [currentPageJugadores, setCurrentPageJugadores] = useState(1);
  const [currentPageUsuarios, setCurrentPageUsuarios] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem('wfl_token');
    const userData = localStorage.getItem('wfl_user');

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // Verificar si es admin
      if (parsedUser.role !== 'admin') {
        // Redirigir o mostrar mensaje de no autorizado
        setError('No tienes permisos para acceder a esta página');
      }

      // Cargar equipos para el selector
      fetchEquipos(token);
      fetchSeries(token);
      fetchJugadores(token);
      fetchUsuarios(token);
      fetchStats(token);
    } else {
      // Redirigir al login
      window.location.href = '/';
    }
  }, []);

  const fetchEquipos = async (token: string) => {
    try {
      console.log('Cargando equipos desde API...');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/equipos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Equipos obtenidos:', response.data);
      setEquipos(response.data);
    } catch (err) {
      console.error('Error al cargar equipos:', err);
    }
  };

  const fetchSeries = async (token: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/series`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSeries(response.data);
    } catch (err) {
      console.error('Error al cargar series:', err);
    }
  };

  const fetchJugadores = async (token: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/jugadores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJugadores(response.data);
    } catch (err) {
      console.error('Error al cargar jugadores:', err);
    }
  };

  const fetchUsuarios = async (token: string) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(response.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  const fetchStats = async (token: string) => {
    try {
      const [seriesRes, equiposRes, jugadoresRes] = await Promise.all([
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/series/count`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/equipos/count`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/jugadores/count`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats({
        series: seriesRes.data,
        equipos: equiposRes.data,
        jugadores: jugadoresRes.data
      });
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
    }
  };

  const handleCreateSerie = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      const createData = {
        ...serieForm
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/series`, createData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSerieForm({ nombre: '', descripcion: '', estado: '' });
      setSuccess('Serie creada exitosamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear serie');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      const createData = {
        ...equipoForm,
        serieId: equipoForm.serieId ? parseInt(equipoForm.serieId) : undefined
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/equipos`, createData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEquipoForm({ nombre: '', descripcion: '', estadio: '', ciudad: '', serieId: '' });
      setSuccess('Equipo creado exitosamente');

      // Recargar la lista de equipos para que aparezcan en el selector de jugadores
      if (token) {
        fetchEquipos(token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreview = () => {
    setPreviewModalOpen(true);
  };

  const handleConfirmCreate = async () => {
    setPreviewModalOpen(false);
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      const formData = new FormData();

      // Agregar campos de texto
      Object.entries(jugadorForm).forEach(([key, value]) => {
        if (key !== 'imagen' && value !== null && value !== '') {
          if (key === 'numeroCamiseta' || key === 'estatura' || key === 'peso' || key === 'equipoId') {
            formData.append(key, value.toString());
          } else {
            formData.append(key, value);
          }
        }
      });

      // Agregar imagen si existe
      if (imageFile) {
        formData.append('imagen', imageFile);
      }

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/jugadores`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setJugadorForm({
        nombre: '',
        numeroCamiseta: '',
        posicion: '',
        fechaNacimiento: '',
        nacionalidad: '',
        descripcion: '',
        estatura: '',
        peso: '',
        posicionSecundaria1: '',
        posicionSecundaria2: '',
        rareza: '',
        equipoId: ''
      });
      setImageFile(null);
      setImagePreview(null);
      setSuccess('Jugador creado exitosamente');

      // Recargar la lista de jugadores para mostrar el nuevo
      if (token) {
        fetchJugadores(token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear jugador');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    handlePreview();
  };

  const handleLogout = () => {
    localStorage.removeItem('wfl_token');
    localStorage.removeItem('wfl_user');
    window.location.href = '/';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/jugadores/import-excel`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setSuccess('Jugadores importados exitosamente desde Excel');
      setJugadorForm({
        nombre: '',
        numeroCamiseta: '',
        posicion: '',
        fechaNacimiento: '',
        nacionalidad: '',
        descripcion: '',
        estatura: '',
        peso: '',
        posicionSecundaria1: '',
        posicionSecundaria2: '',
        rareza: '',
        equipoId: ''
      });
      setImageFile(null);
      // Recargar la lista de jugadores
      if (token) {
        fetchJugadores(token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al importar desde Excel');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEditSerie = async (serie: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('wfl_token');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/series/${serie.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const serieData = response.data;
      setEditingSerie(serieData);
      setEditSerieForm({
        nombre: serieData.nombre,
        descripcion: serieData.descripcion || '',
        estado: serieData.estado || ''
      });
      setActiveTab('editar-serie');
    } catch (err: any) {
      console.error('Error al cargar serie:', err);
      setError(err.response?.data?.message || 'Error al cargar la serie');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSerie = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      const updateData: any = {
        nombre: editSerieForm.nombre,
        descripcion: editSerieForm.descripcion || null,
        estado: editSerieForm.estado || null
      };

      console.log('Datos a enviar:', updateData); // Para debugging

      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/series/${editingSerie.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Serie actualizada exitosamente');
      setActiveTab('modificar-series');
      setEditingSerie(null);
      setEditSerieForm({ nombre: '', descripcion: '', estado: '' });

      // Recargar series
      if (token) {
        fetchSeries(token);
      }
    } catch (err: any) {
      console.error('Error al actualizar serie:', err.response?.data);
      setError(err.response?.data?.message || 'Error al actualizar serie');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSerie = async (serieId: number, serieNombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la serie "${serieNombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/series/${serieId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Serie eliminada exitosamente');

      // Recargar series
      if (token) {
        fetchSeries(token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar serie');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEquipo = (equipo: any) => {
    setEditingEquipo(equipo);
    setEditEquipoForm({
      nombre: equipo.nombre,
      descripcion: equipo.descripcion || '',
      estadio: equipo.estadio || '',
      ciudad: equipo.ciudad || '',
      serieId: equipo.serieId?.toString() || ''
    });
    setActiveTab('editar-equipo');
  };

  const handleUpdateEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      const updateData: any = {
        nombre: editEquipoForm.nombre,
        descripcion: editEquipoForm.descripcion || null,
        estadio: editEquipoForm.estadio || null,
        ciudad: editEquipoForm.ciudad || null,
        serieId: editEquipoForm.serieId ? parseInt(editEquipoForm.serieId) : null
      };

      console.log('Datos a enviar:', updateData); // Para debugging

      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/equipos/${editingEquipo.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Equipo actualizado exitosamente');
      setActiveTab('modificar-equipos');
      setEditingEquipo(null);
      setEditEquipoForm({ nombre: '', descripcion: '', estadio: '', ciudad: '', serieId: '' });

      // Recargar equipos
      if (token) {
        fetchEquipos(token);
      }
    } catch (err: any) {
      console.error('Error al actualizar equipo:', err.response?.data);
      setError(err.response?.data?.message || 'Error al actualizar equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEquipo = async (equipoId: number, equipoNombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el equipo "${equipoNombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/equipos/${equipoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Equipo eliminado exitosamente');

      // Recargar equipos
      if (token) {
        fetchEquipos(token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar equipo');
    } finally {
      setLoading(false);
    }
  };

  const handleEditJugador = async (jugador: any) => {
    console.log('Editando jugador:', jugador);
    console.log('Equipo ID del jugador:', jugador.equipoId);
    console.log('Equipos disponibles:', equipos);

    // Recargar equipos si no están cargados
    if (equipos.length === 0) {
      console.log('Recargando equipos...');
      const token = localStorage.getItem('wfl_token');
      if (token) {
        await fetchEquipos(token);
        console.log('Equipos recargados:', equipos);
      }
    }

    setEditingJugador(jugador);
    setEditJugadorForm({
      nombre: jugador.nombre || '',
      numeroCamiseta: jugador.numeroCamiseta?.toString() || '',
      posicion: jugador.posicion || '',
      fechaNacimiento: jugador.fechaNacimiento ? new Date(jugador.fechaNacimiento).toISOString().split('T')[0] : '',
      nacionalidad: jugador.nacionalidad || '',
      descripcion: jugador.descripcion || '',
      estatura: jugador.estatura?.toString() || '',
      peso: jugador.peso?.toString() || '',
      posicionSecundaria1: jugador.posicionSecundaria1 || '',
      posicionSecundaria2: jugador.posicionSecundaria2 || '',
      rareza: jugador.rareza || '',
      equipoId: jugador.equipoId?.toString() || ''
    });
    console.log('Equipo ID seteado en form:', jugador.equipoId?.toString() || '');
    setEditImageFile(null);
    setEditImagePreview(jugador.imagenUrl || null);
    setActiveTab('editar-jugador');
  };

  const handleUpdateJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');

      if (editImageFile) {
        // Si hay imagen, usar FormData
        const formData = new FormData();

        // Agregar campos de texto
        Object.entries(editJugadorForm).forEach(([key, value]) => {
          if (value !== null && value !== '') {
            if (key === 'numeroCamiseta' || key === 'estatura' || key === 'peso' || key === 'equipoId') {
              formData.append(key, value.toString());
            } else if (key === 'fechaNacimiento' && typeof value === 'string') {
              formData.append(key, value ? new Date(value).toISOString() : '');
            } else if (typeof value === 'string') {
              formData.append(key, value);
            }
          }
        });

        // Agregar imagen
        formData.append('imagen', editImageFile);

        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/jugadores/${editingJugador.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Sin imagen, enviar JSON normal
        const updateData = {
          ...editJugadorForm,
          fechaNacimiento: editJugadorForm.fechaNacimiento ? new Date(editJugadorForm.fechaNacimiento).toISOString() : undefined,
          estatura: editJugadorForm.estatura ? parseFloat(editJugadorForm.estatura) : undefined,
          peso: editJugadorForm.peso ? parseFloat(editJugadorForm.peso) : undefined,
          equipoId: editJugadorForm.equipoId ? parseInt(editJugadorForm.equipoId) : undefined
        };

        await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/jugadores/${editingJugador.id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setSuccess('Jugador actualizado exitosamente');
      setActiveTab('modificar-jugadores');
      setEditingJugador(null);
      setEditJugadorForm({
        nombre: '',
        numeroCamiseta: '',
        posicion: '',
        fechaNacimiento: '',
        nacionalidad: '',
        descripcion: '',
        estatura: '',
        peso: '',
        posicionSecundaria1: '',
        posicionSecundaria2: '',
        rareza: '',
        equipoId: ''
      });
      setEditImageFile(null);
      setEditImagePreview(null);

      // Recargar jugadores
      if (token) {
        fetchJugadores(token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar jugador');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJugador = async (jugadorId: number, jugadorNombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar al jugador "${jugadorNombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/jugadores/${jugadorId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Jugador eliminado exitosamente');

      // Recargar jugadores
      if (token) {
        fetchJugadores(token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar jugador');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      const createData = {
        ...usuarioForm
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/usuarios`, createData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsuarioForm({ email: '', name: '', role: '' });
      setSuccess('Usuario creado exitosamente');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUsuario = (usuario: any) => {
    setEditingUsuario(usuario);
    setEditUsuarioForm({
      email: usuario.email,
      name: usuario.name,
      role: usuario.role
    });
    setActiveTab('editar-usuario');
  };

  const handleUpdateUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      const updateData: any = {
        email: editUsuarioForm.email,
        name: editUsuarioForm.name,
        role: editUsuarioForm.role
      };

      await axios.patch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/usuarios/${editingUsuario.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Usuario actualizado exitosamente');
      setActiveTab('modificar-usuarios');
      setEditingUsuario(null);
      setEditUsuarioForm({ email: '', name: '', role: '' });

      // Recargar usuarios
      if (token) {
        fetchUsuarios(token);
      }
    } catch (err: any) {
      console.error('Error al actualizar usuario:', err.response?.data);
      setError(err.response?.data?.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUsuario = async (usuarioId: number, usuarioEmail: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario "${usuarioEmail}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('wfl_token');
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/usuarios/${usuarioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Usuario eliminado exitosamente');

      // Recargar usuarios
      if (token) {
        fetchUsuarios(token);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E7E6F7' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#26558D' }}></div>
          <p style={{ color: '#26558D' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E7E6F7' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#26558D' }}>Acceso Denegado</h1>
          <p style={{ color: '#F218FF' }}>{error}</p>
          <button
            onClick={handleLogout}
            className="mt-4 px-6 py-2 rounded-lg font-semibold text-white"
            style={{ backgroundColor: '#26558D' }}
          >
            Volver al Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#E7E6F7' }}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-center" style={{ color: '#26558D' }}>Menú Admin</h2>
        </div>
        <nav className="mt-8 px-2">
           <button
             onClick={() => {
               setActiveTab('inicio');
               setSidebarOpen(false);
               setError('');
               setSuccess('');
             }}
             className={`w-full flex items-center px-4 py-3 text-left transition-colors rounded-lg mb-2 ${
               activeTab === 'inicio' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-50'
             }`}
             style={activeTab === 'inicio' ? { color: '#26558D' } : { color: '#666' }}
           >
             <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
             </svg>
             <span className="text-sm">Inicio</span>
           </button>
           <button
             onClick={() => {
               setActiveTab('series');
               setSidebarOpen(false);
               setError('');
               setSuccess('');
             }}
             className={`w-full flex items-center px-4 py-3 text-left transition-colors rounded-lg mb-2 ${
               activeTab === 'series' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-50'
             }`}
             style={activeTab === 'series' ? { color: '#26558D' } : { color: '#666' }}
           >
             <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
             </svg>
             <span className="text-sm">Crear Serie</span>
           </button>
          <button
            onClick={() => {
              setActiveTab('equipos');
              setSidebarOpen(false);
              setError('');
              setSuccess('');
            }}
            className={`w-full flex items-center px-4 py-3 text-left transition-colors rounded-lg mb-2 ${
              activeTab === 'equipos' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-50'
            }`}
            style={activeTab === 'equipos' ? { color: '#26558D' } : { color: '#666' }}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-sm">Crear Equipo</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('jugadores');
              setSidebarOpen(false);
              setError('');
              setSuccess('');
            }}
            className={`w-full flex items-center px-4 py-3 text-left transition-colors rounded-lg mb-2 ${
              activeTab === 'jugadores' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-50'
            }`}
            style={activeTab === 'jugadores' ? { color: '#26558D' } : { color: '#666' }}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm">Crear Jugador</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('modificar-series');
              setSidebarOpen(false);
              setError('');
              setSuccess('');
              setCurrentPageSeries(1);
            }}
            className={`w-full flex items-center px-4 py-3 text-left transition-colors rounded-lg mb-2 ${
              activeTab === 'modificar-series' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-50'
            }`}
            style={activeTab === 'modificar-series' ? { color: '#26558D' } : { color: '#666' }}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm">Modificar Serie</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('modificar-equipos');
              setSidebarOpen(false);
              setError('');
              setSuccess('');
              setCurrentPageEquipos(1);
            }}
            className={`w-full flex items-center px-4 py-3 text-left transition-colors rounded-lg mb-2 ${
              activeTab === 'modificar-equipos' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-50'
            }`}
            style={activeTab === 'modificar-equipos' ? { color: '#26558D' } : { color: '#666' }}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm">Modificar Equipo</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('modificar-jugadores');
              setSidebarOpen(false);
              setError('');
              setSuccess('');
              setCurrentPageJugadores(1);
            }}
            className={`w-full flex items-center px-4 py-3 text-left transition-colors rounded-lg mb-2 ${
              activeTab === 'modificar-jugadores' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-50'
            }`}
            style={activeTab === 'modificar-jugadores' ? { color: '#26558D' } : { color: '#666' }}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm">Modificar Jugador</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('usuarios');
              setSidebarOpen(false);
              setError('');
              setSuccess('');
            }}
            className={`w-full flex items-center px-4 py-3 text-left transition-colors rounded-lg mb-2 ${
              activeTab === 'usuarios' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-50'
            }`}
            style={activeTab === 'usuarios' ? { color: '#26558D' } : { color: '#666' }}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            <span className="text-sm">Crear Usuario</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('modificar-usuarios');
              setSidebarOpen(false);
              setError('');
              setSuccess('');
              setCurrentPageUsuarios(1);
            }}
            className={`w-full flex items-center px-4 py-3 text-left transition-colors rounded-lg mb-2 ${
              activeTab === 'modificar-usuarios' ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-50'
            }`}
            style={activeTab === 'modificar-usuarios' ? { color: '#26558D' } : { color: '#666' }}
          >
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm">Modificar Usuario</span>
          </button>
        </nav>
      </div>

      {/* Overlay para cerrar sidebar en móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                {/* Botón menú móvil */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden mr-4 p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Logo y título */}
                <div className="flex items-center">
                  <img
                    src="/logos/LOGO_WFL.png"
                    alt="Logo WFL"
                    className="w-8 h-8 mr-3"
                  />
                  <h1 className="text-lg sm:text-xl font-bold" style={{ color: '#26558D' }}>
                    <span className="hidden sm:inline">Waifu Football League</span>
                    <span className="sm:hidden">WFL</span>
                  </h1>
                </div>
              </div>

              {/* Menú de perfil */}
              <div className="flex items-center relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <img
                    src="/logos/LOGO_WFL.png"
                    alt="Perfil"
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="hidden sm:inline text-sm" style={{ color: '#26558D' }}>{user.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menú */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        // TODO: Implementar cambio de contraseña
                        alert('Funcionalidad de cambio de contraseña próximamente');
                        setProfileMenuOpen(false);
                      }}
                    >
                      Cambiar Contraseña
                    </button>
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        handleLogout();
                        setProfileMenuOpen(false);
                      }}
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

      {/* Contenido principal */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* Mensaje de éxito */}
          {success && (
            <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-green-600">{success}</p>
            </div>
          )}

          {/* Vista de Inicio/Dashboard */}
          {activeTab === 'inicio' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-6" style={{ color: '#26558D' }}>
                Panel de Control - Waifu Football League
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#26558D' }}></div>
                  <p style={{ color: '#5ECDDC' }}>Cargando estadísticas...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Card Series */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Series</h3>
                        <p className="text-3xl font-bold">{stats.series}</p>
                        <p className="text-blue-100 text-sm">Total creadas</p>
                      </div>
                      <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Card Equipos */}
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Equipos</h3>
                        <p className="text-3xl font-bold">{stats.equipos}</p>
                        <p className="text-green-100 text-sm">Total registrados</p>
                      </div>
                      <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Card Jugadores */}
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Jugadores</h3>
                        <p className="text-3xl font-bold">{stats.jugadores}</p>
                        <p className="text-purple-100 text-sm">Total registrados</p>
                      </div>
                      <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="mt-8 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4" style={{ color: '#26558D' }}>
                  Información del Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Usuario actual:</p>
                    <p className="font-medium" style={{ color: '#26558D' }}>{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rol:</p>
                    <p className="font-medium" style={{ color: '#26558D' }}>{user?.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última actualización:</p>
                    <p className="font-medium" style={{ color: '#26558D' }}>{new Date().toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Estado del sistema:</p>
                    <p className="font-medium text-green-600">Activo</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formularios */}
          {activeTab === 'modificar-series' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4" style={{ color: '#26558D' }}>
                Modificar Series
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Aquí podrás ver, editar y eliminar las series creadas.
              </p>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#26558D' }}></div>
                  <p style={{ color: '#5ECDDC' }}>Cargando series...</p>
                </div>
              ) : series.length > 0 ? (
                 <>
                   <div className="space-y-4">
                     {series.slice((currentPageSeries - 1) * itemsPerPage, currentPageSeries * itemsPerPage).map((serie) => (
                       <div key={serie.id} className="border border-gray-200 rounded-lg p-4">
                         <div className="flex justify-between items-start">
                           <div>
                             <h3 className="font-semibold text-lg" style={{ color: '#26558D' }}>
                               {serie.nombre}
                             </h3>
                             <p className="text-sm text-gray-600 mt-1">
                               {serie.descripcion || 'Sin descripción'}
                             </p>
                             <p className="text-xs text-gray-500 mt-2">
                               Creada: {new Date(serie.createAt).toLocaleDateString()}
                             </p>
                           </div>
                           <div className="flex gap-2">
                             <button
                               className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                               style={{ backgroundColor: '#16FAD8', color: '#26558D' }}
                               onClick={() => handleEditSerie(serie)}
                             >
                               Editar
                             </button>
                             <button
                               className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                               style={{ backgroundColor: '#F218FF' }}
                               onClick={() => handleDeleteSerie(serie.id, serie.nombre)}
                             >
                               Eliminar
                             </button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* Paginación para series */}
                   {series.length > itemsPerPage && (
                     <div className="flex justify-center items-center mt-6 space-x-2">
                       <button
                         onClick={() => setCurrentPageSeries(Math.max(1, currentPageSeries - 1))}
                         disabled={currentPageSeries === 1}
                         className="px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                         style={{ backgroundColor: '#26558D', color: 'white' }}
                       >
                         Anterior
                       </button>

                       <span className="text-sm text-gray-600">
                         Página {currentPageSeries} de {Math.ceil(series.length / itemsPerPage)}
                       </span>

                       <button
                         onClick={() => setCurrentPageSeries(Math.min(Math.ceil(series.length / itemsPerPage), currentPageSeries + 1))}
                         disabled={currentPageSeries === Math.ceil(series.length / itemsPerPage)}
                         className="px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                         style={{ backgroundColor: '#26558D', color: 'white' }}
                       >
                         Siguiente
                       </button>
                     </div>
                   )}
                 </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay series creadas aún.</p>
                  <button
                    onClick={() => setActiveTab('series')}
                    className="mt-4 px-4 py-2 rounded-lg font-semibold text-white"
                    style={{ backgroundColor: '#26558D' }}
                  >
                    Crear Primera Serie
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'modificar-equipos' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4" style={{ color: '#26558D' }}>
                Modificar Equipos
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Aquí podrás ver, editar y eliminar los equipos creados.
              </p>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#26558D' }}></div>
                  <p style={{ color: '#5ECDDC' }}>Cargando equipos...</p>
                </div>
              ) : equipos.length > 0 ? (
                 <>
                   <div className="space-y-4">
                     {equipos.slice((currentPageEquipos - 1) * itemsPerPage, currentPageEquipos * itemsPerPage).map((equipo) => (
                       <div key={equipo.id} className="border border-gray-200 rounded-lg p-4">
                         <div className="flex justify-between items-start">
                           <div>
                             <h3 className="font-semibold text-lg" style={{ color: '#26558D' }}>
                               {equipo.nombre}
                             </h3>
                             <p className="text-sm text-gray-600 mt-1">
                               {equipo.descripcion || 'Sin descripción'}
                             </p>
                             <p className="text-xs text-gray-500 mt-2">
                               Jugadores: {equipo.jugadores?.length || 0}
                             </p>
                           </div>
                           <div className="flex gap-2">
                             <button
                               className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                               style={{ backgroundColor: '#16FAD8', color: '#26558D' }}
                               onClick={() => handleEditEquipo(equipo)}
                             >
                               Editar
                             </button>
                             <button
                               className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                               style={{ backgroundColor: '#F218FF' }}
                               onClick={() => handleDeleteEquipo(equipo.id, equipo.nombre)}
                             >
                               Eliminar
                             </button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* Paginación para equipos */}
                   {equipos.length > itemsPerPage && (
                     <div className="flex justify-center items-center mt-6 space-x-2">
                       <button
                         onClick={() => setCurrentPageEquipos(Math.max(1, currentPageEquipos - 1))}
                         disabled={currentPageEquipos === 1}
                         className="px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                         style={{ backgroundColor: '#26558D', color: 'white' }}
                       >
                         Anterior
                       </button>

                       <span className="text-sm text-gray-600">
                         Página {currentPageEquipos} de {Math.ceil(equipos.length / itemsPerPage)}
                       </span>

                       <button
                         onClick={() => setCurrentPageEquipos(Math.min(Math.ceil(equipos.length / itemsPerPage), currentPageEquipos + 1))}
                         disabled={currentPageEquipos === Math.ceil(equipos.length / itemsPerPage)}
                         className="px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                         style={{ backgroundColor: '#26558D', color: 'white' }}
                       >
                         Siguiente
                       </button>
                     </div>
                   )}
                 </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay equipos creados aún.</p>
                  <button
                    onClick={() => setActiveTab('equipos')}
                    className="mt-4 px-4 py-2 rounded-lg font-semibold text-white"
                    style={{ backgroundColor: '#26558D' }}
                  >
                    Crear Primer Equipo
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'modificar-jugadores' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4" style={{ color: '#26558D' }}>
                Modificar Jugadores
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Aquí podrás ver, editar y eliminar los jugadores creados.
              </p>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#26558D' }}></div>
                  <p style={{ color: '#5ECDDC' }}>Cargando jugadores...</p>
                </div>
              ) : jugadores.length > 0 ? (
                 <>
                   <div className="space-y-4">
                     {jugadores.slice((currentPageJugadores - 1) * itemsPerPage, currentPageJugadores * itemsPerPage).map((jugador) => (
                       <div key={jugador.id} className="border border-gray-200 rounded-lg p-4">
                         <div className="flex justify-between items-start">
                           <div className="flex items-start gap-4 flex-1">
                             {/* Imagen del jugador */}
                             <div className="flex-shrink-0">
                               {jugador.imagenUrl ? (
                                 <img
                                   src={jugador.imagenUrl}
                                   alt={jugador.nombre}
                                   className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                                 />
                               ) : (
                                 <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                                   <span className="text-gray-500 text-sm">Sin imagen</span>
                                 </div>
                               )}
                             </div>

                             {/* Información del jugador */}
                             <div className="flex-1">
                               <h3 className="font-semibold text-lg" style={{ color: '#26558D' }}>
                                 {jugador.nombre}
                               </h3>
                               <p className="text-sm text-gray-600 mb-2">
                                 #{jugador.numeroCamiseta} • {jugador.posicion}
                               </p>
                               <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                                 <span>Equipo: {jugador.equipo?.nombre || 'Sin equipo'}</span>
                                 <span>Serie: {jugador.equipo?.series && jugador.equipo.series.length > 0 ? jugador.equipo.series[0].nombre : 'Sin serie'}</span>
                                 <span>Rareza: {jugador.rareza}</span>
                                 <span>Nacionalidad: {jugador.nacionalidad}</span>
                                 <span>Edad: {jugador.fechaNacimiento ? new Date().getFullYear() - new Date(jugador.fechaNacimiento).getFullYear() : 'N/A'} años</span>
                               </div>
                             </div>
                           </div>

                           {/* Botones de acción */}
                           <div className="flex gap-2 ml-4">
                             <button
                               className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                               style={{ backgroundColor: '#16FAD8', color: '#26558D' }}
                               onClick={() => handleEditJugador(jugador)}
                             >
                               Editar
                             </button>
                             <button
                               className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                               style={{ backgroundColor: '#F218FF' }}
                               onClick={() => handleDeleteJugador(jugador.id, jugador.nombre)}
                             >
                               Eliminar
                             </button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* Paginación para jugadores */}
                   {jugadores.length > itemsPerPage && (
                     <div className="flex justify-center items-center mt-6 space-x-2">
                       <button
                         onClick={() => setCurrentPageJugadores(Math.max(1, currentPageJugadores - 1))}
                         disabled={currentPageJugadores === 1}
                         className="px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                         style={{ backgroundColor: '#26558D', color: 'white' }}
                       >
                         Anterior
                       </button>

                       <span className="text-sm text-gray-600">
                         Página {currentPageJugadores} de {Math.ceil(jugadores.length / itemsPerPage)}
                       </span>

                       <button
                         onClick={() => setCurrentPageJugadores(Math.min(Math.ceil(jugadores.length / itemsPerPage), currentPageJugadores + 1))}
                         disabled={currentPageJugadores === Math.ceil(jugadores.length / itemsPerPage)}
                         className="px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                         style={{ backgroundColor: '#26558D', color: 'white' }}
                       >
                         Siguiente
                       </button>
                     </div>
                   )}
                 </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay jugadores creados aún.</p>
                  <button
                    onClick={() => setActiveTab('jugadores')}
                    className="mt-4 px-4 py-2 rounded-lg font-semibold text-white"
                    style={{ backgroundColor: '#26558D' }}
                  >
                    Crear Primer Jugador
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'editar-jugador' && editingJugador && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium" style={{ color: '#26558D' }}>
                  Editar Jugador
                </h2>
                <button
                  onClick={() => {
                    setActiveTab('modificar-jugadores');
                    setEditingJugador(null);
                    setEditJugadorForm({
                      nombre: '',
                      numeroCamiseta: '',
                      posicion: '',
                      fechaNacimiento: '',
                      nacionalidad: '',
                      descripcion: '',
                      estatura: '',
                      peso: '',
                      posicionSecundaria1: '',
                      posicionSecundaria2: '',
                      rareza: '',
                      equipoId: ''
                    });
                    setEditImageFile(null);
                  }}
                  className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                  style={{ backgroundColor: '#F218FF' }}
                >
                  Cancelar
                </button>
              </div>
              <form onSubmit={handleUpdateJugador} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={editJugadorForm.nombre}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, nombre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Número de Camiseta *
                    </label>
                    <input
                      type="number"
                      value={editJugadorForm.numeroCamiseta}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, numeroCamiseta: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Posición Principal *
                    </label>
                    <input
                      type="text"
                      value={editJugadorForm.posicion}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, posicion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Fecha de Nacimiento *
                    </label>
                    <input
                      type="date"
                      value={editJugadorForm.fechaNacimiento}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, fechaNacimiento: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Nacionalidad *
                    </label>
                    <input
                      type="text"
                      value={editJugadorForm.nacionalidad}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, nacionalidad: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Rareza *
                    </label>
                    <input
                      type="text"
                      value={editJugadorForm.rareza}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, rareza: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Estatura (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editJugadorForm.estatura}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, estatura: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editJugadorForm.peso}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, peso: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Posición Secundaria 1
                    </label>
                    <input
                      type="text"
                      value={editJugadorForm.posicionSecundaria1}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, posicionSecundaria1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Posición Secundaria 2
                    </label>
                    <input
                      type="text"
                      value={editJugadorForm.posicionSecundaria2}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, posicionSecundaria2: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Descripción
                    </label>
                    <textarea
                      value={editJugadorForm.descripcion}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Equipo
                    </label>
                    <select
                      value={editJugadorForm.equipoId}
                      onChange={(e) => setEditJugadorForm({ ...editJugadorForm, equipoId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={equipos.length === 0}
                    >
                      <option value="">
                        {equipos.length === 0 ? 'Cargando equipos...' : 'Seleccionar equipo'}
                      </option>
                      {equipos.map((equipo) => (
                        <option key={equipo.id} value={equipo.id.toString()}>
                          {equipo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Imagen del Jugador
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleEditImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {editImagePreview && (
                      <div className="mt-2">
                        <img
                          src={editImagePreview}
                          alt="Vista previa"
                          className="w-32 h-32 object-cover rounded-md border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#26558D' }}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Jugador'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'editar-serie' && editingSerie && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium" style={{ color: '#26558D' }}>
                  Editar Serie
                </h2>
                <button
                  onClick={() => {
                    setActiveTab('modificar-series');
                    setEditingSerie(null);
                    setEditSerieForm({ nombre: '', descripcion: '', estado: '' });
                  }}
                  className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                  style={{ backgroundColor: '#F218FF' }}
                >
                  Cancelar
                </button>
              </div>
              <form onSubmit={handleUpdateSerie} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Nombre de la Serie *
                  </label>
                  <input
                    type="text"
                    value={editSerieForm.nombre}
                    onChange={(e) => setEditSerieForm({ ...editSerieForm, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Descripción
                  </label>
                  <textarea
                    value={editSerieForm.descripcion}
                    onChange={(e) => setEditSerieForm({ ...editSerieForm, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Estado
                  </label>
                  <select
                    value={editSerieForm.estado}
                    onChange={(e) => setEditSerieForm({ ...editSerieForm, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar estado</option>
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#26558D' }}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Serie'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'editar-equipo' && editingEquipo && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium" style={{ color: '#26558D' }}>
                  Editar Equipo
                </h2>
                <button
                  onClick={() => {
                    setActiveTab('modificar-equipos');
                    setEditingEquipo(null);
                    setEditEquipoForm({ nombre: '', descripcion: '', estadio: '', ciudad: '', serieId: '' });
                  }}
                  className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                  style={{ backgroundColor: '#F218FF' }}
                >
                  Cancelar
                </button>
              </div>
              <form onSubmit={handleUpdateEquipo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Nombre del Equipo
                  </label>
                  <input
                    type="text"
                    value={editEquipoForm.nombre}
                    onChange={(e) => setEditEquipoForm({ ...editEquipoForm, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Estadio
                  </label>
                  <input
                    type="text"
                    value={editEquipoForm.estadio}
                    onChange={(e) => setEditEquipoForm({ ...editEquipoForm, estadio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={editEquipoForm.ciudad}
                    onChange={(e) => setEditEquipoForm({ ...editEquipoForm, ciudad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Serie
                  </label>
                  <select
                    value={editEquipoForm.serieId}
                    onChange={(e) => setEditEquipoForm({ ...editEquipoForm, serieId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar serie (opcional)</option>
                    {series.map((serie) => (
                      <option key={serie.id} value={serie.id.toString()}>
                        {serie.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Descripción
                  </label>
                  <textarea
                    value={editEquipoForm.descripcion}
                    onChange={(e) => setEditEquipoForm({ ...editEquipoForm, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#26558D' }}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Equipo'}
                </button>
              </form>
            </div>
          )}


          {activeTab === 'series' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4" style={{ color: '#26558D' }}>
                Crear Nueva Serie
              </h2>
              <form onSubmit={handleCreateSerie} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Nombre de la Serie *
                  </label>
                  <input
                    type="text"
                    value={serieForm.nombre}
                    onChange={(e) => setSerieForm({ ...serieForm, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Descripción
                  </label>
                  <textarea
                    value={serieForm.descripcion}
                    onChange={(e) => setSerieForm({ ...serieForm, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Estado
                  </label>
                  <select
                    value={serieForm.estado}
                    onChange={(e) => setSerieForm({ ...serieForm, estado: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar estado</option>
                    <option value="activa">Activa</option>
                    <option value="inactiva">Inactiva</option>
                    <option value="pendiente">Pendiente</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#26558D' }}
                >
                  {loading ? 'Creando...' : 'Crear Serie'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'equipos' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4" style={{ color: '#26558D' }}>
                Crear Nuevo Equipo
              </h2>
              <form onSubmit={handleCreateEquipo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Nombre del Equipo
                  </label>
                  <input
                    type="text"
                    value={equipoForm.nombre}
                    onChange={(e) => setEquipoForm({ ...equipoForm, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Estadio
                  </label>
                  <input
                    type="text"
                    value={equipoForm.estadio}
                    onChange={(e) => setEquipoForm({ ...equipoForm, estadio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={equipoForm.ciudad}
                    onChange={(e) => setEquipoForm({ ...equipoForm, ciudad: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Serie
                  </label>
                  <select
                    value={equipoForm.serieId}
                    onChange={(e) => setEquipoForm({ ...equipoForm, serieId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar serie (opcional)</option>
                    {series.map((serie) => (
                      <option key={serie.id} value={serie.id.toString()}>
                        {serie.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Descripción
                  </label>
                  <textarea
                    value={equipoForm.descripcion}
                    onChange={(e) => setEquipoForm({ ...equipoForm, descripcion: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#26558D' }}
                >
                  {loading ? 'Creando...' : 'Crear Equipo'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'jugadores' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4" style={{ color: '#26558D' }}>
                Crear Nuevo Jugador
              </h2>
              <form onSubmit={handleCreateJugador} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={jugadorForm.nombre}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, nombre: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!jugadorForm.nombre ? 'border-red-300' : 'border-gray-300'}`}
                      required
                    />
                    {!jugadorForm.nombre && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Número de Camiseta *
                    </label>
                    <input
                      type="number"
                      value={jugadorForm.numeroCamiseta}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, numeroCamiseta: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!jugadorForm.numeroCamiseta ? 'border-red-300' : 'border-gray-300'}`}
                      required
                    />
                    {!jugadorForm.numeroCamiseta && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Posición Principal *
                    </label>
                    <input
                      type="text"
                      value={jugadorForm.posicion}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, posicion: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!jugadorForm.posicion ? 'border-red-300' : 'border-gray-300'}`}
                      required
                    />
                    {!jugadorForm.posicion && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Fecha de Nacimiento *
                    </label>
                    <input
                      type="date"
                      value={jugadorForm.fechaNacimiento}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, fechaNacimiento: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!jugadorForm.fechaNacimiento ? 'border-red-300' : 'border-gray-300'}`}
                      required
                    />
                    {!jugadorForm.fechaNacimiento && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Nacionalidad *
                    </label>
                    <input
                      type="text"
                      value={jugadorForm.nacionalidad}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, nacionalidad: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!jugadorForm.nacionalidad ? 'border-red-300' : 'border-gray-300'}`}
                      required
                    />
                    {!jugadorForm.nacionalidad && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Rareza *
                    </label>
                    <input
                      type="text"
                      value={jugadorForm.rareza}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, rareza: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!jugadorForm.rareza ? 'border-red-300' : 'border-gray-300'}`}
                      required
                    />
                    {!jugadorForm.rareza && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Estatura (m)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={jugadorForm.estatura}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, estatura: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={jugadorForm.peso}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, peso: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Posición Secundaria 1
                    </label>
                    <input
                      type="text"
                      value={jugadorForm.posicionSecundaria1}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, posicionSecundaria1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Posición Secundaria 2
                    </label>
                    <input
                      type="text"
                      value={jugadorForm.posicionSecundaria2}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, posicionSecundaria2: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Descripción
                    </label>
                    <textarea
                      value={jugadorForm.descripcion}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, descripcion: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Equipo
                    </label>
                    <select
                      value={jugadorForm.equipoId}
                      onChange={(e) => setJugadorForm({ ...jugadorForm, equipoId: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!jugadorForm.equipoId ? 'border-red-300' : 'border-gray-300'}`}
                      required
                    >
                      <option value="">Seleccionar equipo</option>
                      {equipos.map((equipo) => (
                        <option key={equipo.id} value={equipo.id.toString()}>
                          {equipo.nombre}
                        </option>
                      ))}
                    </select>
                    {!jugadorForm.equipoId && <p className="text-red-500 text-xs mt-1">Este campo es obligatorio</p>}
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                      Imagen del Jugador
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Vista previa"
                          className="w-32 h-32 object-cover rounded-md border border-gray-300"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: '#26558D' }}
                  >
                    {loading ? 'Creando...' : 'Vista Previa y Crear'}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".xlsx,.xls"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                    style={{ backgroundColor: '#F218FF' }}
                  >
                    {loading ? 'Importando...' : 'Cargar Excel'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'modificar-usuarios' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4" style={{ color: '#26558D' }}>
                Modificar Usuarios
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Aquí podrás ver, editar y eliminar los usuarios creados.
              </p>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#26558D' }}></div>
                  <p style={{ color: '#5ECDDC' }}>Cargando usuarios...</p>
                </div>
              ) : usuarios.length > 0 ? (
                 <>
                   <div className="space-y-4">
                     {usuarios.slice((currentPageUsuarios - 1) * itemsPerPage, currentPageUsuarios * itemsPerPage).map((usuario) => (
                       <div key={usuario.id} className="border border-gray-200 rounded-lg p-4">
                         <div className="flex justify-between items-start">
                           <div>
                             <h3 className="font-semibold text-lg" style={{ color: '#26558D' }}>
                               {usuario.name}
                             </h3>
                             <p className="text-sm text-gray-600 mt-1">
                               {usuario.email}
                             </p>
                             <p className="text-xs text-gray-500 mt-2">
                               Rol: {usuario.role}
                             </p>
                           </div>
                           <div className="flex gap-2">
                             <button
                               className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                               style={{ backgroundColor: '#16FAD8', color: '#26558D' }}
                               onClick={() => handleEditUsuario(usuario)}
                             >
                               Editar
                             </button>
                             <button
                               className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                               style={{ backgroundColor: '#F218FF' }}
                               onClick={() => handleDeleteUsuario(usuario.id, usuario.email)}
                             >
                               Eliminar
                             </button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* Paginación para usuarios */}
                   {usuarios.length > itemsPerPage && (
                     <div className="flex justify-center items-center mt-6 space-x-2">
                       <button
                         onClick={() => setCurrentPageUsuarios(Math.max(1, currentPageUsuarios - 1))}
                         disabled={currentPageUsuarios === 1}
                         className="px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                         style={{ backgroundColor: '#26558D', color: 'white' }}
                       >
                         Anterior
                       </button>

                       <span className="text-sm text-gray-600">
                         Página {currentPageUsuarios} de {Math.ceil(usuarios.length / itemsPerPage)}
                       </span>

                       <button
                         onClick={() => setCurrentPageUsuarios(Math.min(Math.ceil(usuarios.length / itemsPerPage), currentPageUsuarios + 1))}
                         disabled={currentPageUsuarios === Math.ceil(usuarios.length / itemsPerPage)}
                         className="px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                         style={{ backgroundColor: '#26558D', color: 'white' }}
                       >
                         Siguiente
                       </button>
                     </div>
                   )}
                 </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay usuarios creados aún.</p>
                  <button
                    onClick={() => setActiveTab('usuarios')}
                    className="mt-4 px-4 py-2 rounded-lg font-semibold text-white"
                    style={{ backgroundColor: '#26558D' }}
                  >
                    Crear Primer Usuario
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'editar-usuario' && editingUsuario && (
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium" style={{ color: '#26558D' }}>
                  Editar Usuario
                </h2>
                <button
                  onClick={() => {
                    setActiveTab('modificar-usuarios');
                    setEditingUsuario(null);
                    setEditUsuarioForm({ email: '', name: '', role: '' });
                  }}
                  className="px-3 py-1 rounded-lg font-medium text-white text-sm"
                  style={{ backgroundColor: '#F218FF' }}
                >
                  Cancelar
                </button>
              </div>
              <form onSubmit={handleUpdateUsuario} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editUsuarioForm.email}
                    onChange={(e) => setEditUsuarioForm({ ...editUsuarioForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={editUsuarioForm.name}
                    onChange={(e) => setEditUsuarioForm({ ...editUsuarioForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Rol *
                  </label>
                  <select
                    value={editUsuarioForm.role}
                    onChange={(e) => setEditUsuarioForm({ ...editUsuarioForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#26558D' }}
                >
                  {loading ? 'Actualizando...' : 'Actualizar Usuario'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium mb-4" style={{ color: '#26558D' }}>
                Crear Nuevo Usuario
              </h2>
              <form onSubmit={handleCreateUsuario} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={usuarioForm.email}
                    onChange={(e) => setUsuarioForm({ ...usuarioForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={usuarioForm.name}
                    onChange={(e) => setUsuarioForm({ ...usuarioForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#26558D' }}>
                    Rol *
                  </label>
                  <select
                    value={usuarioForm.role}
                    onChange={(e) => setUsuarioForm({ ...usuarioForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Seleccionar rol</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
                  style={{ backgroundColor: '#26558D' }}
                >
                  {loading ? 'Creando...' : 'Crear Usuario'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Modal de Vista Previa */}
    {previewModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#26558D' }}>
            Vista Previa del Jugador
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Imagen */}
            <div className="text-center">
              <h4 className="font-medium mb-2" style={{ color: '#26558D' }}>Imagen</h4>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Jugador"
                  className="w-48 h-48 object-cover rounded-lg mx-auto border-2 border-gray-300"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-gray-500">Sin imagen</span>
                </div>
              )}
            </div>

            {/* Información */}
            <div>
              <h4 className="font-medium mb-2" style={{ color: '#26558D' }}>Información</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Nombre:</strong> {jugadorForm.nombre || 'No especificado'}</p>
                <p><strong>Número de Camiseta:</strong> {jugadorForm.numeroCamiseta || 'No especificado'}</p>
                <p><strong>Posición:</strong> {jugadorForm.posicion || 'No especificado'}</p>
                <p><strong>Fecha de Nacimiento:</strong> {jugadorForm.fechaNacimiento || 'No especificado'}</p>
                <p><strong>Nacionalidad:</strong> {jugadorForm.nacionalidad || 'No especificado'}</p>
                <p><strong>Rareza:</strong> {jugadorForm.rareza || 'No especificado'}</p>
                <p><strong>Estatura:</strong> {jugadorForm.estatura ? `${jugadorForm.estatura} m` : 'No especificado'}</p>
                <p><strong>Peso:</strong> {jugadorForm.peso ? `${jugadorForm.peso} kg` : 'No especificado'}</p>
                <p><strong>Posición Secundaria 1:</strong> {jugadorForm.posicionSecundaria1 || 'No especificado'}</p>
                <p><strong>Posición Secundaria 2:</strong> {jugadorForm.posicionSecundaria2 || 'No especificado'}</p>
                <p><strong>Equipo:</strong> {jugadorForm.equipoId ? equipos.find(e => e.id.toString() === jugadorForm.equipoId)?.nombre || 'Equipo no encontrado' : 'No especificado'}</p>
                <p><strong>Descripción:</strong> {jugadorForm.descripcion || 'No especificado'}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={() => setPreviewModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmCreate}
              disabled={loading}
              className="px-4 py-2 rounded-lg font-semibold text-white disabled:opacity-50"
              style={{ backgroundColor: '#26558D' }}
            >
              {loading ? 'Creando...' : 'Confirmar y Crear'}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}