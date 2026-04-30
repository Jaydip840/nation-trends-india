import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiArrowUpRight, FiShield } from 'react-icons/fi';
import { useNews } from '../context/NewsContext';

const Footer = () => {
  const { siteSettings } = useNews();
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-white mt-auto border-t-[10px] border-primary-red selection:bg-white selection:text-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* BRAND COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-4">
                <Link to="/" className="flex items-center group">
                    <div className="flex items-center justify-center bg-primary-red w-12 h-12 mr-4 shadow-xl shadow-red-900/20 transform group-hover:rotate-12 transition duration-500 rounded-[4px]">
                        <span className="text-white font-black text-2xl tracking-tighter">NT</span>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-2xl font-black tracking-tighter uppercase italic text-white group-hover:text-primary-red transition-all">Nation Trends</span>
                        <span className="text-xs font-black text-primary-red tracking-[0.4em] mt-1">INDIA</span>
                    </div>
                </Link>
                <p className="text-slate-400 text-sm leading-relaxed font-medium italic max-w-sm border-l-2 border-slate-700 pl-6 py-2">
                    "The Pulse of a New India. Your trusted source for news, analysis, and lifestyle stories in the modern age."
                </p>
            </div>

            <div className="flex items-center gap-6">
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-primary-red transition-all duration-300 rounded-[4px] group">
                    <FiFacebook className="text-slate-400 group-hover:text-white transition-colors" size={18} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-primary-red transition-all duration-300 rounded-[4px] group">
                    <FiTwitter className="text-slate-400 group-hover:text-white transition-colors" size={18} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-primary-red transition-all duration-300 rounded-[4px] group">
                    <FiInstagram className="text-slate-400 group-hover:text-white transition-colors" size={18} />
                </a>
                <a href="#" className="w-10 h-10 flex items-center justify-center bg-slate-800 hover:bg-primary-red transition-all duration-300 rounded-[4px] group">
                    <FiYoutube className="text-slate-400 group-hover:text-white transition-colors" size={18} />
                </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-red italic mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'About Us', 'Contact'].map((item) => (
                <li key={item}>
                    <Link 
                        to={item === 'Home' ? '/' : (item === 'About Us' ? '/about' : `/${item.toLowerCase().replace(' ', '-')}`)} 
                        className="text-[11px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:pl-2 transition-all duration-300"
                    >
                        {item}
                    </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CATEGORIES */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-red italic mb-4">Categories</h4>
            <div className="grid grid-cols-1 gap-y-2">
              {['India', 'World', 'Politics', 'Business', 'Technology', 'Entertainment', 'Sports'].map((cat) => (
                <Link 
                    key={cat} 
                    to={`/category/${cat.toLowerCase()}`} 
                    className="flex justify-between items-center group border-b border-slate-800 pb-1"
                >
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors">
                        {cat}
                    </span>
                    <FiArrowUpRight className="text-slate-600 group-hover:text-primary-red transition-all transform group-hover:translate-x-1 group-hover:-translate-y-1" size={12} />
                </Link>
              ))}
            </div>
          </div>

          {/* CONTACT INFO */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary-red italic mb-4">Contact Us</h4>
            <div className="bg-slate-800/50 p-4 border border-slate-800 rounded-[4px] space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Site Status: Online</span>
                </div>
                <div className="space-y-2">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5 italic">Email Address</span>
                        <span className="text-[10px] font-bold text-slate-300">{siteSettings.email}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5 italic">Head Office</span>
                        <span className="text-[10px] font-bold text-slate-300 leading-tight">{siteSettings.address}</span>
                    </div>
                    <div className="flex flex-col gap-1 pt-2 text-[10px] font-bold text-slate-400">
                        <Link to="/contact" className="hover:text-primary-red transition-all">Report Leak</Link>
                        <Link to="/support" className="hover:text-primary-red transition-all">Support Desk</Link>
                        <Link to="/legal" className="hover:text-primary-red transition-all">Legal Panel</Link>
                    </div>
                </div>
                <Link to="/auth" className="flex items-center justify-center gap-3 w-full py-3 bg-slate-900 border border-slate-700 hover:border-primary-red transition-all duration-500 group rounded-[4px]">
                    <FiShield className="text-primary-red" size={12} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Member Login</span>
                </Link>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-8">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">
                &copy; {currentYear} {siteSettings.title}
            </span>
            <Link to="/legal" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-[0.4em] transition-colors">Legal Panel</Link>
            <div className="h-1 w-1 bg-slate-700 rounded-full hidden md:block"></div>
            <Link to="/privacy-policy" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-[0.4em] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-[0.4em] transition-colors">Terms of Use</Link>
          </div>
          
          <button 
            onClick={handleScrollToTop}
            className="group flex items-center gap-4 text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-[0.5em] transition-all"
          >
            Back to Top
            <div className="w-10 h-10 flex items-center justify-center bg-slate-800 group-hover:bg-primary-red transition-all rounded-[4px]">
                <FiArrowUpRight className="transform -rotate-45" size={14} />
            </div>
          </button>
        </div>
      </div>
      
      {/* DECORATIVE BAR */}
      <div className="h-1 w-full flex">
         <div className="flex-1 bg-primary-red"></div>
         <div className="flex-1 bg-slate-900"></div>
         <div className="flex-1 bg-primary-red"></div>
         <div className="flex-1 bg-slate-900"></div>
         <div className="flex-1 bg-primary-red"></div>
      </div>
    </footer>
  );
};

export default Footer;
