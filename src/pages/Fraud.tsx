import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "./Layout";

interface FraudAttempt {
  DocumentType: string;
  CheckerMethod: string;
  DateIssued: string;
  Time: string;
  Status: string;
}

export default function FraudMonitor() {
  const [fraudAttempts, setFraudAttempts] = useState<FraudAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [now, setNow] = useState(new Date());
  const [sortField, setSortField] = useState<keyof FraudAttempt | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Fetch fraud attempts from database
  useEffect(() => {
    fetchFraudAttempts();
  }, []);

  const fetchFraudAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("http://localhost:5000/api/dashboard/fraud-monitor");
      const data = await response.json();
      
      if (response.ok) {
        // Filter to only show Invalid QR attempts
        const invalidQRAttempts = (data.fraudAttempts || []).filter((attempt: any) => 
          attempt.Status === 'Invalid QR'
        );
        
        setFraudAttempts(invalidQRAttempts);
        console.log(`Loaded ${invalidQRAttempts.length} invalid QR attempts (filtered from ${data.fraudAttempts?.length || 0} total attempts)`);
      } else {
        setError(data.message || "Failed to fetch fraud attempts");
      }
    } catch (err) {
      console.error("Error fetching fraud attempts:", err);
      setError("Unable to connect to server. Please ensure the server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  // Filter fraud attempts based on search term
  const filteredFraudAttempts = fraudAttempts.filter(attempt => 
    Object.values(attempt).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort fraud attempts based on current sort field and direction
  const sortedFraudAttempts = [...filteredFraudAttempts].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    const aStr = aValue.toString().toLowerCase();
    const bStr = bValue.toString().toLowerCase();
    
    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  const handleSort = (field: keyof FraudAttempt) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format date to remove T16:00:00.000Z format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      // Remove the T16:00:00.000Z part if it exists
      const cleanDate = dateString.split('T')[0];
      const date = new Date(cleanDate);
      if (isNaN(date.getTime())) return dateString;
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

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

  const handleSearch = () => {
    // Search is already handled by the filteredFraudAttempts computed value
    console.log(`Searching for: "${searchTerm}"`);
  };

  return (
    <Layout>
      {/* Header with Date/Time Only */}
      <header className="flex justify-end items-center border-b border-gray-700 pb-4 mb-6">
        <span className="text-sm">{dateStr} // {timeStr}</span>
      </header>

      <h1 className="text-2xl font-bold mb-6">Fraud Monitor - Invalid QR Attempts</h1>
      
      {/* Search Bar - Forced Visibility */}
      <div className="flex items-center gap-2 mb-6 w-full max-w-3xl" style={{backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '4px'}}>
          <Input
            type="text"
            placeholder="Search invalid QR attempts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-blue-950 text-white border-gray-700 flex-1"
            style={{minHeight: '40px'}}
          />
          <Button 
            onClick={handleSearch}
            className="bg-blue-700 hover:bg-blue-600"
            style={{minHeight: '40px', minWidth: '80px'}}
          >
            Search
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 text-gray-400">
            <p>Loading invalid QR attempts...</p>
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
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-blue-800" onClick={() => handleSort('DocumentType')}>
                  Document Type
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-blue-800" onClick={() => handleSort('CheckerMethod')}>
                  Checker Type
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-blue-800" onClick={() => handleSort('DateIssued')}>
                  Date Issued
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-blue-800" onClick={() => handleSort('Time')}>
                  Time
                </th>
                <th className="px-4 py-2 text-left cursor-pointer hover:bg-blue-800" onClick={() => handleSort('Status')}>
                  Status
                </th>
              </tr>
            </thead>
              <tbody>
                {sortedFraudAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? "No invalid QR attempts found matching your search." : "No invalid QR attempts found"}
                    </td>
                  </tr>
                ) : (
                  sortedFraudAttempts.map((attempt, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-blue-900/30"
                    >
                      <td className="px-4 py-2">{attempt.DocumentType}</td>
                      <td className="px-4 py-2">{attempt.CheckerMethod}</td>
                      <td className="px-4 py-2">{formatDate(attempt.DateIssued)}</td>
                      <td className="px-4 py-2">{attempt.Time}</td>
                      <td className="px-4 py-2">
                        <span className="font-semibold text-red-400">
                          ❌ {attempt.Status}
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