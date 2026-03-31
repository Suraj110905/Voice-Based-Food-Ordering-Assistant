import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { MdDeliveryDining } from 'react-icons/md';

function OrderConfirm({ total, onNewOrder }) {

  // Speak confirmation message
  useEffect(() => {
    const message = `Your order has been placed successfully! Total paid is rupees ${total + 30}. Your food is on the way!`;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    synth.speak(utterance);
  }, []);

  return (
    <div style={styles.container}>

      {/* Success Icon */}
      <div style={styles.iconSection}>
        <FaCheckCircle style={styles.checkIcon} />
      </div>

      {/* Title */}
      <h2 style={styles.title}>Order Placed! 🎉</h2>
      <p style={styles.subtitle}>
        Your food is being prepared and will arrive soon!
      </p>

      {/* Delivery Info */}
      <div style={styles.deliveryCard}>
        <MdDeliveryDining style={styles.deliveryIcon} />
        <div>
          <p style={styles.deliveryTitle}>Estimated Delivery Time</p>
          <p style={styles.deliveryTime}>30 - 45 minutes</p>
        </div>
      </div>

      {/* Bill Summary */}
      <div style={styles.billCard}>
        <div style={styles.billRow}>
          <span style={styles.billLabel}>Subtotal</span>
          <span style={styles.billAmount}>₹{total}</span>
        </div>
        <div style={styles.billRow}>
          <span style={styles.billLabel}>Delivery Fee</span>
          <span style={styles.billAmount}>₹30</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.billRow}>
          <span style={styles.grandLabel}>Total Paid</span>
          <span style={styles.grandAmount}>₹{total + 30}</span>
        </div>
      </div>

      {/* New Order Button */}
      <button style={styles.newOrderButton} onClick={onNewOrder}>
        🎤 Place New Order
      </button>

    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px 30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center',
    marginBottom: '20px',
  },
  iconSection: {
    marginBottom: '20px',
  },
  checkIcon: {
    fontSize: '70px',
    color: '#00AA44',
  },
  title: {
    fontSize: '26px',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#888',
    marginBottom: '25px',
  },
  deliveryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    backgroundColor: '#F0FFF4',
    border: '1px solid #C0FFD0',
    borderRadius: '12px',
    padding: '15px 20px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  deliveryIcon: {
    fontSize: '40px',
    color: '#00AA44',
  },
  deliveryTitle: {
    margin: 0,
    fontSize: '13px',
    color: '#888',
  },
  deliveryTime: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
  },
  billCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '25px',
    textAlign: 'left',
  },
  billRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  billLabel: {
    color: '#888',
    fontSize: '14px',
  },
  billAmount: {
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
  },
  divider: {
    borderTop: '1px dashed #ddd',
    margin: '10px 0',
  },
  grandLabel: {
    color: '#333',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  grandAmount: {
    color: '#00AA44',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  newOrderButton: {
    backgroundColor: '#FF4500',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 40px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255,69,0,0.3)',
  },
};

export default OrderConfirm;