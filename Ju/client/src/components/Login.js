import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 페이지 이동용
import Header from "./Header";
import '../styles/Register.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // 페이지 이동

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        alert('로그인 성공!');
        navigate('/'); // 로그인 성공 후 페이지 이동
      } else {
        alert(data.detail || '로그인 실패');
      }
    } catch (error) {
      alert('에러 발생: ' + error.message);
    }
  };

  return (
    <div>
      <Header />
      <div className="register-container">
        <form className="register-form" onSubmit={handleLogin}>
          <h2>로그인</h2>
          <div className="input-group">
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="register-button">로그인</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
