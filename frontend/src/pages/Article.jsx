import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiShare2, FiFacebook, FiTwitter, FiLinkedin, FiChevronRight, FiBookmark } from 'react-icons/fi';
import Breadcrumb from '../components/Breadcrumb';
import Sidebar from '../components/Sidebar';
import NewsCard from '../components/NewsCard';
import { useNews } from '../context/NewsContext';
import toast from 'react-hot-toast';

const Article = () => {
  const { slug } = useParams();
  const { articles, incrementViewCount, currentUser, saveArticle } = useNews();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      const viewedKey = `viewed_${slug}`;
      if (!sessionStorage.getItem(viewedKey)) {
        incrementViewCount(slug);
        sessionStorage.setItem(viewedKey, 'true');
      }
    }
    window.scrollTo(0, 0);
  }, [slug, incrementViewCount]);

  const article = articles.find(a => a.slug === slug);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = (platform) => {
    const text = encodeURIComponent(`Check out this article: ${article?.title}`);
    const url = encodeURIComponent(shareUrl);
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`;
        break;
      default:
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400,noopener,noreferrer');
    }
  };

  if (!article) {
    return (
      <div className="bg-white min-h-screen text-center py-20 font-black text-slate-300 uppercase tracking-widest">
        Transmission Offline
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | {article.category}</title>
        <meta name="description" content={article.excerpt} />
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* BREADCRUMB HEADER */}
        <div className="max-w-7xl mx-auto px-6 py-4 border-b border-slate-50 mb-6">
            <Breadcrumb items={[
                { label: article.category || 'News', href: `/category/${(article.category || 'India').toLowerCase()}` },
                { label: article.title, href: '#' }
            ]} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative">
          
          {/* STICKY SOCIAL SIDEBAR */}
          <div className="hidden xl:block absolute -left-20 top-0 h-full">
             <div className="sticky top-32 flex flex-col items-center space-y-8 py-8 border-r border-slate-100 pr-8">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] vertical-text mb-4">Share Stories</span>
                <button onClick={() => handleShare('twitter')} className="text-slate-400 hover:text-primary-red transition-colors"><FiTwitter size={20}/></button>
                <button onClick={() => handleShare('facebook')} className="text-slate-400 hover:text-primary-red transition-colors"><FiFacebook size={20}/></button>
                <button onClick={() => handleShare('linkedin')} className="text-slate-400 hover:text-primary-red transition-colors"><FiLinkedin size={20}/></button>
                <div className="h-px w-8 bg-slate-100"></div>
                <div className="flex flex-col items-center space-y-1">
                    <button className="text-slate-400 hover:text-primary-red transition-colors"><FiShare2 size={20}/></button>
                    <span className="text-[9px] font-black text-slate-200">12</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* MAIN COLUMN */}
            <div className="lg:col-span-12 xl:col-span-8 flex flex-col">
              <article className="space-y-8">
                {/* ARTICLE HEADER */}
                <header className="space-y-8">
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <span className="text-primary-red font-black uppercase tracking-[0.4em] text-[10px]">
                            {article.category} News
                        </span>
                        <h1 className="text-3xl md:text-6xl font-black text-slate-900 leading-[1.05] tracking-tighter uppercase italic">
                            {article.title}
                        </h1>
                        <p className="text-slate-500 font-medium text-lg md:text-xl leading-relaxed italic max-w-3xl border-l-2 border-slate-100 pl-6 py-2">
                            {article.excerpt}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 py-12 border-y border-slate-100 gap-10 md:gap-4">
                       <div className="flex items-center space-x-5">
                          <img 
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
                            className="w-16 h-16 rounded-full object-cover grayscale border-2 border-white shadow-xl shadow-slate-200"
                            alt="Author"
                          />
                          <div className="flex flex-col">
                            <span className="text-primary-red text-[11px] font-black uppercase tracking-widest">By {article.author}</span>
                            <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] italic">Editorial Bureau</span>
                          </div>
                       </div>
                       <div className="flex flex-col md:items-center justify-center md:border-x border-slate-100 px-6">
                          <span className="text-slate-900 text-[11px] font-black uppercase tracking-widest mb-1.5 leading-none">Published</span>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] italic">{article.date}</span>
                       </div>
                       <div className="flex flex-col md:items-center justify-center md:border-r border-slate-100 px-6">
                          <span className="text-slate-900 text-[11px] font-black uppercase tracking-widest mb-1.5 leading-none">Read Time</span>
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] italic">
                              {Math.ceil((article.content?.split(' ').length || 0) / 200)} Minute Read
                          </span>
                       </div>
                        <div className="flex flex-col md:items-end justify-center">
                         <span className="text-slate-900 text-[11px] font-black uppercase tracking-widest mb-2 leading-none">Save Story</span>
                         <div className="flex items-center gap-3">
                             <button 
                                 onClick={async () => {
                                     if (!currentUser) {
                                         toast.error('Please login to save articles.');
                                         navigate('/auth');
                                         return;
                                     }
                                     if (currentUser.isBlocked) {
                                         toast.error('Account Restricted.');
                                         return;
                                     }
                                     const res = await saveArticle(article.id);
                                     if (res) toast.success('Story Saved.');
                                 }}
                                 className={`text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2.5 border transition-all duration-300 rounded-[4px] ${
                                     currentUser?.savedArticles?.includes(article.id) 
                                     ? 'bg-primary-red text-white border-primary-red' 
                                     : 'text-slate-400 border-slate-200 hover:text-slate-900 hover:border-slate-900 shadow-sm hover:shadow-md'
                                 }`}
                             >
                                 {currentUser?.savedArticles?.includes(article.id) ? 'Saved' : 'Save'}
                             </button>
                         </div>
                     </div>
                 </div>
               </header>

                {/* HERO MEDIA */}
                <div className="space-y-4">
                  <div className="aspect-video overflow-hidden bg-slate-100 group rounded-[4px]">
                    <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                    />
                  </div>
                  <div className="text-center">
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-300">
                          Photography by Nation Trends India.
                      </span>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="text-slate-800 text-lg sm:text-2xl leading-relaxed font-medium py-12 px-2 sm:px-0 font-serif">
                  {article.content?.split('\n').map((paragraph, idx) => (
                    paragraph.trim() && (
                      <p key={idx} className={`mb-8 last:mb-0 ${idx === 0 ? 'drop-cap' : ''}`}>
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              </article>
            </div>
            
            {/* SIDEBAR */}
            <div className="lg:col-span-12 xl:col-span-4 border-t xl:border-t-0 xl:border-l border-slate-50 pt-16 xl:pt-0 xl:pl-8">
              <div className="sticky top-32">
                <Sidebar category={article.category} />
              </div>
            </div>
          </div>

          {/* RELATED STORIES */}
          <div className="pt-24 mt-24 border-t border-slate-100 pb-24">
            <div className="flex items-center justify-between mb-16 px-4 xl:px-0">
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase relative">
                Related Stories
                <div className="absolute -bottom-3 left-0 w-12 h-1 bg-primary-red"></div>
              </h3>
              <div className="flex space-x-2">
                 <div className="w-2.5 h-2.5 bg-primary-red rounded-full"></div>
                 <div className="w-2.5 h-2.5 bg-slate-100 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {articles
                .filter(a => a.id !== article.id && a.category === article.category)
                .slice(0, 4)
                .map((rel) => (
                  <NewsCard key={rel.id} article={rel} variant="medium" />
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Article;
