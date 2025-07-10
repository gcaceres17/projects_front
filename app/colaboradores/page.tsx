"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { StatCard } from "@/components/ui/stat-card"
import { useApp, type Colaborador } from "@/components/app-provider"
import { colaboradoresService } from "@/services/colaboradores"
import { Trash2, Edit, UserPlus, Code, Award, Users, Clock, DollarSign, Star, Shield } from "lucide-react"

export default function Colaboradores() {
  const { state, dispatch } = useApp()

  // Estado para integración con API
  const [apiColaboradores, setApiColaboradores] = useState<unknown[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Cargar colaboradores de la API al inicializar
  useEffect(() => {
    const loadColaboradores = async () => {
      try {
        setIsLoadingApi(true);
        setApiError(null);
        
        console.log('Cargando colaboradores desde la API...');
        const colaboradores = await colaboradoresService.list();
        console.log('Colaboradores recibidos de la API:', colaboradores);
        setApiColaboradores(colaboradores);
      } catch (error: unknown) {
        console.log('Error cargando colaboradores de la API, usando datos locales:', error);
        setApiError((error as Error)?.message || 'Error de conexión');
      } finally {
        setIsLoadingApi(false);
      }
    };

    loadColaboradores();
  }, []);

  // Función para obtener colaboradores (API + local fallback)
  const getColaboradores = () => {
    return apiColaboradores.length > 0 ? apiColaboradores : state.colaboradores;
  };

  const colaboradores = getColaboradores();

  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    salarioBruto: 0,
    antiguedad: 0,
    horasMensuales: 160,
    costosRigidos: [] as string[],
    rol: "",
    nivel: "junior" as "junior" | "semi-senior" | "senior" | "lead" | "architect",
    tecnologias: [] as string[],
    disponibilidad: 100,
  })

  const tecnologiasDisponibles = [
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Python",
    "Java",
    "C#",
    ".NET",
    "PHP",
    "Laravel",
    "Django",
    "Express",
    "PostgreSQL",
    "MySQL",
    "MongoDB",
    "AWS",
    "Azure",
    "Docker",
    "Kubernetes",
    "TypeScript",
    "JavaScript",
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      dispatch({
        type: "UPDATE_COLABORADOR",
        payload: {
          id: editingId,
          ...formData,
        },
      })
      setEditingId(null)
    } else {
      dispatch({
        type: "ADD_COLABORADOR",
        payload: {
          id: Date.now().toString(),
          ...formData,
        },
      })
    }

    setFormData({
      nombre: "",
      salarioBruto: 0,
      antiguedad: 0,
      horasMensuales: 160,
      costosRigidos: [],
      rol: "",
      nivel: "junior",
      tecnologias: [],
      disponibilidad: 100,
    })
  }

  const handleEdit = (colaborador: Colaborador) => {
    setFormData({
      nombre: colaborador.nombre,
      salarioBruto: colaborador.salarioBruto,
      antiguedad: colaborador.antiguedad,
      horasMensuales: colaborador.horasMensuales,
      costosRigidos: colaborador.costosRigidos,
      rol: colaborador.rol,
      nivel: colaborador.nivel,
      tecnologias: colaborador.tecnologias,
      disponibilidad: colaborador.disponibilidad,
    })
    setEditingId(colaborador.id)
  }

  const handleDelete = async (id: string) => {
    try {
      if (apiColaboradores.length > 0) {
        await colaboradoresService.delete(parseInt(id));
        const colaboradoresActualizados = await colaboradoresService.list();
        setApiColaboradores(colaboradoresActualizados);
        console.log('Colaborador eliminado de la API');
      } else {
        dispatch({ type: "DELETE_COLABORADOR", payload: id });
      }
    } catch (error) {
      console.error('Error eliminando colaborador:', error);
      dispatch({ type: "DELETE_COLABORADOR", payload: id });
    }
  }

  const handleCostoRigidoChange = (costoId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        costosRigidos: [...formData.costosRigidos, costoId],
      })
    } else {
      setFormData({
        ...formData,
        costosRigidos: formData.costosRigidos.filter((id) => id !== costoId),
      })
    }
  }

  const handleTecnologiaChange = (tecnologia: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        tecnologias: [...formData.tecnologias, tecnologia],
      })
    } else {
      setFormData({
        ...formData,
        tecnologias: formData.tecnologias.filter((t) => t !== tecnologia),
      })
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({
      nombre: "",
      salarioBruto: 0,
      antiguedad: 0,
      horasMensuales: 160,
      costosRigidos: [],
      rol: "",
      nivel: "junior",
      tecnologias: [],
      disponibilidad: 100,
    })
  }

  const calcularCostoTotal = (colaborador: Colaborador) => {
    const costosRigidosAplicados = state.costosRigidos
      .filter((costo) => colaborador.costosRigidos.includes(costo.id))
      .reduce((total, costo) => {
        if (costo.tipo === "porcentaje") {
          return total + (colaborador.salarioBruto * costo.valor) / 100
        } else {
          return total + costo.valor
        }
      }, 0)

    return colaborador.salarioBruto + costosRigidosAplicados
  }

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case "junior":
        return "badge-success"
      case "semi-senior":
        return "badge-info"
      case "senior":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/40"
      case "lead":
        return "badge-warning"
      case "architect":
        return "badge-error"
      default:
        return "bg-gray-500/20 text-gray-300 border border-gray-500/40"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gestión de Colaboradores
            </h1>
          </div>
          <p className="text-primary-enhanced text-lg">
            Administra el equipo de desarrollo con información detallada y métricas avanzadas
          </p>
          
          {/* API Status Indicators */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isLoadingApi 
                ? 'bg-yellow-100 text-yellow-700' 
                : apiColaboradores.length > 0
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700'
            }`}>
              {isLoadingApi ? (
                <>🔄 Cargando API...</>
              ) : apiColaboradores.length > 0 ? (
                <>✅ API Conectada ({apiColaboradores.length} colaboradores)</>
              ) : (
                <>👥 Datos Locales ({state.colaboradores.length} colaboradores)</>
              )}
            </div>
            {apiError && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                ⚠️ {apiError.substring(0, 30)}...
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Colaboradores"
            value={state.colaboradores.length}
            icon={Users}
            trend={{ value: 0, label: "neutral", isPositive: true }}
            className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-500/30"
          />
          <StatCard
            title="Horas Disponibles"
            value={state.colaboradores.reduce((total, col) => total + col.horasMensuales, 0)}
            icon={Clock}
            trend={{ value: 0, label: "up", isPositive: true }}
            className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/30"
          />
          <StatCard
            title="Costo Total Mensual"
            value={`₲${state.colaboradores.reduce((total, col) => total + calcularCostoTotal(col), 0).toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 0, label: "up", isPositive: true }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
          />
          <StatCard
            title="Promedio Experiencia"
            value={`${state.colaboradores.length > 0 ? (state.colaboradores.reduce((total, col) => total + col.antiguedad, 0) / state.colaboradores.length).toFixed(1) : 0} años`}
            icon={Star}
            trend={{ value: 0, label: "up", isPositive: true }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30"
          />
        </div>

        {/* Form Card */}
        <Card className="glassmorphism border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {editingId ? "Editar Colaborador" : "Agregar Colaborador"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Personal */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  Información Personal
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="input-group">
                    <Label htmlFor="nombre" className="label-enhanced">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      placeholder="Juan Pérez"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="rol" className="label-enhanced">Rol/Posición</Label>
                    <Input
                      id="rol"
                      placeholder="Desarrollador Full Stack"
                      value={formData.rol}
                      onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                      required
                      className="futuristic-input"
                    />
                  </div>
                </div>
              </div>

              {/* Información Profesional */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-400" />
                  Información Profesional
                </h3>
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="input-group">
                    <Label htmlFor="nivel" className="label-enhanced">Nivel</Label>
                    <Select
                      value={formData.nivel}
                      onValueChange={(value: "junior" | "semi-senior" | "senior" | "lead" | "architect") => setFormData({ ...formData, nivel: value })}
                    >
                      <SelectTrigger className="futuristic-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="semi-senior">Semi-Senior</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                        <SelectItem value="lead">Tech Lead</SelectItem>
                        <SelectItem value="architect">Architect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="input-group">
                    <Label htmlFor="salario" className="label-enhanced">Salario Bruto (₲)</Label>
                    <Input
                      id="salario"
                      type="number"
                      placeholder="5000000"
                      value={formData.salarioBruto}
                      onChange={(e) => setFormData({ ...formData, salarioBruto: Number(e.target.value) })}
                      required
                      className="futuristic-input currency-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="antiguedad" className="label-enhanced">Antigüedad (años)</Label>
                    <Input
                      id="antiguedad"
                      type="number"
                      placeholder="2"
                      value={formData.antiguedad}
                      onChange={(e) => setFormData({ ...formData, antiguedad: Number(e.target.value) })}
                      required
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="disponibilidad" className="label-enhanced">Disponibilidad (%)</Label>
                    <Input
                      id="disponibilidad"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.disponibilidad}
                      onChange={(e) => setFormData({ ...formData, disponibilidad: Number(e.target.value) })}
                      className="futuristic-input"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <Label htmlFor="horas" className="label-enhanced">Horas Mensuales Disponibles</Label>
                  <Input
                    id="horas"
                    type="number"
                    placeholder="160"
                    value={formData.horasMensuales}
                    onChange={(e) => setFormData({ ...formData, horasMensuales: Number(e.target.value) })}
                    required
                    className="futuristic-input"
                  />
                </div>
              </div>

              {/* Tecnologías */}
              <div className="space-y-4">
                <Label className="flex items-center gap-2 label-enhanced">
                  <Code className="h-5 w-5 text-green-400" />
                  <span className="text-lg font-semibold text-primary-enhanced">Tecnologías y Herramientas</span>
                </Label>
                <div className="grid gap-3 md:grid-cols-4 max-h-40 overflow-y-auto p-4 border border-gray-600 rounded-lg bg-slate-800/50">
                {tecnologiasDisponibles.map((tecnologia) => (
                  <div key={tecnologia} className="flex items-center space-x-2 p-2 rounded-md hover:bg-slate-700/50 transition-colors">
                    <Checkbox
                      id={`tech-${tecnologia}`}
                      checked={formData.tecnologias.includes(tecnologia)}
                      onCheckedChange={(checked: boolean) => handleTecnologiaChange(tecnologia, checked)}
                    />
                    <Label htmlFor={`tech-${tecnologia}`} className="text-sm text-primary-enhanced cursor-pointer">
                      {tecnologia}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Costos Rígidos */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 label-enhanced">
                <Award className="h-4 w-4 text-purple-400" />
                <span className="text-primary-enhanced">Costos Rígidos Aplicables</span>
              </Label>
              <div className="grid gap-2 md:grid-cols-2">
                {state.costosRigidos.map((costo) => (
                  <div key={costo.id} className="flex items-center space-x-2 p-3 border border-gray-600 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 transition-colors">
                    <Checkbox
                      id={costo.id}
                      checked={formData.costosRigidos.includes(costo.id)}
                      onCheckedChange={(checked: boolean) => handleCostoRigidoChange(costo.id, checked)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={costo.id} className="text-sm font-medium text-primary-enhanced cursor-pointer">
                        {costo.nombre}
                      </Label>
                      <p className="text-xs text-muted-enhanced">
                        {costo.tipo === "fijo" ? `₲${costo.valor.toLocaleString()}` : `${costo.valor}%`} -{" "}
                        {costo.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 btn-futuristic">
                <UserPlus className="h-4 w-4 mr-2" />
                {editingId ? "Actualizar" : "Crear"} Colaborador
              </Button>
              {editingId && (
                <Button type="button" variant="ghost" onClick={cancelEdit} className="text-gray-400 hover:text-gray-300 hover:bg-gray-500/10">
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Colaboradores */}
      <Card className="glassmorphism border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <CardTitle className="flex items-center gap-3 text-white">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Equipo de Desarrollo
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-700">
                  <TableHead className="table-header-enhanced">Colaborador</TableHead>
                  <TableHead className="table-header-enhanced">Rol</TableHead>
                  <TableHead className="table-header-enhanced">Nivel</TableHead>
                  <TableHead className="table-header-enhanced">Salario</TableHead>
                  <TableHead className="table-header-enhanced">Costo Total</TableHead>
                  <TableHead className="table-header-enhanced">Tecnologías</TableHead>
                  <TableHead className="table-header-enhanced text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradores.map((colaborador) => {
                  const col = colaborador as Colaborador;
                  return (
                  <TableRow key={col.id} className="border-gray-700 table-row-hover">
                    <TableCell className="table-cell-enhanced">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                          <UserPlus className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-primary-enhanced font-medium">{col.nombre}</div>
                          <div className="text-sm text-muted-enhanced">
                            {col.antiguedad} años • {col.horasMensuales}h/mes • {col.disponibilidad}%
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  <TableCell className="table-cell-enhanced text-secondary-enhanced">{col.rol}</TableCell>
                  <TableCell className="table-cell-enhanced">
                    <Badge className={getNivelColor(col.nivel)}>{col.nivel}</Badge>
                  </TableCell>
                  <TableCell className="table-cell-enhanced">
                    <span className="text-money">₲{col.salarioBruto.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="table-cell-enhanced">
                    <span className="text-money font-bold">₲{calcularCostoTotal(col).toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="table-cell-enhanced">
                    <div className="flex flex-wrap gap-1">
                      {col.tecnologias.slice(0, 3).map((tech: string) => (
                        <Badge key={tech} variant="outline" className="text-xs badge-info">
                          {tech}
                        </Badge>
                      ))}
                      {col.tecnologias.length > 3 && (
                        <Badge variant="outline" className="text-xs badge-info">
                          +{col.tecnologias.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="table-cell-enhanced">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(col)}
                        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(col.id)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                  );
                })}
            </TableBody>
            </Table>

            {colaboradores.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <p className="text-primary-enhanced text-lg">No hay colaboradores registrados</p>
                <p className="text-secondary-enhanced text-sm">Agrega tu primer colaborador para comenzar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
