"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Download,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  Users,
  UserRound,
  X,
  Armchair,
  ClipboardCheck,
  Building2,
  ChartNoAxesCombined,
  Wallet,
  Plus,
  Sparkles
} from "lucide-react";

const branches = [
  { name: "All branches", location: "Organization overview" },
  { name: "StudyDesk - City Centre", location: "Dumka, Jharkhand" },
  { name: "StudyDesk - Station Road", location: "Dumka, Jharkhand" },
  { name: "StudyDesk - College Road", location: "Dumka, Jharkhand" }
];

const navGroups = [
  {
    label: "WORKSPACE",
    items: [
      { label: "Overview", icon: LayoutDashboard },
      { label: "Branches", icon: Building2 },
      { label: "Students", icon: Users },
      { label: "Admissions", icon: GraduationCap }
    ]
  },
  {
    label: "LIBRARY OPERATIONS",
    items: [
      { label: "Seat management", icon: Armchair },
      { label: "Memberships", icon: ShieldCheck },
      { label: "Attendance", icon: ClipboardCheck },
      { label: "Fee collection", icon: Wallet }
    ]
  },
  {
    label: "MANAGEMENT",
    items: [
      { label: "Staff", icon: UserRound },
      { label: "Reports", icon: ChartNoAxesCombined },
      { label: "Settings", icon: Settings }
    ]
  }
];

const initialStats = [
  { label: "Total students", value: "1,284", change: "+12.8%", note: "vs. last month", icon: Users, tone: "blue" },
  { label: "Active memberships", value: "1,096", change: "+8.2%", note: "vs. last month", icon: ShieldCheck, tone: "green" },
  { label: "Today's collection", value: "₹18,450", change: "+6.4%", note: "vs. yesterday", icon: Wallet, tone: "violet" },
  { label: "Seat occupancy", value: "82%", change: "+3.1%", note: "vs. last week", icon: Armchair, tone: "amber" }
];

const collections = [
  { day: "Mon", amount: 42 }, { day: "Tue", amount: 58 }, { day: "Wed", amount: 48 },
  { day: "Thu", amount: 72 }, { day: "Fri", amount: 64 }, { day: "Sat", amount: 88 },
  { day: "Sun", amount: 54 }
];

const admissions = [
  { name: "Aarav Kumar", id: "STU-2408", branch: "City Centre", plan: "Monthly", date: "Today, 10:42 AM", initials: "AK", color: "blue" },
  { name: "Priya Kumari", id: "STU-2407", branch: "Station Road", plan: "Quarterly", date: "Today, 09:18 AM", initials: "PK", color: "rose" },
  { name: "Rohan Sinha", id: "STU-2406", branch: "College Road", plan: "Monthly", date: "Yesterday", initials: "RS", color: "amber" },
  { name: "Ananya Das", id: "STU-2405", branch: "City Centre", plan: "Monthly", date: "Yesterday", initials: "AD", color: "green" }
];

const expiring = [
  { name: "Rahul Raj", id: "STU-1982", due: "Today", branch: "City Centre" },
  { name: "Sneha Kumari", id: "STU-1874", due: "Tomorrow", branch: "Station Road" },
  { name: "Amit Kumar", id: "STU-1761", due: "In 2 days", branch: "College Road" }
];

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [branch, setBranch] = useState(branches[0]);
  const [branchOpen, setBranchOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [period, setPeriod] = useState("This week");
  const [search, setSearch] = useState("");

  const visibleAdmissions = useMemo(
    () => admissions.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.id.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-800">
      {mobileNavOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${mobileNavOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#244d73] text-white shadow-sm"><BookOpen size={21} strokeWidth={2.2} /></div>
            <div><p className="text-[17px] font-bold tracking-tight text-slate-900">StudyDesk</p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Library management</p></div>
          </div>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>

        <div className="px-4 pb-3 pt-5">
          <button onClick={() => setBranchOpen(!branchOpen)} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-slate-300">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#315d84] shadow-sm"><Building2 size={17} /></div>
            <div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{branch.name}</p><p className="mt-0.5 truncate text-[10px] text-slate-500">{branch.location}</p></div>
            <ChevronDown size={15} className={`text-slate-400 transition ${branchOpen ? "rotate-180" : ""}`} />
          </button>
          {branchOpen && <div className="mt-2 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">{branches.map((item) => <button key={item.name} onClick={() => { setBranch(item); setBranchOpen(false); }} className={`w-full rounded-lg px-3 py-2.5 text-left text-xs transition hover:bg-slate-50 ${branch.name === item.name ? "bg-blue-50 font-semibold text-[#244d73]" : "text-slate-600"}`}><span className="block">{item.name}</span><span className="mt-0.5 block text-[10px] font-normal text-slate-400">{item.location}</span></button>)}</div>}
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-5 pt-2">
          {navGroups.map((group) => <div key={group.label} className="mb-6">
            <p className="mb-2 px-3 text-[9px] font-bold tracking-[0.16em] text-slate-400">{group.label}</p>
            <div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; const active = activeNav === item.label; return <button key={item.label} onClick={() => { setActiveNav(item.label); setMobileNavOpen(false); }} className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium transition ${active ? "bg-[#edf3f8] text-[#244d73]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}><Icon size={17} strokeWidth={active ? 2.2 : 1.8} /><span className="flex-1">{item.label}</span>{item.label === "Fee collection" && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-semibold text-rose-600">3</span>}</button>; })}</div>
          </div>)}
        </nav>

        <div className="border-t border-slate-100 p-4">
          <div className="mb-3 rounded-xl bg-[#f5f8fb] p-3"><div className="mb-2 flex items-center gap-2 text-[#315d84]"><Sparkles size={14} /><span className="text-[10px] font-bold">DEMO WORKSPACE</span></div><p className="text-[10px] leading-4 text-slate-500">Sample data is for presentation purposes. Changes stay in this browser session.</p></div>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50"><CircleHelp size={16} /> Help & support</button>
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50"><LogOut size={16} /> Sign out</button>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[258px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3">
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
            <div className="min-w-0"><div className="flex items-center gap-2 text-[11px] text-slate-400"><span>Workspace</span><ChevronRight size={12} /><span className="truncate font-semibold text-slate-600">{activeNav}</span></div><h1 className="mt-1 truncate text-[17px] font-bold tracking-tight text-slate-900">{activeNav === "Overview" ? "Overview" : activeNav}</h1></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-500 md:flex"><CalendarDays size={14} /><span>{today}</span></div>
            <button aria-label="Notifications" className="relative rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><Bell size={17} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" /></button>
            <div className="hidden h-8 w-px bg-slate-200 sm:block" />
            <button className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-slate-50"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8eef4] text-[11px] font-bold text-[#244d73]">AK</div><div className="hidden sm:block"><p className="text-[11px] font-semibold text-slate-800">Admin Kunal</p><p className="text-[9px] text-slate-400">Library owner</p></div><ChevronDown size={13} className="hidden text-slate-400 sm:block" /></button>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-9 lg:py-8">
          {activeNav !== "Overview" && <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800"><Sparkles size={16} className="mt-0.5 shrink-0" /><div><p className="font-semibold">{activeNav} preview</p><p className="mt-1 text-blue-700/80">This section is part of the demo navigation. Its functional screens will be added in the next build steps. Return to Overview to see the dashboard.</p></div></div>}
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="mb-1 text-[11px] font-medium text-slate-400">Good morning, Admin Kunal</p><h2 className="text-[24px] font-bold tracking-tight text-slate-900 sm:text-[27px]">Library overview</h2><p className="mt-1.5 text-xs text-slate-500">Here&apos;s what&apos;s happening across your libraries today.</p></div>
            <div className="flex flex-wrap items-center gap-2"><button className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"><Download size={14} /> Export report</button><button onClick={() => setActiveNav("Admissions")} className="inline-flex items-center gap-2 rounded-lg bg-[#244d73] px-3.5 py-2.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#193c5e]"><Plus size={15} /> New admission</button></div>
          </div>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {initialStats.map((stat) => { const Icon = stat.icon; return <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-5"><div className="flex items-center justify-between"><p className="text-[11px] font-medium text-slate-500">{stat.label}</p><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.tone === "blue" ? "bg-blue-50 text-blue-700" : stat.tone === "green" ? "bg-emerald-50 text-emerald-700" : stat.tone === "violet" ? "bg-violet-50 text-violet-700" : "bg-amber-50 text-amber-700"}`}><Icon size={16} /></span></div><div className="mt-3 flex items-end justify-between gap-2"><p className="text-[25px] font-bold tracking-tight text-slate-900">{stat.value}</p><span className="mb-1 inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-1 text-[9px] font-bold text-emerald-700"><ArrowUpRight size={11} />{stat.change}</span></div><p className="mt-1 text-[10px] text-slate-400">{stat.note}</p></div>; })}
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-[13px] font-bold text-slate-900">Collection overview</h3><p className="mt-1 text-[10px] text-slate-400">Payment collection across all branches</p></div><select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-medium text-slate-600 outline-none focus:border-[#7894ad]"><option>This week</option><option>This month</option><option>Last 7 days</option></select></div>
              <div className="mt-6 flex items-end gap-2"><p className="text-[26px] font-bold tracking-tight text-slate-900">₹1,42,850</p><span className="mb-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600"><ArrowUpRight size={12} /> 9.6%</span></div>
              <p className="mt-1 text-[10px] text-slate-400">Compared to previous period</p>
              <div className="mt-6 grid h-[170px] grid-cols-7 items-end gap-3 border-b border-slate-100 pb-0">
                {collections.map((item) => <div key={item.day} className="flex h-full flex-col items-center justify-end gap-2"><div className="flex h-full w-full items-end"><div title={`₹${item.amount * 1000}`} className={`w-full rounded-t-md transition-all hover:opacity-80 ${item.day === "Sat" ? "bg-[#244d73]" : "bg-[#dbe5ee]"}`} style={{ height: `${item.amount}%` }} /></div><span className="pb-2 text-[9px] font-medium text-slate-400">{item.day}</span></div>)}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-5"><span className="inline-flex items-center gap-2 text-[9px] text-slate-500"><span className="h-2 w-2 rounded-sm bg-[#244d73]" /> Current period</span><span className="inline-flex items-center gap-2 text-[9px] text-slate-500"><span className="h-2 w-2 rounded-sm bg-[#dbe5ee]" /> Daily collection</span></div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.03)] sm:p-6">
              <div className="flex items-start justify-between"><div><h3 className="text-[13px] font-bold text-slate-900">Seat occupancy</h3><p className="mt-1 text-[10px] text-slate-400">Live seat status across branches</p></div><button aria-label="More seat options" className="rounded-md p-1 text-slate-400 hover:bg-slate-50"><MoreHorizontal size={17} /></button></div>
              <div className="mt-5 flex items-center gap-5">
                <div className="relative flex h-[132px] w-[132px] shrink-0 items-center justify-center rounded-full" style={{ background: "conic-gradient(#244d73 0% 82%, #e9eef3 82% 100%)" }}><div className="flex h-[100px] w-[100px] flex-col items-center justify-center rounded-full bg-white"><p className="text-[25px] font-bold text-slate-900">82%</p><p className="text-[9px] text-slate-400">Occupied</p></div></div>
                <div className="min-w-0 flex-1 space-y-4"><div><p className="text-[19px] font-bold text-slate-900">328 <span className="text-[10px] font-medium text-slate-400">/ 400</span></p><p className="text-[10px] text-slate-400">Total seats</p></div><div className="space-y-2"><div className="flex justify-between text-[10px]"><span className="text-slate-500">Occupied</span><span className="font-semibold text-slate-700">328</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[82%] rounded-full bg-[#244d73]" /></div><div className="flex justify-between text-[10px]"><span className="text-slate-500">Available</span><span className="font-semibold text-slate-700">72</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-[18%] rounded-full bg-[#c8d6e2]" /></div></div></div>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold text-slate-600">Branch-wise occupancy</p><button onClick={() => setActiveNav("Branches")} className="text-[10px] font-semibold text-[#315d84] hover:underline">View branches</button></div><div className="mt-3 space-y-3">{[{name:"City Centre",value:91},{name:"Station Road",value:78},{name:"College Road",value:74}].map((item) => <div key={item.name}><div className="mb-1 flex justify-between text-[9px]"><span className="text-slate-500">{item.name}</span><span className="font-semibold text-slate-700">{item.value}%</span></div><div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-[#7894ad]" style={{width:`${item.value}%`}} /></div></div>)}</div></div>
            </div>
          </section>

          <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
            <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h3 className="text-[13px] font-bold text-slate-900">Recent admissions</h3><p className="mt-1 text-[10px] text-slate-400">Latest students registered across your libraries</p></div><button onClick={() => setActiveNav("Students")} className="text-[10px] font-semibold text-[#315d84] hover:underline">View all students</button></div>
              <div className="border-b border-slate-100 px-5 py-3 sm:px-6"><div className="relative max-w-[260px]"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student or ID..." className="h-8 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-[10px] outline-none placeholder:text-slate-400 focus:border-[#7894ad]" /></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3 sm:px-6">Student</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Admission date</th><th className="px-4 py-3"></th></tr></thead><tbody>{visibleAdmissions.map((item) => <tr key={item.id} className="border-t border-slate-100 hover:bg-slate-50/60"><td className="px-5 py-3 sm:px-6"><div className="flex items-center gap-2.5"><div className={`flex h-8 w-8 items-center justify-center rounded-full text-[9px] font-bold ${item.color === "blue" ? "bg-blue-50 text-blue-700" : item.color === "rose" ? "bg-rose-50 text-rose-700" : item.color === "amber" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{item.initials}</div><div><p className="text-[10px] font-semibold text-slate-800">{item.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{item.id}</p></div></div></td><td className="px-4 py-3 text-[10px] text-slate-500">{item.branch}</td><td className="px-4 py-3"><span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-600">{item.plan}</span></td><td className="px-4 py-3 text-[10px] text-slate-500">{item.date}</td><td className="px-4 py-3 text-right"><button aria-label={`More options for ${item.name}`} className="rounded p-1 text-slate-400 hover:bg-slate-100"><MoreHorizontal size={15} /></button></td></tr>)}{visibleAdmissions.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-[11px] text-slate-400">No students match your search.</td></tr>}</tbody></table></div>
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 sm:px-6"><p className="text-[9px] text-slate-400">Showing {visibleAdmissions.length} of 1,284 students</p><div className="flex gap-1"><button aria-label="Previous page" className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50"><ChevronLeft size={13} /></button><button aria-label="Next page" className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50"><ChevronRight size={13} /></button></div></div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)]">
              <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6"><div><h3 className="text-[13px] font-bold text-slate-900">Memberships expiring</h3><p className="mt-1 text-[10px] text-slate-400">Students requiring renewal follow-up</p></div><span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">3 due soon</span></div>
              <div className="divide-y divide-slate-100">{expiring.map((item) => <div key={item.id} className="flex items-center justify-between gap-2 px-5 py-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700"><Clock3 size={15} /></div><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-slate-800">{item.name}</p><p className="mt-0.5 truncate text-[9px] text-slate-400">{item.id} · {item.branch}</p></div></div><span className={`shrink-0 rounded-md px-2 py-1 text-[9px] font-semibold ${item.due === "Today" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-700"}`}>{item.due}</span></div>)}</div>
              <div className="border-t border-slate-100 px-5 py-3 sm:px-6"><button onClick={() => setActiveNav("Memberships")} className="text-[10px] font-semibold text-[#315d84] hover:underline">View all expiring memberships →</button></div>
            </div>
          </section>

          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[9px] text-slate-400 sm:flex-row"><p>© 2026 StudyDesk · Library Management Demo</p><p>Demo data only · Not for live library operations</p></footer>
        </main>
      </div>
    </div>
  );
}
