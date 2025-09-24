import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload, CheckCircle, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import jsQR from "jsqr";

export default function PublicDocumentChecker() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const fileInputRef = useState<HTMLInputElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    documentInfo?: any;
  } | null>(null);
  const navigate = useNavigate();

  // Helper function to format dates for display
  const formatDateDisplay = (dateInput: string | null | undefined): string => {
    if (!dateInput) return "N/A";
    
    // If it's already in a readable format, return as is
    if (!dateInput.includes('T') && !dateInput.includes('Z')) {
      return dateInput;
    }
    
    try {
      const date = new Date(dateInput);
      const options: Intl.DateTimeFormatOptions = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      };
      return date.toLocaleDateString('en-US', options);
    } catch {
      return dateInput; // Return original if parsing fails
    }
  };

  const handleBrgyLogin = () => {
    navigate("/login");
  };

  const handleUploadClick = () => {
    if (fileInputRef[0]) {
      fileInputRef[0].click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowPreview(true);
      setValidationResult(null); // Reset validation result when new file is uploaded
    }
  };

  // Function to decode QR code from uploaded image
  const decodeQRFromImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
        
        if (imageData) {
          // Use jsQR to decode the QR code
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            console.log('QR Code found:', code.data);
            resolve(code.data);
          } else {
            reject(new Error('No QR code found in the image. Please ensure the image contains a clear QR code.'));
          }
        } else {
          reject(new Error('Failed to process image data.'));
        }
      };
      
      img.onerror = () => reject(new Error('Failed to load image. Please try a different image file.'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Function to validate QR code hash against database
  const validateQRCode = async () => {
    if (!uploadedImage) {
      setValidationResult({
        isValid: false,
        message: "❌ No QR code image uploaded. Please upload a QR code image first."
      });
      return;
    }

    setValidating(true);
    setValidationResult(null);

    try {
      // Step 1: Decode QR code from image
      let qrHash;
      try {
        qrHash = await decodeQRFromImage(uploadedImage);
        console.log('Extracted QR hash:', qrHash);
        
        if (!qrHash || qrHash.trim() === '') {
          setValidationResult({
            isValid: false,
            message: "❌ No valid QR code found in the uploaded image. Please ensure the image contains a clear QR code."
          });
          setValidating(false);
          return;
        }
      } catch (qrDecodeError) {
        console.error('QR decoding failed:', qrDecodeError);
        setValidationResult({
          isValid: false,
          message: "❌ Failed to decode QR code from image. Please ensure the image contains a valid QR code and try again."
        });
        setValidating(false);
        return;
      }
      
      // Step 2: Send hash to backend for validation
      try {
        const response = await fetch("http://localhost:5000/api/validate-qr", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            hash: qrHash,
            documentType: "Document" // Default since we removed type selection
          }),
        });

        const data = await response.json();

        if (response.ok) {
          if (data.isValid) {
            setValidationResult({
              isValid: true,
              message: `✅ Document Verified Successfully! This ${data.documentType} certificate is authentic and valid.`,
              documentInfo: data.document
            });
          } else {
            setValidationResult({
              isValid: false,
              message: `❌ Document Verification Failed: ${data.message || 'This QR code is not registered in our database. The document may be fraudulent or expired.'}`
            });
          }
        } else {
          // Handle HTTP error responses
          const errorMessage = data.message || 'Server error during validation';
          setValidationResult({
            isValid: false,
            message: `❌ Validation Error: ${errorMessage}`
          });
        }
      } catch (networkError) {
        console.error('Network error during QR validation:', networkError);
        
        // Check if it's a network connectivity issue
        if (networkError instanceof Error && networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
          // If backend API is not available, use temporary mock validation
          console.log('Backend API not available. Using temporary mock validation...');
          
          // Temporary mock database for testing (remove when MySQL is set up)
          const mockDatabase = [
            {
              hash: "db8237d31e7ce91969940bd1e3967001",
              type: "Barangay Clearance",
              name: "John M Doe",
              address: "McArthur Highway corner Aguas Street, Balibago",
              purpose: "School Requirement",
              issuedOn: "September 22, 2025"
            },
            {
              hash: "b5e2ec106a20c84d73644aae05babf2e",
              type: "Certificate of Indigency",
              name: "Jane Smith",
              address: "Sample Address",
              purpose: "Medical Assistance",
              issuedOn: "September 20, 2025"
            }
          ];
          
          const foundDocument = mockDatabase.find(doc => 
            qrHash.toLowerCase().includes(doc.hash.toLowerCase()) || 
            doc.hash.toLowerCase().includes(qrHash.toLowerCase())
          );
          
          if (foundDocument) {
            setValidationResult({
              isValid: true,
              message: `✅ Document Verified! ${foundDocument.type} is valid (OFFLINE MODE - Backend unavailable).`,
              documentInfo: {
                id: foundDocument.hash.substring(0, 8).toUpperCase(),
                type: foundDocument.type,
                name: foundDocument.name,
                address: foundDocument.address,
                purpose: foundDocument.purpose,
                issuedOn: foundDocument.issuedOn,
                hash: foundDocument.hash
              }
            });
          } else {
            setValidationResult({
              isValid: false,
              message: `❌ Document Not Found: The QR code hash does not match any records in our database.\n\nQR Hash: "${qrHash.substring(0, 32)}..."\n\n⚠️ OFFLINE MODE: Backend server is unavailable. Limited validation only.\n\nTo enable full validation:\n1. Install MySQL Server\n2. Create 'barangay_db' database\n3. Start server with: node server.js\n\nSee DATABASE_SETUP.md for detailed instructions.`
            });
          }
        } else {
          // Handle other types of network errors
          setValidationResult({
            isValid: false,
            message: `❌ Network Error: Unable to connect to validation server. Please check your internet connection and try again.\n\nError: ${networkError instanceof Error ? networkError.message : 'Connection failed'}`
          });
        }
      }
    } catch (error) {
      console.error("Unexpected error during QR validation:", error);
      setValidationResult({
        isValid: false,
        message: `❌ Unexpected Error: An unexpected error occurred while processing the QR code.\n\nError Details: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease try again or contact support if the problem persists.`
      });
    }

    setValidating(false);
  };

  // Cleanup object URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const closePreview = () => {
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <header className="w-full flex justify-between items-center py-4 px-6 bg-blue-900 fixed top-0 left-0 z-50">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <img src="/images/SystemLogo.png" alt="Barangay Logo" className="w-8 h-8" /> Barangay DocuCheck
        </h1>

        <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-6 text-sm">
          <Link to="/about" className="hover:text-blue-400 transition">
            About
          </Link>
          <Link to="/" className="hover:text-blue-400 transition">
            Home
          </Link>
          <Link to="/contact" className="hover:text-blue-400 transition">
            Contact
          </Link>
        </nav>

        <Button
          onClick={handleBrgyLogin}
          variant="secondary"
          className="bg-blue-700 text-white hover:bg-blue-600"
        >
          Barangay Login
        </Button>
      </header>

      {/* Main Section */}
      <main className="pt-24 px-6 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center">
        <motion.h2
          className="text-4xl font-extrabold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Public Document Checker
        </motion.h2>

        <div className="flex justify-center max-w-2xl w-full">
          {/* UPLOAD/SCAN QR - Centered */}
          <Card className="bg-gray-950 border-dashed border-2 border-gray-600 shadow-xl rounded-2xl flex flex-col justify-center items-center text-center p-8 gap-6 w-full">
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-12 h-12 text-gray-400" />
              <p className="text-gray-300 text-lg">Upload QR here</p>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={el => (fileInputRef[1](el))}
                onChange={handleFileChange}
              />
              <Button
                variant="secondary"
                className="bg-blue-700 text-white hover:bg-blue-600 px-6 py-3"
                onClick={handleUploadClick}
              >
                Upload QR
              </Button>
              {uploadedImage && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-green-400">Image uploaded: {uploadedImage.name}</p>
                  <Button
                    variant="secondary"
                    className="bg-green-700 text-white hover:bg-green-600"
                    onClick={validateQRCode}
                    disabled={validating}
                  >
                    {validating ? "Validating..." : "Validate"}
                  </Button>
                </div>
              )}
            </div>
            
            {/* Validation Result */}
            {validationResult && (
              <div className={`w-full p-4 rounded-lg border ${
                validationResult.isValid 
                  ? 'bg-green-900/30 border-green-600 text-green-300' 
                  : 'bg-red-900/30 border-red-600 text-red-300'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span className="font-semibold">
                    {validationResult.isValid ? "Document Verified" : "Verification Failed"}
                  </span>
                </div>
                <p className="text-sm">{validationResult.message}</p>
                {validationResult.documentInfo && (
                  <div className="mt-3 text-xs bg-gray-800/50 p-2 rounded">
                    <p><strong>Document ID:</strong> {validationResult.documentInfo.id}</p>
                    <p><strong>Type:</strong> {validationResult.documentInfo.type}</p>
                    <p><strong>Issued:</strong> {formatDateDisplay(validationResult.documentInfo.issuedOn)}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>

      {/* Image Preview Modal */}
      {showPreview && previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <div
            className="relative bg-gray-900 rounded-xl shadow-xl max-w-3xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closePreview}
              className="absolute -top-3 -right-3 bg-transparent hover:bg-white/10 text-white rounded-full w-9 h-9 border border-white/40"
              aria-label="Close preview"
            >
              ×
            </button>
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="max-h-[80vh] max-w-full object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
