import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiMapPin, FiPhone, FiMail, FiSend, FiGlobe, FiClock, FiLock, FiCheckCircle, FiShield, FiCpu, FiArrowRight } from 'react-icons/fi';
import Breadcrumb from '../components/Breadcrumb';
import { useNews } from '../context/NewsContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Contact = () => {
  const { addMessage, siteSettings, currentUser } = useNews();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
        toast.error('Login Required: Please login to send a message.');
        navigate('/auth');
        return;
    }
    if (currentUser?.isBlocked) {
        toast.error('Access Denied: Your account is blocked.');
        return;
    }
    await addMessage(formData);
    setSubmitted(true);
    toast.success('Message Sent Successfully.');
  };

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Contact Us | Nation Trends India</title>
        <meta name="description" content="Get in touch with Nation Trends India for inquiries, feedback, or news tips." />
      </Helmet>

      <Breadcrumb items={[{ label: 'Contact Us', href: '#' }]} />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-12">
        <div className="space-y-6">
          <span className="inline-block py-1 px-3 bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] rounded-[4px]">
            Get In Touch
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase">
            Contact <br />
            <span className="text-primary-red italic">Us Anytime.</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg md:text-xl max-w-2xl italic leading-relaxed border-l-2 border-slate-100 pl-6 py-2">
            Have a question or a story to share? Reach out to our team directly.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT GRID */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
          
          {/* LEFT: CONTACT INFO */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-10">
              {[
                { icon: <FiPhone />, title: 'Phone Number', desc: siteSettings?.phone || '+91 00000 00000' },
                { icon: <FiMail />, title: 'Email Address', desc: siteSettings?.email || 'contact@nationtrends.com' },
                { icon: <FiMapPin />, title: 'Our Office', desc: siteSettings?.address || 'New Delhi, India' }
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="text-primary-red">{item.icon}</div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{item.title}</h3>
                  </div>
                  <p className="text-base font-black text-slate-900 leading-relaxed pt-1">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="space-y-6 pt-8 border-t border-slate-100">
              <div className="flex items-center space-x-3">
                <FiClock className="text-slate-900" size={20} />
                <h3 className="text-lg font-black tracking-tight uppercase">Support Hours.</h3>
              </div>
              <div className="space-y-4">
                  <div>
                      <span className="block text-3xl font-black text-slate-900 tracking-tighter">24 Hours</span>
                      <span className="block text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold">Fast Response</span>
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                      <span className="block text-3xl font-black text-slate-900 tracking-tighter">7 Days</span>
                      <span className="block text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold">Always Online</span>
                  </div>
              </div>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM */}
          <div className="lg:col-span-8 relative">
            
            {/* LOGIN REQUIRED OVERLAY */}
            {!currentUser && (
               <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                <div className="bg-white/80 backdrop-blur-xl p-10 md:p-16 rounded-[24px] border border-slate-100 shadow-2xl text-center space-y-8 max-w-md w-full">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <FiLock className="text-primary-red" size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Login Required.</h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2 px-4">Please login to your account to send us a message.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/auth')} 
                        className="w-full bg-slate-900 text-white font-black py-5 rounded-[8px] text-[10px] uppercase tracking-[0.3em] hover:bg-primary-red transition-all shadow-xl shadow-slate-200 active:scale-95"
                    >
                        Go to Login
                    </button>
                </div>
               </div>
            )}

            {currentUser?.isBlocked && (
               <div className="absolute inset-0 z-20 flex items-center justify-center p-6">
                 <div className="bg-red-950/90 backdrop-blur-xl p-10 md:p-16 rounded-[24px] border border-red-900/40 shadow-2xl text-center space-y-8 max-w-md w-full">
                    <FiShield className="text-white mx-auto" size={48} />
                    <div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Account Blocked.</h3>
                        <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest mt-2">Your account has been restricted by the administrator.</p>
                    </div>
                 </div>
               </div>
            )}

            <div className={`py-12 md:py-16 transition-all duration-700 ${(!currentUser || currentUser.isBlocked) ? 'blur-[12px] opacity-40 select-none pointer-events-none' : ''}`}>
              {submitted ? (
                 <div className="py-20 text-center space-y-8">
                    <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                        <FiCheckCircle className="text-emerald-500" size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight italic">Message Sent.</h3>
                    <p className="text-slate-500 font-medium">Thank you for reaching out. We have received your message.</p>
                    <button onClick={() => setSubmitted(false)} className="text-primary-red text-[10px] font-black uppercase tracking-[0.3em] hover:underline">Send another message</button>
                 </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-50 border-none rounded-none px-6 py-5 focus:ring-4 focus:ring-primary-red/5 transition font-bold text-sm placeholder:text-slate-200" placeholder="Enter your name" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                        <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border-none rounded-none px-6 py-5 focus:ring-4 focus:ring-primary-red/5 transition font-bold text-sm placeholder:text-slate-200" placeholder="Enter your email" />
                    </div>
                  </div>
                  <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                      <input type="text" required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-slate-50 border-none rounded-none px-6 py-5 focus:ring-4 focus:ring-primary-red/5 transition font-black text-sm placeholder:text-slate-200" placeholder="What is this about?" />
                  </div>
                  <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Message</label>
                      <textarea rows="6" required value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-slate-50 border-none rounded-none px-6 py-5 focus:ring-4 focus:ring-primary-red/5 transition font-bold text-sm resize-none placeholder:text-slate-200" placeholder="Enter your message here..."></textarea>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white font-black py-6 rounded-none transition-all hover:bg-primary-red flex items-center justify-center gap-4 text-[11px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 shadow-slate-200">
                    Send Message <FiSend size={18} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="relative overflow-hidden pt-20 pb-20 text-center bg-white border-t border-slate-50">
        <div className="relative z-20 max-w-4xl mx-auto px-4 md:px-6 space-y-8">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">
            Follow Our <br />
            <span className="text-primary-red italic">Latest News.</span>
          </h2>
          <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed italic max-w-xl mx-auto">
            Create an account to save your favorite articles and get the latest updates from India.
          </p>
          <div className="pt-6">
            {!currentUser ? (
               <button onClick={() => navigate('/auth')} className="group relative inline-flex items-center space-x-4 px-12 py-5 bg-slate-900 text-white rounded-[8px] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary-red transition-all active:scale-95 shadow-xl shadow-slate-200">
                <span>Join Now</span>
                <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
               </button>
            ) : (
                <a href="/category/india" className="group relative inline-flex items-center space-x-4 px-12 py-5 bg-slate-900 text-white rounded-[8px] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary-red transition-all active:scale-95 shadow-xl shadow-slate-200">
                    <span>Read More News</span>
                    <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
