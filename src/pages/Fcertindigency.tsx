import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PDFDocument } from 'pdf-lib';

export default function Fcertindigency() {
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
    Purpose: "",
    issuedOn: "",
  });

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
  
  // Contact number validation state
  const [contactError, setContactError] = useState("");
  
  // Form validation state
  const [formValidationError, setFormValidationError] = useState("");
  
  // Validation notice state for incomplete form
  const [showValidationNotice, setShowValidationNotice] = useState(false);
  
  // Birth date components
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthYear, setBirthYear] = useState("");

  const fullName = useMemo(() => {
    const parts = [formData.FirstName];
    if (formData.MiddleName && formData.MiddleName.trim()) {
      parts.push(formData.MiddleName.trim());
    }
    if (formData.LastName) {
      parts.push(formData.LastName);
    }
    return parts.filter(Boolean).join(" ");
  }, [formData.FirstName, formData.MiddleName, formData.LastName]);

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

  // Handle birth date component changes
  const handleBirthDateChange = (month: string, day: string, year: string) => {
    if (month && day && year) {
      const birthdate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      const age = calculateAge(birthdate);
      setFormData(prev => ({ ...prev, Birthdate: birthdate, Age: age }));
    } else {
      setFormData(prev => ({ ...prev, Birthdate: '', Age: '' }));
    }
  };

  // Calculate age from birthdate
  const calculateAge = (birthdate: string) => {
    if (!birthdate) return '';
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age.toString();
  };

  // Get calculated age for database
  const getCalculatedAge = () => {
    return calculateAge(formData.Birthdate);
  };

  // Validate form fields
  const validateForm = () => {
    const requiredFields = {
      'Last Name': formData.LastName,
      'First Name': formData.FirstName,
      'Address': formData.Address,
      'Birthdate': formData.Birthdate,
      'Contact Number': formData.ContactNumber,
      'Gender': formData.Gender,
      'Purpose': formData.Purpose
    };

    const emptyFields = Object.entries(requiredFields)
      .filter(([, value]) => {
        // More robust validation
        if (!value) return true; // null, undefined, or empty string
        if (typeof value !== 'string') return true; // not a string
        if (value.trim() === '') return true; // only whitespace
        return false;
      })
      .map(([key]) => key);

    if (emptyFields.length > 0) {
      setFormValidationError(`Please fill in all required fields: ${emptyFields.join(', ')}`);
      return false;
    }

    // Check contact number validation error
    if (contactError && contactError.trim() !== '') {
      setFormValidationError('Please fix the contact number error before submitting.');
      return false;
    }

    // Check contact number length
    if (!formData.ContactNumber || formData.ContactNumber.length !== 11) {
      setFormValidationError('Contact number must be exactly 11 digits.');
      return false;
    }

    setFormValidationError('');
    return true;
  };


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

  // Generate PDF from template with AcroForms
  const generatePDF = async () => {
    setGenerating(true);
    setGenError(null);
    try {
      console.log('Starting PDF generation...');
      console.log('Fetching PDF template from:', '/indigency_template.pdf');
      
      // Load the PDF template with AcroForms
      const templateBytes = await fetch('/indigency_template.pdf').then(res => {
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

      // Create the certification text with variables filled in
      const certificationText = `This is to certify that ${fullName} of legal age, is a bonafide resident of this Barangay at ${formData.Address}, and has no derogatory record accountabilities filed as of the date.

Further certify that ${fullName} belongs to one of our indigent families in the community. The family's income is not sufficient to support financial expenses.

Hence, the undersigned is referring to your good office/institution so he/she could avail of ${formData.Purpose}. We will highly appreciate your kindness.

This certification is being issued to attest veracity of the above and for other legal purpose it may serve. Attached herewith are necessary documents for reference.

Done in the City of Manila, this ${issuedOnPretty || formData.issuedOn}`;

      // Fill the main certification text field
      fillTextField('certification_text', certificationText);
      
      // Fill individual variable fields if they exist
      fillTextField('full_name', fullName);
      fillTextField('address', formData.Address);
      fillTextField('purpose', formData.Purpose);
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
          errorMessage = 'PDF template not found. Please ensure indigency_template.pdf exists in /public/ folder and the development server is running on port 5173.';
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

  // PDF generation is now triggered only in Ready-to-Print modal

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
    a.download = "indigency_certificate.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  

  const handleBack = () => {
    navigate("/issuance");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Special handling for contact number
    if (name === "ContactNumber") {
      // Remove any non-digit characters
      const numericValue = value.replace(/[^0-9]/g, '');
      
      // Limit to 11 digits
      const limitedValue = numericValue.slice(0, 11);
      
      // Update form data
      setFormData((prev) => ({ ...prev, [name]: limitedValue }));
      
      // Validate and set error message
      if (limitedValue.length === 0) {
        setContactError("");
      } else if (limitedValue.length < 11) {
        setContactError(`Contact number must be exactly 11 digits. Current: ${limitedValue.length} digits`);
      } else if (limitedValue.length === 11) {
        setContactError("");
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submitToServer = async () => {
    // Double-check validation before submitting
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setFormValidationError('');
    
    try {
      console.log('Submitting form data:', formData);
      
      // Prepare clean form data for submission
      const calculatedAge = getCalculatedAge();
      const submitData = {
        ...formData,
        LastName: formData.LastName.trim(),
        FirstName: formData.FirstName.trim(),
        MiddleName: formData.MiddleName ? formData.MiddleName.trim() : '',
        Address: formData.Address.trim(),
        ContactNumber: formData.ContactNumber.trim(),
        Gender: formData.Gender.trim(),
        Purpose: formData.Purpose.trim(),
        Age: calculatedAge
      };
      
      const response = await fetch("http://localhost:5000/api/indigency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Indigency submission response:', data);
      
      if (response.ok) {
        setResultId(data.id || data.clearance_id);
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
        const serverMessage = data.message || data.error || `Server error: ${response.status}`;
        
        // Handle specific server validation errors
        if (serverMessage.toLowerCase().includes('required') || 
            serverMessage.toLowerCase().includes('missing') ||
            serverMessage.toLowerCase().includes('empty')) {
          setFormValidationError(serverMessage);
        } else {
          setSubmitError(serverMessage);
        }
      }
    } catch (error) {
      console.error('Network error details:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSubmitError(`Network error: ${errorMessage || 'Please ensure the backend server is running on port 5000'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenConfirm = () => {
    setFormValidationError(''); // Clear any previous validation errors
    setShowValidationNotice(false); // Clear previous notice
    
    if (validateForm()) {
      setActiveTab("details");
      setShowConfirm(true);
    } else {
      // Show validation notice for incomplete form
      setShowValidationNotice(true);
      
      // Auto-hide the notice after 5 seconds
      setTimeout(() => {
        setShowValidationNotice(false);
      }, 5000);
    }
  };
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
      const filename = `${sanitizedName}_Indigency_QR_${timestamp}.png`;
      
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
      
      console.log(`Indigency QR code downloaded as: ${filename}`);
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const handleCloseReadyToPrint = () => {
    setShowReadyToPrint(false);
    setResultHash(null);
    setResultId(null);
    setPdfUrl(null);
    setQrCodeUrl(null);
    setContactError("");
    setFormValidationError("");
    setShowValidationNotice(false);
    setSubmitError(null);
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
      Purpose: "",
      issuedOn: formattedDate,
    });
    
    // Reset birth date components
    setBirthMonth("");
    setBirthDay("");
    setBirthYear("");
    
    // Navigate back to issuance page
    navigate("/issuance");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Certificate of Indigency Form</h1>
            <p className="text-gray-400 text-sm">Please fill out all required information below</p>
          </div>

          <div className="space-y-6">
            {/* Form Validation Error */}
            {formValidationError && (
              <div className="p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm">
                {formValidationError}
              </div>
            )}

            {/* Personal Information Section */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/20 pb-2">
                Personal Information
              </h2>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
              <input
                type="text"
                name="LastName"
                value={formData.LastName}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder-gray-500"
                placeholder="Enter your last name"
              />
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
              <input
                type="text"
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder-gray-500"
                placeholder="Enter your first name"
              />
            </div>

            {/* Middle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Middle Name</label>
              <input
                type="text"
                name="MiddleName"
                value={formData.MiddleName}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder-gray-500"
                placeholder="Optional"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Address *</label>
              <input
                type="text"
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder-gray-500"
                placeholder="Enter your complete address"
              />
            </div>

            {/* Birthdate */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Birthdate</label>
              <div className="grid grid-cols-3 gap-3">
                <select
                  value={birthMonth}
                  onChange={(e) => {
                    setBirthMonth(e.target.value);
                    handleBirthDateChange(e.target.value, birthDay, birthYear);
                  }}
                  className="px-3 py-2 text-sm rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                >
                  <option value="">Month</option>
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={birthDay}
                  onChange={(e) => {
                    setBirthDay(e.target.value);
                    handleBirthDateChange(birthMonth, e.target.value, birthYear);
                  }}
                  className="px-3 py-2 text-sm rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                >
                  <option value="">Day</option>
                  {dayOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={birthYear}
                  onChange={(e) => {
                    setBirthYear(e.target.value);
                    handleBirthDateChange(birthMonth, birthDay, e.target.value);
                  }}
                  className="px-3 py-2 text-sm rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                >
                  <option value="">Year</option>
                  {yearOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              {formData.Birthdate && (
                <div className="mt-3 space-y-1">
                  <div className="text-green-400 text-sm font-medium">
                    Selected: {monthOptions.find(m => m.value === birthMonth)?.label} {birthDay}, {birthYear}
                  </div>
                  {calculateAge(formData.Birthdate) && (
                    <div className="text-blue-400 text-sm font-medium">
                      Age: {calculateAge(formData.Birthdate)} years old
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contact Number */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Contact Number *</label>
              <input
                type="text"
                name="ContactNumber"
                value={formData.ContactNumber}
                onChange={handleChange}
                maxLength={11}
                className={`w-full px-4 py-3 text-sm rounded-lg bg-gray-900 text-white border transition-all outline-none placeholder-gray-500 ${
                  contactError 
                    ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
                    : 'border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                }`}
                placeholder="Enter 11-digit contact number (e.g., 09123456789)"
              />
              {contactError && (
                <p className="mt-2 text-red-400 text-sm">{contactError}</p>
              )}
              {formData.ContactNumber && !contactError && formData.ContactNumber.length === 11 && (
                <p className="mt-2 text-green-400 text-sm">✓ Valid contact number</p>
              )}
              <p className="text-gray-500 text-xs mt-1">Only numbers allowed, exactly 11 digits required</p>
            </div>

            {/* Gender */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Gender *</label>
              <select
                name="Gender"
                value={formData.Gender}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            </div>

            {/* Purpose */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">Purpose *</label>
              <select
                name="Purpose"
                value={formData.Purpose}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              >
                <option value="">Select Purpose</option>
                <option value="Medical Assistance">Medical Assistance</option>
                <option value="Educational Scholarship">Educational Scholarship</option>
                <option value="Legal Documentation">Legal Documentation</option>
                <option value="Financial Assistance">Financial Assistance</option>
                <option value="Government Benefits">Government Benefits</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Issued On */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-2">Issued On</label>
              <input
                type="date"
                name="issuedOn"
                value={formData.issuedOn}
                onChange={handleChange}
                className="w-full px-4 py-3 text-sm rounded-lg bg-gray-900 text-white border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
              />
              <p className="text-gray-500 text-xs mt-1">Automatically set to today's date</p>
            </div>
          </div>

          {/* Validation Notice */}
          {showValidationNotice && (
            <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-500/50 rounded-lg animate-pulse">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400 text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-300">Incomplete Form</h3>
                  <div className="mt-2 text-sm text-yellow-200">
                    {formValidationError}
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      className="text-xs bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded transition-colors"
                      onClick={() => setShowValidationNotice(false)}
                    >
                      Got it
                    </button>
                  </div>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <button
                    type="button"
                    className="text-yellow-400 hover:text-yellow-300"
                    onClick={() => setShowValidationNotice(false)}
                  >
                    <span className="sr-only">Close</span>
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-gray-600">
            <button 
              onClick={handleBack} 
              className="flex-1 px-6 py-3 text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors border border-gray-600"
            >
              Back
            </button>
            <button 
              onClick={handleOpenConfirm} 
              className="flex-1 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-lg"
            >
              Review & Submit
            </button>
          </div>
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
                  <div className="md:col-span-2"><span className="text-gray-400">Purpose:</span> {formData.Purpose}</div>
                  <div className="md:col-span-2"><span className="text-gray-400">Issued On:</span> {issuedOnPretty || formData.issuedOn}</div>
                </div>
              </div>
            )}

            {activeTab === "preview" && (
              <div className="max-h-96 overflow-y-auto">
                <div className="bg-gray-800 rounded-md p-4">
                  <h3 className="text-lg font-semibold mb-4 text-center">Certificate of Indigency Preview</h3>
                  <div className="space-y-3 text-sm">
                    <div className="text-center mb-6">
                      <div className="text-base font-bold">CERTIFICATE OF INDIGENCY</div>
                      <div className="text-sm text-gray-400 mt-2">TO WHOM IT MAY CONCERN:</div>
                    </div>
                    
                    <div className="text-justify leading-relaxed">
                      <p>This is to certify that <span className="font-semibold text-blue-300">{fullName}</span> of legal age, is a bonafide resident of this Barangay at <span className="font-semibold text-blue-300">{formData.Address}</span>, and has no derogatory record accountabilities filed as of the date.</p>
                      
                      <p className="mt-3">Further certify that <span className="font-semibold text-blue-300">{fullName}</span> belongs to one of our indigent families in the community. The family's income is not sufficient to support financial expenses.</p>
                      
                      <p className="mt-3">Hence, the undersigned is referring to your good office/institution so he/she could avail of <span className="font-semibold text-blue-300">{formData.Purpose}</span>. We will highly appreciate your kindness.</p>
                      
                      <p className="mt-3">This certification is being issued to attest veracity of the above and for other legal purpose it may serve. Attached herewith are necessary documents for reference.</p>
                      
                      <p className="mt-4">Done in the City of Manila, this <span className="font-semibold text-blue-300">{issuedOnPretty || formData.issuedOn}</span></p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-600">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div><span className="text-gray-400">Full Name:</span> {fullName}</div>
                        <div><span className="text-gray-400">Age:</span> {formData.Age}</div>
                        <div><span className="text-gray-400">Address:</span> {formData.Address}</div>
                        <div><span className="text-gray-400">Gender:</span> {formData.Gender}</div>
                        <div><span className="text-gray-400">Contact:</span> {formData.ContactNumber}</div>
                        <div><span className="text-gray-400">Purpose:</span> {formData.Purpose}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(submitError || formValidationError) && (
              <div className="text-red-400 mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-400 rounded-full flex-shrink-0"></div>
                  <div>
                    {formValidationError && <p className="font-medium">{formValidationError}</p>}
                    {submitError && <p className="text-sm">{submitError}</p>}
                  </div>
                </div>
              </div>
            )}
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
