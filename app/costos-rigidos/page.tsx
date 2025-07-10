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
import { useApp, type CostoRigido } from "@/components/app-provider"
import { costosRigidosService } from "@/services/costos-rigidos"
import { Trash2, Edit, Plus, Calculator, DollarSign, Percent, Shield, Sparkles } from "lucide-react"

export default function CostosRigidos() {
  const { state, dispatch } = useApp()

  // Estado para integración con API
  const [apiCostosRigidos, setApiCostosRigidos] = useState<any[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Cargar costos rígidos de la API al inicializar
  useEffect(() => {
    const loadCostosRigidos = async () => {
      try {
        setIsLoadingApi(true);
        setApiError(null);
        
        console.log('Cargando costos rígidos desde la API...');
        const costosRigidos = await costosRigidosService.list();
        console.log('Costos rígidos recibidos de la API:', costosRigidos);
        setApiCostosRigidos(costosRigidos);
      } catch (error: any) {
        console.log('Error cargando costos rígidos de la API, usando datos locales:', error);
        setApiError(error?.message || 'Error de conexión');
      } finally {
        setIsLoadingApi(false);
      }
    };

    loadCostosRigidos();
  }, []);

  // Función para obtener costos rígidos (API + local fallback)
  const getCostosRigidos = () => {
    return apiCostosRigidos.length > 0 ? apiCostosRigidos : state.costosRigidos;
  };

  const costosRigidos = getCostosRigidos();

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    tipo: "fijo" as "fijo" | "porcentaje",
    valor: 0,
    descripcion: "",
    categoria: "beneficio" as "legal" | "beneficio" | "operativo" | "otro",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      // Actualizar costo rígido
      try {
        await costosRigidosService.update(editingId, formData);
        dispatch({
          type: "UPDATE_COSTO_RIGIDO",
          payload: {
            id: editingId,
            ...formData,
          },
        })
      } catch (error) {
        console.error('Error actualizando costo rígido:', error);
      }
      setEditingId(null)
    } else {
      // Agregar nuevo costo rígido
      try {
        const newCosto = await costosRigidosService.create({
          id: Date.now().toString(),
          ...formData,
        });
        dispatch({
          type: "ADD_COSTO_RIGIDO",
          payload: newCosto,
        })
      } catch (error) {
        console.error('Error agregando nuevo costo rígido:', error);
      }
    }

    setFormData({ nombre: "", tipo: "fijo", valor: 0, descripcion: "", categoria: "beneficio" })
  }

  const handleEdit = (costo: CostoRigido) => {
    setFormData({
      nombre: costo.nombre,
      tipo: costo.tipo,
      valor: costo.valor,
      descripcion: costo.descripcion || "",
      categoria: costo.categoria || "beneficio",
    })
    setEditingId(costo.id)
  }

  const handleDelete = async (id: string) => {
    // Eliminar costo rígido
    try {
      await costosRigidosService.delete(parseInt(id));
      dispatch({ type: "DELETE_COSTO_RIGIDO", payload: id })
    } catch (error) {
      console.error('Error eliminando costo rígido:', error);
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ nombre: "", tipo: "fijo", valor: 0, descripcion: "", categoria: "beneficio" })
  }

  const totalCostosFijos = state.costosRigidos
    .filter(costo => costo.tipo === "fijo")
    .reduce((total, costo) => total + costo.valor, 0)

  const totalCostosPorcentaje = state.costosRigidos
    .filter(costo => costo.tipo === "porcentaje")
    .reduce((total, costo) => total + costo.valor, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-red-600 shadow-lg">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              Costos Rígidos
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Gestiona los costos fijos y variables que se aplican a los colaboradores
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Costos Rígidos"
            value={state.costosRigidos.length}
            icon={Calculator}
            trend={{ value: 0, label: "neutral", isPositive: true }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30"
          />
          <StatCard
            title="Costos Fijos Totales"
            value={`₲${totalCostosFijos.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 0, label: "up", isPositive: true }}
            className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/30"
          />
          <StatCard
            title="Costos Porcentuales"
            value={`${totalCostosPorcentaje.toFixed(1)}%`}
            icon={Percent}
            trend={{ value: 0, label: "up", isPositive: true }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
          />
        </div>

        {/* Form Card */}
        <Card className="glassmorphism border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-500/10 to-red-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-orange-500 to-red-500">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                {editingId ? "Editar Costo Rígido" : "Agregar Costo Rígido"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="input-group">
                  <Label htmlFor="nombre" className="label-enhanced">Nombre del Costo</Label>
                  <Input
                    id="nombre"
                    placeholder="Seguridad Social"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="futuristic-input"
                  />
                </div>

                <div className="input-group">
                  <Label htmlFor="tipo" className="label-enhanced">Tipo de Costo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: "fijo" | "porcentaje") => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger className="futuristic-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fijo">Costo Fijo (₲)</SelectItem>
                      <SelectItem value="porcentaje">Porcentaje (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="input-group">
                  <Label htmlFor="valor" className="label-enhanced">
                    {formData.tipo === "fijo" ? "Valor en Guaraníes" : "Porcentaje"}
                  </Label>
                  <Input
                    id="valor"
                    type="number"
                    step={formData.tipo === "porcentaje" ? "0.01" : "1"}
                    placeholder={formData.tipo === "fijo" ? "500000" : "12.5"}
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                    required
                    className="futuristic-input"
                  />
                </div>

                <div className="input-group">
                  <Label htmlFor="categoria" className="label-enhanced">Categoría</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value: "legal" | "beneficio" | "operativo" | "otro") => setFormData({ ...formData, categoria: value })}
                  >
                    <SelectTrigger className="futuristic-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="legal">Legal</SelectItem>
                      <SelectItem value="beneficio">Beneficio</SelectItem>
                      <SelectItem value="operativo">Operativo</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="input-group">
                  <Label htmlFor="descripcion" className="label-enhanced">Descripción</Label>
                  <Input
                    id="descripcion"
                    placeholder="Descripción del costo"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="futuristic-input"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 btn-futuristic">
                  <Sparkles className="h-4 w-4 mr-2" />
                  {editingId ? "Actualizar" : "Crear"} Costo Rígido
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={cancelEdit} className="px-6">
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Costos Rígidos */}
        <Card className="glassmorphism border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Costos Configurados
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="table-header-enhanced">Nombre</TableHead>
                    <TableHead className="table-header-enhanced">Tipo</TableHead>
                    <TableHead className="table-header-enhanced">Valor</TableHead>
                    <TableHead className="table-header-enhanced">Categoría</TableHead>
                    <TableHead className="table-header-enhanced">Descripción</TableHead>
                    <TableHead className="table-header-enhanced">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.costosRigidos.map((costo) => (
                    <TableRow key={costo.id} className="border-gray-700 table-row-hover">
                      <TableCell className="table-cell-enhanced">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${costo.tipo === 'fijo' ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
                            {costo.tipo === 'fijo' ? <DollarSign className="h-4 w-4 text-white" /> : <Percent className="h-4 w-4 text-white" />}
                          </div>
                          <span className="text-primary-enhanced">{costo.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell className="table-cell-enhanced">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          costo.tipo === 'fijo' 
                            ? 'badge-success' 
                            : 'badge-warning'
                        }`}>
                          {costo.tipo === 'fijo' ? 'Fijo' : 'Porcentaje'}
                        </div>
                      </TableCell>
                      <TableCell className="table-cell-enhanced">
                        <span className="text-money">
                          {costo.tipo === 'fijo' 
                            ? `₲${costo.valor.toLocaleString()}` 
                            : `${costo.valor}%`}
                        </span>
                      </TableCell>
                      <TableCell className="table-cell-enhanced">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          costo.categoria === 'legal' ? 'category-legal' :
                          costo.categoria === 'beneficio' ? 'category-beneficio' :
                          costo.categoria === 'operativo' ? 'category-operativo' :
                          'category-otro'
                        }`}>
                          {costo.categoria}
                        </div>
                      </TableCell>
                      <TableCell className="table-cell-enhanced">
                        <span className="text-muted-enhanced">
                          {costo.descripcion || 'Sin descripción'}
                        </span>
                      </TableCell>
                      <TableCell className="table-cell-enhanced">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(costo)}
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(costo.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {state.costosRigidos.length === 0 && (
                <div className="text-center py-12">
                  <Calculator className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-primary-enhanced text-lg">No hay costos rígidos configurados</p>
                  <p className="text-secondary-enhanced text-sm">Agrega el primer costo para comenzar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
