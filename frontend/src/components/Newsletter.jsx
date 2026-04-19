import { useNews } from '../context/NewsContext';
import { useNavigate } from 'react-router-dom';
import { FiShare2, FiShield, FiUserCheck, FiMessageSquare } from 'react-icons/fi';

const Newsletter = () => {
  const { currentUser } = useNews();
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white py-32 relative overflow-hidden border-t border-slate-100">
       {/* Background Ornamental Elements */}
       <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-red rounded-full blur-[120px]"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-red rounded-full blur-[120px]"></div>
       </div>
       
       <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              
              {/* Left Column: Branding & Voice */}
              <div className="space-y-12">
                  <div className="space-y-8 text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-4">
                          <div className="w-12 h-[1px] bg-primary-red"></div>
                          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400">Join the Pulse.</span>
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none flex flex-col">
                          <span>Stay</span>
                          <span className="text-primary-red">Informed.</span>
                      </h2>
                      <p className="text-slate-500 font-medium text-base md:text-lg leading-relaxed max-w-lg italic">
                          Join the next generation of investigative readers. Get high-impact professional updates and expert perspectives directly from our central bureau.
                      </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pt-10 border-t border-slate-50">
                      <div className="flex flex-col items-center lg:items-start space-y-3">
                          <FiShield className="text-primary-red" size={24} />
                          <p className="text-slate-900 text-[10px] font-black uppercase tracking-widest leading-tight">Verified <br/> Intelligence</p>
                      </div>
                      <div className="flex flex-col items-center lg:items-start space-y-3">
                          <FiUserCheck className="text-primary-red" size={24} />
                          <p className="text-slate-900 text-[10px] font-black uppercase tracking-widest leading-tight">Member <br/> Privilege</p>
                      </div>
                      <div className="flex flex-col items-center lg:items-start space-y-3">
                          <FiMessageSquare className="text-primary-red" size={24} />
                          <p className="text-slate-900 text-[10px] font-black uppercase tracking-widest leading-tight">Expert <br/> Commentary</p>
                      </div>
                  </div>
              </div>

              {/* Right Column: Interactive Portal Card */}
              <div className="flex justify-center lg:justify-end">
                   <div className="w-full max-w-md bg-slate-50 border border-slate-100 rounded-[40px] p-10 md:p-14 space-y-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] relative group transition-all duration-700 hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.08)]">
                       <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-primary-red rounded-full animate-pulse shadow-[0_0_10px_2px_rgba(229,62,62,0.4)]"></div>
                       
                       <div className="space-y-6 text-center">
                           <div className="relative w-24 h-24 mx-auto">
                               <div className="absolute inset-0 bg-white rounded-full shadow-inner"></div>
                               <div className="absolute inset-2 border-2 border-slate-50 border-t-primary-red rounded-full group-hover:rotate-180 transition-transform duration-1000"></div>
                               <div className="absolute inset-0 flex items-center justify-center">
                                   <FiUserCheck size={36} className="text-slate-900 group-hover:text-primary-red transition-colors" />
                               </div>
                           </div>
                           <div className="space-y-2">
                               <h4 className="text-slate-900 font-black text-2xl uppercase tracking-tight">
                                  {currentUser ? 'VERIFIED MEMBER' : 'IDENTITY PORTAL'}
                               </h4>
                               <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
                                  {currentUser ? `Welcome back, ${currentUser.name}` : 'Sign up to authenticate your access'}
                                </p>
                           </div>
                       </div>

                       <div className="space-y-4">
                           <button 
                             onClick={() => !currentUser && navigate('/auth')}
                             className="w-full bg-slate-900 hover:bg-primary-red text-white font-black py-6 rounded-2xl transition-all duration-500 active:scale-95 text-[12px] uppercase tracking-[0.4em] shadow-xl group-hover:translate-y-[-4px]"
                             disabled={!!currentUser}
                           >
                               {currentUser ? 'ACCESS GRANTED' : 'JOIN NOW'}
                           </button>
                           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center italic">
                               Join 2.4 Million Verified Readers
                           </p>
                       </div>
                   </div>
              </div>
          </div>
       </div>
    </div>
  );
};

export default Newsletter;
