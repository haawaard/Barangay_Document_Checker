import { useEffect, useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Upload, CheckCircle, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import jsQR from "jsqr";

export default function PublicDocumentChecker() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
    documentInfo?: any;
  } | null>(null);
  const navigate = useNavigate();

  // Format dates for display
  const formatDateDisplay = (dateInput: string | null | undefined): string => {
    if (!dateInput) return "N/A";
    
    // If it's already in readable format, return as is
    if (!dateInput.includes('T') && !dateInput.includes('Z')) {
      return dateInput;
    }
    
    try {
      const date = new Date(dateInput);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch {
      return dateInput;
    }
  };

  const handleBrgyLogin = () => navigate("/login");

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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
        
        // Handle network connectivity issues
        if (networkError instanceof Error && networkError.name === 'TypeError' && networkError.message.includes('fetch')) {
          setValidationResult({
            isValid: false,
            message: `❌ Server Unavailable: Unable to connect to the validation server.\n\nQR Hash: "${qrHash.substring(0, 32)}..."\n\nPlease ensure:\n1. Server is running (node server.js)\n2. Database is properly configured\n3. Network connection is stable`
          });
        } else {
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

  // Clear uploaded data and validation results
  const clearUploadedData = () => {
    setUploadedImage(null);
    setPreviewUrl(null);
    setValidationResult(null);
    setValidating(false);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Cleanup object URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-48 h-48 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-cyan-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-10 w-56 h-56 bg-indigo-500/10 rounded-full blur-xl"></div>
      </div>

      {/* Navbar */}
      <header className="w-full flex justify-between items-center py-4 px-6 bg-gradient-to-r from-blue-900/90 via-blue-800/90 to-blue-900/90 backdrop-blur-sm fixed top-0 left-0 z-50 border-b border-blue-700/30">
        <motion.h1 
          className="text-lg font-bold flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <img src="/images/SystemLogo.png" alt="Barangay Logo" className="w-8 h-8" />
          Barangay DocuCheck
        </motion.h1>

        <nav className="absolute left-1/2 transform -translate-x-1/2 flex gap-6 text-sm">
          <Link to="/about" className="hover:text-blue-300 transition-colors duration-300 hover:scale-105 transform">
            About
          </Link>
          <Link to="/" className="hover:text-blue-300 transition-colors duration-300 hover:scale-105 transform">
            Home
          </Link>
          <Link to="/contact" className="hover:text-blue-300 transition-colors duration-300 hover:scale-105 transform">
            Contact
          </Link>
        </nav>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            onClick={handleBrgyLogin}
            variant="secondary"
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 border-blue-500 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Barangay Login
          </Button>
        </motion.div>
      </header>

      {/* Main Section */}
      <main className="pt-24 px-6 min-h-[calc(100vh-64px)] flex flex-col items-center justify-center relative">
        {/* Hero Section */}
        <div className="text-center mb-12 max-w-4xl">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-6 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-4">
              Document Verification Center
            </h2>
          </motion.div>
          
          <motion.p
            className="text-xl text-gray-300 mb-4 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Verify the authenticity of barangay documents instantly using QR code technology
          </motion.p>
          
          <motion.div
            className="flex flex-wrap justify-center gap-4 text-sm text-gray-400 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Instant Verification
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Secure & Reliable
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Official Documents
            </div>
          </motion.div>
        </div>

        {/* Upload Card */}
        <motion.div
          className="flex justify-center max-w-2xl w-full"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="bg-gradient-to-br from-blue-900/30 via-slate-800/30 to-blue-900/30 backdrop-blur-xl border border-gray-700/50 shadow-2xl rounded-3xl flex flex-col justify-center items-center text-center p-10 gap-8 w-full relative overflow-hidden">
            {/* Card decorative elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full -translate-y-12 translate-x-12"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full translate-y-10 -translate-x-10"></div>
            
            <div className="flex flex-col items-center gap-4 relative z-10">
              {!uploadedImage ? (
                <motion.div
                  className="flex flex-col items-center gap-4"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-dashed border-blue-400/50">
                    <Upload className="w-12 h-12 text-blue-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-300 text-xl font-semibold mb-2">Upload QR Code Image</p>
                    <p className="text-gray-500 text-sm">Drop your image here or click to browse</p>
                    <p className="text-gray-600 text-xs mt-1">Supports JPG, PNG, GIF formats</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  className="flex flex-col items-center gap-4 w-full"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-green-400/50">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-green-400 font-semibold">Image Ready for Validation</p>
                </motion.div>
              )}

              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              
              {!uploadedImage && (
                <Button
                  variant="secondary"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={handleUploadClick}
                >
                  Choose QR Image
                </Button>
              )}

              {uploadedImage && (
                <div className="flex flex-col items-center gap-6 w-full">
                  {/* Display uploaded image */}
                  {previewUrl && (
                    <motion.div
                      className="w-full max-w-md"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Uploaded QR code"
                          className="w-full h-auto max-h-72 object-contain rounded-xl border-2 border-gray-600/50 shadow-lg"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl pointer-events-none"></div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-600/50">
                    <p className="text-green-400 text-sm font-medium">📁 {uploadedImage.name}</p>
                  </div>
                  
                  <div className="flex gap-4">
                    <Button
                      variant="secondary"
                      className="bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 px-8 py-3 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      onClick={validateQRCode}
                      disabled={validating}
                    >
                      {validating ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></div>
                          Validating...
                        </div>
                      ) : (
                        "🔍 Validate Document"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-gray-700/50 text-white hover:bg-gray-600/50 border-gray-500/50 px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105"
                      onClick={clearUploadedData}
                      disabled={validating}
                    >
                      🔄 Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Enhanced Validation Result */}
            {validationResult && (
              <motion.div
                className={`w-full p-6 rounded-2xl border-2 ${
                  validationResult.isValid 
                    ? 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-green-500/50 text-green-100' 
                    : 'bg-gradient-to-r from-red-900/40 to-rose-900/40 border-red-500/50 text-red-100'
                }`}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    validationResult.isValid 
                      ? 'bg-green-500/20 border border-green-400/50' 
                      : 'bg-red-500/20 border border-red-400/50'
                  }`}>
                    {validationResult.isValid ? (
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-lg">
                      {validationResult.isValid ? "✅ Document Verified!" : "❌ Verification Failed"}
                    </span>
                    <p className="text-sm opacity-80 mt-1">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="bg-black/20 p-4 rounded-lg mb-4 border border-white/10">
                  <p className="text-sm leading-relaxed">{validationResult.message}</p>
                </div>
                
                {validationResult.documentInfo && (
                  <motion.div
                    className="bg-gray-800/60 p-4 rounded-xl border border-gray-600/50"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                  >
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      📋 Document Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">ID:</span>
                        <span className="font-mono text-blue-300">{validationResult.documentInfo.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Type:</span>
                        <span className="text-green-300 font-medium">{validationResult.documentInfo.type}</span>
                      </div>
                      <div className="flex justify-between md:col-span-2">
                        <span className="text-gray-400">Issued:</span>
                        <span className="text-purple-300">{formatDateDisplay(validationResult.documentInfo.issuedOn)}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </Card>
        </motion.div>

        {/* Instructions Section */}
        <motion.div
          className="mt-16 max-w-4xl grid md:grid-cols-3 gap-8 px-4"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Upload QR Code</h3>
            <p className="text-gray-400 text-sm">Take a photo or upload an image containing the QR code from your barangay document</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Instant Validation</h3>
            <p className="text-gray-400 text-sm">Our system will automatically decode and verify the QR code against our secure database</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <h3 className="font-semibold text-white mb-2">Get Results</h3>
            <p className="text-gray-400 text-sm">Receive instant confirmation of document authenticity with detailed information</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
