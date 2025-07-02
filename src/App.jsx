
import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// --- Firebase Configuration ---
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIbqm25xhm7XkJoYaNV7_ElZQieyhjTUo",
  authDomain: "statuscheckapp-5dd35.firebaseapp.com",
  projectId: "statuscheckapp-5dd35",
  storageBucket: "statuscheckapp-5dd35.appspot.com",
  messagingSenderId: "970974477449",
  appId: "1:970974477449:web:67b011b1e1a21a62429a58",
};

// --- Firebase Initialization (Compat Mode) ---
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// --- Screens ---

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (authAction) => {
    setLoading(true);
    setError('');
    try {
      if (authAction === 'signup') {
        await auth.createUserWithEmailAndPassword(email, password);
      } else {
        await auth.signInWithEmailAndPassword(email, password);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.authContainer}>
      <h1 style={styles.title}>Status Check</h1>

      <input
        style={styles.input}
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <input
        style={styles.input}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
      />

      {error ? <p style={styles.errorText}>{error}</p> : null}

      {loading ? (
        <div style={styles.loading}>Loading...</div>
      ) : (
        <>
          <button style={styles.button} onClick={() => handleAuth('login')}>
            Log In
          </button>
          <button style={{...styles.button, ...styles.signupButton}} onClick={() => handleAuth('signup')}>
            Sign Up
          </button>
        </>
      )}
    </div>
  );
};

const LoggedInScreen = () => {
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={styles.centered}>
      <h2 style={styles.header}>Welcome!</h2>
      <p style={styles.subtitle}>You are logged in.</p>
      <button style={styles.button} onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};

// --- Main App Component ---
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div style={{...styles.container, ...styles.centered}}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {user ? <LoggedInScreen /> : <AuthScreen />}
    </div>
  );
};

// --- Styles ---
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#111827',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
  },
  authContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#22d3ee',
    textAlign: 'center',
    marginBottom: '32px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: '24px',
  },
  input: {
    backgroundColor: '#374151',
    color: '#f9fafb',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '16px',
    marginBottom: '16px',
    border: 'none',
    outline: 'none',
  },
  button: {
    backgroundColor: '#0891b2',
    color: '#ffffff',
    padding: '16px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
    marginTop: '8px',
  },
  signupButton: {
    backgroundColor: '#52525b'
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: '16px',
  },
  header: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#22d3ee',
    marginBottom: '16px',
  },
  loading: {
    color: '#22d3ee',
    fontSize: '18px',
    textAlign: 'center',
  },
};

export default App;
