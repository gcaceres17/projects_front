"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/ui/stat-card"
import { useApp } from "@/components/app-provider"
import { FileText, Download, Calculator, DollarSign, Clock, Users, TrendingUp, Sparkles, Target, Award } from "lucide-react"

export default function Cotizaciones() {
  const searchParams = useSearchParams()
  const proyectoId = searchParams.get("proyecto")
  const { state } = useApp()

  const proyecto = state.proyectos.find((p) => p.id === proyectoId)

  if (!proyecto) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Cotizaciones
              </h1>
            </div>
            <p className="text-gray-300 text-lg">
              Genera cotizaciones profesionales para tus proyectos
            </p>
          </div>

          {/* No Project Selected */}
          <Card className="glassmorphism border-indigo-500/30 hover:border-indigo-400/50 transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <CardTitle className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Seleccionar Proyecto
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-indigo-400 mx-auto mb-6 opacity-50" />
                <p className="text-gray-300 text-lg mb-4">No se ha seleccionado ningún proyecto para cotizar</p>
                <p className="text-secondary-enhanced text-sm mb-6">
                  Selecciona un proyecto desde la página de proyectos para generar su cotización
                </p>
                <Button 
                  onClick={() => window.location.href = '/proyectos'}
                  className="btn-futuristic"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Ir a Proyectos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const calcularCotizacion = () => {
    const detalles = proyecto.colaboradores.map((pc) => {
      const colaborador = state.colaboradores.find((c) => c.id === pc.colaboradorId)!

      const costosRigidosAplicados = state.costosRigidos
        .filter((costo) => colaborador.costosRigidos.includes(costo.id))
        .reduce((total, costo) => {
          if (costo.tipo === "porcentaje") {
            return total + (colaborador.salarioBruto * costo.valor) / 100
          } else {
            return total + costo.valor
          }
        }, 0)

      const costoMensualBruto = colaborador.salarioBruto + costosRigidosAplicados
      const recargoAplicado = costoMensualBruto * (pc.recargo / 100)
      const subtotalMensual = costoMensualBruto + recargoAplicado
      const totalPorDuracion = subtotalMensual * proyecto.duracionMeses

      return {
        colaborador,
        costoMensualBruto,
        costosRigidosAplicados,
        recargoAplicado,
        recargoPorcentaje: pc.recargo,
        subtotalMensual,
        totalPorDuracion,
        costoPorHora: subtotalMensual / colaborador.horasMensuales,
        ventaPorHora: (subtotalMensual / colaborador.horasMensuales) * 1.2, // 20% margen ejemplo
      }
    })

    const totalSinIVA = detalles.reduce((sum, d) => sum + d.totalPorDuracion, 0)
    const iva = totalSinIVA * 0.1 // 10% IVA
    const totalConIVA = totalSinIVA + iva
    const margenEstimado = totalSinIVA * 0.2 // 20% margen estimado

    return {
      detalles,
      totalSinIVA,
      iva,
      totalConIVA,
      margenEstimado,
    }
  }

  const cotizacion = calcularCotizacion()

  const generarPDF = () => {
    // Aquí implementarías la generación del PDF
    alert("Funcionalidad de PDF en desarrollo")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg">
              <Calculator className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Cotización del Proyecto
            </h1>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-white">{proyecto.nombre}</h2>
            <p className="text-gray-300 text-lg">
              Duración: {proyecto.duracionMeses} meses • Tasa: ₲{proyecto.tasaCambio.toLocaleString()}/USD
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <StatCard
            title="Total sin IVA"
            value={`₲${cotizacion.totalSinIVA.toLocaleString()}`}
            icon={DollarSign}
            trend={{ 
              value: Math.round(cotizacion.totalSinIVA / proyecto.tasaCambio),
              label: `$${(cotizacion.totalSinIVA / proyecto.tasaCambio).toLocaleString()} USD`,
              isPositive: true 
            }}
            className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30"
          />
          <StatCard
            title="IVA (10%)"
            value={`₲${cotizacion.iva.toLocaleString()}`}
            icon={TrendingUp}
            trend={{ 
              value: Math.round(cotizacion.iva / proyecto.tasaCambio),
              label: `$${(cotizacion.iva / proyecto.tasaCambio).toLocaleString()} USD`,
              isPositive: true 
            }}
            className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/30"
          />
          <StatCard
            title="Total con IVA"
            value={`₲${cotizacion.totalConIVA.toLocaleString()}`}
            icon={Award}
            trend={{ 
              value: Math.round(cotizacion.totalConIVA / proyecto.tasaCambio),
              label: `$${(cotizacion.totalConIVA / proyecto.tasaCambio).toLocaleString()} USD`,
              isPositive: true 
            }}
            className="bg-gradient-to-br from-green-500/20 to-blue-500/20 border-green-500/30"
          />
          <StatCard
            title="Margen Estimado"
            value={`₲${cotizacion.margenEstimado.toLocaleString()}`}
            icon={Target}
            trend={{ 
              value: 20,
              label: "20% del total",
              isPositive: true 
            }}
            className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
          />
        </div>

        {/* Detalle por Colaborador */}
        <Card className="glassmorphism border-purple-500/30 hover:border-purple-400/50 transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Detalle por Colaborador
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300 min-w-[150px]">Colaborador</TableHead>
                    <TableHead className="text-gray-300 min-w-[120px]">Costo Mensual Bruto</TableHead>
                    <TableHead className="text-gray-300 min-w-[120px]">Costos Rígidos</TableHead>
                    <TableHead className="text-gray-300 min-w-[100px]">Recargo (%)</TableHead>
                    <TableHead className="text-gray-300 min-w-[120px]">Subtotal Mensual</TableHead>
                    <TableHead className="text-gray-300 min-w-[120px]">Total Proyecto</TableHead>
                    <TableHead className="text-gray-300 min-w-[100px]">Costo/Hora</TableHead>
                    <TableHead className="text-gray-300 min-w-[100px]">Venta/Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cotizacion.detalles.map((detalle, index) => (
                    <TableRow key={index} className="border-gray-700 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">{detalle.colaborador.nombre}</TableCell>
                      <TableCell className="text-gray-300 font-mono">₲{detalle.colaborador.salarioBruto.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-300 font-mono">₲{detalle.costosRigidosAplicados.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-300">
                        <div>
                          <span className="font-semibold">{detalle.recargoPorcentaje}%</span>
                          <div className="text-xs text-muted-enhanced">
                            (₲{detalle.recargoAplicado.toLocaleString()})
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white font-mono">₲{detalle.subtotalMensual.toLocaleString()}</TableCell>
                      <TableCell className="font-medium text-white font-mono">₲{detalle.totalPorDuracion.toLocaleString()}</TableCell>
                      <TableCell className="text-gray-300 font-mono">₲{Math.round(detalle.costoPorHora).toLocaleString()}</TableCell>
                      <TableCell className="text-green-400 font-medium font-mono">
                        ₲{Math.round(detalle.ventaPorHora).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Acciones */}
        <div className="flex justify-end">
          <Button onClick={generarPDF} className="btn-futuristic">
            <Download className="h-4 w-4 mr-2" />
            Generar PDF para Firma de Gerencia
          </Button>
        </div>
      </div>
    </div>
  )
}
