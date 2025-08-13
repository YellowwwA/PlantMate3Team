const express = require("express");
const path = require("path");
const compression = require("compression");

const app = express();
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ React 정적 파일을 '/garden' 경로에서 서빙
app.use('/garden', express.static(path.join(__dirname, 'client/build')));

// ✅ Unity WebGL 경로 그대로 유지
// app.get("/garden/unity", function (req, res) {
//     res.sendFile(path.join(__dirname, "public", "unity", "index.html"));
// });

// 루트 경로 ('/')에 대한 GET 요청을 처리하는 부분이 있는지 확인하세요.
app.get('/', (req, res) => {
    res.send('Hello from Node.js!'); // 또는 res.sendFile(...) 등
});

// Unity 정적 리소스 (Build 폴더) 서빙
app.use('/garden/unity/Build', express.static(path.join(__dirname, 'client/build/unity/Build')));

// Unity HTML entry point 서빙
app.get('/garden/unity', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build/unity/index.html'));
});

// ✅ React SPA fallback: /garden/* 요청에 대해 index.html 반환
app.get('/garden/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(5000, () => {
    console.log("✅ Server is running on http://localhost:5000/garden");
});
