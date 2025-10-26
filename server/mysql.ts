import mysql from 'mysql2/promise';

const config = {
  host: process.env.MYSQL_HOST,
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
};

export const pool = mysql.createPool(config);

export async function getConnection() {
  return await pool.getConnection();
}
