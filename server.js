// server.js
import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";

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
      return res.status(500).json({ message: "Database error" });
    }
    if (results.length > 0) {
      return res.json({
        message: "Login successful",
        user: results[0],
      });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

// API endpoint to save barangay clearance form
// API endpoint to save certificate of indigency form
app.post("/api/indigency", (req, res) => {
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
  } = req.body;

  // Validate required fields
  if (!LastName || !FirstName || !Address || !Age || !Birthdate || !Gender || !Purpose || !issuedOn) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  const query = `INSERT INTO certificate_of_indigency (LastName, FirstName, MiddleName, Address, Age, Birthdate, ContactNumber, Gender, Purpose, IssuedOn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    query,
    [LastName, FirstName, MiddleName, Address, Age, Birthdate, ContactNumber, Gender, Purpose, issuedOn],
    (err, result) => {
      if (err) {
    app.get("/api/recent-issuance", (req, res) => {
      // Example: get the 10 most recent issuances from all tables
      const queries = [
        "SELECT 'indigency' AS type, LastName, FirstName, MiddleName, Address, Purpose, IssuedOn FROM certificate_of_indigency ORDER BY IssuedOn DESC LIMIT 10",
        "SELECT 'clearance' AS type, LastName, FirstName, MiddleName, Address, Purpose, IssuedOn FROM barangay_clearance ORDER BY IssuedOn DESC LIMIT 10",
        "SELECT 'businesspermit' AS type, last_name AS LastName, first_name AS FirstName, middle_name AS MiddleName, address AS Address, business_nature AS Purpose, issued_on AS IssuedOn FROM business_permit ORDER BY issued_on DESC LIMIT 10"
      ];
      Promise.all(queries.map(q => new Promise((resolve, reject) => {
        db.query(q, (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      }))).then(([indigency, clearance, businesspermit]) => {
        // Combine and sort by IssuedOn descending
        const all = [...indigency, ...clearance, ...businesspermit].sort((a, b) => new Date(b.IssuedOn) - new Date(a.IssuedOn));
        res.json({ recent: all.slice(0, 10) });
      }).catch(err => {
        console.error("Recent issuance error:", err);
        res.status(500).json({ message: "Database error" });
      });
    });
        console.error("Insert error:", err);
        return res.status(500).json({ message: "Database error" });
      }
      return res.json({ message: "Certificate of Indigency form submitted successfully" });
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
        return res.status(500).json({ message: "Database error" });
      }
      return res.json({ message: "Form submitted successfully", id: result.insertId });
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
        return res.status(500).json({ message: "Database error: " + (err.sqlMessage || err.message || err) });
      }
      return res.json({ message: "Business Permit form submitted successfully" });
    }
  );
});

// start server
app.listen(PORT, () => {
console.log(` Server running on http://localhost:${PORT}`);
});
