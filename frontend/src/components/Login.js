import React, { useState } from 'react';
import { GiHotMeal } from 'react-icons/gi';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

function Login({ onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      toast.error('Please fill in all fields!');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/auth/login',
        { username, password }
      );
      login({
        username: res.data.username,
        full_name: res.data.full_name,
        email: res.data.email,
      }, res.data.token);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Login failed!'
      );
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="fade-in">

        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <GiHotMeal style={styles.foodIcon} />
          </div>
          <h1 style={styles.appName}>VoiceFood</h1>
          <p style={styles.tagline}>AI-Powered Food Ordering</p>
        </div>

        {/* Title */}
        <h2 style={styles.title}>Welcome Back! 👋</h2>
        <p style={styles.subtitle}>Login to continue ordering</p>

        {/* Username */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <div style={styles.inputWrapper}>
            <FaUser style={styles.inputIcon} />
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>
        </div>

        {/* Password */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <div style={styles.inputWrapper}>
            <FaLock style={styles.inputIcon} />
            <input
              style={styles.input}
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              style={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Login Button */}
        <button
          style={styles.loginButton}
          className="btn-hover"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? '⏳ Logging in...' : '🔑 Login'}
        </button>

        {/* Switch to Register */}
        <p style={styles.switchText}>
          Don't have an account?{' '}
          <span
            style={styles.switchLink}
            onClick={onSwitchToRegister}
          >
            Register here
          </span>
        </p>

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
    padding: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  logoSection: {
    textAlign: 'center',
    marginBottom: '25px',
  },
  logoIcon: {
    backgroundColor: '#FF4500',
    borderRadius: '16px',
    width: '70px',
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 10px auto',
  },
  foodIcon: {
    fontSize: '40px',
    color: 'white',
  },
  appName: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#FF4500',
    margin: '0 0 4px 0',
  },
  tagline: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  title: {
    fontSize: '22px',
    color: '#333',
    marginBottom: '5px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: '#888',
    textAlign: 'center',
    marginBottom: '25px',
  },
  inputGroup: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #eee',
    borderRadius: '10px',
    padding: '0 15px',
    transition: 'border-color 0.2s',
  },
  inputIcon: {
    color: '#FF4500',
    fontSize: '16px',
    marginRight: '10px',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '14px 0',
    fontSize: '15px',
    color: '#333',
    backgroundColor: 'transparent',
  },
  eyeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#888',
    fontSize: '16px',
    padding: '5px',
  },
  loginButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '15px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 15px rgba(255,69,0,0.3)',
  },
  switchText: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#888',
    marginTop: '20px',
  },
  switchLink: {
    color: '#FF4500',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Login;