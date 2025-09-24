// server.js
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";

const app = express();
const PORT = 5000;

// middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",       // change if not localhost
  user: "root",            // your MySQL username
  password: "password",            // your MySQL password
  database: "barangay_db", // your database name
});

db.connect((err) => {
if (err) {
    console.error("MySQL connection error:", err);
    process.exit(1);
}
console.log(" Connected to MySQL Database");
});

// Helper function to format dates
function formatDate(dateInput) {
  if (!dateInput) return null;
  
  const date = new Date(dateInput);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', options);
}

// Helper function to log audit entries
function logAuditEntry(actionType, documentId, documentType, checkerMethod, userId, userName, userRole, status, failureReason = 'N/A') {
  const query = `
    INSERT INTO log_entries (
      Timestamp, ActionType, DocumentID, DocumentType, CheckerMethod, 
      UserID, UserName, UserRole, Status, FailureReason
    ) VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [
    actionType, documentId, documentType, checkerMethod, 
    userId, userName, userRole, status, failureReason
  ], (err, result) => {
    if (err) {
      console.error('Failed to log audit entry:', err);
    } else {
      console.log(`Audit log created: ${actionType} by ${userName} (${userRole}) - Status: ${status}`);
    }
  });
}

// API endpoint for recent issuances (top-level)
app.get("/api/recent-issuance", (req, res) => {
  const queries = [
    "SELECT 'indigency' AS type, LastName, FirstName, MiddleName, Address, Purpose, IssuedOn FROM certificate_of_indigency ORDER BY IssuedOn DESC LIMIT 10",
    "SELECT 'clearance' AS type, LastName, FirstName, MiddleName, Address, Purpose, IssuedOn FROM barangay_clearance ORDER BY IssuedOn DESC LIMIT 10",
    "SELECT 'businesspermit' AS type, last_name AS LastName, first_name AS FirstName, middle_name AS MiddleName, address AS Address, business_nature AS Purpose, issued_on AS IssuedOn FROM business_permit ORDER BY issued_on DESC LIMIT 10",
  ];
  Promise.all(
    queries.map(
      (q) =>
        new Promise((resolve, reject) => {
          db.query(q, (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        })
    )
  )
    .then(([indigency, clearance, businesspermit]) => {
      const all = [...indigency, ...clearance, ...businesspermit].sort(
        (a, b) => new Date(b.IssuedOn) - new Date(a.IssuedOn)
      );
      res.json({ recent: all.slice(0, 10) });
    })
    .catch((err) => {
      console.error("Recent issuance error:", err);
      res.status(500).json({ message: "Database error" });
    });
});

// API endpoint for login
app.post("/api/login", (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(400).json({ message: "Name and password are required" });
  }
  const query = "SELECT * FROM users WHERE name = ? AND password = ?";
  db.query(query, [name, password], (err, results) => {
    if (err) {
      console.error("Query error:", err);
      
      // Log failed login attempt due to database error
      logAuditEntry(
        'Login', 
        null, 
        null, 
        null, 
        0, 
        name, 
        'Unknown', 
        'Failed', 
        'Database Error'
      );
      
      return res.status(500).json({ message: "Database error" });
    }
    
    if (results.length > 0) {
      const user = results[0];
      
      // Log successful login
      logAuditEntry(
        'Login', 
        null, 
        null, 
        null, 
        user.id, 
        user.name, 
        'Barangay Official', 
        'Success'
      );
      
      return res.json({
        message: "Login successful",
        user: results[0],
      });
    } else {
      // Log failed login attempt due to invalid credentials
      logAuditEntry(
        'Login', 
        null, 
        null, 
        null, 
        0, 
        name, 
        'Unknown', 
        'Failed', 
        'Invalid Credentials'
      );
      
      return res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// API endpoint to save certificate of indigency form
app.post("/api/indigency", (req, res) => {
  console.log("Received POST request to /api/indigency");
  console.log("Request body:", req.body);
  
  const {
    LastName,
    FirstName,
    MiddleName,
    Address,
    Age,
    Birthdate,
    ContactNumber,
    Gender,
    Purpose,
    issuedOn,
    userId,
    userName
  } = req.body;

  if (!LastName || !FirstName || !Address || !Age || !Birthdate || !Gender || !Purpose || !issuedOn) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  // Generate hash_code before insert since it's required by schema
  const hashcode = crypto
    .createHash("sha256")
    .update(JSON.stringify(req.body) + Date.now().toString())
    .digest("hex")
    .slice(0, 32); // Match CHAR(32) in schema

  const query = `INSERT INTO certificate_of_indigency (LastName, FirstName, MiddleName, Address, Age, Birthdate, ContactNumber, Gender, Purpose, IssuedOn, hash_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    query,
    [LastName, FirstName, MiddleName, Address, Age, Birthdate, ContactNumber, Gender, Purpose, issuedOn, hashcode],
    (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        
        // Log failed document issuance
        logAuditEntry(
          'Document Issuance', 
          null, 
          'Certificate of Indigency', 
          'System', 
          userId || 1, 
          userName || 'System User', 
          'Barangay Official', 
          'Failed', 
          'Database Error'
        );
        
        return res.status(500).json({ message: "Database error" });
      }
      
      console.log("Insert successful, record ID:", result.insertId);
      
      // Log successful document issuance
      logAuditEntry(
        'Document Issuance', 
        result.insertId, 
        'Certificate of Indigency', 
        'System', 
        userId || 1, 
        userName || 'System User', 
        'Barangay Official', 
        'Success'
      );
      
      // Retrieve the actual hash_code from the database to ensure accuracy
      db.query(
        "SELECT hash_code FROM certificate_of_indigency WHERE clearance_id = ?",
        [result.insertId],
        (selectErr, rows) => {
          if (selectErr) {
            console.error("Error retrieving hash code:", selectErr);
            // Fallback to generated hash if database retrieval fails
            return res.json({ 
              message: "Certificate of Indigency form submitted successfully", 
              id: result.insertId, 
              hashcode 
            });
          }
          
          const actualHashCode = rows && rows[0] ? rows[0].hash_code : hashcode;
          console.log("Actual hash code from database:", actualHashCode);
          
          return res.json({ 
            message: "Certificate of Indigency form submitted successfully", 
            id: result.insertId, 
            hashcode: actualHashCode
          });
        }
      );
    }
  );
});
app.post("/api/clearance", (req, res) => {
  const {
    LastName,
    FirstName,
    MiddleName,
    Address,
    Age,
    Birthdate,
    ContactNumber,
    Gender,
    Purpose,
    issuedOn,
    userId,
    userName
  } = req.body;

  // Use correct column name IssuedOn and table barangay_clearance
  if (!LastName || !FirstName || !Address || !Age || !Birthdate || !ContactNumber || !Gender || !Purpose || !issuedOn) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query = `INSERT INTO barangay_clearance (LastName, FirstName, MiddleName, Address, Age, Birthdate, ContactNumber, Gender, Purpose, IssuedOn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    query,
    [LastName, FirstName, MiddleName, Address, Age, Birthdate, ContactNumber, Gender, Purpose, issuedOn],
    (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        
        // Log failed document issuance
        logAuditEntry(
          'Document Issuance', 
          null, 
          'Barangay Clearance', 
          'System', 
          userId || 1, 
          userName || 'System User', 
          'Barangay Official', 
          'Failed', 
          'Database Error'
        );
        
        return res.status(500).json({ message: "Database error" });
      }
      
      // Log successful document issuance
      logAuditEntry(
        'Document Issuance', 
        result.insertId, 
        'Barangay Clearance', 
        'System', 
        userId || 1, 
        userName || 'System User', 
        'Barangay Official', 
        'Success'
      );
      
      db.query(
        "SELECT hash_code FROM barangay_clearance ORDER BY created_at DESC LIMIT 1",
        (e2, rows) => {
          let hashcode;
          if (!e2 && rows && rows[0] && rows[0].hash_code) {
            hashcode = rows[0].hash_code;
          } else {
            hashcode = crypto
              .createHash("sha256")
              .update(String(result.insertId) + JSON.stringify(req.body))
              .digest("hex")
              .slice(0, 10);
          }
          return res.json({ message: "Form submitted successfully", id: result.insertId, hashcode });
        }
      );
    }
  );
});

// API endpoint to save business permit form
app.post("/api/businesspermit", (req, res) => {
  const {
    LastName,
    FirstName,
    MiddleName,
    Address,
    Age,
    Birthdate,
    ContactNumber,
    Gender,
    BusinessName,
    BusinessAddress,
    Owner,
    BusinessNature,
    Classification,
    issuedOn,
    userId,
    userName
  } = req.body;

  // Validate required fields
  if (!LastName || !FirstName || !Address || !Age || !Birthdate || !Gender || !BusinessName || !BusinessAddress || !Owner || !BusinessNature || !Classification || !issuedOn) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  const query = `INSERT INTO business_permit (last_name, first_name, middle_name, address, age, birthdate, contact_number, gender, business_name, business_address, owner, business_nature, classification, issued_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    query,
    [LastName, FirstName, MiddleName, Address, Age, Birthdate, ContactNumber, Gender, BusinessName, BusinessAddress, Owner, BusinessNature, Classification, issuedOn],
    (err, result) => {
      if (err) {
        console.error("Insert error:", err.sqlMessage || err);
        
        // Log failed document issuance
        logAuditEntry(
          'Document Issuance', 
          null, 
          'Business Permit', 
          'System', 
          userId || 1, 
          userName || 'System User', 
          'Barangay Official', 
          'Failed', 
          'Database Error'
        );
        
        return res.status(500).json({ message: "Database error: " + (err.sqlMessage || err.message || err) });
      }
      
      // Log successful document issuance
      logAuditEntry(
        'Document Issuance', 
        result.insertId, 
        'Business Permit', 
        'System', 
        userId || 1, 
        userName || 'System User', 
        'Barangay Official', 
        'Success'
      );
      
      db.query(
        "SELECT hash_code FROM business_permit ORDER BY created_at DESC LIMIT 1",
        (e2, rows) => {
          let hashcode;
          if (!e2 && rows && rows[0] && rows[0].hash_code) {
            hashcode = rows[0].hash_code;
          } else {
            hashcode = crypto
              .createHash("sha256")
              .update(String(result.insertId) + JSON.stringify(req.body))
              .digest("hex")
              .slice(0, 10);
          }
          return res.json({ message: "Business Permit form submitted successfully", id: result.insertId, hashcode });
        }
      );
    }
  );
});

// API endpoint to validate QR code hash
app.post("/api/validate-qr", (req, res) => {
  console.log("Received QR validation request");
  const { hash } = req.body;
  
  if (!hash) {
    // Log failed validation attempt
    logAuditEntry(
      'QR Verification', 
      null, 
      null, 
      'QR Upload', 
      0, 
      'Web User', 
      'Public User', 
      'Failed', 
      'No hash provided'
    );
    
    return res.status(400).json({ 
      isValid: false, 
      message: "Hash code is required" 
    });
  }
  
  console.log("Validating hash:", hash);
  
  // Search across all three document tables
  const queries = [
    {
      table: "certificate_of_indigency",
      query: "SELECT *, 'Certificate of Indigency' as document_type FROM certificate_of_indigency WHERE hash_code = ?",
      type: "Certificate of Indigency"
    },
    {
      table: "barangay_clearance", 
      query: "SELECT *, 'Barangay Clearance' as document_type FROM barangay_clearance WHERE hash_code = ?",
      type: "Barangay Clearance"
    },
    {
      table: "business_permit",
      query: "SELECT *, 'Business Permit' as document_type FROM business_permit WHERE hash_code = ?", 
      type: "Business Permit"
    }
  ];
  
  // Execute all queries in parallel
  Promise.all(
    queries.map(({ query, type }) => 
      new Promise((resolve, reject) => {
        db.query(query, [hash], (err, results) => {
          if (err) {
            console.error(`Error querying ${type}:`, err);
            return reject(err);
          }
          resolve({ results, type });
        });
      })
    )
  )
  .then((allResults) => {
    // Find the first table that has a matching hash
    const foundResult = allResults.find(result => result.results.length > 0);
    
    if (foundResult) {
      const document = foundResult.results[0];
      console.log("Hash found in database:", document);
      
      // Log successful QR verification
      logAuditEntry(
        'QR Verification', 
        document.clearance_id || document.id, 
        foundResult.type, 
        'QR Upload', 
        0, 
        'Web User', 
        'Public User', 
        'Success'
      );
      
      // Format the response based on document type
      let documentInfo = {
        id: document.clearance_id || document.id,
        type: foundResult.type,
        hash: document.hash_code,
        issuedOn: formatDate(document.IssuedOn || document.issued_on),
        createdAt: document.created_at
      };
      
      // Add specific fields based on document type
      if (foundResult.type === "Certificate of Indigency") {
        documentInfo = {
          ...documentInfo,
          name: `${document.FirstName} ${document.MiddleName || ''} ${document.LastName}`.trim(),
          address: document.Address,
          age: document.Age,
          purpose: document.Purpose,
          gender: document.Gender
        };
      } else if (foundResult.type === "Barangay Clearance") {
        documentInfo = {
          ...documentInfo,
          name: `${document.FirstName} ${document.MiddleName || ''} ${document.LastName}`.trim(),
          address: document.Address,
          age: document.Age,
          purpose: document.Purpose
        };
      } else if (foundResult.type === "Business Permit") {
        documentInfo = {
          ...documentInfo,
          name: `${document.first_name} ${document.middle_name || ''} ${document.last_name}`.trim(),
          address: document.address,
          businessName: document.business_name,
          businessNature: document.business_nature,
          businessAddress: document.business_address
        };
      }
      
      res.json({
        isValid: true,
        message: "Document verified successfully",
        documentType: foundResult.type,
        document: documentInfo
      });
    } else {
      console.log("Hash not found in any table");
      
      // Log failed QR verification
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
      
      res.json({
        isValid: false,
        message: "Hash code not found in database"
      });
    }
  })
  .catch((error) => {
    console.error("Database validation error:", error);
    
    // Log failed QR verification due to error
    logAuditEntry(
      'QR Verification', 
      null, 
      null, 
      'QR Upload', 
      0, 
      'Web User', 
      'Public User', 
      'Failed', 
      'Database error during validation'
    );
    
    res.status(500).json({
      isValid: false,
      message: "Database error occurred during validation"
    });
  });
});

// API endpoint to fetch audit log entries
app.get("/api/audit-logs", (req, res) => {
  console.log("Fetching audit log entries");
  
  const query = `
    SELECT 
      LogID,
      Timestamp,
      ActionType,
      DocumentID,
      DocumentType,
      CheckerMethod,
      UserID,
      UserName,
      UserRole,
      Status,
      FailureReason
    FROM log_entries 
    ORDER BY Timestamp DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching audit logs:", err);
      return res.status(500).json({ message: "Database error", error: err.message });
    }
    
    console.log(`Found ${results.length} log entries`);
    res.json({ logs: results });
  });
});

// Test endpoint to verify QR validation logging is working
app.post("/api/test-qr-logging", (req, res) => {
  const { scenario } = req.body;
  
  switch (scenario) {
    case 'missing_hash':
      logAuditEntry(
        'QR Verification', 
        null, 
        null, 
        'QR Upload', 
        0, 
        'Web User', 
        'Public User', 
        'Failed', 
        'No hash provided'
      );
      res.json({ message: 'Logged: Missing hash scenario' });
      break;
      
    case 'invalid_hash':
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
      res.json({ message: 'Logged: Invalid hash scenario' });
      break;
      
    case 'valid_clearance':
      logAuditEntry(
        'QR Verification', 
        12345, 
        'Barangay Clearance', 
        'QR Upload', 
        0, 
        'Web User', 
        'Public User', 
        'Success'
      );
      res.json({ message: 'Logged: Valid clearance verification' });
      break;
      
    case 'database_error':
      logAuditEntry(
        'QR Verification', 
        null, 
        null, 
        'QR Upload', 
        0, 
        'Web User', 
        'Public User', 
        'Failed', 
        'Database connection error'
      );
      res.json({ message: 'Logged: Database error scenario' });
      break;
      
    default:
      res.status(400).json({ message: 'Invalid scenario' });
  }
});

// API endpoint to create sample audit log entries (for testing)
app.post("/api/create-sample-logs", (req, res) => {
  const sampleLogs = [
    {
      actionType: 'Login',
      documentId: null,
      documentType: null,
      checkerMethod: null,
      userId: 1,
      userName: 'Admin User',
      userRole: 'Barangay Official',
      status: 'Success',
      failureReason: 'N/A'
    },
    {
      actionType: 'Document Issuance',
      documentId: 1001,
      documentType: 'Barangay Clearance',
      checkerMethod: 'System',
      userId: 1,
      userName: 'Admin User',
      userRole: 'Barangay Official',
      status: 'Success',
      failureReason: 'N/A'
    },
    {
      actionType: 'QR Verification',
      documentId: 1001,
      documentType: 'Barangay Clearance',
      checkerMethod: 'QR Upload',
      userId: 0,
      userName: 'Web User',
      userRole: 'Public User',
      status: 'Success',
      failureReason: 'N/A'
    },
    {
      actionType: 'Login',
      documentId: null,
      documentType: null,
      checkerMethod: null,
      userId: 0,
      userName: 'Invalid User',
      userRole: 'Unknown',
      status: 'Failed',
      failureReason: 'Invalid Credentials'
    }
  ];

  let completedLogs = 0;
  const totalLogs = sampleLogs.length;

  sampleLogs.forEach(log => {
    logAuditEntry(
      log.actionType,
      log.documentId,
      log.documentType,
      log.checkerMethod,
      log.userId,
      log.userName,
      log.userRole,
      log.status,
      log.failureReason
    );
    
    completedLogs++;
    if (completedLogs === totalLogs) {
      res.json({ 
        message: `Created ${totalLogs} sample audit log entries successfully`,
        logs: sampleLogs 
      });
    }
  });
});

// Audit summary endpoint to show logging statistics
app.get("/api/audit-summary", (req, res) => {
  const query = `
    SELECT 
      action_type,
      status,
      COUNT(*) as count
    FROM log_entries 
    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOURS)
    GROUP BY action_type, status
    ORDER BY action_type, status
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching audit summary:", err);
      return res.status(500).json({ 
        message: "Database error",
        summary: [
          { action_type: "Login", status: "Success", count: 5 },
          { action_type: "Login", status: "Failed", count: 2 },
          { action_type: "Document Issuance", status: "Success", count: 12 },
          { action_type: "QR Verification", status: "Success", count: 8 },
          { action_type: "QR Verification", status: "Failed", count: 3 }
        ]
      });
    }
    
    res.json({
      message: "Audit summary for last 24 hours",
      summary: results
    });
  });
});

// start server
app.listen(PORT, () => {
console.log(` Server running on http://localhost:${PORT}`);
});
