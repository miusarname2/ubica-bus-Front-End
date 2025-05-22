
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";

const Roles = () => {
  // This would typically come from an API
  const roles = [
    {
      id: "1",
      name: "Administrator",
      description: "Full access to all system features",
      users: 3,
      permissions: "All",
    },
    {
      id: "2",
      name: "Manager",
      description: "Access to management features, no system configuration",
      users: 5,
      permissions: "Create, Read, Update",
    },
    {
      id: "3",
      name: "Driver",
      description: "Access to assigned routes and basic information",
      users: 12,
      permissions: "Read",
    },
  ];

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
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={roles} 
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Roles;
