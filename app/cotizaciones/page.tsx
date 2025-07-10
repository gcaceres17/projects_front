"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/ui/stat-card"
import { cotizacionesService, type Cotizacion } from "@/services/cotizaciones"
import { proyectosService } from "@/services/proyectos"
import { FileText, Download, Calculator, DollarSign, Users, TrendingUp, Target, Award } from "lucide-react"

export default function Cotizaciones() {
  const searchParams = useSearchParams()
  const proyectoId = searchParams.get("proyecto")

  // Estado para datos de API únicamente
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proyectoNombre, setProyectoNombre] = useState<string>("");

  // Función para cargar cotizaciones reutilizable
  const loadCotizaciones = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let cotizacionesData: Cotizacion[];
      if (proyectoId) {
        // Filtrar cotizaciones por proyecto específico
        const allCotizaciones = await cotizacionesService.list();
        cotizacionesData = Array.isArray(allCotizaciones) 
          ? allCotizaciones.filter(c => c.proyecto_id === parseInt(proyectoId))
          : [];
      } else {
        // Cargar todas las cotizaciones
        const data = await cotizacionesService.list();
        cotizacionesData = Array.isArray(data) ? data : [];
      }
      
      setCotizaciones(cotizacionesData);
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error de conexión con la API';
      setError(errorMessage);
      console.error('Error cargando cotizaciones:', error);
      // En caso de error, establecer array vacío
      setCotizaciones([]);
    } finally {
      setIsLoading(false);
    }
  }, [proyectoId]);

  // Cargar cotizaciones de la API al inicializar
  useEffect(() => {
    const loadProyecto = async () => {
      if (!proyectoId) return;
      
      try {
        const proyecto = await proyectosService.getById(parseInt(proyectoId));
        setProyectoNombre(proyecto.nombre || "Proyecto");
      } catch (error: unknown) {
        console.error('Error cargando proyecto:', error);
        setProyectoNombre("Proyecto no encontrado");
      }
    };

    loadCotizaciones();
    if (proyectoId) {
      loadProyecto();
    }
  }, [proyectoId, loadCotizaciones]);

  const handleDownloadCotizacion = async (cotizacionId: number) => {
    try {
      // Aquí podrías llamar a un endpoint para generar el PDF
      alert(`Descargando cotización ${cotizacionId}...`);
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error descargando cotización';
      alert(`Error: ${errorMessage}`);
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'borrador': return 'bg-gray-100 text-gray-800';
      case 'enviada': return 'bg-blue-100 text-blue-800';
      case 'aprobada': return 'bg-green-100 text-green-800';
      case 'rechazada': return 'bg-red-100 text-red-800';
      case 'vencida': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalCotizaciones = Array.isArray(cotizaciones) ? cotizaciones.length : 0;
  const cotizacionesAprobadas = Array.isArray(cotizaciones) ? cotizaciones.filter(c => c.estado === 'aprobada').length : 0;
  const montoTotal = Array.isArray(cotizaciones) ? cotizaciones.reduce((sum, c) => sum + c.total, 0) : 0;
  const montoAprobado = Array.isArray(cotizaciones) 
    ? cotizaciones
        .filter(c => c.estado === 'aprobada')
        .reduce((sum, c) => sum + c.total, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {proyectoId ? `Cotizaciones - ${proyectoNombre}` : "Cotizaciones"}
          </h1>
          <p className="text-muted-foreground">
            {proyectoId 
              ? "Cotizaciones específicas del proyecto seleccionado"
              : "Gestiona todas las cotizaciones del negocio"
            }
          </p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Cotizaciones"
          value={totalCotizaciones}
          icon={FileText}
          description={`${cotizacionesAprobadas} aprobadas`}
        />
        <StatCard
          title="Monto Total"
          value={`$${montoTotal.toLocaleString()}`}
          icon={DollarSign}
          description="Todas las cotizaciones"
        />
        <StatCard
          title="Monto Aprobado"
          value={`$${montoAprobado.toLocaleString()}`}
          icon={TrendingUp}
          description="Solo aprobadas"
        />
        <StatCard
          title="Estado de API"
          value={isLoading ? "Cargando..." : error ? "Error" : "Conectada"}
          icon={Target}
          description={
            isLoading ? "Cargando datos..." : 
            error ? `Error: ${error.substring(0, 30)}...` : 
            `${cotizaciones.length} cotizaciones cargadas`
          }
        />
      </div>

      {/* Lista de Cotizaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Cotizaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando cotizaciones...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error: {error}</p>
              <Button onClick={loadCotizaciones} variant="outline" className="mt-2">
                Reintentar
              </Button>
            </div>
          ) : cotizaciones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>
                {proyectoId 
                  ? "No hay cotizaciones para este proyecto"
                  : "No hay cotizaciones registradas"
                }
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>Impuestos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cotizaciones.map((cotizacion) => (
                  <TableRow key={cotizacion.id}>
                    <TableCell className="font-medium">
                      {cotizacion.numero}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {cotizacion.descripcion}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getEstadoColor(cotizacion.estado)}`}>
                        {cotizacion.estado}
                      </span>
                    </TableCell>
                    <TableCell>${cotizacion.subtotal.toLocaleString()}</TableCell>
                    <TableCell>${cotizacion.impuestos.toLocaleString()}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      ${cotizacion.total.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {new Date(cotizacion.fecha_creacion).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className={`${
                        new Date(cotizacion.fecha_vencimiento) < new Date() 
                          ? 'text-red-600' 
                          : 'text-muted-foreground'
                      }`}>
                        {new Date(cotizacion.fecha_vencimiento).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadCotizacion(cotizacion.id)}
                          title="Descargar PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Resumen por Estado */}
      {!isLoading && !error && cotizaciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Resumen por Estado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {['borrador', 'enviada', 'aprobada', 'rechazada', 'vencida'].map((estado) => {
                const count = cotizaciones.filter(c => c.estado === estado).length;
                const monto = cotizaciones
                  .filter(c => c.estado === estado)
                  .reduce((sum, c) => sum + c.total, 0);
                
                return (
                  <div key={estado} className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm text-muted-foreground capitalize">{estado}</div>
                    <div className="text-xs text-muted-foreground">
                      ${monto.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
