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
      <div className="grid grid-cols-2 gap-6">
        <Card onClick={() => handleNavigate("/fbrgyclearance")}
        className="bg-gray-900 text-white border-none hover:shadow-lg cursor-pointer transition">
          <CardContent className="p-4 text-center">
            <img
              src="https://drive.google.com/uc?export=view&id=14wmqCy4p3wnRK4lj1MemN3quoF_Usadz"
              alt="Barangay Clearance"
              className="w-full h-40 object-contain mb-4"
            />
            <p className="font-semibold">Barangay Clearance</p>
          </CardContent>
        </Card>

        <Card onClick={() => handleNavigate("/fbusinesspermit")}
        className="bg-gray-900 text-white border-none hover:shadow-lg cursor-pointer transition">
          <CardContent className="p-4 text-center">
            <img
              src="https://drive.google.com/uc?export=view&id=14wmqCy4p3wnRK4lj1MemN3quoF_Usadz"
              alt="Business Permit"
              className="w-full h-40 object-contain mb-4"
            />
            <p className="font-semibold">Business Permit</p>
          </CardContent>
        </Card>

        <Card onClick={() => handleNavigate("/fcertindigency")}
        className="bg-gray-900 text-white border-none hover:shadow-lg cursor-pointer transition">
          <CardContent className="p-4 text-center">
            <img
              src="https://drive.google.com/uc?export=view&id=14wmqCy4p3wnRK4lj1MemN3quoF_Usadz"
              alt="Certificate of Indigency"
              className="w-full h-40 object-contain mb-4"
            />
            <p className="font-semibold">Certificate of Indigency</p>
          </CardContent>
        </Card>

        <Card onClick={() => handleNavigate("add-forms")}
        className="bg-gray-900 text-white border-none hover:shadow-lg cursor-pointer transition">
          <CardContent className="p-4 text-center">
            <div className="w-full h-40 flex items-center justify-center mb-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="text-6xl text-slate-400">+</div>
            </div>
            <p className="font-semibold">Add Forms</p>
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
