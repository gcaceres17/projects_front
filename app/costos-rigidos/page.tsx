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
import { costosRigidosService, type CostoRigido, type CostoRigidoCreateData } from "@/services/costos-rigidos"
import { Trash2, Edit, Plus, Calculator, DollarSign, Percent, Shield } from "lucide-react"
import { ConnectionDiagnostic } from "@/components/connection-diagnostic"

export default function CostosRigidos() {
  // Estado para datos de API únicamente
  const [costosRigidos, setCostosRigidos] = useState<CostoRigido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CostoRigidoCreateData>({
    nombre: "",
    descripcion: "",
    tipo: "fijo",
    valor: 0,
    categoria: "",
    proveedor: "",
  });

  // Cargar costos rígidos de la API al inicializar
  useEffect(() => {
    loadCostosRigidos();
  }, []);

  const loadCostosRigidos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Cargando costos desde:', 'http://localhost:8000/api/v1/costos-rigidos/costos-rigidos/');
      
      const costosData = await costosRigidosService.list();
      console.log('Datos recibidos:', costosData);
      
      // Asegurar que siempre sea un array
      setCostosRigidos(Array.isArray(costosData) ? costosData : []);
    } catch (error: unknown) {
      console.error('Error cargando costos rígidos:', error);
      
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
      setCostosRigidos([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombre.trim()) {
      alert('El nombre del costo es obligatorio');
      return;
    }

    if (!formData.categoria?.trim()) {
      alert('La categoría es obligatoria');
      return;
    }

    if (formData.valor <= 0) {
      alert('El valor debe ser mayor a cero');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Preparar datos para envío según el schema del backend
      const dataToSend = {
        proyecto_id: null, // null en lugar de undefined para costos generales
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || null,
        tipo: formData.tipo, // Ya está validado como "fijo" por defecto
        valor: Number(formData.valor),
        moneda: 'USD',
        frecuencia: 'mensual',
        fecha_aplicacion: new Date().toISOString(), // El backend debería convertir esto automáticamente
        categoria: formData.categoria?.trim() || null,
        proveedor: formData.proveedor?.trim() || null,
        activo: true // Por defecto activo al crear
      };

      console.log('Enviando datos a:', 'http://localhost:8000/api/v1/costos-rigidos/costos-rigidos/');
      console.log('Datos:', dataToSend);

      if (editingId) {
        // Actualizar costo rígido existente
        await costosRigidosService.update(editingId, dataToSend);
        alert('Costo rígido actualizado exitosamente');
      } else {
        // Crear nuevo costo rígido
        const nuevoCosto = await costosRigidosService.create(dataToSend);
        console.log('Costo creado:', nuevoCosto);
        alert('Costo rígido creado exitosamente');
      }
      
      // Recargar la lista de costos rígidos
      await loadCostosRigidos();
      
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

  const handleEdit = (costoRigido: CostoRigido) => {
    setFormData({
      nombre: costoRigido.nombre,
      descripcion: costoRigido.descripcion || "",
      tipo: costoRigido.tipo,
      valor: costoRigido.valor,
      categoria: costoRigido.categoria || "",
      proveedor: costoRigido.proveedor || "",
    });
    setEditingId(costoRigido.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este costo rígido?')) {
      return;
    }

    try {
      await costosRigidosService.delete(id);
      await loadCostosRigidos();
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error eliminando costo rígido';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleToggleActive = async (id: number, activo: boolean) => {
    try {
      if (activo) {
        await costosRigidosService.deactivate(id);
      } else {
        await costosRigidosService.activate(id);
      }
      await loadCostosRigidos();
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error cambiando estado';
      alert(`Error: ${errorMessage}`);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      tipo: "fijo",
      valor: 0,
      categoria: "",
      proveedor: "",
    });
    setEditingId(null);
  };

  const costosActivos = Array.isArray(costosRigidos) ? costosRigidos.filter(c => c.activo).length : 0;
  const costosFijos = Array.isArray(costosRigidos) ? costosRigidos.filter(c => c.tipo === 'fijo').length : 0;
  const costosVariables = Array.isArray(costosRigidos) ? costosRigidos.filter(c => c.tipo === 'variable').length : 0;
  const valorTotal = Array.isArray(costosRigidos) 
    ? costosRigidos
        .filter(c => c.activo)
        .reduce((sum, c) => sum + c.valor, 0)
    : 0;
  const promedioPorCosto = Array.isArray(costosRigidos) && costosRigidos.length > 0 
    ? costosRigidos.reduce((sum, c) => sum + c.valor, 0) / costosRigidos.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Costos Rígidos
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Gestiona los costos fijos y variables del sistema
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
                <>✅ API Conectada ({costosRigidos.length} costos)</>
              )}
            </div>
            {error && (
              <div className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full text-sm">
                ⚠️ {error.substring(0, 30)}...
              </div>
            )}
            {error && (
              <Button 
                onClick={loadCostosRigidos}
                variant="outline"
                size="sm"
                className="bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
              >
                🔄 Reintentar Conexión
              </Button>
            )}
          </div>
        </div>

        {/* Diagnóstico de Conexión (solo si hay errores) */}
        {error && (
          <ConnectionDiagnostic />
        )}

        {/* Métricas Principales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Costos"
            value={Array.isArray(costosRigidos) ? costosRigidos.length : 0}
            icon={Calculator}
            trend={{ value: costosActivos, label: "activos", isPositive: true }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
          />
          <StatCard
            title="Costos Fijos"
            value={costosFijos}
            icon={Shield}
            trend={{ value: costosVariables, label: "variables", isPositive: true }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
          />
          <StatCard
            title="Valor Total"
            value={`$${valorTotal.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 12, label: "vs mes anterior", isPositive: true }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
          />
          <StatCard
            title="Promedio por Costo"
            value={`$${promedioPorCosto.toLocaleString()}`}
            icon={Percent}
            trend={{ value: 5, label: "eficiencia", isPositive: true }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30"
          />
        </div>

      {/* Formulario */}
      <Card className="glassmorphism border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <CardTitle className="text-white text-xl">
              {editingId ? "Editar Costo Rígido" : "Crear Nuevo Costo Rígido"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calculator className="h-5 w-5 text-indigo-400" />
                Información Básica
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="input-group">
                  <Label htmlFor="nombre" className="label-enhanced">Nombre del Costo</Label>
                  <Input
                    id="nombre"
                    placeholder="Hosting y Dominio"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="futuristic-input"
                  />
                </div>

                <div className="input-group">
                  <Label htmlFor="categoria" className="label-enhanced">Categoría</Label>
                  <Input
                    id="categoria"
                    placeholder="Infraestructura"
                    value={formData.categoria || ""}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    required
                    className="futuristic-input"
                  />
                </div>
              </div>
            </div>

            {/* Configuración del Costo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-purple-400" />
                Configuración del Costo
              </h3>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="input-group">
                  <Label htmlFor="tipo" className="label-enhanced">Tipo de Costo</Label>
                  <Select value={formData.tipo} onValueChange={(value: "fijo" | "variable" | "recurrente") => setFormData({ ...formData, tipo: value })}>
                    <SelectTrigger className="futuristic-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fijo">Costo Fijo</SelectItem>
                      <SelectItem value="variable">Costo Variable (%)</SelectItem>
                      <SelectItem value="recurrente">Costo Recurrente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="input-group">
                  <Label htmlFor="valor" className="label-enhanced">
                    Valor {formData.tipo === 'variable' ? '(%)' : '($)'}
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    min="0"
                    step={formData.tipo === 'variable' ? "0.01" : "1"}
                    placeholder={formData.tipo === 'variable' ? "15.5" : "500"}
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                    required
                    className="futuristic-input"
                  />
                </div>
              </div>
            </div>

            {/* Descripción Adicional */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-400" />
                Descripción Adicional
              </h3>
              <div className="input-group">
                <Label htmlFor="descripcion" className="label-enhanced">Descripción (Opcional)</Label>
                <Input
                  id="descripcion"
                  placeholder="Detalles adicionales sobre este costo..."
                  value={formData.descripcion || ""}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="futuristic-input"
                />
              </div>
              
              <div className="input-group">
                <Label htmlFor="proveedor" className="label-enhanced">Proveedor (Opcional)</Label>
                <Input
                  id="proveedor"
                  placeholder="Nombre del proveedor o empresa"
                  value={formData.proveedor || ""}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  className="futuristic-input"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 btn-futuristic" disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                {editingId ? "Actualizar Costo" : "Crear Costo"}
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

        <Card className="glassmorphism border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Lista de Costos Rígidos
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="table-header-enhanced">Nombre</TableHead>
                    <TableHead className="table-header-enhanced">Categoría</TableHead>
                    <TableHead className="table-header-enhanced">Tipo</TableHead>
                    <TableHead className="table-header-enhanced">Valor</TableHead>
                    <TableHead className="table-header-enhanced">Estado</TableHead>
                    <TableHead className="table-header-enhanced">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p className="text-gray-300">Cargando costos rígidos...</p>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-red-400">
                        <p>Error: {error}</p>
                        <Button onClick={loadCostosRigidos} variant="outline" className="mt-2 border-slate-600 text-gray-300 hover:bg-slate-700">
                          Reintentar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : !Array.isArray(costosRigidos) || costosRigidos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <Calculator className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-primary-enhanced text-lg">No hay costos rígidos configurados</p>
                        <p className="text-secondary-enhanced text-sm">Crea tu primer costo para comenzar</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    Array.isArray(costosRigidos) && costosRigidos.map((costo) => (
                      <TableRow key={costo.id} className="border-gray-700 table-row-hover">
                        <TableCell className="table-cell-enhanced">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                              <Calculator className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="text-primary-enhanced font-medium">{costo.nombre}</div>
                              {costo.descripcion && (
                                <div className="text-secondary-enhanced text-sm">
                                  {costo.descripcion}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">{costo.categoria}</TableCell>
                        <TableCell className="table-cell-enhanced">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            costo.tipo === 'fijo' 
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {costo.tipo === 'fijo' ? 'Fijo' : 'Variable'}
                          </span>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <span className="text-money font-mono">
                            {costo.tipo === 'variable' ? `${costo.valor}%` : `$${costo.valor.toLocaleString()}`}
                          </span>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <button
                            onClick={() => handleToggleActive(costo.id, costo.activo)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              costo.activo
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
                                : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                            }`}
                          >
                            {costo.activo ? 'Activo' : 'Inactivo'}
                          </button>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(costo)}
                              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(costo.id)}
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
