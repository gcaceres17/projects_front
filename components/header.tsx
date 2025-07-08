import { SidebarTrigger } from "@/components/ui/sidebar"
import { Bell, Search, Settings, User, Activity, Sparkles, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-6 border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl px-6 sticky top-0 z-50 shadow-2xl shadow-purple-900/20">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="-ml-1 hover:bg-white/10 text-white transition-all duration-300 rounded-lg p-2" />
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-ping"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CLT Projects
            </h1>
            <div className="flex items-center gap-1">
              <Activity className="h-3 w-3 text-emerald-400" />
              <span className="text-xs text-gray-400 font-medium">Sistema Activo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Buscar proyectos, colaboradores..." 
            className="w-64 pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:bg-white/10 focus:border-purple-500/50 transition-all duration-300"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-white/10 text-white transition-all duration-300 group rounded-lg p-2"
          >
            <Bell className="h-5 w-5 group-hover:animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="hover:bg-white/10 text-white transition-all duration-300 rounded-lg p-2"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <div className="h-6 w-px bg-white/20"></div>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 hover:bg-white/10 text-white transition-all duration-300 rounded-lg px-3 py-2"
          >
            <div className="p-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:inline text-sm font-medium">Admin</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
