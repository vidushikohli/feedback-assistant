import mysql from 'mysql2/promise';

// Establish a connection pool to optimize performance
export const pool = mysql.createPool({
  host: process.env.localhost,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});