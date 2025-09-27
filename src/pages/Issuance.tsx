import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";

const Issuance: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    const authed = sessionStorage.getItem('isAuthenticated') === 'true';
    if (!authed) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const handleNavigate = (path: string) => {
    if (path === 'add-forms') {
      setShowModal(true);
    } else {
      navigate(path);
    }
  };

  return (
    <Layout>
      {/* Header with Date/Time Only */}
      <header className="flex justify-end items-center border-b border-gray-700 pb-4 mb-6">
        <span className="text-sm">{dateStr} // {timeStr}</span>
      </header>

      <h1 className="text-2xl font-bold mb-6">Document Issuance</h1>

      {/* Grid of Documents */}
      <div className="grid grid-cols-2 gap-8">
        {/* Barangay Clearance */}
        <Card onClick={() => handleNavigate("/fbrgyclearance")}
        className="bg-gradient-to-br from-blue-900 to-blue-800 text-white border border-blue-700 hover:shadow-2xl hover:scale-105 cursor-pointer transition-all duration-300">
          <CardContent className="p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-blue-600/20 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="relative z-10">
              <div className="w-full h-32 flex items-center justify-center mb-4 bg-white/10 rounded-lg border border-white/20">
                <svg className="w-16 h-16 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A2,2 0 0,1 14,4V8H20A2,2 0 0,1 22,10V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V10A2,2 0 0,1 4,8H10V4A2,2 0 0,1 12,2M12,4V8H12V4M4,10V20H20V10H4M6,12H18V14H6V12M6,16H14V18H6V16Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Barangay Clearance</h3>
              <p className="text-blue-200 text-sm">Official clearance certificate for residents</p>
            </div>
          </CardContent>
        </Card>

        {/* Business Permit */}
        <Card onClick={() => handleNavigate("/fbusinesspermit")}
        className="bg-gradient-to-br from-green-900 to-green-800 text-white border border-green-700 hover:shadow-2xl hover:scale-105 cursor-pointer transition-all duration-300">
          <CardContent className="p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-green-600/20 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="relative z-10">
              <div className="w-full h-32 flex items-center justify-center mb-4 bg-white/10 rounded-lg border border-white/20">
                <svg className="w-16 h-16 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M9,10H11V12H13V10H15V14H9V10Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Business Permit</h3>
              <p className="text-green-200 text-sm">Business registration and permit certificate</p>
            </div>
          </CardContent>
        </Card>

        {/* Certificate of Indigency */}
        <Card onClick={() => handleNavigate("/fcertindigency")}
        className="bg-gradient-to-br from-purple-900 to-purple-800 text-white border border-purple-700 hover:shadow-2xl hover:scale-105 cursor-pointer transition-all duration-300">
          <CardContent className="p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-purple-600/20 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="relative z-10">
              <div className="w-full h-32 flex items-center justify-center mb-4 bg-white/10 rounded-lg border border-white/20">
                <svg className="w-16 h-16 text-purple-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17,12C17,14.42 15.28,16.44 13,16.9V21H11V16.9C8.72,16.44 7,14.42 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,2L14.39,5.42C13.65,5.15 12.84,5 12,5C11.16,5 10.35,5.15 9.61,5.42L12,2M3.34,7L7.5,6.65C6.9,7.16 6.36,7.78 5.94,8.5C5.5,9.24 5.25,10 5.11,10.79L3.34,7M3.36,17L5.12,13.21C5.26,14 5.53,14.78 5.93,15.5C6.37,16.24 6.91,16.86 7.5,17.37L3.36,17M20.65,7L18.88,10.79C18.74,10 18.47,9.23 18.07,8.5C17.63,7.78 17.1,7.15 16.5,6.64L20.65,7M20.64,17L16.5,17.36C17.09,16.85 17.62,16.22 18.06,15.5C18.46,14.77 18.73,14 18.87,13.21L20.64,17Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold mb-2">Certificate of Indigency</h3>
              <p className="text-purple-200 text-sm">Financial assistance eligibility certificate</p>
            </div>
          </CardContent>
        </Card>

        {/* Add Forms */}
        <Card onClick={() => handleNavigate("add-forms")}
        className="bg-gradient-to-br from-slate-800 to-slate-700 text-white border border-slate-600 hover:shadow-2xl hover:scale-105 cursor-pointer transition-all duration-300">
          <CardContent className="p-6 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-slate-600/20 rounded-full -translate-y-10 translate-x-10"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-slate-600/20 rounded-full translate-y-8 -translate-x-8"></div>
            
            <div className="relative z-10">
              <div className="w-full h-32 flex items-center justify-center mb-4 bg-white/5 rounded-lg border-2 border-dashed border-slate-500">
                <div className="text-4xl text-slate-400">+</div>
              </div>
              <h3 className="text-lg font-bold mb-2">Add Forms</h3>
              <p className="text-slate-300 text-sm">Create new document templates</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal for Add Forms */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🚧</div>
              <h2 className="text-xl font-bold mb-3">Feature In Development</h2>
              <p className="text-gray-300 mb-6">
                The "Add Forms" feature is currently under development. 
                This functionality will be available in a future update.
              </p>
              <button 
                onClick={() => setShowModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Issuance;
