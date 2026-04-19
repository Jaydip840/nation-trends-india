import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import NewsCard from '../components/NewsCard';
import Sidebar from '../components/Sidebar';
import Breadcrumb from '../components/Breadcrumb';
import { useNews } from '../context/NewsContext';

const Category = () => {
  const { name } = useParams();
  const { articles } = useNews();

  const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
  const categoryArticles = articles.filter(a => a.category?.toLowerCase() === name?.toLowerCase());

  return (
    <>
      <Helmet>
        <title>{formattedName} News | Nation Trends India</title>
        <meta name="description" content={`Latest ${formattedName} news from Nation Trends India.`} />
      </Helmet>

      <Breadcrumb items={[
        { label: formattedName, href: '#' }
      ]} />

      <div className="mb-8 pb-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-black flex items-center text-gray-900 tracking-tighter">
            <span className="w-1 h-10 rounded-full bg-primary-red mr-4"></span>
            {formattedName} News
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-bold uppercase tracking-widest">{categoryArticles.length} Stories available</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 xl:col-span-8">
          {categoryArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categoryArticles.map((article, index) => (
                <NewsCard key={index} article={article} variant="medium" />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[16px] border border-dashed border-gray-200">
              <span className="text-gray-400 font-black uppercase tracking-[0.2em] text-xs">No articles in this category yet.</span>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Sidebar category={formattedName} />
        </div>
      </div>
    </>
  );
};

export default Category;
