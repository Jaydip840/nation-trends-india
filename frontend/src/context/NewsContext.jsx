import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const NewsContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const NewsProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const [siteVisits, setSiteVisits] = useState(0);
  const [subscribers, setSubscribers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [siteSettings, setSiteSettings] = useState({
    title: 'Nation Trends India',
    tagline: 'THE PULSE OF A NEW INDIA',
    email: 'nationtrendsindia.in@gmail.com',
    phone: '1111111111',
    address: 'Surat, Gujarat, India 395006',
    foundedYear: '2026',
    audienceCount: '100+'
  });
  const [breakingNews, setBreakingNews] = useState('');
  const [users, setUsers] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('nti_user');
    return saved ? JSON.parse(saved) : null;
  });

  // --- INITIAL DATA FETCHING ---

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setInitialLoading(true);
    try {
      const [artRes, setRes, msgRes, subRes, userRes] = await Promise.all([
        fetch(`${API_URL}/articles`),
        fetch(`${API_URL}/settings`),
        fetch(`${API_URL}/messages`),
        fetch(`${API_URL}/subscribers`),
        fetch(`${API_URL}/users`)
      ]);

      const [artData, setData, msgData, subData, userData] = await Promise.all([
        artRes.json(),
        setRes.json(),
        msgRes.json(),
        subRes.json(),
        userRes.json()
      ]);

      setArticles(artData.map(art => ({ ...art, id: art._id })));
      setSiteSettings(setData);
      setBreakingNews(setData.breakingNews);
      setSiteVisits(setData.siteVisits || 0);
      setMessages(msgData.map(msg => ({ ...msg, id: msg._id })));
      setSubscribers(subData);
      setUsers(userData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setTimeout(() => setInitialLoading(false), 2000);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const login = async (email, password) => {
    if (email === 'admin@gmail.com' && password === 'admin123') {
      const user = { name: 'Admin', email, role: 'admin' };
      setCurrentUser(user);
      localStorage.setItem('nti_user', JSON.stringify(user));
      return { success: true, user };
    }

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        const user = { ...data, role: data.role || 'user' };
        setCurrentUser(user);
        localStorage.setItem('nti_user', JSON.stringify(user));
        return { success: true, user };
      } else {
        return { success: false, error: data.error || 'Login failed.' };
      }
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const googleLogin = async (token, isAccessToken = false) => {
    try {
      const res = await fetch(`${API_URL}/users/google-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, isAccessToken })
      });
      const data = await res.json();
      if (res.ok && !data.error) {
        const user = { ...data, role: data.role || 'user' };
        setCurrentUser(user);
        localStorage.setItem('nti_user', JSON.stringify(user));
        return { success: true, ...user };
      } else {
        return { success: false, error: data.error || 'Authentication failed.' };
      }
    } catch (err) {
      return { success: false, error: 'Authentication error.' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers([data, ...users]);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      return { success: false, error: 'Network error during registration.' };
    }
  };

  const toggleBlockUser = async (id) => {
    try {
      const res = await fetch(`${API_URL}/users/${id}/block`, { method: 'PATCH' });
      const data = await res.json();
      setUsers(users.map(u => u._id === id ? data : u));
    } catch (err) {
      console.error('Error toggling block status:', err);
    }
  };

  const saveArticle = async (articleId) => {
    if (!currentUser || currentUser.role === 'admin') return;
    try {
      const res = await fetch(`${API_URL}/users/${currentUser._id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...currentUser, savedArticles: data.savedArticles };
        setCurrentUser(updated);
        localStorage.setItem('nti_user', JSON.stringify(updated));
        toast.success('Story saved.');
        return true;
      }
    } catch (err) {
      toast.error('Could not save story.');
      console.error('Error saving article:', err);
    }
    return false;
  };
  
  const unsaveArticle = async (articleId) => {
    if (!currentUser || currentUser.role === 'admin') return;
    try {
      const res = await fetch(`${API_URL}/users/${currentUser._id}/unsave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId })
      });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...currentUser, savedArticles: data.savedArticles };
        setCurrentUser(updated);
        localStorage.setItem('nti_user', JSON.stringify(updated));
        toast.success('Story removed.');
        return true;
      }
    } catch (err) {
      toast.error('Could not remove story.');
      console.error('Error unsaving article:', err);
    }
    return false;
  };

  const deleteUser = async (id) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers(users.filter(u => u._id !== id));
        toast.success('User deleted.');
        return true;
      }
    } catch (err) {
      toast.error('Could not delete user.');
      console.error('Error deleting user:', err);
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nti_user');
  };

  const addArticle = async (article) => {
    try {
      const res = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...article, views: 0 })
      });
      const data = await res.json();
      const mapped = { ...data, id: data._id };
      setArticles([mapped, ...articles]);
    } catch (err) {
      console.error('Error adding article:', err);
    }
  };

  const updateArticle = async (id, updatedArticle) => {
    try {
      const res = await fetch(`${API_URL}/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedArticle)
      });
      const data = await res.json();
      const mapped = { ...data, id: data._id };
      setArticles(articles.map(art => art.id === id ? mapped : art));
    } catch (err) {
      console.error('Error updating article:', err);
    }
  };

  const deleteArticle = async (id) => {
    try {
      await fetch(`${API_URL}/articles/${id}`, { method: 'DELETE' });
      setArticles(articles.filter(art => art.id !== id));
    } catch (err) {
      console.error('Error deleting article:', err);
    }
  };

  const incrementViewCount = async (slug) => {
    try {
      const res = await fetch(`${API_URL}/articles/views/${slug}`, { method: 'PATCH' });
      const data = await res.json();
      const mapped = { ...data, id: data._id };
      setArticles(prev => prev.map(art => art.id === mapped.id ? mapped : art));
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  };

  const incrementSiteVisit = async () => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteVisits: siteVisits + 1 })
      });
      const data = await res.json();
      setSiteVisits(data.siteVisits);
    } catch (err) {
      console.error('Error incrementing site visit:', err);
    }
  };

  const addSubscriber = async (email) => {
    if (!subscribers.find(s => s.email === email)) {
      try {
        const res = await fetch(`${API_URL}/subscribers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        setSubscribers([data, ...subscribers]);
        return true;
      } catch (err) {
        console.error('Error adding subscriber:', err);
      }
    }
    return false;
  };

  const toggleBlockSubscriber = async (id) => {
    try {
      const res = await fetch(`${API_URL}/subscribers/${id}/block`, { method: 'PATCH' });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(subscribers.map(s => s._id === id ? data : s));
      }
    } catch (err) {
      console.error('Error toggling subscriber block status:', err);
    }
  };

  const addMessage = async (message) => {
    try {
      const res = await fetch(`${API_URL}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message)
      });
      const data = await res.json();
      setMessages([data, ...messages]);
    } catch (err) {
      console.error('Error adding message:', err);
    }
  };

  const replyToMessage = async (email, subject, message) => {
    try {
      const res = await fetch(`${API_URL}/messages/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subject, message })
      });
      return res.ok;
    } catch (err) {
      console.error('Error replying to message:', err);
      return false;
    }
  };

  const updateSiteSettings = async (settings) => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      setSiteSettings(data);
      if (data.breakingNews) setBreakingNews(data.breakingNews);
    } catch (err) {
      console.error('Error updating site settings:', err);
    }
  };

  const updateBreakingNews = async (text) => {
    try {
      const res = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ breakingNews: text })
      });
      const data = await res.json();
      setBreakingNews(data.breakingNews);
    } catch (err) {
      console.error('Error updating breaking news:', err);
    }
  };

  const deleteMessage = async (id) => {
    try {
      await fetch(`${API_URL}/messages/${id}`, { method: 'DELETE' });
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const generateAIPulse = async () => {
    try {
      const res = await fetch(`${API_URL}/ai/pulse`, { method: 'POST' });
      const data = await res.json();
      const mapped = { ...data, id: data._id };
      setArticles([mapped, ...articles]);
      return true;
    } catch (err) {
      console.error('Error generating AI pulse:', err);
      return false;
    }
  };

  return (
    <NewsContext.Provider value={{
      fetchData,
      articles,
      siteVisits,
      currentUser,
      users,
      login,
      googleLogin,
      register,
      logout,
      toggleBlockUser,
      saveArticle,
      unsaveArticle,
      addArticle,
      updateArticle,
      deleteArticle,
      incrementViewCount,
      incrementSiteVisit,
      subscribers,
      addSubscriber,
      toggleBlockSubscriber,
      messages,
      addMessage,
      deleteMessage,
      deleteUser,
      replyToMessage,
      siteSettings,
      updateSiteSettings,
      breakingNews,
      updateBreakingNews,
      generateAIPulse,
      initialLoading
    }}>
      {children}
    </NewsContext.Provider>
  );
};

export const useNews = () => useContext(NewsContext);
