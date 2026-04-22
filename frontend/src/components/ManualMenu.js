import React, { useState } from 'react';
import { FaStar, FaPlus, FaHeart } from 'react-icons/fa';
import { MdRestaurant } from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';
import { menuData } from '../data/menuData';

function ManualMenu({ onResponse }) {
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

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

      {/* Restaurant Tabs */}
      <div style={styles.restaurantTabs}>
        <button
          style={{
            ...styles.restaurantTab,
            backgroundColor: !selectedRestaurant ? '#FF4500' : '#FFF3F0',
            color: !selectedRestaurant ? 'white' : '#FF4500',
          }}
          onClick={() => setSelectedRestaurant(null)}
        >
          All
        </button>
        {menuData.map((restaurant) => (
          <button
            key={restaurant.id}
            style={{
              ...styles.restaurantTab,
              backgroundColor: selectedRestaurant === restaurant.id
                ? '#FF4500' : '#FFF3F0',
              color: selectedRestaurant === restaurant.id
                ? 'white' : '#FF4500',
            }}
            onClick={() => setSelectedRestaurant(restaurant.id)}
          >
            {restaurant.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      {menuData
        .filter(r => !selectedRestaurant || r.id === selectedRestaurant)
        .map((restaurant) => (
          <div key={restaurant.id} style={styles.restaurantSection}>

            {/* Restaurant Header */}
            <div style={styles.restaurantHeader}>
              <MdRestaurant style={styles.restaurantIcon} />
              <div>
                <h3 style={styles.restaurantName}>{restaurant.name}</h3>
                <div style={styles.restaurantInfo}>
                  <FaStar style={styles.starIcon} />
                  <span style={styles.rating}>{restaurant.rating}</span>
                  <span style={styles.cuisine}>{restaurant.cuisine}</span>
                </div>
              </div>
            </div>

            {/* Menu Grid */}
            <div style={styles.menuGrid}>
              {restaurant.menu.map((item, index) => (
                <div
                  key={index}
                  style={styles.menuCard}
                  className="card-hover"
                >
                  <p style={styles.itemName}>{item.item}</p>
                  <p style={styles.itemPrice}>₹{item.price}</p>
                  <div style={styles.cardButtons}>
                    <button
                      style={styles.favButton}
                      onClick={() => addToFavorites(item, restaurant.name)}
                    >
                      <FaHeart />
                    </button>
                    <button
                      style={styles.addButton}
                      onClick={() => addToCart(item, restaurant.name)}
                    >
                      <FaPlus style={{ marginRight: '4px' }} />
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
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
};

export default ManualMenu;