import React from 'react';
import { MdRestaurant } from 'react-icons/md';
import { FaStar, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

function RestaurantList({ options, onCartUpdate }) {

  // --------- ADD ITEM TO CART ---------
const addToCart = async (option) => {
  try {
    await axios.post('http://127.0.0.1:8000/cart/add', {
      item: option.item,
      restaurant: option.restaurant,
      price: option.price,
    });
    toast.success(`${option.item} added to cart!`);
    if (onCartUpdate) onCartUpdate();
  } catch (error) {
    toast.error('Could not add item. Is backend running?');
  }
};
// ---------------ADD ITEM TO FAVOURITES------------------//
const addToFavorites = async (option) => {
  try {
    const res = await axios.post('http://127.0.0.1:8000/favorites/add', {
      item: option.item,
      restaurant: option.restaurant,
      price: option.price,
    });
    toast.success(res.data.response);
  } catch (error) {
    toast.error('Could not add to favorites!');
  }
};

  // --------- NO OPTIONS ---------
  if (!options || options.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>

      {/* Title */}
      <div style={styles.header}>
        <MdRestaurant style={styles.headerIcon} />
        <h2 style={styles.title}>Available Options</h2>
      </div>

      {/* Options Grid */}
      <div style={styles.grid}>
        {options.map((option, index) => (
          <div key={index} style={styles.card}>

            {/* Card Header */}
            <div style={styles.cardHeader}>
              <span style={styles.restaurantName}>
                {option.restaurant}
              </span>
              <div style={styles.rating}>
                <FaStar style={styles.starIcon} />
                <span>4.2</span>
              </div>
            </div>

            {/* Item Name */}
            <p style={styles.itemName}>{option.item}</p>

            {/* Card Footer */}
            <div style={styles.cardFooter}>
              <span style={styles.price}>₹{option.price}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
              <button
               style={styles.favoriteButton}
               onClick={() => addToFavorites(option)}
              >
              ❤️
              </button>
              <button
                style={styles.addButton}
                onClick={() => addToCart(option)}
              >
                <FaPlus style={{ marginRight: '5px' }} />
                Add
              </button>
            </div>
           </div>
          </div>
        ))}
      </div>

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
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  headerIcon: {
    fontSize: '24px',
    color: '#FF4500',
  },
  title: {
    fontSize: '20px',
    color: '#333',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '15px',
  },
  card: {
    backgroundColor: '#FFF8F6',
    borderRadius: '12px',
    padding: '15px',
    border: '1px solid #FFE0D0',
    transition: 'transform 0.2s ease',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  restaurantName: {
    fontSize: '12px',
    color: '#FF4500',
    fontWeight: 'bold',
    backgroundColor: '#FFE8E0',
    padding: '3px 8px',
    borderRadius: '20px',
  },
  rating: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#888',
  },
  starIcon: {
    color: '#FFB800',
    fontSize: '12px',
  },
  itemName: {
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 12px 0',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF4500',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '6px 12px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  favoriteButton: {
  backgroundColor: '#FFE8E0',
  border: 'none',
  borderRadius: '8px',
  padding: '6px 10px',
  cursor: 'pointer',
  fontSize: '14px',
},
};

export default RestaurantList;