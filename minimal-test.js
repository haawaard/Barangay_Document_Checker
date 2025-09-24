// minimal-test.js
import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost", user: "root", password: "password", database: "barangay_db"
});

function logAuditEntry(actionType, documentId, documentType, checkerMethod, userId, userName, userRole, status, failureReason = 'N/A') {
  console.log('🔧 DEBUG logAuditEntry called with:');
  console.log('  actionType:', actionType);
  console.log('  documentId:', documentId);
  console.log('  documentType:', documentType);
  console.log('  checkerMethod:', checkerMethod);
  console.log('  userId:', userId);
  console.log('  userName:', userName);
  console.log('  userRole:', userRole);
  console.log('  status:', status);
  console.log('  failureReason:', failureReason);
  
  const query = `
    INSERT INTO log_entries (
      Timestamp, ActionType, DocumentID, DocumentType, CheckerMethod, 
      UserID, UserName, UserRole, Status, FailureReason
    ) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    actionType, documentId, documentType, checkerMethod, 
    userId, userName, userRole, status, failureReason
  ];
  
  console.log('🔧 DEBUG SQL params:', params);
  console.log('🔧 DEBUG params length:', params.length);
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('❌ Failed to log audit entry:', err);
      console.error('❌ SQL was:', query);
      console.error('❌ Params were:', params);
    } else {
      console.log(`✅ Audit log created: ${actionType} by ${userName} (${userRole}) - Status: ${status}`);
    }
    db.end();
  });
}

db.connect();

// Test exactly like login call (works)
console.log('\n=== Testing Login-style call (8 params) ===');
logAuditEntry('Login', null, null, null, 1, 'Test User', 'Barangay Official', 'Success');