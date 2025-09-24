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
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [sortField, setSortField] = useState<keyof LogEntry | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
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

  // Filter logs based on search term
  const filteredLogs = logs.filter(log => 
    Object.values(log).some(value => 
      value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort logs based on current sort field and direction
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    // Handle null/undefined values
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    // Sort based on data type
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    const aStr = aValue.toString().toLowerCase();
    const bStr = bValue.toString().toLowerCase();
    
    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  const handleSort = (field: keyof LogEntry) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = () => {
    // Search is already handled by the filteredLogs computed value
    console.log(`Searching for: "${searchTerm}"`);
  };

return (
    <Layout>
      {/* Header with Date/Time Only */}
      <header className="flex justify-end items-center border-b border-gray-700 pb-4 mb-6">
        <span className="text-sm">{dateStr} // {timeStr}</span>
      </header>

      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>
      
      {/* Search Bar - Forced Visibility */}
      <div className="flex items-center gap-2 mb-6 w-full max-w-3xl" style={{backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '4px'}}>
          <Input
            type="text"
            placeholder="Search audit logs..."
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
                  <th className="px-4 py-2 cursor-pointer hover:bg-blue-800" onClick={() => handleSort('LogID')}>
                    LogID
                  </th>
                  <th className="px-4 py-2 cursor-pointer hover:bg-blue-800" onClick={() => handleSort('Timestamp')}>
                    Timestamp
                  </th>
                  <th className="px-4 py-2 cursor-pointer hover:bg-blue-800" onClick={() => handleSort('ActionType')}>
                    ActionType
                  </th>
                  <th className="px-4 py-2 cursor-pointer hover:bg-blue-800" onClick={() => handleSort('DocumentID')}>
                    DocumentID
                  </th>
                  <th className="px-4 py-2 cursor-pointer hover:bg-blue-800" onClick={() => handleSort('DocumentType')}>
                    DocumentType
                  </th>
                  <th className="px-4 py-2 cursor-pointer hover:bg-blue-800" onClick={() => handleSort('CheckerMethod')}>
                    CheckerMethod
                  </th>
                  <th className="px-4 py-2 cursor-pointer hover:bg-blue-800" onClick={() => handleSort('UserID')}>
                    UserID
                  </th>
                  <th className="px-4 py-2 cursor-pointer hover:bg-blue-800" onClick={() => handleSort('UserName')}>
                    UserName
                  </th>
                  <th className="px-4 py-2 cursor-pointer hover:bg-blue-800" onClick={() => handleSort('UserRole')}>
                    UserRole
                  </th>
                  <th className="px-4 py-2 cursor-pointer hover:bg-blue-800" onClick={() => handleSort('Status')}>
                    Status
                  </th>
                  <th className="px-4 py-2 cursor-pointer hover:bg-blue-800" onClick={() => handleSort('FailureReason')}>
                    FailureReason
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? "No audit logs found matching your search." : "No audit logs available."}
                    </td>
                  </tr>
                ) : (
                  sortedLogs.map((log) => (
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
    </Layout>
  );
}