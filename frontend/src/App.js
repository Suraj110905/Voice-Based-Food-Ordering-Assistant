import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import VoiceInput from './components/VoiceInput';
import Cart from './components/Cart';
import RestaurantList from './components/RestaurantList';
import OrderConfirm from './components/OrderConfirm';
import OrderHistory from './components/OrderHistory';
import Favorites from './components/Favorites';
import Recommendations from './components/Recommendations';
import SearchBar from './components/SearchBar';
import Statistics from './components/Statistics';
import Login from './components/Login';
import Register from './components/Register';
import { useAuth } from './components/AuthContext';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import Wallet from './components/Wallet';
import toast from 'react-hot-toast';
import VoicePaymentScreen from './components/VoicePaymentScreen';

function App() {
  const { user, logout, loading } = useAuth();
  const [authPage, setAuthPage] = useState('login');
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  const [activeTab, setActiveTab] = useState('order');
  const [showVoicePayment, setShowVoicePayment] = useState(false);
  const [awaitingPayment, setAwaitingPayment] = useState(false);

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
    if (user) fetchCart();
  }, [user]);

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
      setShowVoicePayment(false);
      setAwaitingPayment(false);
    }
    if (data.awaiting_payment) {
      setAwaitingPayment(true);
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

  // --------- LOADING SCREEN ---------
  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <p>⏳ Loading VoiceFood...</p>
      </div>
    );
  }

  // --------- AUTH PAGES ---------
  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        {authPage === 'login' ? (
          <Login
            onSwitchToRegister={() => setAuthPage('register')}
          />
        ) : (
          <Register
            onSwitchToLogin={() => setAuthPage('login')}
          />
        )}
      </>
    );
  }

  const handleVoicePayment = () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    setShowVoicePayment(true);
  };

  const handlePaymentSuccess = (data) => {
    setFinalTotal(total);
    setOrderPlaced(true);
    setShowVoicePayment(false);
    setAwaitingPayment(false);
    setCart([]);
    setTotal(0);
    setOptions([]);
  };

  const handleManualPayment = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/wallet/manual-payment',
        {
          username: user.username,
          order_total: total,
          cart: cart,
        }
      );
      setFinalTotal(total);
      setOrderPlaced(true);
      setCart([]);
      setTotal(0);
      toast.success(res.data.message);
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Payment failed!'
      );
    }
  };

  // --------- MAIN APP ---------
  return (
    <div className="App">
      <Toaster position="top-right" />
      <Header user={user} onLogout={logout} />

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
            backgroundColor: activeTab === 'search' ? '#FF4500' : 'white',
            color: activeTab === 'search' ? 'white' : '#FF4500',
          }}
          onClick={() => setActiveTab('search')}
        >
          🔍 Search
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
          📜 History
        </button>
        <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'stats' ? '#FF4500' : 'white',
            color: activeTab === 'stats' ? 'white' : '#FF4500',
          }}
          onClick={() => setActiveTab('stats')}
        >
          📊 Statistics
        </button>
      </div>
      <button
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'wallet' ? '#FF4500' : 'white',
            color: activeTab === 'wallet' ? 'white' : '#FF4500',
          }}
          onClick={() => setActiveTab('wallet')}
        >
          💳 Wallet
        </button>

      <main style={styles.main}>

        {/* Wallet Tab */}
        {activeTab === 'wallet' && <Wallet />}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <SearchBar onCartUpdate={fetchCart} />
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <Favorites onCartUpdate={fetchCart} />
        )}

        {/* Order History Tab */}
        {activeTab === 'history' && <OrderHistory />}

        {/* Statistics Tab */}
        {activeTab === 'stats' && <Statistics />}

        {/* Order Food Tab */}
        {activeTab === 'order' && (
          <>
            {orderPlaced ? (
              <OrderConfirm
                total={finalTotal}
                onNewOrder={handleNewOrder}
              />
            ) : (
              <div style={styles.grid} className="grid-responsive">
                <div style={styles.left}>
                  <VoiceInput onResponse={handleResponse} />
                  <Recommendations />
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
                    onVoicePayment={handleVoicePayment}
                    onManualPayment={handleManualPayment}
                  />
                </div>
              </div>
            )}
          </>
        )}

      {/* Voice Payment Screen */}
      {showVoicePayment && (
        <VoicePaymentScreen
          cart={cart}
          total={total}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setShowVoicePayment(false)}
        />
      )}

      </main>
    </div>
  );
}

const styles = {
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#FF4500',
    background: 'linear-gradient(135deg, #FFF5F0 0%, #FFF0E8 100%)',
  },
  tabBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    padding: '15px',
    backgroundColor: 'white',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '10px 20px',
    borderRadius: '25px',
    border: '2px solid #FF4500',
    cursor: 'pointer',
    fontSize: '14px',
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
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    color: '#FF4500',
  },
};

export default App;