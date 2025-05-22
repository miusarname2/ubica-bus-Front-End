
import React, { useState } from "react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu,
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";

import { Route, Users, Bus, UserRound, Building } from "lucide-react";
import Navbar from "@/components/dashboard/Navbar";
import { Link } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const menuItems = [
    { icon: Route, label: "Route Administration", path: "/routes" },
    { icon: Users, label: "Manage Users", path: "/users" },
    { icon: Bus, label: "Manage Buses", path: "/buses" },
    { icon: UserRound, label: "Manage Roles", path: "/roles" },
    { icon: Building, label: "Manage Companies", path: "/companies" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar menuItems={menuItems} />
        <SidebarInset className="flex flex-col">
          <Navbar />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

interface DashboardSidebarProps {
  menuItems: Array<{
    icon: React.ElementType;
    label: string;
    path: string;
  }>;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ menuItems }) => {
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-center p-4">
        <h1 className="text-2xl font-bold">UbicaBus</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuButton asChild tooltip={item.label}>
                  <Link to={item.path}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardLayout;
