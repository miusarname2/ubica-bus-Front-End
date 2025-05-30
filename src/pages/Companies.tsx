import React, { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";

interface Company {
  ID: string;
  Nombre: string;
  Descripcion: string;
}

const Companies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("https://swift-brena-example1-7edebccb.koyeb.app/companies") 
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data);
      })
      .catch((err) => {
        console.error("Error fetching companies:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: "Nombre", accessorKey: "Nombre" },
    { header: "Descripción", accessorKey: "Descripcion" },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Ver</Button>
          <Button variant="outline" size="sm">Editar</Button>
          <Button variant="outline" size="sm" className="text-destructive">Eliminar</Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestionar Compañías</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Agregar Nueva Compañía
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compañías</CardTitle>
          <CardDescription>Gestiona las compañías de transporte en el sistema.</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar compañías..."
                className="pl-8"
                // Puedes agregar funcionalidad de búsqueda aquí
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Cargando compañías...</p>
          ) : (
            <DataTable columns={columns} data={companies} />
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Companies;

