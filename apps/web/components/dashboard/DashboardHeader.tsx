"use client";

interface DashboardHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  userCount: number;
  onlineCount: number;
}

const TABS = [
  { id: "all", label: "All Online", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg> },
  { id: "top", label: "Top Rated", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> },
  { id: "new", label: "New Users", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></svg> },
  { id: "live", label: "Live Now", icon: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg> },
];

export default function DashboardHeader({ activeTab, onTabChange, userCount, onlineCount }: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      {/* Promo Banner */}
      <div className="glass rounded-3xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.12] via-secondary/[0.06] to-transparent" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white mb-1">
              <span className="gradient-text">{onlineCount}</span> people online now
            </h2>
            <p className="text-gray-400 text-sm">
              Connect face-to-face with people from around the world
            </p>
          </div>
          <button className="btn-glow px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-xl shadow-primary/25 flex items-center gap-2 shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>
            Random Match
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.id
                ? "gradient-main text-white shadow-lg shadow-primary/25"
                : "glass text-gray-400 hover:text-white hover:bg-white/[0.04]"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
