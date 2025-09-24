import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import Layout from "./Layout";

const Dashboard: React.FC = () => {
    const [now, setNow] = useState(new Date());
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [validDocuments, setValidDocuments] = useState(0);
    const [invalidDocuments, setInvalidDocuments] = useState(0);
    const [recentIssuance, setRecentIssuance] = useState([]);
    const [fraudAttempts, setFraudAttempts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const id = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(id);
    }, []);

    useEffect(() => {
      // Fetch all dashboard data
      fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch total documents
        const totalResponse = await fetch("http://localhost:5000/api/dashboard/total-documents");
        const totalData = await totalResponse.json();
        setTotalDocuments(totalData.total);

        // Fetch valid documents
        const validResponse = await fetch("http://localhost:5000/api/dashboard/valid-documents");
        const validData = await validResponse.json();
        setValidDocuments(validData.count);

        // Fetch invalid documents
        const invalidResponse = await fetch("http://localhost:5000/api/dashboard/invalid-documents");
        const invalidData = await invalidResponse.json();
        setInvalidDocuments(invalidData.count);

        // Fetch recent issuance from audit logs
        const recentResponse = await fetch("http://localhost:5000/api/dashboard/recent-audit-issuance");
        const recentData = await recentResponse.json();
        setRecentIssuance(recentData.recent);

        // Fetch fraud monitor data
        const fraudResponse = await fetch("http://localhost:5000/api/dashboard/fraud-monitor");
        const fraudData = await fraudResponse.json();
        setFraudAttempts(fraudData.fraudAttempts || []);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    // Helper function to format dates properly
    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      
      // Handle ISO date strings and remove time portion
      const date = new Date(dateString.split('T')[0]);
      
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
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

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Welcome, Barangay 227</h1>
      <span className="text-sm">{dateStr} // {timeStr}</span>

      {/* EXPANDED STATISTICS CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400 text-sm">Total Documents Issued</p>
            <p className="text-3xl font-bold text-blue-400">{loading ? "..." : totalDocuments}</p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400 text-sm">Valid QR Scans</p>
            <p className="text-3xl font-bold text-green-400">{loading ? "..." : validDocuments}</p>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? "" : totalDocuments > 0 ? `${Math.round((validDocuments / (validDocuments + invalidDocuments)) * 100)}% success rate` : "No data"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400 text-sm">Invalid QR Scans</p>
            <p className="text-3xl font-bold text-red-400">{loading ? "..." : invalidDocuments}</p>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? "" : totalDocuments > 0 ? `${Math.round((invalidDocuments / (validDocuments + invalidDocuments)) * 100)}% failure rate` : "No data"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400 text-sm">Total QR Scans</p>
            <p className="text-3xl font-bold text-yellow-400">{loading ? "..." : (validDocuments + invalidDocuments)}</p>
            <p className="text-xs text-gray-500 mt-1">Valid + Invalid</p>
          </CardContent>
        </Card>
      </div>



      {/* Recent Issuance + Fraud Monitor */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4">
            <h2 className="font-bold mb-4 text-lg">Recent Document Issuance</h2>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="text-gray-400 text-left border-b border-gray-700">
                    <th className="pb-2 pr-4">Document Type</th>
                    <th className="pb-2 pr-4">Date Issued</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={3} className="text-center py-4">Loading...</td>
                    </tr>
                  ) : recentIssuance.length > 0 ? (
                    recentIssuance.slice(0, 8).map((item: any, index: number) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-2 pr-4">{item.DocumentType || 'Unknown'}</td>
                        <td className="py-2 pr-4">{formatDate(item.DateIssued)}</td>
                        <td className="py-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-900 text-green-300">
                            Issued
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-gray-400">No recent issuance found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4">
            <h2 className="font-bold mb-4 text-lg">QR Verification Monitor</h2>
            <div className="max-h-48 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-900">
                  <tr className="text-gray-400 text-left border-b border-gray-700">
                    <th className="pb-2 pr-2">Document</th>
                    <th className="pb-2 pr-2">Method</th>
                    <th className="pb-2 pr-2">Date</th>
                    <th className="pb-2 pr-2">Time</th>
                    <th className="pb-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-4">Loading...</td>
                    </tr>
                  ) : fraudAttempts.length > 0 ? (
                    fraudAttempts.slice(0, 8).map((attempt: any, index: number) => (
                      <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-2 pr-2 truncate" title={attempt.DocumentType}>
                          {attempt.DocumentType?.length > 12 
                            ? `${attempt.DocumentType.substring(0, 12)}...` 
                            : attempt.DocumentType || 'Unknown'}
                        </td>
                        <td className="py-2 pr-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-blue-900 text-blue-300">
                            {attempt.CheckerMethod || 'QR Scan'}
                          </span>
                        </td>
                        <td className="py-2 pr-2">{formatDate(attempt.DateIssued)}</td>
                        <td className="py-2 pr-2">{attempt.Time || 'N/A'}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            attempt.Status === 'Valid QR' 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {attempt.Status === 'Valid QR' ? '✓ Valid' : '✗ Invalid'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-400">No QR scan attempts found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
