import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <header className="w-full max-w-5xl mx-auto flex flex-col items-center pt-20 pb-12 px-4">
        <div className="flex items-center gap-3 mb-4">
          <img src="/images/the_alphabridge_logo.jpg" alt="Alphabridge Logo" className="h-12 w-12 rounded-lg shadow-lg" />
          <span className="text-3xl font-extrabold text-blue-700 tracking-tight">Alphabridge Meeting Calendar</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 text-center mb-4 drop-shadow-sm">
          Effortless Team Scheduling & Smart Meeting Management
        </h1>
        <p className="text-lg text-gray-600 text-center max-w-2xl mb-8">
          Organize, track, and optimize your meetings with a modern, collaborative calendar platform. Visualize your schedule, manage your team, and never miss a meeting again.
        </p>
        <div className="flex gap-4">
          <Link href="/signup" className="rounded-full bg-blue-600 text-white px-8 py-3 font-semibold text-lg shadow-lg hover:bg-blue-700 transition">Get Started</Link>
          <Link href="/login" className="rounded-full border border-blue-600 text-blue-700 px-8 py-3 font-semibold text-lg bg-white shadow hover:bg-blue-50 transition">Log In</Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 px-4 mb-20">
        <div className="flex flex-col items-center bg-white/80 rounded-2xl shadow-lg border border-blue-100 p-6 hover:scale-[1.03] transition">
          <span className="bg-blue-100 p-3 rounded-xl mb-3"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500"><use href="#calendar-icon" /></svg></span>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Smart Scheduling</h3>
          <p className="text-gray-500 text-center">Easily create, edit, and view meetings with a visual calendar and time grid.</p>
        </div>
        <div className="flex flex-col items-center bg-white/80 rounded-2xl shadow-lg border border-purple-100 p-6 hover:scale-[1.03] transition">
          <span className="bg-purple-100 p-3 rounded-xl mb-3"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500"><use href="#users-icon" /></svg></span>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Team Collaboration</h3>
          <p className="text-gray-500 text-center">Invite team members, assign roles, and keep everyone in sync with real-time updates.</p>
        </div>
        <div className="flex flex-col items-center bg-white/80 rounded-2xl shadow-lg border border-green-100 p-6 hover:scale-[1.03] transition">
          <span className="bg-green-100 p-3 rounded-xl mb-3"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500"><use href="#chart-icon" /></svg></span>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Analytics Dashboard</h3>
          <p className="text-gray-500 text-center">Track meeting stats, user activity, and team engagement with beautiful charts.</p>
        </div>
        <div className="flex flex-col items-center bg-white/80 rounded-2xl shadow-lg border border-yellow-100 p-6 hover:scale-[1.03] transition">
          <span className="bg-yellow-100 p-3 rounded-xl mb-3"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-500"><use href="#clock-icon" /></svg></span>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Reminders & Notifications</h3>
          <p className="text-gray-500 text-center">Stay on top of your schedule with timely reminders and smart notifications.</p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full max-w-4xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-blue-800 mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 rounded-full p-4 mb-3"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500"><use href="#calendar-icon" /></svg></div>
            <h4 className="font-semibold text-gray-800 mb-1">1. Sign Up</h4>
            <p className="text-gray-500 text-center">Create your free account and set up your team.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-purple-100 rounded-full p-4 mb-3"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500"><use href="#users-icon" /></svg></div>
            <h4 className="font-semibold text-gray-800 mb-1">2. Schedule Meetings</h4>
            <p className="text-gray-500 text-center">Add meetings, invite members, and manage your calendar visually.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="bg-green-100 rounded-full p-4 mb-3"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500"><use href="#chart-icon" /></svg></div>
            <h4 className="font-semibold text-gray-800 mb-1">3. Track & Optimize</h4>
            <p className="text-gray-500 text-center">Monitor stats, get reminders, and keep your team on track.</p>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="w-full max-w-5xl mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold text-blue-800 mb-8 text-center">Preview</h2>
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-center">
          <img src="/images/the_alphabridge_logo.jpg" alt="App Preview" className="rounded-2xl shadow-2xl border border-blue-100 w-64 h-64 object-contain bg-white" />
          <div className="flex flex-col gap-4">
            <div className="bg-white/80 rounded-xl shadow p-4 border border-gray-100 max-w-xs">
              <span className="block text-blue-700 font-bold mb-1">Dashboard Analytics</span>
              <span className="text-gray-500 text-sm">See all your meetings, stats, and team activity in one place.</span>
            </div>
            <div className="bg-white/80 rounded-xl shadow p-4 border border-gray-100 max-w-xs">
              <span className="block text-purple-700 font-bold mb-1">Visual Calendar</span>
              <span className="text-gray-500 text-sm">Drag, drop, and manage meetings with a beautiful time grid.</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="w-full py-10 bg-gradient-to-r from-blue-600 to-purple-600 flex flex-col items-center">
        <h3 className="text-2xl font-bold text-white mb-4">Ready to get started?</h3>
        <div className="flex gap-4">
          <Link href="/signup" className="rounded-full bg-white text-blue-700 px-8 py-3 font-semibold text-lg shadow hover:bg-blue-50 transition">Sign Up Free</Link>
          <Link href="/login" className="rounded-full border border-white text-white px-8 py-3 font-semibold text-lg hover:bg-white/10 transition">Log In</Link>
        </div>
      </footer>

      {/* SVG Icons for inline use */}
      <svg style={{ display: 'none' }}>
        <symbol id="calendar-icon" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="4" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2"/></symbol>
        <symbol id="users-icon" viewBox="0 0 24 24"><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M17 11c1.104 0 2-.896 2-2s-.896-2-2-2-2 .896-2 2 .896 2 2 2zM3 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" stroke="currentColor" strokeWidth="2"/></symbol>
        <symbol id="chart-icon" viewBox="0 0 24 24"><rect x="3" y="12" width="4" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="9" y="8" width="4" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/><rect x="15" y="4" width="4" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="2"/></symbol>
        <symbol id="clock-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2"/></symbol>
      </svg>
    </div>
  );
}


