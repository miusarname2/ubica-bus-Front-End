
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";

const Routes = () => {
  // This would typically come from an API
  const routes = [
    {
      id: "1",
      name: "Downtown Express",
      startLocation: "Central Station",
      endLocation: "Business District",
      stops: 5,
      status: "Active",
    },
    {
      id: "2",
      name: "Airport Shuttle",
      startLocation: "City Center",
      endLocation: "International Airport",
      stops: 3,
      status: "Active",
    },
    {
      id: "3",
      name: "University Line",
      startLocation: "Main Campus",
      endLocation: "Student Housing",
      stops: 8,
      status: "Inactive",
    },
  ];

  const columns = [
    { header: "Name", accessorKey: "name" },
    { header: "Start Location", accessorKey: "startLocation" },
    { header: "End Location", accessorKey: "endLocation" },
    { header: "Stops", accessorKey: "stops" },
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
          <DataTable 
            columns={columns} 
            data={routes} 
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Routes;
