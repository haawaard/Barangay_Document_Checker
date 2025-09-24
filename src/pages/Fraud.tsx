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
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [fraudAttempts, setFraudAttempts] = useState<FraudAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch fraud attempts from API
  useEffect(() => {
    const fetchFraudAttempts = async () => {
      try {
        const response = await fetch('/api/dashboard/fraud-monitor');
        const data = await response.json();
        setFraudAttempts(data.fraudAttempts || []);
      } catch (error) {
        console.error('Error fetching fraud attempts:', error);
        setFraudAttempts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFraudAttempts();
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchFraudAttempts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ' // ' + date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <Layout>
      <h1 className="text-xl font-semibold mb-4">Fraud Monitor</h1>
      {/* Header */}
      <header className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
        <nav className="flex gap-6 text-gray-300">
          <a href="#" className="hover:text-white">About</a>
          <a href="#" className="text-blue-400">Home</a>
          <a href="#" className="hover:text-white">Contact</a>
        </nav>
        <div className="bg-gray-800 border border-gray-600 rounded px-3 py-2">
          <span className="text-white text-sm font-mono">{formatDateTime(currentDateTime)}</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        
        {/* Search Bar */}
        <div className="flex items-center gap-2 mb-6 w-full max-w-3xl">
          <Input
            type="text"
            placeholder="Search QR scan attempts..."
            className="bg-blue-950 text-white border-gray-700 flex-1"
          />
          <Button className="bg-blue-700 hover:bg-blue-600">Search</Button>
        </div>

        {/* Fraud Detection Table */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Loading QR scan attempts...</p>
          </div>
        ) : (
          <table className="w-full text-sm text-gray-300 border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="px-4 py-2 text-left">Document Type</th>
                <th className="px-4 py-2 text-left">Checker Type</th>
                <th className="px-4 py-2 text-left">Date Issued</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {fraudAttempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No QR scan attempts found
                  </td>
                </tr>
              ) : (
                fraudAttempts.map((attempt, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-700 hover:bg-blue-900/30"
                  >
                    <td className="px-4 py-2">{attempt.DocumentType}</td>
                    <td className="px-4 py-2">{attempt.CheckerMethod}</td>
                    <td className="px-4 py-2">{attempt.DateIssued}</td>
                    <td className="px-4 py-2">{attempt.Time}</td>
                    <td className="px-4 py-2">
                      <span className={`font-semibold ${
                        attempt.Status === 'Valid QR' 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {attempt.Status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}