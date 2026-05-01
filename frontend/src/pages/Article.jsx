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
  const { articles, incrementViewCount, currentUser, saveArticle, unsaveArticle } = useNews();
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
        Article Not Found
      </div>
    );
  }

  return (
    <>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{article.metaTitle || article.title} | Nation Trends India</title>
        <meta name="description" content={article.metaDescription || article.subheadline || article.excerpt} />
        <meta name="keywords" content={article.tags || `${article.category}, news, india, ${article.title}`} />
        <link rel="canonical" href={shareUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:title" content={article.metaTitle || article.title} />
        <meta property="og:description" content={article.metaDescription || article.subheadline || article.excerpt} />
        <meta property="og:image" content={article.image} />
        <meta property="og:site_name" content="Nation Trends India" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={shareUrl} />
        <meta name="twitter:title" content={article.metaTitle || article.title} />
        <meta name="twitter:description" content={article.metaDescription || article.subheadline || article.excerpt} />
        <meta name="twitter:image" content={article.image} />

        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": article.title,
            "image": [article.image],
            "datePublished": new Date(article.createdAt || Date.now()).toISOString(),
            "dateModified": new Date(article.updatedAt || Date.now()).toISOString(),
            "author": [{
              "@type": "Person",
              "name": article.author || "JC",
              "url": `${shareUrl.split('/article/')[0]}/profile`
            }],
            "publisher": {
              "@type": "Organization",
              "name": "Nation Trends India",
              "logo": {
                "@type": "ImageObject",
                "url": "https://nation-trends-india.vercel.app/nt-favicon.png"
              }
            },
            "description": article.metaDescription || article.subheadline || article.excerpt
          })}
        </script>
      </Helmet>

      <div className="bg-white min-h-screen">
        {/* BREADCRUMB HEADER */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 border-b border-slate-50 mb-8">
            <Breadcrumb items={[
                { label: article.category || 'News', href: `/category/${(article.category || 'India').toLowerCase()}` },
                { label: article.title, href: '#' }
            ]} />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
          
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

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
            {/* MAIN COLUMN */}
            <div className="md:col-span-12 xl:col-span-8 flex flex-col">
              <article className="space-y-8">
                {/* ARTICLE HEADER */}
                <header className="space-y-8">
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <span className="text-primary-red font-black uppercase tracking-[0.4em] text-[10px]">
                            {article.category} News
                        </span>
                        <h1 className="text-2xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter uppercase italic">
                            {article.title}
                        </h1>
                        {article.subheadline && (
                          <h2 className="text-base md:text-xl font-bold text-slate-500 leading-relaxed tracking-tight max-w-4xl pt-2">
                             {article.subheadline}
                          </h2>
                        )}
                        <p className="text-slate-400 font-medium text-sm md:text-lg leading-relaxed italic max-w-4xl border-l-2 border-slate-100 pl-6 py-2 mt-4">
                            {article.excerpt}
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 py-8 md:py-12 border-y border-slate-100 gap-y-8 gap-x-4 md:gap-4">
                       <div className="flex items-center space-x-3 md:space-x-5 col-span-2 md:col-span-1 border-b md:border-b-0 pb-6 md:pb-0 border-slate-50">
                          <img 
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
                            className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover grayscale border-2 border-white shadow-xl shadow-slate-200"
                            alt="Author"
                          />
                          <div className="flex flex-col">
                            <span className="text-primary-red text-[10px] md:text-[11px] font-black uppercase tracking-widest">By {article.author}</span>
                            <span className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] italic">Editorial Team</span>
                          </div>
                       </div>
                       <div className="flex flex-col md:items-center justify-center md:border-x border-slate-100 pr-4 md:px-6">
                          <span className="text-slate-900 text-[10px] md:text-[11px] font-black uppercase tracking-widest mb-1 leading-none">Published</span>
                          <span className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] italic">{article.date}</span>
                       </div>
                       <div className="flex flex-col md:items-center justify-center md:border-r border-slate-100 pl-4 md:px-6 border-l border-slate-100 md:border-l-0 text-right md:text-center">
                          <span className="text-slate-900 text-[10px] md:text-[11px] font-black uppercase tracking-widest mb-1 leading-none">Read Time</span>
                          <span className="text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] italic">
                              {article.readingTime || (Math.ceil((typeof article.content === 'string' ? article.content?.split(' ').length : 0) || 0) / 200) + ' min read'}
                          </span>
                       </div>
                        <div className="flex flex-col items-center md:items-end justify-center col-span-2 md:col-span-1 pt-6 md:pt-0 border-t md:border-t-0 border-slate-50">
                         <span className="text-slate-900 text-[10px] md:text-[11px] font-black uppercase tracking-widest mb-2 leading-none">Save Story</span>
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
                                     
                                     const isSaved = currentUser.savedArticles?.includes(article.id);
                                     if (isSaved) {
                                         await unsaveArticle(article.id);
                                     } else {
                                         await saveArticle(article.id);
                                     }
                                 }}
                                 className={`text-[10px] font-black uppercase tracking-[0.2em] px-8 md:px-5 py-2.5 border transition-all duration-300 rounded-[4px] ${
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

                  {/* MOBILE SHARE BAR */}
                  <div className="xl:hidden flex items-center justify-between py-6 border-b border-slate-100">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share Story:</span>
                    <div className="flex items-center gap-6">
                      <button onClick={() => handleShare('twitter')} className="text-slate-400 hover:text-primary-red transition-colors"><FiTwitter size={18}/></button>
                      <button onClick={() => handleShare('facebook')} className="text-slate-400 hover:text-primary-red transition-colors"><FiFacebook size={18}/></button>
                      <button onClick={() => handleShare('linkedin')} className="text-slate-400 hover:text-primary-red transition-colors"><FiLinkedin size={18}/></button>
                      <button className="text-slate-400 hover:text-primary-red transition-colors"><FiShare2 size={18}/></button>
                    </div>
                  </div>
                </header>

                {/* HERO MEDIA */}
                <div className="space-y-4 -mx-4 md:mx-0">
                  <div className="aspect-video overflow-hidden bg-slate-100 group md:rounded-[4px]">
                    <img 
                        src={article.image} 
                        alt={article.imageAlt || article.title} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
                    />
                  </div>
                  {article.imageCaption && (
                      <div className="text-center">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">
                            {article.imageCaption}
                        </span>
                      </div>
                   )}
                </div>

                {/* KEY HIGHLIGHTS */}
                {article.highlights && article.highlights.length > 0 && article.highlights.some(h => h.trim() !== '') && (
                  <div className="mt-12 p-8 lg:p-10 bg-slate-50 border-l-4 border-primary-red rounded-sm">
                    <h4 className="text-[10px] font-black text-primary-red uppercase tracking-[0.4em] mb-6 italic">Strategic Highlights</h4>
                    <ul className="space-y-4">
                      {article.highlights.filter(h => h.trim() !== '').map((h, i) => (
                        <li key={i} className="flex gap-4 items-start">
                          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full mt-1.5 flex-shrink-0"></div>
                          <p className="text-sm md:text-base text-slate-700 font-bold leading-tight">{h}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CONTENT ENGINE */}
                <div className="space-y-12 py-12">
                  {Array.isArray(article.content) ? (
                    article.content.map((block, index) => (
                      <div key={index} className="animate-fade-in">
                        {(block.type === 'heading' || block.type === 'subheading') && (
                          <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-tight mt-12 mb-6">
                            {block.text}
                          </h3>
                        )}
                        
                        {block.type === 'paragraph' && (
                          <p className={`text-slate-700 text-base md:text-lg lg:text-[1.2rem] leading-relaxed md:leading-relaxed font-medium font-serif mb-6 md:mb-10 ${index === 0 ? 'drop-cap' : ''}`}>
                            {block.text}
                          </p>
                        )}

                        {block.type === 'faq' && block.items && (
                          <div className="my-12 space-y-8 bg-slate-50 p-6 md:p-12 border-y border-slate-100 -mx-4 md:mx-0">
                             <h4 className="text-[11px] font-black text-primary-red uppercase tracking-[0.4em] mb-6 flex items-center gap-4">
                               <div className="w-8 h-px bg-primary-red"></div>
                               Frequently Asked Questions
                             </h4>
                             <div className="space-y-10">
                                {block.items.map((faq, i) => (
                                  <div key={i} className="space-y-3">
                                    <div className="flex gap-4">
                                      <span className="text-primary-red font-black italic">Q.</span>
                                      <h5 className="text-[1.1rem] md:text-xl font-bold text-slate-900 leading-snug">{faq.q}</h5>
                                    </div>
                                    <div className="flex gap-4 pl-7">
                                      <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed font-serif">{faq.a}</p>
                                    </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                        )}

                        {block.type === 'quote' && (
                          <div className="my-12 py-8 border-l-4 border-primary-red pl-10">
                            <blockquote className="text-2xl md:text-3xl font-black text-slate-900 italic tracking-tighter leading-[1.1]">
                              "{block.text}"
                            </blockquote>
                            {block.author && (
                              <cite className="block mt-6 text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 not-italic">
                                — {block.author}
                              </cite>
                            )}
                          </div>
                        )}

                        {(block.type === 'image' || block.type === 'subimage') && block.url && (
                          <div className="my-16 space-y-4 -mx-4 md:mx-0">
                            <div className="md:rounded-[4px] overflow-hidden bg-slate-50">
                              <img src={block.url} alt={block.caption} className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-[1500ms]" />
                            </div>
                            {block.caption && (
                              <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">
                                {block.caption}
                              </p>
                            )}
                          </div>
                        )}

                        {block.type === 'list' && block.items && (
                          <ul className="space-y-6 my-12">
                            {block.items.filter(item => typeof item === 'string' && item.trim()).map((item, i) => (
                              <li key={i} className="flex gap-6 items-start">
                                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-950 text-white flex items-center justify-center text-[10px] font-black">
                                  {i + 1}
                                </span>
                                <span className="text-base md:text-lg font-medium text-slate-700 leading-relaxed font-serif">
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-800 text-base md:text-lg lg:text-[1.2rem] leading-relaxed md:leading-relaxed font-medium font-serif">
                      {article.content?.split('\n').map((paragraph, idx) => (
                        paragraph.trim() && (
                          <p key={idx} className={`mb-6 md:mb-10 last:mb-0 ${idx === 0 ? 'drop-cap' : ''}`}>
                            {paragraph}
                          </p>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </article>
            </div>
            
            {/* SIDEBAR */}
            <div className="md:col-span-12 xl:col-span-4 border-t xl:border-t-0 xl:border-l border-slate-50 pt-12 xl:pt-0 xl:pl-8">
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
