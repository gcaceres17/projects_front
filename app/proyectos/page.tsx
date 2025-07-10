"use client"

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
import { useApp, type Proyecto, type ProyectoColaborador } from "@/components/app-provider"
import { proyectosService } from "@/services/proyectos"
import { Plus, Calculator, FolderOpen, Settings, Sparkles, DollarSign, Target, Briefcase, Users, Zap, Shield, Edit, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function ProyectosPage() {
  const { state, dispatch } = useApp()
  const router = useRouter()

  // Estado para datos de API únicamente
  const [proyectos, setProyectos] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    duracionMeses: 6,
    tipo: "desarrollo" as "desarrollo" | "mantenimiento" | "consultoria" | "qa",
    complejidad: "media" as "baja" | "media" | "alta" | "critica",
    metodologia: "agile" as "agile" | "waterfall" | "hybrid",
    margenDeseado: 20,
    tasaCambio: 7300,
    factorRiesgoProyecto: 1.1,
    colaboradores: [] as ProyectoColaborador[],
    gastosAdicionales: {
      infraestructura: 0,
      licencias: 0,
      capacitacion: 0,
      otros: 0,
    },
  })

  // Cargar proyectos de la API al inicializar
  useEffect(() => {
    const loadProyectos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const proyectosData = await proyectosService.list();
        setProyectos(proyectosData);
      } catch (error: unknown) {
        const errorMessage = (error as Error)?.message || 'Error de conexión';
        setError(errorMessage);
        console.error('Error cargando proyectos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProyectos();
  }, []);

  // Solo usar proyectos de la API
  const getProyectos = () => {
    return proyectos;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Solo usar API - no fallback local
      const nuevoProyecto = await proyectosService.create({
        nombre: formData.nombre,
        descripcion: `Proyecto ${formData.tipo} con metodología ${formData.metodologia}`,
        presupuesto: 0, // Se calculará
        estado: 'planificacion',
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin_estimada: new Date(Date.now() + formData.duracionMeses * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cliente_id: 1, // Temporal - necesitaría selector de cliente
      });
      
      // Recargar proyectos
      const proyectosActualizados = await proyectosService.list();
      setProyectos(proyectosActualizados);
      
      console.log('Proyecto creado en API:', nuevoProyecto);
      
      // Reset form
      setFormData({
        nombre: "",
        duracionMeses: 6,
        tipo: "desarrollo",
        complejidad: "media",
        metodologia: "agile",
        margenDeseado: 20,
        tasaCambio: 7300,
        factorRiesgoProyecto: 1.1,
        colaboradores: [],
        gastosAdicionales: {
          infraestructura: 0,
          licencias: 0,
          capacitacion: 0,
          otros: 0,
        },
      })
      
    } catch (error) {
      console.error('Error creando proyecto:', error);
      // Mostrar error al usuario sin fallback
      alert('Error al crear proyecto. Verifique la conexión con el servidor.');
    }
  }

  const handleColaboradorChange = (colaboradorId: string, checked: boolean, horas: number = 160) => {
    if (checked) {
      const colaborador = state.colaboradores.find(c => c.id === colaboradorId)
      if (colaborador) {
        setFormData({
          ...formData,
          colaboradores: [...formData.colaboradores, { 
            colaboradorId, 
            horasAsignadas: horas,
            recargo: 0,
            rolEnProyecto: colaborador.rol
          }],
        })
      }
    } else {
      setFormData({
        ...formData,
        colaboradores: formData.colaboradores.filter(c => c.colaboradorId !== colaboradorId),
      })
    }
  }

  const handleHorasChange = (colaboradorId: string, horas: number) => {
    setFormData({
      ...formData,
      colaboradores: formData.colaboradores.map(c => 
        c.colaboradorId === colaboradorId ? { ...c, horasAsignadas: horas } : c
      ),
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto?')) {
      return;
    }

    try {
      await proyectosService.delete(parseInt(id));
      // Recargar proyectos
      const proyectosActualizados = await proyectosService.list();
      setProyectos(proyectosActualizados);
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error eliminando proyecto';
      alert(`Error: ${errorMessage}`);
    }
  }

  const calcularCostoTotal = (proyecto: Proyecto) => {
    let costoTotal = 0
    proyecto.colaboradores.forEach(pc => {
      const colaborador = state.colaboradores.find(c => c.id === pc.colaboradorId)
      if (colaborador) {
        const costoPorHora = colaborador.salarioBruto / colaborador.horasMensuales
        costoTotal += costoPorHora * pc.horasAsignadas * proyecto.duracionMeses
      }
    })
    
    const gastosExtras = Object.values(proyecto.gastosAdicionales).reduce((a: number, b: number) => a + b, 0)
    return costoTotal + gastosExtras
  }

  const calcularPrecioConMargen = (proyecto: Proyecto) => {
    const costoTotal = calcularCostoTotal(proyecto)
    return costoTotal * (1 + proyecto.margenDeseado / 100)
  }

  const totalProyectos = proyectos.length;
  const proyectosActivos = proyectos.filter((p: any) => p.estado === 'activo').length;
  const valorTotalCartera = proyectos.reduce((total: number, proyecto: any) => {
    return total + (proyecto.presupuesto || 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg">
              <FolderOpen className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Gestión de Proyectos
            </h1>
          </div>
          <p className="text-primary-enhanced text-lg">
            Planifica, gestiona y supervisa todos tus proyectos de desarrollo
          </p>
          
          {/* API Status Indicators */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isLoading 
                ? 'bg-yellow-100 text-yellow-700' 
                : error
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
            }`}>
              {isLoading ? (
                <>🔄 Cargando API...</>
              ) : error ? (
                <>❌ Error de API</>
              ) : (
                <>✅ API Conectada ({proyectos.length} proyectos)</>
              )}
            </div>
            {error && (
              <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                ⚠️ {error.substring(0, 30)}...
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Proyectos"
            value={totalProyectos}
            icon={Briefcase}
            trend={{ value: 0, label: "neutral", isPositive: true }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
          />
          <StatCard
            title="Proyectos Activos"
            value={proyectosActivos}
            icon={Zap}
            trend={{ value: 0, label: "up", isPositive: true }}
            className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/30"
          />
          <StatCard
            title="Valor Total Cartera"
            value={`₲${valorTotalCartera.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 0, label: "up", isPositive: true }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
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
                    <Label htmlFor="nombre" className="label-enhanced">Nombre del Proyecto</Label>
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
                    <Label htmlFor="duracion" className="label-enhanced">Duración (meses)</Label>
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
                    <Label htmlFor="tipo" className="label-enhanced">Tipo de Proyecto</Label>
                    <Select value={formData.tipo} onValueChange={(value: "desarrollo" | "mantenimiento" | "consultoria" | "qa") => setFormData({ ...formData, tipo: value })}>
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
                    <Label htmlFor="tasa" className="label-enhanced">Tasa de Cambio (₲)</Label>
                    <Input
                      id="tasa"
                      type="number"
                      step="0.01"
                      value={formData.tasaCambio}
                      onChange={(e) => setFormData({ ...formData, tasaCambio: Number(e.target.value) })}
                      required
                      className="futuristic-input"
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
                    <Label htmlFor="complejidad" className="label-enhanced">Complejidad</Label>
                    <Select value={formData.complejidad} onValueChange={(value: "baja" | "media" | "alta" | "critica") => setFormData({ ...formData, complejidad: value })}>
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
                    <Label htmlFor="metodologia" className="label-enhanced">Metodología</Label>
                    <Select value={formData.metodologia} onValueChange={(value: "agile" | "waterfall" | "hybrid") => setFormData({ ...formData, metodologia: value })}>
                      <SelectTrigger className="futuristic-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agile">Agile</SelectItem>
                        <SelectItem value="waterfall">Waterfall</SelectItem>
                        <SelectItem value="hybrid">Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="input-group">
                    <Label htmlFor="margen" className="label-enhanced">Margen Deseado (%)</Label>
                    <Input
                      id="margen"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.margenDeseado}
                      onChange={(e) => setFormData({ ...formData, margenDeseado: Number(e.target.value) })}
                      required
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="factorRiesgo" className="label-enhanced">Factor de Riesgo</Label>
                    <Input
                      id="factorRiesgo"
                      type="number"
                      min="1"
                      max="2"
                      step="0.1"
                      value={formData.factorRiesgoProyecto}
                      onChange={(e) => setFormData({ ...formData, factorRiesgoProyecto: Number(e.target.value) })}
                      required
                      className="futuristic-input"
                    />
                  </div>
                </div>
              </div>

              {/* Gastos Adicionales */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-green-400" />
                  Gastos Adicionales (USD)
                </h3>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="input-group">
                    <Label htmlFor="infraestructura" className="label-enhanced">Infraestructura ($)</Label>
                    <Input
                      id="infraestructura"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.gastosAdicionales.infraestructura}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        gastosAdicionales: { ...formData.gastosAdicionales, infraestructura: Number(e.target.value) }
                      })}
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="licencias" className="label-enhanced">Licencias ($)</Label>
                    <Input
                      id="licencias"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.gastosAdicionales.licencias}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        gastosAdicionales: { ...formData.gastosAdicionales, licencias: Number(e.target.value) }
                      })}
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="capacitacion" className="label-enhanced">Capacitación ($)</Label>
                    <Input
                      id="capacitacion"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.gastosAdicionales.capacitacion}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        gastosAdicionales: { ...formData.gastosAdicionales, capacitacion: Number(e.target.value) }
                      })}
                      className="futuristic-input"
                    />
                  </div>

                  <div className="input-group">
                    <Label htmlFor="otros" className="label-enhanced">Otros Gastos ($)</Label>
                    <Input
                      id="otros"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.gastosAdicionales.otros}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        gastosAdicionales: { ...formData.gastosAdicionales, otros: Number(e.target.value) }
                      })}
                      className="futuristic-input"
                    />
                  </div>
                </div>
              </div>

              {/* Colaboradores */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-cyan-400" />
                  Asignación de Colaboradores
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {state.colaboradores.map((colaborador) => {
                    const colaboradorAsignado = formData.colaboradores.find(c => c.colaboradorId === colaborador.id)
                    const costoPorHora = colaborador.salarioBruto / colaborador.horasMensuales
                    
                    return (
                      <div key={colaborador.id} className="border border-gray-600 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`colaborador-${colaborador.id}`}
                              checked={!!colaboradorAsignado}
                              onCheckedChange={(checked: boolean) => handleColaboradorChange(colaborador.id, checked)}
                            />
                            <div>
                              <Label htmlFor={`colaborador-${colaborador.id}`} className="text-primary-enhanced font-medium">
                                {colaborador.nombre}
                              </Label>
                              <p className="text-sm text-muted-enhanced">
                                {colaborador.rol} - {colaborador.nivel}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-money">₲{costoPorHora.toLocaleString()}/hora</p>
                            <p className="text-sm text-muted-enhanced">
                              {colaborador.disponibilidad}% disponible
                            </p>
                          </div>
                        </div>
                        
                        {colaboradorAsignado && (
                          <div className="input-group">
                            <Label className="label-enhanced">Horas Asignadas</Label>
                            <Input
                              type="number"
                              min="1"
                              max={colaborador.horasMensuales * (colaborador.disponibilidad / 100)}
                              value={colaboradorAsignado.horasAsignadas}
                              onChange={(e) => handleHorasChange(colaborador.id, Number(e.target.value))}
                              className="futuristic-input"
                            />
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
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Proyectos Activos
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="table-header-enhanced">Proyecto</TableHead>
                    <TableHead className="table-header-enhanced">Tipo</TableHead>
                    <TableHead className="table-header-enhanced">Estado</TableHead>
                    <TableHead className="table-header-enhanced">Duración</TableHead>
                    <TableHead className="table-header-enhanced">Colaboradores</TableHead>
                    <TableHead className="table-header-enhanced">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <p>Cargando proyectos...</p>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-red-600">
                        <p>Error: {error}</p>
                      </TableCell>
                    </TableRow>
                  ) : proyectos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <FolderOpen className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-primary-enhanced text-lg">No hay proyectos configurados</p>
                        <p className="text-secondary-enhanced text-sm">Crea tu primer proyecto para comenzar</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    proyectos.map((proyecto: any) => (
                      <TableRow key={proyecto.id} className="border-gray-700 table-row-hover">
                        <TableCell className="table-cell-enhanced">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500">
                              <FolderOpen className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <Link href={`/proyectos/${proyecto.id}`} className="text-primary-enhanced hover:text-blue-300 transition-colors">
                                {proyecto.nombre}
                              </Link>
                              <p className="text-sm text-muted-enhanced">
                                {proyecto.descripcion || 'Sin descripción'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <Badge className="badge-info">
                            Desarrollo
                          </Badge>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            proyecto.estado === 'activo' ? 'status-activo' :
                            proyecto.estado === 'planificacion' ? 'status-planificacion' :
                            'status-pausado'
                          }`}>
                            {proyecto.estado || 'planificacion'}
                          </div>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <span className="text-number">
                            {proyecto.fecha_fin_estimada 
                              ? Math.ceil((new Date(proyecto.fecha_fin_estimada).getTime() - new Date(proyecto.fecha_inicio).getTime()) / (1000 * 60 * 60 * 24 * 30))
                              : 'N/A'
                            } meses
                          </span>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <span className="text-number">N/A</span>
                        </TableCell>
                        <TableCell className="table-cell-enhanced">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/proyectos/${proyecto.id}`)}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(proyecto.id.toString())}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
  )
}