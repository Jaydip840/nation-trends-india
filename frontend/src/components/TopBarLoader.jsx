import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TopBarLoader = () => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Start loading
    setVisible(true);
    setProgress(30);

    const timer1 = setTimeout(() => {
      setProgress(70);
    }, 200);

    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setTimeout(() => setProgress(0), 300);
      }, 400);
    }, 600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [location.pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div 
      className="fixed top-0 left-0 z-[10000] h-[3px] bg-primary-red transition-all duration-500 ease-out"
      style={{ 
        width: `${progress}%`,
        opacity: visible ? 1 : 0,
        boxShadow: '0 0 10px rgba(225, 29, 72, 0.4)'
      }}
    />
  );
};

export default TopBarLoader;
