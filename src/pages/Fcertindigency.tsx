import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";

export default function Fcertindigency() {
  const navigate = useNavigate();
  const templateSrc = "/indigency_template.png";
  
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
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [templateReady, setTemplateReady] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [templateSize, setTemplateSize] = useState<{ w: number; h: number } | null>(null);
  // Manual coordinates (in px) relative to the template's natural size.
  // Edit these numbers to align text to your template.
  const COORDS = {
    name: { top: 150, left: 300, width: 360 },
    address: { top: 245, left: 300, width: 420 },
    purpose: { top: 555, left: 520, width: 240 },
    date: { top: 640, left: 600, width: 220 },
    signature: { top: 900, left: 120, width: 320 },
  } as const;
  
  const fontSizes = useMemo(() => {
    const baseH = 1123; // ~A4 @ 96dpi
    const h = templateSize?.h || baseH;
    const scale = h / baseH;
    return {
      // Aim ~12pt (16px) at base height, scaled otherwise
      main: Math.max(12, Math.round(16 * scale)),
      small: Math.max(11, Math.round(14 * scale)),
      sig: Math.max(12, Math.round(16 * scale)),
    };
  }, [templateSize]);

  const fullName = useMemo(() => {
    const parts = [formData.FirstName, formData.MiddleName, formData.LastName].filter(Boolean);
    return parts.join(" ");
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


  

  useEffect(() => {
    // Preload the template image and capture its real size
    setTemplateReady(false);
    setTemplateError(null);
    const img = new Image();
    img.onload = () => {
      setTemplateSize({ w: img.naturalWidth || img.width, h: img.naturalHeight || img.height });
      setTemplateReady(true);
    };
    img.onerror = () => {
      setTemplateError("Cannot load template at " + templateSrc);
      setTemplateReady(false);
    };
    img.src = templateSrc;
  }, [templateSrc]);

  useEffect(() => {
    if (!showConfirm || activeTab !== "preview") return;
    if (!previewRef.current) return;
    if (!templateReady) return; // wait for template to load
    const generate = async () => {
      setGenerating(true);
      setGenError(null);
      try {
        const dataUrl = await toPng(previewRef.current!, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });
        setImageUrl(dataUrl);
      } catch (e) {
        setGenError("Failed to generate preview. Ensure template image exists and is same-origin.");
      } finally {
        setGenerating(false);
      }
    };
    // allow DOM to paint
    const id = setTimeout(generate, 50);
    return () => clearTimeout(id);
  }, [showConfirm, activeTab, formData, fullName, issuedOnPretty, templateReady, templateSize]);

  const handlePrintImage = () => {
    if (!imageUrl) return;
    const w = window.open("", "_blank", "width=1000,height=800");
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset='utf-8'><title>Print</title>
      <style>body{margin:0;background:#fff}img{width:210mm; height:auto; display:block; margin:0 auto}</style>
    </head><body><img src='${imageUrl}' alt='Certificate Preview'/></body></html>`);
    w.document.close();
    w.focus();
    w.onload = () => w.print();
  };

  const handleDownloadImage = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "indigency_certificate.png";
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

  const submitToServer = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch("http://localhost:5000/api/indigency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      console.log('Indigency submission response:', data);
      if (response.ok) {
        setResultId(data.id);
        setResultHash(
          data.hashcode || data.hash_code || data.hash || data.HashCode || data.Hashcode || ""
        );
        setShowConfirm(false);
        setShowResult(true);
      } else {
        setSubmitError(data.message || "Submission failed");
      }
    } catch (error) {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenConfirm = () => { setActiveTab("details"); setShowConfirm(true); };
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
      Purpose: "",
      issuedOn: "",
    });
  };

  return (
    <div className="p-6 bg-black min-h-screen text-white">
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Certificate of Indigency Form</h1>

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
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          />
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
          <label className="block font-semibold mb-1">Birthdate</label>
          <input
            type="date"
            name="Birthdate"
            value={formData.Birthdate}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          />
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
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Purpose */}
        <div className="mb-4">
          <label className="block font-semibold mb-1">Purpose</label>
          <select
            name="Purpose"
            value={formData.Purpose}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-gray-800 text-gray-300"
          >
            <option value="">Select Purpose</option>
            <option value="Employment">Employment</option>
            <option value="School Requirement">School Requirement</option>
            <option value="Travel">Travel</option>
            <option value="Government Transaction">Government Transaction</option>
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
        </div>

        {/* Buttons functios */}
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
          <div className="relative bg-gray-900 text-white rounded-xl shadow-xl w-full max-w-5xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Review Submission</h2>
              <div className="flex gap-2">
                <button onClick={() => setActiveTab("details")} className={`px-3 py-1 rounded ${activeTab === "details" ? "bg-blue-700" : "bg-gray-700 hover:bg-gray-600"}`}>Details</button>
                <button onClick={() => setActiveTab("preview")} className={`px-3 py-1 rounded ${activeTab === "preview" ? "bg-blue-700" : "bg-gray-700 hover:bg-gray-600"}`}>Ready-to-Print</button>
              </div>
            </div>

            {activeTab === "details" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
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
            )}

            {activeTab === "preview" && (
              <div className="w-full">
                {/* Hidden off-screen DOM to rasterize into image */}
                <div style={{ position: "absolute", left: -99999, top: 0 }}>
                  <div
                    ref={previewRef}
                    className="relative bg-white"
                    style={{ width: templateSize?.w || 794, height: templateSize?.h || 1123 }}
                  >
                    <img src={templateSrc} alt="Certificate Template" className="absolute inset-0 w-full h-full object-contain" />
                    {/* Manual overlay positions (edit COORDS above) */}
                    {/* Name inside first paragraph parentheses */}
                    <div
                      className="absolute text-black"
                      style={{
                        top: COORDS.name.top,
                        left: COORDS.name.left,
                        fontFamily: 'Times New Roman, serif',
                        fontSize: fontSizes.main,
                        fontWeight: 700,
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                        color: '#000',
                        width: COORDS.name.width,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {fullName || "(NAME OF APPLICANT)"}
                    </div>
                    {/* Address inside first paragraph parentheses */}
                    <div
                      className="absolute text-black"
                      style={{
                        top: COORDS.address.top,
                        left: COORDS.address.left,
                        fontFamily: 'Times New Roman, serif',
                        fontSize: fontSizes.main,
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                        color: '#000',
                        width: COORDS.address.width,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {formData.Address || "(ADDRESS)"}
                    </div>
                    {/* Purpose in the 'EX.' parentheses */}
                    <div
                      className="absolute text-black"
                      style={{
                        top: COORDS.purpose.top,
                        left: COORDS.purpose.left,
                        fontFamily: 'Times New Roman, serif',
                        fontSize: fontSizes.main,
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                        color: '#000',
                        width: COORDS.purpose.width,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {formData.Purpose || "(PURPOSE)"}
                    </div>
                    {/* Issued date inline near 'Done in the City...' */}
                    <div
                      className="absolute text-black"
                      style={{
                        top: COORDS.date.top,
                        left: COORDS.date.left,
                        fontFamily: 'Times New Roman, serif',
                        fontSize: fontSizes.small,
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                        color: '#000',
                        width: COORDS.date.width,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {issuedOnPretty || formData.issuedOn || "(DATE)"}
                    </div>
                    {/* Signature line applicant name at bottom */}
                    <div
                      className="absolute text-black"
                      style={{
                        top: COORDS.signature.top,
                        left: COORDS.signature.left,
                        fontFamily: 'Times New Roman, serif',
                        fontSize: fontSizes.sig,
                        fontWeight: 700,
                        lineHeight: 1.1,
                        whiteSpace: 'nowrap',
                        color: '#000',
                        width: COORDS.signature.width,
                        textAlign: 'center',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {fullName || "(APPLICANT)"}
                    </div>
                  </div>
                </div>

                <div className="min-h-[200px] max-h-[70vh] overflow-auto flex items-center justify-center bg-gray-800 rounded-md p-3">
                  {!templateReady && !templateError && <span className="text-gray-300 text-sm">Loading template...</span>}
                  {templateError && <span className="text-red-400 text-sm">{templateError}</span>}
                  {templateReady && generating && <span className="text-gray-300 text-sm">Generating preview...</span>}
                  {!generating && genError && <span className="text-red-400 text-sm">{genError}</span>}
                  {!generating && !genError && imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Certificate Preview"
                      className="rounded object-contain"
                      style={{ maxWidth: "620px", width: "100%", height: "auto", maxHeight: "68vh" }}
                    />
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  <button className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600" onClick={() => setActiveTab("details")}>Back to Details</button>
                  <button disabled={!imageUrl} className="px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 disabled:opacity-50" onClick={handleDownloadImage}>Download PNG</button>
                  <button disabled={!imageUrl} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50" onClick={handlePrintImage}>Print</button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Place your template at <code>/public/indigency_template.png</code>. Adjust positions in code to align text.</p>
              </div>
            )}

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
