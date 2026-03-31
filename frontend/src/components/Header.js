import React from 'react';
import { GiHotMeal } from 'react-icons/gi';
import { FaMicrophone } from 'react-icons/fa';

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.logoSection}>
        <GiHotMeal style={styles.foodIcon} />
        <div>
          <h1 style={styles.title}>VoiceFood</h1>
          <p style={styles.subtitle}>Order food with your voice</p>
        </div>
      </div>
      <div style={styles.micSection}>
        <FaMicrophone style={styles.micIcon} />
        <span style={styles.micText}>Voice Powered</span>
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: '#FF4500',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  foodIcon: {
    fontSize: '40px',
    color: 'white',
  },
  title: {
    margin: 0,
    color: 'white',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  subtitle: {
    margin: 0,
    color: '#FFE0D0',
    fontSize: '12px',
  },
  micSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '8px 15px',
    borderRadius: '20px',
  },
  micIcon: {
    color: 'white',
    fontSize: '16px',
  },
  micText: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
  },
};

export default Header;