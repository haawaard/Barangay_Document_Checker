// test-fixed.js
import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost", user: "root", password: "password", database: "barangay_db"
});

function logAuditEntry(actionType, documentId, documentType, checkerMethod, userId, userName, userRole, status, failureReason = 'N/A') {
  const query = `
    INSERT INTO log_entries (
      Timestamp, ActionType, DocumentID, DocumentType, CheckerMethod, 
      UserID, UserName, UserRole, Status, FailureReason
    ) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    actionType, documentId, documentType, checkerMethod, 
    userId, userName, userRole, status, failureReason
  ];
  
  console.log('Placeholders count:', (query.match(/\?/g) || []).length);
  console.log('Params count:', params.length);
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('❌ Failed to log audit entry:', err);
    } else {
      console.log(`✅ Audit log created: ${actionType} - Status: ${status}`);
    }
    db.end();
  });
}

db.connect();

// Test QR validation logging
logAuditEntry('QR Verification', null, null, 'QR Upload', 0, 'Web User', 'Public User', 'Failed', 'Test failure');