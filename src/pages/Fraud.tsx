import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import Layout from "./Layout";

interface InvalidQRAttempt {
  qrHash: string;
  scanCount: number;
  firstScanDate: string;
  lastScanDate: string;
  lastScanTime: string;
  isSuspicious: boolean;
  checkerMethod: string;
}

export default function FraudMonitor() {
  const [invalidQRAttempts, setInvalidQRAttempts] = useState<InvalidQRAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [now, setNow] = useState(new Date());
  const [sortField, setSortField] = useState<keyof InvalidQRAttempt | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Real-time clock update
  useEffect(() => {
    const clockInterval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Fetch invalid QR attempts on component mount
  useEffect(() => {
    fetchInvalidQRAttempts();
  }, []);

  const fetchInvalidQRAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("http://localhost:5000/api/dashboard/invalid-qr-monitor");
      const data = await response.json();
      
      if (response.ok) {
        setInvalidQRAttempts(data.invalidQRAttempts || []);
      } else {
        setError(data.message || "Failed to fetch invalid QR attempts");
      }
    } catch (err) {
      console.error("Error fetching invalid QR attempts:", err);
      setError("Unable to connect to server. Please ensure the server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort invalid QR attempts
  const filteredInvalidQRAttempts = invalidQRAttempts.filter((attempt: InvalidQRAttempt) => 
    Object.values(attempt).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedInvalidQRAttempts = [...filteredInvalidQRAttempts].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    // Handle null/undefined values
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    
    // Handle different data types
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === 'asc' 
        ? (aValue === bValue ? 0 : aValue ? 1 : -1)
        : (aValue === bValue ? 0 : aValue ? -1 : 1);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    // String comparison
    const aStr = aValue.toString().toLowerCase();
    const bStr = bValue.toString().toLowerCase();
    return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
  });

  const handleSort = (field: keyof InvalidQRAttempt) => {
    setSortDirection(sortField === field && sortDirection === 'asc' ? 'desc' : 'asc');
    setSortField(field);
  };

  // Format date display
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const cleanDate = dateString.split('T')[0];
      const date = new Date(cleanDate);
      return isNaN(date.getTime()) ? dateString : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  // Format current date and time for header
  const dateStr = now.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return (
    <Layout>
      {/* Header with Date/Time */}
      <header className="flex justify-end items-center border-b border-gray-700 pb-4 mb-6">
        <span className="text-sm">{dateStr} // {timeStr}</span>
      </header>

      <h1 className="text-2xl font-bold mb-6">Fraud Monitor - Invalid QR Code Tracking</h1>
      
      {/* Search Bar */}
      <div className="flex items-center gap-2 mb-6 w-full max-w-3xl bg-blue-500/10 p-2 rounded">
        <Input
          type="text"
          placeholder="Search invalid QR codes, hash, scan count..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-blue-950 text-white border-gray-700 flex-1 min-h-[40px]"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-400">
          <p>Loading invalid QR code attempts...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-300 p-4 rounded-lg mb-6">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Fraud Detection Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-blue-800" onClick={() => handleSort('qrHash')}>
                  QR Code Hash
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-blue-800" onClick={() => handleSort('scanCount')}>
                  Scan Count
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-blue-800" onClick={() => handleSort('firstScanDate')}>
                  First Scan
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-blue-800" onClick={() => handleSort('lastScanDate')}>
                  Last Scan
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-blue-800" onClick={() => handleSort('lastScanTime')}>
                  Last Time
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-blue-800" onClick={() => handleSort('isSuspicious')}>
                  Status
                </th>
              </tr>
            </thead>
              <tbody>
                {sortedInvalidQRAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? "No invalid QR attempts found matching your search." : "No invalid QR attempts found"}
                    </td>
                  </tr>
                ) : (
                  sortedInvalidQRAttempts.map((attempt: InvalidQRAttempt, index: number) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-700 hover:bg-blue-900/30 ${attempt.isSuspicious ? 'bg-red-900/20' : ''}`}
                    >
                      <td className="px-4 py-2 font-mono text-xs">
                        <span title={attempt.qrHash}>
                          {attempt.qrHash.length > 20 ? `${attempt.qrHash.substring(0, 20)}...` : attempt.qrHash}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span className={`font-semibold ${attempt.scanCount > 3 ? 'text-red-400' : 'text-blue-300'}`}>
                          {attempt.scanCount}
                        </span>
                      </td>
                      <td className="px-4 py-2">{formatDate(attempt.firstScanDate)}</td>
                      <td className="px-4 py-2">{formatDate(attempt.lastScanDate)}</td>
                      <td className="px-4 py-2">{attempt.lastScanTime}</td>
                      <td className="px-4 py-2">
                        <span className={`font-semibold ${attempt.isSuspicious ? 'text-red-400' : 'text-yellow-400'}`}>
                          {attempt.isSuspicious ? '🚨 SUSPICIOUS' : '⚠️ Invalid QR'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
    </Layout>
  );
}