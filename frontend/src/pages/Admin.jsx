import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPlus, FiEdit2, FiTrash2, FiLogOut, FiCheck, FiX, FiLayout, FiFileText, FiSettings, FiImage, FiActivity, FiUsers, FiEye, FiSearch, FiSave, FiArrowLeft, FiCpu, FiCopy, FiZap, FiClock, FiShield, FiMenu, FiMessageSquare, FiMail, FiSmartphone, FiSend, FiChevronDown } from 'react-icons/fi';
import { useNews } from '../context/NewsContext';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  useEffect(() => {
    setTempSettings({ ...siteSettings });
    setTempBreakingNews(breakingNews);
  }, [siteSettings, breakingNews]);



  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeEditorTab, setActiveEditorTab] = useState('content');
  const [messageTypeTab, setMessageTypeTab] = useState('Normal');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subheadline: '',
    category: 'India',
    subcategory: '',
    country: 'India',
    state: '',
    city: '',
    image: '',
    imageCaption: '',
    imageAlt: '',
    multipleImages: [],
    excerpt: '',
    author: 'JC',
    authorImage: '',
    status: 'Published',
    placement: 'Standard',
    isFeatured: false,
    isTrending: false,
    publishDate: new Date().toISOString().split('T')[0],
    highlights: ['', '', ''],
    tags: '',
    metaTitle: '',
    metaDescription: '',
    fullContent: '', // Single input for the entire article
    sourceUrl: '',
    videoUrl: '',
    socialLink: ''
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

  useEffect(() => {
    if (!isEditing) {
      setFormData(prev => ({
        ...prev,
        slug: prev.title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
      }));
    }
  }, [formData.title, isEditing]);

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

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const categories = ['India', 'World', 'Politics', 'Technology', 'Business', 'Climate', 'Sports', 'Entertainment', 'Culture', 'Investigation', 'Exclusive'];

  const handleImageUpload = (e, target = 'image', sectionId = null) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8000000) {
        toast.error("Image too large. Please keep under 8MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'image') setFormData({ ...formData, image: reader.result });
        else if (target === 'multiple') setFormData({ ...formData, multipleImages: [...formData.multipleImages, reader.result] });
        else if (target === 'section' && sectionId) {
          updateSection(sectionId, { url: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title) return toast.error('Article title is required.');
    if (!formData.category) return toast.error('Please select a category.');
    if (!formData.image && formData.status === 'Published') return toast.error('An image is required for published articles.');
    if (formData.highlights.filter(h => h.trim() !== '').length < 3) return toast.error('Please add at least 3 highlights.');
    if (!formData.fullContent && sections.length === 0) return toast.error('Article content is required.');

    // Convert fullContent into paragraphs and merge with modular sections
    let finalSections = [];
    if (formData.fullContent) {
      const paragraphs = formData.fullContent.split('\n\n').filter(p => p.trim() !== '').map((text, i) => ({
        id: Date.now() + i,
        type: 'paragraph',
        text: text.trim()
      }));
      finalSections = [...paragraphs];
    }

    // Add any modular blocks (Headings, Images, FAQ) that were added manually
    if (sections.length > 0) {
      finalSections = [...finalSections, ...sections];
    }

    const allText = formData.fullContent || finalSections.map(s => s.text || (s.items ? s.items.map(i => i.q + ' ' + i.a).join(' ') : '')).join(' ');

    const articleData = {
      ...formData,
      content: finalSections,
      readingTime: calculateReadingTime(allText),
      date: formData.publishDate ? new Date(formData.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    try {
      if (isEditing) {
        await updateArticle(editId, articleData);
        toast.success('Article updated successfully');
        setIsEditing(false);
        setEditId(null);
      } else {
        await addArticle(articleData);
        toast.success('Article published successfully');
      }

      if (articleData.placement === 'Breaking') {
        const tickerText = `${articleData.title.toUpperCase()} /// ${breakingNews}`;
        updateBreakingNews(tickerText);
      }

      resetForm();
      setActiveTab('articles');
    } catch (err) {
      toast.error('Failed to save article. Please try again.');
    }
  };
  const resetForm = () => {
    setFormData({
      title: '', slug: '', subheadline: '', category: 'India', subcategory: '',
      country: 'India', state: '', city: '', image: '', imageCaption: '', imageAlt: '',
      multipleImages: [], excerpt: '', author: 'JC', authorImage: '',
      status: 'Published', placement: 'Standard', isFeatured: false, isTrending: false,
      publishDate: new Date().toISOString().split('T')[0], highlights: ['', '', ''],
      tags: '', metaTitle: '', metaDescription: '', fullContent: '',
      sourceUrl: '', videoUrl: '', socialLink: ''
    });
    setSections([]);
  };

  const editArticle = (article) => {
    setFormData({
      title: article.title,
      slug: article.slug,
      subheadline: article.subheadline || '',
      category: article.category,
      subcategory: article.subcategory || '',
      country: article.country || 'India',
      state: article.state || '',
      city: article.city || '',
      image: article.image,
      imageCaption: article.imageCaption || '',
      imageAlt: article.imageAlt || '',
      multipleImages: article.multipleImages || [],
      excerpt: article.excerpt || '',
      author: article.author || 'JC',
      authorImage: article.authorImage || '',
      status: article.status || 'Published',
      placement: article.placement || 'Standard',
      isFeatured: article.isFeatured || false,
      isTrending: article.isTrending || false,
      publishDate: article.publishDate ? new Date(article.publishDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      highlights: article.highlights && article.highlights.length > 0 ? article.highlights : ['', '', ''],
      tags: Array.isArray(article.tags) ? article.tags.join(', ') : article.tags || '',
      metaTitle: article.metaTitle || '',
      metaDescription: article.metaDescription || '',
      fullContent: article.fullContent || (article.content ? article.content.filter(s => s.type === 'paragraph').map(s => s.text).join('\n\n') : ''),
      sourceUrl: article.sourceUrl || '',
      videoUrl: article.videoUrl || '',
      socialLink: article.socialLink || ''
    });

    // Only keep non-paragraph sections in the modular blocks state to avoid duplication
    const modularSections = article.content ? article.content.filter(s => s.type !== 'paragraph') : [];
    setSections(modularSections);

    setIsEditing(true);
    setEditId(article._id);
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



  if (!currentUser || currentUser.role !== 'admin') {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="animate-pulse text-white font-black tracking-widest text-xs uppercase">Connecting to Server...</div>
    </div>;
  }

  const handleAISynthesis = async (type, sectionId = null) => {
    if (!formData.title) {
      toast.error('Article title is required to generate content.');
      return;
    }

    setIsSynthesizing(true);
    const id = toast.loading(`AI is generating ${type}...`);

    try {
      const response = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          type,
          context: formData.fullContent // Pass existing content for better targeted AI
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      if (type === 'full') {
        setFormData(prev => ({
          ...prev,
          subheadline: data.description,
          excerpt: data.description,
          highlights: data.highlights,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          tags: data.highlights.join(', '),
          fullContent: data.content.filter(s => s.type === 'paragraph').map(s => s.text).join('\n\n')
        }));
        setSections(data.content.filter(s => s.type !== 'paragraph'));
        toast.success('Complete article generated', { id });
      } else if (type === 'highlights') {
        setFormData(prev => ({ ...prev, highlights: data.highlights }));
        toast.success('Highlights generated', { id });
      } else if (type === 'seo') {
        setFormData(prev => ({
          ...prev,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          tags: data.highlights.join(', ')
        }));
        toast.success('SEO metadata generated', { id });
      } else if (type === 'faq' && sectionId) {
        updateSection(sectionId, { items: data.faqItems || [{ q: 'Example Q?', a: 'Example A.' }] });
        toast.success('FAQ generated', { id });
      } else if (type === 'quote' && sectionId) {
        updateSection(sectionId, { text: data.quoteText, author: data.quoteAuthor || 'Nation Trends Insight' });
        toast.success('Quote generated', { id });
      } else if (type === 'subheading' && sectionId) {
        updateSection(sectionId, { text: data.subheadingText });
        toast.success('Sub-heading generated', { id });
      }
    } catch (err) {
      toast.error('AI generation failed. Please check your connection.', { id });
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

          {/* VIEW: ELITE EDITOR (MODERN CMS) */}
          {activeTab === 'editor' && (
            <div className="animate-fade-in max-w-7xl mx-auto space-y-8 pb-40">

              {/* Editor Strategic Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-6 border border-slate-100 rounded-sm shadow-sm sticky top-24 z-30">
                <div className="flex items-center gap-6">
                  <button onClick={() => setActiveTab('articles')} className="w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-100 rounded-full text-slate-400 hover:text-primary-red transition">
                    <FiArrowLeft size={18} />
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="xl:hidden p-2 bg-slate-50 border border-slate-100 rounded-sm text-slate-600"
                  >
                    <FiMenu size={20} />
                  </button>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-950 uppercase italic tracking-tighter leading-none">{isEditing ? 'Edit Article' : 'New Article'}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formData.category} / {formData.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAISynthesis('full')}
                    disabled={isSynthesizing}
                    className="px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-sm font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2"
                  >
                    <FiCpu className={isSynthesizing ? 'animate-spin' : ''} />
                    <span>{isSynthesizing ? 'Generating...' : 'Full AI Generate'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-10">

                  {/* SECTION 1: BASIC INFORMATION */}
                  <section className="bg-white p-8 lg:p-12 rounded-sm border border-slate-100 shadow-sm space-y-10">
                    <div className="flex items-center gap-3 border-b border-slate-50 pb-6">
                      <div className="w-1.5 h-6 bg-primary-red"></div>
                      <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-widest italic">Basic Information</h4>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Article Title</label>
                        <input
                          value={formData.title}
                          onChange={e => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-slate-50 px-8 py-6 rounded-sm text-2xl font-black text-slate-950 border-none focus:ring-1 focus:ring-primary-red transition placeholder:text-slate-200 uppercase italic"
                          placeholder="ENTER ARTICLE TITLE..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                            className="w-full bg-slate-50 px-8 py-5 rounded-sm flex items-center justify-between border border-slate-100 hover:border-slate-200 transition-all"
                          >
                            <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest italic">{formData.category}</span>
                            <div className={`transition-transform duration-300 ${isCategoryOpen ? 'rotate-180' : ''}`}>
                              <FiChevronDown size={14} className="text-slate-400" />
                            </div>
                          </button>

                          {isCategoryOpen && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-sm shadow-2xl z-[100] overflow-hidden animate-fade-in-up">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4 gap-2">
                                {categories.map(cat => (
                                  <button
                                    key={cat}
                                    type="button"
                                    onClick={() => {
                                      setFormData({ ...formData, category: cat });
                                      setIsCategoryOpen(false);
                                    }}
                                    className={`px-6 py-4 rounded-sm text-[9px] font-black uppercase tracking-widest text-left transition-all flex items-center justify-between ${formData.category === cat
                                        ? 'bg-slate-950 text-white shadow-lg'
                                        : 'hover:bg-slate-50 text-slate-500 hover:text-slate-950'
                                      }`}
                                  >
                                    <span>{cat}</span>
                                    {formData.category === cat && <div className="w-1.5 h-1.5 bg-primary-red rounded-full"></div>}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Slug (Auto)</label>
                          <input
                            value={formData.slug}
                            readOnly
                            className="w-full bg-slate-100 px-6 py-4 rounded-sm text-[10px] font-bold text-slate-400 border-none cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Subcategory (Optional)</label>
                          <input
                            value={formData.subcategory}
                            onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                            className="w-full bg-slate-50 px-6 py-4 rounded-sm text-[10px] font-bold text-slate-900 border-none focus:ring-1 focus:ring-primary-red transition"
                            placeholder="e.g. Breaking, Analysis..."
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Description</label>
                        <textarea
                          value={formData.subheadline}
                          onChange={e => setFormData({ ...formData, subheadline: e.target.value })}
                          className="w-full bg-slate-50 px-8 py-6 rounded-sm text-base font-medium text-slate-600 border-none focus:ring-1 focus:ring-primary-red transition placeholder:text-slate-200 h-32 resize-none"
                          placeholder="Brief 2-3 line summary..."
                        />
                      </div>
                    </div>
                  </section>

                  {/* SECTION 2: HIGHLIGHTS */}
                  <section className="bg-white p-8 lg:p-12 rounded-sm border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-slate-950"></div>
                        <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-widest italic">Key Highlights</h4>
                      </div>
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleAISynthesis('highlights')}
                          className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                        >
                          <FiCpu size={12} /> Generate Highlights
                        </button>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{formData.highlights.length} / 5 Points</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {formData.highlights.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-4 group">
                          <div className="w-8 h-8 flex-shrink-0 bg-slate-950 text-white flex items-center justify-center text-[10px] font-black rounded-sm shadow-lg shadow-slate-900/10">
                            {idx + 1}
                          </div>
                          <input
                            value={point}
                            onChange={e => {
                              const newHighlights = [...formData.highlights];
                              newHighlights[idx] = e.target.value;
                              setFormData({ ...formData, highlights: newHighlights });
                            }}
                            className="flex-grow bg-slate-50 px-6 py-4 rounded-sm text-[11px] font-bold text-slate-900 border-none focus:ring-1 focus:ring-primary-red transition"
                            placeholder="Enter strategic highlight..."
                          />
                          {formData.highlights.length > 3 && (
                            <button
                              onClick={() => {
                                const newHighlights = formData.highlights.filter((_, i) => i !== idx);
                                setFormData({ ...formData, highlights: newHighlights });
                              }}
                              className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-sm opacity-0 group-hover:opacity-100 transition"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      {formData.highlights.length < 5 && (
                        <button
                          onClick={() => setFormData({ ...formData, highlights: [...formData.highlights, ''] })}
                          className="mt-4 px-6 py-3 bg-slate-50 text-slate-400 hover:text-slate-950 border border-dashed border-slate-200 hover:border-slate-400 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all w-full flex items-center justify-center gap-2"
                        >
                          <FiPlus /> Add Intelligence Point
                        </button>
                      )}
                    </div>
                  </section>

                  {/* SECTION 3: ARTICLE CONTENT */}
                  <section className="bg-white p-8 lg:p-12 rounded-sm border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary-red"></div>
                        <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-widest italic">Article Content</h4>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{calculateReadingTime(formData.fullContent)}</span>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Paste full article here (Double enter for new paragraph)</p>
                      <textarea
                        value={formData.fullContent}
                        onChange={e => setFormData({ ...formData, fullContent: e.target.value })}
                        className="w-full bg-slate-50 px-8 py-8 rounded-sm text-base font-medium text-slate-700 border-none focus:ring-1 focus:ring-primary-red transition placeholder:text-slate-200 min-h-[500px] resize-y leading-relaxed"
                        placeholder="Paste your full article content here... headings and images can still be added using modular blocks if needed."
                      />
                    </div>
                  </section>

                  {/* OPTIONAL: MODULAR BLOCKS (FOR HEADINGS/IMAGES) */}
                  <section className="space-y-8">
                    <div className="flex items-center justify-between px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-slate-950"></div>
                        <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-widest italic">Additional Elements (Headings, Images, FAQ)</h4>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {sections.map((section, index) => (
                        <div key={section.id} className="group relative bg-white rounded-sm border border-slate-100 hover:border-slate-300 transition-all duration-500 p-8 lg:p-10">
                          <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-all z-10">
                            <button onClick={() => removeSection(section.id)} className="w-8 h-8 bg-white border border-slate-100 rounded-sm flex items-center justify-center text-slate-400 hover:text-primary-red transition shadow-lg"><FiTrash2 size={12} /></button>
                          </div>

                          <div className="text-[8px] font-black text-primary-red uppercase tracking-widest mb-4 opacity-50">{section.type}</div>

                          {section.type === 'subheading' && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sub-Heading</label>
                                <button onClick={() => handleAISynthesis('subheading', section.id)} className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline"><FiCpu size={10} /> AI GENERATE</button>
                              </div>
                              <input
                                value={section.text}
                                onChange={e => updateSection(section.id, { text: e.target.value })}
                                className="w-full text-lg font-black text-slate-950 uppercase italic bg-transparent border-none focus:ring-0 mb-2"
                                placeholder="SUB-HEADING..."
                              />
                            </div>
                          )}

                          {section.type === 'paragraph' && (
                            <textarea
                              value={section.text}
                              onChange={e => updateSection(section.id, { text: e.target.value })}
                              className="w-full text-base text-slate-600 font-medium leading-relaxed bg-transparent border-none focus:ring-0 resize-none min-h-[100px]"
                              placeholder="Paragraph text..."
                              onInput={(e) => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                            />
                          )}

                          {section.type === 'faq' && (
                            <div className="space-y-6">
                              <div className="flex items-center justify-between">
                                <h5 className="text-[10px] font-black text-primary-red uppercase tracking-widest italic underline decoration-2">FAQ</h5>
                                <button onClick={() => handleAISynthesis('faq', section.id)} className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline"><FiCpu size={10} /> AI GENERATE FAQ</button>
                              </div>
                              {(section.items || []).map((item, i) => (
                                <div key={i} className="space-y-3 bg-slate-50 p-6 border-l-4 border-slate-900">
                                  <input
                                    value={item.q}
                                    onChange={e => {
                                      const newItems = [...section.items];
                                      newItems[i].q = e.target.value;
                                      updateSection(section.id, { items: newItems });
                                    }}
                                    className="w-full text-xs font-black text-slate-900 uppercase tracking-tight bg-transparent border-none focus:ring-0"
                                    placeholder="QUESTION?"
                                  />
                                  <textarea
                                    value={item.a}
                                    onChange={e => {
                                      const newItems = [...section.items];
                                      newItems[i].a = e.target.value;
                                      updateSection(section.id, { items: newItems });
                                    }}
                                    className="w-full text-[11px] font-medium text-slate-500 bg-transparent border-none focus:ring-0 resize-none h-16"
                                    placeholder="ANSWER..."
                                  />
                                </div>
                              ))}
                              <button onClick={() => updateSection(section.id, { items: [...(section.items || []), { q: '', a: '' }] })} className="px-5 py-2 bg-slate-950 text-white font-black text-[8px] uppercase tracking-widest rounded-sm">+ ADD FAQ</button>
                            </div>
                          )}

                          {section.type === 'subimage' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="aspect-video bg-slate-50 rounded-sm border border-slate-100 overflow-hidden relative group">
                                {section.url ? (
                                  <>
                                    <img src={section.url} className="w-full h-full object-cover" />
                                    <button onClick={() => updateSection(section.id, { url: '' })} className="absolute top-2 right-2 w-8 h-8 bg-white/90 rounded-sm text-red-500 shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><FiTrash2 size={12} /></button>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-200">
                                    <FiImage size={24} />
                                    <label className="px-4 py-1.5 bg-slate-950 text-white text-[8px] font-black uppercase tracking-widest rounded-sm cursor-pointer hover:bg-primary-red transition">
                                      UPLOAD <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'section', section.id)} />
                                    </label>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-4">
                                <input value={section.url} onChange={e => updateSection(section.id, { url: e.target.value })} className="w-full px-5 py-3 bg-slate-50 rounded-sm text-[10px] font-bold border-none" placeholder="OR IMAGE URL..." />
                                <input value={section.caption} onChange={e => updateSection(section.id, { caption: e.target.value })} className="w-full px-5 py-3 bg-slate-50 rounded-sm text-[10px] font-bold border-none" placeholder="CAPTION..." />
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      <div className="flex flex-wrap items-center justify-center gap-3 py-12 bg-slate-50 border border-dashed border-slate-200 rounded-sm">
                        <span className="w-full text-center text-[8px] font-black text-slate-300 uppercase tracking-widest mb-2">Insert Additional Elements Below Main Content</span>
                        {[
                          { type: 'subheading', label: 'Heading', icon: FiFileText },
                          { type: 'subimage', label: 'Image Block', icon: FiImage },
                          { type: 'faq', label: 'FAQ Block', icon: FiCheck },
                          { type: 'quote', label: 'Quote', icon: FiMessageSquare }
                        ].map(tool => (
                          <button key={tool.type} onClick={() => addSection(tool.type)} className="px-6 py-3 bg-white border border-slate-200 rounded-sm text-[9px] font-black text-slate-400 hover:text-primary-red hover:border-primary-red uppercase tracking-widest flex items-center gap-2 transition-all shadow-sm">
                            <tool.icon size={14} /> <span>Add {tool.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>

                {/* Sidebar Column (Intelligence Controls) */}
                <div className="lg:col-span-4 space-y-10">

                  {/* FEATURED IMAGE */}
                  <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-8 text-left">
                    <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.4em] italic pb-4 border-b border-slate-50">Featured Image</h4>
                    <div className="space-y-6">
                      <div className="aspect-video bg-slate-50 rounded-sm border border-slate-200 overflow-hidden relative group">
                        {formData.image ? (
                          <>
                            <img src={formData.image} className="w-full h-full object-cover" />
                            <button onClick={() => setFormData({ ...formData, image: '' })} className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full text-red-500 shadow-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><FiTrash2 size={16} /></button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-200">
                            <FiImage size={32} />
                            <label className="px-6 py-2 bg-slate-950 text-white text-[8px] font-black uppercase tracking-widest rounded-sm cursor-pointer hover:bg-primary-red transition">UPLOAD<input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} /></label>
                          </div>
                        )}
                      </div>
                      <input value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full p-4 bg-slate-50 rounded-sm text-[10px] font-bold border-none" placeholder="MEDIA URL..." />
                      <input value={formData.imageAlt} onChange={e => setFormData({ ...formData, imageAlt: e.target.value })} className="w-full p-4 bg-slate-50 rounded-sm text-[10px] font-bold border-none" placeholder="SEO ALT TEXT (REQUIRED)..." />
                    </div>
                  </div>

                  {/* LOCATION */}
                  <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-8 text-left">
                    <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.4em] italic pb-4 border-b border-slate-50">Location</h4>
                    <div className="space-y-5">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsCountryOpen(!isCountryOpen)}
                          className="w-full bg-slate-50 px-5 py-4 rounded-sm flex items-center justify-between border border-slate-100 hover:border-slate-200 transition-all"
                        >
                          <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">{formData.country}</span>
                          <FiChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isCountryOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isCountryOpen && (
                          <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-sm shadow-xl z-[50] overflow-hidden">
                            {['India', 'International'].map(opt => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => {
                                  setFormData({ ...formData, country: opt });
                                  setIsCountryOpen(false);
                                }}
                                className={`w-full px-5 py-3 text-[9px] font-black uppercase tracking-widest text-left transition-all ${formData.country === opt
                                    ? 'bg-slate-950 text-white'
                                    : 'hover:bg-slate-50 text-slate-500 hover:text-slate-950'
                                  }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full p-4 bg-slate-50 rounded-sm text-[10px] font-bold border-none" placeholder="STATE..." />
                      <input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full p-4 bg-slate-50 rounded-sm text-[10px] font-bold border-none" placeholder="CITY..." />
                    </div>
                  </div>

                  {/* PUBLISH STATUS */}
                  <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-8 text-left">
                    <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.4em] italic pb-4 border-b border-slate-50">Publish Status</h4>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Protocol</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setIsStatusOpen(!isStatusOpen)}
                            className="w-full bg-slate-50 px-5 py-4 rounded-sm flex items-center justify-between border border-slate-100 hover:border-slate-200 transition-all"
                          >
                            <span className="text-[10px] font-black text-slate-950 uppercase tracking-widest">{formData.status}</span>
                            <FiChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isStatusOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isStatusOpen && (
                            <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-100 rounded-sm shadow-xl z-[50] overflow-hidden">
                              {['Published', 'Draft', 'Scheduled'].map(opt => (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => {
                                    setFormData({ ...formData, status: opt });
                                    setIsStatusOpen(false);
                                  }}
                                  className={`w-full px-5 py-3 text-[9px] font-black uppercase tracking-widest text-left transition-all ${formData.status === opt
                                      ? 'bg-slate-950 text-white'
                                      : 'hover:bg-slate-50 text-slate-500 hover:text-slate-950'
                                    }`}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Schedule Date</label>
                        <input type="date" value={formData.publishDate} onChange={e => setFormData({ ...formData, publishDate: e.target.value })} className="w-full p-4 bg-slate-50 rounded-sm text-[10px] font-black border-none" />
                      </div>
                    </div>
                  </div>

                  {/* ARTICLE OPTIONS */}
                  <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6 text-left">
                    <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.4em] italic pb-4 border-b border-slate-50">Article Options</h4>
                    <div className="space-y-3">
                      {[
                        { id: 'breaking', label: 'Breaking News', key: 'placement', value: 'Breaking' },
                        { id: 'featured', label: 'Featured Article', key: 'isFeatured' },
                        { id: 'trending', label: 'Trending Story', key: 'isTrending' }
                      ].map(flag => (
                        <button
                          key={flag.id}
                          onClick={() => {
                            if (flag.key === 'placement') setFormData({ ...formData, placement: formData.placement === 'Breaking' ? 'Standard' : 'Breaking' });
                            else setFormData({ ...formData, [flag.key]: !formData[flag.key] });
                          }}
                          className={`w-full p-4 rounded-sm border text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${(flag.key === 'placement' ? formData.placement === 'Breaking' : formData[flag.key])
                              ? 'bg-slate-950 text-white border-slate-950 shadow-lg shadow-slate-900/20'
                              : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                            }`}
                        >
                          {flag.label}
                          <div className={`w-2 h-2 rounded-full ${(flag.key === 'placement' ? formData.placement === 'Breaking' : formData[flag.key]) ? 'bg-primary-red animate-pulse' : 'bg-slate-200'}`}></div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SEO SETTINGS */}
                  <div className="bg-white p-8 rounded-sm border border-slate-100 shadow-sm space-y-6 text-left">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-50">
                      <h4 className="text-[10px] font-black text-slate-950 uppercase tracking-[0.4em] italic">SEO Settings</h4>
                      <button
                        onClick={() => handleAISynthesis('seo')}
                        className="text-[8px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                      >
                        <FiCpu size={10} /> AI SEO
                      </button>
                    </div>
                    <div className="space-y-4">
                      <input value={formData.metaTitle} onChange={e => setFormData({ ...formData, metaTitle: e.target.value })} className="w-full p-4 bg-slate-50 rounded-sm text-[9px] font-bold border-none" placeholder="META TITLE..." />
                      <textarea value={formData.metaDescription} onChange={e => setFormData({ ...formData, metaDescription: e.target.value })} className="w-full p-4 bg-slate-50 rounded-sm text-[9px] font-bold border-none h-24 resize-none" placeholder="META DESCRIPTION..." />
                      <input value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="w-full p-4 bg-slate-50 rounded-sm text-[9px] font-bold border-none" placeholder="TAGS (COMMA SEPARATED)..." />
                    </div>
                  </div>

                  {/* PUBLISH BUTTON */}
                  <div className="pt-6">
                    <button
                      onClick={handleSubmit}
                      className="w-full bg-slate-950 text-white font-black py-6 rounded-sm text-[10px] uppercase tracking-[0.4em] hover:bg-primary-red transition-all flex items-center justify-center gap-3 shadow-2xl shadow-slate-900/20"
                    >
                      <FiZap />
                      <span>{isEditing ? 'Update Article' : 'Publish Article'}</span>
                    </button>
                  </div>

                </div>
              </div>
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
                                onClick={() => { if (window.confirm('Delete this user?')) deleteUser(user._id); }}
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
                        {[...users].sort((a, b) => new Date(b.lastLogin) - new Date(a.lastLogin)).slice(0, 5).map(user => (
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
