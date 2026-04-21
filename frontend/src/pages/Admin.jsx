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
    addArticle, updateArticle, deleteArticle, toggleBlockUser, toggleBlockSubscriber,
    siteSettings, updateSiteSettings, breakingNews, updateBreakingNews, deleteMessage, messages, fetchData
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

  const [aiDiscoveries, setAiDiscoveries] = useState([
    { id: 1, title: "Heatwave Alert: 44°C Peak Across Eastern India", category: "India", trend: "Critical", image: "https://images.unsplash.com/photo-1550537687-c91072c4792d?auto=format&fit=crop&q=80&w=800" },
    { id: 2, title: "IPL 2026: Epic Showdown in Wankhede Tonight", category: "Sports", trend: "Viral", image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800" },
    { id: 3, title: "Election 2026: Phase 2 Polling Preparations Underway", category: "Politics", trend: "High", image: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&q=80&w=800" },
    { id: 4, title: "Market Surge: Indian Tech Stocks Hit Record High", category: "Business", trend: "Rising", image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800" }
  ]);

  const [isRefreshingDiscovery, setIsRefreshingDiscovery] = useState(false);
  const [discoverySearchTerm, setDiscoverySearchTerm] = useState('');

  const refreshDiscoveries = async (q = '') => {
    setIsRefreshingDiscovery(true);
    try {
      const queryParam = q ? `?q=${encodeURIComponent(q)}` : '';
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/external-news${queryParam}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAiDiscoveries(data);
      if (q) toast.success(`Intelligence Tracked: "${q.toUpperCase()}"`);
      else toast.success('Live Intelligence Feed Synchronized.');
    } catch (err) {
      toast.error('Discovery Breach: Satellite sync failed.');
    } finally {
      setIsRefreshingDiscovery(false);
    }
  };

  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeEditorTab, setActiveEditorTab] = useState('content');
  
  const [formData, setFormData] = useState({
    title: '',
    subheadline: '',
    category: 'India',
    image: '',
    imageCaption: '',
    multipleImages: [],
    excerpt: '',
    author: currentUser?.name || 'Admin',
    status: 'Published',
    placement: 'Standard',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    sourceUrl: ''
  });

  const [sections, setSections] = useState([
    { id: Date.now(), type: 'paragraph', text: '' }
  ]);

  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute) + ' min read';
  };

  const addSection = (type) => {
    const newSection = { id: Date.now(), type };
    if (type === 'heading' || type === 'paragraph') newSection.text = '';
    else if (type === 'image') { newSection.url = ''; newSection.caption = ''; }
    else if (type === 'quote') { newSection.text = ''; newSection.author = ''; }
    else if (type === 'list') { newSection.items = ['']; }
    
    setSections([...sections, newSection]);
  };

  const updateSection = (id, data) => {
    setSections(sections.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const removeSection = (id) => {
    setSections(sections.filter(s => s.id !== id));
  };

  const moveSection = (index, direction) => {
    const newSections = [...sections];
    const target = index + direction;
    if (target < 0 || target >= newSections.length) return;
    [newSections[index], newSections[target]] = [newSections[target], newSections[index]];
    setSections(newSections);
  };

  const handleImageUpload = (e, field = 'image') => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8000000) { 
        toast.error("Image too large. Please keep under 8MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'image') setFormData({ ...formData, image: reader.result });
        else if (field === 'multiple') setFormData({ ...formData, multipleImages: [...formData.multipleImages, reader.result] });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
        toast.error('The Story needs a Headline to broadcast.');
        return;
    }
    const slug = formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const allText = sections.map(s => s.text || (s.items ? s.items.join(' ') : '')).join(' ');
    
    const articleData = {
      ...formData,
      slug,
      content: sections,
      readingTime: calculateReadingTime(allText),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    if (isEditing) {
      updateArticle(editId, articleData);
      toast.success('Story intel updated.');
      setIsEditing(false);
      setEditId(null);
    } else {
      addArticle(articleData);
      toast.success('Broadcast live.');
    }

    resetForm();
    setActiveTab('articles');
  };

  const resetForm = () => {
    setFormData({ title: '', subheadline: '', category: 'India', image: '', imageCaption: '', multipleImages: [], excerpt: '', author: currentUser?.name || 'Admin', status: 'Published', placement: 'Standard', tags: '', metaTitle: '', metaDescription: '', sourceUrl: '' });
    setSections([{ id: Date.now(), type: 'paragraph', text: '' }]);
  };

  const startEdit = (article) => {
    setFormData({
      title: article.title,
      subheadline: article.subheadline || '',
      category: article.category,
      image: article.image,
      imageCaption: article.imageCaption || '',
      multipleImages: article.multipleImages || [],
      excerpt: article.excerpt,
      author: article.author || 'Admin',
      status: article.status || 'Published',
      placement: article.placement || 'Standard',
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags || '',
      metaTitle: article.metaTitle || '',
      metaDescription: article.metaDescription || '',
      sourceUrl: article.sourceUrl || ''
    });
    setSections(article.content || [{ id: Date.now(), type: 'paragraph', text: '' }]);
    setEditId(article.id);
    setIsEditing(true);
    setActiveTab('editor');
  };

  const autoOptimizeSeo = () => {
    if (!formData.title) { toast.error('Headline required for SEO analysis.'); return; }
    toast.success('Analyzing Narrative Sentiment...');
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        metaTitle: `${prev.title} | Exclusive Analysis | Nation Trends India`,
        metaDescription: `Detailed investigative report: ${prev.excerpt || prev.title}. Exploring the systemic impact on ${prev.category} and the future of Indian development.`,
        tags: `${prev.category}, ${prev.title.split(' ').slice(0, 3).join(', ')}, Nation Trends India, Exclusive Report`
      }));
      toast.success('SEO Architecture Optimized.');
    }, 1500);
  };

  const discoverStory = (discovery) => {
    setFormData({
      ...formData,
      title: `${discovery.title.toUpperCase()}: THE NTI INVESTIGATIVE REPORT`,
      category: discovery.category,
      image: discovery.image,
      subheadline: `A definitive multi-dimensional analysis of the unfolding developments in ${discovery.title} and the broader implications for the modern Indian landscape.`,
      excerpt: `Building a comprehensive intelligence brief on the systemic shifts triggered by ${discovery.title}. Investigating the core drivers, market sentiment, and long-term consequences for stakeholders in the ${discovery.category} sector.`
    });
    setSections([
      { id: Date.now(), type: 'heading', text: `Tactical Analysis: ${discovery.title}` },
      { id: Date.now() + 1, type: 'paragraph', text: `${discovery.description}. In what can only be described as a major escalation of the ${discovery.title} narrative, fresh intelligence obtained by Nation Trends India suggests a profound paradigm shift. Our investigative unit has been monitoring the situation as it reaches a critical threshold, revealing layers of complexity that indicate long-term structural transformation. Initial data points to a convergence of multiple factors—ranging from policy adjustments to grassroots shifts in regional dynamics—that are collectively driving this momentum at an unprecedented scale.` },
      { id: Date.now() + 2, type: 'image', url: discovery.image, caption: `Visual intelligence asset captured during the ongoing developments in ${discovery.title}.` },
      { id: Date.now() + 3, type: 'heading', text: "The Global Systemic Impact Layer" },
      { id: Date.now() + 4, type: 'paragraph', text: `Beyond the immediate headlines, the ${discovery.title} phenomenon is triggering a ripple effect across the entire ecosystem. Experts in the ${discovery.category} sector are pointing toward a total re-calibration of expected norms. Our investigative team has accessed proprietary sentiment tracking data showing that the initial public reaction is just the tip of the iceberg. What we are witnessing is the birth of a new operational standard that will likely redefine how we view these events for the next decade. The sheer speed at which this narrative is evolving has caught traditional analysts off-guard, necessitating the ultra-granular, tech-enabled investigative approach that Nation Trends India pioneered. We are looking at a complete architectural shift that transcends simple reporting.` },
      { id: Date.now() + 5, type: 'quote', text: `The scope of this movement is far larger than modern reports suggest. We are looking at a complete structural transformation that will echo through the coming years with significant magnitude.`, author: `NTI Lead Strategist (via ${discovery.source})` },
      { id: Date.now() + 6, type: 'paragraph', text: "As the transition continues, our focus shifts toward the socio-economic impact on the average citizen. While the macro-indicators are showing strong momentum, the granular reality on the ground requires further persistent investigation. Through our network of field correspondents and digital data harvesters, the Bureau is piecing together a comprehensive map of this shift. Every data point confirms that this is not merely a transient event, but a permanent recalibration of the landscape. We will continue to track this narrative as more encrypted intelligence becomes available through our secure satellite channels." },
      { id: Date.now() + 7, type: 'list', items: ["Strategic re-alignment of sectoral priorities recognized", "Market sentiment analysis complete with high-confidence forecasting", "Future projections indicating a period of high-intensity transformation", "Risk assessment protocols currently being updated in real-time"] },
      { id: Date.now() + 8, type: 'paragraph', text: "Nation Trends India remains committed to delivering the most deep-dive, high-fidelity reports in the country. Our investigation into these developments is ongoing, and we will provide real-time updates through our interactive Intelligence Hub. Stay tuned as we uncover the deeper layers of this evolving story." }
    ]);
    setActiveTab('editor');
    toast.success('Intelligence Brief Loaded.');
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
            { id: 'discover', label: 'Intel Discovery', icon: FiCpu },
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
            <button 
              onClick={() => {
                fetchData();
                toast.success('System Status Synchronized');
              }} 
              className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 text-slate-400 rounded-[4px] hover:bg-slate-900 hover:text-white transition"
              title="Refresh Data"
            >
              <FiClock size={16} />
            </button>
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
                        .filter(art => (art.title?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || '') || (art.category?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || ''))
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
                  .filter(art => (art.title?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || '') || (art.category?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || ''))
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

          {/* VIEW: INTELLIGENCE DISCOVERY */}
          {activeTab === 'discover' && (
            <div className="animate-fade-in space-y-10">
               <div className="bg-slate-950 p-10 lg:p-14 rounded-[4px] border border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10"><FiCpu size={120} className="text-white"/></div>
                  <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                     <div>
                        <h2 className="text-white text-3xl font-black uppercase italic tracking-tighter mb-4">Intelligence <span className="text-emerald-500">Discovery</span></h2>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Real-time narrative tracking for modern journalism</p>
                     </div>
                     <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/10 p-2 rounded-[4px] border border-white/10">
                        <div className="relative flex-grow">
                           <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                           <input 
                             type="text" 
                             placeholder="TRACK SPECIFIC NARRATIVE..."
                             value={discoverySearchTerm}
                             onChange={(e) => setDiscoverySearchTerm(e.target.value)}
                             onKeyDown={(e) => e.key === 'Enter' && refreshDiscoveries(discoverySearchTerm)}
                             className="w-full pl-12 pr-6 py-4 bg-transparent text-white font-black text-[10px] uppercase tracking-widest border-none focus:ring-0 placeholder:text-slate-600 min-w-[250px]"
                           />
                        </div>
                        <button 
                          onClick={() => refreshDiscoveries(discoverySearchTerm)}
                          disabled={isRefreshingDiscovery}
                          className="px-8 py-4 bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-[4px] hover:bg-emerald-500 hover:text-white transition-all duration-500 flex items-center gap-3 shadow-2xl disabled:opacity-50 whitespace-nowrap"
                        >
                          {isRefreshingDiscovery ? <FiClock className="animate-spin"/> : <FiActivity/>} 
                          {isRefreshingDiscovery ? 'Syncing...' : (discoverySearchTerm ? 'Search Intel' : 'Refresh Feed')}
                        </button>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {aiDiscoveries.map((discovery) => (
                    <div key={discovery.id} className="bg-white border border-slate-100 rounded-[4px] group hover:border-slate-950 transition-all duration-700 relative overflow-hidden flex flex-col">
                       <div className="aspect-video relative overflow-hidden">
                          <img src={discovery.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />
                          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                             <span className="text-[8px] font-black py-1 px-3 bg-slate-900/80 backdrop-blur-md text-white uppercase tracking-widest rounded-[4px]">{discovery.category}</span>
                             <span className="flex items-center gap-1.5 bg-emerald-500/90 backdrop-blur-md px-2 py-1 text-white text-[8px] font-black uppercase tracking-widest rounded-[4px] animate-pulse"><FiActivity size={10}/> {discovery.trend}</span>
                          </div>
                       </div>
                       <div className="p-8 flex flex-col flex-grow">
                          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 leading-[1.1] min-h-[66px]">{discovery.title}</h3>
                          <button 
                            onClick={() => discoverStory(discovery)}
                            className="mt-auto w-full py-4 bg-slate-50 text-slate-950 font-black text-[9px] uppercase tracking-widest rounded-[4px] hover:bg-slate-950 hover:text-white transition-all flex items-center justify-center gap-3 group-hover:shadow-xl"
                          >
                            <FiZap size={14}/> Synthesize Intelligence
                          </button>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {/* VIEW: ELITE EDITOR */}
          {activeTab === 'editor' && (
            <div className="animate-fade-in max-w-7xl mx-auto space-y-10 pb-40">
              
              {/* Editor Secondary Header */}
              <div className="flex flex-col xl:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <button onClick={() => setActiveTab('articles')} className="w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-full text-slate-400 hover:text-primary-red hover:border-primary-red transition shadow-sm">
                    <FiArrowLeft size={18} />
                  </button>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter">Newsroom Editor</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isEditing ? 'Editing Exclusive' : 'Creating New Narrative'}</span>
                       <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                       <span className="text-[10px] font-black text-primary-red uppercase tracking-widest">{formData.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full xl:w-auto">
                    <div className="bg-white p-1 rounded-[4px] border border-slate-200 flex gap-1 shadow-sm">
                        {['content', 'media', 'seo'].map(tab => (
                          <button 
                            key={tab}
                            onClick={() => setActiveEditorTab(tab)}
                            className={`px-6 py-2 rounded-[2px] text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeEditorTab === tab ? 'bg-slate-950 text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                          >
                            {tab}
                          </button>
                        ))}
                    </div>
                    <button onClick={resetForm} className="px-6 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[9px] uppercase tracking-widest rounded-[4px] hover:border-slate-950 transition-all duration-300">Discard</button>
                    <button onClick={handleSubmit} className="px-10 py-3 bg-primary-red text-white font-black text-[9px] uppercase tracking-widest rounded-[4px] hover:bg-slate-950 transition-all duration-500">Broadcast</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  
                  {/* Left Column: Form Fields */}
                  <div className="lg:col-span-8 space-y-10">
                      
                      {activeEditorTab === 'content' && (
                        <div className="space-y-10 animate-fade-in">
                          {/* Core Meta */}
                          <div className="bg-white p-10 lg:p-14 rounded-[4px] border-l-8 border-primary-red shadow-sm space-y-12">
                             <div className="space-y-4">
                                <label className="text-[8px] font-black text-primary-red uppercase tracking-[0.4em] ml-1">The Headline</label>
                                <input 
                                  value={formData.title} 
                                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                                  className="w-full text-4xl lg:text-5xl font-black text-slate-950 uppercase italic tracking-tighter placeholder:text-slate-100 bg-transparent border-none focus:ring-0 leading-none focus:placeholder:text-slate-50 transition-all font-sans"
                                  placeholder="ENTER BOLD HEADLINE..." 
                                />
                             </div>
                             <div className="space-y-4">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Sub-Headline</label>
                                <textarea 
                                  value={formData.subheadline} 
                                  onChange={e => setFormData({ ...formData, subheadline: e.target.value })}
                                  className="w-full text-lg lg:text-xl font-medium text-slate-500 placeholder:text-slate-100 bg-transparent border-none focus:ring-0 leading-relaxed resize-none"
                                  rows={1}
                                  placeholder="Supportive sub-text that provides additional context..."
                                />
                             </div>
                          </div>

                          {/* Block Editor */}
                          <div className="space-y-4">
                             <div className="flex items-center justify-between px-4">
                               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Narrative Builder</h4>
                               <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{calculateReadingTime(sections.map(s => s.text || '').join(' '))}</span>
                               </div>
                             </div>

                             <div className="space-y-6">
                                {sections.map((section, index) => (
                                  <div key={section.id} className="group relative bg-white rounded-[4px] border border-slate-100 hover:border-slate-300 transition-all duration-500">
                                      {/* Section Toolbar - Repositioned to prevent clipping */}
                                      <div className="absolute -right-4 top-4 xl:-right-12 xl:top-0 h-auto xl:h-full flex xl:flex-col gap-1 items-center justify-start opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                                         <button onClick={() => moveSection(index, -1)} className="w-8 h-8 bg-white border border-slate-100 rounded-[4px] flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"><FiArrowLeft className="rotate-90" /></button>
                                         <button onClick={() => moveSection(index, 1)} className="w-8 h-8 bg-white border border-slate-100 rounded-[4px] flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-sm"><FiArrowLeft className="-rotate-90" /></button>
                                         <button onClick={() => removeSection(section.id)} className="w-8 h-8 bg-white border border-slate-100 rounded-[4px] flex items-center justify-center text-slate-400 hover:text-primary-red hover:border-primary-red transition-all shadow-sm"><FiTrash2 size={12}/></button>
                                      </div>

                                      <div className="p-8 lg:p-10">
                                         {section.type === 'heading' && (
                                           <div className="relative">
                                              <div className="absolute -left-10 top-1.5 w-1.5 h-1.5 bg-primary-red"></div>
                                              <input 
                                                value={section.text}
                                                onChange={e => updateSection(section.id, { text: e.target.value })}
                                                className="w-full text-2xl font-black text-slate-950 uppercase italic tracking-tighter bg-transparent border-none focus:ring-0 mb-4 font-sans"
                                                placeholder="SUB-HEADLINE..."
                                              />
                                           </div>
                                         )}

                                         {section.type === 'paragraph' && (
                                           <textarea 
                                             value={section.text}
                                             onChange={e => updateSection(section.id, { text: e.target.value })}
                                             className="w-full text-base lg:text-lg text-slate-600 font-medium leading-relaxed bg-transparent border-none focus:ring-0 resize-none min-h-[80px] font-serif"
                                             placeholder="Detailed report text here..."
                                             onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                           />
                                         )}

                                         {section.type === 'quote' && (
                                           <div className="space-y-4 border-l-8 border-primary-red pl-10 py-2">
                                              <textarea 
                                                value={section.text}
                                                onChange={e => updateSection(section.id, { text: e.target.value })}
                                                className="w-full text-2xl md:text-3xl font-black text-slate-900 italic tracking-tighter bg-transparent border-none focus:ring-0 leading-[1.1] resize-none overflow-hidden"
                                                placeholder="PULL QUOTE..."
                                                onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                                              />
                                              <div className="flex items-center gap-3 opacity-60">
                                                 <div className="h-px w-6 bg-slate-900"></div>
                                                 <input 
                                                   value={section.author}
                                                   onChange={e => updateSection(section.id, { author: e.target.value })}
                                                   className="flex-grow text-[9px] font-black text-slate-900 uppercase tracking-widest bg-transparent border-none focus:ring-0"
                                                   placeholder="IDENTITY"
                                                 />
                                              </div>
                                           </div>
                                         )}

                                         {section.type === 'image' && (
                                           <div className="space-y-6">
                                              <div className="relative aspect-video bg-slate-50 rounded-[2px] overflow-hidden border border-slate-100 group">
                                                 {section.url ? (
                                                   <img src={section.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Block" />
                                                 ) : (
                                                   <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300">
                                                      <FiImage size={32} />
                                                      <span className="text-[8px] font-black uppercase tracking-widest">Multimedia Asset</span>
                                                   </div>
                                                 )}
                                              </div>
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                 <input 
                                                   value={section.url}
                                                   onChange={e => updateSection(section.id, { url: e.target.value })}
                                                   className="w-full px-5 py-3 bg-slate-50 rounded-[2px] text-[10px] font-bold border-none focus:ring-1 focus:ring-primary-red transition-all"
                                                   placeholder="IMAGE URL..."
                                                 />
                                                 <input 
                                                   value={section.caption}
                                                   onChange={e => updateSection(section.id, { caption: e.target.value })}
                                                   className="w-full px-5 py-3 bg-slate-50 rounded-[2px] text-[10px] font-bold border-none focus:ring-1 focus:ring-primary-red transition-all"
                                                   placeholder="CAPTION..."
                                                 />
                                              </div>
                                           </div>
                                         )}

                                         {section.type === 'list' && (
                                            <div className="space-y-4">
                                               {section.items.map((item, i) => (
                                                 <div key={i} className="flex items-center gap-4">
                                                    <div className="w-6 h-6 bg-slate-950 text-white flex items-center justify-center text-[9px] font-black rounded-sm">{i + 1}</div>
                                                    <input 
                                                      value={item}
                                                      onChange={e => {
                                                        const newItems = [...section.items];
                                                        newItems[i] = e.target.value;
                                                        updateSection(section.id, { items: newItems });
                                                      }}
                                                      className="flex-grow text-base font-medium text-slate-700 bg-transparent border-none focus:ring-0 font-serif"
                                                      placeholder="Narrative point..."
                                                    />
                                                 </div>
                                               ))}
                                               <button 
                                                 onClick={() => updateSection(section.id, { items: [...section.items, ''] })}
                                                 className="mt-4 px-5 py-2 bg-slate-950 text-white font-black text-[8px] uppercase tracking-widest rounded-[2px] hover:bg-primary-red transition-all"
                                               >
                                                 + ADD POINT
                                               </button>
                                            </div>
                                         )}
                                      </div>
                                  </div>
                                ))}

                                <div className="flex flex-wrap items-center justify-center gap-3 py-14 bg-slate-950 rounded-[4px] border border-slate-800 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                    {[
                                      { type: 'heading', label: 'Headline block', icon: FiFileText },
                                      { type: 'paragraph', label: 'Body Text', icon: FiMenu },
                                      { type: 'image', label: 'Visual Asset', icon: FiImage },
                                      { type: 'quote', label: 'Pull Quote', icon: FiMessageSquare },
                                      { type: 'list', label: 'Key points', icon: FiCheck }
                                    ].map(tool => (
                                      <button 
                                        key={tool.type}
                                        onClick={() => addSection(tool.type)}
                                        className="px-8 py-4 bg-white/5 border border-white/10 rounded-[4px] backdrop-blur-md text-[10px] font-black text-white hover:text-primary-red uppercase tracking-widest flex items-center gap-3 hover:bg-white hover:scale-[1.05] transition-all duration-500 z-10"
                                      >
                                        <tool.icon size={16} /> <span>{tool.label}</span>
                                      </button>
                                    ))}
                                </div>
                             </div>
                          </div>
                        </div>
                      )}

                      {activeEditorTab === 'media' && (
                        <div className="space-y-10 animate-fade-in">
                           <div className="bg-white p-12 rounded-[4px] border border-slate-100 shadow-sm space-y-10">
                              <div className="space-y-6">
                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1 block">Hero Asset</label>
                                 <div className="relative aspect-[21/9] bg-slate-50 rounded-[4px] overflow-hidden border-2 border-dashed border-slate-200 group flex items-center justify-center">
                                     {formData.image ? (
                                       <>
                                         <img src={formData.image} className="w-full h-full object-cover" />
                                         <button onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition"><FiTrash2 size={20} /></button>
                                       </>
                                     ) : (
                                       <div className="flex flex-col items-center gap-6">
                                          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-200 group-hover:text-primary-red transition duration-500">
                                             <FiImage size={32} />
                                          </div>
                                          <div className="text-center">
                                             <p className="text-[11px] font-black text-slate-950 uppercase tracking-widest">DRAG & DROP COVER IMAGE</p>
                                             <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-2 block">Resolution: 21:9 Recommended</span>
                                          </div>
                                          <label className="px-10 py-4 bg-slate-950 text-white font-black text-[10px] uppercase tracking-widest rounded-[4px] hover:bg-primary-red transition cursor-pointer">
                                             Select File
                                             <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                          </label>
                                       </div>
                                     )}
                                 </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                                 <div className="space-y-4">
                                     <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Asset Source / URL</label>
                                     <input 
                                       value={formData.image}
                                       onChange={e => setFormData({ ...formData, image: e.target.value })}
                                       className="w-full px-8 py-6 bg-slate-50 rounded-[4px] text-[11px] font-bold border-none focus:ring-1 focus:ring-primary-red transition" 
                                       placeholder="EXTERNAL ASSET LINK..."
                                     />
                                 </div>
                                 <div className="space-y-4">
                                     <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Asset Caption</label>
                                     <input 
                                       value={formData.imageCaption}
                                       onChange={e => setFormData({ ...formData, imageCaption: e.target.value })}
                                       className="w-full px-8 py-6 bg-slate-50 rounded-[4px] text-[11px] font-bold border-none focus:ring-1 focus:ring-primary-red transition" 
                                       placeholder="ASSET ATTRIBUTION..."
                                     />
                                 </div>
                              </div>
                           </div>

                           <div className="bg-white p-12 rounded-[4px] border border-slate-100 shadow-sm space-y-10">
                              <h4 className="text-[12px] font-black text-slate-950 uppercase tracking-tight">Gallery Assets</h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                 {formData.multipleImages.map((img, i) => (
                                   <div key={i} className="aspect-square bg-slate-50 rounded-[4px] overflow-hidden relative group border border-slate-100">
                                      <img src={img} className="w-full h-full object-cover" />
                                      <button onClick={() => setFormData({ ...formData, multipleImages: formData.multipleImages.filter((_, idx) => idx !== i) })} className="absolute inset-0 bg-red-600/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition"><FiTrash2 size={24} /></button>
                                   </div>
                                 ))}
                                 <label className="aspect-square bg-slate-50 rounded-[4px] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-3 text-slate-300 hover:border-slate-400 hover:text-slate-600 cursor-pointer transition">
                                    <FiPlus size={24} />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Add Asset</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'multiple')} />
                                 </label>
                              </div>
                           </div>
                        </div>
                      )}

                      {activeEditorTab === 'seo' && (
                        <div className="space-y-10 animate-fade-in">
                           <div className="bg-white p-12 rounded-[30px] border border-slate-100 shadow-sm space-y-10">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-6">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Intelligence Tags (Meta)</label>
                                    <textarea 
                                      value={formData.tags}
                                      onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                      className="w-full p-8 bg-slate-50 rounded-2xl text-[11px] font-bold border-none focus:ring-1 focus:ring-primary-red transition resize-none"
                                      rows={4}
                                      placeholder="EX: POLITICS, INDIA, BHARAT-RASTRA, TECHNOLOGY..."
                                    />
                                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-widest pl-2">Use comma separated keywords for search priority.</p>
                                 </div>
                                 <div className="space-y-6">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Narrative Digest (Excerpt)</label>
                                    <textarea 
                                      value={formData.excerpt}
                                      onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                                      className="w-full p-8 bg-slate-50 rounded-2xl text-[11px] font-bold border-none focus:ring-1 focus:ring-primary-red transition resize-none"
                                      rows={4}
                                      placeholder="Enter a brief intelligence digest for card view previews..."
                                    />
                                 </div>
                              </div>
                           </div>

                           <div className="bg-slate-950 p-12 rounded-[30px] shadow-2xl text-white space-y-10">
                              <div className="flex items-center gap-4">
                                 <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-primary-red"><FiShield size={24} /></div>
                                 <h4 className="text-xl font-black uppercase tracking-tighter italic">Search Intelligence Optimization (SEO)</h4>
                              </div>
                              <div className="space-y-8">
                                 <div className="space-y-4">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 block">Meta Page Title</label>
                                    <input 
                                      value={formData.metaTitle}
                                      onChange={e => setFormData({ ...formData, metaTitle: e.target.value })}
                                      className="w-full px-8 py-6 bg-white/10 rounded-2xl text-[11px] font-bold border-none focus:ring-1 focus:ring-primary-red transition placeholder:text-slate-700" 
                                      placeholder="HOW WILL THIS STORY RANK?"
                                    />
                                 </div>
                                 <div className="space-y-4">
                                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1 block">Meta Narrative Description</label>
                                    <textarea 
                                      value={formData.metaDescription}
                                      onChange={e => setFormData({ ...formData, metaDescription: e.target.value })}
                                      className="w-full p-8 bg-white/10 rounded-2xl text-[11px] font-bold border-none focus:ring-1 focus:ring-primary-red transition placeholder:text-slate-700 resize-none" 
                                      rows={3}
                                      placeholder="ENTER COMPREHENSIVE SEARCH DESCRIPTION..."
                                    />
                                 </div>
                                 <div className="pt-6">
                                    <button 
                                      onClick={autoOptimizeSeo}
                                      className="w-full py-4 bg-primary-red text-white font-black text-[9px] uppercase tracking-widest rounded-[4px] hover:bg-white hover:text-slate-950 transition-all duration-500 shadow-xl flex items-center justify-center gap-3"
                                    >
                                      <FiCpu className="animate-pulse" /> Auto-Optimize Narrative SEO
                                    </button>
                                 </div>
                              </div>
                           </div>
                        </div>
                      )}
                  </div>

                  {/* Right Column: Settings Panel */}
                  <div className="lg:col-span-4 space-y-8">
                      <div className="bg-white p-8 rounded-[4px] border border-slate-100 shadow-sm space-y-8">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] pb-4 border-b border-slate-50">Publishing Controls</h4>
                         
                         <div className="space-y-6">
                            <div className="space-y-3">
                               <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Section Classification</label>
                               <select 
                                 value={formData.category} 
                                 onChange={e => setFormData({ ...formData, category: e.target.value })}
                                 className="w-full p-4 bg-slate-50 rounded-[4px] text-[10px] font-black border-none focus:ring-1 focus:ring-primary-red transition"
                               >
                                 <option>India</option>
                                 <option>World</option>
                                 <option>Politics</option>
                                 <option>Technology</option>
                                 <option>Business</option>
                                 <option>Sports</option>
                                 <option>Entertainment</option>
                               </select>
                            </div>

                            <div className="space-y-3">
                               <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Editorial Placement</label>
                               <div className="grid grid-cols-3 gap-2">
                                  {['Standard', 'Featured', 'Breaking'].map(opt => (
                                    <button 
                                      key={opt}
                                      onClick={() => setFormData({ ...formData, placement: opt })}
                                      className={`py-3 rounded-[4px] text-[8px] font-black uppercase tracking-tight transition ${formData.placement === opt ? 'bg-primary-red text-white shadow-lg shadow-red-900/20' : 'bg-slate-50 text-slate-400 hover:text-slate-600'}`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                               </div>
                            </div>

                            <div className="space-y-3">
                               <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Transmission Status</label>
                               <div className="flex bg-slate-50 p-1 rounded-[4px] gap-1">
                                  {['Draft', 'Published'].map(opt => (
                                    <button 
                                      key={opt}
                                      onClick={() => setFormData({ ...formData, status: opt })}
                                      className={`flex-grow py-3 rounded-[4px] text-[9px] font-black uppercase tracking-widest transition ${formData.status === opt ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                               </div>
                            </div>

                            <div className="space-y-3">
                               <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Author Identity</label>
                               <input 
                                 value={formData.author}
                                 onChange={e => setFormData({ ...formData, author: e.target.value })}
                                 className="w-full p-4 bg-slate-50 rounded-[4px] text-[10px] font-bold border-none focus:ring-1 focus:ring-primary-red transition"
                                 placeholder="IDENTITY NAME"
                               />
                            </div>
                         </div>
                      </div>
                  </div>
              </div>
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
               <div className="bg-white rounded-[4px] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                        <tr>
                          <th className="px-8 py-5 text-left">Identity Email</th>
                          <th className="px-8 py-5 text-left">Email Status</th>
                          <th className="px-8 py-5 text-left">Internal Status</th>
                          <th className="px-8 py-5 text-right">Execution</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {subscribers?.map((sub, idx) => (
                          <tr key={sub._id || idx} className="hover:bg-slate-50 transition">
                            <td className="px-8 py-6 font-black text-slate-900 uppercase text-xs tracking-tight italic">{sub.email}</td>
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-2">
                                  {sub.emailSent ? (
                                    <div className="flex items-center gap-1.5 text-emerald-500">
                                      <FiCheck className="stroke-[3px]" />
                                      <span className="text-[8px] font-black uppercase tracking-widest">Sent</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-slate-300">
                                      <FiClock className="stroke-[3px]" />
                                      <span className="text-[8px] font-black uppercase tracking-widest">Pending</span>
                                    </div>
                                  )}
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className={`px-3 py-1 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${sub.isBlocked ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-900 border border-slate-200'}`}>
                                  {sub.isBlocked ? 'Blocked' : 'Active'}
                                </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <button 
                                 onClick={() => toggleBlockSubscriber(sub._id)}
                                 className={`px-4 py-2 rounded-[4px] font-black text-[9px] uppercase tracking-widest transition-all ${sub.isBlocked ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}`}
                               >
                                 {sub.isBlocked ? 'Restore' : 'Block'}
                               </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
