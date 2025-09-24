import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";

const Issuance: React.FC = () => {

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
    navigate(path);

  };

  return (
    <Layout>
      {/* Header */}
      <header className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
        <nav className="flex gap-6 text-gray-300">
          <a href="#" className="hover:text-white">About</a>
          <a href="#" className="hover:text-white">Home</a>
          <a href="#" className="hover:text-white">Contact</a>
        </nav>
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

        <Card onClick={() => handleNavigate("/fcertindigency")}
        className="bg-gray-900 text-white border-none hover:shadow-lg cursor-pointer transition">
          <CardContent className="p-4 text-center">
            <img
              src="https://drive.google.com/uc?export=view&id=14wmqCy4p3wnRK4lj1MemN3quoF_Usadz"
              alt="Certificate of Residency"
              className="w-full h-40 object-contain mb-4"
            />
            <p className="font-semibold">Certificate of Residency</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Issuance;
