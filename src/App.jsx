import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut
} from 'firebase/auth';
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    query, 
    where, 
    getDocs, 
    onSnapshot,
    addDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from 'firebase/firestore';

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

// --- Firebase Initialization ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- React Context for Auth and DB ---
const FirebaseContext = createContext(null);

const FirebaseProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserData(userDocSnap.data());
                }
                setUser(user);
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = { user, userData, setUserData, db, auth, loading };

    return (
        <FirebaseContext.Provider value={value}>
            {!loading && children}
        </FirebaseContext.Provider>
    );
};

const useFirebase = () => {
    return useContext(FirebaseContext);
};

// --- Main App Component ---
function App() {
  const { user, loading } = useFirebase();

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.loadingText}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {user ? <LoggedInScreen /> : <AuthScreen />}
    </div>
  );
}

// --- Screens ---

function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (isLogin) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        setError(err.message);
      }
    } else {
      if (!username) {
          setError("Please enter a username.");
          setLoading(false);
          return;
      }
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        await setDoc(doc(db, 'users', newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          username: username,
        });
      } catch (err) {
        setError(err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={styles.authContainer}>
      <h1 style={styles.title}>Status Check</h1>
      <form onSubmit={handleAuth} style={styles.form}>
        {!isLogin && (
          <input
            type="text"
            style={styles.input}
            placeholder="Choose a username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}
        <input
          type="email"
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          style={styles.input}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p style={styles.errorText}>{error}</p>}
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? '...' : (isLogin ? 'Log In' : 'Sign Up')}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={styles.toggleButton}>
        {isLogin ? 'Need an account? Sign Up' : 'Have an account? Log In'}
      </button>
    </div>
  );
}

function LoggedInScreen() {
  const { auth, user } = useFirebase();
  return (
    <div style={styles.loggedInContainer}>
      <h1 style={styles.title}>Welcome!</h1>
      <p style={styles.subtitle}>You are logged in as {user.email}</p>
      <button onClick={() => signOut(auth)} style={styles.button}>
        Log Out
      </button>
    </div>
  );
}

// --- Styles ---
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#111827',
    fontFamily: 'sans-serif',
  },
  loadingText: {
      color: '#fff',
      fontSize: '18px',
  },
  authContainer: {
    backgroundColor: '#1f2937',
    padding: '40px',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },
  loggedInContainer: {
    textAlign: 'center',
  },
  title: {
    color: '#22d3ee',
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '24px',
  },
  subtitle: {
      color: '#d1d5db',
      fontSize: '16px',
      textAlign: 'center',
      marginBottom: '24px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    backgroundColor: '#374151',
    color: '#f9fafb',
    border: '1px solid #4b5563',
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '16px',
    marginBottom: '16px',
  },
  button: {
    backgroundColor: '#0891b2',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  toggleButton: {
    backgroundColor: 'transparent',
    color: '#22d3ee',
    border: 'none',
    marginTop: '16px',
    cursor: 'pointer',
    textAlign: 'center',
    width: '100%',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: '16px',
  },
};

// --- Root Component for Replit ---
export default function Main() {
    return (
        <FirebaseProvider>
            <App />
        </FirebaseProvider>
    )
}
