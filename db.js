import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function checkDBConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MariaDB');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
}

// 실행
checkDBConnection();
export default pool; // ✅ export default 추가
