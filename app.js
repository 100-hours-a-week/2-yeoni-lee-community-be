//app.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/route.js'; // route.js 파일 사용 (확장자 명시)
import session from 'express-session'; // 세션
import cookieParser from 'cookie-parser'; // 쿠키
const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 세션 및 쿠키 미들웨어 추가
app.use(cookieParser());
app.use(
  session({
    secret: 'your_secret_key', // 세션 암호화를 위한 키
    resave: false, // 세션이 변경되지 않아도 저장 여부
    saveUninitialized: true, // 초기화되지 않은 세션 저장 여부
    cookie: {
      httpOnly: true, // JavaScript로 쿠키 접근 불가
      secure: false, // HTTPS에서만 전송 (개발 단계에서는 false)
      maxAge: 1000 * 60 * 30, // 30분 유효
    },
  })
);
// JSON 데이터 파싱 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱
app.use(express.static(path.join(__dirname, 'm_html'))); // 정적 파일 서빙
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', userRoutes);

// 서버 실행
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
