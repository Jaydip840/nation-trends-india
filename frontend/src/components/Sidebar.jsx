import { useState } from 'react';
import NewsCard from './NewsCard';
import { useNews } from '../context/NewsContext';

const Sidebar = ({ category }) => {
  const { articles, addSubscriber } = useNews();
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (addSubscriber(email)) {
      setToast('Successfully subscribed!');
      setEmail('');
    } else {
      setToast('Already subscribed!');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const sortedArticles = [...articles].sort((a, b) => {
    if (a.isTrending && !b.isTrending) return -1;
    if (!a.isTrending && b.isTrending) return 1;
    return (b.views || 0) - (a.views || 0);
  });
  const filteredArticles = category 
    ? sortedArticles.filter(a => a.category !== undefined && a.category.toLowerCase() === category.toLowerCase())
    : sortedArticles;
  const trendingArticles = filteredArticles.slice(0, 4);

  return (
    <aside className="space-y-6 h-full sticky top-24 px-2">
      
      <div className="bg-white p-6 rounded-[16px] border border-slate-100 shadow-sm">
        <h3 className="text-[10px] font-black mb-6 flex items-center text-slate-400 tracking-[0.4em] uppercase">
          <span className="w-6 h-[2px] bg-primary-red mr-3" inline="block"></span>
          Top Narratives
        </h3>
        <div className="space-y-7">
          {trendingArticles.map((article, idx) => (
            <a 
              href={`/article/${article.slug}`} 
              key={idx} 
              className="group flex gap-4 items-start"
            >
              <span className="text-3xl font-black text-slate-100 group-hover:text-primary-red transition-all duration-500 leading-none select-none">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <div className="space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {article.category}
                </span>
                <h4 className="text-sm font-black text-slate-900 leading-tight uppercase tracking-tight group-hover:text-primary-blue transition-colors line-clamp-2">
                  {article.title}
                </h4>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 p-6 rounded-[16px] text-white overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-red/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary-red/20 transition-all duration-700"></div>
        
        <h3 className="text-xl font-black mb-4 flex items-center tracking-tight uppercase">
          Newsletter.
        </h3>
        <p className="text-slate-400 text-xs font-medium mb-6 leading-relaxed">
          Join 50k+ daily readers. Get the most critical narratives delivered to your terminal.
        </p>
        <form className="space-y-4 relative z-10" onSubmit={handleSubscribe}>
          {toast && (
            <div className="absolute -top-12 left-0 w-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-3 rounded-xl animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl flex items-center justify-center">
              {toast}
            </div>
          )}
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Identity Email" 
            className="w-full px-5 py-4 bg-white/10 border border-white/10 rounded-[8px] focus:outline-none focus:border-white/30 transition text-sm font-bold placeholder:text-slate-500"
            required
          />
          <button 
            type="submit" 
            className="w-full bg-primary-red hover:bg-red-700 text-white font-black py-4 rounded-[8px] transition-all duration-300 active:scale-95 text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-red-900/20"
          >
            Subscribe Now
          </button>
        </form>
      </div>
      
    </aside>
  );
};

export default Sidebar;
