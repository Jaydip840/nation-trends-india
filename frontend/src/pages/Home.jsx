import { Helmet } from 'react-helmet-async';
import NewsCard from '../components/NewsCard';
import Sidebar from '../components/Sidebar';
import CategorySection from '../components/CategorySection';
import { useNews } from '../context/NewsContext';

const Home = () => {
  const { articles } = useNews();
  
  const featuredArticle = articles?.[0] || {};
  const secondaryArticles = articles?.slice(1, 4) || [];
  
  const getCategoryArticles = (cat) => articles?.filter(a => a.category?.toLowerCase() === cat.toLowerCase()) || [];

  return (
    <>
      <Helmet>
        <title>Nation Trends India | Latest News, Breaking Stories & Analysis</title>
        <meta name="description" content="Nation Trends India provides the latest news, breaking stories, and deep analysis on politics, business, technology, and more from India and the world." />
      </Helmet>

      {/* Breaking News Ticker */}
      <div className="bg-gradient-to-r from-primary-red to-red-600 text-white p-0.5 flex items-center mb-10 shadow-sm overflow-hidden border border-red-500/30 rounded-[4px]">
        <span className="font-extrabold uppercase tracking-widest text-xs mr-4 whitespace-nowrap bg-white text-primary-red px-6 py-2 shadow-sm z-10 block italic rounded-[4px]">BREAKING</span>
        <div className="overflow-hidden w-full relative h-7 flex items-center">
          <p className="absolute whitespace-nowrap animate-marquee text-sm font-black tracking-wide text-white/90" style={{ animationDuration: '30s' }}>
            {useNews().breakingNews} <span className="mx-20 text-white/30 italic">///</span> {useNews().breakingNews} <span className="mx-20 text-white/30 italic">///</span>
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="relative z-10 mb-16 md:mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left/Main Column - Hero Section */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            <NewsCard article={featuredArticle} variant="large" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
              {secondaryArticles.map((article, idx) => (
                <NewsCard key={idx} article={article} variant="medium" />
              ))}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4">
            <Sidebar />
          </div>
        </div>
      </section>

      {/* Categories Grid - 2 per row */}
      <section className="relative z-20 mb-12">
        <div className="grid grid-cols-1 gap-y-10 lg:gap-y-12">
          {["India", "Business", "Technology", "World", "Sports", "Entertainment", "Politics"].map(catName => {
            const catArticles = getCategoryArticles(catName);
            if (catArticles.length === 0) return null;
            return (
              <CategorySection 
                key={catName}
                title={catName.includes('India') ? 'India News' : catName} 
                categorySlug={catName.toLowerCase()} 
                articles={catArticles} 
              />
            );
          })}
        </div>
      </section>
    </>
  );
};

export default Home;
