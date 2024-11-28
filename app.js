//app.js

const express = require('express');
const path = require('path');
const userRoutes = require('./routes/route'); // route.js 파일 사용

const app = express();
const PORT = 8080;
const mime = require('mime');

// 정적 파일 제공 설정

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
