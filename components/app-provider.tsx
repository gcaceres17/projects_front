"use client"

import type React from "react"
import { createContext, useContext, useReducer, type ReactNode } from "react"

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
  disponibilidad: number // porcentaje de disponibilidad
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

interface AppState {
  costosRigidos: CostoRigido[]
  colaboradores: Colaborador[]
  proyectos: Proyecto[]
}

type AppAction =
  | { type: "ADD_COSTO_RIGIDO"; payload: CostoRigido }
  | { type: "UPDATE_COSTO_RIGIDO"; payload: CostoRigido }
  | { type: "DELETE_COSTO_RIGIDO"; payload: string }
  | { type: "ADD_COLABORADOR"; payload: Colaborador }
  | { type: "UPDATE_COLABORADOR"; payload: Colaborador }
  | { type: "DELETE_COLABORADOR"; payload: string }
  | { type: "ADD_PROYECTO"; payload: Proyecto }
  | { type: "UPDATE_PROYECTO"; payload: Proyecto }
  | { type: "DELETE_PROYECTO"; payload: string }

const initialState: AppState = {
  costosRigidos: [
    {
      id: "1",
      nombre: "IPS",
      tipo: "porcentaje",
      valor: 9,
      descripcion: "Instituto de Previsión Social",
      categoria: "legal",
    },
    {
      id: "2",
      nombre: "Aguinaldo",
      tipo: "porcentaje",
      valor: 8.33,
      descripcion: "Décimo tercer salario",
      categoria: "legal",
    },
    {
      id: "3",
      nombre: "Almuerzo",
      tipo: "fijo",
      valor: 300000,
      descripcion: "Subsidio de alimentación",
      categoria: "beneficio",
    },
    {
      id: "4",
      nombre: "Vacaciones",
      tipo: "porcentaje",
      valor: 8.33,
      descripcion: "Provisión para vacaciones",
      categoria: "legal",
    },
  ],
  colaboradores: [
    {
      id: "1",
      nombre: "Juan Pérez",
      salarioBruto: 5000000,
      antiguedad: 2,
      horasMensuales: 160,
      costosRigidos: ["1", "2", "3", "4"],
      rol: "Desarrollador Full Stack",
      nivel: "senior",
      tecnologias: ["React", "Node.js", "PostgreSQL"],
      disponibilidad: 100,
    },
    {
      id: "2",
      nombre: "María González",
      salarioBruto: 4500000,
      antiguedad: 1,
      horasMensuales: 160,
      costosRigidos: ["1", "2", "3", "4"],
      rol: "Frontend Developer",
      nivel: "semi-senior",
      tecnologias: ["React", "TypeScript", "CSS"],
      disponibilidad: 100,
    },
  ],
  proyectos: [
    {
      id: "1",
      nombre: "Sistema de Inventario",
      duracionMeses: 3,
      tasaCambio: 7300,
      factorRiesgoProyecto: 1.1,
      colaboradores: [
        {
          colaboradorId: "1",
          recargo: 15,
          horasAsignadas: 120,
          rolEnProyecto: "Tech Lead",
        },
        {
          colaboradorId: "2",
          recargo: 10,
          horasAsignadas: 140,
          rolEnProyecto: "Frontend Developer",
        },
      ],
      tipo: "desarrollo",
      complejidad: "media",
      metodologia: "agile",
      margenDeseado: 25,
      gastosAdicionales: {
        infraestructura: 500000,
        licencias: 300000,
        capacitacion: 200000,
        otros: 100000,
      },
      estado: "planificacion",
    },
  ],
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "ADD_COSTO_RIGIDO":
      return { ...state, costosRigidos: [...state.costosRigidos, action.payload] }
    case "UPDATE_COSTO_RIGIDO":
      return {
        ...state,
        costosRigidos: state.costosRigidos.map((c) => (c.id === action.payload.id ? action.payload : c)),
      }
    case "DELETE_COSTO_RIGIDO":
      return {
        ...state,
        costosRigidos: state.costosRigidos.filter((c) => c.id !== action.payload),
      }
    case "ADD_COLABORADOR":
      return { ...state, colaboradores: [...state.colaboradores, action.payload] }
    case "UPDATE_COLABORADOR":
      return {
        ...state,
        colaboradores: state.colaboradores.map((c) => (c.id === action.payload.id ? action.payload : c)),
      }
    case "DELETE_COLABORADOR":
      return {
        ...state,
        colaboradores: state.colaboradores.filter((c) => c.id !== action.payload),
      }
    case "ADD_PROYECTO":
      return { ...state, proyectos: [...state.proyectos, action.payload] }
    case "UPDATE_PROYECTO":
      return {
        ...state,
        proyectos: state.proyectos.map((p) => (p.id === action.payload.id ? action.payload : p)),
      }
    case "DELETE_PROYECTO":
      return {
        ...state,
        proyectos: state.proyectos.filter((p) => p.id !== action.payload),
      }
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
