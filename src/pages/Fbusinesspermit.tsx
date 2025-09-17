import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Fbrgyclearance() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    LastName: "",
    FirstName: "",
    MiddleName: "",
    Address: "",
  Age: "",
    Birthdate: "",
    ContactNumber: "",
    Gender: "",
    BusinessName: "",
    BusinessAddress: "",
    Owner: "",
    BusinessNature: "",
    Classification: "",
    issuedOn: "",
  });

  const [showConfirm, setShowConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultHash, setResultHash] = useState<string | null>(null);
  const [resultId, setResultId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitToServer = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("http://localhost:5000/api/businesspermit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Business permit submission response:', data);
      if (response.ok) {
        setResultId(data.id);
        setResultHash(
          data.hashcode || data.hash_code || data.hash || data.HashCode || data.Hashcode || ""
        );
        setShowConfirm(false);
        setShowResult(true);
      } else {
        setSubmitError(data.message || "Error submitting form");
      }
    } catch (error) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenConfirm = () => setShowConfirm(true);
  const handleCloseResult = () => {
    setShowResult(false);
    setResultHash(null);
    setResultId(null);
    setFormData({
      LastName: "",
      FirstName: "",
      MiddleName: "",
      Address: "",
      Age: "",
      Birthdate: "",
      ContactNumber: "",
      Gender: "",
      BusinessName: "",
      BusinessAddress: "",
      Owner: "",
      BusinessNature: "",
      Classification: "",
      issuedOn: "",
    });
  };

  const handleBack = () => {
    navigate("/issuance");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "Birthdate") {
      // Calculate age from birthdate
      const birthDateObj = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      setFormData((prev) => ({ ...prev, Birthdate: value, Age: age.toString() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Business Permit Form</h1>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-semibold mb-1">Last Name</label>
            <input
              type="text"
              name="LastName"
              value={formData.LastName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">First Name</label>
            <input
              type="text"
              name="FirstName"
              value={formData.FirstName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Middle Name</label>
            <input
              type="text"
              name="MiddleName"
              value={formData.MiddleName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Address</label>
            <input
              type="text"
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Age</label>
            <div className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300 bg-gray-700 cursor-not-allowed">
              {formData.Age}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Birthdate</label>
            <input
              type="date"
              name="Birthdate"
              value={formData.Birthdate}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Contact Number</label>
            <input
              type="text"
              name="ContactNumber"
              value={formData.ContactNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Gender</label>
            <select
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Business Information */}
        <h2 className="text-xl font-bold mb-4">Business Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-semibold mb-1">Business Name</label>
            <input
              type="text"
              name="BusinessName"
              value={formData.BusinessName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Business Address</label>
            <input
              type="text"
              name="BusinessAddress"
              value={formData.BusinessAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Owner</label>
            <input
              type="text"
              name="Owner"
              value={formData.Owner}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Business Nature</label>
            <select
              name="BusinessNature"
              value={formData.BusinessNature}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            >
              <option value="">Select Business Nature</option>
              <option value="Retail">Retail</option>
              <option value="Food Service">Food Service</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Services">Services</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Classification</label>
            <select
              name="Classification"
              value={formData.Classification}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
            >
              <option value="">Select Classification</option>
              <option value="Single Proprietorship">Single Proprietorship</option>
              <option value="Partnership">Partnership</option>
              <option value="Corporation">Corporation</option>
              <option value="Cooperative">Cooperative</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Issuance */}
        <div className="mb-6">
          <label className="block font-semibold mb-1">Issued On</label>
          <input
            type="date"
            name="issuedOn"
            value={formData.issuedOn}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-between">
          <button onClick={handleBack} className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-500">
            Back
          </button>
            <button onClick={handleOpenConfirm} className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500">
              Fill-Out Done
            </button>
        </div>
      </div>
      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setShowConfirm(false)}>
          <div className="relative bg-gray-900 text-white rounded-xl shadow-xl max-w-3xl w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Review Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400">Last Name:</span> {formData.LastName}</div>
              <div><span className="text-gray-400">First Name:</span> {formData.FirstName}</div>
              <div><span className="text-gray-400">Middle Name:</span> {formData.MiddleName}</div>
              <div><span className="text-gray-400">Address:</span> {formData.Address}</div>
              <div><span className="text-gray-400">Age:</span> {formData.Age}</div>
              <div><span className="text-gray-400">Birthdate:</span> {formData.Birthdate}</div>
              <div><span className="text-gray-400">Contact #:</span> {formData.ContactNumber}</div>
              <div><span className="text-gray-400">Gender:</span> {formData.Gender}</div>
              <div><span className="text-gray-400">Business Name:</span> {formData.BusinessName}</div>
              <div><span className="text-gray-400">Business Address:</span> {formData.BusinessAddress}</div>
              <div><span className="text-gray-400">Owner:</span> {formData.Owner}</div>
              <div><span className="text-gray-400">Nature:</span> {formData.BusinessNature}</div>
              <div><span className="text-gray-400">Classification:</span> {formData.Classification}</div>
              <div className="md:col-span-2"><span className="text-gray-400">Issued On:</span> {formData.issuedOn}</div>
            </div>
            {submitError && <div className="text-red-400 mt-3">{submitError}</div>}
            <div className="flex justify-end gap-3 mt-6">
              <button className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button disabled={submitting} className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50" onClick={submitToServer}>
                {submitting ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResult && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={handleCloseResult}>
          <div className="relative bg-gray-900 text-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-2">Submission Successful</h2>
            <p className="text-gray-300">Your request has been recorded.</p>
            <div className="mt-4 text-sm">
              <div><span className="text-gray-400">Record ID:</span> {resultId}</div>
              <div><span className="text-gray-400">Hash Code:</span> <span className="font-mono">{resultHash || 'Unavailable'}</span></div>
            </div>
            <div className="flex justify-end mt-6">
              <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500" onClick={handleCloseResult}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
