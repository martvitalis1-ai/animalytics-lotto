import { Dashboard } from "@/components/Dashboard";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const PanelAgencia = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const code = localStorage.getItem('session_access_code');
    if (!code) navigate("/acceso-banca");
    else setRole("agency_manager");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('session_access_code');
    localStorage.removeItem('agency_owner_id');
    navigate("/acceso-banca");
  };

  if (!role) return null;
  return <Dashboard userRole="agency_manager" onLogout={handleLogout} />;
};
export default PanelAgencia;
