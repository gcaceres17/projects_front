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
import { colaboradoresService, type Colaborador, type ColaboradorCreateData } from "@/services/colaboradores"
import { Trash2, Edit, UserPlus, Users, DollarSign, Calendar, Mail } from "lucide-react"

export default function Colaboradores() {
  // Estado para datos de API únicamente
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState<ColaboradorCreateData>({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    cargo: "",
    salario: 0,
    fecha_ingreso: new Date().toISOString().split('T')[0],
    tipo: "interno",
  });

  // Cargar colaboradores de la API al inicializar
  useEffect(() => {
    loadColaboradores();
  }, []);

  const loadColaboradores = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const colaboradoresData = await colaboradoresService.list();
      // Asegurar que siempre sea un array
      setColaboradores(Array.isArray(colaboradoresData) ? colaboradoresData : []);
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error de conexión con la API';
      setError(errorMessage);
      console.error('Error cargando colaboradores:', error);
      // En caso de error, establecer array vacío
      setColaboradores([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        // Actualizar colaborador existente
        await colaboradoresService.update(editingId, formData);
      } else {
        // Crear nuevo colaborador
        await colaboradoresService.create(formData);
      }
      
      // Recargar la lista de colaboradores
      await loadColaboradores();
      
      // Limpiar formulario
      resetForm();
      
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error en la operación';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (colaborador: Colaborador) => {
    setFormData({
      nombre: colaborador.nombre,
      apellido: colaborador.apellido,
      email: colaborador.email,
      telefono: colaborador.telefono || "",
      cargo: colaborador.cargo,
      salario: colaborador.salario,
      fecha_ingreso: colaborador.fecha_ingreso,
      tipo: colaborador.tipo,
    });
    setEditingId(colaborador.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este colaborador?')) {
      return;
    }

    try {
      await colaboradoresService.delete(id);
      await loadColaboradores();
    } catch (error: unknown) {
      const errorMessage = (error as Error)?.message || 'Error eliminando colaborador';
      alert(`Error: ${errorMessage}`);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      cargo: "",
      salario: 0,
      fecha_ingreso: new Date().toISOString().split('T')[0],
      tipo: "interno",
    });
    setEditingId(null);
  };

  const totalColaboradores = Array.isArray(colaboradores) ? colaboradores.length : 0;
  const colaboradoresActivos = Array.isArray(colaboradores) ? colaboradores.filter(c => c.activo).length : 0;
  const salarioPromedio = Array.isArray(colaboradores) && colaboradores.length > 0 
    ? colaboradores.reduce((sum, c) => sum + c.salario, 0) / colaboradores.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Colaboradores</h1>
          <p className="text-muted-foreground">Gestiona el equipo de trabajo y recursos humanos</p>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Colaboradores"
          value={totalColaboradores}
          icon={Users}
          description={`${colaboradoresActivos} activos`}
        />
        <StatCard
          title="Salario Promedio"
          value={`$${salarioPromedio.toLocaleString()}`}
          icon={DollarSign}
          description="Por colaborador"
        />
        <StatCard
          title="Estado de API"
          value={isLoading ? "Cargando..." : error ? "Error" : "Conectada"}
          icon={Calendar}
          description={
            isLoading ? "Cargando datos..." : 
            error ? `Error: ${error.substring(0, 30)}...` : 
            `${colaboradores.length} colaboradores cargados`
          }
        />
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            {editingId ? "Editar Colaborador" : "Nuevo Colaborador"}
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
              />
            </div>
            
            <div>
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="salario">Salario</Label>
              <Input
                id="salario"
                type="number"
                value={formData.salario}
                onChange={(e) => setFormData({ ...formData, salario: Number(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="fecha_ingreso">Fecha de Ingreso</Label>
              <Input
                id="fecha_ingreso"
                type="date"
                value={formData.fecha_ingreso}
                onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(value: "interno" | "externo" | "freelance") => setFormData({ ...formData, tipo: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interno">Interno</SelectItem>
                  <SelectItem value="externo">Externo</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {editingId ? "Actualizar" : "Crear"} Colaborador
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

      {/* Lista de Colaboradores */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <p>Cargando colaboradores...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <p>Error: {error}</p>
              <Button onClick={loadColaboradores} variant="outline" className="mt-2">
                Reintentar
              </Button>
            </div>
          ) : !Array.isArray(colaboradores) || colaboradores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay colaboradores registrados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Salario</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(colaboradores) && colaboradores.map((colaborador) => (
                  <TableRow key={colaborador.id}>
                    <TableCell className="font-medium">
                      {colaborador.nombre} {colaborador.apellido}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {colaborador.email}
                      </div>
                    </TableCell>
                    <TableCell>{colaborador.cargo}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        colaborador.tipo === 'interno' ? 'bg-green-100 text-green-800' :
                        colaborador.tipo === 'externo' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {colaborador.tipo}
                      </span>
                    </TableCell>
                    <TableCell>${colaborador.salario.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        colaborador.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {colaborador.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(colaborador)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(colaborador.id)}
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
