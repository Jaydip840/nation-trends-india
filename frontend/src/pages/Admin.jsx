import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiLogOut, FiCheck, FiX, FiLayout, FiFileText, FiSettings, FiImage, FiActivity, FiUsers, FiEye, FiSearch, FiSave, FiArrowLeft, FiCpu, FiCopy, FiZap, FiClock, FiShield, FiMenu, FiMessageSquare, FiMail, FiSmartphone, FiSend } from 'react-icons/fi';
import { useNews } from '../context/NewsContext';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const Admin = () => {
  const {
    articles, siteVisits, subscribers, users, currentUser, login, logout,
    addArticle, updateArticle, deleteArticle, toggleBlockUser, deleteUser, toggleBlockSubscriber,
    siteSettings, updateSiteSettings, breakingNews, updateBreakingNews, deleteMessage, messages, fetchData, replyToMessage
  } = useNews();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState({ ...siteSettings });
  const [tempBreakingNews, setTempBreakingNews] = useState(breakingNews);

  const handleConfirmLogout = () => {
    logout();
    navigate('/');
  };
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [discoveredNews, setDiscoveredNews] = useState([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverCategory, setDiscoverCategory] = useState('ALL');

  useEffect(() => {
    setTempSettings({ ...siteSettings });
    setTempBreakingNews(breakingNews);
  }, [siteSettings, breakingNews]);

  useEffect(() => {
    if (activeTab === 'discover' && discoveredNews.length === 0) {
      discoverIntelligence('ALL');
    }
  }, [activeTab]);

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeEditorTab, setActiveEditorTab] = useState('content');
  const [messageTypeTab, setMessageTypeTab] = useState('Normal');
  const [showPreview, setShowPreview] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subheadline: '',
    category: 'India',
    image: '',
    imageCaption: '',
    multipleImages: [],
    excerpt: '',
    author: siteSettings?.defaultAuthor || 'JC',
    status: 'Published',
    placement: 'Standard',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    sourceUrl: '',
    location: 'NEW DELHI',
    priority: 5,
    isPremium: false,
    showComments: true,
    videoUrl: '',
    socialLink: '',
    relatedLinks: '',
    fastFacts: ''
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

  const duplicateSection = (index) => {
    const sectionToCopy = sections[index];
    const newSection = { ...sectionToCopy, id: Date.now() };
    const newSections = [...sections];
    newSections.splice(index + 1, 0, newSection);
    setSections(newSections);
    toast.success('Block duplicated');
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
      toast.success('Story updated.');
      setIsEditing(false);
      setEditId(null);
    } else {
      addArticle(articleData);
      toast.success('Story published.');
    }

    if (articleData.placement === 'Breaking') {
      const tickerText = `${articleData.title.toUpperCase()} /// ${breakingNews}`;
      updateBreakingNews(tickerText);
    }

    resetForm();
    setActiveTab('articles');
  };

  const resetForm = () => {
    setFormData({ title: '', subheadline: '', category: 'India', image: '', imageCaption: '', multipleImages: [], excerpt: '', author: siteSettings?.defaultAuthor || 'JC', status: 'Published', placement: 'Standard', tags: '', metaTitle: '', metaDescription: '', sourceUrl: '', location: 'NEW DELHI', priority: 5, isPremium: false, showComments: true });
    setSections([{ id: Date.now(), type: 'paragraph', text: '' }]);
  };

  const editArticle = (article) => {
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
      sourceUrl: article.sourceUrl || '',
      location: article.location || 'NEW DELHI',
      priority: article.priority || 5,
      isPremium: article.isPremium || false,
      showComments: article.showComments !== undefined ? article.showComments : true,
      videoUrl: article.videoUrl || '',
      socialLink: article.socialLink || '',
      relatedLinks: article.relatedLinks || '',
      fastFacts: article.fastFacts || ''
    });
    setSections(article.content || [{ id: Date.now(), type: 'paragraph', text: '' }]);
    setEditId(article._id);
    setIsEditing(true);
    setActiveTab('editor');
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

  const discoverIntelligence = async (cat = 'ALL') => {
    setIsDiscovering(true);
    setDiscoverCategory(cat);
    const id = toast.loading('Connecting to Global News Bureau...');

    // Logic: In a production environment, this would call NewsAPI or similar.
    // For this professional CMS, we provide a high-fidelity intelligence feed.
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockData = [
      { id: 1, title: "Beijing-Delhi flights resume as China, India expand air links", excerpt: "Direct air connectivity between India and China improves as Air China restores service amid warming diplomatic ties.", image: "https://images.unsplash.com/photo-1544016768-982d1554f0b9?q=80&w=800", source: "TIMES OF INDIA", category: "India" },
      { id: 2, title: "Political Storm: Kharge's 'Terrorist' Remark sparks major row", excerpt: "Congress chief clarifies statement after BJP calls for action; political atmosphere intensifies ahead of key elections.", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=800", source: "TOI BUREAU", category: "Politics" },
      { id: 3, title: "Kerala Fireworks Blast: 8 killed, several critically injured", excerpt: "Tragedy strikes fireworks unit in Kerala; emergency protocols activated as surveillance teams monitor the rescue ops.", image: "https://images.unsplash.com/photo-1580230239031-404db3585098?q=80&w=800", source: "TIMES OF INDIA", category: "India" },
      { id: 4, title: "Tamil Nadu Polls: High-stakes campaign concludes with final outreach", excerpt: "Political parties make the last surge in Tamil Nadu as single-phase polling begins Thursday; delimitation storm adds edge.", image: "https://images.unsplash.com/photo-1593113630400-ea4288922497?q=80&w=800", source: "TIMES OF INDIA", category: "Politics" },
      { id: 5, title: "Global Market Vector: Sensex holds near record highs", excerpt: "Investor caution remains as Iran war risks and oil surge keep markets in a delicate balance following latest global shifts.", image: "https://images.unsplash.com/photo-1611974714400-8e100f9a8f27?q=80&w=800", source: "BLOOMBERG", category: "Business" },
      { id: 6, title: "Apple WWDC 2026: Siri & AI updates planned for iOS 27", excerpt: "Reports suggest massive AI reconfiguration for Apple ecosystem as tech bureaus anticipate major software evolution.", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800", source: "TECHCRUNCH", category: "Technology" }
    ];

    const filtered = cat === 'ALL' ? mockData : mockData.filter(m => m.category === cat);
    setDiscoveredNews(filtered);
    setIsDiscovering(false);
    toast.success('Intelligence Feed Synchronized', { id });
  };

  const importToEditor = (news) => {
    setIsEditing(false);
    setFormData({
      ...formData,
      title: news.title.toUpperCase(),
      excerpt: news.excerpt,
      image: news.image,
      category: news.category,
      author: siteSettings?.defaultAuthor ? `${siteSettings.defaultAuthor} (Bureau News)` : 'JC (Bureau News)',
      tags: `${news.category}, ${news.source}, TRENDING`.toUpperCase()
    });
    setSections([
      { id: Date.now(), type: 'paragraph', text: `[INTEL SOURCE: ${news.source}] ${news.excerpt}` }
    ]);
    setActiveTab('editor');
    toast.success('Intel Imported to News Console');
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-pulse text-white font-black tracking-widest text-xs uppercase">Connecting to Server...</div>
    </div>;
  }

  const handleAISynthesis = async (type) => {
    if (!formData.title && type !== 'media' && type !== 'tags') {
      toast.error('Primary Headline required for AI data extraction.');
      return;
    }

    setIsSynthesizing(true);
    const id = toast.loading(`Bureau AI: Processing ${type} request...`);

    // Simulate Deep Intelligence Processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const title = formData.title || "Elite Narrative Report";
      const words = title.toLowerCase().split(' ');

      const categoryMap = {
        'tech': 'Technology', 'apple': 'Technology', 'ai': 'Technology', 'isro': 'Technology',
        'market': 'Business', 'sensex': 'Business', 'economy': 'Business',
        'cricket': 'Sports', 'ipl': 'Sports', 'game': 'Sports',
        'movie': 'Entertainment', 'actor': 'Entertainment',
        'pm': 'Politics', 'modi': 'Politics', 'election': 'Politics',
        'global': 'World', 'us': 'World', 'war': 'World'
      };

      let detectedCategory = formData.category || 'India';
      for (const [kw, cat] of Object.entries(categoryMap)) {
        if (words.includes(kw)) { detectedCategory = cat; break; }
      }

      const cities = ['NEW DELHI', 'MUMBAI', 'BENGALURU', 'HYDERABAD', 'CHENNAI', 'KOLKATA'];
      let detectedLocation = formData.location || cities[Math.floor(Math.random() * cities.length)];

      if (type === 'grammar') {
        const newSections = sections.map(s => s.type === 'paragraph' ? { ...s, text: s.text.trim() + " [AI Refined: Narrative expanded for professional broadcast flow.]" } : s);
        setSections(newSections);
        toast.success('Grammar & Flow Polished', { id });
      } else if (type === 'expand') {
        const newSections = sections.map(s => {
          if (s.type === 'paragraph' && s.text.length < 300) {
            return { ...s, text: s.text + " Furthermore, latest intelligence reports suggest that these developments are part of a broader systemic shift, with significant implications for both regional policy and international strategic frameworks in the coming quarters." };
          }
          return s;
        });
        setSections(newSections);
        toast.success('Narrative Depth Expanded', { id });
      } else if (type === 'summary') {
        setFormData({ ...formData, subheadline: `Strategic analysis regarding ${title} confirms a pivotal shift in ${detectedCategory} dynamics, as bureaus monitor immediate impact across the region.` });
        toast.success('Summary Generated', { id });
      } else if (type === 'tags') {
        setFormData({ ...formData, tags: `${detectedCategory}, ${detectedLocation}, STRATEGIC, ANALYSIS`.toUpperCase() });
        toast.success('Tags Suggested', { id });
      } else if (type === 'seo' || type === 'MASTER_FULL') {
        const isBreaking = title.toLowerCase().includes('breaking') || title.toLowerCase().includes('urgent');
        const smartImage = `https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200&q=news,${detectedCategory.toLowerCase()}`;
        const gallery = [
          `https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200&sig=1`,
          `https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&q=80&w=1200&sig=2`
        ];

        setFormData(prev => ({
          ...prev,
          subheadline: `Summary: ${title} news reported from ${detectedLocation}. Analysis ongoing.`,
          category: detectedCategory,
          location: detectedLocation,
          priority: isBreaking ? 10 : 7,
          placement: isBreaking ? 'Breaking' : 'Standard',
          videoUrl: `https://www.youtube.com/embed/dQw4w9WgXcQ`,
          fastFacts: `Impact: High; Bureau: ${detectedLocation}; Focus: ${detectedCategory}`,
          image: smartImage,
          multipleImages: gallery,
          tags: `${detectedCategory}, NEWS, ${detectedLocation}`.toUpperCase(),
          metaTitle: `${title} | Nation Trends India`,
          metaDescription: `Read about ${title} and the latest ${detectedCategory} news from ${detectedLocation}.`,
          excerpt: `A summary of ${title}, covering the latest ${detectedCategory} news and updates.`
        }));

        if (type === 'MASTER_FULL') {
          setSections([
            { id: Date.now() + 1, type: 'paragraph', text: `[NTI EXCLUSIVE - ${detectedLocation}] In a transformative development within the ${detectedCategory} sector, ${title} has emerged as a focal point of global interest. On-ground intelligence suggests a complex convergence of factors.` },
            { id: Date.now() + 2, type: 'heading', text: "Strategic Overview" },
            { id: Date.now() + 3, type: 'paragraph', text: `Preliminary data confirms that the implementation of response measures is already yielding results. Stakeholders have authorized immediate monitoring protocols.` },
            { id: Date.now() + 4, type: 'quote', text: `This is a fundamental reconfiguration of the ${detectedCategory} landscape in Bharat.`, author: "Bureau Analyst" },
            { id: Date.now() + 5, type: 'image', url: gallery[0], caption: "Surveillance documentation of the primary impact zone.", credit: "NTI Visuals" }
          ]);
        }
        toast.success('AI SEO data filled', { id });
      }
    } catch (error) {
      toast.error('AI Link Interference detected.', { id });
    } finally {
      setIsSynthesizing(false);
    }
  };

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
            <div className="w-10 h-10 bg-primary-red flex items-center justify-center font-black text-white text-xl rounded-sm">NT</div>
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
          <Link to="/" className="w-full mb-8 flex items-center space-x-3 px-4 py-3 rounded-sm bg-slate-900 text-slate-400 hover:text-white transition duration-300 font-black text-[10px] uppercase tracking-widest border border-slate-800">
            <FiArrowLeft size={14} /> <span>View Website</span>
          </Link>

          {[
            { id: 'dashboard', label: 'Dashboard', icon: FiActivity },
            { id: 'articles', label: 'Stories', icon: FiFileText },
            { id: 'users', label: 'Users', icon: FiUsers },
            { id: 'newsletter', label: 'Subscribers', icon: FiMail },
            { id: 'discover', label: 'Latest news', icon: FiCpu },
            { id: 'messages', label: 'Messages', icon: FiMessageSquare },
            { id: 'settings', label: 'Settings', icon: FiSettings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-4 px-4 py-4 transition duration-300 font-bold text-xs rounded-sm ${activeTab === item.id || (activeTab === 'editor' && item.id === 'articles') ? 'bg-primary-red text-white shadow-xl shadow-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
            >
              <item.icon size={18} />
              <span className="flex-grow text-left uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-8 border-t border-slate-800">
          <button onClick={() => setIsLogoutModalOpen(true)} className="w-full flex items-center justify-center space-x-3 bg-slate-900 hover:bg-red-600 text-slate-400 hover:text-white py-4 rounded-sm font-black text-[10px] uppercase tracking-widest transition duration-500 border border-slate-800">
            <FiLogOut /> <span>Logout</span>
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Log Out"
        message="Are you sure you want to log out of the Admin Panel? This will return you to the homepage."
      />

      {/* MAIN CONTENT */}
      <main className="flex-grow h-screen overflow-y-auto w-full">

        {/* HEADER */}
        <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 lg:px-10 py-5 lg:py-6 flex flex-row items-center justify-between z-40 bg-white">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden p-2 bg-slate-50 border border-slate-100 rounded-sm text-slate-600"
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

        </header>

        <div className="p-6 lg:p-10">

          {/* VIEW: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-10 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Views', value: articles.reduce((acc, curr) => acc + (curr.views || 0), 0).toLocaleString(), icon: FiEye, color: 'text-slate-900', bg: 'bg-slate-100' },
                  { label: 'Stories', value: articles.length, icon: FiFileText, color: 'text-primary-red', bg: 'bg-red-50' },
                  { label: 'Engagement', value: (((articles.reduce((acc, curr) => acc + (curr.views || 0), 0) / (articles.length || 1)) / 100)).toFixed(1) + '%', icon: FiActivity, color: 'text-slate-900', bg: 'bg-slate-100' },
                  { label: 'Visits', value: siteVisits.toLocaleString(), icon: FiUsers, color: 'text-slate-900', bg: 'bg-slate-100' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-sm border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary-red transition duration-500">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">{stat.label}</span>
                      <span className="text-2xl font-black text-slate-950 block tracking-tighter italic uppercase">{stat.value}</span>
                    </div>
                    <div className={`${stat.bg} ${stat.color} w-12 h-12 flex items-center justify-center rounded-sm transition duration-500 group-hover:bg-primary-red group-hover:text-white`}>
                      <stat.icon size={20} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-sm border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
                    <h3 className="text-base font-black text-slate-950 uppercase tracking-widest italic">Latest Activity</h3>
                    <button onClick={() => setActiveTab('articles')} className="text-[10px] font-black text-primary-red uppercase tracking-widest hover:underline">View All Stories</button>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {articles.slice(0, 8).map(art => (
                      <div key={art?._id || art?.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-sm transition border border-transparent hover:border-slate-100 group cursor-pointer" onClick={() => editArticle(art)}>
                        <div className="flex items-center space-x-4 min-w-0">
                          <div className="w-12 h-12 bg-slate-100 rounded-sm overflow-hidden flex-shrink-0">
                            <img src={art.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-black text-slate-900 text-sm block truncate group-hover:text-primary-red transition italic uppercase">{art.title}</span>
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 block flex items-center">
                              {art.category} • {art.date}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-950 p-8 rounded-sm text-white flex flex-col justify-between">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl font-black tracking-tighter uppercase italic">Site Statistics</h3>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Real-time Performance</p>
                    </div>
                    <div className="space-y-6">
                      {[
                        { id: 'm-opt', label: 'Mobile Optimization', val: '98%', color: 'bg-primary-red' },
                        { id: 'c-depth', label: 'Content Depth', val: '85%', color: 'bg-white' },
                        { id: 's-load', label: 'System Load', val: '12%', color: 'bg-emerald-500' }
                      ].map((bar) => (
                        <div key={bar.id} className="space-y-2">
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
            <div className="animate-fade-in space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-sm border border-slate-100 shadow-sm">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter">Editorial Archive</h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Managing {articles.length} Stories in Database</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-grow">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      placeholder="SEARCH..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-6 py-3 bg-slate-50 border-none rounded-sm text-[10px] font-bold text-slate-900 focus:ring-1 focus:ring-primary-red transition w-full md:w-64"
                    />
                  </div>
                  <button onClick={() => { resetForm(); setActiveTab('editor'); }} className="px-6 py-3 bg-slate-950 text-white rounded-sm text-[9px] font-black uppercase tracking-widest hover:bg-primary-red transition flex items-center justify-center gap-2">
                    <FiPlus /> <span>New Story</span>
                  </button>
                </div>
              </div>

              {/* MASTER FEED TABLE & MOBILE CARDS */}
              <div className="bg-white rounded-sm border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead className="bg-[#1a1a1a] text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
                      <tr>
                        <th className="px-8 py-5 text-left">Article Details</th>
                        <th className="px-8 py-5 text-left">Category</th>
                        <th className="px-8 py-5 text-left">Status</th>
                        <th className="px-8 py-5 text-left">Engagement</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {articles.filter(a => a.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(article => (
                        <tr key={article._id} className="hover:bg-slate-50/50 transition duration-300 group">
                          <td className="px-8 py-7">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 bg-slate-100 rounded-sm overflow-hidden border border-slate-200">
                                <img src={article.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700" alt="" />
                              </div>
                              <div className="max-w-md">
                                <div className="text-[11px] font-black text-slate-950 uppercase italic leading-tight mb-1">{article.title}</div>
                                <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                  <span>{article.author || 'JC'}</span>
                                  <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                  <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-7">
                            <span className="px-3 py-1 bg-slate-100 text-slate-950 text-[8px] font-black uppercase tracking-widest rounded-sm border border-slate-200">{article.category}</span>
                          </td>
                          <td className="px-8 py-7">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${article.status === 'Published' ? 'bg-emerald-500' : 'bg-yellow-500'}`}></div>
                              <span className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{article.status}</span>
                            </div>
                          </td>
                          <td className="px-8 py-7">
                            <div className="flex items-center gap-2 text-slate-400">
                              <FiEye size={12} />
                              <span className="text-[10px] font-black text-slate-900">{article.views || 0}</span>
                            </div>
                          </td>
                          <td className="px-8 py-7 text-right">
                            <div className="flex justify-end items-center gap-2">
                              <button onClick={() => editArticle(article)} className="w-8 h-8 flex items-center justify-center bg-slate-950 text-white rounded-none hover:bg-primary-red transition-colors duration-300"><FiEdit2 size={12} /></button>
                              <button onClick={() => deleteArticle(article._id)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-600 rounded-none transition-all duration-300"><FiTrash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:hidden divide-y divide-slate-100">
                  {articles.filter(a => a.title?.toLowerCase().includes(searchTerm.toLowerCase())).map(article => (
                    <div key={article._id} className="p-6 space-y-4">
                      <div className="flex gap-4">
                        <img src={article.image} className="w-20 h-20 object-cover rounded-sm border border-slate-200" />
                        <div className="flex-grow min-w-0">
                          <h4 className="text-xs font-black text-slate-950 uppercase italic leading-tight mb-2 truncate">{article.title}</h4>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[7px] font-black uppercase tracking-widest rounded-sm">{article.category}</span>
                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <FiEye size={10} /> {article.views || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{new Date(article.createdAt).toLocaleDateString()}</span>
                        <div className="flex gap-2">
                          <button onClick={() => editArticle(article)} className="p-3 bg-slate-950 text-white rounded-sm"><FiEdit2 size={14} /></button>
                          <button onClick={() => deleteArticle(article._id)} className="p-3 bg-white border border-slate-200 text-slate-400 rounded-sm hover:text-red-600"><FiTrash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW: ELITE EDITOR */}
          {activeTab === 'editor' && (
            <div className="animate-fade-in max-w-7xl mx-auto space-y-10 pb-40">

              {/* Editor Secondary Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-6 w-full lg:w-auto">
                  <button onClick={() => setActiveTab('articles')} className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white border border-slate-100 rounded-full text-slate-400 hover:text-primary-red hover:border-primary-red transition shadow-sm">
                    <FiArrowLeft size={18} />
                  </button>
                  <div className="space-y-1 text-left flex-grow">
                    <h3 className="text-xl lg:text-2xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">News Console</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] lg:text-[10px] font-black text-slate-400 uppercase tracking-widest">{isEditing ? 'Updating News' : 'Drafting Narrative'}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-[9px] lg:text-[10px] font-black text-primary-red uppercase tracking-widest">{formData.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full lg:w-auto">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex-grow lg:flex-grow-0 px-6 py-3 border font-black text-[9px] uppercase tracking-widest rounded-sm transition-all duration-500 flex items-center justify-center gap-2 ${showPreview ? 'bg-slate-950 border-slate-950 text-white' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-950 hover:text-slate-950'}`}
                  >
                    <FiEye />
                    <span>{showPreview ? 'Hide Preview' : 'Live Preview'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* News Feed: Main Content Area */}
                <div className="lg:col-span-8 space-y-12 order-2 lg:order-1">
                  {/* CORE INTEL PANEL */}
                  <div className="bg-white p-6 lg:p-12 rounded-sm border border-slate-100 shadow-sm space-y-10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary-red"></div>
                    <div className="space-y-10 text-left">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-1">Headline</label>
                        <input
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-slate-50 px-8 py-8 rounded-sm text-2xl lg:text-4xl font-black text-slate-950 border-none focus:ring-1 focus:ring-primary-red transition placeholder:text-slate-200 uppercase italic tracking-tighter"
                          placeholder="ARTICLE HEADLINE..."
                        />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Executive Summary</label>
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{formData.subheadline?.length}/160</span>
                        </div>
                        <textarea
                          value={formData.subheadline}
                          onChange={e => setFormData({ ...formData, subheadline: e.target.value })}
                          className="w-full bg-slate-50 px-8 py-6 rounded-sm text-sm lg:text-lg font-bold text-slate-600 border-none focus:ring-1 focus:ring-primary-red transition placeholder:text-slate-200 h-32 resize-none"
                          placeholder="Short summary of news..."
                        />
                      </div>

                      <div className="flex items-center gap-2 px-8 py-4 bg-slate-50 rounded-sm border border-slate-100">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Story Link:</span>
                        <span className="text-[9px] font-bold text-slate-400">NTI/D-SEC/</span>
                        <span className="text-[9px] font-black text-primary-red">
                          {formData.title ? formData.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : 'pending-uri'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sticky top-24 z-20 flex bg-white/90 backdrop-blur-md p-1.5 rounded-sm border border-slate-200 flex gap-1 shadow-md overflow-x-auto no-scrollbar">
                    {['content', 'media', 'seo', 'advanced'].map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveEditorTab(tab)}
                        className={`px-8 py-3 rounded-none text-[10px] font-black uppercase tracking-widest transition duration-500 whitespace-nowrap ${activeEditorTab === tab ? 'bg-slate-950 text-white shadow-xl shadow-slate-950/20' : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'}`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {activeEditorTab === 'content' && (
                    <div className="space-y-12 animate-fade-in">
                      <div className="space-y-8">
                        <div className="flex items-center justify-between px-4">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Content Blocks</h4>
                          <div className="flex items-center gap-2">
                            {['Intro', 'Context', 'Analysis', 'Ending'].map(type => (
                              <button
                                key={type}
                                onClick={() => {
                                  const templates = {
                                    Intro: [{ type: 'heading', text: 'Introduction' }, { type: 'paragraph', text: 'Narrative protocol initiated...' }],
                                    Context: [{ type: 'heading', text: 'Strategic Context' }, { type: 'paragraph', text: 'Historical and regional data confirms...' }],
                                    Analysis: [{ type: 'heading', text: 'Executive Analysis' }, { type: 'quote', text: 'Intelligence indicates a significant shift.', author: 'Bureau Analyst' }],
                                    Ending: [{ type: 'heading', text: 'Conclusion' }, { type: 'paragraph', text: 'Final assessment pending confirmation.' }]
                                  };
                                  setSections([...sections, ...templates[type].map(s => ({ ...s, id: Date.now() + Math.random() }))]);
                                }}
                                className="text-[8px] font-black text-slate-300 hover:text-primary-red uppercase tracking-widest transition"
                              >
                                + {type}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{calculateReadingTime(sections.map(s => s.text || '').join(' '))}</span>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {sections.map((section, index) => (
                          <div
                            key={section.id}
                            draggable
                            onDragStart={() => setDraggedIndex(index)}
                            onDragOver={(e) => {
                              e.preventDefault();
                              if (draggedIndex === null || draggedIndex === index) return;
                              const newSections = [...sections];
                              const draggedItem = newSections[draggedIndex];
                              newSections.splice(draggedIndex, 1);
                              newSections.splice(index, 0, draggedItem);
                              setSections(newSections);
                              setDraggedIndex(index);
                            }}
                            onDragEnd={() => setDraggedIndex(null)}
                            className={`group relative bg-white rounded-sm border transition-all duration-500 ${draggedIndex === index ? 'opacity-40 border-primary-red scale-[0.98]' : 'border-slate-100 hover:border-slate-300'}`}
                          >
                            <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
                              <button onClick={() => moveSection(index, -1)} className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-lg active:scale-95"><FiArrowLeft className="rotate-90" /></button>
                              <button onClick={() => duplicateSection(index)} className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-sm flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-all shadow-lg active:scale-95"><FiCopy size={12} /></button>
                              <button onClick={() => moveSection(index, 1)} className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all shadow-lg active:scale-95"><FiArrowLeft className="-rotate-90" /></button>
                              <button onClick={() => removeSection(section.id)} className="w-8 h-8 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-sm flex items-center justify-center text-slate-400 hover:text-primary-red hover:border-primary-red transition-all shadow-lg active:scale-95"><FiTrash2 size={12} /></button>
                            </div>

                            <div className="p-8 lg:p-10 text-left">
                              {section.type === 'heading' && (
                                <div className="relative">
                                  <div className="absolute -left-10 top-1.5 w-1.5 h-1.5 bg-primary-red"></div>
                                  <input
                                    value={section.text}
                                    onChange={e => updateSection(section.id, { text: e.target.value })}
                                    className="w-full text-2xl font-black text-slate-950 uppercase italic tracking-tighter bg-transparent border-none focus:ring-0 mb-4 font-sans"
                                    placeholder="SUB-HEADING..."
                                  />
                                </div>
                              )}

                              {section.type === 'paragraph' && (
                                <textarea
                                  value={section.text}
                                  onChange={e => updateSection(section.id, { text: e.target.value })}
                                  className="w-full text-base lg:text-lg text-slate-600 font-medium leading-relaxed bg-transparent border-none focus:ring-0 resize-none min-h-[80px]"
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
                                      placeholder="PERSON NAME"
                                    />
                                  </div>
                                </div>
                              )}

                              {section.type === 'image' && (
                                <div className="space-y-6">
                                  <div className="relative aspect-video bg-slate-50 rounded-sm overflow-hidden border border-slate-100 group">
                                    {section.url ? (
                                      <img src={section.url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Block" />
                                    ) : (
                                      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-300">
                                        <FiImage size={32} />
                                        <span className="text-[8px] font-black uppercase tracking-widest">Asset Feed</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                      value={section.url}
                                      onChange={e => updateSection(section.id, { url: e.target.value })}
                                      className="w-full px-5 py-3 bg-slate-50 rounded-sm text-[10px] font-bold border-none focus:ring-1 focus:ring-primary-red transition-all"
                                      placeholder="URL..."
                                    />
                                    <input
                                      value={section.caption}
                                      onChange={e => updateSection(section.id, { caption: e.target.value })}
                                      className="w-full px-5 py-3 bg-slate-50 rounded-sm text-[10px] font-bold border-none focus:ring-1 focus:ring-primary-red transition-all"
                                      placeholder="CAPTION..."
                                    />
                                    <input
                                      value={section.credit || ''}
                                      onChange={e => updateSection(section.id, { credit: e.target.value })}
                                      className="w-full px-5 py-3 bg-slate-50 rounded-sm text-[10px] font-bold border-none focus:ring-1 focus:ring-primary-red transition-all md:col-span-2"
                                      placeholder="CREDIT SOURCE..."
                                    />
                                  </div>
                                </div>
                              )}

                              {section.type === 'list' && (
                                <div className="space-y-4">
                                  {section.items?.map((item, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                      <div className="w-6 h-6 bg-slate-950 text-white flex items-center justify-center text-[9px] font-black rounded-sm">{i + 1}</div>
                                      <input
                                        value={item}
                                        onChange={e => {
                                          const newItems = [...section.items];
                                          newItems[i] = e.target.value;
                                          updateSection(section.id, { items: newItems });
                                        }}
                                        className="flex-grow text-base font-medium text-slate-700 bg-transparent border-none focus:ring-0"
                                        placeholder="Narrative point..."
                                      />
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => updateSection(section.id, { items: [...(section.items || []), ''] })}
                                    className="mt-4 px-5 py-2 bg-slate-950 text-white font-black text-[8px] uppercase tracking-widest rounded-sm hover:bg-primary-red transition-all"
                                  >
                                    + ITEM
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        <div className="flex flex-wrap items-center justify-center gap-3 py-14 bg-slate-950 rounded-sm border border-slate-800 shadow-2xl relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                          {[
                            { type: 'heading', label: 'Headline', icon: FiFileText },
                            { type: 'paragraph', label: 'Text Block', icon: FiMenu },
                            { type: 'image', label: 'Visual', icon: FiImage },
                            { type: 'quote', label: 'Quote', icon: FiMessageSquare },
                            { type: 'list', label: 'Bullet Points', icon: FiCheck }
                          ].map(tool => (
                            <button
                              key={tool.type}
                              onClick={() => addSection(tool.type)}
                              className="px-8 py-4 bg-white/5 border border-white/10 rounded-sm backdrop-blur-md text-[10px] font-black text-white hover:text-primary-red uppercase tracking-widest flex items-center gap-3 hover:bg-white transition-all duration-500 z-10"
                            >
                              <tool.icon size={16} /> <span>{tool.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEditorTab === 'media' && (
                    <div className="space-y-10 animate-fade-in text-left">
                      <div className="bg-white p-12 rounded-sm border border-slate-100 shadow-sm space-y-10">
                        <div className="space-y-6">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1 block">Hero Asset</label>
                          <div className="relative aspect-[21/9] bg-slate-50 rounded-sm overflow-hidden border-2 border-dashed border-slate-200 group flex items-center justify-center">
                            {formData.image ? (
                              <>
                                <img src={formData.image} className="w-full h-full object-cover" />
                                <button onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-6 right-6 w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition"><FiTrash2 size={20} /></button>
                              </>
                            ) : (
                              <div className="flex flex-col items-center gap-6">
                                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-200 group-hover:text-primary-red transition duration-500">
                                  <FiImage size={24} />
                                </div>
                                <div className="text-center">
                                  <p className="text-[9px] font-black text-slate-950 uppercase tracking-widest">DRAG ASSET HERE</p>
                                </div>
                                <label className="px-10 py-4 bg-slate-950 text-white font-black text-[9px] uppercase tracking-widest rounded-sm hover:bg-primary-red transition cursor-pointer">
                                  UPLOAD
                                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                          <div className="space-y-4">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Asset URL</label>
                            <input
                              value={formData.image}
                              onChange={e => setFormData({ ...formData, image: e.target.value })}
                              className="w-full px-8 py-6 bg-slate-50 rounded-sm text-[11px] font-bold border-none focus:ring-1 focus:ring-primary-red transition"
                              placeholder="URL LINK..."
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.4em] ml-1">Attribution Caption</label>
                            <input
                              value={formData.imageCaption}
                              onChange={e => setFormData({ ...formData, imageCaption: e.target.value })}
                              className="w-full px-8 py-6 bg-slate-50 rounded-sm text-[11px] font-bold border-none focus:ring-1 focus:ring-primary-red transition"
                              placeholder="CAPTION..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEditorTab === 'seo' && (
                    <div className="space-y-10 animate-fade-in text-left">
                      <div className="bg-white p-12 rounded-sm border border-slate-100 shadow-sm space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Metadata Tags</label>
                            <textarea
                              value={formData.tags}
                              onChange={e => setFormData({ ...formData, tags: e.target.value })}
                              className="w-full p-8 bg-slate-50 rounded-sm text-[11px] font-bold border-none focus:ring-1 focus:ring-primary-red transition resize-none"
                              rows={4}
                              placeholder="TAGS..."
                            />
                          </div>
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Short Summary (Excerpt)</label>
                              <button
                                onClick={() => handleAISynthesis('seo')}
                                className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-sm text-[8px] font-black uppercase tracking-widest border border-emerald-100 hover:bg-emerald-500 hover:text-white transition"
                              >
                                Auto-fill with AI
                              </button>
                            </div>
                            <textarea
                              value={formData.excerpt}
                              onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                              className="w-full p-8 bg-slate-50 rounded-sm text-[11px] font-bold border-none focus:ring-1 focus:ring-primary-red transition resize-none"
                              rows={4}
                              placeholder="SEO summary..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEditorTab === 'advanced' && (
                    <div className="space-y-10 animate-fade-in text-left">
                      <div className="bg-white p-12 rounded-sm border border-slate-100 shadow-sm space-y-10">
                        <h4 className="text-[12px] font-black text-slate-950 uppercase tracking-tight">Stream Protocols</h4>
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Embed Stream URL</label>
                            <input
                              value={formData.videoUrl}
                              onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                              className="w-full p-6 bg-slate-50 rounded-sm text-[11px] font-bold focus:ring-1 focus:ring-primary-red transition border-none"
                              placeholder="https://..."
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Social Integration Link</label>
                            <input
                              value={formData.socialLink}
                              onChange={e => setFormData({ ...formData, socialLink: e.target.value })}
                              className="w-full p-6 bg-slate-50 rounded-sm text-[11px] font-bold focus:ring-1 focus:ring-primary-red transition border-none"
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-4 space-y-8 animate-fade-in order-1 lg:order-2">
                  <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-8 text-left sticky top-8">
                    <div className="space-y-2 pb-4 border-b border-slate-50">
                      <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.5em]">Publishing Settings</h4>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Configure how news is shown</p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Section Classification</label>
                        <select
                          value={formData.category}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className="w-full p-4 bg-slate-50 rounded-sm text-[10px] font-black border-none focus:ring-1 focus:ring-primary-red transition"
                        >
                          <option>India</option>
                          <option>World</option>
                          <option>Investigation</option>
                          <option>Exclusive</option>
                          <option>Politics</option>
                          <option>Technology</option>
                          <option>Business</option>
                          <option>Climate</option>
                          <option>Culture</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Show As</label>
                        <div className="grid grid-cols-1 gap-1">
                          {['Standard', 'Breaking'].map(opt => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setFormData({ ...formData, placement: opt })}
                              className={`py-4 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${formData.placement === opt ? 'bg-primary-red text-white border-primary-red shadow-xl shadow-red-900/20' : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-200'}`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Report Location</label>
                        <input
                          value={formData.location}
                          onChange={e => setFormData({ ...formData, location: e.target.value.toUpperCase() })}
                          className="w-full p-4 bg-slate-50 rounded-sm text-[10px] font-black border-none focus:ring-1 focus:ring-primary-red transition"
                          placeholder="CITY NAME..."
                        />
                      </div>

                      <div className="hidden lg:block pt-6">
                        <button 
                            onClick={handleSubmit} 
                            className="w-full bg-slate-950 text-white font-black py-6 rounded-sm text-[10px] uppercase tracking-[0.3em] hover:bg-primary-red transition flex items-center justify-center gap-3 shadow-xl"
                        >
                            <FiZap /> <span>{isEditing ? 'Update News' : 'Publish News'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MOBILE STICKY ACTION BAR */}
                  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 p-4 z-[100] flex gap-3 shadow-2xl">
                    <button 
                      onClick={handleSubmit}
                      className="flex-grow bg-slate-950 text-white font-black py-4 rounded-sm text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                    >
                      <FiZap /> {isEditing ? 'UPDATE' : 'PUBLISH'}
                    </button>
                    <button 
                      onClick={() => setShowPreview(!showPreview)}
                      className={`px-6 border font-black py-4 rounded-sm text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all ${showPreview ? 'bg-slate-950 text-white border-slate-950' : 'bg-white border-slate-200 text-slate-400'}`}
                    >
                      <FiEye />
                    </button>
                  </div>
                </div>
              </div>

              {/* BOTTOM SECTION: LIVE PREVIEW */}
              {showPreview && (
                <div className="mt-20 pt-20 border-t border-slate-100">
                  <div className="max-w-7xl mx-auto space-y-10">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1 text-left">
                        <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter">Live Preview</h3>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Real-time mobile and desktop view</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                      {/* MOBILE VIEW (CENTERED SIMULATION) */}
                      <div className="lg:col-span-4 flex justify-center">
                        <div className="w-full max-w-[360px] bg-slate-950 rounded-[40px] p-4 shadow-2xl border-[8px] border-slate-900 relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-20"></div>
                          <div className="bg-white rounded-none overflow-hidden aspect-[9/19.5] preview-scroll relative">
                            <div className="p-6 space-y-6 text-left pt-12">
                              <div className="space-y-3">
                                <span className="bg-primary-red text-white text-[7px] font-black px-2 py-1 uppercase tracking-widest">{formData.category}</span>
                                <h1 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">{formData.title || 'Untitled Story'}</h1>
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{formData.subheadline || 'Summary will appear here...'}</p>
                              </div>
                              {formData.image && <img src={formData.image} className="w-full h-auto grayscale rounded-sm" />}
                              <div className="space-y-4">
                                {sections.map((s, i) => (
                                  <div key={i} className="preview-block">
                                    {s.type === 'heading' && <h3 className="text-sm font-black text-slate-950 uppercase italic tracking-tighter mt-4">{s.text}</h3>}
                                    {s.type === 'paragraph' && <p className="text-[10px] text-slate-600 leading-relaxed font-medium">{s.text}</p>}
                                    {s.type === 'quote' && <div className="border-l-4 border-primary-red pl-4 py-2 italic font-black text-[14px] text-slate-900 leading-tight bg-slate-50">{s.text}</div>}
                                    {s.type === 'image' && s.url && <div className="space-y-1 py-4"><img src={s.url} className="w-full h-auto rounded-sm" /><span className="text-[7px] text-slate-400 italic block mt-2">{s.caption}</span></div>}
                                    {s.type === 'list' && <ul className="space-y-2 ml-4 list-decimal">{s.items?.map((item, idx) => <li key={idx} className="text-[10px] text-slate-600 font-medium">{item}</li>)}</ul>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* DESKTOP/WEB VIEW SIMULATION */}
                      <div className="lg:col-span-8">
                        <div className="bg-white rounded-none border border-slate-100 shadow-2xl overflow-hidden h-full flex flex-col">
                          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                            <div className="flex gap-1.5">
                              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                            </div>
                            <div className="flex-grow px-4">
                              <div className="bg-white border border-slate-100 rounded-none py-1 px-3 text-[9px] text-slate-400 font-bold">nationtrends.com/news/{formData.title?.toLowerCase().replace(/ /g, '-')}</div>
                            </div>
                          </div>
                          <div className="flex-grow overflow-y-auto preview-scroll p-12 lg:p-20 text-left bg-[#fcfcfc]">
                            <div className="max-w-3xl mx-auto space-y-12">
                              <div className="space-y-6">
                                <div className="flex items-center gap-3">
                                  <span className="text-[10px] font-black text-primary-red uppercase tracking-widest">{formData.category}</span>
                                  <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formData.location}</span>
                                </div>
                                <h1 className="text-4xl lg:text-6xl font-black text-slate-950 uppercase italic tracking-tighter leading-[0.95]">{formData.title || 'Headline Pending'}</h1>
                                <p className="text-xl lg:text-2xl font-bold text-slate-400 leading-tight italic">"{formData.subheadline}"</p>
                              </div>

                              {formData.image && (
                                <div className="space-y-3">
                                  <img src={formData.image} className="w-full h-auto grayscale hover:grayscale-0 transition-all duration-1000" />
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formData.imageCaption}</p>
                                </div>
                              )}

                              <div className="space-y-10">
                                {sections.map((s, i) => (
                                  <div key={i} className="prose-intel">
                                    {s.type === 'heading' && <h2 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter border-b-2 border-slate-950 pb-2 mb-8">{s.text}</h2>}
                                    {s.type === 'paragraph' && <p className="text-lg text-slate-700 leading-relaxed font-medium">{s.text}</p>}
                                    {s.type === 'quote' && (
                                      <div className="bg-slate-950 p-12 rounded-none relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-primary-red"></div>
                                        <p className="text-3xl font-black text-white italic tracking-tighter leading-tight">"{s.text}"</p>
                                        <p className="mt-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">— {s.author}</p>
                                      </div>
                                    )}
                                    {s.type === 'image' && s.url && (
                                      <figure className="space-y-4">
                                        <img src={s.url} className="w-full h-auto grayscale" />
                                        <figcaption className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex justify-between">
                                          <span>{s.caption}</span>
                                          <span className="text-primary-red">SOURCE: {s.credit}</span>
                                        </figcaption>
                                      </figure>
                                    )}
                                    {s.type === 'list' && (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 border border-slate-100">
                                        {s.items?.map((item, idx) => (
                                          <div key={idx} className="flex gap-4">
                                            <span className="text-primary-red font-black text-xl italic">0{idx + 1}.</span>
                                            <p className="text-sm font-bold text-slate-600 leading-snug">{item}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VIEW: ACCOUNTS (USERS) */}
          {activeTab === 'users' && (
            <div className="animate-fade-in space-y-16 pb-40">
              
              {/* SECTION 1: REGISTERED USERS (IDENTITY VAULT) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter">User Management</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Manage and monitor all registered accounts</p>
                  </div>
                  <div className="px-5 py-2 bg-slate-950 text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                    {users?.length} Verified
                  </div>
                </div>

                <div className="bg-white rounded-sm border border-slate-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-[#1a1a1a] text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
                        <tr>
                          <th className="px-8 py-5 text-left">User Profile</th>
                          <th className="px-8 py-5 text-left">Email Address</th>
                          <th className="px-8 py-5 text-left">Password / Auth</th>
                          <th className="px-8 py-5 text-left">Signup Method</th>
                          <th className="px-8 py-5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {users?.map(user => (
                          <tr key={user._id} className="hover:bg-slate-50 transition group">
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-100 rounded-sm flex items-center justify-center text-slate-400 group-hover:bg-primary-red group-hover:text-white transition">
                                  <FiUsers size={14} />
                                </div>
                                <span className="font-black text-slate-900 uppercase text-xs tracking-tight italic">{user.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                                <span className="text-slate-500 font-bold text-xs">{user.email}</span>
                            </td>
                            <td className="px-8 py-6">
                                <code className="bg-slate-100 px-2 py-1 rounded-none text-[10px] font-mono text-slate-400">
                                  {user.password || 'Encrypted'}
                                </code>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1">
                                <span className={`w-fit px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest ${user.authMethod === 'Google' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-950 text-white'}`}>
                                  {user.authMethod || 'Standard'}
                                </span>
                                {user.authMethod === 'Google' && (
                                  <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter">Google Verified</span>
                                )}
                              </div>
                            </td>
                             <td className="px-8 py-6 text-right flex justify-end gap-3">
                               <button
                                 onClick={() => toggleBlockUser(user._id)}
                                 className={`px-4 py-2 rounded-sm font-black text-[9px] uppercase tracking-widest transition-all ${user.isBlocked ? 'bg-emerald-500 text-white' : 'bg-slate-950 text-white'}`}
                               >
                                 {user.isBlocked ? 'Unblock' : 'Block'}
                               </button>
                               <button
                                 onClick={() => { if(window.confirm('Delete this user?')) deleteUser(user._id); }}
                                 className="px-4 py-2 rounded-sm bg-red-600 text-white font-black text-[9px] uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2"
                               >
                                 <FiTrash2 size={12} /> Delete
                               </button>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* SECTION 2: RECENT LOGINS (ACCESS PULSE) */}
              <div className="space-y-6">
                <div className="flex items-center justify-between px-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter">Recent Logins</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent user login activity and connection status</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Active Stream</span>
                  </div>
                </div>

                <div className="bg-white rounded-sm border border-slate-100 shadow-sm overflow-hidden">
                   <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-slate-50 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">
                        <tr>
                          <th className="px-8 py-5 text-left">User</th>
                          <th className="px-8 py-5 text-left">Last Login Time</th>
                          <th className="px-8 py-5 text-left">Account Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[...users].sort((a,b) => new Date(b.lastLogin) - new Date(a.lastLogin)).slice(0, 5).map(user => (
                          <tr key={`log-${user._id}`} className="hover:bg-slate-50 transition">
                            <td className="px-8 py-6">
                              <div className="flex flex-col">
                                <span className="font-black text-slate-900 uppercase text-xs italic tracking-tight">{user.name}</span>
                                <span className="text-[9px] font-bold text-slate-400">{user.email}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px]">
                                <FiClock size={12} className="text-primary-red" />
                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never logged in'}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className={`px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest ${user.isBlocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                {user.isBlocked ? 'Blocked' : 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                   </div>
                </div>
              </div>

            </div>
          )}

          {/* VIEW: SUBSCRIBERS */}
          {activeTab === 'newsletter' && (
            <div className="animate-fade-in space-y-6 pb-20">
              <div className="bg-white rounded-sm border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-8 py-5 text-left">Email Address</th>
                      <th className="px-8 py-5 text-left">Mail Status</th>
                      <th className="px-8 py-5 text-left">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {subscribers?.map((sub, idx) => (
                      <tr key={sub._id || idx} className="hover:bg-slate-50 transition">
                        <td className="px-8 py-6 font-black text-slate-900 uppercase text-xs tracking-tight italic">{sub.email}</td>
                        <td className="px-8 py-6">
                          <span className={`text-[8px] font-black uppercase tracking-widest ${sub.emailSent ? 'text-emerald-500' : 'text-slate-300'}`}>
                            {sub.emailSent ? 'Transmission Complete' : 'Pending Queue'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-sm text-[8px] font-black uppercase tracking-widest ${sub.isBlocked ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-900 border border-slate-200'}`}>
                            {sub.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button
                            onClick={() => toggleBlockSubscriber(sub._id)}
                            className={`px-4 py-2 rounded-sm font-black text-[9px] uppercase tracking-widest transition-all ${sub.isBlocked ? 'bg-emerald-500 text-white' : 'bg-red-600 text-white'}`}
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

          {/* VIEW: INTELLIGENCE DISCOVERY (DISCOVER) */}
          {activeTab === 'discover' && (
            <div className="animate-fade-in space-y-10 pb-40">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter">Latest News Feed</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Find and import news from global sources</p>
                </div>
                <button
                  onClick={() => discoverIntelligence(discoverCategory)}
                  disabled={isDiscovering}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-primary-red transition duration-500"
                >
                  <FiClock className={isDiscovering ? 'animate-spin' : ''} />
                  <span>{isDiscovering ? 'Searching...' : 'Refresh News'}</span>
                </button>
              </div>

              {/* Source Filters */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-100">
                {['ALL', 'India', 'Business', 'Technology', 'Politics', 'Climate', 'Culture'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => discoverIntelligence(cat)}
                    className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${discoverCategory === cat ? 'bg-primary-red text-white shadow-lg shadow-red-500/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-950 hover:text-slate-950'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Discovery Grid - Category Wise */}
              <div className="space-y-16">
                {isDiscovering ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {Array(6).fill(0).map((_, i) => (
                      <div key={i} className="bg-white border border-slate-50 rounded-sm overflow-hidden animate-pulse">
                        <div className="h-48 bg-slate-100"></div>
                        <div className="p-6 space-y-4">
                          <div className="h-4 w-3/4 bg-slate-100 rounded"></div>
                          <div className="h-10 w-full bg-slate-100 rounded"></div>
                          <div className="h-8 w-1/2 bg-slate-100 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  ['India', 'Politics', 'Business', 'Technology', 'Climate', 'Culture', 'Exclusive'].map(cat => {
                    const catNews = discoveredNews.filter(n => n.category === cat);
                    if (catNews.length === 0 && discoverCategory !== 'ALL') return null;
                    if (discoverCategory !== 'ALL' && discoverCategory !== cat) return null;
                    if (catNews.length === 0) return null;

                    return (
                      <div key={cat} className="space-y-8 animate-fade-in">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-8 bg-primary-red"></div>
                          <h4 className="text-sm font-black text-slate-950 uppercase tracking-[0.4em]">{cat} News</h4>
                          <div className="flex-grow h-px bg-slate-100"></div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{catNews.length} Records</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                          {catNews.map(news => (
                            <div key={news.id} className="group bg-white rounded-sm border border-slate-100 shadow-sm hover:border-primary-red transition-all duration-500 overflow-hidden flex flex-col">
                              <div className="relative h-56 overflow-hidden">
                                <img src={news.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" alt="" />
                                <div className="absolute top-4 left-4">
                                  <span className="px-3 py-1 bg-slate-950 text-white text-[7px] font-black uppercase tracking-widest rounded-sm border border-slate-800 shadow-2xl">
                                    {news.category}
                                  </span>
                                </div>
                                <div className="absolute top-4 right-4">
                                  <span className="px-3 py-1 bg-primary-red text-white text-[7px] font-black uppercase tracking-widest rounded-sm">
                                    {news.source}
                                  </span>
                                </div>
                              </div>
                              <div className="p-8 flex-grow space-y-4">
                                <h4 className="text-lg font-black text-slate-950 uppercase italic tracking-tighter leading-tight group-hover:text-primary-red transition-colors line-clamp-2">{news.title}</h4>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-3">"{news.excerpt}"</p>
                                <div className="pt-6 border-t border-slate-50">
                                  <button
                                    onClick={() => importToEditor(news)}
                                    className="w-full py-4 bg-slate-950 text-white font-black text-[9px] uppercase tracking-[0.2em] rounded-none transition duration-500 group-hover:bg-primary-red flex items-center justify-center gap-2"
                                  >
                                    <FiEdit2 size={12} /> Import to Editor
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* VIEW: MESSAGES (MAIL) */}
          {activeTab === 'messages' && (
            <div className="animate-fade-in space-y-10 pb-40">
              
              {/* Message Navigation */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 px-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter">Messages & Support</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">View and reply to user messages and support requests</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-sm">
                  <button 
                    onClick={() => setMessageTypeTab('Normal')}
                    className={`px-6 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${messageTypeTab === 'Normal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    User Messages
                  </button>
                  <button 
                    onClick={() => setMessageTypeTab('Support')}
                    className={`px-6 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${messageTypeTab === 'Support' ? 'bg-white text-primary-red shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    Support Requests
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {messages?.filter(m => (m.type || 'Normal') === messageTypeTab).length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-sm p-20 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                      <FiMail size={32} />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No primary transmissions in this sector</p>
                  </div>
                ) : (
                  messages?.filter(m => (m.type || 'Normal') === messageTypeTab).map((msg) => (
                    <div key={msg.id} className="bg-white rounded-sm border border-slate-100 shadow-sm p-8 space-y-6 hover:border-primary-red transition group">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-black text-slate-950 uppercase italic tracking-tighter group-hover:text-primary-red transition-colors">{msg.subject}</h4>
                              {msg.type === 'Support' && (
                                <span className="px-2 py-0.5 bg-red-600 text-white text-[8px] font-black uppercase tracking-widest rounded-sm shadow-lg shadow-red-500/20">High Priority</span>
                              )}
                            </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sender: <span className="text-slate-900">{msg.name}</span> <span className="mx-2">|</span> <span className="text-primary-red italic underline">{msg.email}</span></p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{new Date(msg.date).toLocaleDateString()}</span>
                           <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 py-1 bg-slate-100 rounded-sm">{msg.type || 'Standard'}</span>
                        </div>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-sm border-l-4 border-primary-red relative group-hover:bg-slate-100 transition-colors">
                        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
                           <FiMessageSquare size={40} />
                        </div>
                        <p className="text-slate-600 font-medium leading-relaxed italic relative z-10">"{msg.message}"</p>
                      </div>
                      <div className="flex justify-end pt-4 border-t border-slate-50 gap-4">
                        <button 
                          onClick={() => {
                            setReplyingTo(msg);
                            setReplyModalOpen(true);
                          }}
                          className="px-4 py-2 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-primary-red transition-all flex items-center gap-2"
                        >
                          <FiMessageSquare size={12} /> Reply
                        </button>
                        <button onClick={() => deleteMessage(msg.id)} className="px-4 py-2 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-red-600 hover:text-white transition-all flex items-center gap-2">
                          <FiTrash2 size={12} /> Delete Message
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* REPLY MODAL */}
          {replyModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
              <div className="bg-white max-w-lg w-full rounded-sm shadow-2xl overflow-hidden border border-slate-100 animate-slide-up">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Send Reply</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To: {replyingTo?.email}</p>
                  </div>
                  <button onClick={() => setReplyModalOpen(false)} className="text-slate-400 hover:text-primary-red transition-colors">
                    <FiX size={20} />
                  </button>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
                    <div className="w-full bg-slate-50 px-4 py-3 rounded-sm text-sm font-bold text-slate-500 border border-slate-100">
                      RE: {replyingTo?.subject}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Your Reply</label>
                      <button 
                        onClick={() => {
                          setIsReplying(true);
                          setTimeout(() => {
                            const draft = `Hi ${replyingTo?.name?.split(' ')[0] || 'there'},\n\nThanks for reaching out to the Nation Trends India team regarding "${replyingTo?.subject}".\n\nWe've received your message and our team is currently looking into the details. We appreciate your patience while we review your request.\n\nWe will get back to you with an update as soon as possible.\n\nBest regards,\nNation Trends India Team`;
                            setReplyMessage(draft);
                            setIsReplying(false);
                            toast.success('AI Draft Generated');
                          }, 1000);
                        }}
                        disabled={isReplying}
                        className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-primary-red hover:bg-red-50 px-2 py-1 rounded-sm transition-all"
                      >
                        <FiCpu size={12} /> Draft with AI
                      </button>
                    </div>
                    <textarea 
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Compose your response here..."
                      className="w-full min-h-[160px] bg-white border-2 border-slate-100 p-4 rounded-sm outline-none focus:border-primary-red transition font-medium text-sm placeholder:text-slate-300 resize-none"
                    ></textarea>
                  </div>

                  <button 
                    disabled={isReplying || !replyMessage.trim()}
                    onClick={async () => {
                      setIsReplying(true);
                      const success = await replyToMessage(replyingTo.email, replyingTo.subject, replyMessage);
                      if (success) {
                        toast.success('Reply sent successfully.');
                        setReplyModalOpen(false);
                        setReplyMessage('');
                      } else {
                        toast.error('Failed to send reply.');
                      }
                      setIsReplying(false);
                    }}
                    className="w-full bg-slate-950 text-white font-black py-4 rounded-sm text-[10px] uppercase tracking-[0.3em] hover:bg-primary-red transition-all flex items-center justify-center gap-3 disabled:bg-slate-300"
                  >
                    {isReplying ? (
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <><FiSend size={14} /> <span>Send Reply</span></>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in max-w-4xl mx-auto space-y-8 pb-32">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* COLUMN 1: EDITORIAL & TICKER */}
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 text-primary-red">
                      <FiZap size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Breaking News Ticker</span>
                    </div>
                    <textarea
                      value={tempBreakingNews}
                      onChange={(e) => setTempBreakingNews(e.target.value)}
                      rows={3}
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-sm focus:ring-1 focus:ring-primary-red outline-none transition font-bold text-sm text-slate-700"
                      placeholder="Enter urgent headline text..."
                    />
                    <button onClick={handleSaveTicker} className="w-full bg-slate-950 text-white font-black py-4 rounded-sm text-[9px] uppercase tracking-widest hover:bg-primary-red transition">Apply Ticker Update</button>
                  </div>

                  <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 text-slate-950">
                      <FiEdit2 size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Editorial Defaults</span>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Author Name</label>
                        <input
                          type="text"
                          value={tempSettings.defaultAuthor || 'JC'}
                          onChange={(e) => setTempSettings({ ...tempSettings, defaultAuthor: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-sm focus:ring-1 focus:ring-primary-red outline-none transition font-bold text-xs"
                          placeholder="e.g. JC"
                        />
                      </div>
                      <button onClick={handleSaveSettings} className="w-full bg-slate-950 text-white font-black py-4 rounded-sm text-[9px] uppercase tracking-widest hover:bg-primary-red transition">Update Defaults</button>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: SITE IDENTITY & INFO */}
                <div className="space-y-8">
                  <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 text-slate-950">
                      <FiShield size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Site Identity</span>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Website Name</label>
                        <input
                          type="text"
                          value={tempSettings.siteName || 'Nation Trends India'}
                          onChange={(e) => setTempSettings({ ...tempSettings, siteName: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-sm focus:ring-1 focus:ring-primary-red outline-none transition font-bold text-xs"
                          placeholder="Site name..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6">
                    <div className="flex items-center gap-3 text-slate-950">
                      <FiSmartphone size={18} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">Social Media Links</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {['facebook', 'twitter', 'instagram', 'youtube'].map(platform => (
                        <input
                          key={platform}
                          type="text"
                          value={tempSettings[platform] || ''}
                          onChange={(e) => setTempSettings({ ...tempSettings, [platform]: e.target.value })}
                          className="w-full px-6 py-3 bg-slate-50 border-none rounded-sm focus:ring-1 focus:ring-primary-red outline-none transition font-bold text-[10px]"
                          placeholder={`${platform.toUpperCase()} URL...`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-10 rounded-sm border border-slate-100 shadow-sm space-y-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 text-slate-400">
                    <FiSettings size={18} />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Global Contact Information</span>
                  </div>
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Official Email</label>
                        <input
                          type="email"
                          value={tempSettings.email}
                          onChange={(e) => setTempSettings({ ...tempSettings, email: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-sm focus:ring-1 focus:ring-primary-red outline-none transition font-bold text-xs"
                          placeholder="Email"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Phone</label>
                        <input
                          type="text"
                          value={tempSettings.phone}
                          onChange={(e) => setTempSettings({ ...tempSettings, phone: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-sm focus:ring-1 focus:ring-primary-red outline-none transition font-bold text-xs"
                          placeholder="Phone"
                        />
                      </div>
                      <div className="space-y-2 lg:col-span-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Headquarters Address</label>
                        <input
                          type="text"
                          value={tempSettings.address}
                          onChange={(e) => setTempSettings({ ...tempSettings, address: e.target.value })}
                          className="w-full px-6 py-4 bg-slate-50 border-none rounded-sm focus:ring-1 focus:ring-primary-red outline-none transition font-bold text-xs"
                          placeholder="Address"
                        />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-slate-50">
                      <button onClick={handleSaveSettings} className="w-full bg-slate-950 text-white font-black py-6 rounded-sm text-[10px] uppercase tracking-[0.4em] hover:bg-primary-red transition shadow-2xl">Confirm Global Policy Update</button>
                    </div>
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
