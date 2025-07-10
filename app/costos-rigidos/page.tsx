"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatCard } from "@/components/ui/stat-card"
import { costosRigidosService, type CostoRigido, type CostoRigidoCreateData } from "@/services/costos-rigidos"
import { Trash2, Edit, Plus, Calculator, DollarSign, Percent, Shield } from "lucide-react"

export default function CostosRigidos() {
  // Estado para datos de API únicamente
  const [costosRigidos, setCostosRigidos] = useState<CostoRigido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CostoRigidoCreateData>({
    nombre: "",
    descripcion: "",
    tipo: "fijo",
    valor: 0,
    categoria: "",
  });

  // Cargar costos rígidos de la API al inicializar
  useEffect(() => {
    loadCostosRigidos();
  }, []);

  const loadCostosRigidos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const costosData = await costosRigidosService.list();
      setCostosRigidos(costosData);
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error de conexión con la API';
      setError(errorMessage);
      console.error('Error cargando costos rígidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Actualizar costo rígido existente
        await costosRigidosService.update(editingId, formData);
      } else {
        // Crear nuevo costo rígido
        await costosRigidosService.create(formData);
      }
      
      // Recargar la lista de costos rígidos
      await loadCostosRigidos();
      
      // Limpiar formulario
      resetForm();
      
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error en la operación';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (costoRigido: CostoRigido) => {
    setFormData({
      nombre: costoRigido.nombre,
      descripcion: costoRigido.descripcion || "",
      tipo: costoRigido.tipo,
      valor: costoRigido.valor,
      categoria: costoRigido.categoria,
    });
    setEditingId(costoRigido.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este costo rígido?')) {
      return;
    }

    try {
      await costosRigidosService.delete(id);
      await loadCostosRigidos();
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error eliminando costo rígido';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleToggleActive = async (id: number, activo: boolean) => {
    try {
      if (activo) {
        await costosRigidosService.deactivate(id);
      } else {
        await costosRigidosService.activate(id);
      }
      await loadCostosRigidos();
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error cambiando estado';
      alert(`Error: ${errorMessage}`);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      descripcion: "",
      tipo: "fijo",
      valor: 0,
      categoria: "",
    });
    setEditingId(null);
  };

  const totalCostos = costosRigidos.length;
  const costosActivos = costosRigidos.filter(c => c.activo).length;
  const valorTotalFijos = costosRigidos
    .filter(c => c.activo && c.tipo === 'fijo')
    .reduce((sum, c) => sum + c.valor, 0);
  const promedioValor = costosRigidos.length > 0 
    ? costosRigidos.reduce((sum, c) => sum + c.valor, 0) / costosRigidos.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Costos Rígidos</h1>
          <p className="text-muted-foreground">Gestiona los costos fijos y variables del negocio</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Costos"
          value={totalCostos}
          icon={Calculator}
          description={`${costosActivos} activos`}
        />
        <StatCard
          title="Costos Fijos Totales"
          value={`$${valorTotalFijos.toLocaleString()}`}
          icon={DollarSign}
          description="Solo costos activos"
        />
        <StatCard
          title="Promedio por Costo"
          value={`$${promedioValor.toLocaleString()}`}
          icon={Percent}
          description="Valor promedio"
        />
        <StatCard
          title="Estado de API"
          value={isLoading ? "Cargando..." : error ? "Error" : "Conectada"}
          icon={Shield}
          description={
            isLoading ? "Cargando datos..." : 
            error ? `Error: ${error.substring(0, 30)}...` : 
            `${costosRigidos.length} costos cargados`
          }
        />
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingId ? "Editar Costo Rígido" : "Nuevo Costo Rígido"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
                placeholder="Ej: Alquiler oficina"
              />
            </div>
            
            <div>
              <Label htmlFor="categoria">Categoría</Label>
              <Input
                id="categoria"
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                required
                placeholder="Ej: Infraestructura"
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(value: "fijo" | "porcentaje") => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fijo">Fijo</SelectItem>
                  <SelectItem value="porcentaje">Porcentaje</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="valor">
                Valor {formData.tipo === 'porcentaje' ? '(%)' : '($)'}
              </Label>
              <Input
                id="valor"
                type="number"
                min="0"
                step={formData.tipo === 'porcentaje' ? "0.01" : "1"}
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="descripcion">Descripción (opcional)</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción detallada del costo"
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {editingId ? "Actualizar" : "Crear"} Costo Rígido
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Costos Rígidos */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Costos Rígidos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando costos rígidos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error: {error}</p>
              <Button onClick={loadCostosRigidos} variant="outline" className="mt-2">
                Reintentar
              </Button>
            </div>
          ) : costosRigidos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay costos rígidos registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {costosRigidos.map((costo) => (
                  <TableRow key={costo.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{costo.nombre}</div>
                        {costo.descripcion && (
                          <div className="text-sm text-muted-foreground">
                            {costo.descripcion}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{costo.categoria}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        costo.tipo === 'fijo' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {costo.tipo === 'fijo' ? 'Fijo' : 'Porcentaje'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {costo.tipo === 'fijo' 
                          ? `$${costo.valor.toLocaleString()}` 
                          : `${costo.valor}%`
                        }
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(costo.id, costo.activo)}
                        className={costo.activo ? 'text-green-600' : 'text-red-600'}
                      >
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          costo.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {costo.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(costo)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(costo.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}
