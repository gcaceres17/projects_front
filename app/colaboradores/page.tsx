"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/ui/stat-card"
import { colaboradoresService, type Colaborador, type ColaboradorCreateData } from "@/services/colaboradores"
import { Trash2, Edit, UserPlus, Users, DollarSign, Calendar, Mail } from "lucide-react"

export default function Colaboradores() {
  // Estado para datos de API únicamente
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ColaboradorCreateData>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    cargo: "",
    salario: 0,
    fecha_ingreso: new Date().toISOString().split('T')[0],
    tipo: "interno",
  });

  // Cargar colaboradores de la API al inicializar
  useEffect(() => {
    loadColaboradores();
  }, []);

  const loadColaboradores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Cargando colaboradores desde:', 'http://localhost:8000/api/v1/colaboradores/colaboradores/');
      
      const colaboradoresData = await colaboradoresService.list();
      console.log('Datos recibidos:', colaboradoresData);
      
      // Asegurar que siempre sea un array
      setColaboradores(Array.isArray(colaboradoresData) ? colaboradoresData : []);
    } catch (error: unknown) {
      console.error('Error cargando colaboradores:', error);
      
      let errorMessage = 'Error de conexión con la API';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Verificar si es un error de conexión
        if (errorMessage.includes('fetch') || errorMessage.includes('TypeError') || errorMessage.includes('Failed to fetch')) {
          errorMessage = 'No se puede conectar con el servidor. Verifique que el backend esté ejecutándose en http://localhost:8000';
        }
      }
      
      setError(errorMessage);
      // En caso de error, establecer array vacío
      setColaboradores([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    if (!formData.apellido.trim()) {
      alert('El apellido es obligatorio');
      return;
    }

    if (!formData.email.trim()) {
      alert('El email es obligatorio');
      return;
    }

    if (!formData.cargo.trim()) {
      alert('El cargo es obligatorio');
      return;
    }

    if (formData.salario <= 0) {
      alert('El salario debe ser mayor a cero');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Preparar datos para envío
      const dataToSend = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono?.trim() || undefined,
        cargo: formData.cargo.trim(),
        salario: Number(formData.salario),
        fecha_ingreso: formData.fecha_ingreso,
        tipo: formData.tipo,
      };

      console.log('Enviando datos a:', 'http://localhost:8000/api/v1/colaboradores/colaboradores/');
      console.log('Datos:', dataToSend);

      if (editingId) {
        // Actualizar colaborador existente
        await colaboradoresService.update(editingId, dataToSend);
        alert('Colaborador actualizado exitosamente');
      } else {
        // Crear nuevo colaborador
        const nuevoColaborador = await colaboradoresService.create(dataToSend);
        console.log('Colaborador creado:', nuevoColaborador);
        alert('Colaborador creado exitosamente');
      }
      
      // Recargar la lista de colaboradores
      await loadColaboradores();
      
      // Limpiar formulario
      resetForm();
      
    } catch (error: unknown) {
      console.error('Error completo:', error);
      let errorMessage = 'Error desconocido en la operación';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Verificar si es un error de conexión
        if (errorMessage.includes('fetch') || errorMessage.includes('TypeError') || errorMessage.includes('Failed to fetch')) {
          errorMessage = 'Error de conexión con el servidor. Verifique que el backend esté ejecutándose en http://localhost:8000';
        }
        
        // Verificar errores comunes de la API
        if (errorMessage.includes('404')) {
          errorMessage = 'Endpoint no encontrado. Verifique la configuración de la API';
        } else if (errorMessage.includes('500')) {
          errorMessage = 'Error interno del servidor. Verifique los logs del backend';
        } else if (errorMessage.includes('400')) {
          errorMessage = 'Datos inválidos enviados al servidor';
        }
      }
      
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (colaborador: Colaborador) => {
    setFormData({
      nombre: colaborador.nombre,
      apellido: colaborador.apellido,
      email: colaborador.email,
      telefono: colaborador.telefono || "",
      cargo: colaborador.cargo,
      salario: colaborador.salario,
      fecha_ingreso: colaborador.fecha_ingreso,
      tipo: colaborador.tipo,
    });
    setEditingId(colaborador.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este colaborador?')) {
      return;
    }

    try {
      await colaboradoresService.delete(id);
      await loadColaboradores();
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error eliminando colaborador';
      alert(`Error: ${errorMessage}`);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      cargo: "",
      salario: 0,
      fecha_ingreso: new Date().toISOString().split('T')[0],
      tipo: "interno",
    });
    setEditingId(null);
  };

  const colaboradoresActivos = Array.isArray(colaboradores) ? colaboradores.filter(c => c.activo).length : 0;
  const salarioPromedio = Array.isArray(colaboradores) && colaboradores.length > 0 
    ? colaboradores.reduce((sum, c) => sum + c.salario, 0) / colaboradores.length 
    : 0;
  const colaboradoresInternos = Array.isArray(colaboradores) ? colaboradores.filter(c => c.tipo === 'interno').length : 0;
  const colaboradoresExternos = Array.isArray(colaboradores) ? colaboradores.filter(c => c.tipo === 'externo').length : 0;
  const fechaIngresoPromedio = Array.isArray(colaboradores) && colaboradores.length > 0 
    ? new Date(colaboradores.reduce((sum, c) => sum + new Date(c.fecha_ingreso).getTime(), 0) / colaboradores.length).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Gestión de Colaboradores
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Administra el equipo de trabajo y sus capacidades
          </p>
          
          {/* API Status Indicators */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isLoading 
                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' 
                : error
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-green-500/20 text-green-300 border border-green-500/30'
            }`}>
              {isLoading ? (
                <>🔄 Cargando API...</>
              ) : error ? (
                <>❌ Error de API</>
              ) : (
                <>✅ API Conectada ({colaboradores.length} colaboradores)</>
              )}
            </div>
            {error && (
              <div className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-sm">
                ⚠️ {error.substring(0, 30)}...
              </div>
            )}
            {error && (
              <Button 
                onClick={loadColaboradores}
                variant="outline"
                size="sm"
                className="bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
              >
                🔄 Reintentar Conexión
              </Button>
            )}
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Colaboradores"
            value={Array.isArray(colaboradores) ? colaboradores.length : 0}
            icon={Users}
            trend={{ value: colaboradoresActivos, label: "activos", isPositive: true }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
          />
          <StatCard
            title="Colaboradores Internos"
            value={colaboradoresInternos}
            icon={UserPlus}
            trend={{ value: colaboradoresExternos, label: "externos", isPositive: true }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
          />
          <StatCard
            title="Nómina Mensual"
            value={`$${salarioPromedio.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 15, label: "vs mes anterior", isPositive: true }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
          />
          <StatCard
            title="Experiencia Promedio"
            value={`${Math.round(((Date.now() - new Date(fechaIngresoPromedio).getTime()) / (1000 * 60 * 60 * 24 * 365)) * 10) / 10} años`}
            icon={Calendar}
            trend={{ value: 8, label: "alta retención", isPositive: true }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30"
          />
        </div>

        <Card className="glassmorphism border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {editingId ? "Editar Colaborador" : "Crear Nuevo Colaborador"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Información Personal
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="input-group">
                    <Label htmlFor="nombre" className="label-enhanced">Nombre</Label>
                    <Input
                      id="nombre"
                      placeholder="Juan Carlos"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      className="futuristic-input"
                    />
                  </div>
                  
                  <div className="input-group">
                    <Label htmlFor="apellido" className="label-enhanced">Apellido</Label>
                    <Input
                      id="apellido"
                      placeholder="González"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      required
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="email" className="label-enhanced">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="juan.gonzalez@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="telefono" className="label-enhanced">Teléfono (Opcional)</Label>
                    <Input
                      id="telefono"
                      placeholder="+595 21 123-4567"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      className="futuristic-input"
                    />
                  </div>
                </div>
              </div>

              {/* Información Laboral */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-cyan-400" />
                  Información Laboral
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="input-group">
                    <Label htmlFor="cargo" className="label-enhanced">Cargo</Label>
                    <Input
                      id="cargo"
                      placeholder="Desarrollador Full Stack"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      required
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="tipo" className="label-enhanced">Tipo de Colaborador</Label>
                    <Select value={formData.tipo} onValueChange={(value: "interno" | "externo" | "freelance") => setFormData({ ...formData, tipo: value })}>
                      <SelectTrigger className="futuristic-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="interno">Interno</SelectItem>
                        <SelectItem value="externo">Externo</SelectItem>
                        <SelectItem value="freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="input-group">
                    <Label htmlFor="salario" className="label-enhanced">Salario ($)</Label>
                    <Input
                      id="salario"
                      type="number"
                      placeholder="7300"
                      value={formData.salario}
                      onChange={(e) => setFormData({ ...formData, salario: Number(e.target.value) })}
                      required
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="fecha_ingreso" className="label-enhanced">Fecha de Ingreso</Label>
                    <Input
                      id="fecha_ingreso"
                      type="date"
                      value={formData.fecha_ingreso}
                      onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                      required
                      className="futuristic-input"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 btn-futuristic" disabled={isLoading}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {editingId ? "Actualizar Colaborador" : "Crear Colaborador"}
                </Button>
                {editingId && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                    className="px-6 border-slate-600 text-gray-300 hover:bg-slate-700 hover:text-white"
                  >
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Colaboradores */}
        <Card className="glassmorphism border-green-500/30 hover:border-green-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Lista de Colaboradores
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="table-header-enhanced">Colaborador</TableHead>
                    <TableHead className="table-header-enhanced">Email</TableHead>
                    <TableHead className="table-header-enhanced">Cargo</TableHead>
                    <TableHead className="table-header-enhanced">Tipo</TableHead>
                    <TableHead className="table-header-enhanced">Salario</TableHead>
                    <TableHead className="table-header-enhanced">Estado</TableHead>
                    <TableHead className="table-header-enhanced">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <p className="text-gray-300">Cargando colaboradores...</p>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-red-400">
                        <p>Error: {error}</p>
                        <Button onClick={loadColaboradores} variant="outline" className="mt-2 border-slate-600 text-gray-300 hover:bg-slate-700">
                          Reintentar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : !Array.isArray(colaboradores) || colaboradores.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-primary-enhanced text-lg">No hay colaboradores registrados</p>
                        <p className="text-secondary-enhanced text-sm">Agrega tu primer colaborador para comenzar</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    Array.isArray(colaboradores) && colaboradores.map((colaborador) => (
                      <TableRow key={colaborador.id} className="border-gray-700 table-row-hover">
                        <TableCell className="table-cell-enhanced">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="text-primary-enhanced font-medium">
                                {colaborador.nombre} {colaborador.apellido}
                              </div>
                              <div className="text-secondary-enhanced text-sm">
                                Ingreso: {new Date(colaborador.fecha_ingreso).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {colaborador.email}
                          </div>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">{colaborador.cargo}</TableCell>
                        <TableCell className="table-cell-enhanced">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            colaborador.tipo === 'interno' 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            colaborador.tipo === 'externo' 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                              'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {colaborador.tipo.charAt(0).toUpperCase() + colaborador.tipo.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <span className="text-money font-mono">${colaborador.salario.toLocaleString()}</span>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            colaborador.activo
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {colaborador.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(colaborador)}
                              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(colaborador.id)}
                              className="border-red-500/30 text-red-300 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
