// debug-logs.js
// Script to check what's in the log_entries table

import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "barangay_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
  
  console.log("✅ Connected to database");
  
  // Check if log_entries table exists and its structure
  console.log("\n📋 Checking log_entries table structure...");
  db.query("DESCRIBE log_entries", (err, results) => {
    if (err) {
      console.error("❌ Error describing table:", err);
    } else {
      console.log("Table structure:", results);
    }
    
    // Check current contents
    console.log("\n📊 Current log_entries contents...");
    db.query("SELECT * FROM log_entries ORDER BY Timestamp DESC LIMIT 10", (err, results) => {
      if (err) {
        console.error("❌ Error querying logs:", err);
      } else {
        console.log(`Found ${results.length} log entries:`);
        results.forEach((row, index) => {
          console.log(`${index + 1}. ${row.ActionType} | ${row.Status} | ${row.Timestamp}`);
        });
      }
      
      // Test our specific queries
      console.log("\n🔍 Testing Valid Documents query...");
      db.query("SELECT COUNT(*) as count FROM log_entries WHERE Status = 'Success' AND ActionType = 'QR Verification'", (err, results) => {
        if (err) {
          console.error("❌ Valid query error:", err);
        } else {
          console.log("Valid documents count:", results[0].count);
        }
        
        console.log("\n🔍 Testing Invalid Documents query...");
        db.query("SELECT COUNT(*) as count FROM log_entries WHERE Status = 'Failed' AND ActionType = 'QR Verification'", (err, results) => {
          if (err) {
            console.error("❌ Invalid query error:", err);
          } else {
            console.log("Invalid documents count:", results[0].count);
          }
          
          db.end();
        });
      });
    });
  });
});