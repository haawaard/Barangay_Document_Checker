import { Routes, Route, Navigate } from "react-router-dom";
import DocuCheck from "./pages/DocuCheck";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Issuance from "./pages/Issuance";
import Temp from "./pages/temp";
import BarangayClearanceForm from "./pages/Fbrgyclearance";
import BusinessPermit from "./pages/Fbusinesspermit";
import CertIndigency from "./pages/Fcertindigency";

function App() {
  return (
      <Routes>
        {/* Default route HOLDER */}
        <Route path="/" element={<Navigate to="/docucheck" replace />} />

        {/* Docucheck */}
        <Route path="/docucheck" element={<DocuCheck />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Issuance page */}
        <Route path="/issuance" element={<Issuance />} />

        {/* FORMS: brgy clearance */}
        <Route path="/fbrgyclearance" element={<BarangayClearanceForm />} />

        {/* FORMS: biz permit */}
        <Route path="/fbusinesspermit" element={<BusinessPermit />} />

        {/* FORMS: cert of indigency */}
        <Route path="/fcertindigency" element={<CertIndigency />} />
        

        {/* TEMPORARY PAGE */}
        <Route path="/temp" element={<Temp />} />
      </Routes>
  );
}

export default App;
