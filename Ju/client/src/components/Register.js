import React, { useState } from 'react';
import Header from "./Header";
import '../styles/Register.css'; // CSS 파일 임포트

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        alert('회원가입 성공!');
      } else {
        alert(data.detail || '회원가입 실패');
      }
    } catch (error) {
      alert('에러 발생: ' + error.message);
    }
  };

  return (
    <div>
      <Header />
        <div className="register-container">
      <form className="register-form" onSubmit={handleRegister}>
        <h2>회원가입</h2>
        <div className="input-group">
          <label htmlFor="email">이메일</label>
          <input
            id="email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">비밀번호</label>
          <input
            id="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="register-button">가입하기</button>
      </form>
    </div>
    </div>
  );
};

export default Register;
