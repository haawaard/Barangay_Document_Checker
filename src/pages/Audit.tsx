import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "./Layout";

interface LogEntry {
  LogID: number;
  Timestamp: string;
  ActionType: string;
  DocumentID: number | null;
  DocumentType: string | null;
  CheckerMethod: string | null;
  UserID: number;
  UserName: string;
  UserRole: string;
  Status: string;
  FailureReason: string;
}

export default function AuditLogs() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch audit logs from database
  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("http://localhost:5000/api/audit-logs");
      const data = await response.json();
      
      if (response.ok) {
        setLogs(data.logs);
        console.log(`Loaded ${data.logs.length} audit log entries`);
      } else {
        setError(data.message || "Failed to fetch audit logs");
      }
    } catch (err) {
      console.error("Error fetching audit logs:", err);
      setError("Unable to connect to server. Please ensure the server is running on port 5000.");
    } finally {
      setLoading(false);
    }
  };

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

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch {
      return timestamp;
    }
  };

  // Filter logs based on search term
  const filteredLogs = logs.filter(log => 
    Object.values(log).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleSearch = () => {
    // Search is already handled by the filteredLogs computed value
    console.log(`Searching for: "${searchTerm}"`);
  };

return (
    <Layout>
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
            placeholder="Search audit logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-blue-950 text-white border-gray-700 flex-1"
          />
          <Button 
            onClick={handleSearch}
            className="bg-blue-700 hover:bg-blue-600"
          >
            Search
          </Button>
          <Button 
            onClick={fetchAuditLogs}
            className="bg-green-700 hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 text-gray-400">
            <p>Loading audit logs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-600 text-red-300 p-4 rounded-lg mb-6">
            <p><strong>Error:</strong> {error}</p>
          </div>
        )}

        {/* Audit Logs Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-300 border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="px-4 py-2 text-left" colSpan={3}>Log Entry</th>
                  <th className="px-4 py-2 text-left" colSpan={3}>Document Actions</th>
                  <th className="px-4 py-2 text-left" colSpan={3}>User and Staff</th>
                  <th className="px-4 py-2 text-left" colSpan={2}>Security & Status</th>
                </tr>
                <tr className="bg-blue-950 text-white">
                  <th className="px-4 py-2">LogID</th>
                  <th className="px-4 py-2">Timestamp</th>
                  <th className="px-4 py-2">ActionType</th>
                  <th className="px-4 py-2">DocumentID</th>
                  <th className="px-4 py-2">DocumentType</th>
                  <th className="px-4 py-2">CheckerMethod</th>
                  <th className="px-4 py-2">UserID</th>
                  <th className="px-4 py-2">UserName</th>
                  <th className="px-4 py-2">UserRole</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">FailureReason</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? "No audit logs found matching your search." : "No audit logs available."}
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.LogID} className="border-b border-gray-700 hover:bg-blue-900/30">
                      <td className="px-4 py-2">{log.LogID}</td>
                      <td className="px-4 py-2">{formatTimestamp(log.Timestamp)}</td>
                      <td className="px-4 py-2">{log.ActionType}</td>
                      <td className="px-4 py-2">{log.DocumentID || 'N/A'}</td>
                      <td className="px-4 py-2">{log.DocumentType || 'N/A'}</td>
                      <td className="px-4 py-2">{log.CheckerMethod || 'N/A'}</td>
                      <td className="px-4 py-2">{log.UserID}</td>
                      <td className="px-4 py-2">{log.UserName}</td>
                      <td className="px-4 py-2">{log.UserRole}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          log.Status === 'Success' 
                            ? 'bg-green-900/30 text-green-300' 
                            : 'bg-red-900/30 text-red-300'
                        }`}>
                          {log.Status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{log.FailureReason}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}