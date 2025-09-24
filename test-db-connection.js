// test-db-connection.js
// Simple script to test MySQL database connection

import mysql from "mysql2";

console.log("Testing MySQL database connection...");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password", // Update this to your actual MySQL password
  database: "barangay_db",
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection FAILED:");
    console.error("Error code:", err.code);
    console.error("Error message:", err.message);
    
    if (err.code === 'ECONNREFUSED') {
      console.log("\n🔧 Solution: MySQL server is not running");
      console.log("   - Start MySQL service: net start mysql");
      console.log("   - Or check if MySQL is installed");
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log("\n🔧 Solution: Wrong username/password");
      console.log("   - Update password in server.js");
      console.log("   - Default MySQL root password varies by installation");
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.log("\n🔧 Solution: Database 'barangay_db' doesn't exist");
      console.log("   - Create database using MySQL Workbench or command line");
      console.log("   - Run: CREATE DATABASE barangay_db;");
    }
    
    process.exit(1);
  }
  
  console.log("✅ Connected to MySQL Database successfully!");
  
  // Test if tables exist
  db.query("SHOW TABLES", (err, results) => {
    if (err) {
      console.error("❌ Error checking tables:", err.message);
    } else {
      console.log("📋 Tables found:", results.length);
      results.forEach(table => {
        console.log("   -", Object.values(table)[0]);
      });
      
      if (results.length === 0) {
        console.log("\n⚠️  No tables found. You may need to create the database schema.");
        console.log("   See DATABASE_SETUP.md for SQL commands.");
      }
    }
    
    // Test validation query
    console.log("\n🧪 Testing hash validation...");
    db.query(
      "SELECT hash_code FROM barangay_clearance WHERE hash_code = ?", 
      ["db8237d31e7ce91969940bd1e3967001"], 
      (err, results) => {
        if (err) {
          console.error("❌ Validation query failed:", err.message);
        } else if (results.length > 0) {
          console.log("✅ Found hash in database:", results[0].hash_code);
        } else {
          console.log("⚠️  Hash not found in database");
          console.log("   You may need to insert test data");
        }
        
        db.end();
      }
    );
  });
});