import React from 'react';
import Routes from './routes'

// FirebaseAppProvider
import { FirebaseAppProvider } from 'reactfire';
import firebaseConfig from './utils/firebaseConfig';

// Provider necessário para funcionar o firebase
function App() {
  return (
    <div className="App">
      <FirebaseAppProvider firebaseConfig={firebaseConfig}>
        <Routes />
      </FirebaseAppProvider>
    </div>
  );
}

export default App;
