import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const NavbarLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <main className="p-6 mt-16">{children}</main>
    </div>
  );
};

export default NavbarLayout;
