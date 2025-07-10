"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StatCard } from "@/components/ui/stat-card"
import { useApp } from "@/components/app-provider"
import { reportesService } from '@/services/reportes';
import { 
  Users, 
  FolderOpen, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Zap,
  BarChart3,
  Activity,
  Award,
  Briefcase
} from "lucide-react"

export default function Dashboard() {
  const { state } = useApp()

  // Estado para datos de la API
  const [apiData, setApiData] = useState<unknown>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Cargar datos de la API de manera opcional
  useEffect(() => {
    const loadApiData = async () => {
      try {
        setIsLoadingApi(true);
        setApiError(null);
        
        console.log('Intentando cargar datos del dashboard desde la API...');
        const dashboardData = await reportesService.getDashboard();
        console.log('Datos recibidos de la API:', dashboardData);
        setApiData(dashboardData);
      } catch (error: unknown) {
        console.log('API no disponible, usando datos locales:', error);
        setApiError(`Error de API: ${(error as Error)?.message || 'Error de conexión'}`);
      } finally {
        setIsLoadingApi(false);
      }
    };

    loadApiData();
  }, []);

  // Función para obtener estadísticas combinadas (API + local fallback)
  const getStats = () => {
    if (apiData) {
      // Usar datos de la API
      const data = apiData as any;
      return {
        proyectosActivos: data.proyectos.activos,
        proyectosPlanificacion: data.proyectos.total - data.proyectos.activos - data.proyectos.completados,
        totalColaboradores: data.colaboradores.total,
        cotizacionesPendientes: data.cotizaciones.pendientes,
        valorCotizaciones: data.cotizaciones.valor_total,
        clientesActivos: data.clientes.activos,
        utilizacionPromedio: data.colaboradores.porcentaje_activos,
        proyectos: data.proyectos
      };
    } else {
      // Fallback a datos locales
      const proyectosActivos = state.proyectos.filter((p) => p.estado === "activo").length
      const proyectosPlanificacion = state.proyectos.filter((p) => p.estado === "planificacion").length
      const totalColaboradores = state.colaboradores.length

      const utilizacionPromedio =
        state.colaboradores.reduce((total, colaborador) => {
          const horasAsignadas = state.proyectos.reduce((horas, proyecto) => {
            const asignacion = proyecto.colaboradores.find((pc) => pc.colaboradorId === colaborador.id)
            return horas + (asignacion?.horasAsignadas || 0)
          }, 0)

          return total + (horasAsignadas / colaborador.horasMensuales) * 100
        }, 0) / state.colaboradores.length || 0

      return {
        proyectosActivos,
        proyectosPlanificacion,
        totalColaboradores,
        cotizacionesPendientes: 0,
        valorCotizaciones: 0,
        clientesActivos: 0,
        utilizacionPromedio,
        proyectos: {
          total: state.proyectos.length,
          activos: proyectosActivos,
          completados: state.proyectos.filter((p) => p.estado === "completado").length,
          porcentaje_completados: state.proyectos.length > 0 ? (state.proyectos.filter((p) => p.estado === "completado").length / state.proyectos.length * 100) : 0
        }
      };
    }
  };

  const stats = getStats();

  const proyectosActivos = stats.proyectosActivos;
  const proyectosPlanificacion = stats.proyectosPlanificacion;
  const totalColaboradores = stats.totalColaboradores;

  // Cálculos adicionales (solo para datos locales)
  const costoMensualTotal = apiData ? 0 : state.colaboradores.reduce((total, colaborador) => {
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

  const ingresosPotenciales = apiData ? stats.valorCotizaciones : state.proyectos.reduce((total, proyecto) => {
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

  const utilizacionPromedio = stats.utilizacionPromedio;

  const calcularCostoTotal = (colaborador: typeof state.colaboradores[0]) => {
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
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 min-h-screen">
      {/* Header Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Dashboard Ejecutivo
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Vista general del estado de proyectos y recursos
            </p>
          </div>
        </div>
        
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg w-fit">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Sistema Operativo</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          
          {/* API Status Indicator */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg w-fit ${
            isLoadingApi 
              ? 'bg-yellow-50 border border-yellow-200' 
              : apiData 
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50 border border-gray-200'
          }`}>
            {isLoadingApi ? (
              <>
                <Clock className="h-4 w-4 text-yellow-600 animate-spin" />
                <span className="text-sm font-medium text-yellow-700">Cargando API...</span>
              </>
            ) : apiData ? (
              <>
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">API Conectada</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Datos Locales</span>
              </>
            )}
          </div>

          {/* Error details for debugging */}
          {apiError && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg w-fit">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-red-700" title={apiError}>
                Error API: {apiError.substring(0, 50)}{apiError.length > 50 ? '...' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Proyectos Activos"
          value={proyectosActivos}
          description={`${proyectosPlanificacion} en planificación`}
          icon={Briefcase}
          gradient="from-blue-500 to-indigo-600"
          trend={proyectosActivos > 0 ? {
            value: 12,
            label: "vs mes anterior",
            isPositive: true
          } : undefined}
        />

        <StatCard
          title="Equipo de Desarrollo"
          value={totalColaboradores}
          description={`Utilización: ${utilizacionPromedio.toFixed(1)}%`}
          icon={Users}
          gradient="from-emerald-500 to-teal-600"
          trend={{
            value: utilizacionPromedio,
            label: "utilización",
            isPositive: utilizacionPromedio > 70
          }}
        />

        <StatCard
          title="Costo Mensual"
          value={apiData ? `₲${stats.valorCotizaciones.toLocaleString()}` : `₲${costoMensualTotal.toLocaleString()}`}
          description={apiData ? "Valor total cotizaciones" : "Costo total del equipo"}
          icon={DollarSign}
          gradient="from-orange-500 to-red-600"
        />

        <StatCard
          title={apiData ? "Cotizaciones" : "Ingresos Potenciales"}
          value={apiData ? stats.cotizacionesPendientes : `₲${ingresosPotenciales.toLocaleString()}`}
          description={apiData ? `${stats.valorCotizaciones > 0 ? 'pendientes' : 'registradas'}` : "Proyectos en pipeline"}
          icon={TrendingUp}
          gradient="from-purple-500 to-pink-600"
          trend={apiData ? undefined : {
            value: 24,
            label: "incremento proyectado",
            isPositive: true
          }}
        />
      </div>

      {/* Analysis Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Projects Section */}
        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Estado de Proyectos
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.proyectos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                    <FolderOpen className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No hay proyectos registrados</p>
                  <p className="text-sm text-slate-400 mt-1">Comienza creando tu primer proyecto</p>
                </div>
              ) : (
                state.proyectos.map((proyecto) => {
                  const getEstadoIcon = (estado: string) => {
                    switch (estado) {
                      case "activo":
                        return <CheckCircle className="h-5 w-5 text-emerald-500" />
                      case "planificacion":
                        return <Clock className="h-5 w-5 text-blue-500" />
                      case "pausado":
                        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      default:
                        return <Clock className="h-5 w-5 text-slate-500" />
                    }
                  }

                  const getEstadoColor = (estado: string) => {
                    switch (estado) {
                      case "activo":
                        return "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200"
                      case "planificacion":
                        return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200"
                      case "pausado":
                        return "bg-gradient-to-r from-yellow-50 to-yellow-100 text-yellow-800 border-yellow-200"
                      case "completado":
                        return "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 border-slate-200"
                      case "cancelado":
                        return "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200"
                      default:
                        return "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 border-slate-200"
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
                    <div key={proyecto.id} className="group p-5 rounded-xl bg-gradient-to-r from-white to-slate-50/50 border border-slate-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {getEstadoIcon(proyecto.estado)}
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                          </div>
                          <span className="font-bold text-slate-900 flex-1 text-lg group-hover:text-indigo-700 transition-colors duration-300">
                            {proyecto.nombre}
                          </span>
                          <Badge className={`${getEstadoColor(proyecto.estado)} text-xs px-3 py-1 font-semibold border`}>
                            {proyecto.estado}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-8 text-sm text-slate-600">
                          <span className="flex items-center gap-2 font-medium">
                            <Clock className="h-4 w-4 text-indigo-500" />
                            {proyecto.duracionMeses} meses
                          </span>
                          <span className="flex items-center gap-2 font-medium">
                            <Users className="h-4 w-4 text-emerald-500" />
                            {proyecto.colaboradores.length} colaboradores
                          </span>
                          <span className="capitalize font-medium text-purple-600">
                            {proyecto.complejidad}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">Progreso</span>
                            <span className="font-bold text-indigo-600">{progreso}%</span>
                          </div>
                          <div className="relative">
                            <Progress value={progreso} className="h-3 bg-slate-100" />
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" 
                                 style={{ width: `${progreso}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Section */}
        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Análisis del Equipo
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.colaboradores.length === 0 ? (
                <div className="text-center py-12">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500 font-medium">No hay colaboradores registrados</p>
                  <p className="text-sm text-slate-400 mt-1">Agrega miembros para comenzar</p>
                </div>
              ) : (
                state.colaboradores
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
                          return "bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 border-emerald-200"
                        case "semi-senior":
                          return "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 border-blue-200"
                        case "senior":
                          return "bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 border-purple-200"
                        case "lead":
                          return "bg-gradient-to-r from-orange-50 to-orange-100 text-orange-800 border-orange-200"
                        case "architect":
                          return "bg-gradient-to-r from-red-50 to-red-100 text-red-800 border-red-200"
                        default:
                          return "bg-gradient-to-r from-slate-50 to-slate-100 text-slate-800 border-slate-200"
                      }
                    }

                    return (
                      <div key={colaborador.id} className="group p-5 rounded-xl bg-gradient-to-r from-white to-slate-50/50 border border-slate-200 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                              <span className="text-white font-bold text-lg">
                                {colaborador.nombre.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-bold text-slate-900 flex-1 text-lg group-hover:text-indigo-700 transition-colors duration-300">
                              {colaborador.nombre}
                            </span>
                            <Badge className={`${getNivelColor(colaborador.nivel)} text-xs px-3 py-1 font-semibold border`}>
                              {colaborador.nivel}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-indigo-500" />
                              <span className="text-slate-600 font-medium">{colaborador.rol}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-emerald-500" />
                              <span className="font-bold text-slate-900">₲{costoTotal.toLocaleString()}/mes</span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-slate-600 flex items-center gap-2">
                                <Zap className="h-4 w-4 text-yellow-500" />
                                Utilización
                              </span>
                              <span className="font-bold text-indigo-600">{utilizacion.toFixed(0)}%</span>
                            </div>
                            <div className="relative">
                              <Progress value={Math.min(utilizacion, 100)} className="h-3 bg-slate-100" />
                              <div 
                                className="absolute inset-0 rounded-full transition-all duration-500"
                                style={{ 
                                  width: `${Math.min(utilizacion, 100)}%`,
                                  background: utilizacion > 90 ? 'linear-gradient(to right, #ef4444, #dc2626)' : 
                                            utilizacion > 70 ? 'linear-gradient(to right, #f59e0b, #d97706)' :
                                            'linear-gradient(to right, #10b981, #059669)'
                                }} 
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y Recomendaciones */}
      <Card className="border-l-4 border-l-yellow-500 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Alertas y Recomendaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {utilizacionPromedio > 90 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-semibold text-red-800">Sobrecarga del Equipo</span>
                </div>
                <p className="text-sm text-red-700">
                  La utilización promedio del equipo es del {utilizacionPromedio.toFixed(1)}%. Considera contratar más
                  personal o redistribuir la carga de trabajo.
                </p>
              </div>
            )}

            {proyectosPlanificacion > proyectosActivos && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-800">Pipeline de Proyectos</span>
                </div>
                <p className="text-sm text-blue-700">
                  Tienes {proyectosPlanificacion} proyectos en planificación. Revisa la capacidad del equipo antes de
                  iniciarlos.
                </p>
              </div>
            )}

            {state.colaboradores.some((c) => c.disponibilidad < 100) && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Disponibilidad Reducida</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Algunos colaboradores tienen disponibilidad reducida. Ajusta las asignaciones de proyecto en
                  consecuencia.
                </p>
              </div>
            )}

            {utilizacionPromedio < 50 && state.colaboradores.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-green-800">Capacidad Disponible</span>
                </div>
                <p className="text-sm text-green-700">
                  El equipo tiene capacidad disponible ({utilizacionPromedio.toFixed(1)}% utilización). Es un buen
                  momento para tomar nuevos proyectos.
                </p>
              </div>
            )}

            {state.proyectos.length === 0 && state.colaboradores.length === 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <span className="font-semibold text-gray-800">Comenzar</span>
                </div>
                <p className="text-sm text-gray-700">
                  Comienza agregando colaboradores y creando tu primer proyecto para ver el análisis completo.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Alertas del Sistema
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {utilizacionPromedio > 90 && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-800">Sobrecarga del equipo</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">El equipo está trabajando al {utilizacionPromedio.toFixed(1)}%</p>
                </div>
              )}
              
              {proyectosActivos === 0 && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Sin proyectos activos</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">Considera activar proyectos pendientes</p>
                </div>
              )}
              
              {state.colaboradores.length < 3 && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">Equipo pequeño</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1">Considera ampliar el equipo para mayor capacidad</p>
                </div>
              )}
              
              {utilizacionPromedio < 50 && state.colaboradores.length > 0 && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800">Capacidad disponible</span>
                  </div>
                  <p className="text-xs text-emerald-600 mt-1">El equipo tiene capacidad para más proyectos</p>
                </div>
              )}
              
              {state.colaboradores.length === 0 && state.proyectos.length === 0 && (
                <div className="p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-800">¡Comienza aquí!</span>
                  </div>
                  <p className="text-xs text-indigo-600 mt-1">Agrega colaboradores y proyectos para empezar</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Rendimiento Financiero
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-800">Margen Promedio</span>
                  <span className="text-lg font-bold text-emerald-700">
                    {state.proyectos.length > 0 
                      ? (state.proyectos.reduce((sum, p) => sum + p.margenDeseado, 0) / state.proyectos.length).toFixed(1)
                      : "0"
                    }%
                  </span>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">ROI Estimado</span>
                  <span className="text-lg font-bold text-blue-700">
                    {ingresosPotenciales > 0 && costoMensualTotal > 0
                      ? ((ingresosPotenciales - costoMensualTotal * 6) / (costoMensualTotal * 6) * 100).toFixed(1)
                      : "0"
                    }%
                  </span>
                </div>
              </div>
              
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-800">Costo por Hora</span>
                  <span className="text-lg font-bold text-purple-700">
                    ₲{state.colaboradores.length > 0 
                      ? (costoMensualTotal / (state.colaboradores.reduce((sum, c) => sum + c.horasMensuales, 0) || 1)).toLocaleString()
                      : "0"
                    }
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                Actividad Reciente
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100/50 border border-slate-200">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">Sistema inicializado</p>
                  <p className="text-xs text-slate-500">Hace 2 minutos</p>
                </div>
              </div>
              
              {state.proyectos.length > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800">Proyecto actualizado</p>
                    <p className="text-xs text-blue-600">{state.proyectos[0].nombre}</p>
                  </div>
                </div>
              )}
              
              {state.colaboradores.length > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-800">Nuevo colaborador</p>
                    <p className="text-xs text-purple-600">{state.colaboradores[state.colaboradores.length - 1]?.nombre}</p>
                  </div>
                </div>
              )}
              
              <div className="text-center pt-2">
                <span className="text-xs text-slate-400 font-medium">Todos los sistemas operativos</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
