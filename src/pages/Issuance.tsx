import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "./Layout";
import { useNavigate } from "react-router-dom";

const Issuance: React.FC = () => {
  const navigate = useNavigate();

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
        <span className="text-sm">August 10, 2025</span>
      </header>

      <h1 className="text-2xl font-bold mb-6">Document Issuance</h1>

      {/* Grid of Documents */}
      <div className="grid grid-cols-2 gap-6">
        <Card onClick={() => handleNavigate("/fbrgyclearance")}
        className="hover:shadow-lg cursor-pointer transition">
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
        className="hover:shadow-lg cursor-pointer transition">
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
        className="hover:shadow-lg cursor-pointer transition">
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
        className="hover:shadow-lg cursor-pointer transition">
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
