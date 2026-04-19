import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiMenu, FiX, FiUser, FiLogOut, FiLayout, FiShield, FiChevronDown } from 'react-icons/fi';
import { useNews } from '../context/NewsContext';
import ConfirmModal from './ConfirmModal';

const categories = ['India', 'World', 'Politics', 'Technology', 'Business', 'Entertainment', 'Sports'];

const Navbar = () => {
  const { currentUser, logout } = useNews();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setIsSearchOpen(false);
    setCategoriesOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  const handleConfirmLogout = () => {
    logout();
    setMobileMenuOpen(false);
    setIsLogoutModalOpen(false);
    navigate('/');
  };

  return (
    <>
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Admin Logout"
        message="Are you sure you want to end your administrative session? You will be returned to the public homepage."
      />

      <header
        className={`sticky top-0 z-50 transition-all duration-500 w-full backdrop-blur-md bg-white/90 ${isScrolled ? 'shadow-lg shadow-gray-200/50 py-3' : 'shadow-sm py-5'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          {/* LOGO (DESKTOP) */}
          <Link to="/" className="hidden md:flex items-center group">
            <div className="flex items-center justify-center bg-primary-red w-10 h-10 mr-3 shadow-md shadow-red-200 transform group-hover:rotate-12 group-hover:scale-110 transition duration-300 rounded-[4px]">
              <span className="text-white font-black text-xl tracking-tighter">NT</span>
            </div>
            <span className="text-2xl font-extrabold text-gray-900 tracking-tight flex flex-col leading-none">
              <span className="group-hover:text-primary-red transition duration-300">Nation Trends</span>
              <span className="text-sm font-bold text-primary-blue tracking-[0.2em] mt-0.5">INDIA</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden md:flex space-x-10 items-center">
            <Link to="/" className="text-slate-900 hover:text-primary-red font-black transition-all duration-500 text-[11px] uppercase tracking-[0.4em] relative">
                HOME
            </Link>

            <div
              className="relative py-4"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                className={`text-[11px] font-black uppercase tracking-[0.4em] transition-all duration-500 flex items-center gap-2 relative ${categoriesOpen ? 'text-primary-red' : 'text-slate-900 hover:text-primary-red'}`}
              >
                CATEGORIES
                <FiChevronDown className={`w-3 h-3 transition-transform duration-500 ${categoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* MINIMALIST CATEGORY DROPDOWN */}
              <div className={`absolute top-full left-1/2 -translate-x-1/2 w-[400px] pt-4 z-50 transition-all duration-500 ease-in-out ${categoriesOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <div className="bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-50 overflow-hidden rounded-[4px]">
                    <div className="p-8 grid grid-cols-2 gap-y-4 gap-x-8">
                        {categories.map((cat, idx) => (
                            <Link
                                key={idx}
                                to={`/category/${cat.toLowerCase()}`}
                                className="group flex items-center gap-3 py-2 px-3 hover:bg-slate-50 transition-all active:scale-95"
                            >
                                <div className="w-1.5 h-1.5 bg-slate-200 group-hover:bg-primary-red transition-colors"></div>
                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] group-hover:text-primary-red transition-all">
                                    {cat}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
              </div>
            </div>

            <Link to="/about" className="text-slate-900 hover:text-primary-red font-black transition-all duration-500 text-[11px] uppercase tracking-[0.4em]">
              ABOUT
            </Link>
            <Link to="/contact" className="text-slate-900 hover:text-primary-red font-black transition-all duration-500 text-[11px] uppercase tracking-[0.4em]">
              CONTACT
            </Link>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-slate-400 hover:text-slate-900 transition-colors"><FiSearch size={20} /></button>

            {currentUser ? (
              <div className="flex items-center space-x-4">
                {currentUser.role === 'admin' ? (
                  <Link to="/admin" className="text-white bg-slate-900 px-6 py-2.5 font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors rounded-[4px]">Admin Panel</Link>
                ) : (
                  <div className="bg-slate-50 border border-slate-100 px-6 py-2.5 flex items-center gap-2 rounded-[4px]">
                    <FiShield className="text-primary-red" size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{currentUser.name}</span>
                  </div>
                )}
                <button onClick={() => setIsLogoutModalOpen(true)} className="text-slate-300 hover:text-primary-red transition-colors"><FiLogOut size={20} /></button>
              </div>
            ) : (
              <Link to="/auth" className="text-white bg-primary-red px-8 py-3 font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_10px_20px_-5px_rgba(229,62,62,0.3)] hover:bg-red-700 transition-all duration-300 transform active:scale-95 rounded-[4px]">LOGIN / SIGNUP</Link>
            )}
          </div>

          {/* MOBILE INTERFACE */}
          <div className="md:hidden flex items-center justify-between w-full">
            <div className="flex items-center space-x-3">
              {currentUser && (
                <Link to={currentUser.role === 'admin' ? '/admin' : '/auth'} className="w-10 h-10 bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900 shadow-sm transition-all active:scale-90 rounded-[4px]">
                  <FiUser size={18} />
                </Link>
              )}

              <Link to="/" className="flex items-center ml-1 group" onClick={() => setMobileMenuOpen(false)}>
                <div className="flex items-center justify-center bg-primary-red w-9 h-9 mr-2 shadow-md shadow-red-200 transform group-hover:rotate-12 transition duration-300 rounded-[4px]">
                  <span className="text-white font-black text-sm tracking-tighter">NT</span>
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-lg font-black text-slate-900 tracking-tighter italic group-hover:text-primary-red transition-colors">Nation Trends</span>
                  <span className="text-[8px] font-black text-primary-red tracking-[0.3em] mt-0.5">INDIA</span>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className={`w-10 h-10 flex items-center justify-center transition-all rounded-[4px] ${isSearchOpen ? 'bg-primary-red text-white' : 'bg-gray-50 text-slate-500'}`}
              >
                {isSearchOpen ? <FiX size={18} /> : <FiSearch size={18} />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="w-10 h-10 bg-gray-50 flex items-center justify-center text-slate-900 active:scale-95 transition-all rounded-[4px]"
              >
                {mobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* REVERTED MOBILE MENU (SIMPLE DROPDOWN) */}
        <div className={`md:hidden absolute w-full left-0 top-full bg-white border-b border-slate-100 shadow-xl transition-all duration-500 overflow-hidden ${mobileMenuOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-6 py-8 flex flex-col space-y-6">
               <Link to="/" className="text-slate-900 font-black text-sm uppercase tracking-[0.3em] relative flex items-center gap-3 p-4 transition-all active:scale-95 active:bg-slate-50 group border-b border-slate-50">
                 <div className="w-2 h-2 bg-primary-red group-active:scale-150 transition-transform"></div>
                 HOME
               </Link>
               <div className="space-y-4 px-4 py-2">
                  <span className="text-slate-300 font-black text-[9px] uppercase tracking-[0.4em] block pl-2">Categories</span>
                  <div className="grid grid-cols-2 gap-3">
                     {categories.map(cat => (
                        <Link key={cat} to={`/category/${cat.toLowerCase()}`} className="text-slate-600 font-extrabold text-[10px] uppercase tracking-[0.2em] p-3 border border-slate-50 hover:border-primary-red transition-all active:scale-90 active:bg-slate-50 active:text-primary-red rounded-[4px]">
                           {cat}
                        </Link>
                     ))}
                  </div>
               </div>
               <div className="pt-2 border-t border-slate-50 flex flex-col">
                  <Link to="/about" className="text-slate-900 font-black text-sm uppercase tracking-[0.3em] relative flex items-center gap-3 p-4 transition-all active:scale-95 active:bg-slate-50 group border-b border-slate-50">
                    <div className="w-2 h-2 bg-slate-200 group-active:bg-primary-red transition-all"></div>
                    ABOUT
                  </Link>
                  <Link to="/contact" className="text-slate-900 font-black text-sm uppercase tracking-[0.3em] relative flex items-center gap-3 p-4 transition-all active:scale-95 active:bg-slate-50 group border-b border-slate-50">
                    <div className="w-2 h-2 bg-slate-200 group-active:bg-primary-red transition-all"></div>
                    CONTACT
                  </Link>
                 <Link to="/privacy-policy" className="text-slate-900 font-black text-sm uppercase tracking-[0.3em] p-4 transition-all active:scale-95 active:bg-slate-50 border-b border-slate-50">Privacy Policy</Link>
                 
                 <div className="p-4">
                  {currentUser ? (
                      <div className="flex flex-col space-y-4">
                          <div className="flex items-center gap-3 py-4 border-b border-slate-50">
                              <FiUser className="text-primary-red" size={20}/>
                              <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{currentUser.name}</span>
                          </div>
                          {currentUser.role === 'admin' && (
                              <Link to="/admin" className="text-emerald-500 font-black text-sm uppercase tracking-widest p-2">Admin Panel</Link>
                          )}
                          <button onClick={() => setIsLogoutModalOpen(true)} className="text-primary-red font-black text-sm uppercase tracking-widest text-left p-4 hover:bg-red-50 transition-all active:scale-95 rounded-[4px]">Logout</button>
                      </div>
                    ) : (
                      <Link to="/auth" className="w-full py-5 bg-slate-900 text-white font-black text-sm uppercase tracking-[0.3em] text-center shadow-lg active:scale-95 transition-all block rounded-[4px]">
                        Login / Signup
                      </Link>
                    )}
                 </div>
            </div>
          </div>
        </div>

        <div className={`absolute left-0 w-full bg-white/98 backdrop-blur-2xl border-b border-slate-100 transition-all duration-700 ease-in-out origin-top transform ${isSearchOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`} style={{ zIndex: -1 }}>
          <div className="max-w-4xl mx-auto px-6 py-12">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                autoFocus={isSearchOpen}
                placeholder="Search..."
                className="w-full bg-slate-50/50 px-10 py-5 border border-slate-100 focus:border-primary-red focus:bg-white focus:ring-0 outline-none transition-all text-slate-800 text-xl font-bold placeholder:text-slate-200 placeholder:font-black placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-xs rounded-[4px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-red transition-colors">
                <FiSearch size={24}/>
              </button>
              <div className="absolute -bottom-2 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent opacity-50"></div>
            </form>
            <div className="mt-4 flex items-center justify-center gap-4">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Trending:</span>
               {['Politics', 'Markets', 'Elections'].map(tag => (
                 <button key={tag} onClick={() => {setSearchQuery(tag); }} className="text-[10px] font-bold text-slate-400 hover:text-primary-red transition-colors uppercase tracking-widest underline decoration-slate-200 underline-offset-4">{tag}</button>
               ))}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
