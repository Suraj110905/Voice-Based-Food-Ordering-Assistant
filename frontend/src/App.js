import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import VoiceInput from './components/VoiceInput';
import Cart from './components/Cart';
import RestaurantList from './components/RestaurantList';
import OrderConfirm from './components/OrderConfirm';
import OrderHistory from './components/OrderHistory';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

function App() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('order');

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/cart');
      setCart(res.data.cart);
      setTotal(res.data.total);
    } catch (error) {
      console.log('Backend not connected');
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleResponse = (data) => {
    if (data.cart) {
      setCart(data.cart);
      setTotal(data.total || 0);
    }
    if (data.options) {
      setOptions(data.options);
    }
    if (data.order_placed) {
      setFinalTotal(total);
      setOrderPlaced(true);
      setOptions([]);
    }
    fetchCart();
  };

  const handleNewOrder = () => {
    setOrderPlaced(false);
    setOptions([]);
    setCart([]);
    setTotal(0);
    setFinalTotal(0);
    setActiveTab('order');
  };

  return (
    <div className="App">
      <Toaster position="top-right" />
      <Header />

      {/* Tab Navigation */}
      <div style={styles.tabBar}>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'order' ? '#FF4500' : 'white',
            color: activeTab === 'order' ? 'white' : '#FF4500',
          }}
          onClick={() => setActiveTab('order')}
        >
          🎤 Order Food
        </button>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'favorites' ? '#FF4500' : 'white',
            color: activeTab === 'favorites' ? 'white' : '#FF4500',
          }}
          onClick={() => setActiveTab('favorites')}
        >
          ❤️ Favorites
        </button>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'history' ? '#FF4500' : 'white',
            color: activeTab === 'history' ? 'white' : '#FF4500',
          }}
          onClick={() => setActiveTab('history')}
        >
          📜 Order History
        </button>
      </div>

      <main style={styles.main}>

        {/* Order History Tab */}
        {activeTab === 'history' && <OrderHistory />}

        {/* Order Food Tab */}
        {activeTab === 'order' && (
          <>
            {orderPlaced ? (
              <OrderConfirm
                total={finalTotal}
                onNewOrder={handleNewOrder}
              />
            ) : (
              <div style={styles.grid}>
                <div style={styles.left}>
                  <VoiceInput onResponse={handleResponse} />
                  {options.length > 0 && (
                    <RestaurantList
                      options={options}
                      onCartUpdate={fetchCart}
                    />
                  )}
                </div>
                <div style={styles.right}>
                  <Cart
                    cart={cart}
                    total={total}
                    onCartUpdate={fetchCart}
                  />
                </div>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}

const styles = {
  tabBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  tab: {
    padding: '10px 30px',
    borderRadius: '25px',
    border: '2px solid #FF4500',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  },
  main: {
    padding: '30px',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  left: {
    flex: 1,
  },
  right: {
    flex: 1,
  },
};

export default App;