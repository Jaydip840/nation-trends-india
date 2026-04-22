import { useEffect, useState } from 'react';
import { useNews } from '../context/NewsContext';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiShield, FiLogOut, FiBookmark, FiChevronRight, FiMapPin, FiActivity, FiTrash2 } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import ConfirmModal from '../components/ConfirmModal';

const Profile = () => {
    const { currentUser, logout, articles, unsaveArticle } = useNews();
    const navigate = useNavigate();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleConfirmLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        if (!currentUser) {
            navigate('/auth');
        }
    }, [currentUser, navigate]);

    if (!currentUser) return null;

    const savedArticles = articles.filter(art => currentUser.savedArticles?.includes(art._id));

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-40">
            <Helmet>
                <title>{currentUser.name} | User Profile | Nation Trends India</title>
                <meta name="description" content="View your account details and saved articles." />
            </Helmet>

            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleConfirmLogout}
                title="Log Out"
                message="Are you sure you want to log out of your account?"
            />

            {/* Profile Header: Pure Minimalism */}
            <div className="bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-32">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
                        <div className="flex items-start lg:items-center gap-8 lg:gap-12">
                            <div className="relative group">
                                <div className="w-24 h-24 lg:w-32 lg:h-32 bg-slate-950 flex items-center justify-center text-white rounded-sm shadow-2xl relative overflow-hidden">
                                     <FiUser size={40} className="relative z-10" />
                                     <div className="absolute inset-0 bg-primary-red translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-emerald-500 w-6 h-6 rounded-full border-4 border-white"></div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-widest rounded-sm border border-slate-200">Verified Account</span>
                                    <span className="px-3 py-1 bg-primary-red text-white text-[8px] font-black uppercase tracking-widest rounded-sm">{currentUser.authMethod || 'Standard Login'}</span>
                                </div>
                                <h1 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">{currentUser.name}</h1>
                                <p className="text-sm font-bold text-slate-400 italic">Official Member</p>
                            </div>
                        </div>

                        <button 
                            onClick={() => setIsLogoutModalOpen(true)}
                            className="hidden lg:flex items-center gap-3 px-8 py-4 bg-white border border-slate-200 text-slate-950 rounded-sm font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all duration-500 group"
                        >
                            <FiLogOut className="group-hover:translate-x-1 transition-transform" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT COLUMN: INTEL DATA */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white p-8 lg:p-10 rounded-sm border border-slate-100 shadow-sm space-y-10">
                            <div className="space-y-2 border-b border-slate-50 pb-6 text-left">
                                <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.5em]">Account Details</h4>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Personal and login information</p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-sm">
                                        <FiMail size={16} />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-xs font-black text-slate-950 underline decoration-primary-red/30 cursor-pointer">{currentUser.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-sm">
                                        <FiCalendar size={16} />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Joined Date</p>
                                        <p className="text-xs font-black text-slate-950 uppercase">
                                            {new Date(currentUser.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-sm">
                                        <FiShield size={16} />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Account Role</p>
                                        <p className="text-xs font-black text-slate-950 uppercase tracking-widest text-primary-red">{currentUser.role || 'MEMBER'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="w-10 h-10 bg-slate-50 flex items-center justify-center text-slate-400 rounded-sm">
                                        <FiActivity size={16} />
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
                                        <p className="text-xs font-black text-slate-950 uppercase">
                                            {currentUser.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString() : 'Active Now'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-950 p-10 rounded-sm text-white space-y-6 relative overflow-hidden group">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-primary-red -mr-16 -mt-16 rounded-full opacity-20 blur-2xl group-hover:opacity-40 transition-opacity"></div>
                             <h5 className="text-[10px] font-black uppercase tracking-[0.4em] relative z-10 text-slate-400">Account Status</h5>
                             <p className="text-xl font-black italic tracking-tighter relative z-10">"Verified user of the Nation Trends India community."</p>
                             <div className="pt-4 relative z-10">
                                <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 border border-slate-700 rounded-full">Pro Member</span>
                             </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SAVED ARTICLES */}
                    <div className="lg:col-span-8 space-y-8">
                         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1 text-left px-2">
                                <h3 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter">Your Saved Articles</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Articles and reports you've saved for later</p>
                            </div>
                            <div className="flex items-center gap-2 bg-white px-6 py-2 border border-slate-100 rounded-full shadow-sm self-start sm:self-center">
                                <FiBookmark className="text-primary-red" size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-950">{savedArticles.length} Saved</span>
                            </div>
                         </div>

                         {savedArticles.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-slate-100 rounded-sm py-24 px-12 text-center group">
                                <div className="w-16 h-16 bg-slate-50 flex items-center justify-center text-slate-200 rounded-full mx-auto mb-6 group-hover:bg-primary-red group-hover:text-white transition-colors duration-500">
                                    <FiBookmark size={24} />
                                </div>
                                <h4 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter mb-2">No Saved Articles</h4>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest max-w-[200px] mx-auto leading-relaxed">Save articles while browsing to access them here quickly.</p>
                                <button onClick={() => navigate('/')} className="mt-8 px-8 py-3 bg-slate-950 text-white rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-primary-red transition duration-300">Explore News</button>
                            </div>
                         ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {savedArticles.map(article => (
                                    <div 
                                        key={article._id} 
                                        onClick={() => navigate(`/article/${article.slug}`)}
                                        className="bg-white rounded-sm border border-slate-100 shadow-sm overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-700"
                                    >
                                        <div className="relative aspect-video overflow-hidden">
                                            <img src={article.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-100 group-hover:scale-110" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-primary-red text-white text-[7px] font-black px-2 py-1 uppercase tracking-widest rounded-sm">{article.category}</span>
                                            </div>
                                            {/* UNSAVE ACTION */}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    unsaveArticle(article._id);
                                                }}
                                                className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:border-red-500"
                                                title="Unsave Article"
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                        <div className="p-8 space-y-4 text-left">
                                            <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                                <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                <span>SAVED ARTICLE</span>
                                            </div>
                                            <h4 className="text-lg font-black text-slate-950 uppercase italic tracking-tighter leading-tight group-hover:text-primary-red transition-colors limit-2-lines">{article.title}</h4>
                                            <div className="pt-4 flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-900 group-hover:gap-4 transition-all">
                                                <span>Read Full Article</span>
                                                <FiChevronRight className="text-primary-red" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
