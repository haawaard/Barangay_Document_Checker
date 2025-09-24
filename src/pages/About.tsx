// src/pages/About.tsx
import React from "react";
import NavbarLayout from "./Nlayout";
import { Shield, QrCode, Users, FileText, AlertTriangle } from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <NavbarLayout>
        <div className="p-8">
          {/* Main Title */}
          <h1 className="text-4xl font-extrabold text-center mb-12">
            About Barangay DocuCheck
          </h1>

          {/* What is Barangay DocuCheck Section */}
          <section className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg flex items-center gap-6 mb-12">
            {/* Icon */}
            <div className="flex justify-center items-center w-20 h-20 bg-blue-800 rounded-full">
              <Shield className="w-10 h-10 text-white" />
            </div>

            {/* Text */}
            <div>
              <h2 className="text-2xl font-bold mb-3">
                What is Barangay DocuCheck?
              </h2>
              <p className="text-gray-300">
                DocuCheck is a document security and verification system
                purpose-built for barangays. It enables barangay staff to
                produce official documents through a secure process with
                embedded cryptographic hashes and visible QR codes. Documents
                become tamper-proof, while the public can verify authenticity
                using a public verification page. DocuCheck strengthens trust,
                reduces fraud risk, and provides auditable trails for
                investigations and governance.
              </p>
            </div>
          </section>

          {/* Who We Serve Section (single box) */}
          <section className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg mb-16">
            <h3 className="text-2xl font-bold mb-4">Who We Serve</h3>
            <p className="text-gray-300">
              DocuCheck is built for both barangay staff and the public:  
              it simplifies issuance for officials, and it empowers residents
              and organizations to confirm the authenticity of any barangay
              document quickly and independently.
            </p>
          </section>

          {/* Our Features Section */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-10">
              Our Features
            </h2>
            <div className="space-y-6">
              {/* Secure Documents */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg flex items-start gap-4">
                <Shield className="w-8 h-8 text-red-400" />
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Secure Documents</span> — 
                  Every document gets a unique digital code (SHA-256 hash) that proves it hasn’t been changed.
                </p>
              </div>

              {/* QR Code Verification */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg flex items-start gap-4">
                <QrCode className="w-8 h-8 text-green-400" />
                <p className="text-gray-300">
                  <span className="font-semibold text-white">QR Code Verification</span> — 
                  Easy-to-scan QR code on every document links directly to the verification page.
                </p>
              </div>

              {/* Public Checker */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg flex items-start gap-4">
                <Users className="w-8 h-8 text-yellow-400" />
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Public Checker</span> — 
                  Anyone can confirm if a document is valid by scanning or uploading it online.
                </p>
              </div>

              {/* Audit Trail */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg flex items-start gap-4">
                <FileText className="w-8 h-8 text-purple-400" />
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Audit Trail</span> — 
                  All actions (issuance, login, verification) are recorded in a central log for transparency and investigation.
                </p>
              </div>

              {/* Fraud Alerts */}
              <div className="bg-[#1a1a2e] p-6 rounded-xl shadow-lg flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <p className="text-gray-300">
                  <span className="font-semibold text-white">Fraud Alerts</span> — 
                  The system warns admins when there are repeated failed verification attempts or unusual activity.
                </p>
              </div>
            </div>
          </section>
        </div>
      </NavbarLayout>
    </div>
  );
};

export default About;
