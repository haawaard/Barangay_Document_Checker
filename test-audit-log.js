// test-audit-log.js
// Direct test of the logAuditEntry function

import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root", 
  password: "password",
  database: "barangay_db",
});

// Copy the logAuditEntry function exactly as it is in server.js
function logAuditEntry(actionType, documentId, documentType, checkerMethod, userId, userName, userRole, status, failureReason = 'N/A') {
  console.log("🔧 Testing logAuditEntry with parameters:");
  console.log("- actionType:", actionType);
  console.log("- documentId:", documentId);
  console.log("- documentType:", documentType);
  console.log("- checkerMethod:", checkerMethod);
  console.log("- userId:", userId);
  console.log("- userName:", userName);
  console.log("- userRole:", userRole);
  console.log("- status:", status);
  console.log("- failureReason:", failureReason);
  
  const query = `
    INSERT INTO log_entries (
      Timestamp, ActionType, DocumentID, DocumentType, CheckerMethod, 
      UserID, UserName, UserRole, Status, FailureReason
    ) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  console.log("📝 SQL Query:", query);
  console.log("📝 Parameters:", [actionType, documentId, documentType, checkerMethod, userId, userName, userRole, status, failureReason]);
  
  db.query(query, [
    actionType, documentId, documentType, checkerMethod, 
    userId, userName, userRole, status, failureReason
  ], (err, result) => {
    if (err) {
      console.error('❌ Failed to log audit entry:', err);
    } else {
      console.log(`✅ Audit log created successfully! Insert ID: ${result.insertId}`);
      console.log(`📊 ${actionType} by ${userName} (${userRole}) - Status: ${status}`);
    }
    db.end();
  });
}

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
  
  console.log("✅ Connected to database");
  
  // Test with the exact same parameters used in QR validation
  logAuditEntry(
    'QR Verification', 
    null, 
    null, 
    'QR Upload', 
    0, 
    'Web User', 
    'Public User', 
    'Failed', 
    'Hash not found in database'
  );
});