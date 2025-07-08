"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useApp, type Proyecto } from "@/components/app-provider"
import { FileText, Download } from "lucide-react"

interface PDFReportGeneratorProps {
  proyecto: Proyecto
}

export function PDFReportGenerator({ proyecto }: PDFReportGeneratorProps) {
  const { state } = useApp()

  const calcularCostoColaborador = (pc: typeof proyecto.colaboradores[0]) => {
    const colaborador = state.colaboradores.find((c) => c.id === pc.colaboradorId)
    if (!colaborador) return 0

    const costosRigidosAplicados = state.costosRigidos
      .filter((costo) => colaborador.costosRigidos.includes(costo.id))
      .reduce((total, costo) => {
        if (costo.tipo === "porcentaje") {
          return total + (colaborador.salarioBruto * costo.valor) / 100
        } else {
          return total + costo.valor
        }
      }, 0)

    const costoBasePorHora = (colaborador.salarioBruto + costosRigidosAplicados) / colaborador.horasMensuales
    const costoPorHoraConRecargo = pc.costoPorHoraCustom || costoBasePorHora * (1 + pc.recargo / 100)

    return costoPorHoraConRecargo * pc.horasAsignadas
  }

  const calcularTotales = () => {
    const costoColaboradores = proyecto.colaboradores.reduce((total, pc) => {
      return total + calcularCostoColaborador(pc)
    }, 0)

    const gastosAdicionales = Object.values(proyecto.gastosAdicionales).reduce((a, b) => a + b, 0)
    const costoTotal = (costoColaboradores + gastosAdicionales) * proyecto.duracionMeses
    const costoConRiesgo = costoTotal * (proyecto.factorRiesgoProyecto || 1.1)
    const margen = costoConRiesgo * (proyecto.margenDeseado / 100)
    const precioVenta = costoConRiesgo + margen

    return {
      costoColaboradores: costoColaboradores * proyecto.duracionMeses,
      gastosAdicionales: gastosAdicionales * proyecto.duracionMeses,
      costoTotal,
      costoConRiesgo,
      margen,
      precioVenta,
      iva: precioVenta * 0.1,
      precioFinal: precioVenta * 1.1,
    }
  }

  const generarInformePDF = () => {
    const totales = calcularTotales()
    const fechaActual = new Date().toLocaleDateString("es-PY")

    // Crear contenido HTML para el PDF
    const contenidoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Informe de Proyecto - ${proyecto.nombre}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            line-height: 1.6; 
            color: #333;
          }
          .header { 
            text-align: center; 
            border-bottom: 3px solid #2563eb; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
          }
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            color: #2563eb; 
            margin-bottom: 5px;
          }
          .report-title { 
            font-size: 20px; 
            margin: 10px 0; 
          }
          .project-name { 
            font-size: 18px; 
            color: #666; 
          }
          .section { 
            margin: 30px 0; 
            page-break-inside: avoid;
          }
          .section-title { 
            font-size: 16px; 
            font-weight: bold; 
            color: #2563eb; 
            border-bottom: 1px solid #e5e7eb; 
            padding-bottom: 5px; 
            margin-bottom: 15px;
          }
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin: 15px 0;
          }
          .info-item { 
            padding: 10px; 
            background: #f9fafb; 
            border-radius: 5px;
          }
          .info-label { 
            font-weight: bold; 
            color: #374151;
          }
          .info-value { 
            color: #6b7280; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0;
          }
          th, td { 
            border: 1px solid #e5e7eb; 
            padding: 12px; 
            text-align: left;
          }
          th { 
            background-color: #f3f4f6; 
            font-weight: bold;
          }
          .financial-summary { 
            background: #f0f9ff; 
            border: 2px solid #0ea5e9; 
            border-radius: 8px; 
            padding: 20px; 
            margin: 20px 0;
          }
          .total-amount { 
            font-size: 24px; 
            font-weight: bold; 
            color: #0ea5e9; 
            text-align: center; 
            margin: 10px 0;
          }
          .signature-section { 
            margin-top: 60px; 
            page-break-inside: avoid;
          }
          .signature-box { 
            border: 1px solid #d1d5db; 
            height: 80px; 
            margin: 20px 0; 
            display: flex; 
            align-items: end; 
            padding: 10px;
          }
          .footer { 
            margin-top: 40px; 
            text-align: center; 
            font-size: 12px; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb; 
            padding-top: 20px;
          }
          .badge { 
            display: inline-block; 
            padding: 4px 8px; 
            background: #e5e7eb; 
            border-radius: 4px; 
            font-size: 12px; 
            margin: 2px;
          }
          .risk-analysis { 
            background: #fef3c7; 
            border: 1px solid #f59e0b; 
            border-radius: 5px; 
            padding: 15px; 
            margin: 15px 0;
          }
          @media print {
            body { margin: 20px; }
            .section { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">CLT PROJECTS</div>
          <div class="report-title">INFORME DETALLADO DE PROYECTO</div>
          <div class="project-name">${proyecto.nombre}</div>
          <div style="margin-top: 10px; color: #666;">Fecha: ${fechaActual}</div>
        </div>

        <div class="section">
          <div class="section-title">INFORMACIÓN GENERAL DEL PROYECTO</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Nombre del Proyecto:</div>
              <div class="info-value">${proyecto.nombre}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Tipo de Proyecto:</div>
              <div class="info-value">${proyecto.tipo}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Duración:</div>
              <div class="info-value">${proyecto.duracionMeses} meses</div>
            </div>
            <div class="info-item">
              <div class="info-label">Complejidad:</div>
              <div class="info-value">${proyecto.complejidad}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Metodología:</div>
              <div class="info-value">${proyecto.metodologia}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Estado:</div>
              <div class="info-value">${proyecto.estado}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">EQUIPO DE TRABAJO</div>
          <table>
            <thead>
              <tr>
                <th>Colaborador</th>
                <th>Rol en Proyecto</th>
                <th>Nivel</th>
                <th>Horas Asignadas</th>
                <th>Recargo</th>
                <th>Costo Mensual</th>
              </tr>
            </thead>
            <tbody>
              ${proyecto.colaboradores
                .map((pc) => {
                  const colaborador = state.colaboradores.find((c) => c.id === pc.colaboradorId)
                  if (!colaborador) return ""
                  const costoMensual = calcularCostoColaborador(pc)
                  return `
                  <tr>
                    <td>${colaborador.nombre}</td>
                    <td>${pc.rolEnProyecto}</td>
                    <td><span class="badge">${colaborador.nivel}</span></td>
                    <td>${pc.horasAsignadas}h</td>
                    <td>${pc.recargo}%</td>
                    <td>₲${costoMensual.toLocaleString()}</td>
                  </tr>
                `
                })
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">ANÁLISIS FINANCIERO</div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Costo de Colaboradores:</div>
              <div class="info-value">₲${totales.costoColaboradores.toLocaleString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Gastos Adicionales:</div>
              <div class="info-value">₲${totales.gastosAdicionales.toLocaleString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Subtotal:</div>
              <div class="info-value">₲${totales.costoTotal.toLocaleString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Factor de Riesgo:</div>
              <div class="info-value">${(proyecto.factorRiesgoProyecto || 1.1).toFixed(1)}x</div>
            </div>
            <div class="info-item">
              <div class="info-label">Costo con Riesgo:</div>
              <div class="info-value">₲${totales.costoConRiesgo.toLocaleString()}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Margen (${proyecto.margenDeseado}%):</div>
              <div class="info-value">₲${totales.margen.toLocaleString()}</div>
            </div>
          </div>

          <div class="risk-analysis">
            <strong>Análisis de Riesgo:</strong><br>
            Factor de riesgo aplicado: ${(proyecto.factorRiesgoProyecto || 1.1).toFixed(1)}x<br>
            Incremento por riesgo: ₲${(totales.costoConRiesgo - totales.costoTotal).toLocaleString()}
          </div>
        </div>

        <div class="financial-summary">
          <div class="section-title" style="text-align: center; border: none; color: #0ea5e9;">RESUMEN FINANCIERO FINAL</div>
          <table style="margin: 20px 0;">
            <tr>
              <td><strong>Precio de Venta (sin IVA):</strong></td>
              <td style="text-align: right;"><strong>₲${totales.precioVenta.toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td>IVA (10%):</td>
              <td style="text-align: right;">₲${totales.iva.toLocaleString()}</td>
            </tr>
            <tr style="background: #e0f2fe;">
              <td><strong>PRECIO FINAL:</strong></td>
              <td style="text-align: right;"><strong>₲${totales.precioFinal.toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td><strong>Equivalente en USD:</strong></td>
              <td style="text-align: right;"><strong>$${(totales.precioFinal / proyecto.tasaCambio).toLocaleString()}</strong></td>
            </tr>
          </table>
          <div class="total-amount">TOTAL: ₲${totales.precioFinal.toLocaleString()}</div>
        </div>

        <div class="section">
          <div class="section-title">DESGLOSE DE GASTOS ADICIONALES</div>
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Costo Mensual</th>
                <th>Costo Total (${proyecto.duracionMeses} meses)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Infraestructura</td>
                <td>₲${proyecto.gastosAdicionales.infraestructura.toLocaleString()}</td>
                <td>₲${(proyecto.gastosAdicionales.infraestructura * proyecto.duracionMeses).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Licencias</td>
                <td>₲${proyecto.gastosAdicionales.licencias.toLocaleString()}</td>
                <td>₲${(proyecto.gastosAdicionales.licencias * proyecto.duracionMeses).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Capacitación</td>
                <td>₲${proyecto.gastosAdicionales.capacitacion.toLocaleString()}</td>
                <td>₲${(proyecto.gastosAdicionales.capacitacion * proyecto.duracionMeses).toLocaleString()}</td>
              </tr>
              <tr>
                <td>Otros</td>
                <td>₲${proyecto.gastosAdicionales.otros.toLocaleString()}</td>
                <td>₲${(proyecto.gastosAdicionales.otros * proyecto.duracionMeses).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="signature-section">
          <div class="section-title">APROBACIONES</div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px;">
            <div>
              <div style="margin-bottom: 10px;"><strong>Gerente de Proyecto:</strong></div>
              <div class="signature-box"></div>
              <div style="text-align: center; margin-top: 5px;">Firma y Fecha</div>
            </div>
            <div>
              <div style="margin-bottom: 10px;"><strong>Gerencia General:</strong></div>
              <div class="signature-box"></div>
              <div style="text-align: center; margin-top: 5px;">Firma y Fecha</div>
            </div>
          </div>
        </div>

        <div class="footer">
          <div>CLT Projects - Sistema de Gestión de Proyectos</div>
          <div>Documento generado automáticamente el ${fechaActual}</div>
          <div style="margin-top: 10px;">
            <strong>Confidencial:</strong> Este documento contiene información confidencial y está destinado únicamente para uso interno de la empresa.
          </div>
        </div>
      </body>
      </html>
    `

    // Crear y descargar el PDF
    const ventana = window.open("", "_blank")
    if (ventana) {
      ventana.document.write(contenidoHTML)
      ventana.document.close()

      // Esperar a que se cargue el contenido antes de imprimir
      setTimeout(() => {
        ventana.print()
      }, 500)
    }
  }

  const totales = calcularTotales()

  return (
    <Card className="border-l-4 border-l-purple-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generar Informe para Gerencia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Precio Final</div>
            <div className="text-xl font-bold text-blue-600">₲{totales.precioFinal.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              ${(totales.precioFinal / proyecto.tasaCambio).toLocaleString()}
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Margen</div>
            <div className="text-xl font-bold text-green-600">₲{totales.margen.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{proyecto.margenDeseado}%</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-muted-foreground">Duración</div>
            <div className="text-xl font-bold">{proyecto.duracionMeses}</div>
            <div className="text-xs text-muted-foreground">meses</div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">El informe incluye:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 ml-4">
            <li>• Información completa del proyecto</li>
            <li>• Detalle del equipo de trabajo</li>
            <li>• Análisis financiero detallado</li>
            <li>• Desglose de costos y gastos</li>
            <li>• Sección de firmas para aprobación</li>
            <li>• Formato profesional para presentación</li>
          </ul>
        </div>

        <Button onClick={generarInformePDF} className="w-full flex items-center gap-2" size="lg">
          <Download className="h-4 w-4" />
          Generar Informe PDF para Firma de Gerencia
        </Button>
      </CardContent>
    </Card>
  )
}
