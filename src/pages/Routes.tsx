import React, { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable"; // Ensure this path is correct
import axios from "axios";

// Define an interface for your Route data for better type safety
interface RouteData {
  ID: string;
  Nombre: string;
  Descripcion: string;
  Origen: { Lat: number; Lng: number; };
  Destino: { Lat: number; Lng: number; };
  ModoTransporte: string;
  Waypoints: Array<{ Lat: number; Lng: number; Descripcion: string; }>;
}

const Routes = () => {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get("/api/routes")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setRoutes(res.data);
        } else {
          console.error("API response is not an array:", res.data);
          setRoutes([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching routes:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { header: "Nombre", accessorKey: "Nombre" },
    { header: "Descripción", accessorKey: "Descripcion" },
    {
      header: "Origen",
      // Using accessorFn to format the Lat and Lng from the Origen object
      accessorFn: (row: RouteData) => {
        // Safely check if Origen and its properties exist before accessing
        if (row.Origen?.Lat != null && row.Origen?.Lng != null) {
            return `Lat: ${row.Origen.Lat}, Lng: ${row.Origen.Lng}`;
        }
        return "N/A"; // Fallback if data is missing
      },
    },
    {
      header: "Destino",
      // Using accessorFn to format the Lat and Lng from the Destino object
      accessorFn: (row: RouteData) => {
        // Safely check if Destino and its properties exist before accessing
        if (row.Destino?.Lat != null && row.Destino?.Lng != null) {
            return `Lat: ${row.Destino.Lat}, Lng: ${row.Destino.Lng}`;
        }
        return "N/A"; // Fallback if data is missing
      },
    },
    { header: "Modo de Transporte", accessorKey: "ModoTransporte" },
    {
      id: "actions", // Use a unique ID for action columns
      header: "Actions",
      cell: ({ row }: { row: any }) => ( // 'any' for row is fine here if you're not deeply typing actions yet
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">View</Button>
          <Button variant="outline" size="sm">Edit</Button>
          <Button variant="outline" size="sm" className="text-destructive">Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Route Administration</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Route
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Routes</CardTitle>
          <CardDescription>Manage all transportation routes in the system.</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search routes..."
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading routes...</p>
          ) : routes.length === 0 ? (
            <p>No routes found. Please add new routes or check your API connection.</p>
          ) : (
            <DataTable
              columns={columns}
              data={routes}
            />
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Routes;