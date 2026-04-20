import React, { useEffect } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { MdDeliveryDining } from 'react-icons/md';
import { BsStarFill } from 'react-icons/bs';

function OrderConfirm({ total, onNewOrder }) {

  useEffect(() => {
    const message = `Your order has been placed successfully! Total paid is rupees ${total + 30}. Your food is on the way!`;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    synth.speak(utterance);
  }, []);

  return (
    <div style={styles.container} className="fade-in">

      {/* Success Animation */}
      <div style={styles.successCircle}>
        <FaCheckCircle style={styles.checkIcon} />
      </div>

      {/* Title */}
      <h2 style={styles.title}>Order Placed! 🎉</h2>
      <p style={styles.subtitle}>
        Your food is being prepared with love!
      </p>

      {/* Stars */}
      <div style={styles.stars}>
        {[1,2,3,4,5].map(i => (
          <BsStarFill key={i} style={styles.star} />
        ))}
      </div>

      {/* Delivery Info */}
      <div style={styles.deliveryCard}>
        <div style={styles.deliveryLeft}>
          <MdDeliveryDining style={styles.deliveryIcon} />
        </div>
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
      <button
        style={styles.newOrderButton}
        className="btn-hover"
        onClick={onNewOrder}
      >
        🎤 Place New Order
      </button>

    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px 30px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '0 auto',
  },
  successCircle: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    backgroundColor: '#E8FFE8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px auto',
    border: '3px solid #00AA44',
  },
  checkIcon: {
    fontSize: '60px',
    color: '#00AA44',
  },
  title: {
    fontSize: '28px',
    color: '#333',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#888',
    marginBottom: '15px',
  },
  stars: {
    display: 'flex',
    justifyContent: 'center',
    gap: '5px',
    marginBottom: '25px',
  },
  star: {
    color: '#FFB800',
    fontSize: '20px',
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
  deliveryLeft: {
    backgroundColor: '#00AA44',
    borderRadius: '10px',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
  },
  deliveryIcon: {
    fontSize: '30px',
    color: 'white',
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
    fontSize: '22px',
    fontWeight: 'bold',
  },
  newOrderButton: {
    background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    padding: '15px 40px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255,69,0,0.3)',
    width: '100%',
  },
};

export default OrderConfirm;