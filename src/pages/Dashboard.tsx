
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import MapComponent from "@/components/dashboard/MapComponent";

const Dashboard = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (localStorage.getItem("isAuthenticated") !== "true") {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <DashboardLayout>
      <MapComponent />
    </DashboardLayout>
  );
};

export default Dashboard;
