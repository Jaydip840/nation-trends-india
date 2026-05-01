import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { NewsProvider } from './context/NewsContext'
import { HelmetProvider } from 'react-helmet-async'
import { GoogleOAuthProvider } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = "935042482901-kra0im5fkb0g1t2pjnhvuk2t5p9eg8mj.apps.googleusercontent.com";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <NewsProvider>
          <App />
        </NewsProvider>
      </GoogleOAuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
