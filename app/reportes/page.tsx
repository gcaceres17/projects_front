"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { useApp } from "@/components/app-provider"
import { BarChart3, TrendingUp, Users, DollarSign, FileText, PieChart, Activity, Target, Zap, Brain } from "lucide-react"

export default function Reportes() {
  const { state } = useApp()

  const estadisticas = {
    totalProyectos: state.proyectos.length,
    totalColaboradores: state.colaboradores.length,
    promedioSalario: state.colaboradores.reduce((sum, c) => sum + c.salarioBruto, 0) / state.colaboradores.length || 0,
    colaboradorMasCaro: state.colaboradores.reduce(
      (max, c) => (c.salarioBruto > max.salarioBruto ? c : max),
      state.colaboradores[0],
    ),
    proyectoMasLargo: state.proyectos.reduce(
      (max, p) => (p.duracionMeses > max.duracionMeses ? p : max),
      state.proyectos[0],
    ),
  }

  const ingresosTotales = state.proyectos.reduce((total, proyecto) => {
    const costoColaboradores = proyecto.colaboradores.reduce((sum, pc) => {
      const colaborador = state.colaboradores.find((c) => c.id === pc.colaboradorId)
      if (!colaborador) return sum
      const costosRigidos = state.costosRigidos
        .filter((costo) => colaborador.costosRigidos.includes(costo.id))
        .reduce((costoSum, costo) => {
          return (
            costoSum +
            (costo.tipo === "porcentaje" ? (colaborador.salarioBruto * costo.valor) / 100 : costo.valor)
          )
        }, 0)
      const costoMensual =
        (colaborador.salarioBruto + costosRigidos) *
        (pc.horasAsignadas / colaborador.horasMensuales) *
        (1 + pc.recargo / 100)
      return sum + costoMensual
    }, 0)
    const gastosAdicionales = Object.values(proyecto.gastosAdicionales).reduce((a, b) => a + b, 0)
    const costoTotal = (costoColaboradores + gastosAdicionales) * proyecto.duracionMeses
    const costoConRiesgo = costoTotal * (proyecto.factorRiesgoProyecto || 1.1)
    const margen = costoConRiesgo * (proyecto.margenDeseado / 100)
    return total + costoConRiesgo + margen
  }, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Reportes y Análisis
            </h1>
          </div>
          <p className="text-gray-300 text-lg">
            Análisis detallado y estadísticas de tus proyectos y colaboradores
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Proyectos"
            value={estadisticas.totalProyectos}
            icon={BarChart3}
            trend={{ value: 0, label: "proyectos activos", isPositive: true }}
            className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-500/30"
          />
          <StatCard
            title="Colaboradores"
            value={estadisticas.totalColaboradores}
            icon={Users}
            trend={{ value: 0, label: "miembros del equipo", isPositive: true }}
            className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30"
          />
          <StatCard
            title="Salario Promedio"
            value={`₲${Math.round(estadisticas.promedioSalario).toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 0, label: "costo promedio", isPositive: true }}
            className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-500/30"
          />
          <StatCard
            title="Ingresos Estimados"
            value={`₲${ingresosTotales.toLocaleString()}`}
            icon={TrendingUp}
            trend={{ value: 0, label: "ingresos potenciales", isPositive: true }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
          />
        </div>

        {/* Análisis Principal */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="glassmorphism border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Distribución de Colaboradores por Salario
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {state.colaboradores
                  .sort((a, b) => b.salarioBruto - a.salarioBruto)
                  .map((colaborador) => (
                    <div key={colaborador.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">{colaborador.nombre}</p>
                            <p className="text-sm text-muted-enhanced">{colaborador.antiguedad} años de antigüedad</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-400 font-mono">₲{colaborador.salarioBruto.toLocaleString()}</p>
                          <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${(colaborador.salarioBruto / estadisticas.colaboradorMasCaro?.salarioBruto) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glassmorphism border-green-500/30 hover:border-green-400/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Proyectos por Duración
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {state.proyectos.map((proyecto) => (
                  <div key={proyecto.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{proyecto.nombre}</p>
                          <p className="text-sm text-muted-enhanced">{proyecto.colaboradores.length} colaboradores</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-400 font-mono">{proyecto.duracionMeses} meses</p>
                        <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${(proyecto.duracionMeses / (estadisticas.proyectoMasLargo?.duracionMeses || 1)) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de Costos Rígidos */}
        <Card className="glassmorphism border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Resumen de Costos Rígidos
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {state.costosRigidos.map((costo) => (
                <div key={costo.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-full ${costo.tipo === 'fijo' ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-orange-500 to-red-500'}`}>
                      {costo.tipo === 'fijo' ? <DollarSign className="h-4 w-4 text-white" /> : <Zap className="h-4 w-4 text-white" />}
                    </div>
                    <h3 className="font-semibold text-white">{costo.nombre}</h3>
                  </div>
                  <p className="text-2xl font-bold font-mono text-center mb-2">
                    {costo.tipo === "fijo" ? (
                      <span className="text-green-400">₲{costo.valor.toLocaleString()}</span>
                    ) : (
                      <span className="text-orange-400">{costo.valor}%</span>
                    )}
                  </p>
                  <p className="text-sm text-muted-enhanced text-center">
                    Tipo: {costo.tipo === "fijo" ? "Fijo" : "Porcentaje"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
