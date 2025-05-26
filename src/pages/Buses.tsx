import React, { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";

const Buses = () => {
  const [buses, setBuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        const res = await fetch("/api/buses");
        const data = await res.json();

        // Formatear fechas
        const busesFormatted = data.map((bus: any) => ({
          ...bus,
          FechaInicioFormatted: bus.FechaInicio
            ? new Date(bus.FechaInicio).toLocaleString()
            : "N/A",
          FechaFinFormatted: bus.FechaFin
            ? new Date(bus.FechaFin).toLocaleString()
            : "N/A",
        }));

        setBuses(busesFormatted);
      } catch (error) {
        console.error("Error fetching buses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  // Filtrado simple por placa o conductorID
  const filteredBuses = buses.filter(
    (bus) =>
      bus.Placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bus.ConductorID && bus.ConductorID.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const columns = [
    { header: "Placa", accessorKey: "Placa" },
    { header: "Conductor ID", accessorKey: "ConductorID" },
    { header: "Ruta ID", accessorKey: "RutaID" },
    { header: "Fecha Inicio", accessorKey: "FechaInicioFormatted" },
    { header: "Fecha Fin", accessorKey: "FechaFinFormatted" },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Ver
          </Button>
          <Button variant="outline" size="sm">
            Editar
          </Button>
          <Button variant="outline" size="sm" className="text-destructive">
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage Buses</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Bus
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buses</CardTitle>
          <CardDescription>Manage all buses in your fleet.</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search buses..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Cargando buses...</p>
          ) : (
            <DataTable columns={columns} data={filteredBuses} />
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Buses;

