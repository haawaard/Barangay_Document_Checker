import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactElement } from "react";
import About from "./pages/About";
import Contact from "./pages/Contact";
import DocuCheck from "./pages/DocuCheck";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Issuance from "./pages/Issuance";
import Audit from "./pages/Audit";
import Fraud from "./pages/Fraud";
import Temp from "./pages/temp";
import BarangayClearanceForm from "./pages/Fbrgyclearance";
import BusinessPermit from "./pages/Fbusinesspermit";
import CertIndigency from "./pages/Fcertindigency";

// Protected route component
function ProtectedRoute({ children }: { children: ReactElement }) {
  const isAuthenticated = typeof window !== 'undefined' && sessionStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
      <Routes>
        {/* Default route HOLDER */}
        <Route path="/" element={<Navigate to="/docucheck" replace />} />

        {/* About */}
        <Route path="/about" element={<About />} />

        {/* Contact */}
        <Route path="/contact" element={<Contact />} />

        {/* Docucheck */}
        <Route path="/docucheck" element={<DocuCheck />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Issuance page */}
        <Route path="/issuance" element={<ProtectedRoute><Issuance /></ProtectedRoute>} />

  {/* Audit Logs page */}
  <Route path="/audit" element={<ProtectedRoute><Audit /></ProtectedRoute>} />

  {/* Fraud Detection page */}
  <Route path="/fraud" element={<ProtectedRoute><Fraud /></ProtectedRoute>} /> 

        {/* FORMS: brgy clearance */}
        <Route path="/fbrgyclearance" element={<ProtectedRoute><BarangayClearanceForm /></ProtectedRoute>} />

        {/* FORMS: biz permit */}
        <Route path="/fbusinesspermit" element={<ProtectedRoute><BusinessPermit /></ProtectedRoute>} />

        {/* FORMS: cert of indigency */}
        <Route path="/fcertindigency" element={<ProtectedRoute><CertIndigency /></ProtectedRoute>} />
        

        {/* TEMPORARY PAGE */}
        <Route path="/temp" element={<Temp />} />
      </Routes>
  );
}

export default App;
