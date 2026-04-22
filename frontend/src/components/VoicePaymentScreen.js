import React, { useState, useEffect, useRef } from 'react';
import { FaMicrophone, FaStop, FaLock } from 'react-icons/fa';
import { MdPayment } from 'react-icons/md';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

function VoicePaymentScreen({ cart, total, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [spokenCode, setSpokenCode] = useState('');
  const [status, setStatus] = useState('idle');
  const [walletBalance, setWalletBalance] = useState(null);
  const recognitionRef = useRef(null);

  const totalWithDelivery = total + 30;

  useEffect(() => {
    fetchWalletBalance();
    // Auto speak instructions
    speakInstructions();
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const res = await axios.get(
        `http://127.0.0.1:8000/wallet/${user.username}`
      );
      setWalletBalance(res.data.balance);
    } catch (error) {
      console.log('Could not fetch balance');
    }
  };

  const speakInstructions = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(
      `Your order total is rupees ${totalWithDelivery}. 
       Please say your secret payment code to confirm payment.`
    );
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    synth.speak(utterance);
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Voice not supported! Use Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.start();
    setIsListening(true);
    setStatus('listening');

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript
        .toUpperCase()
        .trim();
      setSpokenCode(spoken);
      setIsListening(false);
      setStatus('verifying');
      processVoicePayment(spoken);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setStatus('idle');
      toast.error('Could not hear you. Try again!');
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setStatus('idle');
  };

  const processVoicePayment = async (code) => {
    try {
      const res = await axios.post(
        'http://127.0.0.1:8000/wallet/voice-payment',
        {
          username: user.username,
          spoken_code: code,
          order_total: total,
          cart: cart,
        }
      );
      setStatus('success');
      // Speak success message
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(
        res.data.response
      );
      utterance.lang = 'en-US';
      synth.speak(utterance);
      toast.success('Payment successful! 🎉');
      setTimeout(() => {
        onSuccess(res.data);
      }, 2000);
    } catch (error) {
      setStatus('failed');
      const errorMsg = error.response?.data?.detail ||
        'Payment failed!';
      toast.error(errorMsg);
      // Speak error
      const synth = window.speechSynthesis;
      synth.cancel();
      const utterance = new SpeechSynthesisUtterance(
        'Payment failed. Wrong secret code. Please try again.'
      );
      synth.speak(utterance);
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="fade-in">

        {/* Header */}
        <div style={styles.header}>
          <MdPayment style={styles.headerIcon} />
          <h2 style={styles.title}>Voice Payment</h2>
        </div>

        {/* Order Summary */}
        <div style={styles.orderSummary}>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Order Total</span>
            <span style={styles.summaryValue}>₹{total}</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Delivery Fee</span>
            <span style={styles.summaryValue}>₹30</span>
          </div>
          <div style={styles.divider} />
          <div style={styles.summaryRow}>
            <span style={styles.grandLabel}>Total to Pay</span>
            <span style={styles.grandValue}>₹{totalWithDelivery}</span>
          </div>
          {walletBalance !== null && (
            <div style={styles.balanceRow}>
              <span style={styles.balanceLabel}>
                Wallet Balance: ₹{walletBalance?.toFixed(0)}
              </span>
              {walletBalance < totalWithDelivery && (
                <span style={styles.insufficientText}>
                  ⚠️ Insufficient!
                </span>
              )}
            </div>
          )}
        </div>

        {/* Status Display */}
        {status === 'idle' && (
          <div style={styles.instructions}>
            <FaLock style={styles.lockIcon} />
            <p style={styles.instructionText}>
              Press the mic and speak your secret payment code
            </p>
          </div>
        )}

        {status === 'listening' && (
          <div style={styles.listeningState}>
            <div style={styles.listeningPulse}>🎤</div>
            <p style={styles.listeningText}>
              Listening for secret code...
            </p>
          </div>
        )}

        {status === 'verifying' && (
          <div style={styles.verifyingState}>
            <p style={styles.spokenCode}>
              Heard: "{spokenCode}"
            </p>
            <p style={styles.verifyingText}>
              ⏳ Verifying payment...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={styles.successState}>
            <p style={styles.successText}>✅ Payment Successful!</p>
            <p style={styles.successSubtext}>
              Redirecting to confirmation...
            </p>
          </div>
        )}

        {status === 'failed' && (
          <div style={styles.failedState}>
            <p style={styles.failedText}>
              ❌ Wrong code! Try again.
            </p>
          </div>
        )}

        {/* Mic Button */}
        {(status === 'idle' || status === 'failed') && (
          <button
            style={{
              ...styles.micButton,
              backgroundColor: isListening ? '#FF0000' : '#FF4500',
            }}
            className={isListening ? 'pulse-mic' : 'btn-hover'}
            onClick={isListening ? stopListening : startListening}
          >
            {isListening
              ? <FaStop style={styles.micIcon} />
              : <FaMicrophone style={styles.micIcon} />
            }
          </button>
        )}

        {/* Speak Again Button */}
        <button
          style={styles.speakAgainButton}
          onClick={speakInstructions}
        >
          🔊 Hear Instructions Again
        </button>

        {/* Cancel Button */}
        <button
          style={styles.cancelButton}
          onClick={onCancel}
        >
          ✕ Cancel Payment
        </button>

      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '35px',
    width: '90%',
    maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    textAlign: 'center',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  headerIcon: {
    fontSize: '28px',
    color: '#FF4500',
  },
  title: {
    fontSize: '22px',
    color: '#333',
    margin: 0,
  },
  orderSummary: {
    backgroundColor: '#FFF3F0',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px',
    textAlign: 'left',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  summaryLabel: {
    color: '#888',
    fontSize: '14px',
  },
  summaryValue: {
    color: '#333',
    fontSize: '14px',
    fontWeight: '500',
  },
  divider: {
    borderTop: '1px dashed #FFD0C0',
    margin: '8px 0',
  },
  grandLabel: {
    color: '#333',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  grandValue: {
    color: '#FF4500',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  balanceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '8px',
    paddingTop: '8px',
    borderTop: '1px solid #FFE0D0',
  },
  balanceLabel: {
    fontSize: '13px',
    color: '#00AA44',
    fontWeight: '600',
  },
  insufficientText: {
    fontSize: '13px',
    color: '#FF0000',
    fontWeight: '600',
  },
  instructions: {
    backgroundColor: '#F0F8FF',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
  },
  lockIcon: {
    fontSize: '30px',
    color: '#FF4500',
    marginBottom: '8px',
  },
  instructionText: {
    color: '#555',
    fontSize: '14px',
    margin: 0,
  },
  listeningState: {
    marginBottom: '20px',
  },
  listeningPulse: {
    fontSize: '50px',
    marginBottom: '10px',
    animation: 'bounce 1s infinite',
  },
  listeningText: {
    color: '#FF4500',
    fontWeight: 'bold',
    fontSize: '15px',
  },
  verifyingState: {
    backgroundColor: '#FFF3F0',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
  },
  spokenCode: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '16px',
    margin: '0 0 8px 0',
  },
  verifyingText: {
    color: '#888',
    fontSize: '14px',
    margin: 0,
  },
  successState: {
    backgroundColor: '#E8FFE8',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
  },
  successText: {
    color: '#00AA44',
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 5px 0',
  },
  successSubtext: {
    color: '#888',
    fontSize: '13px',
    margin: 0,
  },
  failedState: {
    backgroundColor: '#FFE8E8',
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
  },
  failedText: {
    color: '#FF0000',
    fontWeight: 'bold',
    fontSize: '16px',
    margin: 0,
  },
  micButton: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px auto',
    boxShadow: '0 4px 15px rgba(255,69,0,0.4)',
    transition: 'all 0.3s ease',
  },
  micIcon: {
    fontSize: '30px',
    color: 'white',
  },
  speakAgainButton: {
    backgroundColor: 'white',
    color: '#FF4500',
    border: '1px solid #FF4500',
    borderRadius: '8px',
    padding: '8px 20px',
    cursor: 'pointer',
    fontSize: '13px',
    marginBottom: '10px',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    color: '#888',
    border: 'none',
    borderRadius: '8px',
    padding: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    width: '100%',
  },
};

export default VoicePaymentScreen;