//db.js

import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'database-1.cvy64gkcwjwg.ap-northeast-2.rds.amazonaws.com', // MariaDB 서버 (로컬)
  user: 'admin', // 사용자명
  password: 'duswndl2871', // 비밀번호
  database: 'database-1', // 데이터베이스명
  port: 13306, // 기본 MariaDB 포트
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;
