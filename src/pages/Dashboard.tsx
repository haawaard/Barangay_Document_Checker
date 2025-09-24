import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import Layout from "./Layout";

const Dashboard: React.FC = () => {

    const [now, setNow] = useState(new Date());
  
    useEffect(() => {
      const id = setInterval(() => setNow(new Date()), 1000);
      return () => clearInterval(id);
    }, []);
  
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

      {/* HOLDER DIGITS */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400">Total Documents Issued</p>
            <p className="text-2xl font-bold">34</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400">Valid Documents</p>
            <p className="text-2xl font-bold">30</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4 text-center">
            <p className="text-gray-400">Invalid Documents</p>
            <p className="text-2xl font-bold">4</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="mb-6">
        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4 text-red-400 font-semibold">
            System Status: System detects suspicious patterns.
          </CardContent>
        </Card>
      </div>

      {/* Recent Issuance + Fraud Monitor */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4">
            <h2 className="font-bold mb-4">Recent Issuance</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left">
                  <th className="pb-2">Document Type</th>
                  <th className="pb-2">Date Issued</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Business Permit</td>
                  <td>2025-08-09</td>
                </tr>
                <tr>
                  <td>Certificate of Indigency</td>
                  <td>2025-08-07</td>
                </tr>
                <tr>
                  <td>Certificate of Residency</td>
                  <td>2025-08-08</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-white border-none">
          <CardContent className="p-4">
            <h2 className="font-bold mb-4">Fraud Monitor</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-left">
                  <th className="pb-2">Document Type</th>
                  <th className="pb-2">Checker Type</th>
                  <th className="pb-2">Date Issued</th>
                  <th className="pb-2">Time</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Barangay Clearance</td>
                  <td>Scanned QR</td>
                  <td>2025-08-10</td>
                  <td>12:05 PM</td>
                  <td className="text-red-400">Invalid QR</td>
                </tr>
                <tr>
                  <td>Barangay Clearance</td>
                  <td>Scanned QR</td>
                  <td>2025-08-10</td>
                  <td>12:06 PM</td>
                  <td className="text-red-400">Invalid QR</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;
