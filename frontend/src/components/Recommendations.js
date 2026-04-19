import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { MdAutoAwesome } from 'react-icons/md';
import axios from 'axios';

function Recommendations() {
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      const res = await axios.get(
        'http://127.0.0.1:8000/recommendations'
      );
      setRecommendation(res.data.recommendation);
    } catch (error) {
      console.log('Could not fetch recommendations');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>
          🤖 AI is thinking of recommendations...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="fade-in">

      {/* Header */}
      <div style={styles.header}>
        <MdAutoAwesome style={styles.headerIcon} />
        <h2 style={styles.title}>AI Recommendations</h2>
        <FaStar style={styles.starIcon} />
      </div>

      {/* Recommendation */}
      <div style={styles.recommendationBox}>
        <p style={styles.recommendationText}>
          🤖 {recommendation}
        </p>
      </div>

      {/* Refresh Button */}
      <button
        style={styles.refreshButton}
        onClick={fetchRecommendations}
      >
        🔄 Get New Recommendation
      </button>

    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: '20px',
    border: '2px solid #FFE0D0',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  headerIcon: {
    fontSize: '22px',
    color: '#FF4500',
  },
  title: {
    fontSize: '18px',
    color: '#333',
    margin: 0,
    flex: 1,
  },
  starIcon: {
    fontSize: '18px',
    color: '#FFB800',
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    padding: '10px 0',
    fontSize: '14px',
  },
  recommendationBox: {
    backgroundColor: '#FFF8F6',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
    border: '1px solid #FFE0D0',
  },
  recommendationText: {
    color: '#333',
    fontSize: '14px',
    lineHeight: '1.6',
    margin: 0,
  },
  refreshButton: {
    width: '100%',
    backgroundColor: '#FF4500',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
};

export default Recommendations;