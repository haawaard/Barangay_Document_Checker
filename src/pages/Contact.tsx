// src/pages/Contact.tsx
import React from "react";
import NavbarLayout from "./Nlayout";
import { Globe, Mail, Phone, Users, Building, Shield, Gavel, Eye } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <NavbarLayout>
        <div className="p-8">
          {/* Main Title */}
          <h1 className="text-4xl font-extrabold text-center mb-12 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Contact Information
          </h1>

          {/* Pilot Barangay Contact Section */}
          <section className="bg-blue-900/20 border border-blue-700/50 p-8 rounded-3xl shadow-lg mb-12 relative">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <Building className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Pilot Barangay Contact</h2>
                  <p className="text-blue-200">Barangay 425 Zone 43 District 4 Manila City</p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Barangay Chairman */}
                <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 p-6 rounded-2xl border border-green-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-green-400" />
                    <h3 className="font-bold text-lg">Barangay Chairman</h3>
                  </div>
                  <p className="text-green-100 font-semibold mb-2">Hon. Benjamin M. Pasamonte</p>
                  <div className="flex items-center gap-2 text-green-300">
                    <Phone className="w-4 h-4" />
                    <span>09778179475</span>
                  </div>
                </div>

                {/* Barangay Treasurer */}
                <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-6 rounded-2xl border border-purple-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-purple-400" />
                    <h3 className="font-bold text-lg">Barangay Treasurer</h3>
                  </div>
                  <p className="text-purple-100 font-semibold mb-2">Riema R. Magdaling</p>
                  <div className="flex items-center gap-2 text-purple-300">
                    <Phone className="w-4 h-4" />
                    <span>09068718496</span>
                  </div>
                </div>

                {/* Barangay Kagawad */}
                <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 p-6 rounded-2xl border border-orange-500/30">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-orange-400" />
                    <h3 className="font-bold text-lg">Barangay Kagawad</h3>
                  </div>
                  <p className="text-orange-100 font-semibold mb-2">Kgd. Marie Aliza A. Alejandre</p>
                  <div className="flex items-center gap-2 text-orange-300">
                    <Phone className="w-4 h-4" />
                    <span>09178917575</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Project Team Section */}
          <section className="bg-gray-900/20 border border-gray-700/50 p-8 rounded-3xl shadow-lg mb-12 relative">
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">Project Team - DocuCheck Developers</h2>
                  <p className="text-purple-200">Meet the development team behind DocuCheck</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Project Manager */}
                <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 p-6 rounded-2xl border border-blue-500/30">
                  <h3 className="font-bold text-xl text-blue-100 mb-2">Jersey Mae D. Marisga</h3>
                  <p className="text-blue-300 font-medium mb-3">Project Manager</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-blue-200">
                      <Mail className="w-4 h-4" />
                      <span>@jersey.marisga@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-200">
                      <Mail className="w-4 h-4" />
                      <span>marisgajd@students.national-u.edu.ph</span>
                    </div>
                  </div>
                </div>

                {/* Programmer */}
                <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 p-6 rounded-2xl border border-green-500/30">
                  <h3 className="font-bold text-xl text-green-100 mb-2">Sarah Q. Lagmay</h3>
                  <p className="text-green-300 font-medium mb-3">Programmer</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-green-200">
                      <Mail className="w-4 h-4" />
                      <span>@sarahlagmay18@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-200">
                      <Mail className="w-4 h-4" />
                      <span>lagmaysq@students.national-u.edu.ph</span>
                    </div>
                  </div>
                </div>

                {/* Systems Analyst */}
                <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 p-6 rounded-2xl border border-purple-500/30">
                  <h3 className="font-bold text-xl text-purple-100 mb-2">John Howard Ocampo</h3>
                  <p className="text-purple-300 font-medium mb-3">Systems Analyst, Programmer</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-purple-200">
                      <Mail className="w-4 h-4" />
                      <span>howardocampo2004@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-200">
                      <Mail className="w-4 h-4" />
                      <span>ocampoj@students.national-u.edu.ph</span>
                    </div>
                  </div>
                </div>

                {/* Technical Writer */}
                <div className="bg-gradient-to-br from-orange-900/50 to-red-900/50 p-6 rounded-2xl border border-orange-500/30">
                  <h3 className="font-bold text-xl text-orange-100 mb-2">Maria Elaine C. Estabillo</h3>
                  <p className="text-orange-300 font-medium mb-3">Documenter/Technical Writer</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-orange-200">
                      <Mail className="w-4 h-4" />
                      <span>@estabilloelaine7@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-200">
                      <Mail className="w-4 h-4" />
                      <span>estabillomc@students.national-u.edu.ph</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related Government Agencies */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Related National Government Agencies
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {/* DICT */}
              <div 
                onClick={() => window.open('https://dict.gov.ph', '_blank')}
                className="bg-blue-900/20 border border-blue-500/50 p-6 rounded-2xl shadow-lg cursor-pointer hover:bg-blue-900/30 hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-blue-400" />
                  <h3 className="font-bold text-xl">Department of Information and Communications Technology (DICT)</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-blue-200">
                    <Globe className="w-4 h-4" />
                    <span>https://dict.gov.ph</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-200">
                    <Mail className="w-4 h-4" />
                    <span>information@dict.gov.ph</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-200">
                    <Phone className="w-4 h-4" />
                    <span>8-920-0101</span>
                  </div>
                </div>
              </div>

              {/* DILG */}
              <div 
                onClick={() => window.open('https://dilg.gov.ph', '_blank')}
                className="bg-green-900/20 border border-green-500/50 p-6 rounded-2xl shadow-lg cursor-pointer hover:bg-green-900/30 hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Building className="w-8 h-8 text-green-400" />
                  <h3 className="font-bold text-xl">Department of the Interior and Local Government (DILG)</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-green-200">
                    <Globe className="w-4 h-4" />
                    <span>https://dilg.gov.ph</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-200">
                    <Mail className="w-4 h-4" />
                    <span>dilgco@dilg.gov.ph</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-200">
                    <Phone className="w-4 h-4" />
                    <span>(02) 8876-3454</span>
                  </div>
                </div>
              </div>

              {/* CICC */}
              <div 
                onClick={() => window.open('https://cicc.gov.ph', '_blank')}
                className="bg-red-900/20 border border-red-500/50 p-6 rounded-2xl shadow-lg cursor-pointer hover:bg-red-900/30 hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-red-400" />
                  <h3 className="font-bold text-xl">Cybercrime Investigation and Coordinating Center (CICC)</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-red-200">
                    <Globe className="w-4 h-4" />
                    <span>https://cicc.gov.ph</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-200">
                    <Mail className="w-4 h-4" />
                    <span>records@cicc.gov.ph</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-200">
                    <Phone className="w-4 h-4" />
                    <span>1326</span>
                  </div>
                </div>
              </div>

              {/* NPC */}
              <div 
                onClick={() => window.open('https://privacy.gov.ph/', '_blank')}
                className="bg-purple-900/20 border border-purple-500/50 p-6 rounded-2xl shadow-lg cursor-pointer hover:bg-purple-900/30 hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-8 h-8 text-purple-400" />
                  <h3 className="font-bold text-xl">National Privacy Commission (NPC)</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-purple-200">
                    <Globe className="w-4 h-4" />
                    <span>https://privacy.gov.ph/</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-200">
                    <Mail className="w-4 h-4" />
                    <span>info@privacy.gov.ph</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-200">
                    <Phone className="w-4 h-4" />
                    <span>+63 929 836 1752 (Smart)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DOJ-OOC - Centered */}
            <div className="flex justify-center mt-8">
              <div 
                onClick={() => window.open('https://www.doj.gov.ph/office-of-cybercrime', '_blank')}
                className="bg-slate-900/20 border border-slate-500/50 p-6 rounded-2xl shadow-lg max-w-2xl w-full cursor-pointer hover:bg-slate-900/30 hover:scale-105 transition-all duration-200"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Gavel className="w-8 h-8 text-slate-400" />
                  <h3 className="font-bold text-xl">Department of Justice – Office of Cybercrime (DOJ-OOC)</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Globe className="w-4 h-4" />
                    <span>https://www.doj.gov.ph/office-of-cybercrime</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Mail className="w-4 h-4" />
                    <span>dojac@doj.gov.ph</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-200">
                    <Phone className="w-4 h-4" />
                    <span>(+632) 8523 8481 to 98</span>
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

export default Contact;
