"use client"

import React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
    isPositive: boolean
  }
  gradient?: string
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  gradient = "from-indigo-500 to-purple-600",
  className
}: StatCardProps) {
  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl glassmorphism border-white/20 p-6 shadow-2xl shadow-purple-900/20 transition-all duration-300 hover:shadow-purple-900/40 hover:-translate-y-1 group hover:border-white/40",
      className
    )}>
      {/* Gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-10 group-hover:opacity-20 transition-opacity duration-300",
        gradient
      )} />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={cn(
          "flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br shadow-lg transition-transform duration-300 group-hover:scale-110",
          gradient
        )}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border",
            trend.isPositive 
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
              : "bg-red-500/20 text-red-400 border-red-500/30"
          )}>
            <span className={cn(
              "w-1 h-1 rounded-full",
              trend.isPositive ? "bg-emerald-400" : "bg-red-400"
            )} />
            {trend.isPositive ? "+" : ""}{trend.value}%
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-secondary-enhanced uppercase tracking-wide">
          {title}
        </h3>
        
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary-enhanced transition-colors duration-300 group-hover:text-gray-100 font-mono">
            {value}
          </span>
          {trend && (
            <span className="text-sm text-muted-enhanced">
              {trend.label}
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-sm text-muted-enhanced leading-relaxed">
            {description}
          </p>
        )}
      </div>
      
      {/* Animated border */}
      <div className={cn(
        "absolute bottom-0 left-0 h-1 bg-gradient-to-r transition-all duration-500 group-hover:w-full w-0",
        gradient
      )} />
    </div>
  )
}
