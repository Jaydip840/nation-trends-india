const AdPlaceholder = ({ type = 'banner', className = '' }) => {
  const getStyles = () => {
    switch (type) {
      case 'header':
        return 'w-full h-24 md:h-28';
      case 'sidebar':
        return 'w-full h-64 md:h-[600px]';
      case 'in-article':
        return 'w-full h-48 md:h-64 my-6';
      case 'banner':
      default:
        return 'w-full h-32 my-4';
    }
  };

  return (
    <div className={`bg-gray-100 border border-gray-200 border-dashed flex items-center justify-center text-gray-400 text-sm font-medium ${getStyles()} ${className}`}>
      <div className="text-center">
        <span className="block mb-1 text-gray-500">Advertisement placeholder ({type})</span>
        <span className="text-xs">Google AdSense Space</span>
      </div>
    </div>
  );
};

export default AdPlaceholder;
