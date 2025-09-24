// src/pages/Contact.tsx
import React from "react";
import NavbarLayout from "./Nlayout";

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-black">
      <NavbarLayout>
        <div className="flex flex-col">
          {/* First Image */}
          <img
            src="/images/1.jpg" 
            alt="Contact 1"
            className="w-full h-auto object-cover"
          />

          {/* Second Image */}
          <img
            src="/images/2.jpg" 
            alt="Contact 1"
            className="w-full h-auto object-cover"
          />

          {/* Third Image */}
          <img
            src="/images/3.jpg" 
            alt="Contact 1"
            className="w-full h-auto object-cover"
          />
        </div>
      </NavbarLayout>
    </div>
  );
};

export default Contact;
