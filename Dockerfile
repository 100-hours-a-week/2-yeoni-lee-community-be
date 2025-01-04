# Base 이미지 설정 (Node.js 21)
FROM node:21-alpine

# 작업 디렉토리 설정
WORKDIR /usr/src/app

# 종속성 설치 (단계적 빌드)
COPY package*.json ./
RUN npm install --only=production

# 애플리케이션 소스 복사
COPY . .

# 앱 실행 포트
EXPOSE 8080

# 기본 명령 실행
CMD ["node", "app.js"]
 