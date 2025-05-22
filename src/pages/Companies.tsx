
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { DataTable } from "@/components/shared/DataTable";

const Companies = () => {
  // This would typically come from an API
  const companies = [
    {
      id: "1",
      name: "Express Transit Co.",
      contact: "John Williams",
      email: "info@expresstransit.com",
      phone: "555-123-4567",
      buses: 12,
    },
    {
      id: "2",
      name: "City Bus Lines",
      contact: "Maria Rodriguez",
      email: "contact@citybuslines.com",
      phone: "555-987-6543",
      buses: 28,
    },
    {
      id: "3",
      name: "University Shuttle Services",
      contact: "Robert Chen",
      email: "support@unishuttle.edu",
      phone: "555-555-5555",
      buses: 8,
    },
  ];

  const columns = [
    { header: "Company Name", accessorKey: "name" },
    { header: "Contact Person", accessorKey: "contact" },
    { header: "Email", accessorKey: "email" },
    { header: "Phone", accessorKey: "phone" },
    { header: "Buses", accessorKey: "buses" },
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
        <h1 className="text-2xl font-bold">Manage Companies</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Company
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
          <CardDescription>Manage transportation companies in the system.</CardDescription>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search companies..." 
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={companies} 
          />
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Companies;
