import React, { useState, useEffect } from 'react';
import { FaHeart, FaTrash, FaPlus } from 'react-icons/fa';
import { MdRestaurant } from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';

function Favorites({ onCartUpdate }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/favorites');
      setFavorites(res.data.favorites);
    } catch (error) {
      console.log('Could not fetch favorites');
    }
    setLoading(false);
  };

  const removeFavorite = async (itemName) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/favorites/${itemName}`);
      toast.success('Removed from favorites!');
      fetchFavorites();
    } catch (error) {
      toast.error('Could not remove favorite!');
    }
  };

  const addToCart = async (favorite) => {
    try {
      await axios.post('http://127.0.0.1:8000/cart/add', {
        item: favorite.item,
        restaurant: favorite.restaurant,
        price: favorite.price,
      });
      toast.success(`${favorite.item} added to cart!`);
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      toast.error('Could not add to cart!');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>⏳ Loading favorites...</p>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <FaHeart style={styles.headerIcon} />
          <h2 style={styles.title}>My Favorites</h2>
        </div>
        <div style={styles.emptyState}>
          <FaHeart style={styles.emptyIcon} />
          <p style={styles.emptyText}>No favorites yet!</p>
          <p style={styles.emptyHint}>
            Say <strong>"add to favorites"</strong> after ordering
            an item to save it here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <FaHeart style={styles.headerIcon} />
        <h2 style={styles.title}>My Favorites</h2>
        <span style={styles.count}>{favorites.length} items</span>
      </div>

      {/* Favorites List */}
      <div style={styles.list}>
        {favorites.map((fav, index) => (
          <div key={index} style={styles.favCard}>

            {/* Left */}
            <div style={styles.favLeft}>
              <MdRestaurant style={styles.itemIcon} />
              <div>
                <p style={styles.itemName}>{fav.item}</p>
                <p style={styles.itemRestaurant}>
                  from {fav.restaurant}
                </p>
              </div>
            </div>

            {/* Right */}
            <div style={styles.favRight}>
              <span style={styles.price}>₹{fav.price}</span>
              <button
                style={styles.addButton}
                onClick={() => addToCart(fav)}
              >
                <FaPlus />
              </button>
              <button
                style={styles.removeButton}
                onClick={() => removeFavorite(fav.item)}
              >
                <FaTrash />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Quick Order Hint */}
      <p style={styles.hint}>
        🎤 Say <strong>"order my usual"</strong> to add all
        favorites to cart at once!
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
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  headerIcon: {
    fontSize: '22px',
    color: '#FF4500',
  },
  title: {
    fontSize: '20px',
    color: '#333',
    margin: 0,
    flex: 1,
  },
  count: {
    backgroundColor: '#FF4500',
    color: 'white',
    borderRadius: '20px',
    padding: '4px 12px',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    padding: '30px 0',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 0',
  },
  emptyIcon: {
    fontSize: '50px',
    color: '#FFD0C0',
    marginBottom: '15px',
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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '15px',
  },
  favCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF8F6',
    borderRadius: '10px',
    padding: '12px 15px',
    border: '1px solid #FFE0D0',
  },
  favLeft: {
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
  favRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  price: {
    fontWeight: 'bold',
    fontSize: '15px',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF4500',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  removeButton: {
    backgroundColor: '#FFE8E0',
    color: '#FF4500',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 10px',
    cursor: 'pointer',
    fontSize: '13px',
  },
  hint: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#888',
    backgroundColor: '#FFF3F0',
    padding: '10px',
    borderRadius: '8px',
  },
};

export default Favorites;