"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen, LayoutDashboard, Building2, Users, GraduationCap, Armchair,
  ShieldCheck, ClipboardCheck, Wallet, UserRound, ChartNoAxesCombined,
  Settings, Menu, X, ChevronDown, Search, Plus, Pencil, Trash2,
  MapPin, Phone, CalendarDays, CheckCircle2, AlertCircle, Sparkles,
  ArrowUpRight, Clock3
} from "lucide-react";

type Branch = { id: string; name: string; location: string; capacity: number; active: boolean };
type Student = {
  id: string; name: string; phone: string; branchId: string; plan: string;
  admissionDate: string; status: "Active" | "Inactive";
};

const seedBranches: Branch[] = [
  { id: "BR-001", name: "City Centre", location: "Dumka, Jharkhand", capacity: 160, active: true },
  { id: "BR-002", name: "Station Road", location: "Dumka, Jharkhand", capacity: 140, active: true },
  { id: "BR-003", name: "College Road", location: "Dumka, Jharkhand", capacity: 100, active: true }
];

const seedStudents: Student[] = [
  { id: "STU-2408", name: "Aarav Kumar", phone: "9876543210", branchId: "BR-001", plan: "Monthly", admissionDate: "2026-11-21", status: "Active" },
  { id: "STU-2407", name: "Priya Kumari", phone: "9876543211", branchId: "BR-002", plan: "Quarterly", admissionDate: "2026-11-20", status: "Active" },
  { id: "STU-2406", name: "Rohan Sinha", phone: "9876543212", branchId: "BR-003", plan: "Monthly", admissionDate: "2026-11-19", status: "Active" },
  { id: "STU-2405", name: "Ananya Das", phone: "9876543213", branchId: "BR-001", plan: "Monthly", admissionDate: "2026-11-18", status: "Active" },
  { id: "STU-2404", name: "Rahul Raj", phone: "9876543214", branchId: "BR-002", plan: "Half-yearly", admissionDate: "2026-11-17", status: "Inactive" }
];

const navGroups = [
  { label: "WORKSPACE", items: [{ label: "Overview", icon: LayoutDashboard }, { label: "Branches", icon: Building2 }, { label: "Students", icon: Users }, { label: "Admissions", icon: GraduationCap }] },
  { label: "LIBRARY OPERATIONS", items: [{ label: "Seat management", icon: Armchair }, { label: "Memberships", icon: ShieldCheck }, { label: "Attendance", icon: ClipboardCheck }, { label: "Fee collection", icon: Wallet }] },
  { label: "MANAGEMENT", items: [{ label: "Staff", icon: UserRound }, { label: "Reports", icon: ChartNoAxesCombined }, { label: "Settings", icon: Settings }] }
];

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#7894ad] focus:ring-2 focus:ring-[#244d73]/10";
const labelClass = "mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-slate-500";

export default function Home() {
  const [activeNav, setActiveNav] = useState("Overview");
  const [branches, setBranches] = useState<Branch[]>(seedBranches);
  const [students, setStudents] = useState<Student[]>(seedStudents);
  const [loaded, setLoaded] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<string | null>(null);
  const [editingStudent, setEditingStudent] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [branchForm, setBranchForm] = useState({ name: "", location: "", capacity: "100" });
  const [studentForm, setStudentForm] = useState({ name: "", phone: "", branchId: seedBranches[0].id, plan: "Monthly", admissionDate: new Date().toISOString().slice(0, 10), status: "Active" as "Active" | "Inactive" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("studydesk-demo-v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.branches)) setBranches(parsed.branches);
        if (Array.isArray(parsed.students)) setStudents(parsed.students);
      }
    } catch {
      setNotice("Saved demo data could not be read. Sample data is loaded.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("studydesk-demo-v1", JSON.stringify({ branches, students }));
  }, [branches, students, loaded]);

  const branchName = (id: string) => branches.find((branch) => branch.id === id)?.name || "Branch unavailable";
  const activeBranches = branches.filter((branch) => branch.active);
  const branchFilteredStudents = useMemo(() => students.filter((student) => selectedBranch === "all" || student.branchId === selectedBranch), [students, selectedBranch]);
  const visibleStudents = useMemo(() => branchFilteredStudents.filter((student) => {
    const query = studentSearch.trim().toLowerCase();
    return !query || student.name.toLowerCase().includes(query) || student.id.toLowerCase().includes(query) || student.phone.includes(query);
  }), [branchFilteredStudents, studentSearch]);
  const visibleBranches = useMemo(() => branches.filter((branch) => (branch.name + " " + branch.location).toLowerCase().includes(branchSearch.toLowerCase())), [branches, branchSearch]);
  const activeStudents = students.filter((student) => student.status === "Active").length;
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  function openNewBranch() {
    setEditingBranch(null);
    setBranchForm({ name: "", location: "", capacity: "100" });
    setShowBranchForm(true);
  }

  function saveBranch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = branchForm.name.trim();
    const location = branchForm.location.trim();
    const capacity = Number(branchForm.capacity);
    if (!name || !location || !Number.isFinite(capacity) || capacity < 1) return;
    if (editingBranch) {
      setBranches((current) => current.map((branch) => branch.id === editingBranch ? { ...branch, name, location, capacity } : branch));
      setNotice("Branch details updated.");
    } else {
      const id = "BR-" + String(Date.now()).slice(-6);
      setBranches((current) => [...current, { id, name, location, capacity, active: true }]);
      setNotice("New branch added.");
    }
    setShowBranchForm(false);
    setEditingBranch(null);
  }

  function editBranch(branch: Branch) {
    setEditingBranch(branch.id);
    setBranchForm({ name: branch.name, location: branch.location, capacity: String(branch.capacity) });
    setShowBranchForm(true);
  }

  function deleteBranch(branch: Branch) {
    const linked = students.filter((student) => student.branchId === branch.id).length;
    if (linked) {
      setNotice("This branch has " + linked + " linked student(s). Move or remove those records before deleting it.");
      return;
    }
    if (!window.confirm("Delete " + branch.name + "? This cannot be undone.")) return;
    setBranches((current) => current.filter((item) => item.id !== branch.id));
    if (selectedBranch === branch.id) setSelectedBranch("all");
    setNotice("Branch deleted.");
  }

  function openNewStudent() {
    setEditingStudent(null);
    setStudentForm({ name: "", phone: "", branchId: activeBranches[0]?.id || "", plan: "Monthly", admissionDate: new Date().toISOString().slice(0, 10), status: "Active" });
    setShowStudentForm(true);
  }

  function editStudent(student: Student) {
    setEditingStudent(student.id);
    setStudentForm({ name: student.name, phone: student.phone, branchId: student.branchId, plan: student.plan, admissionDate: student.admissionDate, status: student.status });
    setShowStudentForm(true);
  }

  function saveStudent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = studentForm.name.trim();
    const phone = studentForm.phone.trim();
    if (!name || !/^[0-9]{10}$/.test(phone) || !branches.some((branch) => branch.id === studentForm.branchId)) return;
    if (editingStudent) {
      setStudents((current) => current.map((student) => student.id === editingStudent ? { ...student, ...studentForm, name, phone } : student));
      setNotice("Student profile updated.");
    } else {
      const nextNumber = Math.max(2400, ...students.map((student) => Number(student.id.replace("STU-", "")) || 0)) + 1;
      const id = "STU-" + nextNumber;
      setStudents((current) => [{ id, ...studentForm, name, phone }, ...current]);
      setNotice("Student admitted. Generated ID: " + id);
    }
    setShowStudentForm(false);
    setEditingStudent(null);
  }

  function deleteStudent(student: Student) {
    if (!window.confirm("Delete student " + student.name + "?")) return;
    setStudents((current) => current.filter((item) => item.id !== student.id));
    setNotice("Student record deleted.");
  }

  const navTo = (label: string) => {
    setActiveNav(label);
    setMobileNavOpen(false);
    setNotice("");
    if (label === "Admissions") openNewStudent();
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-800">
      {mobileNavOpen && <button aria-label="Close navigation" className="fixed inset-0 z-30 bg-slate-950/35 lg:hidden" onClick={() => setMobileNavOpen(false)} />}
      <aside className={"fixed inset-y-0 left-0 z-40 flex w-[258px] flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 " + (mobileNavOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#244d73] text-white"><BookOpen size={21} /></div><div><p className="text-[17px] font-bold tracking-tight text-slate-900">StudyDesk</p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Library management</p></div></div>
          <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <div className="px-4 pb-3 pt-5">
          <label className={labelClass}>Selected branch</label>
          <select value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)} className={inputClass}>
            <option value="all">All branches</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
          <p className="mt-1.5 px-1 text-[10px] text-slate-400">Switch branch to filter student records.</p>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 pb-5 pt-2">
          {navGroups.map((group) => <div key={group.label} className="mb-6"><p className="mb-2 px-3 text-[9px] font-bold tracking-[0.16em] text-slate-400">{group.label}</p><div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; const active = activeNav === item.label; return <button key={item.label} onClick={() => navTo(item.label)} className={"group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium transition " + (active ? "bg-[#edf3f8] text-[#244d73]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")}><Icon size={17} /><span className="flex-1">{item.label}</span>{!["Overview", "Branches", "Students", "Admissions"].includes(item.label) && <span className="text-[9px] text-slate-300">Soon</span>}</button>; })}</div></div>)}
        </nav>
        <div className="border-t border-slate-100 p-4"><div className="mb-3 rounded-xl bg-[#f5f8fb] p-3"><div className="mb-2 flex items-center gap-2 text-[#315d84]"><Sparkles size={14} /><span className="text-[10px] font-bold">DEMO WORKSPACE</span></div><p className="text-[10px] leading-4 text-slate-500">Sample data only. Changes are saved in this browser.</p></div><div className="flex items-center gap-2 px-2 text-[10px] text-slate-400"><ShieldCheck size={13} /> Local demo mode</div></div>
      </aside>

      <div className="min-h-screen lg:pl-[258px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3"><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu"><Menu size={20} /></button><div className="min-w-0"><div className="flex items-center gap-2 text-[11px] text-slate-400"><span>Workspace</span><span>/</span><span className="truncate font-semibold text-slate-600">{activeNav}</span></div><h1 className="mt-1 truncate text-[17px] font-bold tracking-tight text-slate-900">{activeNav}</h1></div></div>
          <div className="flex items-center gap-2 sm:gap-4"><div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-500 md:flex"><CalendarDays size={14} /><span>{today}</span></div><div className="hidden h-8 w-px bg-slate-200 sm:block" /><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8eef4] text-[11px] font-bold text-[#244d73]">AK</div><div className="hidden sm:block"><p className="text-[11px] font-semibold text-slate-800">Admin</p><p className="text-[9px] text-slate-400">Library owner</p></div></div></div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-7 sm:px-7 lg:px-9 lg:py-8">
          {notice && <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800"><div className="flex items-start gap-2"><AlertCircle size={15} className="mt-0.5 shrink-0" /><span>{notice}</span></div><button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={14} /></button></div>}

          {activeNav === "Overview" && <Overview branches={branches} students={students} onNavigate={navTo} branchName={branchName} />}
          {activeNav === "Branches" && <section>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">ORGANIZATION SETUP</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Branches</h2><p className="mt-1.5 text-xs text-slate-500">Create and manage all your study library locations.</p></div><button onClick={openNewBranch} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#193c5e]"><Plus size={15} /> Add branch</button></div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><Metric label="Total branches" value={String(branches.length)} detail="Across your organization" icon={<Building2 size={16} />} /><Metric label="Active branches" value={String(activeBranches.length)} detail="Currently operating" icon={<CheckCircle2 size={16} />} /><Metric label="Total seat capacity" value={branches.reduce((sum, branch) => sum + branch.capacity, 0).toLocaleString("en-IN")} detail="Configured seats" icon={<Armchair size={16} />} /></div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6"><div><h3 className="text-[13px] font-bold text-slate-900">All branches</h3><p className="mt-1 text-[10px] text-slate-400">{branches.length} branch records</p></div><div className="relative w-full sm:max-w-[250px]"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={branchSearch} onChange={(event) => setBranchSearch(event.target.value)} placeholder="Search branch or location..." className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-[10px] outline-none focus:border-[#7894ad]" /></div></div>
              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{visibleBranches.map((branch) => { const count = students.filter((student) => student.branchId === branch.id).length; return <div key={branch.id} className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300"><div className="flex items-start justify-between gap-2"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3f8] text-[#315d84]"><Building2 size={18} /></div><span className={"rounded-full px-2 py-1 text-[9px] font-semibold " + (branch.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{branch.active ? "Active" : "Inactive"}</span></div><h4 className="mt-4 text-[14px] font-bold text-slate-900">{branch.name}</h4><p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500"><MapPin size={12} />{branch.location}</p><div className="mt-4 grid grid-cols-2 gap-2 border-y border-slate-100 py-3"><div><p className="text-[18px] font-bold text-slate-900">{count}</p><p className="text-[9px] text-slate-400">Students</p></div><div><p className="text-[18px] font-bold text-slate-900">{branch.capacity}</p><p className="text-[9px] text-slate-400">Seat capacity</p></div></div><div className="mt-3 flex items-center justify-between"><p className="text-[9px] text-slate-400">{branch.id}</p><div className="flex gap-1"><button onClick={() => editBranch(branch)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[9px] font-semibold text-slate-600 hover:bg-slate-50"><Pencil size={11} /> Edit</button><button onClick={() => deleteBranch(branch)} className="rounded-md border border-rose-100 p-1.5 text-rose-500 hover:bg-rose-50" aria-label={"Delete " + branch.name}><Trash2 size={12} /></button></div></div></div>; })}</div>
              {visibleBranches.length === 0 && <EmptyState title="No branches found" detail="Try another search or add a new branch." />}
            </div>
          </section>}

          {activeNav === "Students" && <section>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">STUDENT DIRECTORY</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Students</h2><p className="mt-1.5 text-xs text-slate-500">Manage student profiles and view records branch-wise.</p></div><button onClick={openNewStudent} disabled={activeBranches.length === 0} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#193c5e] disabled:cursor-not-allowed disabled:opacity-50"><Plus size={15} /> Add student</button></div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><Metric label="Total students" value={String(students.length)} detail="All registered records" icon={<Users size={16} />} /><Metric label="Active students" value={String(activeStudents)} detail="Currently active" icon={<CheckCircle2 size={16} />} /><Metric label="Branches" value={String(branches.length)} detail="Available locations" icon={<Building2 size={16} />} /></div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-[13px] font-bold text-slate-900">Student records</h3><p className="mt-1 text-[10px] text-slate-400">Showing {visibleStudents.length} matching students</p></div><span className="rounded-full bg-[#edf3f8] px-2.5 py-1 text-[9px] font-semibold text-[#315d84]">{selectedBranch === "all" ? "All branches" : branchName(selectedBranch)}</span></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_220px]"><div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search name, student ID or phone..." className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-[10px] outline-none focus:border-[#7894ad]" /></div><select value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[10px] text-slate-600 outline-none focus:border-[#7894ad]"><option value="all">All branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3 sm:px-6">Student</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Admission date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{visibleStudents.map((student) => <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50/60"><td className="px-5 py-3 sm:px-6"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf3f8] text-[9px] font-bold text-[#315d84]">{student.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><div><p className="text-[10px] font-semibold text-slate-800">{student.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{student.id}</p></div></div></td><td className="px-4 py-3 text-[10px] text-slate-500">{student.phone}</td><td className="px-4 py-3 text-[10px] text-slate-500">{branchName(student.branchId)}</td><td className="px-4 py-3"><span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-600">{student.plan}</span></td><td className="px-4 py-3 text-[10px] text-slate-500">{student.admissionDate}</td><td className="px-4 py-3"><span className={"rounded-full px-2 py-1 text-[9px] font-semibold " + (student.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{student.status}</span></td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => editStudent(student)} className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50" aria-label={"Edit " + student.name}><Pencil size={12} /></button><button onClick={() => deleteStudent(student)} className="rounded-md border border-rose-100 p-1.5 text-rose-500 hover:bg-rose-50" aria-label={"Delete " + student.name}><Trash2 size={12} /></button></div></td></tr>)}{visibleStudents.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-[11px] text-slate-400">No student records match your filters.</td></tr>}</tbody></table></div>
            </div>
          </section>}

          {!["Overview", "Branches", "Students"].includes(activeNav) && <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf3f8] text-[#315d84]"><Sparkles size={20} /></div><h2 className="mt-4 text-[17px] font-bold text-slate-900">{activeNav} module is next</h2><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">This item is visible in the demo navigation, but its workflow has not been built yet. Branch and student management are available now.</p><button onClick={() => navTo("Overview")} className="mt-5 rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Back to overview</button></div>}

          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[9px] text-slate-400 sm:flex-row"><p>© 2026 StudyDesk · Library Management Demo</p><p>Demo data only · Stored locally in this browser</p></footer>
        </main>
      </div>

      {showBranchForm && <Modal title={editingBranch ? "Edit branch" : "Add new branch"} onClose={() => setShowBranchForm(false)}><form onSubmit={saveBranch} className="space-y-4"><div><label className={labelClass}>Branch name *</label><input required value={branchForm.name} onChange={(event) => setBranchForm({ ...branchForm, name: event.target.value })} placeholder="e.g. Main Market" className={inputClass} /></div><div><label className={labelClass}>Location / address *</label><input required value={branchForm.location} onChange={(event) => setBranchForm({ ...branchForm, location: event.target.value })} placeholder="City, state" className={inputClass} /></div><div><label className={labelClass}>Total seat capacity *</label><input required min="1" type="number" value={branchForm.capacity} onChange={(event) => setBranchForm({ ...branchForm, capacity: event.target.value })} className={inputClass} /></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowBranchForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">{editingBranch ? "Save changes" : "Create branch"}</button></div></form></Modal>}

      {showStudentForm && <Modal title={editingStudent ? "Edit student profile" : "New student admission"} onClose={() => setShowStudentForm(false)}><form onSubmit={saveStudent} className="space-y-3"><div><label className={labelClass}>Student full name *</label><input required value={studentForm.name} onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} placeholder="Enter full name" className={inputClass} /></div><div><label className={labelClass}>Mobile number *</label><input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={studentForm.phone} onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value.replace(/[^0-9]/g, "") })} placeholder="10-digit mobile number" className={inputClass} /></div><div><label className={labelClass}>Branch *</label><select required value={studentForm.branchId} onChange={(event) => setStudentForm({ ...studentForm, branchId: event.target.value })} className={inputClass}>{activeBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Membership plan</label><select value={studentForm.plan} onChange={(event) => setStudentForm({ ...studentForm, plan: event.target.value })} className={inputClass}><option>Monthly</option><option>Quarterly</option><option>Half-yearly</option><option>Yearly</option><option>Daily</option></select></div><div><label className={labelClass}>Admission date</label><input type="date" value={studentForm.admissionDate} onChange={(event) => setStudentForm({ ...studentForm, admissionDate: event.target.value })} className={inputClass} /></div></div><div><label className={labelClass}>Status</label><select value={studentForm.status} onChange={(event) => setStudentForm({ ...studentForm, status: event.target.value as "Active" | "Inactive" })} className={inputClass}><option>Active</option><option>Inactive</option></select></div><p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800">Demo note: student ID is generated automatically. Do not enter real student personal information in this demo.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowStudentForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">{editingStudent ? "Save profile" : "Complete admission"}</button></div></form></Modal>}
    </div>
  );
}

function Metric({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-medium text-slate-500">{label}</p><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3f8] text-[#315d84]">{icon}</span></div><p className="mt-3 text-[24px] font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-[10px] text-slate-400">{detail}</p></div>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="px-6 py-12 text-center"><p className="text-[12px] font-semibold text-slate-700">{title}</p><p className="mt-1 text-[10px] text-slate-400">{detail}</p></div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="max-h-[90vh] w-full max-w-[470px] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-center justify-between"><h3 className="text-[16px] font-bold text-slate-900">{title}</h3><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close dialog"><X size={17} /></button></div>{children}</div></div>;
}

function Overview({ branches, students, onNavigate, branchName }: { branches: Branch[]; students: Student[]; onNavigate: (label: string) => void; branchName: (id: string) => string }) {
  const active = students.filter((student) => student.status === "Active").length;
  const stats = [{ label: "Total students", value: students.length.toLocaleString("en-IN"), note: "Across all branches", icon: Users }, { label: "Active memberships", value: active.toLocaleString("en-IN"), note: "Currently active", icon: ShieldCheck }, { label: "Total branches", value: String(branches.length), note: "Configured locations", icon: Building2 }, { label: "Seat capacity", value: branches.reduce((sum, branch) => sum + branch.capacity, 0).toLocaleString("en-IN"), note: "Configured seats", icon: Armchair }];
  const recent = students.slice(0, 5);
  return <><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">Good day, Admin</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Library overview</h2><p className="mt-1.5 text-xs text-slate-500">A snapshot of your study library operations.</p></div><button onClick={() => onNavigate("Admissions")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#193c5e]"><Plus size={15} /> New admission</button></div>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-[11px] font-medium text-slate-500">{stat.label}</p><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3f8] text-[#315d84]"><Icon size={16} /></span></div><p className="mt-3 text-[25px] font-bold tracking-tight text-slate-900">{stat.value}</p><p className="mt-1 text-[10px] text-slate-400">{stat.note}</p></div>; })}</section>
    <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]"><div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="text-[13px] font-bold text-slate-900">Branch directory</h3><p className="mt-1 text-[10px] text-slate-400">Your configured library locations</p></div><button onClick={() => onNavigate("Branches")} className="text-[10px] font-semibold text-[#315d84] hover:underline">Manage branches</button></div><div className="mt-4 space-y-3">{branches.map((branch) => { const count = students.filter((student) => student.branchId === branch.id).length; return <div key={branch.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf3f8] text-[#315d84]"><Building2 size={16} /></div><div className="min-w-0"><p className="truncate text-[11px] font-semibold text-slate-800">{branch.name}</p><p className="mt-0.5 truncate text-[9px] text-slate-400">{branch.location}</p></div></div><div className="shrink-0 text-right"><p className="text-[12px] font-bold text-slate-800">{count} <span className="text-[9px] font-normal text-slate-400">students</span></p><p className="text-[9px] text-slate-400">{branch.capacity} seats</p></div></div>; })}{branches.length === 0 && <EmptyState title="No branches created" detail="Add a branch to start organizing student records." />}</div></div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="text-[13px] font-bold text-slate-900">Recent student records</h3><p className="mt-1 text-[10px] text-slate-400">Latest entries in this demo</p></div><button onClick={() => onNavigate("Students")} className="text-[10px] font-semibold text-[#315d84] hover:underline">View students</button></div><div className="mt-4 divide-y divide-slate-100">{recent.map((student) => <div key={student.id} className="flex items-center justify-between gap-2 py-3"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-slate-800">{student.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{student.id} · {branchName(student.branchId)}</p></div><span className={"shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold " + (student.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{student.status}</span></div>)}{recent.length === 0 && <EmptyState title="No students yet" detail="Add your first student record." />}</div></div></section>
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800"><Sparkles size={15} className="mt-0.5 shrink-0" /><p><span className="font-semibold">Demo workspace:</span> create branches and student profiles to explore the workflows. Data is saved only in this browser using local storage.</p></div>
  </>;
}
