import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Article from './pages/Article';
import Category from './pages/Category';
import Search from './pages/Search';
import About from './pages/About';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import ScrollToTop from './components/ScrollToTop';

import { useEffect } from 'react';
import { useNews } from './context/NewsContext';
import Loader from './components/Loader';
import { Toaster } from 'react-hot-toast';

const SiteVisitTracker = ({ children }) => {
  const { incrementSiteVisit } = useNews();
  
  useEffect(() => {
    if (!sessionStorage.getItem('nti_visited')) {
      incrementSiteVisit();
      sessionStorage.setItem('nti_visited', 'true');
    }
  }, [incrementSiteVisit]);

  return children;
};

function App() {
  const { initialLoading } = useNews();

  return (
    <SiteVisitTracker>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#ffffff',
            color: '#0f172a',
            borderRadius: '8px',
            padding: '16px 24px',
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
            border: '1px solid #f1f5f9',
            maxWidth: '400px',
          },
          success: {
            style: {
              borderLeft: '4px solid #0f172a',
            },
            iconTheme: {
              primary: '#0f172a',
              secondary: '#ffffff',
            },
          },
          error: {
            style: {
              borderLeft: '4px solid #E53E3E',
            },
            iconTheme: {
              primary: '#E53E3E',
              secondary: '#ffffff',
            },
          },
        }}
      />
      
      {initialLoading && <Loader />}
      
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="article/:slug" element={<Article />} />
            <Route path="category/:name" element={<Category />} />
            <Route path="search" element={<Search />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="privacy-policy" element={<Legal type="Privacy Policy" />} />
            <Route path="terms" element={<Legal type="Terms & Conditions" />} />
            <Route path="disclaimer" element={<Legal type="Disclaimer" />} />
            <Route path="admin" element={<Admin />} />
            <Route path="auth" element={<Auth />} />
          </Route>
        </Routes>
      </Router>
    </SiteVisitTracker>
  );
}

export default App;
