import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';
import 'react-datepicker/dist/react-datepicker.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
      <Toaster
        position="top-center" // Changed from default (top-center is usually default but explicit here) or bottom-right
        toastOptions={{
          style: {
            background: '#1e293b', // surface-800
            color: '#f1f5f9', // surface-100
            border: '1px solid #334155', // surface-700
            padding: '16px',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#10b981', // success-500
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444', // danger-500
              secondary: '#1e293b',
            },
          },
        }}
      />
    </ThemeProvider>
  </React.StrictMode>
);
