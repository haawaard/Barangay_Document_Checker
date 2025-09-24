import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, FileText, ShieldAlert, Lock } from "lucide-react";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear auth state and any other session state
    sessionStorage.clear();
    // Replace current entry with login and reload document to drop BFCache
    window.location.replace('/login');
  };

  // Optional: when sidebar mounts (protected layout), add a popstate handler to kick unauthenticated users to login
  useEffect(() => {
    const onPopState = () => {
      const authed = sessionStorage.getItem('isAuthenticated') === 'true';
      if (!authed) {
        navigate('/login', { replace: true });
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [navigate]);

  return (
    <aside className="w-60 bg-[#1a1a2e] flex flex-col p-4 text-white">
      <div className="text-lg font-bold mb-8">Barangay DocuCheck</div>
      <nav className="flex flex-col gap-4">
        <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-4 ${
                isActive ? "text-blue-400 font-semibold" : "hover:text-blue-400"
              }`
            }
          >
            <Home size={24} /> Dashboard
          </NavLink>

          <NavLink
            to="/issuance"
            className={({ isActive }) =>
              `flex items-center gap-4 ${
                isActive ? "text-blue-400 font-semibold" : "hover:text-blue-400"
              }`
            }
          >
            <FileText size={24} /> Issuance
          </NavLink>

          <NavLink
            to="/audit"
            className={({ isActive }) =>
              `flex items-center gap-4 ${
                isActive ? "text-blue-400 font-semibold" : "hover:text-blue-400"
              }`
            }
          >
            <FileText size={24} /> Audit Logs
          </NavLink>

          <NavLink
            to="/fraud"
            className={({ isActive }) =>
              `flex items-center gap-4 ${
                isActive ? "text-blue-400 font-semibold" : "hover:text-blue-400"
              }`
            }
          >
            <ShieldAlert size={24} /> Fraud Monitor
          </NavLink>

        <Button
          variant="secondary"
          onClick={handleLogout}
          className="bg-blue-700 text-white hover:bg-blue-600 flex items-center gap-2 mt-6"
        >
          <Lock className="w-4 h-4" />
          Logout
        </Button>
      </nav>
    </aside>
  );
};

export default Sidebar;