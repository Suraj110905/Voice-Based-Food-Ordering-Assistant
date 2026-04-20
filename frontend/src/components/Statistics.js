import React, { useState, useEffect } from 'react';
import { FaShoppingBag, FaRupeeSign, FaHeart, FaTrophy } from 'react-icons/fa';
import { MdRestaurant, MdTrendingUp } from 'react-icons/md';
import axios from 'axios';

function Statistics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/stats');
      setStats(res.data);
    } catch (error) {
      console.log('Could not fetch stats');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>⏳ Loading statistics...</p>
      </div>
    );
  }

  if (!stats || stats.total_orders === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <MdTrendingUp style={styles.headerIcon} />
          <h2 style={styles.title}>My Statistics</h2>
        </div>
        <div style={styles.emptyState}>
          <FaShoppingBag style={styles.emptyIcon} />
          <p style={styles.emptyText}>No stats yet!</p>
          <p style={styles.emptyHint}>
            Place some orders to see your statistics here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="fade-in">

      {/* Header */}
      <div style={styles.header}>
        <MdTrendingUp style={styles.headerIcon} />
        <h2 style={styles.title}>My Statistics</h2>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>

        {/* Total Orders */}
        <div style={{...styles.statCard, backgroundColor: '#FFF3F0'}}>
          <FaShoppingBag style={{...styles.statIcon, color: '#FF4500'}} />
          <p style={styles.statValue}>{stats.total_orders}</p>
          <p style={styles.statLabel}>Total Orders</p>
        </div>

        {/* Total Spent */}
        <div style={{...styles.statCard, backgroundColor: '#F0FFF4'}}>
          <FaRupeeSign style={{...styles.statIcon, color: '#00AA44'}} />
          <p style={styles.statValue}>₹{stats.total_spent}</p>
          <p style={styles.statLabel}>Total Spent</p>
        </div>

        {/* Favourite Food */}
        <div style={{...styles.statCard, backgroundColor: '#FFF8F0'}}>
          <FaHeart style={{...styles.statIcon, color: '#FF6B00'}} />
          <p style={{...styles.statValue, fontSize: '18px'}}>
            {stats.favourite_food || 'N/A'}
          </p>
          <p style={styles.statLabel}>Favourite Food</p>
        </div>

        {/* Top Restaurant */}
        <div style={{...styles.statCard, backgroundColor: '#F0F8FF'}}>
          <FaTrophy style={{...styles.statIcon, color: '#FFB800'}} />
          <p style={{...styles.statValue, fontSize: '18px'}}>
            {stats.top_restaurant || 'N/A'}
          </p>
          <p style={styles.statLabel}>Top Restaurant</p>
        </div>

      </div>

      {/* Most Ordered Items */}
      {stats.most_ordered && stats.most_ordered.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>🍔 Most Ordered Items</h3>
          <div style={styles.itemsList}>
            {stats.most_ordered.map((item, index) => (
              <div key={index} style={styles.itemRow}>
                <span style={styles.itemRank}>#{index + 1}</span>
                <MdRestaurant style={styles.itemIcon} />
                <span style={styles.itemName}>{item.name}</span>
                <span style={styles.itemCount}>
                  {item.count}x ordered
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Average Order Value */}
      <div style={styles.avgSection}>
        <p style={styles.avgLabel}>📊 Average Order Value</p>
        <p style={styles.avgValue}>
          ₹{Math.round(stats.total_spent / stats.total_orders)}
        </p>
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
    fontSize: '22px',
    color: '#FF4500',
  },
  title: {
    fontSize: '20px',
    color: '#333',
    margin: 0,
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
    color: '#ddd',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px',
    marginBottom: '20px',
  },
  statCard: {
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    border: '1px solid #FFE0D0',
  },
  statIcon: {
    fontSize: '28px',
    marginBottom: '10px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 5px 0',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  section: {
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '12px',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FFF8F6',
    borderRadius: '8px',
    padding: '10px 15px',
    border: '1px solid #FFE0D0',
  },
  itemRank: {
    backgroundColor: '#FF4500',
    color: 'white',
    borderRadius: '6px',
    padding: '2px 8px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  itemIcon: {
    fontSize: '18px',
    color: '#FF4500',
  },
  itemName: {
    flex: 1,
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  itemCount: {
    fontSize: '12px',
    color: '#888',
    backgroundColor: '#F0F0F0',
    padding: '3px 8px',
    borderRadius: '10px',
  },
  avgSection: {
    backgroundColor: '#FFF3F0',
    borderRadius: '10px',
    padding: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    border: '1px solid #FFE0D0',
  },
  avgLabel: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  avgValue: {
    margin: 0,
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#FF4500',
  },
};

export default Statistics;