import React, { useState, useEffect } from 'react';
import { FaWallet, FaPlus, FaLock } from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addAmount, setAddAmount] = useState('');
  const [newSecretCode, setNewSecretCode] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [voicePaymentEnabled, setVoicePaymentEnabled] = useState(true);
  const [manualPaymentEnabled, setManualPaymentEnabled] = useState(true);
  const [creating, setCreating] = useState(false);
  const [setupCode, setSetupCode] = useState('');

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchWallet = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/wallet/${user.username}`
      );
      setWallet(res.data);
      fetchTransactions();
      fetchPaymentModes();
    } catch (error) {
      if (error.response?.status === 404) {
        setWallet(null);
      }
    }
    setLoading(false);
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/wallet/${user.username}/transactions`
      );
      setTransactions(res.data.transactions);
    } catch (error) {
      console.log('Could not fetch transactions');
    }
  };

  const createWallet = async () => {
    if (!setupCode || setupCode.length < 4) {
      toast.error('Secret code must be at least 4 characters!');
      return;
    }
    setCreating(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/wallet/create', {
        username: user.username,
        secret_code: setupCode,
      });
      toast.success(res.data.message);
      fetchWallet();
    } catch (error) {
      toast.error('Could not create wallet!');
    }
    setCreating(false);
  };

  const addMoney = async () => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      toast.error('Please enter a valid amount!');
      return;
    }
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/wallet/add-money', {
        username: user.username,
        amount: parseFloat(addAmount),
      });
      toast.success(res.data.message);
      setAddAmount('');
      fetchWallet();
    } catch (error) {
      toast.error(
        error.response?.data?.detail || 'Could not add money!'
      );
    }
  };

  const updateSecretCode = async () => {
    if (!newSecretCode || newSecretCode.length < 4) {
      toast.error('Secret code must be at least 4 characters!');
      return;
    }
    try {
      await axios.put(
        'http://127.0.0.1:8000/wallet/update-secret-code', {
        username: user.username,
        new_code: newSecretCode,
      });
      toast.success('✅ Secret code updated!');
      setNewSecretCode('');
    } catch (error) {
      toast.error('Could not update secret code!');
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading
  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>⏳ Loading wallet...</p>
      </div>
    );
  }

  // Create Wallet Screen
  if (!wallet) {
    return (
      <div style={styles.container} className="fade-in">
        <div style={styles.createWalletSection}>
          <FaWallet style={styles.bigWalletIcon} />
          <h2 style={styles.createTitle}>Setup Your Wallet</h2>
          <p style={styles.createSubtitle}>
            Get ₹500 welcome bonus instantly! 🎉
          </p>
          <div style={styles.setupCard}>
            <p style={styles.setupLabel}>
              🔐 Choose a Secret Payment Code
            </p>
            <p style={styles.setupHint}>
              You'll say this code to confirm payments by voice!
            </p>
            <input
              style={styles.setupInput}
              type="text"
              placeholder="e.g. SURAJ1234"
              value={setupCode}
              onChange={(e) => setSetupCode(e.target.value.toUpperCase())}
            />
            <button
              style={styles.createButton}
              onClick={createWallet}
              disabled={creating}
            >
              {creating ? '⏳ Creating...' : '🚀 Create Wallet & Get ₹500'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const fetchPaymentModes = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/wallet/${user.username}/payment-modes`
      );
      setVoicePaymentEnabled(res.data.voice_payment_enabled);
      setManualPaymentEnabled(res.data.manual_payment_enabled);
    } catch (error) {
      console.log('Could not fetch payment modes');
    }
  };

  const togglePaymentModes = async (voice, manual) => {
    try {
      const res = await axios.put(
        'http://127.0.0.1:8000/wallet/toggle-payment-modes',
        {
          username: user.username,
          enable_voice: voice,
          enable_manual: manual,
        }
      );
      setVoicePaymentEnabled(voice);
      setManualPaymentEnabled(manual);
      toast.success(res.data.message);
    } catch (error) {
      toast.error('Could not update payment modes!');
    }
  };

  return (
    <div style={styles.container} className="fade-in">

      {/* Wallet Card */}
      <div style={styles.walletCard}>
        <div style={styles.walletHeader}>
          <div>
            <p style={styles.walletLabel}>VoiceFood Wallet</p>
            <p style={styles.walletUsername}>@{user.username}</p>
          </div>
          <FaWallet style={styles.walletIcon} />
        </div>
        <p style={styles.balanceLabel}>Available Balance</p>
        <p style={styles.balanceAmount}>
          ₹{wallet.balance?.toFixed(2)}
        </p>
        <div style={styles.walletFooter}>
          <MdPayment style={styles.paymentIcon} />
          <span style={styles.paymentText}>
            Voice Payment Enabled ✅
          </span>
        </div>
      </div>

      {/* Section Tabs */}
      <div style={styles.sectionTabs}>
        {['overview', 'add-money', 'transactions', 'settings'].map(
          (section) => (
            <button
              key={section}
              style={{
                ...styles.sectionTab,
                backgroundColor:
                  activeSection === section ? '#FF4500' : '#FFF3F0',
                color:
                  activeSection === section ? 'white' : '#FF4500',
              }}
              onClick={() => setActiveSection(section)}
            >
              {section === 'overview' && '📊 Overview'}
              {section === 'add-money' && '➕ Add Money'}
              {section === 'transactions' && '📜 History'}
              {section === 'settings' && '⚙️ Settings'}
            </button>
          )
        )}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div style={styles.section} className="fade-in">
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={styles.statValue}>
                ₹{wallet.balance?.toFixed(0)}
              </p>
              <p style={styles.statLabel}>Balance</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statValue}>
                {transactions.filter(t => t.type === 'debit').length}
              </p>
              <p style={styles.statLabel}>Orders Paid</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statValue}>
                ₹{transactions
                  .filter(t => t.type === 'debit')
                  .reduce((sum, t) => sum + t.amount, 0)
                  .toFixed(0)}
              </p>
              <p style={styles.statLabel}>Total Spent</p>
            </div>
          </div>

          {/* How to Pay */}
          <div style={styles.howToPayCard}>
            <h3 style={styles.howToPayTitle}>
              🎤 How Voice Payment Works
            </h3>
            <div style={styles.steps}>
              <div style={styles.step}>
                <span style={styles.stepNumber}>1</span>
                <p style={styles.stepText}>Add items to cart</p>
              </div>
              <div style={styles.step}>
                <span style={styles.stepNumber}>2</span>
                <p style={styles.stepText}>Say "confirm order"</p>
              </div>
              <div style={styles.step}>
                <span style={styles.stepNumber}>3</span>
                <p style={styles.stepText}>
                  App asks for secret code
                </p>
              </div>
              <div style={styles.step}>
                <span style={styles.stepNumber}>4</span>
                <p style={styles.stepText}>
                  Say your secret code
                </p>
              </div>
              <div style={styles.step}>
                <span style={styles.stepNumber}>5</span>
                <p style={styles.stepText}>
                  Payment done! 🎉
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Money Section */}
      {activeSection === 'add-money' && (
        <div style={styles.section} className="fade-in">
          <h3 style={styles.sectionTitle}>➕ Add Money to Wallet</h3>

          {/* Quick Add Buttons */}
          <div style={styles.quickAmounts}>
            {[100, 200, 500, 1000].map((amount) => (
              <button
                key={amount}
                style={styles.quickAmountButton}
                onClick={() => setAddAmount(amount.toString())}
              >
                ₹{amount}
              </button>
            ))}
          </div>

          {/* Custom Amount */}
          <div style={styles.addMoneyRow}>
            <input
              style={styles.amountInput}
              type="number"
              placeholder="Enter amount (max ₹10,000)"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
            />
            <button
              style={styles.addButton}
              onClick={addMoney}
            >
              <FaPlus style={{ marginRight: '5px' }} />
              Add Money
            </button>
          </div>

          <p style={styles.addMoneyNote}>
            💡 Maximum single transaction limit: ₹10,000
          </p>
        </div>
      )}

      {/* Transactions Section */}
      {activeSection === 'transactions' && (
        <div style={styles.section} className="fade-in">
          <h3 style={styles.sectionTitle}>📜 Transaction History</h3>
          {transactions.length === 0 ? (
            <p style={styles.noTransactions}>
              No transactions yet!
            </p>
          ) : (
            <div style={styles.transactionsList}>
              {transactions.map((txn, index) => (
                <div key={index} style={styles.transactionRow}>
                  <div style={styles.txnLeft}>
                    <div style={{
                      ...styles.txnIcon,
                      backgroundColor:
                        txn.type === 'credit' ? '#E8FFE8' : '#FFE8E0'
                    }}>
                      {txn.type === 'credit' ? '⬆️' : '⬇️'}
                    </div>
                    <div>
                      <p style={styles.txnDescription}>
                        {txn.description}
                      </p>
                      <p style={styles.txnDate}>
                        {formatDate(txn.timestamp)}
                      </p>
                    </div>
                  </div>
                  <div style={styles.txnRight}>
                    <p style={{
                      ...styles.txnAmount,
                      color: txn.type === 'credit'
                        ? '#00AA44' : '#FF4500'
                    }}>
                      {txn.type === 'credit' ? '+' : '-'}
                      ₹{txn.amount}
                    </p>
                    <p style={styles.txnBalance}>
                      Bal: ₹{txn.balance_after?.toFixed(0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Section */}
      {activeSection === 'settings' && (
        <div style={styles.section} className="fade-in">
          <h3 style={styles.sectionTitle}>⚙️ Wallet Settings</h3>

          {/* Payment Mode Toggles */}
          <div style={styles.settingsCard}>
            <h4 style={styles.settingsSectionTitle}>
              🔄 Payment Modes
            </h4>

            {/* Voice Payment Toggle */}
            <div style={styles.toggleRow}>
              <div style={styles.toggleLeft}>
                <p style={styles.toggleTitle}>🎤 Voice Payment</p>
                <p style={styles.toggleHint}>
                  Say secret code to pay by voice
                </p>
              </div>
              <div
                style={{
                  ...styles.toggle,
                  backgroundColor: voicePaymentEnabled
                    ? '#FF4500' : '#ddd'
                }}
                onClick={() => togglePaymentModes(
                  !voicePaymentEnabled,
                  manualPaymentEnabled
                )}
              >
                <div style={{
                  ...styles.toggleKnob,
                  transform: voicePaymentEnabled
                    ? 'translateX(24px)' : 'translateX(0px)'
                }} />
              </div>
            </div>

            {/* Manual Payment Toggle */}
            <div style={styles.toggleRow}>
              <div style={styles.toggleLeft}>
                <p style={styles.toggleTitle}>🖱️ Manual Payment</p>
                <p style={styles.toggleHint}>
                  Click to pay without voice
                </p>
              </div>
              <div
                style={{
                  ...styles.toggle,
                  backgroundColor: manualPaymentEnabled
                    ? '#FF4500' : '#ddd'
                }}
                onClick={() => togglePaymentModes(
                  voicePaymentEnabled,
                  !manualPaymentEnabled
                )}
              >
                <div style={{
                  ...styles.toggleKnob,
                  transform: manualPaymentEnabled
                    ? 'translateX(24px)' : 'translateX(0px)'
                }} />
              </div>
            </div>

            {/* Status */}
            <div style={styles.modeStatus}>
              <p style={styles.modeStatusText}>
                Active modes: {' '}
                {voicePaymentEnabled && '🎤 Voice '}
                {manualPaymentEnabled && '🖱️ Manual'}
                {!voicePaymentEnabled && !manualPaymentEnabled &&
                  '⚠️ All disabled!'}
              </p>
            </div>
          </div>

          {/* Secret Code Update */}
          <div style={{...styles.settingsCard, marginTop: '15px'}}>
            <div style={styles.settingRow}>
              <FaLock style={styles.settingIcon} />
              <div style={styles.settingInfo}>
                <p style={styles.settingTitle}>
                  Update Secret Payment Code
                </p>
                <p style={styles.settingHint}>
                  Choose a code you can remember and speak clearly
                </p>
              </div>
            </div>
            <input
              style={styles.settingInput}
              type="text"
              placeholder="Enter new secret code"
              value={newSecretCode}
              onChange={(e) =>
                setNewSecretCode(e.target.value.toUpperCase())
              }
            />
            <button
              style={styles.updateButton}
              onClick={updateSecretCode}
            >
              🔐 Update Secret Code
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: {
    marginBottom: '20px',
  },
  loadingText: {
    textAlign: 'center',
    color: '#888',
    padding: '30px',
  },
  createWalletSection: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  bigWalletIcon: {
    fontSize: '60px',
    color: '#FF4500',
    marginBottom: '15px',
  },
  createTitle: {
    fontSize: '24px',
    color: '#333',
    marginBottom: '8px',
  },
  createSubtitle: {
    fontSize: '15px',
    color: '#888',
    marginBottom: '25px',
  },
  setupCard: {
    backgroundColor: '#FFF3F0',
    borderRadius: '12px',
    padding: '25px',
    maxWidth: '400px',
    margin: '0 auto',
  },
  setupLabel: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
  },
  setupHint: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '15px',
  },
  setupInput: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '8px',
    border: '2px solid #FFD0C0',
    fontSize: '16px',
    textAlign: 'center',
    letterSpacing: '3px',
    fontWeight: 'bold',
    outline: 'none',
    marginBottom: '15px',
    boxSizing: 'border-box',
  },
  createButton: {
    width: '100%',
    background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  walletCard: {
    background: 'linear-gradient(135deg, #FF4500 0%, #FF6B35 100%)',
    borderRadius: '16px',
    padding: '25px',
    marginBottom: '20px',
    color: 'white',
    boxShadow: '0 8px 25px rgba(255,69,0,0.3)',
  },
  walletHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  walletLabel: {
    margin: 0,
    fontSize: '14px',
    opacity: 0.8,
  },
  walletUsername: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
  },
  walletIcon: {
    fontSize: '35px',
    opacity: 0.8,
  },
  balanceLabel: {
    margin: 0,
    fontSize: '13px',
    opacity: 0.8,
  },
  balanceAmount: {
    margin: '5px 0 20px 0',
    fontSize: '42px',
    fontWeight: 'bold',
  },
  walletFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '8px 15px',
    borderRadius: '20px',
    width: 'fit-content',
  },
  paymentIcon: {
    fontSize: '18px',
  },
  paymentText: {
    fontSize: '13px',
    fontWeight: '500',
  },
  sectionTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  sectionTab: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #FF4500',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  sectionTitle: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '20px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '15px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: '#FFF3F0',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center',
    border: '1px solid #FFE0D0',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#FF4500',
    margin: '0 0 5px 0',
  },
  statLabel: {
    fontSize: '12px',
    color: '#888',
    margin: 0,
  },
  howToPayCard: {
    backgroundColor: '#FFF3F0',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #FFE0D0',
  },
  howToPayTitle: {
    fontSize: '16px',
    color: '#333',
    marginBottom: '15px',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stepNumber: {
    backgroundColor: '#FF4500',
    color: 'white',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  stepText: {
    margin: 0,
    fontSize: '14px',
    color: '#333',
  },
  quickAmounts: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  quickAmountButton: {
    backgroundColor: '#FFF3F0',
    color: '#FF4500',
    border: '2px solid #FF4500',
    borderRadius: '8px',
    padding: '10px 20px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
    transition: 'all 0.2s ease',
  },
  addMoneyRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  amountInput: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '8px',
    border: '2px solid #ddd',
    fontSize: '15px',
    outline: 'none',
  },
  addButton: {
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
  addMoneyNote: {
    fontSize: '13px',
    color: '#888',
  },
  noTransactions: {
    textAlign: 'center',
    color: '#888',
    padding: '20px',
  },
  transactionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  transactionRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 15px',
    backgroundColor: '#FFF8F6',
    borderRadius: '10px',
    border: '1px solid #FFE0D0',
  },
  txnLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  txnIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
  },
  txnDescription: {
    margin: 0,
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  txnDate: {
    margin: 0,
    fontSize: '12px',
    color: '#888',
  },
  txnRight: {
    textAlign: 'right',
  },
  txnAmount: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 'bold',
  },
  txnBalance: {
    margin: 0,
    fontSize: '12px',
    color: '#888',
  },
  settingsCard: {
    backgroundColor: '#FFF3F0',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #FFE0D0',
  },
  settingRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginBottom: '15px',
  },
  settingIcon: {
    fontSize: '22px',
    color: '#FF4500',
    marginTop: '2px',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    margin: 0,
    fontWeight: 'bold',
    color: '#333',
    fontSize: '15px',
  },
  settingHint: {
    margin: '4px 0 0 0',
    fontSize: '13px',
    color: '#888',
  },
  settingInput: {
    width: '100%',
    padding: '12px 15px',
    borderRadius: '8px',
    border: '2px solid #FFD0C0',
    fontSize: '15px',
    outline: 'none',
    marginBottom: '12px',
    boxSizing: 'border-box',
    letterSpacing: '2px',
    fontWeight: 'bold',
  },
  updateButton: {
    width: '100%',
    backgroundColor: '#FF4500',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  settingsSectionTitle: {
    fontSize: '15px',
    color: '#333',
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #FFE0D0',
  },
  toggleLeft: {
    flex: 1,
  },
  toggleTitle: {
    margin: 0,
    fontWeight: '600',
    color: '#333',
    fontSize: '14px',
  },
  toggleHint: {
    margin: '3px 0 0 0',
    fontSize: '12px',
    color: '#888',
  },
  toggle: {
    width: '50px',
    height: '26px',
    borderRadius: '13px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.3s ease',
    flexShrink: 0,
  },
  toggleKnob: {
    position: 'absolute',
    top: '3px',
    left: '3px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'white',
    transition: 'transform 0.3s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  modeStatus: {
    backgroundColor: '#FFF3F0',
    borderRadius: '8px',
    padding: '10px',
    marginTop: '12px',
  },
  modeStatusText: {
    margin: 0,
    fontSize: '13px',
    color: '#FF4500',
    fontWeight: '600',
  },
};

export default Wallet;