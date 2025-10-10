import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 antialiased">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top nav / brand */}
        <nav className="flex items-center justify-between py-6">
          <div className="flex items-center gap-3">
            <Image src="/images/the_alphabridge_logo.png" alt="Alphabridge" width={48} height={48} className="rounded-lg shadow" />
            <span className="font-extrabold text-xl text-slate-900">Alphabridge</span>
            <span className="text-sm text-slate-500 ml-2">Meeting Calendar</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-700 hover:text-slate-900">Log in</Link>
            <Link href="/signup" className="hidden sm:inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-md shadow hover:from-blue-700">Sign up</Link>
          </div>
        </nav>

        {/* Hero */}
        <header className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center py-12">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">Calendar tailor-made for teams — organized, visible, and under control.</h1>
            <p className="text-lg text-slate-600 mb-6 max-w-2xl">Create meetings, manage roles, track attendance and status, and get actionable insights — all in one collaborative calendar.</p>

            <div className="flex flex-wrap gap-3">
              <Link href="/signup" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-lg font-semibold shadow hover:bg-indigo-700">Get started free</Link>
              <Link href="/dashboard" className="inline-flex items-center gap-2 border border-slate-200 px-5 py-3 rounded-lg text-slate-700 hover:bg-slate-50">View demo</Link>
            </div>

            <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600">
              <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-blue-600" />Real-time updates</li>
              <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-indigo-600" />Custom roles & approvals</li>
              <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />Status-based workflows</li>
              <li className="flex items-center gap-2"><span className="inline-block w-2 h-2 rounded-full bg-amber-500" />Dark-friendly UI</li>
            </ul>
          </div>

          <div className="relative w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden bg-white">
              <Image src="/images/the.jpg" alt="Preview" width={540} height={540} className="object-cover w-full h-72 sm:h-96" />
              <div className="p-4">
                <div className="text-sm text-slate-500">Live preview</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-2 rounded"><div className="text-xs font-semibold text-slate-700">Dashboard</div></div>
                  <div className="bg-slate-50 p-2 rounded"><div className="text-xs font-semibold text-slate-700">Calendar</div></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Features */}
        <section className="py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">Powerful features for modern teams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-2xl shadow border border-slate-100">
              <div className="text-indigo-600 mb-3">📅</div>
              <h3 className="font-semibold text-lg mb-2">Smart Scheduling</h3>
              <p className="text-sm text-slate-600">Create meetings with ease, suggest times, and avoid conflicts across teammates.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow border border-slate-100">
              <div className="text-emerald-600 mb-3">👥</div>
              <h3 className="font-semibold text-lg mb-2">Team Management</h3>
              <p className="text-sm text-slate-600">Assign roles, set supervisors, and control meeting eligibility per role.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl shadow border border-slate-100">
              <div className="text-amber-500 mb-3">🔔</div>
              <h3 className="font-semibold text-lg mb-2">Notifications & Status</h3>
              <p className="text-sm text-slate-600">Fine-grained meeting status, reminders, and in-app notifications keep everyone aligned.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-gradient-to-r from-slate-50 to-white">
          <div className="rounded-2xl p-8 bg-gradient-to-r from-indigo-600 to-sky-500 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">Start scheduling better today</h3>
              <p className="text-slate-100 mt-2">Sign up and get a team calendar that adapts to your workflow.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/signup" className="bg-white text-indigo-700 px-4 py-2 rounded font-semibold">Create account</Link>
              <Link href="/login" className="border border-white px-4 py-2 rounded text-white">Demo login</Link>
            </div>
          </div>
        </section>

        <footer className="py-12 text-center text-sm text-slate-500">© {new Date().getFullYear()} Alphabridge — Built with care</footer>

        {/* SVG Icons (kept for compatibility if used elsewhere) */}
        <svg style={{ display: 'none' }}>
          <symbol id="calendar-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/></symbol>
          <symbol id="users-icon" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M17 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zM3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2"/></symbol>
          <symbol id="chart-icon" viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="9" y="8" width="4" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="15" y="4" width="4" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/></symbol>
          <symbol id="clock-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2"/></symbol>
        </svg>
      </div>
    </main>
  );
}


