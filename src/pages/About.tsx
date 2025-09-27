// src/pages/About.tsx
import React from "react";
import NavbarLayout from "./Nlayout";
import { Shield, QrCode, Users, FileText, AlertTriangle } from "lucide-react";

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <NavbarLayout>
        <div className="p-8">
          {/* Main Title */}
          <h1 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            About Barangay DocuCheck
          </h1>

          {/* What is Barangay DocuCheck Section */}
          <section className="bg-blue-900/20 border border-blue-700/50 p-8 rounded-3xl shadow-lg mb-12 relative">
            <div className="flex items-start gap-6 relative z-10">
              {/* Icon */}
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                <Shield className="w-10 h-10 text-white" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4">
                  What is Barangay DocuCheck?
                </h2>
                <p className="text-gray-300 leading-relaxed">
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
            </div>
          </section>

          {/* Who We Serve Section */}
          <section className="bg-green-900/20 border border-green-700/50 p-8 rounded-3xl shadow-lg mb-16 relative">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-3xl font-bold">Who We Serve</h3>
              </div>
              <p className="text-gray-300 leading-relaxed text-lg">
                DocuCheck is built for both barangay staff and the public:  
                it simplifies issuance for officials, and it empowers residents
                and organizations to confirm the authenticity of any barangay
                document quickly and independently.
              </p>
            </div>
          </section>

          {/* Our Features Section */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Our Features
            </h2>
                        <div className="space-y-6">
              {/* Secure Documents */}
              <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl shadow-lg relative">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-red-100 mb-2">Secure Documents</h3>
                    <p className="text-red-200 leading-relaxed">
                      Every document gets a unique digital code (SHA-256 hash) that proves it hasn't been changed.
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code Verification */}
              <div className="bg-green-900/20 border border-green-500/50 p-6 rounded-2xl shadow-lg relative">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <QrCode className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-green-100 mb-2">QR Code Verification</h3>
                    <p className="text-green-200 leading-relaxed">
                      Easy-to-scan QR code on every document links directly to the verification page.
                    </p>
                  </div>
                </div>
              </div>

              {/* Public Checker */}
              <div className="bg-yellow-900/20 border border-yellow-500/50 p-6 rounded-2xl shadow-lg relative">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-yellow-100 mb-2">Public Checker</h3>
                    <p className="text-yellow-200 leading-relaxed">
                      Anyone can confirm if a document is valid by scanning or uploading it online.
                    </p>
                  </div>
                </div>
              </div>

              {/* Audit Trail */}
              <div className="bg-purple-900/20 border border-purple-500/50 p-6 rounded-2xl shadow-lg relative">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-purple-100 mb-2">Audit Trail</h3>
                    <p className="text-purple-200 leading-relaxed">
                      All actions (issuance, login, verification) are recorded in a central log for transparency and investigation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Fraud Alerts */}
              <div className="bg-cyan-900/20 border border-cyan-500/50 p-6 rounded-2xl shadow-lg relative">
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-12 h-12 bg-cyan-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-cyan-100 mb-2">Fraud Alerts</h3>
                    <p className="text-cyan-200 leading-relaxed">
                      The system warns admins when there are repeated failed verification attempts or unusual activity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </NavbarLayout>
    </div>
  );
};

export default About;
