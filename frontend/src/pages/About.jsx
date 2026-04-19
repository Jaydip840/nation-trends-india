import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import { useNews } from '../context/NewsContext';
import { FiGlobe, FiShield, FiCpu, FiArrowRight, FiCheckCircle, FiInbox } from 'react-icons/fi';

const About = () => {
  const { siteSettings } = useNews();
  
  return (
    <>
      <Helmet>
        <title>About {siteSettings.title} | Editorial Standards & Mission</title>
        <meta name="description" content={`Discover the architectural core of ${siteSettings.title}. We are a premium news organization dedicated to verified narratives.`} />
      </Helmet>

      <div className="bg-white min-h-screen">
        <Breadcrumb items={[{ label: 'About Us', href: '#' }]} />

        {/* HERO SECTION - STANDARDIZED CONTACT UI */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-12">
          <div className="space-y-6">
            <span className="inline-block py-1 px-3 bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] rounded-[4px]">
              Mission Statement
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              The Standard of <br />
              <span className="text-primary-red italic">Global Journalism.</span>
            </h1>
          </div>
        </section>

        {/* MAIN ABOUT GRID - CONTACT PAGE INSPIRED */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-20">
            
            {/* LEFT: STRATEGIC PILLARS (Like Contact Info) */}
            <div className="lg:col-span-4 space-y-12">
              <div className="space-y-10">
                {[
                  { icon: <FiShield />, title: 'Absolute Integrity', desc: 'Every narrative undergoes a multi-layer verification protocol. We prioritize depth over speed.' },
                  { icon: <FiGlobe />, title: 'Global Footprint', desc: 'With a network spanning across continents, we translate local pulse into global understanding.' },
                  { icon: <FiCpu />, title: 'Technological Edge', desc: 'State-of-the-art information systems to track and verify events in real-time.' }
                ].map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-primary-red">{item.icon}</div>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{item.title}</h3>
                    </div>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed pt-2 transition-all">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-6 pt-8 border-t border-transparent">
                <div className="flex items-center space-x-3">
                  <FiInbox className="text-slate-900" size={20} />
                  <h3 className="text-lg font-black tracking-tight uppercase">Operational Scale.</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <span className="block text-3xl font-black text-slate-900 tracking-tighter">{siteSettings.audienceCount}</span>
                        <span className="block text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold">Global Presence</span>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                        <span className="block text-3xl font-black text-slate-900 tracking-tighter">24/7</span>
                        <span className="block text-[9px] uppercase tracking-[0.3em] text-slate-400 font-bold">Editorial Wire</span>
                    </div>
                </div>
              </div>
            </div>

            {/* RIGHT: THE DETAILED NARRATIVE (Like Contact Form) */}
            <div className="lg:col-span-8">
              <div className="space-y-12">
                <div className="space-y-6">
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tightest uppercase">The Editorial Sanctuary.</h3>
                    <p className="text-slate-500 text-lg font-medium leading-relaxed">
                        In an era of information volatility, we serve as a sanctuary for verified data. Our editorial desk scrutinizes the layers of every global narrative to ensure absolute clarity.
                    </p>
                </div>

                <div className="aspect-video overflow-hidden bg-slate-100 relative group">
                    <img 
                        src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=1200" 
                        alt="Newsroom Architecture" 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" 
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                    <div className="space-y-4">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Independence Protocol</h4>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">Our newsroom is protected by a strict commercial firewall. We do not accept funding or influence from political entities, ensuring objective narratives.</p>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Radical Transparency</h4>
                        <p className="text-slate-500 text-sm leading-relaxed font-medium">Our sources are verified through a double-blind protocol, and every decision is recorded to maintain absolute accountability.</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                    {['Verified Sources', 'Double-Blind Review', 'Neutral Stance', 'Correction Policy'].map((tag, i) => (
                        <div key={i} className="flex items-center space-x-2 px-4 py-2 bg-slate-50 rounded-[4px] text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <FiCheckCircle className="text-emerald-500" />
                            <span>{tag}</span>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA - MATCHING CONTACT UI */}
        <section className="relative overflow-hidden pt-20 pb-20 text-center bg-white border-t border-slate-50">
          <div className="relative z-20 max-w-4xl mx-auto px-4 md:px-6 space-y-8">
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase leading-none">
              Step into the <br />
              <span className="text-primary-red">Editorial Archive.</span>
            </h2>
            <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed italic max-w-xl mx-auto">
              Explore the depth of our investigative reporting across every critical Indian narrative.
            </p>
            <div className="pt-6">
              <a href="/category/india" className="group relative inline-flex items-center space-x-4 px-12 py-5 bg-slate-900 text-white rounded-[8px] font-black text-[10px] uppercase tracking-[0.4em] hover:bg-primary-red transition-all active:scale-95 shadow-xl shadow-slate-200">
                <span>Launch Output Wire</span>
                <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default About;
