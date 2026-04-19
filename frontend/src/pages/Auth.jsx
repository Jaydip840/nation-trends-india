import { useState } from 'react';
import { useNews } from '../context/NewsContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight, FiShield, FiCpu, FiEye, FiEyeOff, FiCheck, FiUser } from 'react-icons/fi';
import { FaGoogle, FaGithub } from 'react-icons/fa';

const Auth = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [isAdminLogin, setIsAdminLogin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login, register } = useNews();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (isRegister) {
            const res = await register(name, email, password);
            if (res.success) {
                toast.success('Registration successful. You can now login.');
                setIsRegister(false);
            } else {
                toast.error(res.error || 'Registration failed.');
            }
        } else {
            const res = await login(email, password);
            if (res.success) {
                toast.success('Login successful.');
                if (email === 'admin@nationtrends.com' || isAdminLogin) {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                toast.error(res.error || 'Login failed. Please check your credentials.');
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white selection:bg-primary-red selection:text-white font-sans">
            {/* LEFT SIDE: VISUAL */}
            <div className={`hidden lg:flex relative flex-col justify-center px-12 xl:px-24 overflow-hidden border-r border-slate-100 transition-colors duration-1000 ${isAdminLogin ? 'bg-blue-50/30' : 'bg-[#fcfcfc]'}`}>
                <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"></div>
                
                <div className="relative z-10 space-y-10 py-20">
                    <div className="space-y-6">
                        <div className={`w-16 h-1 mb-8 transition-colors duration-500 ${isAdminLogin ? 'bg-blue-600' : 'bg-primary-red'}`}></div>
                        <h1 className="text-5xl xl:text-7xl font-black text-slate-900 leading-[1.0] tracking-tighter uppercase italic">
                            Stay Updated <br/> 
                            <span className={`text-6xl xl:text-8xl transition-colors duration-500 ${isAdminLogin ? 'text-blue-600' : 'text-primary-red'}`}>With Us</span> <br/>
                            Every Day.
                        </h1>
                    </div>
                    
                    <p className="text-lg xl:text-xl text-slate-400 font-medium italic max-w-md leading-relaxed border-l-2 border-slate-200 pl-8 py-2">
                        "Your trusted source for news and information."
                    </p>

                    <div className="flex items-center gap-6 pt-10">
                        <div className="h-[1px] w-12 bg-slate-200"></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
                            Nation Trends India
                        </span>
                    </div>
                </div>

                <div className="absolute bottom-10 left-12 xl:left-24">
                     <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className={`w-8 h-8 flex items-center justify-center font-black text-white text-[10px] transition-colors duration-500 rounded-[4px] ${isAdminLogin ? 'bg-blue-600' : 'bg-slate-900'}`}>NT</div>
                        <span className="font-black tracking-tighter text-slate-900 text-xs uppercase group-hover:text-primary-red transition-colors">Nation Trends India</span>
                     </div>
                </div>
            </div>

            {/* RIGHT SIDE: FORM */}
            <div className="flex flex-col px-6 md:px-20 lg:px-24 py-12 relative bg-white overflow-y-auto">
                <div className="flex items-center justify-between mb-12 border-b border-slate-100 w-full">
                    <div className="flex items-center gap-8">
                        <button 
                            type="button"
                            onClick={() => { setIsRegister(false); setIsAdminLogin(false); }}
                            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${!isRegister ? (isAdminLogin ? 'text-blue-600' : 'text-primary-red') : 'text-slate-400 hover:text-slate-900'}`}
                        >
                            Sign In
                            {!isRegister && <div className={`absolute bottom-0 left-0 w-full h-[2px] transition-colors duration-500 ${isAdminLogin ? 'bg-blue-600' : 'bg-primary-red'}`}></div>}
                        </button>
                        <button 
                            type="button"
                            onClick={() => { setIsRegister(true); setIsAdminLogin(false); }}
                            className={`pb-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${isRegister ? 'text-primary-red' : 'text-slate-400 hover:text-slate-900'}`}
                        >
                            Sign Up
                            {isRegister && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary-red"></div>}
                        </button>
                    </div>
                </div>

                <div className="max-w-md w-full mx-auto pt-10 pb-20">
                    <div className="space-y-4 mb-10">
                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tightest uppercase italic leading-none transition-colors duration-500">
                            {isRegister ? 'Create Account' : (isAdminLogin ? 'Admin Login' : 'Login')}
                        </h2>
                        <p className="text-slate-400 text-xs font-medium italic">
                            {isRegister ? 'Please enter your details to create an account.' : 'Please enter your email and password to sign in.'}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {!isAdminLogin && (
                            <div className="grid grid-cols-2 gap-4">
                                <button type="button" className="flex items-center justify-center gap-3 py-4 border border-slate-100 bg-white hover:bg-slate-50 transition duration-300 font-black text-[10px] uppercase tracking-widest text-slate-800 rounded-[4px]">
                                    <FaGoogle className="text-red-500" /> Google
                                </button>
                                <button type="button" className="flex items-center justify-center gap-3 py-4 bg-slate-900 border border-slate-900 hover:bg-black transition duration-300 font-black text-[10px] uppercase tracking-widest text-white rounded-[4px]">
                                    <FaGithub /> GitHub
                                </button>
                            </div>
                        )}

                        {!isAdminLogin && (
                            <div className="relative flex items-center justify-center py-6">
                                <div className="w-full h-[1px] bg-slate-100"></div>
                                <span className="absolute bg-white px-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.4em]">Or use your email</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {isRegister && (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Your Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        placeholder="Full Name" 
                                        className="w-full bg-slate-50 border-b border-slate-100 px-5 py-4 focus:bg-white focus:border-primary-red outline-none transition font-bold text-sm placeholder:text-slate-300" 
                                    />
                                </div>
                            )}
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Email Address</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    placeholder="email@example.com" 
                                    className="w-full bg-slate-50 border-b border-slate-100 px-5 py-4 focus:bg-white focus:border-primary-red outline-none transition font-bold text-sm placeholder:text-slate-300" 
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Password</label>
                                    {!isRegister && (
                                        <button type="button" className="text-[9px] font-black text-primary-red uppercase tracking-widest hover:underline">Forgot?</button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        required
                                        placeholder="••••••••" 
                                        className="w-full bg-slate-50 border-b border-slate-100 px-5 py-4 focus:bg-white focus:border-primary-red outline-none transition font-bold text-sm placeholder:text-slate-300 pr-14" 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition"
                                    >
                                        {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {!isRegister && (
                                <div className="flex items-center justify-between pt-4">
                                    <label className="flex items-center space-x-3 cursor-pointer group text-left w-full">
                                        <div 
                                            onClick={() => setIsAdminLogin(!isAdminLogin)}
                                            className={`w-4 h-4 border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 rounded-[4px] ${isAdminLogin ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200 group-hover:border-primary-red'}`}
                                        >
                                            {isAdminLogin && <FiCheck className="text-white" size={10} />}
                                        </div>
                                        <div onClick={() => setIsAdminLogin(!isAdminLogin)} className="flex flex-col">
                                            <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isAdminLogin ? 'text-blue-600' : 'text-slate-400'}`}>Sign in as Administrator</span>
                                        </div>
                                    </label>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className={`w-full py-5 font-black text-[11px] uppercase tracking-[0.4em] transition-all duration-500 shadow-2xl active:scale-95 disabled:opacity-50 rounded-[4px] ${isAdminLogin ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-primary-red hover:bg-slate-900 text-white'}`}
                            >
                                {loading ? 'Please Wait...' : (isRegister ? 'Sign Up' : (isAdminLogin ? 'Access Admin' : 'Login'))}
                                <FiArrowRight className="inline ml-4" />
                            </button>
                        </form>
                    </div>

                    <p className="mt-10 text-center text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                        By continuing, you agree to our <br/>
                        <button type="button" onClick={() => navigate('/terms')} className="text-slate-900 hover:text-primary-red">Terms and Conditions</button> and <button type="button" onClick={() => navigate('/privacy-policy')} className="text-slate-900 hover:text-primary-red">Privacy Policy</button>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
