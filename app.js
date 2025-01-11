import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session'; // 세션
import cookieParser from 'cookie-parser'; // 쿠키
import sequelize from './models/db.js'; // DB 설정 파일 import
import userRoutes from './routes/route.js'; // 메인 라우터
import sessionRouter from './routes/session.js'; // 세션 확인 라우터
import cors from 'cors';


const app = express();
const PORT = 5000;

// __dirname 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(cors({
  origin: 'http://localhost:3000', // 허용할 Origin
  credentials: true, // 쿠키를 포함한 요청 허용
}));

app.options('*', cors({
  origin: 'http://localhost:3000', // 허용할 Origin
  credentials: true, // 쿠키 포함
}));

// 미들웨어 설정
app.use(cookieParser());
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
app.use(express.json()); // JSON 파싱
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱
app.use('/profile', express.static(path.join(__dirname, 'profile')));

// 정적 파일 경로 설정
app.use(express.static(path.join(__dirname, 'm_html')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우터 설정
app.use('/', sessionRouter); // 세션 확인 라우터
app.use('/', userRoutes); // 메인 라우터


// 데이터베이스 동기화 후 서버 시작
sequelize
  .sync({ force: false }) // 데이터베이스와 테이블 동기화 (force: false -> 기존 데이터 유지)
  .then(() => {
    console.log('Database synchronized!');
    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to synchronize database:', err);
  });

  export const API_BASE_URL = 'http://localhost:3000';