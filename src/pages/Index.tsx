
import { Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import LoginForm from "@/components/auth/LoginForm";

const Index = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  );
};

export default Index;
