"use client"

import { useParams } from "next/navigation"
import { useApp } from "@/components/app-provider"
import { ProjectCalculator } from "@/components/project-calculator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Target, Settings, FileText } from "lucide-react"
import Link from "next/link"
import { PDFReportGenerator } from "@/components/pdf-report-generator"

export default function ProyectoDetalle() {
  const params = useParams()
  const { state, dispatch } = useApp()
  const proyectoId = params.id as string

  const proyecto = state.proyectos.find((p) => p.id === proyectoId)

  if (!proyecto) {
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
              Proyecto no encontrado
            </h1>
          </div>
          <Card className="glassmorphism border-red-500/30">
            <CardContent className="p-6">
              <p className="text-center text-gray-300 text-lg">El proyecto solicitado no existe.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleUpdateProject = (updatedProject: typeof proyecto) => {
    dispatch({ type: "UPDATE_PROYECTO", payload: updatedProject })
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
                {proyecto.nombre}
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
            <ProjectCalculator proyecto={proyecto} onUpdateProject={handleUpdateProject} />
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
            <PDFReportGenerator proyecto={proyecto} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
