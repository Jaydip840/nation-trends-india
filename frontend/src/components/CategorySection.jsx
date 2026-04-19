import { Link } from 'react-router-dom';
import NewsCard from './NewsCard';

const CategorySection = ({ title, categorySlug, articles, linkText = 'View All' }) => {
  return (
    <div className="mb-12 md:mb-16 relative px-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 md:mb-10 border-l-4 border-primary-red pl-6">
        <h2 className="text-2xl md:text-3xl font-black flex items-center text-gray-900 tracking-tighter uppercase">
          {title}
        </h2>
        <Link 
          to={`/category/${categorySlug}`} 
          className="text-[10px] w-full sm:w-auto text-center justify-center font-black bg-slate-900 hover:bg-primary-red text-white px-8 py-3 transition-all duration-300 flex items-center shadow-lg uppercase tracking-widest active:scale-95 rounded-[4px]"
        >
          {linkText} <span className="ml-2 text-lg leading-none">&rarr;</span>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {articles.slice(0, 4).map((article, index) => (
          <NewsCard key={index} article={article} variant="medium" />
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
