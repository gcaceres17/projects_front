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
import { useApp, type Proyecto, type ProyectoColaborador } from "@/components/app-provider"
import { Plus, Calculator, FolderOpen, Settings, TrendingUp, Sparkles, Clock, DollarSign, Target, Briefcase, Users, Zap, Award, Shield, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function Proyectos() {
  const { state, dispatch } = useApp()
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: "",
    duracionMeses: 3,
    tasaCambio: 7300,
    tipo: "desarrollo" as "desarrollo" | "mantenimiento" | "consultoria" | "qa",
    complejidad: "media" as "baja" | "media" | "alta" | "critica",
    metodologia: "agile" as "agile" | "waterfall" | "hybrid",
    margenDeseado: 25,
    factorRiesgoProyecto: 1.1,
    colaboradores: [] as ProyectoColaborador[],
    gastosAdicionales: {
      infraestructura: 0,
      licencias: 0,
      capacitacion: 0,
      otros: 0,
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const nuevoProyecto: Proyecto = {
      id: Date.now().toString(),
      ...formData,
      estado: "planificacion",
    }

    dispatch({
      type: "ADD_PROYECTO",
      payload: nuevoProyecto,
    })

    // Resetear formulario
    setFormData({
      nombre: "",
      duracionMeses: 3,
      tasaCambio: 7300,
      tipo: "desarrollo",
      complejidad: "media",
      metodologia: "agile",
      margenDeseado: 25,
      factorRiesgoProyecto: 1.1,
      colaboradores: [],
      gastosAdicionales: {
        infraestructura: 0,
        licencias: 0,
        capacitacion: 0,
        otros: 0,
      },
    })
  }

  const handleColaboradorChange = (colaboradorId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        colaboradores: [
          ...formData.colaboradores,
          {
            colaboradorId,
            horasAsignadas: 160,
            factorEficiencia: 1.0,
            especialidad: "desarrollo",
          },
        ],
      })
    } else {
      setFormData({
        ...formData,
        colaboradores: formData.colaboradores.filter((c) => c.colaboradorId !== colaboradorId),
      })
    }
  }

  const updateColaborador = (colaboradorId: string, updates: Partial<ProyectoColaborador>) => {
    setFormData({
      ...formData,
      colaboradores: formData.colaboradores.map((c) =>
        c.colaboradorId === colaboradorId ? { ...c, ...updates } : c
      ),
    })
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "planificacion":
        return "bg-blue-100 text-blue-800"
      case "desarrollo":
        return "bg-green-100 text-green-800"
      case "terminado":
        return "bg-purple-100 text-purple-800"
      case "pausado":
        return "bg-yellow-100 text-yellow-800"
      case "cancelado":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "desarrollo":
        return "bg-blue-100 text-blue-800"
      case "mantenimiento":
        return "bg-green-100 text-green-800"
      case "consultoria":
        return "bg-purple-100 text-purple-800"
      case "qa":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Gestión de Proyectos
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Crea y gestiona proyectos de desarrollo con cálculos avanzados y métricas en tiempo real
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Proyectos Activos"
            value={state.proyectos.filter(p => p.estado === 'desarrollo' || p.estado === 'planificacion').length}
            icon={Briefcase}
            trend={{ value: 0, label: "neutral", isPositive: true }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
          />
          <StatCard
            title="Valor Total Proyectos"
            value={`$${state.proyectos.reduce((total, p) => total + (p.cotizacion?.total || 0), 0).toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 0, label: "up", isPositive: true }}
            className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/30"
          />
          <StatCard
            title="Promedio Duración"
            value={`${state.proyectos.length > 0 ? (state.proyectos.reduce((total, p) => total + p.duracionMeses, 0) / state.proyectos.length).toFixed(1) : 0} meses`}
            icon={Clock}
            trend={{ value: 0, label: "neutral", isPositive: true }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
          />
          <StatCard
            title="Margen Promedio"
            value={`${state.proyectos.length > 0 ? (state.proyectos.reduce((total, p) => total + p.margenDeseado, 0) / state.proyectos.length).toFixed(1) : 0}%`}
            icon={TrendingUp}
            trend={{ value: 0, label: "up", isPositive: true }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30"
          />
        </div>

        {/* Form Card */}
        <Card className="glassmorphism border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Crear Nuevo Proyecto
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-400" />
                  Información Básica
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="input-group">
                    <Label htmlFor="nombre" className="text-gray-300">Nombre del Proyecto</Label>
                    <Input
                      id="nombre"
                      placeholder="Sistema de Inventario"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      required
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="duracion" className="text-gray-300">Duración (meses)</Label>
                    <Input
                      id="duracion"
                      type="number"
                      min="1"
                      value={formData.duracionMeses}
                      onChange={(e) => setFormData({ ...formData, duracionMeses: Number(e.target.value) })}
                      required
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="tipo" className="text-gray-300">Tipo de Proyecto</Label>
                    <Select value={formData.tipo} onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}>
                      <SelectTrigger className="futuristic-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desarrollo">Desarrollo</SelectItem>
                        <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="consultoria">Consultoría</SelectItem>
                        <SelectItem value="qa">QA/Testing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="input-group">
                    <Label htmlFor="tasa" className="text-gray-300">Tasa de Cambio (₲)</Label>
                    <Input
                      id="tasa"
                      type="number"
                      value={formData.tasaCambio}
                      onChange={(e) => setFormData({ ...formData, tasaCambio: Number(e.target.value) })}
                      required
                      className="futuristic-input currency-input"
                    />
                  </div>
                </div>
              </div>

              {/* Configuración del Proyecto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Settings className="h-5 w-5 text-purple-400" />
                  Configuración del Proyecto
                </h3>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="input-group">
                    <Label htmlFor="complejidad" className="text-gray-300">Complejidad</Label>
                    <Select
                      value={formData.complejidad}
                      onValueChange={(value: any) => setFormData({ ...formData, complejidad: value })}
                    >
                      <SelectTrigger className="futuristic-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baja">Baja</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="critica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="input-group">
                    <Label htmlFor="metodologia" className="text-gray-300">Metodología</Label>
                    <Select
                      value={formData.metodologia}
                      onValueChange={(value: any) => setFormData({ ...formData, metodologia: value })}
                    >
                      <SelectTrigger className="futuristic-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agile">Agile</SelectItem>
                        <SelectItem value="waterfall">Waterfall</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="input-group">
                    <Label htmlFor="margen" className="text-gray-300">Margen Deseado (%)</Label>
                    <Input
                      id="margen"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.margenDeseado}
                      onChange={(e) => setFormData({ ...formData, margenDeseado: Number(e.target.value) })}
                      required
                      className="futuristic-input"
                    />
                  </div>
                </div>
              </div>

              {/* Gastos Adicionales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  Gastos Adicionales
                </h3>
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="input-group">
                    <Label htmlFor="infraestructura" className="text-gray-300">Infraestructura ($)</Label>
                    <Input
                      id="infraestructura"
                      type="number"
                      value={formData.gastosAdicionales.infraestructura}
                      onChange={(e) => setFormData({
                        ...formData,
                        gastosAdicionales: {
                          ...formData.gastosAdicionales,
                          infraestructura: Number(e.target.value)
                        }
                      })}
                      className="futuristic-input currency-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="licencias" className="text-gray-300">Licencias ($)</Label>
                    <Input
                      id="licencias"
                      type="number"
                      value={formData.gastosAdicionales.licencias}
                      onChange={(e) => setFormData({
                        ...formData,
                        gastosAdicionales: {
                          ...formData.gastosAdicionales,
                          licencias: Number(e.target.value)
                        }
                      })}
                      className="futuristic-input currency-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="capacitacion" className="text-gray-300">Capacitación ($)</Label>
                    <Input
                      id="capacitacion"
                      type="number"
                      value={formData.gastosAdicionales.capacitacion}
                      onChange={(e) => setFormData({
                        ...formData,
                        gastosAdicionales: {
                          ...formData.gastosAdicionales,
                          capacitacion: Number(e.target.value)
                        }
                      })}
                      className="futuristic-input currency-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="otros" className="text-gray-300">Otros Gastos ($)</Label>
                    <Input
                      id="otros"
                      type="number"
                      value={formData.gastosAdicionales.otros}
                      onChange={(e) => setFormData({
                        ...formData,
                        gastosAdicionales: {
                          ...formData.gastosAdicionales,
                          otros: Number(e.target.value)
                        }
                      })}
                      className="futuristic-input currency-input"
                    />
                  </div>
                </div>
              </div>

              {/* Selección de Colaboradores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  Equipo del Proyecto
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {state.colaboradores.map((colaborador) => {
                    const isSelected = formData.colaboradores.some(c => c.colaboradorId === colaborador.id)
                    const colaboradorData = formData.colaboradores.find(c => c.colaboradorId === colaborador.id)
                    
                    return (
                      <div key={colaborador.id} className="p-4 border rounded-lg bg-white/5 border-gray-700">
                        <div className="flex items-center space-x-3 mb-3">
                          <Checkbox
                            id={colaborador.id}
                            checked={isSelected}
                            onCheckedChange={(checked) => handleColaboradorChange(colaborador.id, checked as boolean)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-white">{colaborador.nombre}</h4>
                              <Badge className={getTipoColor(colaborador.rol)}>{colaborador.rol}</Badge>
                            </div>
                            <p className="text-sm text-gray-400">
                              {colaborador.nivel} • {colaborador.horasMensuales}h/mes • ₲{colaborador.salarioBruto.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {isSelected && colaboradorData && (
                          <div className="grid gap-3 md:grid-cols-3 pl-6 border-l-2 border-blue-500/30">
                            <div className="input-group">
                              <Label className="text-xs text-gray-400">Horas Asignadas</Label>
                              <Input
                                type="number"
                                value={colaboradorData.horasAsignadas}
                                onChange={(e) => updateColaborador(colaborador.id, { horasAsignadas: Number(e.target.value) })}
                                max={colaborador.horasMensuales}
                                className="futuristic-input text-sm"
                              />
                            </div>

                            <div className="input-group">
                              <Label className="text-xs text-gray-400">Especialidad</Label>
                              <Select
                                value={colaboradorData.especialidad}
                                onValueChange={(value) => updateColaborador(colaborador.id, { especialidad: value as any })}
                              >
                                <SelectTrigger className="futuristic-select text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="desarrollo">Desarrollo</SelectItem>
                                  <SelectItem value="qa">QA/Testing</SelectItem>
                                  <SelectItem value="diseno">Diseño</SelectItem>
                                  <SelectItem value="devops">DevOps</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="input-group">
                              <Label className="text-xs text-gray-400">Factor Eficiencia</Label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0.1"
                                max="2.0"
                                value={colaboradorData.factorEficiencia}
                                onChange={(e) => updateColaborador(colaborador.id, { factorEficiencia: Number(e.target.value) })}
                                className="futuristic-input text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1 btn-futuristic">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Crear Proyecto
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Proyectos */}
        <Card className="glassmorphism border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Proyectos Creados
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">Proyecto</TableHead>
                    <TableHead className="text-gray-300">Tipo</TableHead>
                    <TableHead className="text-gray-300">Estado</TableHead>
                    <TableHead className="text-gray-300">Duración</TableHead>
                    <TableHead className="text-gray-300">Colaboradores</TableHead>
                    <TableHead className="text-gray-300">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.proyectos.map((proyecto) => (
                    <TableRow key={proyecto.id} className="border-gray-700 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                            <Briefcase className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-white font-semibold">{proyecto.nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTipoColor(proyecto.tipo)}>
                          {proyecto.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getEstadoColor(proyecto.estado)}>
                          {proyecto.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300 font-mono">
                        {proyecto.duracionMeses} meses
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {proyecto.colaboradores.length} colaboradores
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/proyectos/${proyecto.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Calculator className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
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

              {state.proyectos.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No hay proyectos creados</p>
                  <p className="text-gray-500 text-sm">Crea tu primer proyecto para comenzar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
