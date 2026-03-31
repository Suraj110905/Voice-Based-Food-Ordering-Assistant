import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import VoiceInput from './components/VoiceInput';
import Cart from './components/Cart';
import RestaurantList from './components/RestaurantList';
import OrderConfirm from './components/OrderConfirm';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

function App() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [options, setOptions] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);

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

  // Fetch cart on first load
  useEffect(() => {
    fetchCart();
  }, []);

  // When voice assistant gets a response
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

  // Start a new order
  const handleNewOrder = () => {
    setOrderPlaced(false);
    setOptions([]);
    setCart([]);
    setTotal(0);
    setFinalTotal(0);
  };

  return (
    <div className="App">
      <Toaster position="top-right" />
      <Header />
      <main style={styles.main}>

        {/* Order Confirmed Screen */}
        {orderPlaced ? (
          <OrderConfirm
            total={finalTotal}
            onNewOrder={handleNewOrder}
          />
        ) : (

          /* Main App Grid */
          <div style={styles.grid}>

            {/* Left Side */}
            <div style={styles.left}>
              <VoiceInput onResponse={handleResponse} />
              {options.length > 0 && (
                <RestaurantList
                  options={options}
                  onCartUpdate={fetchCart}
                />
              )}
            </div>

            {/* Right Side */}
            <div style={styles.right}>
              <Cart
                cart={cart}
                total={total}
                onCartUpdate={fetchCart}
              />
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
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