# Step 1: 베이스 이미지
FROM node:20.19.1

# 1) React build
FROM node:20-alpine AS client-build
WORKDIR /client
COPY client/package*.json ./      
 # ← client에 package.json이 없으면 이 줄 대신 루트 package.json 구조에 맞게 조정
RUN npm ci
COPY client/ ./
RUN npm run build

# 2) Node server
FROM node:20-alpine
WORKDIR /app

# 서버 의존성
COPY package*.json ./
RUN npm ci --omit=dev

# 서버 코드 (app.js 등)
COPY app.js ./

# React 빌드 결과 정적서빙 경로 복사
COPY --from=client-build /client/build ./client/build

# Step 7: PM2 설치
# RUN npm install -g pm2

# Step 8: 포트 오픈
EXPOSE 5000

# Step 9: 서버 실행
# CMD ["pm2-runtime", "app.js"]
CMD ["node", "app.js"]