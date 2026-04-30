import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import { useNews } from '../context/NewsContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBarLoader from '../components/TopBarLoader';
import Newsletter from '../components/Newsletter';

const Layout = () => {
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      const totalHeight = documentHeight - windowHeight;
      const progress = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);

      setShowScrollUp(scrollY > 300);
      setShowScrollDown(scrollY + windowHeight < documentHeight - 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Check initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isAuth = location.pathname === '/auth';
  const isMinimal = isAdmin || isAuth;

  return (
    <div className="flex flex-col min-h-screen bg-white selection:bg-primary-red/10 selection:text-primary-red">
      {/* GLOBAL PROGRESS BAR */}
      <div 
        className="fixed top-0 left-0 h-[2px] bg-primary-red z-[9999] transition-all duration-150 ease-out" 
        style={{ width: `${scrollProgress}%` }}
      />
      
      <TopBarLoader />
      {!isAdmin && <Navbar />}
      
      {/* Main Content */}
      <main className={`flex-grow w-full relative z-10 ${isMinimal ? '' : 'pt-8 pb-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto'}`}>
         <Outlet />
      </main>
      
      {!isMinimal && <Newsletter />}
      {!isMinimal && <Footer />}

      {/* Floating Action Buttons */}
      {!isAdmin && (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex flex-col space-y-2">
          <button 
            onClick={scrollToTop}
            className={`bg-slate-900 text-white p-3 md:p-4 shadow-2xl hover:bg-primary-red transition-all duration-300 focus:outline-none rounded-[4px] ${showScrollUp ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
            aria-label="Scroll to top"
          >
            <FiArrowUp className="text-base md:text-lg" />
          </button>
          
          <button 
            onClick={scrollToBottom}
            className={`bg-slate-900 text-white p-3 md:p-4 shadow-2xl hover:bg-primary-red transition-all duration-300 focus:outline-none rounded-[4px] ${showScrollDown ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}
            aria-label="Scroll to bottom"
          >
            <FiArrowDown className="text-base md:text-lg" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Layout;
