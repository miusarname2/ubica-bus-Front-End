import React, { useEffect, useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";

const Roles = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await fetch("/api/roles");
        const data = await res.json();

        // Mapear la respuesta al formato esperado por la tabla
        const rolesFormatted = data.map((role: any) => ({
          id: role.ID,
          name: role.Nombre,
          description: role.Descripcion || "No description",
          // Puedes agregar users y permissions si tienes esa info, o dejar vacíos
          users: "-", 
          permissions: "-", 
        }));

        setRoles(rolesFormatted);
      } catch (error) {
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  const filteredRoles = roles.filter((role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: "Role Name", accessorKey: "name" },
    { header: "Description", accessorKey: "description" },
    { header: "Users", accessorKey: "users" },
    { header: "Permissions", accessorKey: "permissions" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
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
        <h1 className="text-2xl font-bold">Manage Roles</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
          <CardDescription>Manage system roles and permissions.</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search roles..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading roles...</p>
          ) : (
            <DataTable columns={columns} data={filteredRoles} />
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Roles;
