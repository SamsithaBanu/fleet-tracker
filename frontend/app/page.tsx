import Link from "next/link";
import { dashboardData } from "@/data/data";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#088395] selection:text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#088395] to-[#2C687B] flex items-center justify-center shadow-lg shadow-[#088395]/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
            </svg>
          </div>
          <span className="font-semibold text-white tracking-tight text-lg">FleetTracker</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
          >
            Sign in
          </Link>
          <Link
            href="/dashboard"
            className="text-sm bg-white hover:bg-gray-200 text-black px-4 py-2 rounded-lg transition-all font-medium shadow-sm hover:shadow-md"
          >
            Go to dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#088395]/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-300 text-xs font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#088395] animate-pulse shadow-[0_0_8px_#088395]"></span>
          Real-time GPS tracking active
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-tight max-w-4xl mb-6">
          Fleet management
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#088395] to-[#35858E]">built for speed</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl leading-relaxed mb-10 font-medium">
          Track every vehicle live on the map, assign deliveries instantly, and monitor your entire fleet from one dashboard.
        </p>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link
            href="/dashboard"
            className="bg-[#088395] hover:bg-[#35858E] text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-[0_0_20px_rgba(8,131,149,0.3)] hover:shadow-[0_0_30px_rgba(8,131,149,0.5)] hover:-translate-y-0.5"
          >
            Open dashboard
          </Link>
          <Link
            href="/login"
            className="bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Stats row */}
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {dashboardData?.map((stat: { label: string, value: string }) => (
            <div
              key={stat?.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:bg-white/[0.07] transition-colors"
            >
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto px-6 mb-32">
        <h2 className="text-3xl font-bold text-white mb-12 text-center">Everything in one place</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                </svg>
              ),
              title: "Live GPS tracking",
              desc: "See every vehicle moving on the map in real time. Location updates every 5 seconds via MQTT.",
              color: "text-[#088395]",
              bg: "bg-[#088395]/10",
              border: "hover:border-[#088395]/50"
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
              ),
              title: "Fleet management",
              desc: "Add vehicles, assign drivers, track fuel and maintenance schedules all from one screen.",
              color: "text-[#2C687B]",
              bg: "bg-[#2C687B]/10",
              border: "hover:border-[#2C687B]/50"
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
                </svg>
              ),
              title: "Order lifecycle",
              desc: "Create orders, assign to nearest driver, track status from pickup to delivered with proof.",
              color: "text-[#35858E]",
              bg: "bg-[#35858E]/10",
              border: "hover:border-[#35858E]/50"
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
                </svg>
              ),
              title: "Smart notifications",
              desc: "SMS, push, and email alerts via Twilio and Firebase when order status changes.",
              color: "text-[#088395]",
              bg: "bg-[#088395]/10",
              border: "hover:border-[#088395]/50"
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              ),
              title: "Analytics & reports",
              desc: "Driver performance, fleet utilisation, delivery KPIs and heatmaps updated in real time.",
              color: "text-[#2C687B]",
              bg: "bg-[#2C687B]/10",
              border: "hover:border-[#2C687B]/50"
            },
            {
              icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              ),
              title: "Role-based access",
              desc: "Superadmin, admin, dispatcher, driver and customer — each sees only what they need.",
              color: "text-[#35858E]",
              bg: "bg-[#35858E]/10",
              border: "hover:border-[#35858E]/50"
            },
          ].map((f) => (
            <div
              key={f.title}
              className={`bg-white/5 border border-white/10 rounded-2xl p-6 group transition-all duration-300 hover:bg-white/[0.07] ${f.border}`}
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} ${f.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-inner`}>
                {f.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role cards */}
      <section className="max-w-4xl mx-auto px-6 mb-32">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Built for every role</h2>
          <p className="text-gray-400 text-sm font-medium">Four different interfaces, one powerful backend</p>
        </div>
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { role: "Admin", desc: "Full company view, all cities, billing & reports", badge: "bg-white/10 text-white" },
            { role: "Dispatcher", desc: "Assign orders to nearest available drivers", badge: "bg-white/10 text-white" },
            { role: "Driver", desc: "Mobile app — accept, navigate, deliver, earn", badge: "bg-white/10 text-white" },
            { role: "Customer", desc: "Live tracking link, no login required", badge: "bg-white/10 text-white" },
          ].map((r) => (
            <div key={r.role} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all">
              <span className={`inline-block text-xs font-bold px-3 py-1.5 rounded-full mb-4 ${r.badge}`}>
                {r.role}
              </span>
              <p className="text-sm text-gray-400 leading-relaxed font-medium">{r.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <div className="bg-gradient-to-br from-[#088395]/20 to-black border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-[#088395]/5 blur-3xl rounded-full"></div>
          <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Ready to start building?</h2>
          <p className="text-gray-400 text-base mb-8 max-w-lg mx-auto relative z-10 font-medium">
            Set up takes less than 5 minutes. Follow the Phase 1 guide to get your auth service running.
          </p>
          <Link
            href="/dashboard"
            className="inline-block bg-white text-black hover:bg-gray-200 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 relative z-10"
          >
            Open dashboard →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-8 flex items-center justify-between flex-wrap gap-4 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#088395] to-[#2C687B] flex items-center justify-center opacity-80 shadow-lg shadow-[#088395]/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-500">FleetTracker — built with Next.js + Node.js</span>
        </div>
        <span className="text-xs font-bold bg-white/5 text-gray-400 border border-white/10 px-3 py-1.5 rounded-full">Phase 1 in progress</span>
      </footer>
    </div>
  );
}
