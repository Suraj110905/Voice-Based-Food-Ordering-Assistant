import React, { useState, useRef } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';
import { BsChatDotsFill } from 'react-icons/bs';
import axios from 'axios';
import toast from 'react-hot-toast';
import { restaurants } from '../data/menuData';
import ManualMenu from './ManualMenu';

function VoiceInput({ onResponse }) {
  const [manualMode, setManualMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [typedMessage, setTypedMessage] = useState('');
  const recognitionRef = useRef(null);

  // --------- START LISTENING ---------
  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Your browser does not support voice recognition. Try Chrome!');
      return;
    }

    // Stop any existing recognition first
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognitionRef.current = recognition;

    recognition.start();
    setIsListening(true);
    toast('🎤 Listening... Speak now!', { duration: 2000 });

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      setIsListening(false);
      recognitionRef.current = null;
      sendToBackend(spokenText);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      recognitionRef.current = null;
      toast.error('Could not hear you. Please try again!');
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
  };

  // --------- STOP LISTENING ---------
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    toast('🛑 Stopped listening!', { duration: 1500 });
  };

  // --------- SEND TO BACKEND ---------
  const sendToBackend = async (message) => {
    setLoading(true);
    try {
      const res = await axios.post('http://127.0.0.1:8000/ai/chat', {
        message: message,
      });

      const data = res.data;
      setResponse(data.response);
      speakResponse(data.response);

      if (onResponse) {
        onResponse(data);
      }

      // If awaiting payment stop here
      if (data.awaiting_payment) {
        return;
      }

      toast.success('Got a response!');
    } catch (error) {
      toast.error('Backend not connected. Make sure FastAPI is running!');
    }
    setLoading(false);
  };

  // --------- TEXT TO SPEECH ---------
  const speakResponse = (text) => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    synth.speak(utterance);
  };

  // --------- HANDLE TYPED MESSAGE ---------
  const handleTypedSubmit = () => {
    if (!typedMessage.trim()) {
      toast.error('Please type something first!');
      return;
    }
    setTranscript(typedMessage);
    sendToBackend(typedMessage);
    setTypedMessage('');
  };

  return (
    <div style={styles.container}>

      {/* Mode Toggle */}
      <div style={styles.modeToggle}>
        <button
          style={{
            ...styles.modeButton,
            backgroundColor: !manualMode ? '#FF4500' : 'white',
            color: !manualMode ? 'white' : '#FF4500',
          }}
          onClick={() => setManualMode(false)}
        >
          🎤 Voice Mode
        </button>
        <button
          style={{
            ...styles.modeButton,
            backgroundColor: manualMode ? '#FF4500' : 'white',
            color: manualMode ? 'white' : '#FF4500',
          }}
          onClick={() => setManualMode(true)}
        >
          🖱️ Manual Mode
        </button>
      </div>

      {/* Title */}
      <h2 style={styles.title}>
        {manualMode ? '🖱️ Manual Order' : '🎤 Voice Assistant'}
      </h2>

      {!manualMode && (
        <>
          <p style={styles.hint}>
            Press the mic and say something like{' '}
            <strong>"I want a burger"</strong>
          </p>

          {/* Mic Button */}
          <button
            className={isListening ? 'pulse-mic btn-hover' : 'btn-hover'}
            style={{
              ...styles.micButton,
              backgroundColor: isListening ? '#FF0000' : '#FF4500',
              transform: isListening ? 'scale(1.1)' : 'scale(1)',
            }}
            onClick={isListening ? stopListening : startListening}
            disabled={loading}
          >
            {isListening ? (
              <FaStop style={styles.micIcon} />
            ) : (
              <FaMicrophone style={styles.micIcon} />
            )}
          </button>

          {isListening && (
            <p style={styles.listeningText}>
              🔴 Listening... Click button to stop
            </p>
          )}
          {loading && (
            <p style={styles.loadingText}>
              ⏳ Processing your order...
            </p>
          )}

          <div style={styles.divider}>
            <span style={styles.dividerText}>or type your order</span>
          </div>

          <div style={styles.inputRow}>
            <input
              style={styles.input}
              type="text"
              placeholder="Type: I want a pizza..."
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleTypedSubmit()}
            />
            <button
              style={styles.sendButton}
              onClick={handleTypedSubmit}
              disabled={loading}
            >
              Send
            </button>
          </div>

          {transcript && (
            <div style={styles.transcriptBox}>
              <strong>You said:</strong> {transcript}
            </div>
          )}

          {response && (
            <div style={styles.responseBox}>
              <BsChatDotsFill style={styles.chatIcon} />
              <p style={styles.responseText}>{response}</p>
            </div>
          )}
        </>
      )}

      {/* Manual Mode Menu */}
      {manualMode && (
        <ManualMenu onResponse={onResponse} />
      )}

    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    textAlign: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    marginBottom: '8px',
    color: '#333',
  },
  hint: {
    color: '#888',
    fontSize: '14px',
    marginBottom: '25px',
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
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255,69,0,0.4)',
  },
  micIcon: {
    fontSize: '30px',
    color: 'white',
  },
  listeningText: {
    color: '#FF0000',
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '10px',
  },
  loadingText: {
    color: '#FF4500',
    fontSize: '14px',
    marginBottom: '10px',
  },
  divider: {
    margin: '20px 0',
    borderTop: '1px solid #eee',
    position: 'relative',
    textAlign: 'center',
  },
  dividerText: {
    position: 'relative',
    top: '-10px',
    backgroundColor: 'white',
    padding: '0 10px',
    color: '#aaa',
    fontSize: '13px',
  },
  inputRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
  },
  input: {
    flex: 1,
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '15px',
    outline: 'none',
  },
  sendButton: {
    padding: '12px 20px',
    backgroundColor: '#FF4500',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 'bold',
  },
  transcriptBox: {
    backgroundColor: '#FFF3F0',
    border: '1px solid #FFD0C0',
    borderRadius: '8px',
    padding: '12px',
    marginTop: '15px',
    fontSize: '14px',
    color: '#333',
    textAlign: 'left',
  },
  responseBox: {
    backgroundColor: '#F0FFF4',
    border: '1px solid #C0FFD0',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '10px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    textAlign: 'left',
  },
  chatIcon: {
    color: '#00AA44',
    fontSize: '20px',
    marginTop: '2px',
    flexShrink: 0,
  },
  responseText: {
    color: '#333',
    fontSize: '14px',
    lineHeight: '1.5',
  },
  modeToggle: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  modeButton: {
    padding: '8px 20px',
    borderRadius: '20px',
    border: '2px solid #FF4500',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
  },
};

export default VoiceInput;