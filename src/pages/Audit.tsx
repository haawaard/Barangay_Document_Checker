
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "./Layout";

export default function AuditLogs() {
const logs = [
    {
        logId: 1,
        timestamp: "2025-08-17 08:02:22 AM",
        actionType: "Document Issued",
        documentId: "1001",
        documentHash: "1a2b3c4d5e6f...",
        documentType: "Barangay Clearance",
        checkerMethod: "N/A",
        userId: "101",
        userName: "Jersey Marisga",
        userRole: "Barangay abcsdef",
        ipAddress: "203.0.113.5",
        status: "Success",
        failureReason: "N/A",
    },
    {
        logId: 2,
        timestamp: "2025-08-17 08:02:15 AM",
        actionType: "Verification",
        documentId: "1001",
        documentHash: "1a2b3c4d5e6f...",
        documentType: "Barangay Clearance",
        checkerMethod: "QR Scan",
        userId: "312",
        userName: "Sarah Lagmay",
        userRole: "Website User",
        ipAddress: "198.51.100.1",
        status: "Success",
        failureReason: "N/A",
    },
    {
        logId: 3,
        timestamp: "2025-08-17 08:06:15 AM",
        actionType: "Login",
        documentId: "N/A",
        documentHash: "N/A",
        documentType: "N/A",
        checkerMethod: "N/A",
        userId: "102",
        userName: "Howard Ocampo",
        userRole: "Barangay Secretary",
        ipAddress: "203.0.113.6",
        status: "Failed",
        failureReason: "Credentials Mismatch",
    },
];

return (
    <Layout>
      {/* Header */}
        <header className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
        <nav className="flex gap-6 text-gray-300">
            <a href="#" className="hover:text-white">About</a>
            <a href="#" className="text-blue-400">Home</a>
            <a href="#" className="hover:text-white">Contact</a>
        </nav>
        <span className="text-sm">August 10, 2025</span>
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

        {/* Audit Logs Table */}
        
            <table className="w-full text-sm text-gray-300 border-collapse">
            <thead>
                <tr className="bg-blue-900 text-white">
                <th className="px-4 py-2 text-left" colSpan={3}>Log Entry</th>
                <th className="px-4 py-2 text-left" colSpan={4}>Document Actions</th>
                <th className="px-4 py-2 text-left" colSpan={3}>User and Staff</th>
                <th className="px-4 py-2 text-left" colSpan={3}>Security & Fraud</th>
                </tr>
                <tr className="bg-blue-950 text-white">
                <th className="px-4 py-2">LogID</th>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">ActionType</th>
                <th className="px-4 py-2">DocumentID</th>
                <th className="px-4 py-2">DocumentHash</th>
                <th className="px-4 py-2">DocumentType</th>
                <th className="px-4 py-2">CheckerMethod</th>
                <th className="px-4 py-2">UserID</th>
                <th className="px-4 py-2">UserName</th>
                <th className="px-4 py-2">UserRole</th>
                <th className="px-4 py-2">IPAddress</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">FailureReason</th>
                </tr>
            </thead>
            <tbody>
                {logs.map((log) => (
                <tr key={log.logId} className="border-b border-gray-700 hover:bg-blue-900/30">
                    <td className="px-4 py-2">{log.logId}</td>
                    <td className="px-4 py-2">{log.timestamp}</td>
                    <td className="px-4 py-2">{log.actionType}</td>
                    <td className="px-4 py-2">{log.documentId}</td>
                    <td className="px-4 py-2">{log.documentHash}</td>
                    <td className="px-4 py-2">{log.documentType}</td>
                    <td className="px-4 py-2">{log.checkerMethod}</td>
                    <td className="px-4 py-2">{log.userId}</td>
                    <td className="px-4 py-2">{log.userName}</td>
                    <td className="px-4 py-2">{log.userRole}</td>
                    <td className="px-4 py-2">{log.ipAddress}</td>
                    <td className="px-4 py-2">{log.status}</td>
                    <td className="px-4 py-2">{log.failureReason}</td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </Layout>
    );
}