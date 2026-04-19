import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';

const Breadcrumb = ({ items, isDark = false }) => {
  const baseClasses = isDark ? "text-slate-500" : "text-gray-500";
  const activeClasses = isDark ? "text-white" : "text-gray-800";
  const hoverClasses = isDark ? "hover:text-emerald-400" : "hover:text-primary-blue";
  const separatorClasses = isDark ? "text-slate-700" : "text-gray-400";

  return (
    <nav className={`w-full ${baseClasses} mb-6 border-b border-transparent bg-transparent overflow-hidden`} aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-2">
        <ol className="flex items-center space-x-2 text-[12px] md:text-[13px] font-black uppercase tracking-[0.2em] whitespace-nowrap overflow-x-auto scrollbar-hide">
          <li className="flex-shrink-0">
            <Link to="/" className={`inline-flex items-center ${hoverClasses} transition`}>
              <FiHome className="mr-2" size={12} />
              Home
            </Link>
          </li>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} className="flex-shrink-0 flex items-center">
                <FiChevronRight className={`mx-2 ${separatorClasses}`} />
                {isLast ? (
                  <span className={`${activeClasses} md:ml-1`}>{item.label}</span>
                ) : (
                  <Link to={item.href} className={`md:ml-1 ${hoverClasses} transition`}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
