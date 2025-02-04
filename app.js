import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session'; // 세션
import cookieParser from 'cookie-parser'; // 쿠키
//import sequelize from './db.js'; // DB 설정 파일 import
import pool from './db.js';
import userRoutes from './routes/route.js'; // 메인 라우터
import sessionRouter from './routes/session.js'; // 세션 확인 라우터
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// 📌1.  CORS 설정
app.use(cors({
  origin: 'http://3.34.144.209:3000', 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'PATCH' , 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
/*
app.options('*', cors({
  origin: 'http://3.34.144.209:3000', // 허용할 Origin
  credentials: true, // 쿠키 포함
}));
app.use(cors({
  origin: 'http://3.34.144.209:3000', // 허용할 Origin
  credentials: true, // 쿠키를 포함한 요청 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://3.34.144.209:3000');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
*/


// __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📌 2. JSON 파싱 및 세션 설정
app.use(cookieParser());
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱

app.use(
  session({
    secret: 'your_secret_key', // 세션 암호화 키
    resave: false, // 세션이 변경되지 않아도 저장 여부
    saveUninitialized: false, // 초기화되지 않은 세션 저장 여부
    cookie: {
      httpOnly: true, // JavaScript로 쿠키 접근 불가
      secure: false, // HTTPS에서만 사용 (개발 단계에서 false)
      maxAge: 1000 * 60 * 30, // 세션 유지 시간: 30분
      sameSite: 'lax', // CORS 요청에서도 허용
    },
  })
);


// 📌 3. 정적 파일을 API보다 먼저 제공해야 함
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/profile', express.static(path.join(__dirname, 'profile')));
app.use(express.static(path.join(__dirname, '../2-yeoni-lee-community-fe/m_html')));
//app.use(express.static(path.join(process.cwd(), '../2-yeoni-lee-community-fe/m_html')));
// 4. 라우터 설정
app.use('/', sessionRouter); // 세션 확인 라우터
app.use('/api', userRoutes);


// 📌 5. API가 정의되지 않은 경우 404 처리 (JSON 응답)
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});


// ✅ 6. 프론트 라우팅 (새로고침해도 정상 작동하게)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../2-yeoni-lee-community-fe/m_html', '2_login.html'));
});

//7. 서버 실행
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://3.34.144.209:${PORT}`);
});

  // MariaDB 연결 테스트 API
app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS now'); // 현재 시간 가져오기
    res.json({ success: true, serverTime: rows[0].now });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ success: false, message: 'DB 연결 실패' });
  }
});

(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Connected to MariaDB');
    conn.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
})();
  export const API_BASE_URL = 'http://3.34.144.209:3000';