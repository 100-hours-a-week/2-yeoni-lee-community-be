# Node.js 환경 설정
FROM node:18

# 작업 디렉토리 설정
WORKDIR /app

# 코드 복사 및 패키지 설치
COPY package*.json ./
RUN npm install
COPY . .

# 서버 실행 (환경 변수 적용)
CMD ["node", "app.js"]