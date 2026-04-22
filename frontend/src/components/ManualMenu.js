import React, { useState } from 'react';
import { FaStar, FaPlus, FaHeart } from 'react-icons/fa';
import { MdRestaurant } from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';
import { menuData } from '../data/menuData';
import ManualMenu from './ManualMenu';

function ManualMenu({ onResponse }) {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [manualMode, setManualMode] = useState(false);

  const addToCart = async (item, restaurantName) => {
    try {
      const res = await axios.post('http://127.0.0.1:8000/cart/add', {
        item: item.item,
        restaurant: restaurantName,
        price: item.price,
      });
      toast.success(`${item.item} added to cart!`);
      if (onResponse) onResponse(res.data);
    } catch (error) {
      toast.error('Could not add to cart!');
    }
  };

  const addToFavorites = async (item, restaurantName) => {
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/favorites/add', {
        item: item.item,
        restaurant: restaurantName,
        price: item.price,
      });
      toast.success(res.data.response);
    } catch (error) {
      toast.error('Could not add to favorites!');
    }
  };

  return (
    <div style={styles.container}>

      {/* Mode Toggle */}
      <div style={styles.modeToggle}>
        <button
          style={{
            ...styles.modeButton,
            backgroundColor: !manualMode ? '#FF4500' : 'white',
            color: !manualMode ? 'white' : '#FF4500',
          }}
          onClick={() => setManualMode(false)}
        >
          🎤 Voice Mode
        </button>
        <button
          style={{
            ...styles.modeButton,
            backgroundColor: manualMode ? '#FF4500' : 'white',
            color: manualMode ? 'white' : '#FF4500',
          }}
          onClick={() => setManualMode(true)}
        >
          🖱️ Manual Mode
        </button>
      </div>

      {/* Title */}
      <h2 style={styles.title}>
        {manualMode ? '🖱️ Manual Order' : '🎤 Voice Assistant'}
      </h2>

      {!manualMode && (
        <>
          <p style={styles.hint}>
            Press the mic and say something like{' '}
            <strong>"I want a burger"</strong>
          </p>

          {/* Mic Button */}
          <button
            className={isListening ? 'pulse-mic btn-hover' : 'btn-hover'}
            style={{
              ...styles.micButton,
              backgroundColor: isListening ? '#FF0000' : '#FF4500',
              transform: isListening ? 'scale(1.1)' : 'scale(1)',
            }}
            onClick={isListening ? stopListening : startListening}
            disabled={loading}
          >
            {isListening ? (
              <FaStop style={styles.micIcon} />
            ) : (
              <FaMicrophone style={styles.micIcon} />
            )}
          </button>

          {isListening && (
            <p style={styles.listeningText}>
              🔴 Listening... Click button to stop
            </p>
          )}
          {loading && (
            <p style={styles.loadingText}>
              ⏳ Processing your order...
            </p>
          )}

          <div style={styles.divider}>
            <span style={styles.dividerText}>or type your order</span>
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              type="text"
              placeholder="Type: I want a pizza..."
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTypedSubmit()}
            />
            <button
              style={styles.sendButton}
              onClick={handleTypedSubmit}
              disabled={loading}
            >
              Send
            </button>
          </div>

          {transcript && (
            <div style={styles.transcriptBox}>
              <strong>You said:</strong> {transcript}
            </div>
          )}

          {response && (
            <div style={styles.responseBox}>
              <BsChatDotsFill style={styles.chatIcon} />
              <p style={styles.responseText}>{response}</p>
            </div>
          )}
        </>
      )}

      {/* Manual Mode Menu */}
      {manualMode && (
        <ManualMenu onResponse={onResponse} />
      )}

    </div>
  );
}

const styles = {
  container: {
    marginTop: '15px',
    textAlign: 'left',
  },
  restaurantTabs: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginBottom: '15px',
  },
  restaurantTab: {
    padding: '6px 14px',
    borderRadius: '20px',
    border: '1px solid #FF4500',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
  restaurantSection: {
    marginBottom: '20px',
  },
  restaurantHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    padding: '10px',
    backgroundColor: '#FFF3F0',
    borderRadius: '10px',
  },
  restaurantIcon: {
    fontSize: '24px',
    color: '#FF4500',
  },
  restaurantName: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  restaurantInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '3px',
  },
  starIcon: {
    color: '#FFB800',
    fontSize: '12px',
  },
  rating: {
    fontSize: '12px',
    color: '#888',
  },
  cuisine: {
    fontSize: '12px',
    color: '#888',
    backgroundColor: '#FFE8E0',
    padding: '2px 8px',
    borderRadius: '10px',
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
  },
  menuCard: {
    backgroundColor: '#FFF8F6',
    borderRadius: '10px',
    padding: '12px',
    border: '1px solid #FFE0D0',
    textAlign: 'center',
  },
  itemName: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 6px 0',
  },
  itemPrice: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#FF4500',
    margin: '0 0 10px 0',
  },
  cardButtons: {
    display: 'flex',
    gap: '6px',
    justifyContent: 'center',
  },
  favButton: {
    backgroundColor: '#FFE8E0',
    color: '#FF4500',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 8px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  addButton: {
    backgroundColor: '#FF4500',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  modeToggle: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  modeButton: {
    padding: '8px 20px',
    borderRadius: '20px',
    border: '2px solid #FF4500',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  },
};

export default ManualMenu;