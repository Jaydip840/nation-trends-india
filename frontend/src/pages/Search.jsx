import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import NewsCard from '../components/NewsCard';
import Breadcrumb from '../components/Breadcrumb';
import { useNews } from '../context/NewsContext';

const Search = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  const { articles } = useNews();
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    if (query && articles.length > 0) {
      const searchTerm = query.toLowerCase().trim();
      const filtered = articles.filter(article => 
        article.title?.toLowerCase().includes(searchTerm) || 
        article.excerpt?.toLowerCase().includes(searchTerm) ||
        article.category?.toLowerCase().includes(searchTerm) ||
        article.content?.toLowerCase().includes(searchTerm)
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, articles]);

  return (
    <>
      <Helmet>
        <title>Search: {query || 'Narratives'} | Nation Trends India</title>
      </Helmet>

      <div className="bg-[#fcfcfd] min-h-screen pb-32">
        <Breadcrumb items={[{ label: 'Search Results', href: '#' }]} />

        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16">
          <div className="border-b border-slate-100 pb-12 mb-12">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-4">Search Results For</span>
            <h1 className="text-3xl md:text-7xl font-black text-slate-900 tracking-tightest uppercase mb-4 leading-none italic">
              "{query || 'Everything'}"
            </h1>
            <p className="text-slate-500 font-medium text-sm italic">
              Found {results.length} verified {results.length === 1 ? 'narrative' : 'narratives'} matching your investigation.
            </p>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {results.map((article) => (
                <NewsCard key={article.id} article={article} variant="medium" />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center bg-white rounded-[16px] border border-slate-50 shadow-sm">
              <div className="max-w-md mx-auto space-y-6">
                <span className="block text-5xl opacity-20">??</span>
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Zero Narratives Match</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                  Our archives do not currently contain a verified report matching your query. Please broaden your investigative terms.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Search;
