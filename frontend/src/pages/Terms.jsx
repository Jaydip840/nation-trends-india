import { Helmet } from 'react-helmet-async';
import Breadcrumb from '../components/Breadcrumb';
import { useNews } from '../context/NewsContext';
import { FiFileText, FiCheckCircle, FiArrowRight, FiActivity } from 'react-icons/fi';

const Terms = () => {
    const { siteSettings } = useNews();
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const sections = [
        {
            id: '01',
            title: 'Registry Access & Eligibility',
            text: 'Nation Trends India provides access to news narratives for individuals who agree to these governing protocols. You are responsible for maintaining the confidentiality of your account credentials and for all operations occurring under your digital identity.'
        },
        {
            id: '02',
            title: 'Proprietary Editorial Assets',
            text: 'All intelligence reports, visual media, branding, and custom interface designs are the exclusive property of Nation Trends India. You are granted a limited, non-exclusive license to view content for personal information. Commercial scraping, bulk extraction, or unauthorized redistribution of our journalism is strictly prohibited.'
        },
        {
            id: '03',
            title: 'Governing Conduct & Prohibitions',
            text: 'Users must not engage in "Narrative Manipulation" (posting false information), "Security Interference" (attempting to bypass security), or "Asset Harvesting" (automated data collection). Violation of these protocols will result in immediate and permanent account suspension.'
        },
        {
            id: '04',
            title: 'Limit of Jurisdictional Liability',
            text: 'Our reports are provided for informational awareness. We are not liable for any specific actions taken by users based on our coverage. We do not warrant that our platform will be uninterrupted or error-free at all times.'
        },
        {
            id: '05',
            title: 'Contractual Modifications',
            text: 'We reserve the right to modify these governance protocols at our sole discretion. Continued use of the platform after updates constitutes your "Contractual Acceptance" of the revised terms.'
        },
        {
            id: '06',
            title: 'Legal Resolution & Venue',
            text: 'Any disputes arising from these terms will be governed by the laws of India and resolved exclusively within the jurisdiction of the Gujarat High Court system.'
        }
    ];

    return (
        <>
            <Helmet>
                <title>Terms of Use | {siteSettings.title}</title>
            </Helmet>

            <div className="bg-white min-h-screen">
                <Breadcrumb items={[{ label: 'Legal Center', href: '/legal' }, { label: 'Terms of Use', href: '#' }]} />

                <section className="max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-12">
                    <div className="space-y-6 text-left">
                        <span className="inline-block py-1 px-3 bg-slate-950 text-white font-bold text-[10px] uppercase tracking-[0.2em] rounded-sm">
                            Platform Governance
                        </span>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none uppercase">
                            Terms of <br />
                            <span className="text-primary-red italic">Use.</span>
                        </h1>
                        <div className="flex items-center justify-between py-6 border-y border-slate-100">
                            <p className="text-slate-500 text-sm font-medium">Agreement Updated: <span className="text-slate-900 font-bold">{date}</span></p>
                            <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                <FiCheckCircle /> <span>Legally Binding</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="max-w-4xl mx-auto px-4 md:px-6 pb-32 text-left">
                    <div className="prose prose-slate max-w-none">
                        <div className="mb-16 border-l-4 border-slate-950 pl-10">
                            <p className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-relaxed italic">
                                "The integrity of our platform depends on the mutual respect of our community and the protection of our editorial independence."
                            </p>
                        </div>

                        <div className="space-y-20">
                            {sections.map((item, i) => (
                                <div key={i} className="group">
                                    <div className="flex items-baseline space-x-6 mb-6">
                                        <span className="text-4xl md:text-6xl font-black text-slate-100 group-hover:text-slate-900 transition-colors duration-700 leading-none">{item.id}</span>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{item.title}</h3>
                                    </div>
                                    <div className="pl-0 md:pl-20">
                                        <p className="text-lg text-slate-600 font-medium leading-relaxed">{item.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-32 pt-12 border-t border-slate-100 flex justify-center">
                        <a href="/legal" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 hover:text-primary-red transition-all flex items-center gap-3">
                            <FiActivity /> <span>Return to Legal Hub</span> <FiArrowRight />
                        </a>
                    </div>
                </section>
            </div>
        </>
    );
};

export default Terms;
