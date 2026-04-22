import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiMail, FiMessageSquare, FiUser, FiInfo, FiSend, FiCheckCircle } from 'react-icons/fi';
import { useNews } from '../context/NewsContext';
import Breadcrumb from '../components/Breadcrumb';
import toast from 'react-hot-toast';

const Support = () => {
    const { siteSettings } = useNews();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'Account Access Issue',
        issueType: 'Restricted Account',
        message: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch(`${API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: `[SUPPORT: ${formData.issueType}] ${formData.subject}`,
                    message: formData.message,
                    type: 'Support'
                })
            });

            if (res.ok) {
                setIsSubmitted(true);
                toast.success('Appeal transmitted to the bureau.');
            } else {
                toast.error('Failed to transmit message.');
            }
        } catch (err) {
            toast.error('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            <Helmet>
                <title>Support & Help | {siteSettings.title}</title>
                <meta name="description" content="Get help with your account, report issues, or appeal account restrictions at Nation Trends India." />
            </Helmet>

            <Breadcrumb items={[{ label: 'Support', href: '/support' }]} />

            <main className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    
                    {/* LEFT COLUMN: INFO */}
                    <div className="lg:col-span-5 space-y-12">
                        <div className="space-y-6">
                            <span className="inline-block py-1 px-3 bg-red-100 text-primary-red font-black text-[10px] uppercase tracking-[0.2em] rounded-sm">
                                Help Desk
                            </span>
                            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase leading-none">
                                Assistance <br />
                                <span className="text-primary-red italic">& Support Hub.</span>
                            </h1>
                            <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                                If your access has been restricted or you're experiencing technical difficulties, use this portal to contact our internal team.
                            </p>
                        </div>

                        <div className="space-y-8 border-t border-slate-100 pt-12">
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 bg-slate-950 text-white rounded-sm flex items-center justify-center shrink-0 shadow-lg">
                                    <FiInfo size={20} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Protocol Check</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Ensure you provide the email address associated with your registered identity for faster verification.</p>
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 bg-primary-red text-white rounded-sm flex items-center justify-center shrink-0 shadow-lg">
                                    <FiMail size={20} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Response Times</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">Our support team typically responds to access appeals within 24–48 business hours.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: FORM */}
                    <div className="lg:col-span-7">
                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="bg-[#fcfcfc] border border-slate-100 p-8 md:p-12 space-y-8 shadow-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <FiUser size={12} className="text-primary-red" /> Full Name
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-white border border-slate-100 px-6 py-4 rounded-sm text-sm font-bold focus:ring-1 focus:ring-primary-red outline-none transition-all shadow-sm"
                                            placeholder="Enter your name..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                            <FiMail size={12} className="text-primary-red" /> Email Address
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-white border border-slate-100 px-6 py-4 rounded-sm text-sm font-bold focus:ring-1 focus:ring-primary-red outline-none transition-all shadow-sm"
                                            placeholder="identity@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <FiInfo size={12} className="text-primary-red" /> Issue Category
                                    </label>
                                    <select
                                        value={formData.issueType}
                                        onChange={e => setFormData({ ...formData, issueType: e.target.value })}
                                        className="w-full bg-white border border-slate-100 px-6 py-4 rounded-sm text-sm font-bold focus:ring-1 focus:ring-primary-red outline-none transition-all shadow-sm appearance-none cursor-pointer"
                                    >
                                        <option>Restricted Account</option>
                                        <option>Login Difficulty</option>
                                        <option>Technical Bug</option>
                                        <option>Editorial Feedback</option>
                                        <option>Other Enquiry</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                        <FiMessageSquare size={12} className="text-primary-red" /> Detailed Statement
                                    </label>
                                    <textarea
                                        required
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full bg-white border border-slate-100 px-6 py-4 rounded-sm text-sm font-bold focus:ring-1 focus:ring-primary-red outline-none transition-all shadow-sm min-h-[200px] resize-none"
                                        placeholder="Please provide full details about your issue..."
                                    />
                                </div>

                                <button
                                    disabled={isLoading}
                                    type="submit"
                                    className="w-full bg-slate-950 text-white font-black py-5 rounded-sm text-[11px] uppercase tracking-[0.3em] hover:bg-primary-red transition-all flex items-center justify-center gap-3 shadow-xl disabled:bg-slate-300"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            TRANSMITTING...
                                        </span>
                                    ) : (
                                        <>
                                            <FiSend size={14} /> <span>Submit Appeal</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="bg-white border-2 border-dashed border-slate-100 p-12 text-center space-y-8 animate-fade-in shadow-2xl">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                    <FiCheckCircle size={48} />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-black text-slate-950 uppercase italic tracking-tighter">Message Sent</h2>
                                    <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                        Your message has been logged. A team representative will review your statement and contact you at <strong>{formData.email}</strong>.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary-red transition"
                                >
                                    Send another message
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Support;
