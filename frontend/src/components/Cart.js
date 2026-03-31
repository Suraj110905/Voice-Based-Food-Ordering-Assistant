import React from 'react';
import { FaShoppingCart, FaTrash } from 'react-icons/fa';
import { MdRestaurant } from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';

function Cart({ cart, total, onCartUpdate }) {

  // --------- CLEAR CART ---------
  const clearCart = async () => {
    try {
      await axios.delete('http://127.0.0.1:8000/cart/clear');
      toast.success('Cart cleared!');
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      toast.error('Could not clear cart. Is backend running?');
    }
  };

  // --------- EMPTY CART ---------
  if (!cart || cart.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <FaShoppingCart style={styles.cartIcon} />
          <h2 style={styles.title}>Your Cart</h2>
        </div>
        <div style={styles.emptyCart}>
          <p style={styles.emptyText}>🛒 Your cart is empty</p>
          <p style={styles.emptyHint}>
            Say or type "I want a burger" to add items!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <FaShoppingCart style={styles.cartIcon} />
          <h2 style={styles.title}>Your Cart</h2>
        </div>
        <button style={styles.clearButton} onClick={clearCart}>
          <FaTrash style={{ marginRight: '5px' }} />
          Clear
        </button>
      </div>

      {/* Cart Items */}
      <div style={styles.itemsList}>
        {cart.map((item, index) => (
          <div key={index} style={styles.cartItem}>
            <div style={styles.itemLeft}>
              <MdRestaurant style={styles.itemIcon} />
              <div>
                <p style={styles.itemName}>{item.item}</p>
                <p style={styles.itemRestaurant}>
                  from {item.restaurant}
                </p>
              </div>
            </div>
            <div style={styles.itemRight}>
              <span style={styles.itemQuantity}>
                x{item.quantity}
              </span>
              <span style={styles.itemPrice}>
                ₹{item.price * item.quantity}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Total Bill */}
      <div style={styles.totalSection}>
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Subtotal</span>
          <span style={styles.totalAmount}>₹{total}</span>
        </div>
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Delivery Fee</span>
          <span style={styles.totalAmount}>₹30</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.totalRow}>
          <span style={styles.grandTotalLabel}>Total</span>
          <span style={styles.grandTotalAmount}>
            ₹{total + 30}
          </span>
        </div>
      </div>

      {/* Confirm Hint */}
      <p style={styles.confirmHint}>
        🎤 Say or type <strong>"confirm order"</strong> to place your order!
      </p>

    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  cartIcon: {
    fontSize: '22px',
    color: '#FF4500',
  },
  title: {
    fontSize: '20px',
    color: '#333',
    margin: 0,
  },
  clearButton: {
    backgroundColor: '#FFE8E0',
    color: '#FF4500',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 14px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  emptyCart: {
    textAlign: 'center',
    padding: '30px 0',
  },
  emptyText: {
    fontSize: '18px',
    color: '#aaa',
    marginBottom: '8px',
  },
  emptyHint: {
    fontSize: '13px',
    color: '#bbb',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8F6',
    borderRadius: '10px',
    padding: '12px 15px',
    border: '1px solid #FFE0D0',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  itemIcon: {
    fontSize: '22px',
    color: '#FF4500',
  },
  itemName: {
    margin: 0,
    fontWeight: 'bold',
    fontSize: '15px',
    color: '#333',
  },
  itemRestaurant: {
    margin: 0,
    fontSize: '12px',
    color: '#888',
  },
  itemRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  itemQuantity: {
    backgroundColor: '#FF4500',
    color: 'white',
    borderRadius: '6px',
    padding: '3px 8px',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  itemPrice: {
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#333',
  },
  totalSection: {
    backgroundColor: '#F9F9F9',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  totalLabel: {
    color: '#888',
    fontSize: '14px',
  },
  totalAmount: {
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
  },
  divider: {
    borderTop: '1px dashed #ddd',
    margin: '10px 0',
  },
  grandTotalLabel: {
    color: '#333',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  grandTotalAmount: {
    color: '#FF4500',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  confirmHint: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888',
    backgroundColor: '#FFF3F0',
    padding: '10px',
    borderRadius: '8px',
  },
};

export default Cart;