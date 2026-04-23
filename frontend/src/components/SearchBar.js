import React, { useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { FaStar, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

function SearchBar({ onCartUpdate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error('Please type something to search!');
      return;
    }
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/search?q=${query}`
      );
      setResults(res.data.results);
      setSearched(true);
    } catch (error) {
      toast.error('Search failed. Is backend running?');
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  const addToCart = async (item) => {
    try {
      await axios.post('http://127.0.0.1:8000/cart/add', {
        item: item.item,
        restaurant: item.restaurant,
        price: item.price,
      });
      toast.success(`${item.item} added to cart!`);
      if (onCartUpdate) onCartUpdate();
    } catch (error) {
      toast.error('Could not add to cart!');
    }
  };

  const addToFavorites = async (item) => {
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/favorites/add', {
        item: item.item,
        restaurant: item.restaurant,
        price: item.price,
      });
      toast.success(res.data.response);
    } catch (error) {
      toast.error('Could not add to favorites!');
    }
  };

  return (
    <div style={styles.container} className="fade-in">

      {/* Title */}
      <h2 style={styles.title}>🔍 Search Food & Restaurants</h2>

      {/* Search Input */}
      <div style={styles.searchRow}>
        <input
          style={styles.input}
          type="text"
          placeholder="Search for pizza, burger, KFC..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        {query && (
          <button style={styles.clearButton} onClick={clearSearch}>
            <FaTimes />
          </button>
        )}
        <button style={styles.searchButton} onClick={handleSearch}>
          <FaSearch style={{ marginRight: '5px' }} />
          Search
        </button>
      </div>

      {/* No Results */}
      {searched && results.length === 0 && (
        <div style={styles.noResults}>
          <p>😔 No results found for "{query}"</p>
          <p style={styles.noResultsHint}>
            Try searching for "burger", "pizza", "KFC" etc.
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={styles.resultsSection}>
          <p style={styles.resultsCount}>
            Found {results.length} results for "{query}"
          </p>
          <div style={styles.grid}>
            {results.map((item, index) => (
              <div
                key={index}
                style={styles.card}
                className="card-hover fade-in"
              >
                {/* Card Header */}
                <div style={styles.cardHeader}>
                  <span style={styles.restaurantName}>
                    {item.restaurant}
                  </span>
                  <div style={styles.rating}>
                    <FaStar style={styles.starIcon} />
                    <span>4.2</span>
                  </div>
                </div>

                {/* Item Name */}
                <p style={styles.itemName}>{item.item}</p>

                {/* Card Footer */}
                <div style={styles.cardFooter}>
                  <span style={styles.price}>₹{item.price}</span>
                  <div style={styles.buttons}>
                    <button
                      style={styles.favButton}
                      onClick={() => addToFavorites(item)}
                    >
                      ❤️
                    </button>
                    <button
                      style={styles.addButton}
                      onClick={() => addToCart(item)}
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
      )}

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
  title: {
    fontSize: '20px',
    color: '#333',
    marginBottom: '15px',
  },
  searchRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
  },
  clearButton: {
    backgroundColor: '#FFE8E0',
    color: '#FF4500',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  searchButton: {
    backgroundColor: '#FF4500',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
  },
  noResults: {
    textAlign: 'center',
    padding: '20px',
    color: '#888',
    fontSize: '15px',
  },
  noResultsHint: {
    fontSize: '13px',
    color: '#bbb',
    marginTop: '5px',
  },
  resultsSection: {
    marginTop: '10px',
  },
  resultsCount: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '15px',
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
  buttons: {
    display: 'flex',
    gap: '8px',
  },
  favButton: {
    backgroundColor: '#FFE8E0',
    border: 'none',
    borderRadius: '8px',
    padding: '6px 10px',
    cursor: 'pointer',
    fontSize: '14px',
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
};

export default SearchBar;