import React, { useState, useEffect } from 'react';
import { FaHistory, FaShoppingBag, FaClock } from 'react-icons/fa';
import { MdRestaurant } from 'react-icons/md';
import axios from 'axios';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/orders/history');
      setOrders(res.data.orders);
    } catch (error) {
      console.log('Could not fetch history');
    }
    setLoading(false);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>⏳ Loading order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <FaHistory style={styles.headerIcon} />
          <h2 style={styles.title}>Order History</h2>
        </div>
        <div style={styles.emptyState}>
          <FaShoppingBag style={styles.emptyIcon} />
          <p style={styles.emptyText}>No orders yet!</p>
          <p style={styles.emptyHint}>
            Your past orders will appear here after you place them.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <FaHistory style={styles.headerIcon} />
        <h2 style={styles.title}>Order History</h2>
        <span style={styles.orderCount}>{orders.length} orders</span>
      </div>

      {/* Orders List */}
      <div style={styles.ordersList}>
        {orders.map((order, index) => (
          <div key={index} style={styles.orderCard}>

            {/* Order Header */}
            <div style={styles.orderHeader}>
              <div style={styles.orderLeft}>
                <FaShoppingBag style={styles.bagIcon} />
                <div>
                  <p style={styles.orderTitle}>
                    Order #{orders.length - index}
                  </p>
                  <div style={styles.timeRow}>
                    <FaClock style={styles.clockIcon} />
                    <span style={styles.timestamp}>
                      {formatDate(order.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
              <div style={styles.orderRight}>
                <span style={styles.statusBadge}>
                  ✅ {order.status}
                </span>
                <span style={styles.orderTotal}>
                  ₹{order.total + 30}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div style={styles.itemsList}>
              {order.items.map((item, i) => (
                <div key={i} style={styles.itemRow}>
                  <MdRestaurant style={styles.itemIcon} />
                  <span style={styles.itemName}>{item.item}</span>
                  <span style={styles.itemRestaurant}>
                    from {item.restaurant}
                  </span>
                  <span style={styles.itemQuantity}>
                    x{item.quantity}
                  </span>
                  <span style={styles.itemPrice}>
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div style={styles.orderFooter}>
              <span style={styles.footerText}>
                Subtotal: ₹{order.total} + Delivery: ₹30
              </span>
              <span style={styles.footerTotal}>
                Total: ₹{order.total + 30}
              </span>
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
    fontSize: '22px',
    color: '#FF4500',
  },
  title: {
    fontSize: '20px',
    color: '#333',
    margin: 0,
    flex: 1,
  },
  orderCount: {
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
  ordersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  orderCard: {
    backgroundColor: '#FFF8F6',
    borderRadius: '12px',
    padding: '15px',
    border: '1px solid #FFE0D0',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  orderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  bagIcon: {
    fontSize: '24px',
    color: '#FF4500',
  },
  orderTitle: {
    margin: 0,
    fontWeight: 'bold',
    fontSize: '15px',
    color: '#333',
  },
  timeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '4px',
  },
  clockIcon: {
    fontSize: '11px',
    color: '#888',
  },
  timestamp: {
    fontSize: '12px',
    color: '#888',
  },
  orderRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '5px',
  },
  statusBadge: {
    backgroundColor: '#E8FFE8',
    color: '#00AA44',
    borderRadius: '20px',
    padding: '3px 10px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  orderTotal: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FF4500',
  },
  itemsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '12px',
    paddingLeft: '36px',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  itemIcon: {
    fontSize: '16px',
    color: '#FF4500',
    flexShrink: 0,
  },
  itemName: {
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  itemRestaurant: {
    color: '#888',
    fontSize: '12px',
  },
  itemQuantity: {
    backgroundColor: '#FF4500',
    color: 'white',
    borderRadius: '4px',
    padding: '2px 6px',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  itemPrice: {
    fontWeight: 'bold',
    color: '#333',
    minWidth: '45px',
    textAlign: 'right',
  },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px dashed #FFD0C0',
    paddingTop: '10px',
  },
  footerText: {
    fontSize: '12px',
    color: '#888',
  },
  footerTotal: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
};

export default OrderHistory;