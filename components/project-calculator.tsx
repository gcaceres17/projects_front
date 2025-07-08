"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { useApp, type Proyecto, type ProyectoColaborador } from "@/components/app-provider"
import { Calculator, TrendingUp, AlertTriangle, DollarSign, UserPlus, Trash2, Plus, X, Users } from "lucide-react"

interface ProjectCalculatorProps {
  proyecto: Proyecto
  onUpdateProject: (proyecto: Proyecto) => void
}

export function ProjectCalculator({ proyecto, onUpdateProject }: ProjectCalculatorProps) {
  const { state } = useApp()
  const [localProject, setLocalProject] = useState<Proyecto>({
    ...proyecto,
    factorRiesgoProyecto: proyecto.factorRiesgoProyecto || 1.1,
  })

  const [showAddCollaborator, setShowAddCollaborator] = useState(false)

  const calcularCostoColaborador = (pc: ProyectoColaborador) => {
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
    const costoColaboradores = localProject.colaboradores.reduce((total, pc) => {
      return total + calcularCostoColaborador(pc)
    }, 0)

    const gastosAdicionales = Object.values(localProject.gastosAdicionales).reduce((a, b) => a + b, 0)
    const costoTotal = (costoColaboradores + gastosAdicionales) * localProject.duracionMeses
    const costoConRiesgo = costoTotal * (localProject.factorRiesgoProyecto || 1.1)
    const margen = costoConRiesgo * (localProject.margenDeseado / 100)
    const precioVenta = costoConRiesgo + margen

    return {
      costoColaboradores: costoColaboradores * localProject.duracionMeses,
      gastosAdicionales: gastosAdicionales * localProject.duracionMeses,
      costoTotal,
      costoConRiesgo,
      margen,
      precioVenta,
      iva: precioVenta * 0.1,
      precioFinal: precioVenta * 1.1,
    }
  }

  const updateColaborador = (index: number, updates: Partial<ProyectoColaborador>) => {
    const newColaboradores = [...localProject.colaboradores]
    newColaboradores[index] = { ...newColaboradores[index], ...updates }
    setLocalProject({ ...localProject, colaboradores: newColaboradores })
  }

  const updateProject = (updates: Partial<Proyecto>) => {
    setLocalProject({ ...localProject, ...updates })
  }

  const saveChanges = () => {
    onUpdateProject(localProject)
  }

  const totales = calcularTotales()

  const getAvailableCollaborators = () => {
    return state.colaboradores.filter(
      (colaborador) => !localProject.colaboradores.some((pc) => pc.colaboradorId === colaborador.id),
    )
  }

  const addColaborador = (colaboradorId: string) => {
    const colaborador = state.colaboradores.find((c) => c.id === colaboradorId)
    if (!colaborador) return

    const newColaborador: ProyectoColaborador = {
      colaboradorId,
      recargo: 0,
      horasAsignadas: Math.min(colaborador.horasMensuales, 160),
      rolEnProyecto: colaborador.rol,
    }

    setLocalProject({
      ...localProject,
      colaboradores: [...localProject.colaboradores, newColaborador],
    })
    setShowAddCollaborator(false)
  }

  const removeColaborador = (index: number) => {
    const newColaboradores = localProject.colaboradores.filter((_, i) => i !== index)
    setLocalProject({ ...localProject, colaboradores: newColaboradores })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Configuración del Proyecto */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calculator className="h-5 w-5" />
            Configuración del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Margen Deseado (%)</Label>
              <div className="space-y-2">
                <Slider
                  value={[localProject.margenDeseado]}
                  onValueChange={([value]) => updateProject({ margenDeseado: value })}
                  max={50}
                  min={5}
                  step={1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground text-center">{localProject.margenDeseado}%</div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Factor de Riesgo</Label>
              <div className="space-y-2">
                <Slider
                  value={[localProject.factorRiesgoProyecto || 1.1]}
                  onValueChange={([value]) => updateProject({ factorRiesgoProyecto: value })}
                  max={2}
                  min={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground text-center">
                  {(localProject.factorRiesgoProyecto || 1.1).toFixed(1)}x
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tasa de Cambio (Gs/USD)</Label>
              <Input
                type="number"
                value={localProject.tasaCambio}
                onChange={(e) => updateProject({ tasaCambio: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gastos Adicionales */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <DollarSign className="h-5 w-5" />
            Gastos Adicionales Mensuales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Infraestructura</Label>
              <Input
                type="number"
                value={localProject.gastosAdicionales.infraestructura}
                onChange={(e) =>
                  updateProject({
                    gastosAdicionales: {
                      ...localProject.gastosAdicionales,
                      infraestructura: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Licencias</Label>
              <Input
                type="number"
                value={localProject.gastosAdicionales.licencias}
                onChange={(e) =>
                  updateProject({
                    gastosAdicionales: {
                      ...localProject.gastosAdicionales,
                      licencias: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Capacitación</Label>
              <Input
                type="number"
                value={localProject.gastosAdicionales.capacitacion}
                onChange={(e) =>
                  updateProject({
                    gastosAdicionales: {
                      ...localProject.gastosAdicionales,
                      capacitacion: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Otros</Label>
              <Input
                type="number"
                value={localProject.gastosAdicionales.otros}
                onChange={(e) =>
                  updateProject({
                    gastosAdicionales: {
                      ...localProject.gastosAdicionales,
                      otros: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Colaboradores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-lg">Colaboradores del Proyecto</span>
            <Button
              onClick={() => setShowAddCollaborator(true)}
              size="sm"
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <UserPlus className="h-4 w-4" />
              Agregar Colaborador
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {localProject.colaboradores.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="mb-4">No hay colaboradores asignados al proyecto</p>
              <Button onClick={() => setShowAddCollaborator(true)} variant="outline">
                Agregar Primer Colaborador
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {localProject.colaboradores.map((pc, index) => {
                const colaborador = state.colaboradores.find((c) => c.id === pc.colaboradorId)
                if (!colaborador) return null

                const costoMensual = calcularCostoColaborador(pc)

                return (
                  <Card key={pc.colaboradorId} className="p-4 bg-gray-50 border border-gray-200">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold text-lg truncate">{colaborador.nombre}</h4>
                            <Badge variant="outline">{colaborador.nivel}</Badge>
                            <Badge variant="secondary" className="whitespace-nowrap">
                              ₲{costoMensual.toLocaleString()}/mes
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{pc.rolEnProyecto}</p>
                          <div className="flex flex-wrap gap-1">
                            {colaborador.tecnologias.slice(0, 4).map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                            {colaborador.tecnologias.length > 4 && (
                              <Badge variant="outline" className="text-xs">
                                +{colaborador.tecnologias.length - 4}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeColaborador(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Rol en Proyecto</Label>
                          <Input
                            value={pc.rolEnProyecto}
                            onChange={(e) => updateColaborador(index, { rolEnProyecto: e.target.value })}
                            placeholder="Tech Lead, Developer..."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Horas Asignadas</Label>
                          <Input
                            type="number"
                            value={pc.horasAsignadas}
                            onChange={(e) => updateColaborador(index, { horasAsignadas: Number(e.target.value) })}
                            max={colaborador.horasMensuales}
                          />
                          <div className="text-xs text-muted-foreground">Max: {colaborador.horasMensuales}h</div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Recargo (%)</Label>
                          <div className="space-y-2">
                            <Slider
                              value={[pc.recargo]}
                              onValueChange={([value]) => updateColaborador(index, { recargo: value })}
                              max={100}
                              min={0}
                              step={5}
                            />
                            <div className="text-xs text-center font-medium">{pc.recargo}%</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Costo/Hora Custom</Label>
                          <Input
                            type="number"
                            placeholder="Auto"
                            value={pc.costoPorHoraCustom || ""}
                            onChange={(e) =>
                              updateColaborador(index, {
                                costoPorHoraCustom: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                          />
                          <div className="text-xs text-muted-foreground">
                            Auto: ₲
                            {Math.round(
                              calcularCostoColaborador({ ...pc, costoPorHoraCustom: undefined }) / pc.horasAsignadas,
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Métricas del Colaborador */}
                      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 p-3 bg-white rounded-lg border">
                        <div className="text-center">
                          <div className="text-xs sm:text-sm text-muted-foreground">Costo Base/Hora</div>
                          <div className="font-semibold text-sm sm:text-base">
                            ₲
                            {Math.round(
                              (colaborador.salarioBruto +
                                state.costosRigidos
                                  .filter((costo) => colaborador.costosRigidos.includes(costo.id))
                                  .reduce(
                                    (sum, costo) =>
                                      sum +
                                      (costo.tipo === "porcentaje"
                                        ? (colaborador.salarioBruto * costo.valor) / 100
                                        : costo.valor),
                                    0,
                                  )) /
                                colaborador.horasMensuales,
                            ).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs sm:text-sm text-muted-foreground">Costo Final/Hora</div>
                          <div className="font-semibold text-blue-600 text-sm sm:text-base">
                            ₲{Math.round(costoMensual / pc.horasAsignadas).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs sm:text-sm text-muted-foreground">Utilización</div>
                          <div className="font-semibold text-sm sm:text-base">
                            {((pc.horasAsignadas / colaborador.horasMensuales) * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs sm:text-sm text-muted-foreground">Costo Total</div>
                          <div className="font-semibold text-green-600 text-sm sm:text-base">
                            ₲{(costoMensual * localProject.duracionMeses).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Modal para Agregar Colaborador */}
          {showAddCollaborator && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Agregar Colaborador al Proyecto</span>
                    <Button variant="outline" size="sm" onClick={() => setShowAddCollaborator(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getAvailableCollaborators().length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Todos los colaboradores ya están asignados al proyecto</p>
                      </div>
                    ) : (
                      getAvailableCollaborators().map((colaborador) => (
                        <Card
                          key={colaborador.id}
                          className="p-4 hover:bg-gray-50 cursor-pointer border-2 border-transparent hover:border-blue-200"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h4 className="font-semibold truncate">{colaborador.nombre}</h4>
                                <Badge variant="outline">{colaborador.nivel}</Badge>
                                <Badge variant="secondary">{colaborador.rol}</Badge>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                ₲{colaborador.salarioBruto.toLocaleString()} • {colaborador.horasMensuales}h/mes •{" "}
                                {colaborador.disponibilidad}%
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {colaborador.tecnologias.slice(0, 5).map((tech) => (
                                  <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                                {colaborador.tecnologias.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{colaborador.tecnologias.length - 5}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button onClick={() => addColaborador(colaborador.id)} className="w-full sm:w-auto">
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar
                            </Button>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen Financiero */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Resumen Financiero del Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Costo Colaboradores</Label>
              <div className="text-xl lg:text-2xl font-bold">₲{totales.costoColaboradores.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                ${(totales.costoColaboradores / localProject.tasaCambio).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Gastos Adicionales</Label>
              <div className="text-xl lg:text-2xl font-bold">₲{totales.gastosAdicionales.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                ${(totales.gastosAdicionales / localProject.tasaCambio).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Margen</Label>
              <div className="text-xl lg:text-2xl font-bold text-green-600">₲{totales.margen.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {localProject.margenDeseado}% - ${(totales.margen / localProject.tasaCambio).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Precio Final (con IVA)</Label>
              <div className="text-xl lg:text-2xl font-bold text-blue-600">₲{totales.precioFinal.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                ${(totales.precioFinal / localProject.tasaCambio).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800">Análisis de Riesgo</span>
            </div>
            <div className="text-sm text-yellow-700">
              Factor de riesgo aplicado: {(localProject.factorRiesgoProyecto || 1.1).toFixed(1)}x | Incremento por
              riesgo: ₲{(totales.costoConRiesgo - totales.costoTotal).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveChanges} size="lg" className="px-8 w-full sm:w-auto">
          Guardar Configuración
        </Button>
      </div>
    </div>
  )
}
