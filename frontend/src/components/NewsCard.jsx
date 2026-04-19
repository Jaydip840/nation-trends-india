import { Link } from 'react-router-dom';

const NewsCard = ({ article, variant = 'medium' }) => {
  const { title, slug, image, date, author, excerpt } = article || {};
  const category = article?.category || 'India';
  const articleLink = `/article/${slug}`;

  if (variant === 'large') {
    return (
      <div className="group transition duration-500 bg-transparent flex flex-col relative border-b border-slate-100 pb-10 mb-10 last:border-0 last:mb-0 last:pb-0">
        <Link to={articleLink} className="relative w-full pb-[60%] overflow-hidden block rounded-[4px]">
          <img 
            src={image} 
            alt={title} 
            className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition duration-1000 ease-out"
            loading="lazy"
          />
          <span className="absolute top-0 left-0 bg-primary-red text-white text-[9px] font-black px-5 py-2 uppercase tracking-[0.2em] z-10 rounded-br-[4px]">
            {category}
          </span>
        </Link>
        <div className="pt-6 md:pt-8 flex flex-col">
          <Link to={articleLink}>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-3 group-hover:text-primary-red transition-all duration-500 line-clamp-3 leading-[0.85] italic uppercase tracking-tightest">
              {title}
            </h2>
          </Link>
          <div className="w-10 h-0.5 bg-primary-red mb-4"></div>
          <p className="text-slate-500 mb-4 line-clamp-3 text-base md:text-lg leading-relaxed font-medium italic max-w-2xl">{excerpt}</p>
          <div className="flex items-center text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
            <span className="text-slate-900 mr-4 border-b border-slate-100 pb-0.5">{author}</span>
            <span className="opacity-20 mr-4">/</span>
            <span className="tracking-widest">{date}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'small') {
    return (
      <div className="group flex items-start gap-5 bg-transparent p-0 transition duration-300">
        <Link to={articleLink} className="relative flex-shrink-0 w-28 h-28 overflow-hidden block rounded-[4px]">
          <img 
            src={image} 
            alt={title} 
            className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-110 transition duration-700" 
            loading="lazy"
          />
        </Link>
        <div className="flex flex-col flex-grow min-w-0 pt-0.5">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary-red mb-1.5 block">{category}</span>
          <Link to={articleLink} className="block">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-primary-red transition duration-300 line-clamp-2 leading-tight tracking-[0.02em] uppercase mb-1.5">
              {title}
            </h3>
          </Link>
          <div className="w-6 h-[2.5px] bg-primary-red mb-2"></div>
          <p className="text-slate-400 text-[10px] line-clamp-2 mb-2 leading-relaxed font-medium italic">{excerpt}</p>
          <div className="text-[8px] text-slate-300 font-black uppercase tracking-widest block truncate">
            {date}
          </div>
        </div>
      </div>
    );
  }

  // medium variant (default)
  return (
    <div className="group transition duration-500 bg-transparent flex flex-col border-b border-slate-50 pb-6 last:border-0 last:pb-0">
      <Link to={articleLink} className="relative w-full pb-[72%] overflow-hidden block rounded-[4px]">
        <img 
          src={image} 
          alt={title} 
          className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
          loading="lazy"
        />
        <span className="absolute top-0 left-0 bg-slate-900 text-white text-[8px] font-black px-4 py-1.5 uppercase tracking-[0.2em] group-hover:bg-primary-red transition-colors z-10 font-[serif] italic rounded-br-[4px]">
          {category}
        </span>
      </Link>
      <div className="pt-5 flex flex-col flex-grow">
        <Link to={articleLink}>
          <h3 className="text-lg font-black text-slate-900 mb-2.5 group-hover:text-primary-red transition duration-500 line-clamp-2 leading-tight tracking-tight uppercase">
            {title}
          </h3>
        </Link>
        <div className="w-8 h-0.5 bg-primary-red mb-3"></div>
        <p className="text-slate-500 text-[11px] line-clamp-2 mb-3 leading-relaxed font-medium italic">{excerpt}</p>
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
          <span className="text-slate-900 truncate mr-4 italic">{author}</span>
          <span className="flex-shrink-0 opacity-50">{date}</span>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
