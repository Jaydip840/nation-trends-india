
const Loader = () => {
  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center animate-fade-in transition-all duration-500">
      <div className="relative w-20 h-20 flex items-center justify-center">
        {/* Modern Spinning Ring */}
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-primary-red border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        
        {/* Centered Logo Text */}
        <div className="text-primary-blue font-black text-xl tracking-tighter animate-pulse">NT</div>
      </div>
      <div className="mt-8">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">Loading...</span>
      </div>
    </div>
  );
};

export default Loader;
