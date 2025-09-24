import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "./Layout";

export default function FraudMonitor() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

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

  const suspiciousLogs = [
    {
      documentId: "1005",
      documentType: "Barangay Clearance",
      totalFailedAttempt: 2,
      lastAttemptTimestamp: "2025-08-17 08:06:10 AM",
      status: "Suspicious",
      ipAddress: "203.0.113.12",
    },
  ];

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
            placeholder="Search"
            className="bg-blue-950 text-white border-gray-700 flex-1"
          />
          <Button className="bg-blue-700 hover:bg-blue-600">Search</Button>
        </div>

        {/* Fraud Detection Table */}
        
          <table className="w-full text-sm text-gray-300 border-collapse">
        <thead>
          <tr className="bg-blue-900 text-white">
            <th className="px-4 py-2 text-left">DocumentID</th>
            <th className="px-4 py-2 text-left">DocumentType</th>
            <th className="px-4 py-2 text-left">TotalFailedAttempt</th>
            <th className="px-4 py-2 text-left">LastAttemptTimestamp</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-left">IPAddress</th>
            <th className="px-4 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {suspiciousLogs.map((log, index) => (
            <tr
              key={index}
              className="border-b border-gray-700 hover:bg-blue-900/30"
            >
              <td className="px-4 py-2">{log.documentId}</td>
              <td className="px-4 py-2">{log.documentType}</td>
              <td className="px-4 py-2">{log.totalFailedAttempt}</td>
              <td className="px-4 py-2">{log.lastAttemptTimestamp}</td>
              <td className="px-4 py-2">{log.status}</td>
              <td className="px-4 py-2">{log.ipAddress}</td>
              <td className="px-4 py-2">
                <Button className="bg-blue-700 hover:bg-blue-600">
                  Investigate
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </Layout>
  );
}