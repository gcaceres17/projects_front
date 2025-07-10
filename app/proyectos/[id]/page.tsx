"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ProjectCalculator } from "@/components/project-calculator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Target, Settings, FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { PDFReportGenerator } from "@/components/pdf-report-generator"
import { proyectosService, type Proyecto as APIProyecto } from "@/services/proyectos"
import { type Proyecto as LocalProyecto } from "@/components/app-provider"

// Función para convertir proyecto de API a formato local
const convertApiProjectToLocal = (apiProject: APIProyecto): LocalProyecto => {
  return {
    id: apiProject.id.toString(),
    nombre: apiProject.nombre,
    duracionMeses: 3, // Valor por defecto, se puede calcular desde fechas
    tasaCambio: 1, // Valor por defecto
    colaboradores: [], // Array vacío por defecto
    tipo: "desarrollo", // Valor por defecto
    complejidad: "media", // Valor por defecto
    metodologia: "agile", // Valor por defecto
    margenDeseado: 20, // Valor por defecto
    factorRiesgoProyecto: 1.1, // Valor por defecto
    gastosAdicionales: {
      infraestructura: 0,
      licencias: 0,
      capacitacion: 0,
      otros: 0
    },
    fechaInicio: apiProject.fecha_inicio ? new Date(apiProject.fecha_inicio) : undefined,
    fechaFin: apiProject.fecha_fin_estimada ? new Date(apiProject.fecha_fin_estimada) : undefined,
    estado: apiProject.estado,
    cliente: "", // Se podría obtener de una relación
    descripcion: apiProject.descripcion
  }
}

// Función para convertir proyecto local a formato API
const convertLocalProjectToApi = (localProject: LocalProyecto): Partial<APIProyecto> => {
  return {
    nombre: localProject.nombre,
    descripcion: localProject.descripcion,
    estado: localProject.estado,
    fecha_inicio: localProject.fechaInicio?.toISOString().split('T')[0],
    fecha_fin_estimada: localProject.fechaFin?.toISOString().split('T')[0],
    presupuesto: 0, // Se podría calcular desde los costos
    horas_estimadas: localProject.duracionMeses * 160, // Estimación
  }
}

export default function ProyectoDetalle() {
  const params = useParams()
  const proyectoId = parseInt(params.id as string)
  
  const [apiProject, setApiProject] = useState<APIProyecto | null>(null)
  const [localProject, setLocalProject] = useState<LocalProyecto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  // Cargar proyecto desde la API
  useEffect(() => {
    const loadProyecto = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await proyectosService.getById(proyectoId)
        setApiProject(data)
        setLocalProject(convertApiProjectToLocal(data))
      } catch (err) {
        console.error('Error al cargar proyecto:', err)
        setError('Error al cargar el proyecto')
      } finally {
        setLoading(false)
      }
    }

    if (proyectoId && !isNaN(proyectoId)) {
      loadProyecto()
    } else {
      setError('ID de proyecto inválido')
      setLoading(false)
    }
  }, [proyectoId])

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Link href="/proyectos">
              <Button variant="outline" size="sm" className="glassmorphism border-white/20 hover:border-white/40 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Cargando proyecto...
            </h1>
          </div>
          <Card className="glassmorphism border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                <span className="text-gray-300 text-lg">Cargando proyecto...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )

  }

  // Mostrar error si el proyecto no se encontró o hubo un problema
  if (error || !localProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <Link href="/proyectos">
              <Button variant="outline" size="sm" className="glassmorphism border-white/20 hover:border-white/40 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
              {error || 'Proyecto no encontrado'}
            </h1>
          </div>
          <Card className="glassmorphism border-red-500/30">
            <CardContent className="p-6">
              <p className="text-center text-gray-300 text-lg">
                {error || 'El proyecto solicitado no existe.'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Función para actualizar el proyecto usando la API
  const handleUpdateProject = async (updatedProject: LocalProyecto) => {
    try {
      setUpdating(true)
      // Convertir el proyecto local a formato API y actualizar
      const updateData = convertLocalProjectToApi(updatedProject)
      
      const result = await proyectosService.update(proyectoId, updateData)
      setApiProject(result)
      setLocalProject(convertApiProjectToLocal(result))
    } catch (err) {
      console.error('Error al actualizar proyecto:', err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/proyectos">
            <Button variant="outline" size="sm" className="glassmorphism border-white/20 hover:border-white/40 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Proyectos
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Target className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {localProject.nombre}
              </h1>
              <p className="text-gray-300 text-lg">
                Configuración avanzada y cálculos del proyecto
              </p>
            </div>
          </div>
        </div>

        {/* Project Calculator */}
        <Card className="glassmorphism border-blue-500/30 hover:border-blue-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Calculadora de Proyecto
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ProjectCalculator 
              proyecto={localProject} 
              onUpdateProject={handleUpdateProject}
            />
          </CardContent>
        </Card>

        {/* PDF Report Generator */}
        <Card className="glassmorphism border-green-500/30 hover:border-green-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Generador de Reportes
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <PDFReportGenerator proyecto={localProject} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
