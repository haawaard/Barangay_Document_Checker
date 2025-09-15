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

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/businesspermit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        alert("Business Permit form submitted successfully!");
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
      } else {
        alert(data.message || "Error submitting form");
      }
    } catch (error) {
      alert("Network error. Please try again.");
      console.error(error);
    }
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
            <button onClick={handleSubmit} className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-500">
              Fill-Out Done
            </button>
        </div>
      </div>
    </div>
  );
}
