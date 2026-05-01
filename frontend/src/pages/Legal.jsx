import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import { useNews } from '../context/NewsContext';
import { FiShield, FiFileText, FiInfo, FiLock, FiExternalLink, FiChevronRight, FiDatabase, FiCheckCircle, FiShieldOff, FiArrowRight } from 'react-icons/fi';

const Legal = ({ type, Hub }) => {
  const { siteSettings } = useNews();
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (Hub) {
    return (
      <>
        <Helmet>
          <title>Legal Center | {siteSettings.title}</title>
        </Helmet>
        <div className="bg-white min-h-screen">
          <Breadcrumb items={[{ label: 'Legal Center', href: '#' }]} />
          
          <section className="max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-20 text-center">
            <span className="inline-block py-1 px-3 bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-6">Transparency Portal</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 tracking-tighter uppercase leading-none mb-8">
              Legal <span className="text-primary-red italic">HUB</span>
            </h1>
            <p className="max-w-2xl mx-auto text-slate-500 text-lg font-medium leading-relaxed italic">
              "Governing our community with integrity, clarity, and total transparency."
            </p>
          </section>

          <section className="max-w-7xl mx-auto px-4 md:px-6 pb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  title: 'Privacy Policy', 
                  desc: 'How we manage, protect and utilize your personal data and digital identity.',
                  icon: <FiLock />,
                  link: '/privacy-policy'
                },
                { 
                  title: 'Terms of Use', 
                  desc: 'The essential rules and agreements for accessing our editorial platform.',
                  icon: <FiFileText />,
                  link: '/terms'
                },
                { 
                  title: 'Cookie Disclaimer', 
                  desc: 'Understanding the technology we use to enhance your reading experience.',
                  icon: <FiShield />,
                  link: '/disclaimer'
                }
              ].map((item, i) => (
                <a 
                  key={i} 
                  href={item.link} 
                  className="group bg-slate-50 p-8 md:p-12 border border-slate-100 hover:bg-slate-950 transition-all duration-500 ease-in-out rounded-sm relative overflow-hidden"
                >
                  <div className="w-12 h-12 bg-white flex items-center justify-center text-slate-900 group-hover:bg-primary-red group-hover:text-white transition-all duration-500 mb-8 rounded-sm shadow-sm group-hover:shadow-2xl">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-white uppercase italic tracking-tighter mb-4 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-500 group-hover:text-slate-400 text-sm font-medium leading-relaxed mb-8 transition-colors">
                    {item.desc}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-slate-950 group-hover:text-primary-red transition-all duration-500">
                    <span>View Docs</span> 
                    <FiArrowRight className="group-hover:translate-x-3 transition-transform duration-500" />
                  </div>
                </a>
              ))}
            </div>
          </section>
        </div>
      </>
    );
  }

  const getIcon = () => {
    if (type.toLowerCase().includes('privacy')) return <FiLock />;
    if (type.toLowerCase().includes('terms')) return <FiFileText />;
    return <FiShield />;
  };

  return (
    <>
      <Helmet>
        <title>{type} | {siteSettings.title}</title>
      </Helmet>

      <div className="bg-white min-h-screen">
        <Breadcrumb items={[{ label: 'Legal Center', href: '/legal' }, { label: type, href: '#' }]} />

        {/* ELEGANT HEADER - MATCHING CONTACT UI */}
        <section className="max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-12">
          <div className="space-y-6">
            <span className="inline-block py-1 px-3 bg-slate-100 text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] rounded-none">
              Official Documentation
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase">
              {type.split(' ').slice(0, -1).join(' ')} <br />
              <span className="text-primary-red italic">{type.split(' ').slice(-1)}</span>
            </h1>
            <div className="flex items-center justify-between py-6 border-y border-slate-100">
              <p className="text-slate-500 text-sm font-medium">Last Updated: <span className="text-slate-900 font-bold">{date}</span></p>
              <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <FiCheckCircle /> <span>Active Status</span>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT AREA */}
        <section className="max-w-4xl mx-auto px-4 md:px-6 pb-32">
          <div className="prose prose-slate max-w-none">
            <div className="mb-16 border-l-4 border-primary-red pl-6 md:pl-10">
              <p className="text-lg md:text-2xl font-black text-slate-900 tracking-tight leading-relaxed">
                At Nation Trends India, we believe in radical transparency. This document outlines our data governance and the legal framework that protects our community.
              </p>
            </div>

            <div className="space-y-20">
              {[
                {
                  id: '01',
                  title: 'Data Collection & Purpose',
                  text: 'We collect personal information such as your name and email address when you voluntarily subscribe to our newsletter or contact our newsroom. This data is used solely to enhance your experience, provide requested information, and maintain the security of our platform.'
                },
                {
                  id: '02',
                  title: 'Cookie Policy',
                  text: 'We use cookies to understand site usage and improve our content. Cookies are small text files placed on your device to help us recognize you on future visits. You can control cookie settings through your browser, though some features of our site may be affected if cookies are disabled.'
                },
                {
                  id: '03',
                  title: 'Advertising Partners',
                  text: 'To keep our reporting free and accessible, we partner with advertising networks like Google AdSense. These partners may use cookies (such as DART cookies) to serve ads based on your visits to our site and other sites on the internet. You can opt out of personalized advertising via Google\'s ad settings.'
                },
                {
                  id: '04',
                  title: 'Information Security',
                  text: 'We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.'
                },
                {
                  id: '05',
                  title: 'Your Rights & Sovereignty',
                  text: 'You have the right to access, update, or request the deletion of your personal data at any time. If you wish to exercise these rights or have questions about our privacy practices, please contact our data protection officer.'
                }
              ].map((item, i) => (
                <section key={i} className="group">
                  <div className="flex items-baseline space-x-4 md:space-x-6 mb-4 md:mb-6">
                    <span className="text-3xl md:text-5xl font-black text-slate-100 group-hover:text-primary-red transition-colors duration-500 select-none leading-none">{item.id}</span>
                    <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight uppercase">{item.title}</h3>
                  </div>
                  <div className="pl-0 md:pl-16 lg:pl-20">
                    <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed">{item.text}</p>
                  </div>
                </section>
              ))}

              {/* ADDITIONAL LEGAL SECTIONS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-16 border-t border-slate-100">
                <div className="space-y-6">
                  <h4 className="text-xl font-black text-slate-900 uppercase">Intellectual Property.</h4>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">All content, including articles, images, and logos, are the property of Nation Trends India and are protected by international copyright laws. Any unauthorized use or reproduction is strictly prohibited.</p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-xl font-black text-slate-900 uppercase">Contact Legal.</h4>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">For legal inquiries, copyright claims, or data protection concerns, please reach out to our legal department directly.</p>
                  <div className="pt-2">
                    <a href={`mailto:legal@${siteSettings.email.split('@')[1]}`} className="inline-flex items-center space-x-2 text-[10px] font-black uppercase tracking-[0.4em] text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-primary-red hover:border-primary-red transition-all">
                      <span>Reach Legal Panel</span> <FiArrowRight />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER PACT */}
          <div className="mt-32 pt-12 border-t border-slate-100 text-center">
            <a href="/" className="inline-block px-12 py-4 bg-slate-900 text-white rounded-[8px] text-[10px] font-black uppercase tracking-[0.5em] hover:bg-primary-red transition-all">
              Return to Home
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default Legal;

