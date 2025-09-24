// check-columns.js
import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost", user: "root", password: "password", database: "barangay_db"
});

db.connect();
db.query('SELECT * FROM log_entries WHERE 1=0', (err, results, fields) => {
  console.log('Column count:', fields.length);
  fields.forEach((field, i) => console.log(`${i+1}. ${field.name} (${field.type})`));
  db.end();
});