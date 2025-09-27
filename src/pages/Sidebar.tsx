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
    <aside className="w-60 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col p-6 text-white relative overflow-hidden shadow-2xl">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-5 w-20 h-20 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-5 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-0 w-16 h-16 bg-cyan-500/10 rounded-full blur-xl"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 mb-12">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
            <img src="/images/SystemLogo.png" alt="Barangay Logo" className="w-6 h-6 rounded-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white leading-tight mb-1">
              Barangay DocuCheck
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">Administrative Portal</p>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-3 relative z-10 flex-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
              isActive 
                ? "bg-gradient-to-r from-blue-600/80 to-blue-500/80 text-white font-semibold shadow-lg" 
                : "hover:bg-blue-900/30 hover:text-blue-300 text-gray-300"
            }`
          }
        >
          <Home size={20} className="relative z-10" />
          <span className="relative z-10">Dashboard</span>
          {/* Hover effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </NavLink>

        <NavLink
          to="/issuance"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
              isActive 
                ? "bg-gradient-to-r from-green-600/80 to-emerald-500/80 text-white font-semibold shadow-lg" 
                : "hover:bg-green-900/30 hover:text-green-300 text-gray-300"
            }`
          }
        >
          <FileText size={20} className="relative z-10" />
          <span className="relative z-10">Issuance</span>
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </NavLink>

        <NavLink
          to="/audit"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
              isActive 
                ? "bg-gradient-to-r from-purple-600/80 to-purple-500/80 text-white font-semibold shadow-lg" 
                : "hover:bg-purple-900/30 hover:text-purple-300 text-gray-300"
            }`
          }
        >
          <FileText size={20} className="relative z-10" />
          <span className="relative z-10">Audit Logs</span>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </NavLink>

        <NavLink
          to="/fraud"
          className={({ isActive }) =>
            `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group ${
              isActive 
                ? "bg-gradient-to-r from-red-600/80 to-rose-500/80 text-white font-semibold shadow-lg" 
                : "hover:bg-red-900/30 hover:text-red-300 text-gray-300"
            }`
          }
        >
          <ShieldAlert size={20} className="relative z-10" />
          <span className="relative z-10">Fraud Monitor</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </NavLink>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Logout Button */}
        <div className="pt-6 border-t border-blue-700/30">
          <Button
            variant="secondary"
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-600 text-white hover:from-slate-600 hover:to-slate-500 flex items-center justify-center gap-3 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-slate-500/50"
          >
            <Lock className="w-5 h-5" />
            <span className="font-medium">Secure Logout</span>
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 justify-center">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>System Online</span>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;