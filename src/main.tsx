import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { AuthProvider } from '@/src/context/AuthContext';
import { ThemeProvider } from '@/src/context/ThemeContext';
import { testConnection } from '@/src/services/firestoreService';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for PWA
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </StrictMode>,
);

testConnection();
