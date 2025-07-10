"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

// Tipos mínimos para compatibilidad con componentes existentes
export interface CostoRigido {
  id: string
  nombre: string
  tipo: "fijo" | "porcentaje"
  valor: number
  descripcion?: string
  categoria: "legal" | "beneficio" | "operativo" | "otro"
}

export interface Colaborador {
  id: string
  nombre: string
  salarioBruto: number
  antiguedad: number
  horasMensuales: number
  costosRigidos: string[]
  rol: string
  nivel: "junior" | "semi-senior" | "senior" | "lead" | "architect"
  tecnologias: string[]
  disponibilidad: number
}

export interface ProyectoColaborador {
  colaboradorId: string
  recargo: number
  horasAsignadas: number
  rolEnProyecto: string
  costoPorHoraCustom?: number
}

export interface Proyecto {
  id: string
  nombre: string
  duracionMeses: number
  tasaCambio: number
  colaboradores: ProyectoColaborador[]
  tipo: "desarrollo" | "mantenimiento" | "consultoria" | "qa"
  complejidad: "baja" | "media" | "alta" | "critica"
  metodologia: "agile" | "waterfall" | "hybrid"
  margenDeseado: number
  factorRiesgoProyecto: number
  gastosAdicionales: {
    infraestructura: number
    licencias: number
    capacitacion: number
    otros: number
  }
  fechaInicio?: Date
  fechaFin?: Date
  estado: "planificacion" | "activo" | "pausado" | "completado" | "cancelado"
  cliente?: string
  descripcion?: string
}

// Estado mínimo para compatibilidad (solo arrays vacíos, no más mock data)
interface AppState {
  costosRigidos: CostoRigido[]
  colaboradores: Colaborador[]
  proyectos: Proyecto[]
}

// Estado inicial completamente vacío - solo API data
const initialState: AppState = {
  costosRigidos: [],
  colaboradores: [],
  proyectos: [],
}

// Reducer minimalista - solo para compatibilidad con componentes legacy
type AppAction = 
  | { type: "RESET_STATE" }

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "RESET_STATE":
      return initialState
    default:
      return state
  }
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useApp must be used within AppProvider")
  }
  return context
}
