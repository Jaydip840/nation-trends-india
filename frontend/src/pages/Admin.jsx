import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiLogOut, FiCheck, FiX, FiLayout, FiFileText, FiSettings, FiImage, FiActivity, FiUsers, FiEye, FiSearch, FiSave, FiArrowLeft, FiCpu, FiCopy, FiZap, FiClock, FiShield, FiMenu, FiMessageSquare, FiMail } from 'react-icons/fi';
import { useNews } from '../context/NewsContext';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const Admin = () => {
  const {
    articles, siteVisits, subscribers, users, currentUser, login, logout,
    addArticle, updateArticle, deleteArticle, toggleBlockUser,
    siteSettings, updateSiteSettings, breakingNews, updateBreakingNews, deleteMessage, messages
  } = useNews();
  const [activeTab, setActiveTab ] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({ ...siteSettings });
  const [tempBreakingNews, setTempBreakingNews] = useState(breakingNews);

  useEffect(() => {
    setTempSettings({ ...siteSettings });
    setTempBreakingNews(breakingNews);
  }, [siteSettings, breakingNews]);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Editor State
  const [isEditing, setIsEditing] = useState(false);

  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'India',
    image: '',
    excerpt: '',
    content: '',
    author: 'Admin',
    status: 'Published',
    isTrending: false,
    tags: '',
    sourceUrl: ''
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8000000) { 
        toast.error("Image is too large. Please select a smaller file.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const slug = formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const articleData = {
      ...formData,
      slug,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    if (isEditing) {
      updateArticle(editId, articleData);
      toast.success('Article updated successfully.');
      setIsEditing(false);
      setEditId(null);
    } else {
      addArticle(articleData);
      toast.success('New article published.');
    }

    setFormData({ title: '', category: 'India', image: '', excerpt: '', content: '', author: 'Admin', status: 'Published', isTrending: false, tags: '', sourceUrl: '' });
    setActiveTab('articles');
  };

  const startEdit = (article) => {
    setFormData({
      title: article.title,
      category: article.category,
      image: article.image,
      excerpt: article.excerpt,
      content: article.content,
      author: article.author || 'Admin',
      status: article.status || 'Published',
      isTrending: article.isTrending || false,
      tags: article.tags || '',
      sourceUrl: article.sourceUrl || ''
    });
    setEditId(article.id);
    setIsEditing(true);
    setActiveTab('editor');
  };

  const generateAiArticle = async () => {
    if (!aiPrompt) {
      toast.error('Please enter a topic for the AI.');
      return;
    }
    setIsAiGenerating(true);
    
    // Simulate AI Processing Time
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Intelligence mapping for categories
    const promptLower = aiPrompt.toLowerCase();
    let category = 'India';
    if (promptLower.includes('tech') || promptLower.includes('phone') || promptLower.includes('ai')) category = 'Technology';
    else if (promptLower.includes('world') || promptLower.includes('global') || promptLower.includes('international')) category = 'World';
    else if (promptLower.includes('polit') || promptLower.includes('election')) category = 'Politics';
    else if (promptLower.includes('business') || promptLower.includes('market') || promptLower.includes('money')) category = 'Business';
    else if (promptLower.includes('entertainment') || promptLower.includes('movie') || promptLower.includes('star')) category = 'Entertainment';
    else if (promptLower.includes('sport') || promptLower.includes('cricket') || promptLower.includes('game')) category = 'Sports';

    // Simulated Smart Generation
    // In a real app, you would fetch from OpenAI/Gemini here.
    const generatedArticle = {
      title: `Exclusive: How ${aiPrompt.charAt(0).toUpperCase() + aiPrompt.slice(1)} Is Shaping the Future of India`,
      excerpt: `An in-depth investigation into how ${aiPrompt} is currently impacting the socio-economic landscape and what experts are predicting for the next decade.`,
      category: category,
      image: `https://images.unsplash.com/photo-1504711432869-9d39d71ee242?auto=format&fit=crop&q=80&w=1200&h=800&q=${encodeURIComponent(aiPrompt)}`,
      content: `In a groundbreaking development that has captured the nation's attention, the story of ${aiPrompt} marks a significant turning point for India's evolving narrative. Experts and industry leaders are closely monitoring the situation as it unfolds in real-time across major urban centers and rural heartlands alike.\n\nAccording to several high-level reports, the impact of these changes is expected to resonate for years to come. "We are witnessing a structural shift in how information and progress are calculated," notes NTI analysts. This move comes at a time when the country is increasingly looking toward modern solutions for age-old challenges.\n\nAs we delve deeper into the layers of this story, it becomes clear that there are multiple stakeholders involved, each with a unique perspective on the outcome. While some remain cautious, others are embracing the innovation with open arms. The next 24 to 48 hours will be critical in determining the long-term trajectory of this movement. Nation Trends India will continue to provide live updates as more details emerge from our sources on the ground.`,
      author: 'NTI AI Assistant',
      tags: `${category.toLowerCase()}, india, trending, exclusive`,
      sourceUrl: 'https://nationtrends.com/news/exclusive'
    };

    setFormData(generatedArticle);
    setIsAiGenerating(false);
    setAiPrompt('');
    toast.success('AI Article Generated & Loaded into Editor!');
  };

  const navigate = useNavigate();
  const hasShownError = useRef(false);


  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      if (!hasShownError.current) {
        toast.error('Identity Restriction: Administrative clearance required.');
        hasShownError.current = true;
      }
      navigate('/auth');
    }
  }, [currentUser, navigate]);

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white font-black tracking-widest text-xs uppercase">Connecting to Secure Server...</div>
    </div>;
  }

  const handleSaveSettings = () => {
    updateSiteSettings(tempSettings);
    toast.success('Site settings updated.');
  };

  const handleSaveTicker = () => {
    updateBreakingNews(tempBreakingNews);
    toast.success('Breaking news ticker updated.');
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] flex overflow-hidden relative font-sans selection:bg-primary-red selection:text-white">
      <Helmet><title>Admin Dashboard | Nation Trends India</title></Helmet>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] xl:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside className={`fixed xl:sticky top-0 left-0 w-72 bg-slate-950 text-white flex flex-col h-screen border-r border-slate-800 z-[70] transition-transform duration-500 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}`}>
        <div className="p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-red flex items-center justify-center font-black text-white text-xl rounded-[4px]">NT</div>
            <div className="flex flex-col leading-none">
              <span className="font-black text-lg tracking-tight uppercase italic">Admin</span>
              <span className="text-[8px] font-black text-primary-red uppercase tracking-[0.4em] mt-1">NATION TRENDS</span>
            </div>
          </div>
          <button className="xl:hidden text-slate-500 hover:text-white transition" onClick={() => setMobileMenuOpen(false)}>
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex-grow px-6 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          <Link to="/" className="w-full mb-8 flex items-center space-x-3 px-4 py-3 rounded-[4px] bg-slate-900 text-slate-400 hover:text-white transition duration-300 font-black text-[10px] uppercase tracking-widest border border-slate-800">
            <FiArrowLeft size={14} /> <span>View Website</span>
          </Link>

          {[
            { id: 'dashboard', label: 'Dashboard', icon: FiActivity },
            { id: 'articles', label: 'All Stories', icon: FiFileText },
            { id: 'users', label: 'Accounts', icon: FiUsers },
            { id: 'newsletter', label: 'Subscribers', icon: FiMail },
            { id: 'messages', label: 'Contact Messages', icon: FiMessageSquare },
            { id: 'settings', label: 'Settings', icon: FiSettings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-4 px-4 py-4 transition duration-300 font-bold text-xs rounded-[4px] ${activeTab === item.id || (activeTab === 'editor' && item.id === 'articles') ? 'bg-primary-red text-white shadow-xl shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              <item.icon size={18} />
              <span className="flex-grow text-left uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-800">
          <button onClick={() => setIsLogoutModalOpen(true)} className="w-full flex items-center justify-center space-x-3 bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white py-4 rounded-[4px] font-black text-[10px] uppercase tracking-widest transition duration-500 border border-slate-800">
            <FiLogOut /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={logout}
        title="Logout"
        message="Are you sure you want to end your session?"
      />

      {/* MAIN CONTENT */}
      <main className="flex-grow h-screen overflow-y-auto w-full">
        
        {/* HEADER */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 lg:px-10 py-5 lg:py-6 flex flex-row items-center justify-between z-40 bg-white">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden p-2 bg-slate-50 border border-slate-100 rounded-[4px] text-slate-600"
            >
              <FiMenu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm lg:text-xl font-black text-slate-950 tracking-tighter uppercase italic leading-none">{activeTab} Panel</h2>
              <div className="flex items-center gap-1.5 mt-0.5 lg:mt-1">
                <div className="w-1 h-1 lg:w-1.5 lg:h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[7px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="relative hidden lg:block">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-[4px] text-xs font-bold focus:ring-0 focus:border-primary-red w-64 transition-all"
              />
            </div>
            <button onClick={() => { setIsEditing(false); setActiveTab('editor'); }} className="bg-slate-950 text-white px-3 lg:px-6 py-2.5 lg:py-3 rounded-[4px] font-black text-[8px] lg:text-[10px] uppercase tracking-widest hover:bg-primary-red transition duration-500 flex items-center gap-1.5">
              <FiPlus size={12} /> <span className="hidden xs:inline">Create</span><span className="xs:hidden">New</span>
            </button>
          </div>
        </header>

        <div className="p-6 lg:p-10">
          
          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Total Views', value: articles.reduce((acc, curr) => acc + (curr.views || 0), 0).toLocaleString(), icon: FiEye, color: 'text-slate-900', bg: 'bg-slate-100' },
                  { label: 'Total Stories', value: articles.length, icon: FiFileText, color: 'text-primary-red', bg: 'bg-red-50' },
                  { label: 'Engagement', value: (((articles.reduce((acc, curr) => acc + (curr.views || 0), 0) / (articles.length || 1)) / 100)).toFixed(1) + '%', icon: FiActivity, color: 'text-slate-900', bg: 'bg-slate-100' },
                  { label: 'Site Visits', value: siteVisits.toLocaleString(), icon: FiUsers, color: 'text-slate-900', bg: 'bg-slate-100' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[4px] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary-red transition duration-500">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">{stat.label}</span>
                      <span className="text-2xl font-black text-slate-950 block tracking-tighter italic uppercase">{stat.value}</span>
                    </div>
                    <div className={`${stat.bg} ${stat.color} w-12 h-12 flex items-center justify-center rounded-[4px] transition duration-500 group-hover:bg-primary-red group-hover:text-white`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[4px] border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
                    <h3 className="text-base font-black text-slate-950 uppercase tracking-widest italic">Latest Activity</h3>
                    <button onClick={() => setActiveTab('articles')} className="text-[10px] font-black text-primary-red uppercase tracking-widest hover:underline">View All Stories</button>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {articles.slice(0, 8).map(art => (
                      <div key={art.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-[4px] transition border border-transparent hover:border-slate-100 group cursor-pointer" onClick={() => startEdit(art)}>
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="w-12 h-12 bg-slate-100 rounded-[4px] overflow-hidden flex-shrink-0">
                             <img src={art.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 text-sm block truncate group-hover:text-primary-red transition italic uppercase">{art.title}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block flex items-center">
                              {art.category} • {art.date}
                            </span>
                          </div>
                        </div>
                        <FiEdit2 size={14} className="text-slate-200 group-hover:text-primary-red transition" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-8 rounded-[4px] text-white flex flex-col justify-between">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-black tracking-tighter uppercase italic">Site Statistics</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Real-time Performance</p>
                    </div>
                    <div className="space-y-6">
                      {[
                        { label: 'Mobile Optimization', val: '98%', color: 'bg-primary-red' },
                        { label: 'Content Depth', val: '85%', color: 'bg-white' },
                        { label: 'System Load', val: '12%', color: 'bg-emerald-500' }
                      ].map((bar, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                            <span>{bar.label}</span>
                            <span className="text-white">{bar.val}</span>
                          </div>
                          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${bar.color} transition-all duration-1000`} style={{ width: bar.val }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-10 pt-8 border-t border-slate-900">
                     <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                       Last archival backup: {new Date().toLocaleTimeString()}
                     </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ARTICLE MANAGER */}
          {activeTab === 'articles' && (
            <div className="animate-fade-in space-y-6">
              {/* DESKTOP TABLE */}
              <div className="hidden lg:block bg-white rounded-[4px] border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                      <tr>
                        <th className="px-8 py-5 text-left">Article Detail</th>
                        <th className="px-8 py-5 text-left">Section</th>
                        <th className="px-8 py-5 text-left">Views</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {articles
                        .filter(art => art.title.toLowerCase().includes(searchTerm.toLowerCase()) || art.category.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((art) => (
                          <tr key={art.id} className="hover:bg-slate-50/50 transition cursor-pointer" onClick={() => startEdit(art)}>
                            <td className="px-8 py-6">
                              <div className="flex items-center space-x-4 min-w-[300px]">
                                <img src={art.image} className="w-12 h-12 rounded-[4px] object-cover grayscale group-hover:grayscale-0 transition" />
                                <div className="min-w-0">
                                  <h4 className="font-black text-slate-900 truncate tracking-tight text-sm uppercase italic">{art.title}</h4>
                                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5 uppercase tracking-widest">{art.date}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="text-[8px] font-black text-primary-red border border-primary-red/20 px-3 py-1 rounded-[4px] uppercase tracking-widest italic">{art.category}</span>
                            </td>
                            <td className="px-8 py-6 font-black text-xs text-slate-600">
                              {art.views || 0}
                            </td>
                            <td className="px-8 py-6 text-right flex justify-end items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button onClick={() => startEdit(art)} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-400 rounded-[4px] hover:bg-slate-900 hover:text-white transition"><FiEdit2 size={12} /></button>
                              <button onClick={() => deleteArticle(art.id)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-400 rounded-[4px] hover:bg-red-600 hover:text-white transition"><FiTrash2 size={12} /></button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="lg:hidden space-y-4">
                {articles
                  .filter(art => art.title.toLowerCase().includes(searchTerm.toLowerCase()) || art.category.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((art) => (
                    <div key={art.id} className="bg-white p-4 rounded-[4px] border border-slate-100 shadow-sm space-y-4">
                      <div className="flex gap-4">
                         <img src={art.image} className="w-16 h-16 rounded-[4px] object-cover flex-shrink-0" />
                         <div className="min-w-0">
                            <h4 className="font-black text-slate-900 text-sm uppercase italic leading-tight mb-1">{art.title}</h4>
                            <div className="flex items-center gap-4">
                               <span className="text-[8px] font-black text-primary-red uppercase tracking-widest italic">{art.category}</span>
                               <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{art.date}</span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{art.views || 0} Views</span>
                          <div className="flex gap-2">
                             <button onClick={() => startEdit(art)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-[4px] text-[10px] font-black uppercase tracking-widest">Edit</button>
                             <button onClick={() => deleteArticle(art.id)} className="px-4 py-2 bg-red-50 text-red-500 rounded-[4px] text-[10px] font-black uppercase tracking-widest">Delete</button>
                          </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* VIEW: EDITOR */}
          {activeTab === 'editor' && (
            <div className="animate-fade-in max-w-4xl mx-auto space-y-8 pb-32">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <button onClick={() => setActiveTab('articles')} className="flex items-center gap-2 text-slate-400 hover:text-primary-red transition font-black text-[10px] uppercase tracking-widest">
                  <FiArrowLeft /> <span>Return to List</span>
                </button>

                <div className="flex items-center bg-slate-900 p-2 rounded-[4px] border border-slate-700 w-full md:w-auto shadow-2xl relative">
                   <div className="absolute -top-1 -right-1 flex gap-1">
                      <span className="w-2 h-2 bg-primary-red rounded-full animate-ping"></span>
                   </div>
                   <input 
                      type="text" 
                      value={aiPrompt}
                      onChange={e => setAiPrompt(e.target.value)}
                      placeholder="Ask AI to write about a topic..." 
                      className="bg-transparent border-none text-white text-[10px] font-bold px-4 focus:ring-0 w-full md:w-64 placeholder:text-slate-600"
                   />
                   <button 
                      onClick={generateAiArticle}
                      disabled={isAiGenerating}
                      className="bg-primary-red text-white px-4 py-2 rounded-[4px] font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-primary-red transition duration-300 flex items-center gap-2 min-w-[120px] justify-center"
                   >
                     {isAiGenerating ? <><FiCpu className="animate-spin" /> Working...</> : <><FiZap /> AI Write</>}
                   </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[4px] border border-slate-100 shadow-sm space-y-10">
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Headline</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required className="w-full px-8 py-6 bg-slate-50 border-b-2 border-slate-100 rounded-[4px] focus:bg-white focus:border-primary-red outline-none transition font-black text-2xl tracking-tight text-slate-950 uppercase italic" placeholder="The news headline..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">News Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full px-6 py-4 bg-slate-50 border-b border-slate-100 rounded-[4px] focus:bg-white focus:border-primary-red outline-none transition font-bold text-sm text-slate-900 cursor-pointer">
                      <option>India</option><option>World</option><option>Politics</option><option>Technology</option><option>Business</option><option>Entertainment</option><option>Sports</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Featured Placement</label>
                    <button type="button" onClick={() => setFormData({ ...formData, isTrending: !formData.isTrending })} className={`w-full py-4 rounded-[4px] transition duration-300 font-black text-[10px] uppercase tracking-widest border ${formData.isTrending ? 'bg-primary-red text-white border-primary-red' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}>
                      {formData.isTrending ? 'Featured on Home' : 'Standard Placement'}
                    </button>
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Image URL</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                            required
                            className="flex-grow px-6 py-4 bg-slate-50 border-b border-slate-100 rounded-[4px] focus:bg-white focus:border-primary-red outline-none transition font-bold text-xs"
                            placeholder="https://images.unsplash.com/..."
                        />
                        <label className="shrink-0 bg-slate-950 text-white px-6 flex items-center justify-center font-black text-[9px] uppercase tracking-widest cursor-pointer rounded-[4px] hover:bg-primary-red transition">
                            Upload
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Short Summary (Excerpt)</label>
                  <textarea value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} required rows="2" className="w-full px-8 py-6 bg-slate-50 border-b border-slate-100 rounded-[4px] focus:bg-white focus:border-primary-red outline-none transition font-medium text-base resize-none" placeholder="A brief summary for the homepage..."></textarea>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Full Content (Use Enter for Paragraphs)</label>
                  </div>
                  <textarea value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required rows="12" className="w-full px-8 py-8 bg-slate-50 border-b border-slate-100 rounded-[4px] focus:bg-white focus:border-primary-red outline-none transition font-medium text-lg resize-none text-slate-700 leading-relaxed" placeholder="Write your story here. Press enter twice to start a new paragraph..."></textarea>
                </div>
                <div className="pt-6">
                  <button type="submit" className="w-full bg-slate-950 text-white font-black px-10 py-5 rounded-[4px] shadow-xl hover:bg-primary-red transition duration-500 uppercase tracking-[0.3em] text-xs flex items-center justify-center gap-4">
                    <FiSave size={16} /> <span>{isEditing ? 'Update Story' : 'Publish Story'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* VIEW: ACCOUNTS (USERS) */}
          {activeTab === 'users' && (
            <div className="animate-fade-in space-y-6">
               {/* DESKTOP TABLE */}
               <div className="hidden lg:block bg-white rounded-[4px] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <tr>
                          <th className="px-8 py-5 text-left">Member Name</th>
                          <th className="px-8 py-5 text-left">Status</th>
                          <th className="px-8 py-5 text-left">Email</th>
                          <th className="px-8 py-5 text-right">Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {users?.map(user => (
                          <tr key={user._id} className="hover:bg-slate-50 transition">
                            <td className="px-8 py-6 font-black text-slate-900 uppercase text-xs tracking-tight italic">{user.name}</td>
                            <td className="px-8 py-6">
                               <span className={`px-3 py-1 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${user.isBlocked ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
                                  {user.isBlocked ? 'Blocked' : 'Active'}
                                </span>
                            </td>
                            <td className="px-8 py-6 text-slate-500 font-bold text-xs">{user.email}</td>
                            <td className="px-8 py-6 text-right">
                               <button 
                                 onClick={() => toggleBlockUser(user._id)}
                                 className={`px-4 py-2 rounded-[4px] font-black text-[9px] uppercase tracking-widest transition-all ${user.isBlocked ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}`}
                               >
                                 {user.isBlocked ? 'Unblock' : 'Block'}
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="lg:hidden space-y-4">
                {users?.map(user => (
                  <div key={user._id} className="bg-white p-5 rounded-[4px] border border-slate-100 shadow-sm space-y-4">
                     <div className="flex justify-between items-start">
                        <div>
                           <h4 className="font-black text-slate-900 uppercase italic text-sm tracking-tight">{user.name}</h4>
                           <p className="text-[10px] text-slate-400 font-bold break-all">{user.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-[4px] text-[7px] font-black uppercase tracking-widest ${user.isBlocked ? 'bg-red-600 text-white' : 'bg-emerald-500 text-white'}`}>
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                     </div>
                     <div className="pt-3 border-t border-slate-50">
                        <button 
                          onClick={() => toggleBlockUser(user._id)}
                          className={`w-full py-3 rounded-[4px] font-black text-[10px] uppercase tracking-widest transition-all ${user.isBlocked ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}`}
                        >
                          {user.isBlocked ? 'Restore Member Access' : 'Restrict User Access'}
                        </button>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: SUBSCRIBERS */}
          {activeTab === 'newsletter' && (
            <div className="animate-fade-in space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscribers?.map((sub, idx) => (
                    <div key={idx} className="p-6 bg-white border border-slate-100 rounded-[4px] shadow-sm flex items-center justify-between group hover:border-primary-red transition">
                        <div>
                            <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 mb-1">Subscriber</span>
                            <span className="block text-xs font-black text-slate-900 uppercase italic truncate max-w-[180px]">{sub.email}</span>
                        </div>
                        <FiMail className="text-slate-200 group-hover:text-primary-red transition"/>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* VIEW: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="animate-fade-in space-y-6 pb-20">
                {messages?.map((msg) => (
                  <div key={msg.id} className="bg-white rounded-[4px] border border-slate-100 shadow-sm p-8 space-y-6 hover:border-primary-red transition">
                      <div className="flex justify-between items-start">
                          <div className="space-y-1">
                              <h4 className="text-lg font-black text-slate-950 uppercase italic tracking-tighter">{msg.subject}</h4>
                              <p className="text-[9px] font-black text-primary-red uppercase tracking-widest">From: {msg.name} ({msg.email})</p>
                          </div>
                          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{new Date(msg.date).toLocaleDateString()}</span>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[4px] border-l-4 border-primary-red">
                          <p className="text-slate-600 font-medium leading-relaxed italic">"{msg.message}"</p>
                      </div>
                      <div className="flex justify-end">
                        <button onClick={() => deleteMessage(msg.id)} className="text-[9px] font-black text-red-600 uppercase tracking-widest hover:underline flex items-center gap-2">
                           <FiTrash2 size={12}/> Delete Message
                        </button>
                      </div>
                  </div>
                ))}
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in max-w-2xl mx-auto space-y-8 pb-32">
              <div className="bg-white p-10 rounded-[4px] border border-slate-100 shadow-sm space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-primary-red">
                    <FiZap size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">News Ticker</span>
                  </div>
                  <textarea
                    value={tempBreakingNews}
                    onChange={(e) => setTempBreakingNews(e.target.value)}
                    rows={2}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[4px] focus:bg-white focus:border-primary-red outline-none transition font-bold text-sm text-slate-700"
                    placeholder="Urgent news text..."
                  />
                  <button onClick={handleSaveTicker} className="w-full bg-slate-950 text-white font-black py-4 rounded-[4px] text-[9px] uppercase tracking-widest hover:bg-primary-red transition">Save Ticker</button>
                </div>

                <div className="space-y-6 pt-10 border-t border-slate-50">
                  <div className="flex items-center gap-3 text-slate-400">
                    <FiSettings size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Site Information</span>
                  </div>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="email"
                            value={tempSettings.email}
                            onChange={(e) => setTempSettings({ ...tempSettings, email: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border-b border-slate-100 rounded-[4px] focus:bg-white focus:border-primary-red outline-none transition font-bold text-xs"
                            placeholder="Email"
                        />
                        <input
                            type="text"
                            value={tempSettings.phone}
                            onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                            className="w-full px-6 py-4 bg-slate-50 border-b border-slate-100 rounded-[4px] focus:bg-white focus:border-primary-red outline-none transition font-bold text-xs"
                            placeholder="Phone"
                        />
                         <input
                            type="text"
                            value={tempSettings.address}
                            onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                            className="md:col-span-2 w-full px-6 py-4 bg-slate-50 border-b border-slate-100 rounded-[4px] focus:bg-white focus:border-primary-red outline-none transition font-bold text-xs"
                            placeholder="Address"
                        />
                    </div>
                    <button onClick={handleSaveSettings} className="w-full bg-slate-950 text-white font-black py-4 rounded-[4px] text-[9px] uppercase tracking-widest hover:bg-primary-red transition">Update Site Info</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Admin;
