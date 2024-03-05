import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email === 'Admin@123' && password === 'Admin@123') {
      navigate('/admin');
    } else {
      navigate('/user');
    }
  };

  return (
    <div className="login-container">
  <div className="login-box">
    <h2 className="login-title">Login</h2>
    <form>
      <div className="form-group">
        <label className="label">Email:</label>
        <input
          className="input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label className="label">Password:</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button className="login-button" type="button" onClick={handleLogin}>
        Login
      </button>
    </form>
  </div>
</div>

  );
}

export default Login;
