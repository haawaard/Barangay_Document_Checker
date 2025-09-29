import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDocument } from "pdf-lib";

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

  // Separate birth date components for better UX
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "preview">("details");
  const [showResult, setShowResult] = useState(false);
  const [resultHash, setResultHash] = useState<string | null>(null);
  const [resultId, setResultId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [showReadyToPrint, setShowReadyToPrint] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  const fullName = useMemo(() => {
    const parts = [formData.FirstName];
    if (!noMiddleName && formData.MiddleName) {
      parts.push(formData.MiddleName);
    }
    if (formData.LastName) {
      parts.push(formData.LastName);
    }
    return parts.filter(Boolean).join(" ");
  }, [formData.FirstName, formData.MiddleName, formData.LastName, noMiddleName]);

  const issuedOnPretty = useMemo(() => {
    if (!formData.issuedOn) return "";
    try {
      const d = new Date(formData.issuedOn);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return formData.issuedOn;
    }
  }, [formData.issuedOn]);

  // Set current date automatically for Issued On
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    setFormData(prev => ({ ...prev, issuedOn: formattedDate }));
  }, []);

  // Generate QR code for hash code
  const generateQRCode = async (text: string): Promise<string> => {
    try {
      // Using QR Server API for QR code generation with HTTPS
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&format=png&data=${encodeURIComponent(text)}`;
      console.log('Generating QR code for:', text, 'URL:', qrApiUrl);
      return qrApiUrl;
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw error;
    }
  };

  // Generate PDF from template with AcroForms (adapted for business permit)
  const generatePDF = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      console.log('Starting PDF generation...');
      console.log('Fetching PDF template from:', '/businesspermit_template.pdf');
      
      // Load the PDF template with AcroForms
      const templateBytes = await fetch('/businesspermit_template.pdf').then(res => {
        console.log('PDF fetch response:', {
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          url: res.url,
          contentType: res.headers.get('content-type')
        });
        
        if (!res.ok) {
          throw new Error(`Failed to load PDF template: ${res.status} ${res.statusText}. URL: ${res.url}`);
        }
        return res.arrayBuffer();
      });
      
      console.log('PDF template loaded successfully, size:', templateBytes.byteLength, 'bytes');
      const pdfDoc = await PDFDocument.load(templateBytes);
      console.log('PDF document parsed successfully');
      
      const form = pdfDoc.getForm();
      console.log('PDF form extracted successfully');

      // Helper function to safely fill text fields
      const fillTextField = (fieldName: string, value: string) => {
        try {
          const field = form.getTextField(fieldName);
          field.setText(value || '');
          console.log(`Successfully filled field '${fieldName}' with:`, value);
        } catch (e) {
          console.warn(`Field '${fieldName}' not found in PDF template`);
        }
      };

      // Create the business permit certificate text with the specified format
      const certificateText = `THIS IS TO CERTIFY that Mr./Ms. ${formData.Owner || fullName}, of legal age, and a resident of ${formData.BusinessAddress || formData.Address}, is applying for business clearance in our Barangay Office.

BUSINESS NAME: ${formData.BusinessName}
BUSINESS ADDRESS: ${formData.BusinessAddress}
PROPRIETOR/OWNER: ${formData.Owner || fullName}
NATURE OF BUSINESS: ${formData.BusinessNature}
CLASSIFICATION: ${formData.Classification}

This Barangay have no objection for the above applicant to secure Business Permit to Operate said business in the above-mentioned address, provided that he/she will comply all the necessary requirements of the law, under the City Ordinance of the City of Manila and will also be subject to the rules and regulations of the Sangguniang Barangay, Barangay 425 Zone 43, District IV. Any violation/s thereof shall cause cancellation or termination of this permit.

This certification is being issued for presentation to the Office Permits & Licenses, City of Manila prior to the issuance of the appropriate permit/license pursuant to Section 152 of the 1991 Local Government Code.

Issued this ${issuedOnPretty || formData.issuedOn} in the City of Manila, Philippines.`;

      // Fill the main certificate text field
      fillTextField('textarea_business', certificateText);
      
      // Fill individual variable fields if they exist
      fillTextField('owner_name', formData.Owner || fullName);
      fillTextField('owner_address', formData.BusinessAddress || formData.Address);
      fillTextField('business_name', formData.BusinessName);
      fillTextField('business_address', formData.BusinessAddress);
      fillTextField('proprietor_owner', formData.Owner || fullName);
      fillTextField('nature_of_business', formData.BusinessNature);
      fillTextField('classification', formData.Classification);
      fillTextField('issued_on', issuedOnPretty || formData.issuedOn);

      // Add QR code to the PDF if hash code is available
      if (resultHash) {
        try {
          console.log('Adding QR code to PDF for hash:', resultHash);
          const qrCodeImageUrl = await generateQRCode(resultHash);
          const qrResponse = await fetch(qrCodeImageUrl);
          
          if (qrResponse.ok) {
            const qrImageBytes = await qrResponse.arrayBuffer();
            
            // Try to embed as PNG first, fallback to JPEG if needed
            let qrImage;
            try {
              qrImage = await pdfDoc.embedPng(qrImageBytes);
            } catch (pngError) {
              console.log('PNG embed failed, trying JPEG...');
              try {
                qrImage = await pdfDoc.embedJpg(qrImageBytes);
              } catch (jpgError) {
                console.error('Both PNG and JPEG embed failed:', jpgError);
                throw jpgError;
              }
            }
            
            // Get the first page to add QR code
            const pages = pdfDoc.getPages();
            const firstPage = pages[0];
            const { width } = firstPage.getSize();
            
            // Position QR code in the lower right corner without blocking content
            const qrSize = 60; // Smaller QR code size to avoid blocking content
            const rightMargin = 20; // Closer to the right edge
            const bottomMargin = 20; // Closer to the bottom edge
            
            firstPage.drawImage(qrImage, {
              x: width - qrSize - rightMargin, // Far right positioning
              y: bottomMargin, // Bottom positioning (PDF coordinates start from bottom)
              width: qrSize,
              height: qrSize,
            });
            
            console.log('QR code added to PDF successfully');
          } else {
            console.warn('Failed to fetch QR code image');
          }
        } catch (error) {
          console.error('Failed to add QR code to PDF:', error);
          // Continue without QR code if it fails
        }
      }

      // Flatten the form to make all fields non-editable
      form.flatten();
      console.log('PDF form flattened successfully');

      // Generate the filled PDF
      const pdfBytes = await pdfDoc.save();
      console.log('PDF generated successfully, size:', pdfBytes.length, 'bytes');
      
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      console.log('PDF blob URL created:', url);
      setPdfUrl(url);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = 'Failed to generate PDF.';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('404')) {
          errorMessage = 'PDF template not found. Please ensure businesspermit_template.pdf exists in /public/ folder and the development server is running on port 5173.';
        } else if (error.message.includes('Failed to load PDF template')) {
          errorMessage = error.message;
        } else {
          errorMessage = `PDF generation error: ${error.message}`;
        }
      }
      
      setGenError(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrintPDF = () => {
    if (!pdfUrl) return;
    const w = window.open(pdfUrl, '_blank');
    if (w) {
      w.onload = () => w.print();
    }
  };

  const handleDownloadPDF = () => {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = "business_permit_certificate.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const submitToServer = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      console.log('Submitting form data:', formData);
      const response = await fetch("http://localhost:5000/api/businesspermit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Business permit submission response:', data);
      
      if (response.ok) {
        setResultId(data.id || data.permit_id);
        const hashCode = data.hashcode || data.hash_code || data.hash || data.HashCode || data.Hashcode || "";
        setResultHash(hashCode);
        
        // Generate QR code for the hash code
        if (hashCode) {
          try {
            const qrUrl = await generateQRCode(hashCode);
            setQrCodeUrl(qrUrl);
            console.log('QR code generated successfully:', qrUrl);
          } catch (error) {
            console.error('Failed to generate QR code:', error);
            setQrCodeUrl(null);
          }
        }
        
        setShowConfirm(false);
        setShowResult(true);
      } else {
        console.error('Server error response:', data);
        setSubmitError(data.message || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error('Network error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSubmitError(`Network error: ${errorMessage || 'Please ensure the backend server is running on port 5000'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenConfirm = () => { setActiveTab("details"); setShowConfirm(true); };
  const handleCloseResult = async () => {
    // Download QR code before closing
    if (qrCodeUrl && resultHash) {
      await downloadQRCode();
    }
    
    setShowResult(false);
    setShowReadyToPrint(true);
    generatePDF(); // Generate PDF for Ready-to-Print modal
  };

  // Function to download QR code with person's name
  const downloadQRCode = async () => {
    try {
      if (!qrCodeUrl || !resultHash) return;
      
      // Create filename with person's name and timestamp
      const sanitizedName = fullName
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '_') // Replace spaces with underscores
        .trim();
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
      const filename = `${sanitizedName}_BusinessPermit_QR_${timestamp}.png`;
      
      // Fetch the QR code image
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up object URL
      window.URL.revokeObjectURL(downloadUrl);
      
      console.log(`Business Permit QR code downloaded as: ${filename}`);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const handleCloseReadyToPrint = () => {
    setShowReadyToPrint(false);
    setResultHash(null);
    setResultId(null);
    setNoMiddleName(false);
    setPdfUrl(null);
    setQrCodeUrl(null);
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
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
      issuedOn: formattedDate,
    });
    
    // Reset birth date components
    setBirthMonth("");
    setBirthDay("");
    setBirthYear("");
    setNoMiddleName(false);
    
    // Navigate back to issuance page
    navigate("/issuance");
  };

  const handleBack = () => {
    navigate("/issuance");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, checked } = e.target as HTMLInputElement;
    
    if (name === "noMiddleName") {
      setNoMiddleName(checked);
      if (checked) {
        setFormData((prev) => ({ ...prev, MiddleName: "" }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle birth date component changes
  const handleBirthDateChange = (component: 'month' | 'day' | 'year', value: string) => {
    let newMonth = birthMonth;
    let newDay = birthDay;
    let newYear = birthYear;

    if (component === 'month') {
      setBirthMonth(value);
      newMonth = value;
    } else if (component === 'day') {
      setBirthDay(value);
      newDay = value;
    } else if (component === 'year') {
      setBirthYear(value);
      newYear = value;
    }

    // Update birthdate and calculate age when all components are filled
    if (newMonth && newDay && newYear) {
      const birthDateStr = `${newYear}-${newMonth.padStart(2, '0')}-${newDay.padStart(2, '0')}`;
      const birthDateObj = new Date(birthDateStr);
      const today = new Date();
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      setFormData((prev) => ({ ...prev, Birthdate: birthDateStr, Age: age.toString() }));
    }
  };

  // Generate month options
  const monthOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  // Generate day options (1-31)
  const dayOptions = Array.from({ length: 31 }, (_, i) => ({
    value: (i + 1).toString(),
    label: (i + 1).toString()
  }));

  // Generate year options (current year - 100 to current year)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 101 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }));

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Business Permit Form</h1>

        {/* Last Name */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Last Name</label>
          <input
            type="text"
            name="LastName"
            value={formData.LastName}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          />
        </div>

        {/* First Name */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">First Name</label>
          <input
            type="text"
            name="FirstName"
            value={formData.FirstName}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          />
        </div>

        {/* Middle Name */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Middle Name</label>
          <input
            type="text"
            name="MiddleName"
            value={formData.MiddleName}
            onChange={handleChange}
            disabled={noMiddleName}
            className={`w-full px-3 py-2 rounded text-gray-300 ${noMiddleName ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-800'}`}
          />
          <div className="flex items-center mt-2">
            <input
              type="checkbox"
              id="noMiddleName"
              name="noMiddleName"
              checked={noMiddleName}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="noMiddleName" className="text-sm text-gray-400 cursor-pointer">No Middle Name</label>
          </div>
        </div>

        {/* Address */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Address</label>
          <input
            type="text"
            name="Address"
            value={formData.Address}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          />
        </div>

        {/* Age */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Age</label>
          <div className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300 bg-gray-700 cursor-not-allowed">
            {formData.Age}
          </div>
        </div>

        {/* Birthdate */}
        <div className="mb-4">
          <label className="block font-semibold mb-2">Birthdate</label>
          <div className="grid grid-cols-3 gap-3">
            {/* Month Dropdown */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Month</label>
              <select
                value={birthMonth}
                onChange={(e) => handleBirthDateChange('month', e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Month</option>
                {monthOptions.map(month => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
            
            {/* Day Dropdown */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Day</label>
              <select
                value={birthDay}
                onChange={(e) => handleBirthDateChange('day', e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Day</option>
                {dayOptions.map(day => (
                  <option key={day.value} value={day.value}>{day.label}</option>
                ))}
              </select>
            </div>
            
            {/* Year Dropdown */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Year</label>
              <select
                value={birthYear}
                onChange={(e) => handleBirthDateChange('year', e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select Year</option>
                {yearOptions.map(year => (
                  <option key={year.value} value={year.value}>{year.label}</option>
                ))}
              </select>
            </div>
          </div>
          {formData.Birthdate && (
            <div className="mt-2 text-sm text-green-400">
              Selected: {new Date(formData.Birthdate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          )}
        </div>

        {/* Contact Number */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Contact Number</label>
          <input
            type="text"
            name="ContactNumber"
            value={formData.ContactNumber}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          />
        </div>

        {/* Gender */}
        <div className="mb-4">
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

        {/* Business Information */}
        <h2 className="text-xl font-bold mb-4">Business Information</h2>
        
        {/* Business Name */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Business Name</label>
          <input
            type="text"
            name="BusinessName"
            value={formData.BusinessName}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          />
        </div>

        {/* Business Address */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Business Address</label>
          <input
            type="text"
            name="BusinessAddress"
            value={formData.BusinessAddress}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          />
        </div>

        {/* Owner */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Owner</label>
          <input
            type="text"
            name="Owner"
            value={formData.Owner}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          />
        </div>

        {/* Business Nature */}
        <div className="mb-4">
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

        {/* Classification */}
        <div className="mb-4">
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

        {/* Issued On */}
        <div className="mb-6">
          <label className="block font-semibold mb-1">Issued On</label>
          <input
            type="date"
            name="issuedOn"
            value={formData.issuedOn}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          />
          <p className="text-xs text-gray-500 mt-1">Automatically set to today's date</p>
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2" onClick={() => setShowConfirm(false)}>
          <div className="relative bg-gray-900 text-white rounded-xl shadow-xl w-full max-w-5xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Review Submission</h2>
              <div className="flex gap-2">
                <button onClick={() => setActiveTab("details")} className={`px-3 py-1 rounded ${activeTab === "details" ? "bg-blue-700" : "bg-gray-700 hover:bg-gray-600"}`}>Details</button>
                <button onClick={() => setActiveTab("preview")} className={`px-3 py-1 rounded ${activeTab === "preview" ? "bg-blue-700" : "bg-gray-700 hover:bg-gray-600"}`}>Form Preview</button>
              </div>
            </div>

            {activeTab === "details" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-6">
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
                  <div className="md:col-span-2"><span className="text-gray-400">Issued On:</span> {issuedOnPretty || formData.issuedOn}</div>
                </div>
              </div>
            )}

            {activeTab === "preview" && (
              <div className="max-h-96 overflow-y-auto">
                <div className="bg-gray-800 rounded-md p-4">
                  <h3 className="text-lg font-semibold mb-4 text-center">Business Permit Certificate Preview</h3>
                  <div className="space-y-3 text-sm">
                    <div className="text-center mb-6">
                      <div className="text-base font-bold">BUSINESS PERMIT CERTIFICATE</div>
                      <div className="text-sm text-gray-400 mt-2">TO WHOM IT MAY CONCERN:</div>
                    </div>
                    
                    <div className="text-justify leading-relaxed">
                      <p>THIS IS TO CERTIFY that Mr./Ms. <span className="font-semibold text-blue-300">{formData.Owner || fullName}</span>, of legal age, and a resident of <span className="font-semibold text-blue-300">{formData.BusinessAddress || formData.Address}</span>, is applying for business clearance in our Barangay Office.</p>
                      
                      <div className="mt-3 space-y-1">
                        <div><span className="font-semibold">BUSINESS NAME:</span> <span className="text-blue-300">{formData.BusinessName}</span></div>
                        <div><span className="font-semibold">BUSINESS ADDRESS:</span> <span className="text-blue-300">{formData.BusinessAddress}</span></div>
                        <div><span className="font-semibold">PROPRIETOR/OWNER:</span> <span className="text-blue-300">{formData.Owner || fullName}</span></div>
                        <div><span className="font-semibold">NATURE OF BUSINESS:</span> <span className="text-blue-300">{formData.BusinessNature}</span></div>
                        <div><span className="font-semibold">CLASSIFICATION:</span> <span className="text-blue-300">{formData.Classification}</span></div>
                      </div>
                      
                      <p className="mt-3">This Barangay have no objection for the above applicant to secure Business Permit to Operate said business in the above-mentioned address, provided that he/she will comply all the necessary requirements of the law, under the City Ordinance of the City of Manila and will also be subject to the rules and regulations of the Sangguniang Barangay, Barangay 425 Zone 43, District IV. Any violation/s thereof shall cause cancellation or termination of this permit.</p>
                      
                      <p className="mt-3">This certification is being issued for presentation to the Office Permits & Licenses, City of Manila prior to the issuance of the appropriate permit/license pursuant to Section 152 of the 1991 Local Government Code.</p>
                      
                      <p className="mt-4">Issued this <span className="font-semibold text-blue-300">{issuedOnPretty || formData.issuedOn}</span> in the City of Manila, Philippines.</p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-600">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div><span className="text-gray-400">Owner:</span> {formData.Owner || fullName}</div>
                        <div><span className="text-gray-400">Age:</span> {formData.Age}</div>
                        <div><span className="text-gray-400">Address:</span> {formData.Address}</div>
                        <div><span className="text-gray-400">Gender:</span> {formData.Gender}</div>
                        <div><span className="text-gray-400">Contact:</span> {formData.ContactNumber}</div>
                        <div><span className="text-gray-400">Business:</span> {formData.BusinessName}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {submitError && <div className="text-red-400 mt-3">{submitError}</div>}
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-700">
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
              
              {/* QR Code Display */}
              {qrCodeUrl && resultHash && (
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm mb-2">QR Code:</p>
                  <div className="flex justify-center">
                    <img 
                      src={qrCodeUrl} 
                      alt="QR Code for Hash Code" 
                      className="border border-gray-600 rounded"
                      style={{ width: '150px', height: '150px' }}
                      onError={(e) => {
                        console.error('QR code image failed to load');
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Scan to verify certificate</p>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500" onClick={handleCloseResult}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Ready-to-Print Modal */}
      {showReadyToPrint && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2">
          <div className="relative bg-gray-900 text-white rounded-xl shadow-xl w-full max-w-7xl p-6" style={{ height: '95vh' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Ready-to-Print</h2>
            </div>

            <div className="flex flex-col" style={{ height: 'calc(95vh - 120px)' }}>
              <div className="flex-1 bg-gray-800 rounded-md p-3 mb-3">
                {generating && <div className="flex items-center justify-center h-full"><span className="text-gray-300 text-sm">Generating PDF...</span></div>}
                {!generating && genError && <div className="flex items-center justify-center h-full"><span className="text-red-400 text-sm">{genError}</span></div>}
                {!generating && !genError && pdfUrl && (
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full rounded"
                    title="Certificate Preview"
                    style={{ minHeight: '600px' }}
                  />
                )}
                {!generating && !genError && !pdfUrl && (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-300 text-sm">Loading PDF...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-400">Your certificate is ready for printing or download</p>
                <div className="flex gap-2">
                  <button 
                    disabled={!pdfUrl} 
                    className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50" 
                    onClick={handlePrintPDF}
                  >
                    Print
                  </button>
                  <button 
                    disabled={!pdfUrl} 
                    className="px-3 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50" 
                    onClick={handleDownloadPDF}
                  >
                    Download PDF
                  </button>
                  <button 
                    className="px-3 py-2 rounded bg-red-600 hover:bg-red-500" 
                    onClick={handleCloseReadyToPrint}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
