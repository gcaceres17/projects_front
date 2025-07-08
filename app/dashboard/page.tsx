"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/ui/stat-card"
import { useApp } from "@/components/app-provider"
import { Users, FolderOpen, DollarSign, TrendingUp, Clock, AlertTriangle, CheckCircle, Target, Activity, Brain, Sparkles } from "lucide-react"

export default function Dashboard() {
  const { state } = useApp()

  const proyectosActivos = state.proyectos.filter((p) => p.estado === "activo").length
  const proyectosPlanificacion = state.proyectos.filter((p) => p.estado === "planificacion").length
  const totalColaboradores = state.colaboradores.length

  const costoMensualTotal = state.colaboradores.reduce((total, colaborador) => {
    const costosRigidosAplicados = state.costosRigidos
      .filter((costo) => colaborador.costosRigidos.includes(costo.id))
      .reduce((costoTotal, costo) => {
        if (costo.tipo === "porcentaje") {
          return costoTotal + (colaborador.salarioBruto * costo.valor) / 100
        } else {
          return costoTotal + costo.valor
        }
      }, 0)

    return total + colaborador.salarioBruto + costosRigidosAplicados
  }, 0)

  const ingresosPotenciales = state.proyectos.reduce((total, proyecto) => {
    const costoColaboradores = proyecto.colaboradores.reduce((sum, pc) => {
      const colaborador = state.colaboradores.find((c) => c.id === pc.colaboradorId)
      if (!colaborador) return sum

      const costosRigidos = state.costosRigidos
        .filter((costo) => colaborador.costosRigidos.includes(costo.id))
        .reduce((costoSum, costo) => {
          return costoSum + (costo.tipo === "porcentaje" ? (colaborador.salarioBruto * costo.valor) / 100 : costo.valor)
        }, 0)

      const costoMensual =
        (colaborador.salarioBruto + costosRigidos) *
        (pc.horasAsignadas / colaborador.horasMensuales) *
        (1 + pc.recargo / 100)

      return sum + costoMensual
    }, 0)

    const gastosAdicionales = Object.values(proyecto.gastosAdicionales).reduce((a, b) => a + b, 0)
    const costoTotal = (costoColaboradores + gastosAdicionales) * proyecto.duracionMeses
    const margen = costoTotal * (proyecto.margenDeseado / 100)

    return total + costoTotal + margen
  }, 0)

  const utilizacionPromedio =
    state.colaboradores.reduce((total, colaborador) => {
      const horasAsignadas = state.proyectos.reduce((horas, proyecto) => {
        const asignacion = proyecto.colaboradores.find((pc) => pc.colaboradorId === colaborador.id)
        return horas + (asignacion?.horasAsignadas || 0)
      }, 0)

      return total + (horasAsignadas / colaborador.horasMensuales) * 100
    }, 0) / state.colaboradores.length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard Ejecutivo
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Vista general del estado de proyectos y recursos en tiempo real
          </p>
        </div>

        {/* Métricas Principales */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Proyectos Activos"
            value={proyectosActivos}
            icon={FolderOpen}
            trend={{ value: proyectosPlanificacion, label: "en planificación", isPositive: true }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
          />
          <StatCard
            title="Equipo de Desarrollo"
            value={totalColaboradores}
            icon={Users}
            trend={{ value: utilizacionPromedio, label: `${utilizacionPromedio.toFixed(1)}% utilización`, isPositive: utilizacionPromedio < 90 }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
          />
          <StatCard
            title="Costo Mensual"
            value={`₲${costoMensualTotal.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 0, label: "costo total del equipo", isPositive: true }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30"
          />
          <StatCard
            title="Ingresos Potenciales"
            value={`₲${ingresosPotenciales.toLocaleString()}`}
            icon={TrendingUp}
            trend={{ value: 0, label: "proyectos en pipeline", isPositive: true }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
          />
        </div>

        {/* Análisis de Proyectos */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glassmorphism border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Estado de Proyectos
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {state.proyectos.map((proyecto) => {
                  const getEstadoIcon = (estado: string) => {
                    switch (estado) {
                      case "activo":
                        return <CheckCircle className="h-4 w-4 text-green-400" />
                      case "planificacion":
                        return <Clock className="h-4 w-4 text-blue-400" />
                      case "pausado":
                        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      default:
                        return <Clock className="h-4 w-4 text-muted-enhanced" />
                    }
                  }

                  const getEstadoColor = (estado: string) => {
                    switch (estado) {
                      case "activo":
                        return "bg-green-500/20 text-green-400 border-green-500/30"
                      case "planificacion":
                        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      case "pausado":
                        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                      case "completado":
                        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      case "cancelado":
                        return "bg-red-500/20 text-red-400 border-red-500/30"
                      default:
                        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
                    }
                  }

                  const progreso =
                    proyecto.estado === "activo"
                      ? 45
                      : proyecto.estado === "planificacion"
                        ? 10
                        : proyecto.estado === "completado"
                          ? 100
                          : 0

                  return (
                    <div key={proyecto.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getEstadoIcon(proyecto.estado)}
                          <span className="font-semibold text-white">{proyecto.nombre}</span>
                          <Badge className={`${getEstadoColor(proyecto.estado)} border font-medium`}>
                            {proyecto.estado}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-enhanced mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {proyecto.duracionMeses} meses
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {proyecto.colaboradores.length} colaboradores
                          </span>
                          <span className="flex items-center gap-1">
                            <Brain className="h-3 w-3" />
                            {proyecto.complejidad}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-enhanced">Progreso</span>
                            <span className="text-gray-300 font-medium">{progreso}%</span>
                          </div>
                          <Progress value={progreso} className="h-2 bg-gray-700" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Análisis del Equipo
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {state.colaboradores
                  .sort((a, b) => b.salarioBruto - a.salarioBruto)
                  .map((colaborador) => {
                    const horasAsignadas = state.proyectos.reduce((total, proyecto) => {
                      const asignacion = proyecto.colaboradores.find((pc) => pc.colaboradorId === colaborador.id)
                      return total + (asignacion?.horasAsignadas || 0)
                    }, 0)

                    const utilizacion = (horasAsignadas / colaborador.horasMensuales) * 100
                    const costoTotal = calcularCostoTotal(colaborador)

                    const getNivelColor = (nivel: string) => {
                      switch (nivel) {
                        case "junior":
                          return "bg-green-500/20 text-green-400 border-green-500/30"
                        case "semi-senior":
                          return "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        case "senior":
                          return "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        case "lead":
                          return "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        case "architect":
                          return "bg-red-500/20 text-red-400 border-red-500/30"
                        default:
                          return "bg-gray-500/20 text-gray-400 border-gray-500/30"
                      }
                    }

                    function calcularCostoTotal(colaborador: typeof state.colaboradores[0]) {
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

                    return (
                      <div key={colaborador.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                              <Users className="h-4 w-4 text-white" />
                            </div>
                            <span className="font-semibold text-white">{colaborador.nombre}</span>
                            <Badge className={`${getNivelColor(colaborador.nivel)} border font-medium`}>
                              {colaborador.nivel}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-enhanced mb-3">
                            <span className="font-medium text-gray-300">{colaborador.rol}</span>
                            <span className="mx-2">•</span>
                            <span className="font-mono text-green-400">₲{costoTotal.toLocaleString()}/mes</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-enhanced">Utilización</span>
                              <span className={`font-medium ${utilizacion > 90 ? 'text-red-400' : utilizacion > 70 ? 'text-yellow-400' : 'text-green-400'}`}>
                                {utilizacion.toFixed(0)}%
                              </span>
                            </div>
                            <Progress 
                              value={Math.min(utilizacion, 100)} 
                              className="h-2 bg-gray-700"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas y Recomendaciones */}
        <Card className="glassmorphism border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Alertas y Recomendaciones
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {utilizacionPromedio > 90 && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500">
                      <AlertTriangle className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-red-400">Sobrecarga del Equipo</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2 ml-10">
                    La utilización promedio del equipo es del {utilizacionPromedio.toFixed(1)}%. Considera contratar más
                    personal o redistribuir la carga de trabajo.
                  </p>
                </div>
              )}

              {proyectosPlanificacion > proyectosActivos && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-blue-400">Pipeline de Proyectos</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2 ml-10">
                    Tienes {proyectosPlanificacion} proyectos en planificación. Revisa la capacidad del equipo antes de
                    iniciarlos.
                  </p>
                </div>
              )}

              {state.colaboradores.some((c) => c.disponibilidad < 100) && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-yellow-400">Disponibilidad Reducida</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2 ml-10">
                    Algunos colaboradores tienen disponibilidad reducida. Ajusta las asignaciones de proyecto en
                    consecuencia.
                  </p>
                </div>
              )}

              {state.proyectos.length === 0 && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <span className="font-semibold text-purple-400">¡Comienza tu primer proyecto!</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-2 ml-10">
                    No tienes proyectos configurados. Crea tu primer proyecto para comenzar a gestionar tu equipo.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
