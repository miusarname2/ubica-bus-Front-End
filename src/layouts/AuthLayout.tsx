
import React from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Banner (60% on desktop) */}
      <div className="hidden md:block md:w-3/5 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-primary/40 z-10 rounded-r-lg" />
        <img
          src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=1740&auto=format&fit=crop"
          alt="UbicaBus"
          className="w-full h-full object-cover rounded-r-lg"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 p-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">UbicaBus</h1>
          <p className="text-xl md:text-2xl text-white text-center max-w-lg">
            Your complete solution for tracking and managing transportation routes
          </p>
        </div>
      </div>

      {/* Auth Form (40% on desktop, 100% on mobile) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="md:hidden text-center mb-10">
          <h1 className="text-4xl font-bold text-primary mb-2">UbicaBus</h1>
          <p className="text-muted-foreground">Manage your transportation fleet with ease</p>
        </div>
        
        <div className="w-full max-w-md">
          {children}
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} UbicaBus. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
