import { Helmet } from 'react-helmet-async';
import NewsCard from '../components/NewsCard';
import Sidebar from '../components/Sidebar';
import CategorySection from '../components/CategorySection';
import { useNews } from '../context/NewsContext';

const Home = () => {
  const { articles, breakingNews } = useNews();

  const breakingArticles = (articles || []).filter(a => a.placement === 'Breaking').sort((a, b) => new Date(b.date) - new Date(a.date));
  const standardArticles = (articles || []).filter(a => a.placement !== 'Breaking').sort((a, b) => new Date(b.date) - new Date(a.date));

  // Determine Hero article (only from Breaking if available)
  const hasBreaking = breakingArticles.length > 0;
  const heroArticle = hasBreaking ? breakingArticles[0] : null;

  // Secondary articles: other breaking ones first, then standard ones
  const secondaryArticles = hasBreaking
    ? [...breakingArticles.slice(1), ...standardArticles].slice(0, 4)
    : standardArticles.slice(0, 4);

  const getCategoryArticles = (cat) => (articles || []).filter(a => a.category?.toLowerCase() === cat.toLowerCase()).sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <Helmet>
        <title>Nation Trends India | Latest News, Breaking Stories & Deep Analysis</title>
        <meta name="description" content="Nation Trends India provides the latest news, breaking stories, and deep analysis on politics, business, technology, sports and culture from India and the world." />
        <meta name="keywords" content="news, india news, world news, politics, technology, business news, climate, sports news, entertainment, nation trends india" />
        <link rel="canonical" href="https://nation-trends-india.vercel.app" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://nation-trends-india.vercel.app" />
        <meta property="og:title" content="Nation Trends India | Latest News & Deep Analysis" />
        <meta property="og:description" content="The Pulse of a New India. Stay updated with the latest narratives in politics, business, and technology." />
        <meta property="og:image" content="https://nation-trends-india.vercel.app/og-card.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Nation Trends India | Latest News" />
        <meta name="twitter:description" content="The Pulse of a New India. Breaking stories and deep analysis." />
        <meta name="twitter:image" content="https://nation-trends-india.vercel.app/og-card.png" />

        {/* Structured Data (JSON-LD) */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Nation Trends India",
            "url": "https://nation-trends-india.vercel.app",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://nation-trends-india.vercel.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      {/* Breaking News Ticker */}
      <div className="bg-slate-950 text-white flex items-center mb-6 md:mb-10 shadow-xl overflow-hidden border-y border-white/5">
        <span className="font-black uppercase tracking-widest text-[8px] md:text-[9px] mr-3 md:mr-6 whitespace-nowrap bg-primary-red text-white px-4 md:px-6 py-1.5 md:py-2 shadow-lg z-10 block italic">
          BREAKING
        </span>
        <div className="overflow-hidden w-full relative h-8 md:h-10 flex items-center">
          <p className="absolute whitespace-nowrap animate-marquee text-[10px] md:text-[11px] font-black tracking-widest uppercase text-white" style={{ animationDuration: '40s' }}>
            {breakingNews ? (
              <>
                <span className="text-primary-red mr-4">//</span> {breakingNews}
                <span className="mx-20 text-primary-red opacity-50">///</span>
                <span className="text-primary-red mr-4">//</span> {breakingNews}
              </>
            ) : (
              "/// LATEST NARRATIVES INCOMING /// STAND BY FOR SIGNAL ///"
            )}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <section className="relative z-10 mb-16 md:mb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left/Main Column - Hero Section */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-16">
            {heroArticle ? (
              <>
                <NewsCard article={heroArticle} variant="large" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  {secondaryArticles.map((article) => (
                    <NewsCard key={article?._id || article?.id} article={article} variant="medium" />
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {standardArticles.slice(0, 6).map((article) => (
                  <NewsCard key={article?._id || article?.id} article={article} variant="medium" />
                ))}
              </div>
            )}
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
          {["India", "World", "Politics", "Technology", "Business", "Entertainment", "Sports", "Investigation", "Exclusive", "Climate", "Culture"].map(catName => {
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
