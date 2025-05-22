
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";

const Buses = () => {
  // This would typically come from an API
  const buses = [
    {
      id: "1",
      regNumber: "ABC-1234",
      model: "Mercedes Sprinter",
      capacity: 16,
      driver: "John Smith",
      status: "In Service",
    },
    {
      id: "2",
      regNumber: "XYZ-5678",
      model: "Volvo 9700",
      capacity: 52,
      driver: "Sarah Johnson",
      status: "In Service",
    },
    {
      id: "3",
      regNumber: "DEF-9012",
      model: "Ford Transit",
      capacity: 12,
      driver: "Unassigned",
      status: "Maintenance",
    },
  ];

  const columns = [
    { header: "Reg Number", accessorKey: "regNumber" },
    { header: "Model", accessorKey: "model" },
    { header: "Capacity", accessorKey: "capacity" },
    { header: "Driver", accessorKey: "driver" },
    { header: "Status", accessorKey: "status" },
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
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={buses} 
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Buses;
