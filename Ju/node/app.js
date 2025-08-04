// const express = require('express');
// const app = express();
// const path = require('path');

// // ✅ 미들웨어
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // ✅ 1. API 라우트 등록
// const apiRoutes = require('./routes/main');
// app.use('/api', apiRoutes);

// // ✅ 2. React 정적 파일 서빙 (/home 경로 사용)
// app.use('/home', express.static(path.join(__dirname, '../client/build')));

// // ✅ 3. React SPA fallback 처리 (정규식으로 버그 우회)
// app.get(/^\/home(?!\/api).*/, (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
// });

// // ✅ 4. 서버 시작
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`✅ A서버 실행 중: http://localhost:${PORT}/home`);
// });

const express = require('express');
const app = express();
const path = require('path');

// ✅ 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ 1. API 라우트 먼저 등록
const apiRoutes = require('./routes/main'); // ./routes/main.js
app.use('/api', apiRoutes); // /api로 시작하는 요청은 FastAPI에 프록시됨

// ✅ 2. React 정적 파일 서빙 (client/build)
app.use(express.static(path.join(__dirname, '../client/build')));

app.get('/', (req, res) => {
  res.send('✅ Hello from Node.js!');
});

// ✅ 3. React SPA 라우팅 fallback (index.html)
// API 요청이 아닌 모든 GET 요청에 대해 index.html을 서빙합니다.
app.get(/^(?!\/api)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// ✅ 4. 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Node 서버 실행: http://15.168.150.125:${PORT}`);
});
