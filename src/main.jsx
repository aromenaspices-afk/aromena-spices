import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './i18n'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 3000,
        style: {
          fontFamily: 'Amiri, serif',
          fontSize: '0.9rem',
          borderRadius: '12px',
          padding: '12px 20px',
          direction: 'rtl',
        },
        success: {
          style: {
            background: '#F0FDF4',
            color: '#16A34A',
            border: '1px solid #BBF7D0',
          },
          iconTheme: {
            primary: '#16A34A',
            secondary: '#fff',
          },
        },
        error: {
          style: {
            background: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FCA5A5',
          },
          iconTheme: {
            primary: '#DC2626',
            secondary: '#fff',
          },
        },
      }}
    />
  </React.StrictMode>
)