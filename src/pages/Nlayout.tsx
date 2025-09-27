import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const NavbarLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white min-h-screen">
      <Navbar />
      <main className="p-6 mt-16">{children}</main>
    </div>
  );
};

export default NavbarLayout;
