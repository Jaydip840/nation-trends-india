
const Loader = ({ isExiting }) => {
  return (
    <div className={`fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center border-b border-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.15)] ${isExiting ? 'animate-slide-up-out pointer-events-none' : 'animate-fade-in'}`}>
      <div className="flex flex-col items-center animate-pulse-subtle will-change-transform will-change-opacity relative z-10">
        <div className="relative flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-[1.2em] text-slate-200 mb-3">Please Stand By</span>
          <h1 className="text-2xl md:text-3xl font-black text-slate-950 uppercase italic tracking-tighter flex items-center gap-3">
            <span className="text-primary-red">LOADING</span>
            <div className="w-1.5 h-1.5 bg-primary-red rounded-full animate-ping"></div>
          </h1>
        </div>
      </div>

      {/* Website Name at Bottom Center - Layered Design */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="relative flex items-center justify-center">
          {/* Big Red INDIA Watermark */}
          <span className="text-4xl md:text-6xl font-black uppercase tracking-widest text-primary-red/10 absolute whitespace-nowrap select-none">
            India
          </span>
          {/* Sharp Small NATION TRENDS */}
          <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.8em] text-slate-950 relative z-10 whitespace-nowrap">
            Nation Trends
          </span>
        </div>
      </div>

      {/* Full Width Bottom Progress Line */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-slate-50 overflow-hidden">
        <div className="h-full bg-primary-red animate-loading-bar will-change-transform" style={{ animationDuration: '3s' }}></div>
      </div>
    </div>
  );
};

export default Loader;
