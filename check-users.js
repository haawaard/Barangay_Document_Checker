import mysql from 'mysql2';
const db = mysql.createConnection({host: 'localhost', user: 'root', password: 'password', database: 'barangay_db'});
db.connect();
db.query('SELECT id, name FROM users LIMIT 5', (err, results) => {
  if (err) console.error(err);
  else console.log('Users:', results);
  db.end();
});