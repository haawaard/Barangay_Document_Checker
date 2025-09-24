import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {

  const handleReturn = () => {
    {/* RETURN TO DOCUCHECK FUNCTION */}
    navigate("/docucheck");
  };

    const navigate = useNavigate();
    useEffect(() => {
      const authed = sessionStorage.getItem('isAuthenticated') === 'true';
      if (!authed) {
        navigate('/login', { replace: true });
      }
    }, [navigate]);
  
  return (
    <header className="w-full flex justify-between items-center py-4 px-6 bg-blue-900 fixed top-0 left-0 z-50">
      <h1 className="text-lg font-bold flex items-center gap-2">
        <img
          src="/images/SystemLogo.png"
          alt="Logo"
          className="w-8 h-8"
        />
        Barangay DocuCheck
      </h1>

      <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-6 text-sm">
        <Link to="/about" className="hover:text-blue-400 transition">
          About
        </Link>
        <Link to="/" className="hover:text-blue-400 transition">
          Home
        </Link>
        <Link to="/contact" className="hover:text-blue-400 transition">
          Contact
        </Link>
      </nav>

      <Button onClick={handleReturn} className="bg-blue-700 hover:bg-blue-600">
        DOCUCHECK
      </Button>
    </header>
  );
};

export default Navbar;
