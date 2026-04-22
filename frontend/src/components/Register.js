import React, { useState } from 'react';
import { GiHotMeal } from 'react-icons/gi';
import { FaUser, FaLock, FaEnvelope, FaIdCard, FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

function Register({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!formData.username || !formData.email ||
        !formData.password || !formData.full_name) {
      toast.error('Please fill in all fields!');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/auth/register',
        formData
      );
      login({
        username: res.data.username,
        full_name: res.data.full_name,
        email: res.data.email,
      }, res.data.token);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Registration failed!'
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
        <h2 style={styles.title}>Create Account 🎉</h2>
        <p style={styles.subtitle}>Join VoiceFood today!</p>

        {/* Full Name */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <div style={styles.inputWrapper}>
            <FaIdCard style={styles.inputIcon} />
            <input
              style={styles.input}
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Username */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <div style={styles.inputWrapper}>
            <FaUser style={styles.inputIcon} />
            <input
              style={styles.input}
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Email */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <div style={styles.inputWrapper}>
            <FaEnvelope style={styles.inputIcon} />
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              placeholder="Min 6 characters"
              value={formData.password}
              onChange={handleChange}
            />
            <button
              style={styles.eyeButton}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Register Button */}
        <button
          style={styles.registerButton}
          className="btn-hover"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? '⏳ Creating account...' : '🚀 Create Account'}
        </button>

        {/* Switch to Login */}
        <p style={styles.switchText}>
          Already have an account?{' '}
          <span
            style={styles.switchLink}
            onClick={onSwitchToLogin}
          >
            Login here
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
    marginBottom: '20px',
  },
  logoIcon: {
    backgroundColor: '#FF4500',
    borderRadius: '16px',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 10px auto',
  },
  foodIcon: {
    fontSize: '35px',
    color: 'white',
  },
  appName: {
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#FF4500',
    margin: '0 0 4px 0',
  },
  tagline: {
    fontSize: '12px',
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
    marginBottom: '20px',
  },
  inputGroup: {
    marginBottom: '15px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '6px',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #eee',
    borderRadius: '10px',
    padding: '0 15px',
  },
  inputIcon: {
    color: '#FF4500',
    fontSize: '15px',
    marginRight: '10px',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '12px 0',
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
  registerButton: {
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
    marginTop: '15px',
  },
  switchLink: {
    color: '#FF4500',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default Register;