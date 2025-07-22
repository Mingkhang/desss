// Trang đăng nhập dành cho đại lý
import React, { useState } from 'react';
import axios from 'axios';

const AgentLoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/agent/login', { username, password });
      if (res.data.success) {
        setMessage('Đăng nhập thành công!');
        // Chuyển hướng hoặc lưu trạng thái đăng nhập
      } else {
        setMessage(res.data.message);
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Lỗi đăng nhập');
    }
  };

  return (
    <div>
      <h2>Đăng nhập Đại lý</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Tên đại lý"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Đăng nhập</button>
      </form>
      <p>{message}</p>
    </div>
  );
};

export default AgentLoginPage;
