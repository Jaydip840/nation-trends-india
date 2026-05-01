import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import { useNews } from '../context/NewsContext';
import { FiShield, FiLock, FiCheckCircle, FiArrowRight } from 'react-icons/fi';

const Privacy = () => {
    const { siteSettings } = useNews();
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const sections = [
        {
            id: '01',
            title: 'Information Retrieval Protocol',
            text: 'We collect data through two primary streams: Personal Identification (Name, Email, Account Credentials) and Technical Telemetry (IP Address, Browser Type, Access Timestamps). This data is harvested exclusively to authenticate your identity and synchronize your news preferences across devices.'
        },
        {
            id: '02',
            title: 'Utilization of Intelligence',
            text: 'Your data drives our editorial delivery system. We utilize your input to transmit breaking news alerts, manage your "Saved Stories" vault, and generate anonymized analytics that help us understand which narratives are most critical to our community.'
        },
        {
            id: '03',
            title: 'Digital Footprint & Cookies',
            text: 'Our platform utilizes "Essential Snapshots" (Cookies) to maintain your login session and "Analytical Tracers" to monitor site performance. We do not use cross-site tracking cookies to follow your activity outside of the Nation Trends India domain.'
        },
        {
            id: '04',
            title: 'Retention & Destruction',
            text: 'Identity records are preserved as long as your account remains active. Upon a "Right to be Forgotten" request or account deletion, all associated personal identifiers are purged from our primary database within 72 hours, leaving only anonymized statistics.'
        },
        {
            id: '05',
            title: 'Global Security Standard',
            text: 'We employ AES-256 encryption for data at rest and TLS 1.3 for data in transit. While we maintain a high-security perimeter, users acknowledge that no digital transmission is impervious to advanced persistent threats, and we recommend unique password protocols.'
        },
        {
            id: '06',
            title: 'Third-Party Disclosure',
            text: 'Nation Trends India operates on a "Zero-Sale" policy. Your personal identity is never sold, traded, or leased to third-party marketers. Data is only shared with trusted infrastructure partners (like Google Cloud) solely for the purpose of maintaining our services.'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Privacy Policy | {siteSettings.title}</title>
            </Helmet>

            <div className="bg-white min-h-screen">
                <Breadcrumb items={[{ label: 'Legal Center', href: '/legal' }, { label: 'Privacy Policy', href: '#' }]} />

                <section className="max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-12">
                    <div className="space-y-6 text-left">
                        <span className="inline-block py-1 px-3 bg-blue-50 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em] rounded-sm">
                            Data Protection
                        </span>
                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase">
                            Privacy <br />
                            <span className="text-primary-red italic">Policy.</span>
                        </h1>
                        <div className="flex items-center justify-between py-6 border-y border-slate-100">
                            <p className="text-slate-500 text-sm font-medium">Last Updated: <span className="text-slate-900 font-bold">{date}</span></p>
                            <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                <FiCheckCircle /> <span>GDPR Compliant</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-4xl mx-auto px-4 md:px-6 pb-32 text-left">
                    <div className="prose prose-slate max-w-none">
                        <div className="mb-16 border-l-4 border-primary-red pl-10">
                            <p className="text-lg md:text-2xl font-black text-slate-900 tracking-tight leading-relaxed italic">
                                "Your digital identity is your own. We are committed to protecting your personal data with absolute transparency."
                            </p>
                        </div>

                        <div className="space-y-20">
                            {sections.map((item, i) => (
                                <div key={i} className="group">
                                    <div className="flex items-baseline space-x-4 md:space-x-6 mb-4 md:mb-6">
                                        <span className="text-3xl md:text-6xl font-black text-slate-100 group-hover:text-primary-red transition-colors duration-700 leading-none">{item.id}</span>
                                        <h3 className="text-lg md:text-2xl font-black text-slate-900 tracking-tight uppercase">{item.title}</h3>
                                    </div>
                                    <div className="pl-0 md:pl-16 lg:pl-20">
                                        <p className="text-base md:text-lg text-slate-600 font-medium leading-relaxed">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-32 pt-12 border-t border-slate-100 flex justify-center">
                        <a href="/legal" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-primary-red transition-all flex items-center gap-3">
                            <FiShield /> <span>Return to Legal Hub</span> <FiArrowRight />
                        </a>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Privacy;
