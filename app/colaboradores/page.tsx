"use client"

import type React from "react"

import { useState } from "react"
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
import { Trash2, Edit, UserPlus, Code, Award, Users, Clock, DollarSign, TrendingUp, Star, Shield, Sparkles } from "lucide-react"

export default function Colaboradores() {
  const { state, dispatch } = useApp()
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

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_COLABORADOR", payload: id })
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
        return "bg-green-100 text-green-800"
      case "semi-senior":
        return "bg-blue-100 text-blue-800"
      case "senior":
        return "bg-purple-100 text-purple-800"
      case "lead":
        return "bg-orange-100 text-orange-800"
      case "architect":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
          <p className="text-gray-300 text-lg">
            Administra el equipo de desarrollo con información detallada y métricas avanzadas
          </p>
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
                      onValueChange={(value: any) => setFormData({ ...formData, nivel: value })}
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
                  <span className="text-lg font-semibold">Tecnologías y Herramientas</span>
                </Label>
                <div className="grid gap-2 md:grid-cols-4 max-h-40 overflow-y-auto p-2 border rounded-lg">
                {tecnologiasDisponibles.map((tecnologia) => (
                  <div key={tecnologia} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tech-${tecnologia}`}
                      checked={formData.tecnologias.includes(tecnologia)}
                      onCheckedChange={(checked) => handleTecnologiaChange(tecnologia, checked as boolean)}
                    />
                    <Label htmlFor={`tech-${tecnologia}`} className="text-sm">
                      {tecnologia}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Costos Rígidos */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Costos Rígidos Aplicables
              </Label>
              <div className="grid gap-2 md:grid-cols-2">
                {state.costosRigidos.map((costo) => (
                  <div key={costo.id} className="flex items-center space-x-2 p-2 border rounded-lg">
                    <Checkbox
                      id={costo.id}
                      checked={formData.costosRigidos.includes(costo.id)}
                      onCheckedChange={(checked) => handleCostoRigidoChange(costo.id, checked as boolean)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={costo.id} className="text-sm font-medium">
                        {costo.nombre}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {costo.tipo === "fijo" ? `₲${costo.valor.toLocaleString()}` : `${costo.valor}%`} -{" "}
                        {costo.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingId ? "Actualizar" : "Crear"} Colaborador
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle>Equipo de Desarrollo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {state.colaboradores.map((colaborador) => (
                <TableRow key={colaborador.id} className="table-row-hover">
                  <TableCell className="table-cell-enhanced">
                    <div>
                      <div className="text-primary-enhanced">{colaborador.nombre}</div>
                      <div className="text-sm text-muted-enhanced">
                        {colaborador.antiguedad} años • {colaborador.horasMensuales}h/mes • {colaborador.disponibilidad}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="table-cell-enhanced text-secondary-enhanced">{colaborador.rol}</TableCell>
                  <TableCell className="table-cell-enhanced">
                    <Badge className={getNivelColor(colaborador.nivel)}>{colaborador.nivel}</Badge>
                  </TableCell>
                  <TableCell className="table-cell-enhanced">
                    <span className="text-money">₲{colaborador.salarioBruto.toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="table-cell-enhanced">
                    <span className="text-money font-bold">₲{calcularCostoTotal(colaborador).toLocaleString()}</span>
                  </TableCell>
                  <TableCell className="table-cell-enhanced">
                    <div className="flex flex-wrap gap-1">
                      {colaborador.tecnologias.slice(0, 3).map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs badge-info">
                          {tech}
                        </Badge>
                      ))}
                      {colaborador.tecnologias.length > 3 && (
                        <Badge variant="outline" className="text-xs badge-info">
                          +{colaborador.tecnologias.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(colaborador)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Editar</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(colaborador.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Eliminar</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
