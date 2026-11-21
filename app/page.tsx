"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  BookOpen, LayoutDashboard, Building2, Users, GraduationCap, Armchair,
  ShieldCheck, ClipboardCheck, Wallet, UserRound, ChartNoAxesCombined,
  Settings, Menu, X, ChevronDown, Search, Plus, Pencil, Trash2, Clock3,
  MapPin, CalendarDays, CheckCircle2, AlertCircle, Sparkles
} from "lucide-react";

type Branch = { id: string; name: string; location: string; capacity: number; active: boolean };
type Admission = { id: string; name: string; phone: string; branchId: string; plan: string; admissionDate: string; photo: string; status: "Pending" | "Approved" | "Rejected" };
type Seat = { id: string; branchId: string; number: string; mode: "Fixed" | "Shift-based"; active: boolean; allocations: { studentId: string; shift: string }[] };
type MembershipPlan = { id: string; name: string; durationDays: number; fee: number; active: boolean };
type Membership = { id: string; studentId: string; planId: string; branchId: string; startDate: string; endDate: string; fee: number };
type FeePayment = { id: string; membershipId: string; studentId: string; branchId: string; date: string; amount: number; method: "Cash" | "UPI" | "Bank transfer"; reference: string; note: string };
type AttendanceStatus = "Present" | "Absent" | "Late";
type AttendanceRecord = { id: string; studentId: string; branchId: string; date: string; status: AttendanceStatus };
type StaffRole = "Manager" | "Receptionist" | "Librarian" | "Other";
type StaffMember = { id: string; name: string; phone: string; email: string; address: string; branchId: string; role: StaffRole; status: "Active" | "Inactive" };
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
  const [reportStart, setReportStart] = useState(() => new Date().toISOString().slice(0, 8) + "01");
  const [reportEnd, setReportEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [branches, setBranches] = useState<Branch[]>(seedBranches);
  const [students, setStudents] = useState<Student[]>(seedStudents);
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([
    { id: "PLAN-MON", name: "Monthly", durationDays: 30, fee: 500, active: true },
    { id: "PLAN-QTR", name: "Quarterly", durationDays: 90, fee: 1300, active: true },
    { id: "PLAN-HALF", name: "Half-yearly", durationDays: 180, fee: 2400, active: true },
    { id: "PLAN-YEAR", name: "Yearly", durationDays: 365, fee: 4200, active: true }
  ]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffRoleFilter, setStaffRoleFilter] = useState("all");
  const [staffStatusFilter, setStaffStatusFilter] = useState("all");
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState({ name: "", phone: "", email: "", address: "", branchId: seedBranches[0].id, role: "Librarian" as StaffRole, status: "Active" as "Active" | "Inactive" });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString("en-CA"));
  const [attendanceSearch, setAttendanceSearch] = useState("");
  const [attendanceFilter, setAttendanceFilter] = useState("all");
  const [attendanceDraft, setAttendanceDraft] = useState<Record<string, AttendanceStatus | "">>({});
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ membershipId: "", date: new Date().toISOString().slice(0, 10), amount: "", method: "Cash" as FeePayment["method"], reference: "", note: "" });
  const [feeSearch, setFeeSearch] = useState("");
  const [feeFilter, setFeeFilter] = useState("all");
  const [membershipSearch, setMembershipSearch] = useState("");
  const [membershipStatus, setMembershipStatus] = useState("all");
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [showMembershipForm, setShowMembershipForm] = useState(false);
  const [planForm, setPlanForm] = useState({ name: "", durationDays: "30", fee: "" });
  const [membershipForm, setMembershipForm] = useState({ studentId: "", planId: "PLAN-MON", startDate: new Date().toISOString().slice(0, 10) });
  const [seatSearch, setSeatSearch] = useState("");
  const [seatBranch, setSeatBranch] = useState("all");
  const [seatNumber, setSeatNumber] = useState("");
  const [seatMode, setSeatMode] = useState<"Fixed" | "Shift-based">("Fixed");
  const [seatFormBranch, setSeatFormBranch] = useState(seedBranches[0].id);
  const [loaded, setLoaded] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [admissionSearch, setAdmissionSearch] = useState("");
  const [admissionFilter, setAdmissionFilter] = useState("all");
  const [admissionForm, setAdmissionForm] = useState({ name: "", phone: "", branchId: seedBranches[0].id, plan: "Monthly", admissionDate: new Date().toISOString().slice(0, 10), photo: "" });
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
        if (Array.isArray(parsed.admissions)) setAdmissions(parsed.admissions);
        if (Array.isArray(parsed.seats)) setSeats(parsed.seats);
        if (Array.isArray(parsed.plans)) setPlans(parsed.plans);
        if (Array.isArray(parsed.memberships)) setMemberships(parsed.memberships);
        if (Array.isArray(parsed.payments)) setPayments(parsed.payments);
        if (Array.isArray(parsed.attendance)) setAttendanceRecords(parsed.attendance);
        if (Array.isArray(parsed.staff)) setStaff(parsed.staff);
      }
    } catch {
      setNotice("Saved demo data could not be read. Sample data is loaded.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("studydesk-demo-v1", JSON.stringify({ branches, students, admissions, seats, plans, memberships, payments, attendance: attendanceRecords, staff }));
  }, [branches, students, admissions, seats, plans, memberships, payments, attendanceRecords, staff, loaded]);

  const branchName = (id: string) => branches.find((branch) => branch.id === id)?.name || "Branch unavailable";
  const activeBranches = branches.filter((branch) => branch.active);
  const branchFilteredStudents = useMemo(() => students.filter((student) => selectedBranch === "all" || student.branchId === selectedBranch), [students, selectedBranch]);
  const visibleStudents = useMemo(() => branchFilteredStudents.filter((student) => {
    const query = studentSearch.trim().toLowerCase();
    return !query || student.name.toLowerCase().includes(query) || student.id.toLowerCase().includes(query) || student.phone.includes(query);
  }), [branchFilteredStudents, studentSearch]);
  const visibleBranches = useMemo(() => branches.filter((branch) => (branch.name + " " + branch.location).toLowerCase().includes(branchSearch.toLowerCase())), [branches, branchSearch]);
  const activeStudents = students.filter((student) => student.status === "Active").length;
  const dateOnly = new Date().toISOString().slice(0, 10);
  const membershipState = (membership: Membership) => membership.endDate < dateOnly ? "Expired" : membership.endDate <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10) ? "Expiring soon" : "Active";
  const currentMembership = (studentId: string) => memberships.filter((item) => item.studentId === studentId).sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
  const paidFor = (membershipId: string) => payments.filter((p) => p.membershipId === membershipId).reduce((sum, p) => sum + p.amount, 0);
  const dueFor = (membership: Membership) => Math.max(0, membership.fee - paidFor(membership.id));
  const currentMonth = dateOnly.slice(0, 7);
  const monthlyCollection = payments.filter((p) => p.date.slice(0, 7) === currentMonth).reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = memberships.reduce((sum, m) => sum + dueFor(m), 0);
  const visibleFeeMemberships = memberships.filter((m) => {
    const student = students.find((s) => s.id === m.studentId);
    const query = feeSearch.trim().toLowerCase();
    const paid = paidFor(m.id); const due = dueFor(m);
    const status = due === 0 ? "Paid" : paid > 0 ? "Partial" : "Unpaid";
    return (!query || (student?.name || "").toLowerCase().includes(query) || m.studentId.toLowerCase().includes(query)) && (feeFilter === "all" || feeFilter === status) && (selectedBranch === "all" || m.branchId === selectedBranch);
  });
  const visibleMemberships = memberships.filter((item) => {
    const student = students.find((s) => s.id === item.studentId);
    const status = membershipState(item);
    const q = membershipSearch.trim().toLowerCase();
    const matchesSearch = !q || (student?.name || "").toLowerCase().includes(q) || item.studentId.toLowerCase().includes(q);
    return matchesSearch && (membershipStatus === "all" || status === membershipStatus) && (selectedBranch === "all" || item.branchId === selectedBranch);
  });
  const visibleStaff = staff.filter((person) => (selectedBranch === "all" || person.branchId === selectedBranch) && (staffRoleFilter === "all" || person.role === staffRoleFilter) && (staffStatusFilter === "all" || person.status === staffStatusFilter) && (!staffSearch.trim() || (person.name + " " + person.id + " " + person.phone + " " + person.email).toLowerCase().includes(staffSearch.trim().toLowerCase())));
  const activeStaffCount = staff.filter((person) => person.status === "Active").length;
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());
  const attendanceStudents = students.filter((student) => student.status === "Active" && (selectedBranch === "all" || student.branchId === selectedBranch) && (!attendanceSearch.trim() || (student.name + " " + student.id + " " + student.phone).toLowerCase().includes(attendanceSearch.trim().toLowerCase())));
  const selectedDayRecords = attendanceRecords.filter((record) => record.date === attendanceDate && (selectedBranch === "all" || record.branchId === selectedBranch));
  const selectedDayByStudent = new Map(selectedDayRecords.map((record) => [record.studentId, record]));
  const attendanceCounts = { Present: selectedDayRecords.filter((record) => record.status === "Present").length, Absent: selectedDayRecords.filter((record) => record.status === "Absent").length, Late: selectedDayRecords.filter((record) => record.status === "Late").length };
  const attendanceHistory = attendanceRecords.filter((record) => (selectedBranch === "all" || record.branchId === selectedBranch) && (!attendanceSearch.trim() || ((students.find((student) => student.id === record.studentId)?.name || "").toLowerCase().includes(attendanceSearch.trim().toLowerCase()) || record.studentId.toLowerCase().includes(attendanceSearch.trim().toLowerCase()))) && (attendanceFilter === "all" || record.status === attendanceFilter)).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 50);
  const reportInRange = (date: string) => date >= reportStart && date <= reportEnd;
  const reportPayments = payments.filter((payment) => reportInRange(payment.date) && (selectedBranch === "all" || payment.branchId === selectedBranch));
  const reportAdmissions = admissions.filter((admission) => reportInRange(admission.admissionDate) && (selectedBranch === "all" || admission.branchId === selectedBranch));
  const reportAttendance = attendanceRecords.filter((record) => reportInRange(record.date) && (selectedBranch === "all" || record.branchId === selectedBranch));
  const reportMemberships = memberships.filter((membership) => selectedBranch === "all" || membership.branchId === selectedBranch);
  const reportStudents = students.filter((student) => selectedBranch === "all" || student.branchId === selectedBranch);
  const reportSeats = seats.filter((seat) => selectedBranch === "all" || seat.branchId === selectedBranch);
  const reportCollection = reportPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const reportOutstanding = reportMemberships.reduce((sum, membership) => sum + dueFor(membership), 0);
  const reportPresent = reportAttendance.filter((record) => record.status === "Present" || record.status === "Late").length;
  const reportAttendanceRate = reportAttendance.length ? Math.round(reportPresent / reportAttendance.length * 100) : 0;
  const reportSeatCapacity = reportSeats.length;
  const reportAllocatedSeats = reportSeats.reduce((sum, seat) => sum + seat.allocations.length, 0);
  const reportPaymentMethods = (["Cash", "UPI", "Bank transfer"] as const).map((method) => ({ method, amount: reportPayments.filter((payment) => payment.method === method).reduce((sum, payment) => sum + payment.amount, 0) }));
  const reportDaily = Array.from(new Set(reportPayments.map((payment) => payment.date))).sort().map((date) => ({ date, amount: reportPayments.filter((payment) => payment.date === date).reduce((sum, payment) => sum + payment.amount, 0) })).slice(-10);
  const reportTopDays = Math.max(1, ...reportDaily.map((item) => item.amount));
  const reportStudentAttendance = reportStudents.map((student) => { const records = reportAttendance.filter((record) => record.studentId === student.id); return { ...student, total: records.length, present: records.filter((record) => record.status !== "Absent").length, rate: records.length ? Math.round(records.filter((record) => record.status !== "Absent").length / records.length * 100) : 0 }; }).filter((student) => student.total > 0).sort((a, b) => b.rate - a.rate);
  function exportReportCsv() {
    const rows = [["Report type", "Date", "Student ID", "Student name", "Branch", "Amount", "Method", "Reference"]];
    reportPayments.forEach((payment) => { const student = students.find((item) => item.id === payment.studentId); rows.push(["Fee payment", payment.date, payment.studentId, student?.name || "", branchName(payment.branchId), String(payment.amount), payment.method, payment.reference || ""]); });
    reportAdmissions.forEach((admission) => rows.push(["Admission", admission.admissionDate, admission.id, admission.name, branchName(admission.branchId), "", "", admission.status]));
    reportAttendance.forEach((record) => { const student = students.find((item) => item.id === record.studentId); rows.push(["Attendance: " + record.status, record.date, record.studentId, student?.name || "", branchName(record.branchId), "", "", ""]); });
    const csv = rows.map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(",")).join("\\r\\n");
    const blob = new Blob(["\\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a"); link.href = url; link.download = "studydesk-report-" + reportStart + "-to-" + reportEnd + ".csv"; link.click(); URL.revokeObjectURL(url);
    setNotice("Report CSV exported.");
  }
  const monthlyAttendance = (studentId: string) => { const rows = attendanceRecords.filter((record) => record.studentId === studentId && record.date.slice(0, 7) === attendanceDate.slice(0, 7)); return rows.length ? Math.round((rows.filter((record) => record.status !== "Absent").length / rows.length) * 100) : 0; };

  function openNewStaff() {
    setEditingStaff(null);
    setStaffForm({ name: "", phone: "", email: "", address: "", branchId: activeBranches[0]?.id || "", role: "Librarian", status: "Active" });
    setShowStaffForm(true);
  }

  function editStaff(person: StaffMember) {
    setEditingStaff(person.id);
    setStaffForm({ name: person.name, phone: person.phone, email: person.email, address: person.address, branchId: person.branchId, role: person.role, status: person.status });
    setShowStaffForm(true);
  }

  function saveStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = staffForm.name.trim();
    const phone = staffForm.phone.trim();
    const email = staffForm.email.trim();
    if (!name || !/^[0-9]{10}$/.test(phone) || !branches.some((item) => item.id === staffForm.branchId)) return;
    if (email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) { setNotice("Enter a valid email address or leave it blank."); return; }
    if (editingStaff) {
      setStaff((current) => current.map((person) => person.id === editingStaff ? { ...person, ...staffForm, name, phone, email, address: staffForm.address.trim() } : person));
      setNotice("Staff profile updated.");
    } else {
      const nextNumber = Math.max(0, ...staff.map((person) => Number(person.id.replace("STF-", "")) || 0)) + 1;
      const id = "STF-" + String(nextNumber).padStart(4, "0");
      setStaff((current) => [{ id, ...staffForm, name, phone, email, address: staffForm.address.trim() }, ...current]);
      setNotice("Staff member added. Generated ID: " + id);
    }
    setShowStaffForm(false);
    setEditingStaff(null);
  }

  function deleteStaff(person: StaffMember) {
    if (!window.confirm("Delete " + person.name + " from the staff directory?")) return;
    setStaff((current) => current.filter((item) => item.id !== person.id));
    setNotice("Staff record deleted.");
  }

  function markAttendanceForAll(status: AttendanceStatus) {
    setAttendanceDraft(Object.fromEntries(attendanceStudents.map((student) => [student.id, status])));
  }

  function saveAttendance() {
    const updates = attendanceStudents.filter((student) => attendanceDraft[student.id] !== undefined).map((student) => ({ id: "ATT-" + student.id + "-" + attendanceDate, studentId: student.id, branchId: student.branchId, date: attendanceDate, status: attendanceDraft[student.id] as AttendanceStatus }));
    if (!updates.length) { setNotice("Choose attendance statuses before saving."); return; }
    setAttendanceRecords((current) => {
      const updatedIds = new Set(updates.map((record) => record.studentId));
      const retained = current.filter((record) => !(record.date === attendanceDate && updatedIds.has(record.studentId)));
      return [...updates, ...retained];
    });
    setAttendanceDraft({});
    setNotice("Attendance saved for " + updates.length + " student(s) on " + attendanceDate + ". Existing entries for the same student and date were updated, not duplicated.");
  }

  function openNewBranch() {
    setEditingBranch(null);
    setBranchForm({ name: "", location: "", capacity: "100" });
    setShowBranchForm(true);
  }

  function saveBranch(event: FormEvent<HTMLFormElement>) {
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

  function openNewAdmission() {
    setAdmissionForm({ name: "", phone: "", branchId: activeBranches[0]?.id || "", plan: "Monthly", admissionDate: new Date().toISOString().slice(0, 10), photo: "" });
    setShowAdmissionForm(true);
  }

  function saveAdmission(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = admissionForm.name.trim();
    const phone = admissionForm.phone.trim();
    if (!name || !/^[0-9]{10}$/.test(phone) || !branches.some((branch) => branch.id === admissionForm.branchId)) return;
    const id = "ADM-" + String(Date.now()).slice(-6);
    setAdmissions((current) => [{ id, ...admissionForm, name, phone, status: "Pending" }, ...current]);
    setShowAdmissionForm(false);
    setNotice("Admission application " + id + " submitted and marked Pending.");
  }

  function approveAdmission(admission: Admission) {
    if (admission.status !== "Pending") return;
    const nextNumber = Math.max(2400, ...students.map((student) => Number(student.id.replace("STU-", "")) || 0)) + 1;
    const studentId = "STU-" + nextNumber;
    setStudents((current) => [{ id: studentId, name: admission.name, phone: admission.phone, branchId: admission.branchId, plan: admission.plan, admissionDate: admission.admissionDate, status: "Active" }, ...current]);
    setAdmissions((current) => current.map((item) => item.id === admission.id ? { ...item, status: "Approved" } : item));
    setNotice(admission.name + " approved. Student ID generated: " + studentId);
  }

  function rejectAdmission(admission: Admission) {
    if (admission.status !== "Pending") return;
    setAdmissions((current) => current.map((item) => item.id === admission.id ? { ...item, status: "Rejected" } : item));
    setNotice("Admission " + admission.id + " marked Rejected.");
  }

  function addSeat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const number = seatNumber.trim();
    if (!number || !branches.some((b) => b.id === seatFormBranch)) return;
    if (seats.some((s) => s.branchId === seatFormBranch && s.number.toLowerCase() === number.toLowerCase())) { setNotice("That seat number already exists in this branch."); return; }
    setSeats((current) => [...current, { id: "SEAT-" + Date.now(), branchId: seatFormBranch, number, mode: seatMode, active: true, allocations: [] }]);
    setSeatNumber(""); setNotice("Seat " + number + " added.");
  }

  function assignSeat(seat: Seat, studentId: string, shift: string) {
    if (!studentId) { setSeats((current) => current.map((s) => s.id === seat.id ? { ...s, allocations: s.allocations.filter((a) => a.shift !== shift) } : s)); setNotice("Seat allocation released."); return; }
    const student = students.find((s) => s.id === studentId);
    if (!student || student.status !== "Active" || student.branchId !== seat.branchId) { setNotice("Choose an active student from this branch."); return; }
    const occupiedElsewhere = seats.some((s) => s.id !== seat.id && s.branchId === seat.branchId && s.allocations.some((a) => a.studentId === studentId && a.shift === shift));
    if (occupiedElsewhere) { setNotice("This student already has a seat for this shift."); return; }
    const conflicting = seat.allocations.some((a) => a.shift === shift && a.studentId !== studentId);
    if (conflicting) { setNotice("That seat and shift are already assigned."); return; }
    setSeats((current) => current.map((s) => s.id === seat.id ? { ...s, allocations: [...s.allocations.filter((a) => a.shift !== shift), { studentId, shift }] } : s));
    setNotice("Seat " + seat.number + " assigned to " + student.name + ".");
  }

  function deleteSeat(seat: Seat) {
    if (seat.allocations.length) { setNotice("Release all seat allocations before deleting this seat."); return; }
    setSeats((current) => current.filter((s) => s.id !== seat.id)); setNotice("Seat removed.");
  }

  function openPaymentForm(membership: Membership) {
    setPaymentForm({ membershipId: membership.id, date: new Date().toISOString().slice(0, 10), amount: String(dueFor(membership)), method: "Cash", reference: "", note: "" });
    setShowPaymentForm(true);
  }

  function savePayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const membership = memberships.find((m) => m.id === paymentForm.membershipId);
    const amount = Number(paymentForm.amount);
    if (!membership || !Number.isFinite(amount) || amount <= 0 || amount > dueFor(membership) || !paymentForm.date) {
      setNotice("Enter a valid payment amount no greater than the outstanding balance."); return;
    }
    const payment: FeePayment = { id: "PAY-" + Date.now(), membershipId: membership.id, studentId: membership.studentId, branchId: membership.branchId, date: paymentForm.date, amount, method: paymentForm.method, reference: paymentForm.reference.trim(), note: paymentForm.note.trim() };
    setPayments((current) => [payment, ...current]);
    setShowPaymentForm(false); setNotice("Payment of ₹" + amount.toLocaleString("en-IN") + " recorded.");
  }

  function printReceipt(payment: FeePayment) {
    const student = students.find((s) => s.id === payment.studentId);
    const membership = memberships.find((m) => m.id === payment.membershipId);
    const plan = membership ? plans.find((p) => p.id === membership.planId) : undefined;
    const win = window.open("", "_blank", "width=720,height=760");
    if (!win) { setNotice("Allow pop-ups to open the printable receipt."); return; }
    const esc = (value: string) => value.replace(/[&<>"\']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "\'": "&#39;" }[c] || c));
    win.document.write("<!doctype html><html><head><title>Receipt " + esc(payment.id) + "</title><style>body{font-family:Arial,sans-serif;color:#172033;padding:40px;max-width:650px;margin:auto}h1{font-size:24px;margin:0 0 6px}p{color:#64748b;font-size:13px}.line{display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px solid #e2e8f0;font-size:14px}.total{font-size:20px;font-weight:bold;margin-top:20px;text-align:right}.muted{color:#64748b}@media print{button{display:none}}</style></head><body><h1>StudyDesk</h1><p>Fee payment receipt · Demo copy</p><div class=line><b>Receipt ID</b><span>" + esc(payment.id) + "</span></div><div class=line><b>Student</b><span>" + esc(student?.name || "Student") + " (" + esc(payment.studentId) + ")</span></div><div class=line><b>Branch</b><span>" + esc(branchName(payment.branchId)) + "</span></div><div class=line><b>Membership</b><span>" + esc(plan?.name || "Membership") + "</span></div><div class=line><b>Payment date</b><span>" + esc(payment.date) + "</span></div><div class=line><b>Payment method</b><span>" + esc(payment.method) + "</span></div><div class=line><b>Reference</b><span>" + esc(payment.reference || "—") + "</span></div><div class=total>Amount received: ₹" + payment.amount.toLocaleString("en-IN") + "</div><p class=muted>Demo receipt only. This is not a tax invoice or proof of a real transaction.</p><button onclick='window.print()'>Print / Save as PDF</button></body></html>");
    win.document.close(); win.focus();
  }

  function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = planForm.name.trim(); const durationDays = Number(planForm.durationDays); const fee = Number(planForm.fee);
    if (!name || !Number.isInteger(durationDays) || durationDays < 1 || !Number.isFinite(fee) || fee < 0) return;
    if (plans.some((p) => p.name.toLowerCase() === name.toLowerCase())) { setNotice("A plan with this name already exists."); return; }
    setPlans((current) => [...current, { id: "PLAN-" + Date.now(), name, durationDays, fee, active: true }]);
    setPlanForm({ name: "", durationDays: "30", fee: "" }); setShowPlanForm(false); setNotice("Membership plan created.");
  }

  function openMembershipForm(studentId = "") {
    const eligible = students.find((s) => s.id === studentId && s.status === "Active") || students.find((s) => s.status === "Active");
    setMembershipForm({ studentId: eligible?.id || "", planId: plans.find((p) => p.active)?.id || "", startDate: new Date().toISOString().slice(0, 10) });
    setShowMembershipForm(true);
  }

  function saveMembership(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const student = students.find((s) => s.id === membershipForm.studentId && s.status === "Active");
    const plan = plans.find((p) => p.id === membershipForm.planId && p.active);
    if (!student || !plan || !membershipForm.startDate) { setNotice("Choose an active student and an active plan."); return; }
    const start = new Date(membershipForm.startDate + "T00:00:00");
    const end = new Date(start); end.setDate(end.getDate() + plan.durationDays - 1);
    const endDate = end.getFullYear() + "-" + String(end.getMonth()+1).padStart(2,"0") + "-" + String(end.getDate()).padStart(2,"0");
    setMemberships((current) => [{ id: "MEM-" + Date.now(), studentId: student.id, planId: plan.id, branchId: student.branchId, startDate: membershipForm.startDate, endDate, fee: plan.fee }, ...current]);
    setShowMembershipForm(false); setNotice(plan.name + " membership assigned to " + student.name + ".");
  }

  function renewMembership(membership: Membership) {
    const plan = plans.find((p) => p.id === membership.planId) || plans.find((p) => p.active);
    if (!plan) { setNotice("Create an active plan before renewing."); return; }
    const base = membership.endDate >= dateOnly ? membership.endDate : dateOnly;
    const start = new Date(base + "T00:00:00"); start.setDate(start.getDate() + 1);
    const end = new Date(start); end.setDate(end.getDate() + plan.durationDays - 1);
    const fmt = (d: Date) => d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
    setMemberships((current) => [{ id: "MEM-" + Date.now(), studentId: membership.studentId, planId: plan.id, branchId: membership.branchId, startDate: fmt(start), endDate: fmt(end), fee: plan.fee }, ...current]);
    setNotice("Membership renewed using " + plan.name + " plan until " + fmt(end) + ".");
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
    if (label === "Admissions") setAdmissionSearch("");
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
          {navGroups.map((group) => <div key={group.label} className="mb-6"><p className="mb-2 px-3 text-[9px] font-bold tracking-[0.16em] text-slate-400">{group.label}</p><div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; const active = activeNav === item.label; return <button key={item.label} onClick={() => navTo(item.label)} className={"group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium transition " + (active ? "bg-[#edf3f8] text-[#244d73]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")}><Icon size={17} /><span className="flex-1">{item.label}</span>{!["Overview", "Branches", "Students", "Admissions", "Seat management", "Memberships", "Attendance", "Fee collection", "Staff", "Reports"].includes(item.label) && <span className="text-[9px] text-slate-300">Soon</span>}</button>; })}</div></div>)}
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

          {activeNav === "Overview" && <Overview branches={branches} students={students} staffCount={staff.length} onNavigate={navTo} branchName={branchName} />}
          {activeNav === "Branches" && <section>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">ORGANIZATION SETUP</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Branches</h2><p className="mt-1.5 text-xs text-slate-500">Create and manage all your study library locations.</p></div><button onClick={openNewBranch} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#193c5e]"><Plus size={15} /> Add branch</button></div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><Metric label="Total branches" value={String(branches.length)} detail="Across your organization" icon={<Building2 size={16} />} /><Metric label="Active branches" value={String(activeBranches.length)} detail="Currently operating" icon={<CheckCircle2 size={16} />} /><Metric label="Total seat capacity" value={branches.reduce((sum, branch) => sum + branch.capacity, 0).toLocaleString("en-IN")} detail="Configured seats" icon={<Armchair size={16} />} /></div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6"><div><h3 className="text-[13px] font-bold text-slate-900">All branches</h3><p className="mt-1 text-[10px] text-slate-400">{branches.length} branch records</p></div><div className="relative w-full sm:max-w-[250px]"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={branchSearch} onChange={(event) => setBranchSearch(event.target.value)} placeholder="Search branch or location..." className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-[10px] outline-none focus:border-[#7894ad]" /></div></div>
              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{visibleBranches.map((branch) => { const count = students.filter((student) => student.branchId === branch.id).length; return <div key={branch.id} className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300"><div className="flex items-start justify-between gap-2"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3f8] text-[#315d84]"><Building2 size={18} /></div><span className={"rounded-full px-2 py-1 text-[9px] font-semibold " + (branch.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{branch.active ? "Active" : "Inactive"}</span></div><h4 className="mt-4 text-[14px] font-bold text-slate-900">{branch.name}</h4><p className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500"><MapPin size={12} />{branch.location}</p><div className="mt-4 grid grid-cols-2 gap-2 border-y border-slate-100 py-3"><div><p className="text-[18px] font-bold text-slate-900">{count}</p><p className="text-[9px] text-slate-400">Students</p></div><div><p className="text-[18px] font-bold text-slate-900">{branch.capacity}</p><p className="text-[9px] text-slate-400">Seat capacity</p></div></div><div className="mt-3 flex items-center justify-between"><p className="text-[9px] text-slate-400">{branch.id}</p><div className="flex gap-1"><button onClick={() => editBranch(branch)} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[9px] font-semibold text-slate-600 hover:bg-slate-50"><Pencil size={11} /> Edit</button><button onClick={() => deleteBranch(branch)} className="rounded-md border border-rose-100 p-1.5 text-rose-500 hover:bg-rose-50" aria-label={"Delete " + branch.name}><Trash2 size={12} /></button></div></div></div>; })}</div>
              {visibleBranches.length === 0 && <EmptyState title="No branches found" detail="Try another search or add a new branch." />}
            </div>
          </section>}

          {activeNav === "Admissions" && <section>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">ENROLMENT WORKFLOW</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Admissions</h2><p className="mt-1.5 text-xs text-slate-500">Review applications and approve students into your library.</p></div><button onClick={openNewAdmission} disabled={activeBranches.length === 0} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#193c5e] disabled:opacity-50"><Plus size={15} /> New admission</button></div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><Metric label="Total applications" value={String(admissions.length)} detail="All admission records" icon={<GraduationCap size={16} />} /><Metric label="Pending review" value={String(admissions.filter((a) => a.status === "Pending").length)} detail="Awaiting a decision" icon={<AlertCircle size={16} />} /><Metric label="Approved" value={String(admissions.filter((a) => a.status === "Approved").length)} detail="Converted to students" icon={<CheckCircle2 size={16} />} /></div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h3 className="text-[13px] font-bold text-slate-900">Admission applications</h3><p className="mt-1 text-[10px] text-slate-400">Applications are separate until approved.</p></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_190px]"><div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={admissionSearch} onChange={(event) => setAdmissionSearch(event.target.value)} placeholder="Search applicant, ID or phone..." className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-[10px] outline-none focus:border-[#7894ad]" /></div><select value={admissionFilter} onChange={(event) => setAdmissionFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[10px] text-slate-600 outline-none"><option value="all">All statuses</option><option>Pending</option><option>Approved</option><option>Rejected</option></select></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Applicant</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Applied on</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Review</th></tr></thead><tbody>{admissions.filter((a) => (admissionFilter === "all" || a.status === admissionFilter) && (a.name + " " + a.id + " " + a.phone).toLowerCase().includes(admissionSearch.toLowerCase())).map((a) => <tr key={a.id} className="border-t border-slate-100"><td className="px-5 py-3"><div className="flex items-center gap-2.5">{a.photo ? <img src={a.photo} alt="" className="h-9 w-9 rounded-full object-cover" /> : <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#edf3f8] text-[10px] font-bold text-[#315d84]">{a.name.split(" ").map((p) => p[0]).slice(0,2).join("").toUpperCase()}</div>}<div><p className="text-[10px] font-semibold text-slate-800">{a.name}</p><p className="text-[9px] text-slate-400">{a.id}</p></div></div></td><td className="px-4 py-3 text-[10px] text-slate-500">{a.phone}</td><td className="px-4 py-3 text-[10px] text-slate-500">{branchName(a.branchId)}</td><td className="px-4 py-3 text-[10px] text-slate-500">{a.plan}</td><td className="px-4 py-3 text-[10px] text-slate-500">{a.admissionDate}</td><td className="px-4 py-3"><span className={"rounded-full px-2 py-1 text-[9px] font-semibold " + (a.status === "Approved" ? "bg-emerald-50 text-emerald-700" : a.status === "Rejected" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700")}>{a.status}</span></td><td className="px-4 py-3">{a.status === "Pending" ? <div className="flex gap-1"><button onClick={() => approveAdmission(a)} className="rounded-md bg-[#244d73] px-2.5 py-1.5 text-[9px] font-semibold text-white">Approve</button><button onClick={() => rejectAdmission(a)} className="rounded-md border border-rose-200 px-2.5 py-1.5 text-[9px] font-semibold text-rose-600">Reject</button></div> : <span className="text-[9px] text-slate-400">{a.status === "Approved" ? "Student created" : "Closed"}</span>}</td></tr>)}{admissions.length === 0 && <tr><td colSpan={7} className="px-6 py-14 text-center"><p className="text-[12px] font-semibold text-slate-700">No applications yet</p><p className="mt-1 text-[10px] text-slate-400">Create a sample admission to try the review workflow.</p></td></tr>}</tbody></table></div>
            </div>
          </section>}

          {activeNav === "Seat management" && <section>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">LIBRARY OPERATIONS</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Seat management</h2><p className="mt-1.5 text-xs text-slate-500">Create seats and allocate them to active students, by fixed seat or shift.</p></div></div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><Metric label="Total seats" value={String(seats.filter((s) => s.active).length)} detail="Across all branches" icon={<Armchair size={16} />} /><Metric label="Occupied allocations" value={String(seats.reduce((n,s) => n + s.allocations.length,0))} detail="Assigned seat shifts" icon={<Users size={16} />} /><Metric label="Available seats" value={String(seats.filter((s) => s.active && !s.allocations.length).length)} detail="No active allocation" icon={<CheckCircle2 size={16} />} /></div>
            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-[13px] font-bold text-slate-900">Add seats</h3><form onSubmit={addSeat} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end"><div><label className={labelClass}>Branch</label><select value={seatFormBranch} onChange={(e) => setSeatFormBranch(e.target.value)} className={inputClass}>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div><div><label className={labelClass}>Seat number / label</label><input required value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} placeholder="e.g. A-01" className={inputClass} /></div><div><label className={labelClass}>Allocation type</label><select value={seatMode} onChange={(e) => setSeatMode(e.target.value as "Fixed" | "Shift-based")} className={inputClass}><option>Fixed</option><option>Shift-based</option></select></div><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-white"><Plus size={14} className="mr-1 inline" />Add seat</button></form><p className="mt-3 text-[10px] text-slate-400">Fixed seats have one full-day allocation. Shift-based seats can have separate morning, evening and night students.</p></div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-[13px] font-bold text-slate-900">Seat directory</h3><p className="mt-1 text-[10px] text-slate-400">{seats.length} configured seats</p></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-2"><input value={seatSearch} onChange={(e) => setSeatSearch(e.target.value)} placeholder="Search seat..." className={inputClass} /><select value={seatBranch} onChange={(e) => setSeatBranch(e.target.value)} className={inputClass}><option value="all">All branches</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div></div>
              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{seats.filter((s) => (seatBranch === "all" || s.branchId === seatBranch) && (s.number + " " + branchName(s.branchId)).toLowerCase().includes(seatSearch.toLowerCase())).map((seat) => { const shifts = seat.mode === "Fixed" ? ["Full day"] : ["Morning", "Evening", "Night"]; return <div key={seat.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-start justify-between"><div><p className="text-[15px] font-bold text-slate-900">{seat.number}</p><p className="mt-1 text-[10px] text-slate-400">{branchName(seat.branchId)} · {seat.mode}</p></div><span className={"rounded-full px-2 py-1 text-[9px] font-semibold " + (seat.allocations.length ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}>{seat.allocations.length ? "Allocated" : "Available"}</span></div><div className="mt-4 space-y-3">{shifts.map((shift) => { const allocation = seat.allocations.find((a) => a.shift === shift); return <div key={shift}><label className={labelClass}>{shift}</label><select value={allocation?.studentId || ""} onChange={(e) => assignSeat(seat,e.target.value,shift)} className={inputClass}><option value="">Available — assign student</option>{students.filter((s) => s.status === "Active" && s.branchId === seat.branchId).map((s) => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}</select></div>; })}</div><div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-[9px] text-slate-400">{seat.allocations.length} allocation(s)</span><button onClick={() => deleteSeat(seat)} className="rounded-md border border-rose-100 px-2.5 py-1.5 text-[9px] font-semibold text-rose-600 hover:bg-rose-50">Remove seat</button></div></div>; })}{seats.length === 0 && <div className="col-span-full px-6 py-12 text-center"><p className="text-[12px] font-semibold text-slate-700">No seats configured</p><p className="mt-1 text-[10px] text-slate-400">Add your first seat above to start allocating students.</p></div>}</div>
            </div>
          </section>}

          {activeNav === "Students" && <section>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">STUDENT DIRECTORY</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Students</h2><p className="mt-1.5 text-xs text-slate-500">Manage student profiles and view records branch-wise.</p></div><button onClick={openNewStudent} disabled={activeBranches.length === 0} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#193c5e] disabled:cursor-not-allowed disabled:opacity-50"><Plus size={15} /> Add student</button></div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><Metric label="Total students" value={String(students.length)} detail="All registered records" icon={<Users size={16} />} /><Metric label="Active students" value={String(activeStudents)} detail="Currently active" icon={<CheckCircle2 size={16} />} /><Metric label="Branches" value={String(branches.length)} detail="Available locations" icon={<Building2 size={16} />} /></div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-[13px] font-bold text-slate-900">Student records</h3><p className="mt-1 text-[10px] text-slate-400">Showing {visibleStudents.length} matching students</p></div><span className="rounded-full bg-[#edf3f8] px-2.5 py-1 text-[9px] font-semibold text-[#315d84]">{selectedBranch === "all" ? "All branches" : branchName(selectedBranch)}</span></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_220px]"><div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={studentSearch} onChange={(event) => setStudentSearch(event.target.value)} placeholder="Search name, student ID or phone..." className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-[10px] outline-none focus:border-[#7894ad]" /></div><select value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[10px] text-slate-600 outline-none focus:border-[#7894ad]"><option value="all">All branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3 sm:px-6">Student</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Admission date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{visibleStudents.map((student) => <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50/60"><td className="px-5 py-3 sm:px-6"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf3f8] text-[9px] font-bold text-[#315d84]">{student.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><div><p className="text-[10px] font-semibold text-slate-800">{student.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{student.id}</p></div></div></td><td className="px-4 py-3 text-[10px] text-slate-500">{student.phone}</td><td className="px-4 py-3 text-[10px] text-slate-500">{branchName(student.branchId)}</td><td className="px-4 py-3"><span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-600">{student.plan}</span></td><td className="px-4 py-3 text-[10px] text-slate-500">{student.admissionDate}</td><td className="px-4 py-3"><span className={"rounded-full px-2 py-1 text-[9px] font-semibold " + (student.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{student.status}</span></td><td className="px-4 py-3"><div className="flex gap-1"><button onClick={() => editStudent(student)} className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50" aria-label={"Edit " + student.name}><Pencil size={12} /></button><button onClick={() => deleteStudent(student)} className="rounded-md border border-rose-100 p-1.5 text-rose-500 hover:bg-rose-50" aria-label={"Delete " + student.name}><Trash2 size={12} /></button></div></td></tr>)}{visibleStudents.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-[11px] text-slate-400">No student records match your filters.</td></tr>}</tbody></table></div>
            </div>
          </section>}

          {activeNav === "Reports" && <section>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">BUSINESS INTELLIGENCE</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Reports & analytics</h2><p className="mt-1.5 text-xs text-slate-500">Review collections, admissions, attendance and seat utilization from recorded demo data.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => window.print()} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-semibold text-slate-600">Print / Save PDF</button><button onClick={exportReportCsv} className="inline-flex items-center gap-2 rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white"><ChartNoAxesCombined size={14}/> Export CSV</button></div></div>
            <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end"><div className="flex-1"><label className={labelClass}>From date</label><input type="date" value={reportStart} max={reportEnd} onChange={(event)=>setReportStart(event.target.value)} className={inputClass}/></div><div className="flex-1"><label className={labelClass}>To date</label><input type="date" value={reportEnd} min={reportStart} onChange={(event)=>setReportEnd(event.target.value)} className={inputClass}/></div><button onClick={()=>{const todayValue=new Date().toISOString().slice(0,10);setReportStart(todayValue.slice(0,8)+"01");setReportEnd(todayValue);}} className="h-9 rounded-lg border border-slate-200 px-4 text-[10px] font-semibold text-slate-600">This month</button><span className="pb-2 text-[10px] text-slate-400">{selectedBranch==="all"?"All branches":branchName(selectedBranch)}</span></div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Fee collected" value={"₹"+reportCollection.toLocaleString("en-IN")} detail="Payments in selected period" icon={<Wallet size={16}/>} /><Metric label="Outstanding fees" value={"₹"+reportOutstanding.toLocaleString("en-IN")} detail="Current unpaid membership balance" icon={<AlertCircle size={16}/>} /><Metric label="Students" value={String(reportStudents.length)} detail={reportStudents.filter((student)=>student.status==="Active").length+" active"} icon={<Users size={16}/>} /><Metric label="Attendance rate" value={reportAttendance.length?reportAttendanceRate+"%":"—"} detail={reportAttendance.length+" attendance entries"} icon={<ClipboardCheck size={16}/>} /></div>
            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4"><h3 className="text-[13px] font-bold text-slate-900">Collection trend</h3><p className="mt-1 text-[10px] text-slate-400">Daily recorded payments · last 10 dates with activity</p></div>{reportDaily.length?<div className="space-y-3">{reportDaily.map((item)=><div key={item.date} className="grid grid-cols-[76px_1fr_80px] items-center gap-3"><span className="text-[9px] text-slate-500">{item.date}</span><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#47749b]" style={{width:(item.amount/reportTopDays*100)+"%"}}/></div><span className="text-right text-[10px] font-semibold text-slate-700">₹{item.amount.toLocaleString("en-IN")}</span></div>)}</div>:<EmptyState title="No collection data" detail="Record fee payments in the selected date range to see the trend."/>}</div>
              <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4"><h3 className="text-[13px] font-bold text-slate-900">Payment methods</h3><p className="mt-1 text-[10px] text-slate-400">Breakdown by recorded payment mode</p></div><div className="space-y-4">{reportPaymentMethods.map((item)=><div key={item.method}><div className="mb-1.5 flex items-center justify-between"><span className="text-[10px] font-medium text-slate-600">{item.method}</span><span className="text-[10px] font-semibold text-slate-800">₹{item.amount.toLocaleString("en-IN")}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#47749b]" style={{width:(reportCollection?item.amount/reportCollection*100:0)+"%"}}/></div></div>)}</div><p className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-400">Total in selected period: ₹{reportCollection.toLocaleString("en-IN")}</p></div>
            </div>
            <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-[13px] font-bold text-slate-900">Admission summary</h3><p className="mt-1 text-[10px] text-slate-400">Applications created in selected period</p><div className="mt-5 grid grid-cols-3 gap-2">{(["Pending","Approved","Rejected"] as const).map((status)=>{const count=reportAdmissions.filter((item)=>item.status===status).length;return <div key={status} className="rounded-lg bg-slate-50 p-3"><p className="text-[20px] font-bold text-slate-900">{count}</p><p className="mt-1 text-[9px] text-slate-500">{status}</p></div>;})}</div><p className="mt-3 text-[10px] text-slate-500">Total applications: <strong>{reportAdmissions.length}</strong></p></div>
              <div className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-[13px] font-bold text-slate-900">Seat utilization</h3><p className="mt-1 text-[10px] text-slate-400">Current configured seat allocations</p><div className="mt-5 flex items-end justify-between"><p className="text-[28px] font-bold text-slate-900">{reportSeatCapacity?Math.round(reportAllocatedSeats/reportSeatCapacity*100):0}%</p><p className="text-[10px] text-slate-500">{reportAllocatedSeats} allocations / {reportSeatCapacity} seats</p></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#47749b]" style={{width:(reportSeatCapacity?Math.min(100,reportAllocatedSeats/reportSeatCapacity*100):0)+"%"}}/></div><p className="mt-3 text-[10px] text-slate-400">Seat utilization is a current snapshot, not limited by the date filter.</p></div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h3 className="text-[13px] font-bold text-slate-900">Student attendance report</h3><p className="mt-1 text-[10px] text-slate-400">Individual attendance for the selected date range</p></div><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Student</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Present / Late</th><th className="px-4 py-3">Total records</th><th className="px-5 py-3">Attendance</th></tr></thead><tbody>{reportStudentAttendance.map((student)=><tr key={student.id} className="border-t border-slate-100"><td className="px-5 py-3"><p className="text-[10px] font-semibold text-slate-800">{student.name}</p><p className="text-[9px] text-slate-400">{student.id}</p></td><td className="px-4 py-3 text-[10px] text-slate-500">{branchName(student.branchId)}</td><td className="px-4 py-3 text-[10px] text-slate-600">{student.present}</td><td className="px-4 py-3 text-[10px] text-slate-600">{student.total}</td><td className="px-5 py-3 text-[10px] font-semibold text-slate-700">{student.rate}%</td></tr>)}{reportStudentAttendance.length===0&&<tr><td colSpan={5} className="px-5 py-12 text-center text-[11px] text-slate-400">No attendance records in this date range.</td></tr>}</tbody></table></div></div>
            <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-[10px] leading-4 text-amber-800">Demo analytics: reports use records saved in this browser only. Fee totals reflect manual entries, not verified transactions. Outstanding balances are current membership balances; seat utilization is a current snapshot. CSV includes payment, admission and attendance rows for the selected period.</p>
          </section>}

          {activeNav === "Staff" && <section>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">TEAM DIRECTORY</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Staff management</h2><p className="mt-1.5 text-xs text-slate-500">Manage staff profiles, roles, branch assignments and employment status.</p></div><button onClick={openNewStaff} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-white"><Plus size={14}/> Add staff member</button></div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3"><Metric label="Total staff" value={String(staff.length)} detail="All staff records" icon={<Users size={16}/>} /><Metric label="Active staff" value={String(activeStaffCount)} detail="Currently active" icon={<CheckCircle2 size={16}/>} /><Metric label="Inactive staff" value={String(staff.length-activeStaffCount)} detail="Not currently active" icon={<UserRound size={16}/>} /></div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5"><div className="relative flex-1"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={staffSearch} onChange={(event)=>setStaffSearch(event.target.value)} placeholder="Search name, staff ID, phone or email..." className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-[10px] outline-none focus:border-[#7894ad]"/></div><select value={staffRoleFilter} onChange={(event)=>setStaffRoleFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[10px] text-slate-600"><option value="all">All roles</option><option>Manager</option><option>Receptionist</option><option>Librarian</option><option>Other</option></select><select value={staffStatusFilter} onChange={(event)=>setStaffStatusFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[10px] text-slate-600"><option value="all">All statuses</option><option>Active</option><option>Inactive</option></select></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Staff member</th><th className="px-4 py-3">Contact</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody>{visibleStaff.map((person)=><tr key={person.id} className="border-t border-slate-100 hover:bg-slate-50/60"><td className="px-5 py-3"><p className="text-[10px] font-semibold text-slate-800">{person.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{person.id}</p></td><td className="px-4 py-3"><p className="text-[10px] text-slate-700">{person.phone}</p><p className="mt-0.5 text-[9px] text-slate-400">{person.email || "No email"}</p></td><td className="px-4 py-3 text-[10px] text-slate-600">{person.role}</td><td className="px-4 py-3 text-[10px] text-slate-600">{branchName(person.branchId)}</td><td className="px-4 py-3"><span className={"rounded-full px-2 py-1 text-[9px] font-semibold "+(person.status==="Active"?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500")}>{person.status}</span></td><td className="px-5 py-3"><div className="flex justify-end gap-1"><button onClick={()=>editStaff(person)} className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-[#315d84]" aria-label={"Edit "+person.name}><Pencil size={14}/></button><button onClick={()=>deleteStaff(person)} className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={"Delete "+person.name}><Trash2 size={14}/></button></div></td></tr>)}{visibleStaff.length===0&&<tr><td colSpan={6} className="px-6 py-14 text-center text-[11px] text-slate-400">{staff.length===0?"No staff members added yet. Add your first staff profile.":"No staff members match these filters."}</td></tr>}</tbody></table></div>
            </div>
            <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-[10px] leading-4 text-amber-800">Demo only: staff details are stored in this browser. This module does not create login accounts, permissions, payroll or attendance tracking.</p>
          </section>}

          {activeNav === "Attendance" && <section>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">DAILY LIBRARY OPERATIONS</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Attendance management</h2><p className="mt-1.5 text-xs text-slate-500">Mark daily attendance, review student history and monitor monthly attendance rates.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => markAttendanceForAll("Present")} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-semibold text-emerald-700">Mark all present</button><button onClick={() => markAttendanceForAll("Absent")} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-[10px] font-semibold text-rose-600">Mark all absent</button></div></div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Present today" value={String(attendanceCounts.Present)} detail={"For " + attendanceDate} icon={<CheckCircle2 size={16} />} /><Metric label="Absent today" value={String(attendanceCounts.Absent)} detail="Recorded absences" icon={<AlertCircle size={16} />} /><Metric label="Late today" value={String(attendanceCounts.Late)} detail="Recorded late arrivals" icon={<Clock3 size={16} />} /><Metric label="Marked today" value={String(selectedDayRecords.length)} detail={"Of " + attendanceStudents.length + " visible active students"} icon={<ClipboardCheck size={16} />} /></div>
            <div className="mb-5 rounded-xl border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-[13px] font-bold text-slate-900">Daily attendance register</h3><p className="mt-1 text-[10px] text-slate-400">Choose a date, set each student status and save. Saving again updates the existing date entry.</p></div><input aria-label="Attendance date" type="date" value={attendanceDate} onChange={(event) => { setAttendanceDate(event.target.value); setAttendanceDraft({}); }} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[10px] text-slate-600" /></div><div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={attendanceSearch} onChange={(event) => setAttendanceSearch(event.target.value)} placeholder="Search student name, ID or phone..." className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-[10px] outline-none focus:border-[#7894ad]" /></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3 sm:px-6">Student</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Saved status</th><th className="px-4 py-3">Set status</th><th className="px-4 py-3">Monthly attendance</th></tr></thead><tbody>{attendanceStudents.map((student) => { const saved = selectedDayByStudent.get(student.id); const chosen = attendanceDraft[student.id] !== undefined ? attendanceDraft[student.id] : (saved?.status || ""); return <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50/60"><td className="px-5 py-3 sm:px-6"><p className="text-[10px] font-semibold text-slate-800">{student.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{student.id}</p></td><td className="px-4 py-3 text-[10px] text-slate-500">{branchName(student.branchId)}</td><td className="px-4 py-3 text-[10px] text-slate-500">{saved?.status || "Not marked"}</td><td className="px-4 py-3"><select aria-label={"Attendance status for " + student.name} value={chosen} onChange={(event) => setAttendanceDraft((current) => ({ ...current, [student.id]: event.target.value as AttendanceStatus | "" }))} className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[10px] text-slate-700"><option value="">Not marked</option><option value="Present">Present</option><option value="Absent">Absent</option><option value="Late">Late</option></select></td><td className="px-4 py-3 text-[10px] font-semibold text-slate-600">{monthlyAttendance(student.id)}%</td></tr>; })}{attendanceStudents.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-[11px] text-slate-400">No active students match this branch and search.</td></tr>}</tbody></table></div>
              <div className="flex flex-col justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6"><p className="text-[10px] text-slate-400">Blank statuses are left unchanged. Duplicate student/date entries are prevented.</p><button onClick={saveAttendance} disabled={!attendanceStudents.some((student) => attendanceDraft[student.id] !== undefined && attendanceDraft[student.id] !== "")} className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white disabled:opacity-40">Save attendance</button></div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h3 className="text-[13px] font-bold text-slate-900">Attendance history</h3><p className="mt-1 text-[10px] text-slate-400">Latest 50 records for the selected branch and search.</p></div><select value={attendanceFilter} onChange={(event) => setAttendanceFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[10px] text-slate-600"><option value="all">All statuses</option><option>Present</option><option>Absent</option><option>Late</option></select></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3 sm:px-6">Date</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{attendanceHistory.map((record) => { const student = students.find((item) => item.id === record.studentId); return <tr key={record.id} className="border-t border-slate-100"><td className="px-5 py-3 text-[10px] text-slate-500 sm:px-6">{record.date}</td><td className="px-4 py-3 text-[10px] font-semibold text-slate-700">{student?.name || record.studentId}<span className="ml-1 text-[9px] font-normal text-slate-400">{record.studentId}</span></td><td className="px-4 py-3 text-[10px] text-slate-500">{branchName(record.branchId)}</td><td className="px-4 py-3"><span className={"rounded-full px-2 py-1 text-[9px] font-semibold " + (record.status === "Present" ? "bg-emerald-50 text-emerald-700" : record.status === "Late" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-600")}>{record.status}</span></td></tr>; })}{attendanceHistory.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-[11px] text-slate-400">No attendance history found.</td></tr>}</tbody></table></div></div>
            <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-[10px] leading-4 text-amber-800">Demo only: attendance is manually recorded and stored in this browser. No QR, biometric device or real-time check-in is connected. Use fictional student records.</p>
          </section>}

          {activeNav === "Fee collection" && <section>
            <div className="mb-7"><p className="mb-1 text-[11px] font-medium text-slate-400">PAYMENT OPERATIONS</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Fee collection</h2><p className="mt-1.5 text-xs text-slate-500">Record cash, UPI and bank-transfer payments against student memberships.</p></div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Collected this month" value={"₹" + monthlyCollection.toLocaleString("en-IN")} detail="Based on payment date" icon={<Wallet size={16} />} /><Metric label="Total collected" value={"₹" + payments.reduce((sum,p)=>sum+p.amount,0).toLocaleString("en-IN")} detail="All recorded payments" icon={<CheckCircle2 size={16} />} /><Metric label="Outstanding dues" value={"₹" + totalOutstanding.toLocaleString("en-IN")} detail="Across all memberships" icon={<AlertCircle size={16} />} /><Metric label="Payment entries" value={String(payments.length)} detail="Recorded transactions" icon={<ClipboardCheck size={16} />} /></div>
            <div className="mb-5 rounded-xl border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div><h3 className="text-[13px] font-bold text-slate-900">Membership fee ledger</h3><p className="mt-1 text-[10px] text-slate-400">Each balance is calculated from the membership fee minus payments recorded against it.</p></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_190px]"><div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={feeSearch} onChange={(e)=>setFeeSearch(e.target.value)} placeholder="Search student name or ID..." className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-[10px] outline-none focus:border-[#7894ad]" /></div><select value={feeFilter} onChange={(e)=>setFeeFilter(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[10px] text-slate-600"><option value="all">All payment statuses</option><option value="Paid">Paid</option><option value="Partial">Partially paid</option><option value="Unpaid">Unpaid</option></select></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3 sm:px-6">Student</th><th className="px-4 py-3">Membership</th><th className="px-4 py-3">Fee</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Due</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{visibleFeeMemberships.map((m)=>{const student=students.find(s=>s.id===m.studentId);const paid=paidFor(m.id);const due=dueFor(m);const status=due===0?"Paid":paid>0?"Partial":"Unpaid";return <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50/60"><td className="px-5 py-3 sm:px-6"><p className="text-[10px] font-semibold text-slate-800">{student?.name||"Student removed"}</p><p className="mt-0.5 text-[9px] text-slate-400">{m.studentId} · {branchName(m.branchId)}</p></td><td className="px-4 py-3 text-[10px] text-slate-500">{m.startDate} – {m.endDate}</td><td className="px-4 py-3 text-[10px] text-slate-600">₹{m.fee.toLocaleString("en-IN")}</td><td className="px-4 py-3 text-[10px] font-semibold text-emerald-700">₹{paid.toLocaleString("en-IN")}</td><td className="px-4 py-3 text-[10px] font-semibold text-slate-700">₹{due.toLocaleString("en-IN")}</td><td className="px-4 py-3"><span className={"rounded-full px-2 py-1 text-[9px] font-semibold "+(status==="Paid"?"bg-emerald-50 text-emerald-700":status==="Partial"?"bg-amber-50 text-amber-700":"bg-rose-50 text-rose-600")}>{status}</span></td><td className="px-4 py-3">{due>0?<button onClick={()=>openPaymentForm(m)} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[9px] font-semibold text-[#315d84] hover:bg-slate-50">Record payment</button>:<span className="text-[9px] text-slate-400">Settled</span>}</td></tr>;})}{visibleFeeMemberships.length===0&&<tr><td colSpan={7} className="px-6 py-12 text-center text-[11px] text-slate-400">No membership fee records found. Assign a membership first.</td></tr>}</tbody></table></div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4 sm:px-6"><h3 className="text-[13px] font-bold text-slate-900">Payment history</h3><p className="mt-1 text-[10px] text-slate-400">Latest recorded payments and printable receipts.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3 sm:px-6">Receipt ID</th><th className="px-4 py-3">Student</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Method</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Receipt</th></tr></thead><tbody>{payments.map((p)=>{const student=students.find(s=>s.id===p.studentId);return <tr key={p.id} className="border-t border-slate-100"><td className="px-5 py-3 text-[10px] font-semibold text-slate-700 sm:px-6">{p.id}</td><td className="px-4 py-3 text-[10px] text-slate-600">{student?.name||p.studentId}</td><td className="px-4 py-3 text-[10px] text-slate-500">{p.date}</td><td className="px-4 py-3 text-[10px] text-slate-500">{p.method}</td><td className="px-4 py-3 text-[10px] text-slate-500">{p.reference||"—"}</td><td className="px-4 py-3 text-[10px] font-semibold text-slate-700">₹{p.amount.toLocaleString("en-IN")}</td><td className="px-4 py-3"><button onClick={()=>printReceipt(p)} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[9px] font-semibold text-[#315d84] hover:bg-slate-50">Print receipt</button></td></tr>;})}{payments.length===0&&<tr><td colSpan={7} className="px-6 py-10 text-center text-[11px] text-slate-400">No payments recorded yet.</td></tr>}</tbody></table></div></div>
            <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-[10px] leading-4 text-amber-800">Demo only: no money is collected or verified. Payment entries are manual records stored in this browser. Receipts are demo copies, not tax invoices. Data is not synced across devices.</p>
          </section>}

          {activeNav === "Memberships" && <section>
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">MEMBERSHIP OPERATIONS</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Memberships</h2><p className="mt-1.5 text-xs text-slate-500">Set plan pricing, assign memberships and track expiry dates.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => { setPlanForm({ name: "", durationDays: "30", fee: "" }); setShowPlanForm(true); }} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-semibold text-slate-600">Manage plans</button><button onClick={() => openMembershipForm()} disabled={!students.some((s) => s.status === "Active") || !plans.some((p) => p.active)} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#193c5e] disabled:opacity-50"><Plus size={14} /> Assign membership</button></div></div>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Membership records" value={String(memberships.length)} detail="All assignments and renewals" icon={<ShieldCheck size={16} />} /><Metric label="Active" value={String(memberships.filter((m) => membershipState(m) === "Active").length)} detail="More than 7 days remaining" icon={<CheckCircle2 size={16} />} /><Metric label="Expiring soon" value={String(memberships.filter((m) => membershipState(m) === "Expiring soon").length)} detail="Expires within 7 days" icon={<AlertCircle size={16} />} /><Metric label="Expired" value={String(memberships.filter((m) => membershipState(m) === "Expired").length)} detail="Renewal required" icon={<CalendarDays size={16} />} /></div>
            <div className="mb-5 rounded-xl border border-slate-200 bg-white p-5"><div className="mb-3 flex items-center justify-between"><div><h3 className="text-[13px] font-bold text-slate-900">Membership plans</h3><p className="mt-1 text-[10px] text-slate-400">Editable demo pricing · duration is in calendar days</p></div><span className="text-[10px] text-slate-400">{plans.filter((p) => p.active).length} active plans</span></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{plans.map((plan) => <div key={plan.id} className="rounded-lg border border-slate-100 bg-slate-50/70 p-4"><div className="flex items-start justify-between gap-2"><p className="text-[11px] font-semibold text-slate-800">{plan.name}</p><span className={"rounded-full px-2 py-1 text-[9px] font-semibold " + (plan.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-500")}>{plan.active ? "Active" : "Inactive"}</span></div><p className="mt-3 text-[21px] font-bold text-slate-900">₹{plan.fee.toLocaleString("en-IN")}</p><p className="mt-1 text-[10px] text-slate-400">{plan.durationDays} days</p><button onClick={() => setPlans((current) => current.map((p) => p.id === plan.id ? { ...p, active: !p.active } : p))} className="mt-3 text-[10px] font-semibold text-[#315d84] hover:underline">{plan.active ? "Deactivate plan" : "Activate plan"}</button></div>)}</div></div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:px-6"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-[13px] font-bold text-slate-900">Student memberships</h3><p className="mt-1 text-[10px] text-slate-400">Showing {visibleMemberships.length} matching records · renewal creates a new record</p></div><span className="rounded-full bg-[#edf3f8] px-2.5 py-1 text-[9px] font-semibold text-[#315d84]">{selectedBranch === "all" ? "All branches" : branchName(selectedBranch)}</span></div><div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_190px]"><div className="relative"><Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input value={membershipSearch} onChange={(e) => setMembershipSearch(e.target.value)} placeholder="Search student name or ID..." className="h-9 w-full rounded-lg border border-slate-200 pl-8 pr-3 text-[10px] outline-none focus:border-[#7894ad]" /></div><select value={membershipStatus} onChange={(e) => setMembershipStatus(e.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[10px] text-slate-600"><option value="all">All statuses</option><option>Active</option><option>Expiring soon</option><option>Expired</option></select></div></div>
              <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3 sm:px-6">Student</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Start date</th><th className="px-4 py-3">Expiry date</th><th className="px-4 py-3">Fee</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{visibleMemberships.map((m) => { const student = students.find((s) => s.id === m.studentId); const plan = plans.find((p) => p.id === m.planId); const status = membershipState(m); return <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50/60"><td className="px-5 py-3 sm:px-6"><p className="text-[10px] font-semibold text-slate-800">{student?.name || "Student removed"}</p><p className="mt-0.5 text-[9px] text-slate-400">{m.studentId}</p></td><td className="px-4 py-3 text-[10px] text-slate-500">{branchName(m.branchId)}</td><td className="px-4 py-3 text-[10px] text-slate-600">{plan?.name || "Previous plan"}</td><td className="px-4 py-3 text-[10px] text-slate-500">{m.startDate}</td><td className="px-4 py-3 text-[10px] text-slate-500">{m.endDate}</td><td className="px-4 py-3 text-[10px] text-slate-600">₹{m.fee.toLocaleString("en-IN")}</td><td className="px-4 py-3"><span className={"rounded-full px-2 py-1 text-[9px] font-semibold " + (status === "Active" ? "bg-emerald-50 text-emerald-700" : status === "Expiring soon" ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-600")}>{status}</span></td><td className="px-4 py-3"><button onClick={() => renewMembership(m)} className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[9px] font-semibold text-[#315d84] hover:bg-slate-50">Renew</button></td></tr>; })}{visibleMemberships.length === 0 && <tr><td colSpan={8} className="px-6 py-12 text-center text-[11px] text-slate-400">No membership records match your filters. Assign a membership to an active student to begin.</td></tr>}</tbody></table></div>
            </div><p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-[10px] leading-4 text-amber-800">Demo only: plan fees and membership dates are sample records. Renewal is recorded here; fee collection and payment tracking will be a separate module. Data stays in this browser.</p>
          </section>}

          {!["Overview", "Branches", "Students", "Admissions", "Seat management", "Memberships", "Attendance", "Fee collection", "Staff", "Reports"].includes(activeNav) && <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf3f8] text-[#315d84]"><Sparkles size={20} /></div><h2 className="mt-4 text-[17px] font-bold text-slate-900">{activeNav} module is next</h2><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">This item is visible in the demo navigation, but its workflow has not been built yet. Branch and student management are available now.</p><button onClick={() => navTo("Overview")} className="mt-5 rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Back to overview</button></div>}

          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[9px] text-slate-400 sm:flex-row"><p>© 2026 StudyDesk · Library Management Demo</p><p>Demo data only · Stored locally in this browser</p></footer>
        </main>
      </div>

      {showStaffForm && <Modal title={editingStaff ? "Edit staff profile" : "Add staff member"} onClose={() => setShowStaffForm(false)}><form onSubmit={saveStaff} className="space-y-3"><div><label className={labelClass}>Full name *</label><input required value={staffForm.name} onChange={(event)=>setStaffForm({...staffForm,name:event.target.value})} placeholder="Enter staff full name" className={inputClass}/></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Mobile number *</label><input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={staffForm.phone} onChange={(event)=>setStaffForm({...staffForm,phone:event.target.value.replace(/[^0-9]/g,"")})} placeholder="10-digit number" className={inputClass}/></div><div><label className={labelClass}>Email address</label><input type="email" value={staffForm.email} onChange={(event)=>setStaffForm({...staffForm,email:event.target.value})} placeholder="name@example.com" className={inputClass}/></div></div><div><label className={labelClass}>Address</label><input value={staffForm.address} onChange={(event)=>setStaffForm({...staffForm,address:event.target.value})} placeholder="Staff address (optional)" className={inputClass}/></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Branch *</label><select required value={staffForm.branchId} onChange={(event)=>setStaffForm({...staffForm,branchId:event.target.value})} className={inputClass}>{activeBranches.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div><label className={labelClass}>Role *</label><select value={staffForm.role} onChange={(event)=>setStaffForm({...staffForm,role:event.target.value as StaffRole})} className={inputClass}><option>Manager</option><option>Receptionist</option><option>Librarian</option><option>Other</option></select></div></div><div><label className={labelClass}>Status</label><select value={staffForm.status} onChange={(event)=>setStaffForm({...staffForm,status:event.target.value as "Active" | "Inactive"})} className={inputClass}><option>Active</option><option>Inactive</option></select></div><p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800">Demo note: staff ID is generated automatically. Do not enter real personal information.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={()=>setShowStaffForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">{editingStaff?"Save changes":"Add staff member"}</button></div></form></Modal>}

      {showPaymentForm && <Modal title="Record fee payment" onClose={()=>setShowPaymentForm(false)}><form onSubmit={savePayment} className="space-y-3"><div><label className={labelClass}>Membership *</label><select required value={paymentForm.membershipId} onChange={(e)=>setPaymentForm({...paymentForm,membershipId:e.target.value,amount:String(dueFor(memberships.find(m=>m.id===e.target.value)!))})} className={inputClass}>{memberships.filter(m=>dueFor(m)>0).map(m=>{const student=students.find(s=>s.id===m.studentId);return <option key={m.id} value={m.id}>{student?.name||m.studentId} · Due ₹{dueFor(m).toLocaleString("en-IN")}</option>;})}</select></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Amount received (₹) *</label><input required type="number" min="1" max={dueFor(memberships.find(m=>m.id===paymentForm.membershipId) || {id:"",fee:0} as Membership)} step="0.01" value={paymentForm.amount} onChange={(e)=>setPaymentForm({...paymentForm,amount:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Payment date *</label><input required type="date" value={paymentForm.date} onChange={(e)=>setPaymentForm({...paymentForm,date:e.target.value})} className={inputClass}/></div></div><div><label className={labelClass}>Payment method *</label><select value={paymentForm.method} onChange={(e)=>setPaymentForm({...paymentForm,method:e.target.value as FeePayment["method"]})} className={inputClass}><option>Cash</option><option>UPI</option><option>Bank transfer</option></select></div><div><label className={labelClass}>Transaction reference (optional)</label><input value={paymentForm.reference} onChange={(e)=>setPaymentForm({...paymentForm,reference:e.target.value})} placeholder="UPI transaction ID / bank reference" className={inputClass}/></div><div><label className={labelClass}>Note (optional)</label><input value={paymentForm.note} onChange={(e)=>setPaymentForm({...paymentForm,note:e.target.value})} placeholder="Payment note" className={inputClass}/></div><p className="rounded-lg bg-blue-50 px-3 py-2 text-[10px] leading-4 text-blue-800">Partial payments are allowed. The amount cannot exceed the outstanding balance. No payment gateway is connected.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={()=>setShowPaymentForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Save payment</button></div></form></Modal>}
      {showPlanForm && <Modal title="Create membership plan" onClose={() => setShowPlanForm(false)}><form onSubmit={savePlan} className="space-y-3"><div><label className={labelClass}>Plan name *</label><input required value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} placeholder="e.g. Weekend plan" className={inputClass} /></div><div><label className={labelClass}>Duration in days *</label><input required type="number" min="1" step="1" value={planForm.durationDays} onChange={(e) => setPlanForm({ ...planForm, durationDays: e.target.value })} className={inputClass} /></div><div><label className={labelClass}>Fee (₹) *</label><input required type="number" min="0" step="1" value={planForm.fee} onChange={(e) => setPlanForm({ ...planForm, fee: e.target.value })} placeholder="e.g. 500" className={inputClass} /></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowPlanForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Create plan</button></div></form></Modal>}
      {showMembershipForm && <Modal title="Assign membership" onClose={() => setShowMembershipForm(false)}><form onSubmit={saveMembership} className="space-y-3"><div><label className={labelClass}>Active student *</label><select required value={membershipForm.studentId} onChange={(e) => setMembershipForm({ ...membershipForm, studentId: e.target.value })} className={inputClass}><option value="">Select student</option>{students.filter((s) => s.status === "Active").map((s) => <option key={s.id} value={s.id}>{s.name} · {s.id} · {branchName(s.branchId)}</option>)}</select></div><div><label className={labelClass}>Membership plan *</label><select required value={membershipForm.planId} onChange={(e) => setMembershipForm({ ...membershipForm, planId: e.target.value })} className={inputClass}>{plans.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.durationDays} days · ₹{p.fee}</option>)}</select></div><div><label className={labelClass}>Start date *</label><input required type="date" value={membershipForm.startDate} onChange={(e) => setMembershipForm({ ...membershipForm, startDate: e.target.value })} className={inputClass} /></div><p className="rounded-lg bg-blue-50 px-3 py-2 text-[10px] leading-4 text-blue-800">Expiry is calculated automatically from the selected plan. This does not record a payment.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowMembershipForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Assign membership</button></div></form></Modal>}
      {showBranchForm && <Modal title={editingBranch ? "Edit branch" : "Add new branch"} onClose={() => setShowBranchForm(false)}><form onSubmit={saveBranch} className="space-y-4"><div><label className={labelClass}>Branch name *</label><input required value={branchForm.name} onChange={(event) => setBranchForm({ ...branchForm, name: event.target.value })} placeholder="e.g. Main Market" className={inputClass} /></div><div><label className={labelClass}>Location / address *</label><input required value={branchForm.location} onChange={(event) => setBranchForm({ ...branchForm, location: event.target.value })} placeholder="City, state" className={inputClass} /></div><div><label className={labelClass}>Total seat capacity *</label><input required min="1" type="number" value={branchForm.capacity} onChange={(event) => setBranchForm({ ...branchForm, capacity: event.target.value })} className={inputClass} /></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowBranchForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">{editingBranch ? "Save changes" : "Create branch"}</button></div></form></Modal>}

      {showAdmissionForm && <Modal title="New admission application" onClose={() => setShowAdmissionForm(false)}><form onSubmit={saveAdmission} className="space-y-3"><div><label className={labelClass}>Applicant full name *</label><input required value={admissionForm.name} onChange={(event) => setAdmissionForm({ ...admissionForm, name: event.target.value })} placeholder="Enter full name" className={inputClass} /></div><div><label className={labelClass}>Mobile number *</label><input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={admissionForm.phone} onChange={(event) => setAdmissionForm({ ...admissionForm, phone: event.target.value.replace(/[^0-9]/g, "") })} placeholder="10-digit mobile number" className={inputClass} /></div><div><label className={labelClass}>Branch *</label><select required value={admissionForm.branchId} onChange={(event) => setAdmissionForm({ ...admissionForm, branchId: event.target.value })} className={inputClass}>{activeBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Membership plan</label><select value={admissionForm.plan} onChange={(event) => setAdmissionForm({ ...admissionForm, plan: event.target.value })} className={inputClass}><option>Monthly</option><option>Quarterly</option><option>Half-yearly</option><option>Yearly</option><option>Daily</option></select></div><div><label className={labelClass}>Admission date</label><input type="date" required value={admissionForm.admissionDate} onChange={(event) => setAdmissionForm({ ...admissionForm, admissionDate: event.target.value })} className={inputClass} /></div></div><div><label className={labelClass}>Applicant photo (optional)</label><input type="file" accept="image/png,image/jpeg,image/webp" className={inputClass} onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; if (file.size > 700 * 1024) { setNotice("Photo must be 700 KB or smaller for this browser demo."); event.target.value = ""; return; } const reader = new FileReader(); reader.onload = () => setAdmissionForm((current) => ({ ...current, photo: String(reader.result || "") })); reader.readAsDataURL(file); }} /><p className="mt-1 text-[9px] text-slate-400">JPG, PNG or WebP · Max 700 KB · Stored in this browser only</p>{admissionForm.photo && <img src={admissionForm.photo} alt="Applicant preview" className="mt-2 h-16 w-16 rounded-lg object-cover" />}</div><p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800">Demo only. Use fictional details and sample images. Do not upload real student documents or personal data.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowAdmissionForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Submit application</button></div></form></Modal>}

      {showStudentForm && <Modal title={editingStudent ? "Edit student profile" : "New student admission"} onClose={() => setShowStudentForm(false)}><form onSubmit={saveStudent} className="space-y-3"><div><label className={labelClass}>Student full name *</label><input required value={studentForm.name} onChange={(event) => setStudentForm({ ...studentForm, name: event.target.value })} placeholder="Enter full name" className={inputClass} /></div><div><label className={labelClass}>Mobile number *</label><input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={studentForm.phone} onChange={(event) => setStudentForm({ ...studentForm, phone: event.target.value.replace(/[^0-9]/g, "") })} placeholder="10-digit mobile number" className={inputClass} /></div><div><label className={labelClass}>Branch *</label><select required value={studentForm.branchId} onChange={(event) => setStudentForm({ ...studentForm, branchId: event.target.value })} className={inputClass}>{activeBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Membership plan</label><select value={studentForm.plan} onChange={(event) => setStudentForm({ ...studentForm, plan: event.target.value })} className={inputClass}><option>Monthly</option><option>Quarterly</option><option>Half-yearly</option><option>Yearly</option><option>Daily</option></select></div><div><label className={labelClass}>Admission date</label><input type="date" value={studentForm.admissionDate} onChange={(event) => setStudentForm({ ...studentForm, admissionDate: event.target.value })} className={inputClass} /></div></div><div><label className={labelClass}>Status</label><select value={studentForm.status} onChange={(event) => setStudentForm({ ...studentForm, status: event.target.value as "Active" | "Inactive" })} className={inputClass}><option>Active</option><option>Inactive</option></select></div><p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800">Demo note: student ID is generated automatically. Do not enter real student personal information in this demo.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowStudentForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">{editingStudent ? "Save profile" : "Complete admission"}</button></div></form></Modal>}
    </div>
  );
}

function Metric({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) {
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><p className="text-[10px] font-medium text-slate-500">{label}</p><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3f8] text-[#315d84]">{icon}</span></div><p className="mt-3 text-[24px] font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-[10px] text-slate-400">{detail}</p></div>;
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="px-6 py-12 text-center"><p className="text-[12px] font-semibold text-slate-700">{title}</p><p className="mt-1 text-[10px] text-slate-400">{detail}</p></div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="max-h-[90vh] w-full max-w-[470px] overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6"><div className="mb-5 flex items-center justify-between"><h3 className="text-[16px] font-bold text-slate-900">{title}</h3><button onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close dialog"><X size={17} /></button></div>{children}</div></div>;
}

function Overview({ branches, students, staffCount, onNavigate, branchName }: { branches: Branch[]; students: Student[]; staffCount: number; onNavigate: (label: string) => void; branchName: (id: string) => string }) {
  const active = students.filter((student) => student.status === "Active").length;
  const stats = [{ label: "Total students", value: students.length.toLocaleString("en-IN"), note: "Across all branches", icon: Users }, { label: "Active memberships", value: active.toLocaleString("en-IN"), note: "Currently active", icon: ShieldCheck }, { label: "Total branches", value: String(branches.length), note: "Configured locations", icon: Building2 }, { label: "Seat capacity", value: branches.reduce((sum, branch) => sum + branch.capacity, 0).toLocaleString("en-IN"), note: "Configured seats", icon: Armchair }, { label: "Staff members", value: String(staffCount), note: "Across all branches", icon: UserRound }];
  const recent = students.slice(0, 5);
  return <><div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">Good day, Admin</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Library overview</h2><p className="mt-1.5 text-xs text-slate-500">A snapshot of your study library operations.</p></div><button onClick={() => onNavigate("Admissions")} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#193c5e]"><Plus size={15} /> New admission</button></div>
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <div key={stat.label} className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between"><p className="text-[11px] font-medium text-slate-500">{stat.label}</p><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf3f8] text-[#315d84]"><Icon size={16} /></span></div><p className="mt-3 text-[25px] font-bold tracking-tight text-slate-900">{stat.value}</p><p className="mt-1 text-[10px] text-slate-400">{stat.note}</p></div>; })}</section>
    <section className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]"><div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="text-[13px] font-bold text-slate-900">Branch directory</h3><p className="mt-1 text-[10px] text-slate-400">Your configured library locations</p></div><button onClick={() => onNavigate("Branches")} className="text-[10px] font-semibold text-[#315d84] hover:underline">Manage branches</button></div><div className="mt-4 space-y-3">{branches.map((branch) => { const count = students.filter((student) => student.branchId === branch.id).length; return <div key={branch.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf3f8] text-[#315d84]"><Building2 size={16} /></div><div className="min-w-0"><p className="truncate text-[11px] font-semibold text-slate-800">{branch.name}</p><p className="mt-0.5 truncate text-[9px] text-slate-400">{branch.location}</p></div></div><div className="shrink-0 text-right"><p className="text-[12px] font-bold text-slate-800">{count} <span className="text-[9px] font-normal text-slate-400">students</span></p><p className="text-[9px] text-slate-400">{branch.capacity} seats</p></div></div>; })}{branches.length === 0 && <EmptyState title="No branches created" detail="Add a branch to start organizing student records." />}</div></div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6"><div className="flex items-center justify-between"><div><h3 className="text-[13px] font-bold text-slate-900">Recent student records</h3><p className="mt-1 text-[10px] text-slate-400">Latest entries in this demo</p></div><button onClick={() => onNavigate("Students")} className="text-[10px] font-semibold text-[#315d84] hover:underline">View students</button></div><div className="mt-4 divide-y divide-slate-100">{recent.map((student) => <div key={student.id} className="flex items-center justify-between gap-2 py-3"><div className="min-w-0"><p className="truncate text-[10px] font-semibold text-slate-800">{student.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{student.id} · {branchName(student.branchId)}</p></div><span className={"shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold " + (student.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{student.status}</span></div>)}{recent.length === 0 && <EmptyState title="No students yet" detail="Add your first student record." />}</div></div></section>
    <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800"><Sparkles size={15} className="mt-0.5 shrink-0" /><p><span className="font-semibold">Demo workspace:</span> create branches and student profiles to explore the workflows. Data is saved only in this browser using local storage.</p></div>
  </>;
}
