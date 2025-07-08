"use client"

import { BarChart3, Users, DollarSign, FolderOpen, FileText, PieChart, Building2, Zap, Target, TrendingUp, Activity, Sparkles } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: BarChart3,
    description: "Vista general del sistema",
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "Colaboradores",
    url: "/colaboradores",
    icon: Users,
    description: "Gestión del equipo",
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "Costos Rígidos",
    url: "/costos-rigidos",
    icon: DollarSign,
    description: "Configuración de gastos",
    color: "from-orange-500 to-red-500",
  },
  {
    title: "Proyectos",
    url: "/proyectos",
    icon: FolderOpen,
    description: "Gestión de proyectos",
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "Cotizaciones",
    url: "/cotizaciones",
    icon: FileText,
    description: "Generación de presupuestos",
    color: "from-violet-500 to-purple-500",
  },
  {
    title: "Reportes",
    url: "/reportes",
    icon: TrendingUp,
    description: "Análisis y métricas",
    color: "from-indigo-500 to-blue-500",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-white/10 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <SidebarHeader className="border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="relative">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-xl bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CLT Projects
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Gestión Inteligente
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4 px-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Módulos del Sistema</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url}
                    className={`group relative overflow-hidden rounded-lg transition-all duration-300 hover:bg-white/10 ${
                      pathname === item.url ? 'bg-white/10 border border-white/20' : 'border border-transparent'
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 p-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${item.color} transition-all duration-300 group-hover:scale-110`}>
                        <item.icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <span className="font-medium text-sm text-white transition-colors duration-300 group-hover:text-gray-100">
                          {item.title}
                        </span>
                        <span className="text-xs text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                          {item.description}
                        </span>
                      </div>
                      {pathname === item.url && (
                        <div className={`w-1 h-8 bg-gradient-to-b ${item.color} rounded-full`}></div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-4 px-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <span>Estado del Sistema</span>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="mx-4 p-4 bg-gradient-to-r from-emerald-900/20 to-teal-900/20 rounded-lg border border-emerald-500/30">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-400">Sistema Activo</span>
              </div>
              <div className="text-xs text-gray-400">
                Todos los módulos operativos
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <div className="mx-4 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span className="text-xs font-medium text-purple-400">Versión 2.0</span>
              </div>
              <div className="text-xs text-gray-400">
                Diseño futurista activado
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
