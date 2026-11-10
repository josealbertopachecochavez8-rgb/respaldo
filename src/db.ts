import mysql from 'mysql2/promise';

export const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '', // Vacío por defecto en XAMPP
  database: 'sistema_incidencias',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});