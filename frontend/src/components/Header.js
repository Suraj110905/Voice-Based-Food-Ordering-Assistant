import React from 'react';
import { GiHotMeal } from 'react-icons/gi';
import { FaMicrophone } from 'react-icons/fa';
import { MdDeliveryDining } from 'react-icons/md';

function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.logoSection}>
        <div style={styles.iconWrapper}>
          <GiHotMeal style={styles.foodIcon} />
        </div>
        <div>
          <h1 style={styles.title}>VoiceFood</h1>
          <p style={styles.subtitle}>AI-Powered Food Ordering</p>
        </div>
      </div>
      <div style={styles.rightSection}>
        <div style={styles.deliveryBadge}>
          <MdDeliveryDining style={styles.deliveryIcon} />
          <span style={styles.deliveryText}>Fast Delivery</span>
        </div>
        <div style={styles.micSection}>
          <FaMicrophone style={styles.micIcon} />
          <span style={styles.micText}>Voice Powered</span>
        </div>
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
    padding: '15px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(255,69,0,0.3)',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconWrapper: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '12px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodIcon: {
    fontSize: '35px',
    color: 'white',
  },
  title: {
    margin: 0,
    color: 'white',
    fontSize: '26px',
    fontWeight: 'bold',
    letterSpacing: '1px',
  },
  subtitle: {
    margin: 0,
    color: 'rgba(255,255,255,0.8)',
    fontSize: '12px',
    letterSpacing: '0.5px',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  deliveryBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: '6px 12px',
    borderRadius: '20px',
  },
  deliveryIcon: {
    color: 'white',
    fontSize: '18px',
  },
  deliveryText: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
  },
  micSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '6px 12px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.3)',
  },
  micIcon: {
    color: 'white',
    fontSize: '14px',
  },
  micText: {
    color: 'white',
    fontSize: '13px',
    fontWeight: '500',
  },
};

export default Header;