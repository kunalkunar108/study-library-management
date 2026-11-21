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
type Admission = { id: string; name: string; phone: string; branchId: string; plan: string; admissionDate: string; photo: string; fatherName?: string; dob?: string; gender?: string; alternatePhone?: string; address?: string; qualification?: string; emergencyContact?: string; aadhaarDoc?: string; marksheetDoc?: string; status: "Pending" | "Approved" | "Rejected" };
type Seat = { id: string; branchId: string; number: string; mode: "Fixed" | "Shift-based"; active: boolean; allocations: { studentId: string; shift: string }[] };
type MembershipPlan = { id: string; name: string; durationDays: number; fee: number; active: boolean };
type Membership = { id: string; studentId: string; planId: string; branchId: string; startDate: string; endDate: string; fee: number };
type FeePayment = { id: string; membershipId: string; studentId: string; branchId: string; date: string; amount: number; method: "Cash" | "UPI" | "Bank transfer"; reference: string; note: string };
type AttendanceStatus = "Present" | "Absent" | "Late";
type AttendanceRecord = { id: string; studentId: string; branchId: string; date: string; status: AttendanceStatus };
type StaffRole = "Manager" | "Receptionist" | "Librarian" | "Other";
type StaffMember = { id: string; name: string; phone: string; email: string; address: string; branchId: string; role: StaffRole; status: "Active" | "Inactive" };
type LibrarySettings = { libraryName: string; logoText: string; address: string; phone: string; email: string; ownerName: string; openingTime: string; closingTime: string; defaultPlanId: string; workingDays: string[] };
type Student = {
  id: string; name: string; phone: string; branchId: string; plan: string;
  admissionDate: string; status: "Active" | "Inactive"; fatherName?: string; dob?: string; gender?: string; alternatePhone?: string; address?: string; qualification?: string; emergencyContact?: string; photo?: string; aadhaarDoc?: string; marksheetDoc?: string;
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

const defaultLibrarySettings: LibrarySettings = { libraryName: "StudyDesk", logoText: "SD", address: "Dumka, Jharkhand", phone: "", email: "", ownerName: "Admin", openingTime: "06:00", closingTime: "22:00", defaultPlanId: "PLAN-MON", workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] };
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
  const [librarySettings, setLibrarySettings] = useState<LibrarySettings>(defaultLibrarySettings);
  const [loaded, setLoaded] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [branchSearch, setBranchSearch] = useState("");
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<string | null>(null);
  const [showAdmissionForm, setShowAdmissionForm] = useState(false);
  const [showRenewForm, setShowRenewForm] = useState(false);
  const [renewSearch, setRenewSearch] = useState("");
  const [renewStudentId, setRenewStudentId] = useState("");
  const [renewPlanId, setRenewPlanId] = useState("PLAN-MON");
  const [renewStartDate, setRenewStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [renewPaymentAmount, setRenewPaymentAmount] = useState("");
  const [renewPaymentMethod, setRenewPaymentMethod] = useState<"Cash" | "UPI" | "Bank transfer">("Cash");
  const [admissionSearch, setAdmissionSearch] = useState("");
  const [admissionFilter, setAdmissionFilter] = useState("all");
  const [admissionForm, setAdmissionForm] = useState({ name: "", phone: "", branchId: seedBranches[0].id, plan: "Monthly", admissionDate: new Date().toISOString().slice(0, 10), photo: "", fatherName: "", dob: "", gender: "", alternatePhone: "", address: "", qualification: "", emergencyContact: "", aadhaarDoc: "", marksheetDoc: "" });
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
        if (parsed.librarySettings && typeof parsed.librarySettings === "object") setLibrarySettings({ ...defaultLibrarySettings, ...parsed.librarySettings, workingDays: Array.isArray(parsed.librarySettings.workingDays) ? parsed.librarySettings.workingDays : defaultLibrarySettings.workingDays });
      }
    } catch {
      setNotice("Saved demo data could not be read. Sample data is loaded.");
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("studydesk-demo-v1", JSON.stringify({ branches, students, admissions, seats, plans, memberships, payments, attendance: attendanceRecords, staff, librarySettings }));
  }, [branches, students, admissions, seats, plans, memberships, payments, attendanceRecords, staff, loaded]);

  function exportDemoBackup() {
    const backup = { exportedAt: new Date().toISOString(), app: "StudyDesk demo", version: 1, branches, students, admissions, seats, plans, memberships, payments, attendance: attendanceRecords, staff, librarySettings };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "studydesk-backup-" + new Date().toISOString().slice(0, 10) + ".json"; link.click(); URL.revokeObjectURL(url);
    setNotice("Demo backup downloaded as JSON.");
  }
  function loadDemoData() {
    if (!window.confirm("Load the complete StudyDesk presentation dataset? This will replace the records currently saved in this browser with fictional sample data. Download a backup first if you need your current records.")) return;
    const day = (offset: number) => { const d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate() + offset); return d.toISOString().slice(0,10); };
    const sampleStudents: Student[] = [
      { id: "STU-2501", name: "Aarav Kumar", phone: "9000001001", branchId: "BR-001", plan: "Monthly", admissionDate: day(-45), status: "Active" },
      { id: "STU-2502", name: "Priya Kumari", phone: "9000001002", branchId: "BR-001", plan: "Quarterly", admissionDate: day(-70), status: "Active" },
      { id: "STU-2503", name: "Rohan Sinha", phone: "9000001003", branchId: "BR-002", plan: "Monthly", admissionDate: day(-20), status: "Active" },
      { id: "STU-2504", name: "Ananya Das", phone: "9000001004", branchId: "BR-002", plan: "Half-yearly", admissionDate: day(-95), status: "Active" },
      { id: "STU-2505", name: "Rahul Raj", phone: "9000001005", branchId: "BR-003", plan: "Monthly", admissionDate: day(-12), status: "Active" },
      { id: "STU-2506", name: "Sneha Kumari", phone: "9000001006", branchId: "BR-001", plan: "Monthly", admissionDate: day(-30), status: "Active" },
      { id: "STU-2507", name: "Vikash Yadav", phone: "9000001007", branchId: "BR-003", plan: "Quarterly", admissionDate: day(-55), status: "Active" },
      { id: "STU-2508", name: "Neha Sharma", phone: "9000001008", branchId: "BR-002", plan: "Monthly", admissionDate: day(-8), status: "Active" },
      { id: "STU-2509", name: "Amit Kumar", phone: "9000001009", branchId: "BR-001", plan: "Monthly", admissionDate: day(-110), status: "Inactive" },
      { id: "STU-2510", name: "Pooja Singh", phone: "9000001010", branchId: "BR-003", plan: "Half-yearly", admissionDate: day(-130), status: "Active" }
    ];
    const samplePlans: MembershipPlan[] = [
      { id: "PLAN-MON", name: "Monthly", durationDays: 30, fee: 500, active: true },
      { id: "PLAN-QTR", name: "Quarterly", durationDays: 90, fee: 1300, active: true },
      { id: "PLAN-HALF", name: "Half-yearly", durationDays: 180, fee: 2400, active: true },
      { id: "PLAN-YEAR", name: "Yearly", durationDays: 365, fee: 4200, active: true }
    ];
    const membershipSpecs = [
      ["MEM-2501","STU-2501","PLAN-MON","BR-001",-20,9,500],
      ["MEM-2502","STU-2502","PLAN-QTR","BR-001",-65,25,1300],
      ["MEM-2503","STU-2503","PLAN-MON","BR-002",-12,18,500],
      ["MEM-2504","STU-2504","PLAN-HALF","BR-002",-90,90,2400],
      ["MEM-2505","STU-2505","PLAN-MON","BR-003",-10,20,500],
      ["MEM-2506","STU-2506","PLAN-MON","BR-001",-28,2,500],
      ["MEM-2507","STU-2507","PLAN-QTR","BR-003",-50,40,1300],
      ["MEM-2508","STU-2508","PLAN-MON","BR-002",-5,25,500],
      ["MEM-2509","STU-2509","PLAN-MON","BR-001",-80,-50,500],
      ["MEM-2510","STU-2510","PLAN-HALF","BR-003",-120,60,2400]
    ] as const;
    const sampleMemberships: Membership[] = membershipSpecs.map(([id,studentId,planId,branchId,startOffset,endOffset,fee]) => ({ id, studentId, planId, branchId, startDate: day(startOffset), endDate: day(endOffset), fee }));
    const samplePayments: FeePayment[] = [
      { id:"PAY-2501",membershipId:"MEM-2501",studentId:"STU-2501",branchId:"BR-001",date:day(-18),amount:300,method:"UPI",reference:"DEMO-UPI-2501",note:"Part payment" },
      { id:"PAY-2502",membershipId:"MEM-2501",studentId:"STU-2501",branchId:"BR-001",date:day(-5),amount:200,method:"Cash",reference:"",note:"Balance cleared" },
      { id:"PAY-2503",membershipId:"MEM-2502",studentId:"STU-2502",branchId:"BR-001",date:day(-60),amount:1300,method:"UPI",reference:"DEMO-UPI-2502",note:"Quarterly fee" },
      { id:"PAY-2504",membershipId:"MEM-2503",studentId:"STU-2503",branchId:"BR-002",date:day(-10),amount:250,method:"Cash",reference:"",note:"Part payment" },
      { id:"PAY-2505",membershipId:"MEM-2504",studentId:"STU-2504",branchId:"BR-002",date:day(-85),amount:2400,method:"Bank transfer",reference:"DEMO-BANK-2504",note:"Half-yearly fee" },
      { id:"PAY-2506",membershipId:"MEM-2505",studentId:"STU-2505",branchId:"BR-003",date:day(-8),amount:500,method:"UPI",reference:"DEMO-UPI-2505",note:"Monthly fee" },
      { id:"PAY-2507",membershipId:"MEM-2506",studentId:"STU-2506",branchId:"BR-001",date:day(-25),amount:500,method:"Cash",reference:"",note:"Monthly fee" },
      { id:"PAY-2508",membershipId:"MEM-2507",studentId:"STU-2507",branchId:"BR-003",date:day(-45),amount:700,method:"UPI",reference:"DEMO-UPI-2507",note:"Part payment" },
      { id:"PAY-2509",membershipId:"MEM-2508",studentId:"STU-2508",branchId:"BR-002",date:day(-3),amount:500,method:"Cash",reference:"",note:"Monthly fee" },
      { id:"PAY-2510",membershipId:"MEM-2510",studentId:"STU-2510",branchId:"BR-003",date:day(-100),amount:1200,method:"Bank transfer",reference:"DEMO-BANK-2510",note:"First instalment" }
    ];
    const sampleSeats: Seat[] = [
      { id:"SEAT-001",branchId:"BR-001",number:"A-01",mode:"Fixed",active:true,allocations:[{studentId:"STU-2501",shift:"Full day"}] },
      { id:"SEAT-002",branchId:"BR-001",number:"A-02",mode:"Fixed",active:true,allocations:[{studentId:"STU-2502",shift:"Full day"}] },
      { id:"SEAT-003",branchId:"BR-001",number:"A-03",mode:"Shift-based",active:true,allocations:[{studentId:"STU-2506",shift:"Morning"},{studentId:"STU-2501",shift:"Evening"}] },
      { id:"SEAT-004",branchId:"BR-002",number:"B-01",mode:"Fixed",active:true,allocations:[{studentId:"STU-2503",shift:"Full day"}] },
      { id:"SEAT-005",branchId:"BR-002",number:"B-02",mode:"Shift-based",active:true,allocations:[{studentId:"STU-2504",shift:"Morning"},{studentId:"STU-2508",shift:"Evening"}] },
      { id:"SEAT-006",branchId:"BR-003",number:"C-01",mode:"Fixed",active:true,allocations:[{studentId:"STU-2505",shift:"Full day"}] },
      { id:"SEAT-007",branchId:"BR-003",number:"C-02",mode:"Fixed",active:true,allocations:[] }
    ];
    const sampleAdmissions: Admission[] = [
      { id:"ADM-2501",name:"Kavita Kumari",phone:"9000001011",branchId:"BR-001",plan:"Monthly",admissionDate:day(0),photo:"",status:"Pending" },
      { id:"ADM-2502",name:"Saurav Kumar",phone:"9000001012",branchId:"BR-002",plan:"Quarterly",admissionDate:day(-1),photo:"",status:"Pending" },
      { id:"ADM-2503",name:"Meena Das",phone:"9000001013",branchId:"BR-003",plan:"Monthly",admissionDate:day(-4),photo:"",status:"Rejected" },
      { id:"ADM-2504",name:"Deepak Raj",phone:"9000001014",branchId:"BR-001",plan:"Half-yearly",admissionDate:day(-6),photo:"",status:"Approved" }
    ];
    const sampleAttendance: AttendanceRecord[] = [];
    for (let offset = -6; offset <= 0; offset++) {
      sampleStudents.filter(student => student.status === "Active").forEach((student,index) => {
        const status: AttendanceStatus = (index + Math.abs(offset)) % 9 === 0 ? "Absent" : (index + Math.abs(offset)) % 7 === 0 ? "Late" : "Present";
        sampleAttendance.push({ id: "ATT-" + student.id + "-" + day(offset), studentId: student.id, branchId: student.branchId, date: day(offset), status });
      });
    }
    const sampleStaff: StaffMember[] = [
      { id:"STF-2501",name:"Sanjay Kumar",phone:"9000002001",email:"sanjay.demo@example.com",address:"Dumka",branchId:"BR-001",role:"Manager",status:"Active" },
      { id:"STF-2502",name:"Ritika Kumari",phone:"9000002002",email:"ritika.demo@example.com",address:"Dumka",branchId:"BR-001",role:"Receptionist",status:"Active" },
      { id:"STF-2503",name:"Manoj Sinha",phone:"9000002003",email:"manoj.demo@example.com",address:"Dumka",branchId:"BR-002",role:"Librarian",status:"Active" },
      { id:"STF-2504",name:"Pankaj Yadav",phone:"9000002004",email:"pankaj.demo@example.com",address:"Dumka",branchId:"BR-003",role:"Librarian",status:"Active" },
      { id:"STF-2505",name:"Nisha Das",phone:"9000002005",email:"nisha.demo@example.com",address:"Dumka",branchId:"BR-002",role:"Other",status:"Inactive" }
    ];
    setBranches(seedBranches); setStudents(sampleStudents); setAdmissions(sampleAdmissions); setSeats(sampleSeats);
    setPlans(samplePlans); setMemberships(sampleMemberships); setPayments(samplePayments);
    setAttendanceRecords(sampleAttendance); setStaff(sampleStaff);
    setLibrarySettings({ ...defaultLibrarySettings, libraryName:"StudyDesk Demo Library", logoText:"SDL", address:"Dumka, Jharkhand", ownerName:"Library Admin" });
    setSelectedBranch("all"); setAttendanceDate(day(0)); setNotice("Presentation dataset loaded: 10 students, 3 branches, 7 seats, 10 memberships, 10 payments, 4 admissions and 5 staff. All records are fictional.");
  }

  function resetDemoWorkspace() {
    if (!window.confirm("Reset this browser demo? All branches, students, admissions, seats, memberships, payments, attendance, staff and settings will be replaced with the original sample setup. This cannot be undone. Download a backup first if you need one.")) return;
    setBranches(seedBranches); setStudents(seedStudents); setAdmissions([]); setSeats([]);
    setPlans([{ id: "PLAN-MON", name: "Monthly", durationDays: 30, fee: 500, active: true }, { id: "PLAN-QTR", name: "Quarterly", durationDays: 90, fee: 1300, active: true }, { id: "PLAN-HALF", name: "Half-yearly", durationDays: 180, fee: 2400, active: true }, { id: "PLAN-YEAR", name: "Yearly", durationDays: 365, fee: 4200, active: true }]);
    setMemberships([]); setPayments([]); setAttendanceRecords([]); setStaff([]); setLibrarySettings(defaultLibrarySettings); setSelectedBranch("all"); setNotice("Demo workspace reset to its original sample setup.");
  }

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
  const reportSeatCapacity = reportSeats.reduce((sum, seat) => sum + (seat.mode === "Shift-based" ? 3 : 1), 0);
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
    const csv = rows.map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" });
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

  function openStudentProfile(student: Student) { setViewingStudent(student.id); }

  function printStudentSummary(student: Student) {
    const win = window.open("", "_blank", "width=760,height=850");
    if (!win) { setNotice("Allow pop-ups to print the student profile."); return; }
    const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const history = memberships.filter(m => m.studentId === student.id).sort((a,b)=>b.startDate.localeCompare(a.startDate));
    const rows = history.map(m => { const plan = plans.find(p=>p.id===m.planId); return "<tr><td>"+esc(plan?.name || "Membership")+"</td><td>"+esc(m.startDate)+"</td><td>"+esc(m.endDate)+"</td><td>₹"+m.fee.toLocaleString("en-IN")+"</td></tr>"; }).join("");
    const fields = [["Mobile",student.phone],["Alternate mobile",student.alternatePhone||"—"],["Father / guardian",student.fatherName||"—"],["Date of birth",student.dob||"—"],["Gender",student.gender||"—"],["Branch",branchName(student.branchId)],["Address",student.address||"—"],["Qualification",student.qualification||"—"],["Emergency contact",student.emergencyContact||"—"],["Admission date",student.admissionDate],["Current plan",student.plan],["Status",student.status]];
    const details = fields.map(([k,v])=>"<div class=item><b>"+esc(k)+"</b>"+esc(v)+"</div>").join("");
    win.document.write("<!doctype html><html><head><title>Student "+esc(student.id)+"</title><style>body{font-family:Arial,sans-serif;color:#172033;padding:36px;max-width:760px;margin:auto}h1{margin:0 0 4px}h2{font-size:16px;margin:26px 0 8px}p{font-size:13px;color:#64748b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.item{border-bottom:1px solid #e2e8f0;padding:9px 0;font-size:13px}.item b{display:block;color:#64748b;font-size:10px;margin-bottom:4px}table{width:100%;border-collapse:collapse;font-size:12px}td,th{text-align:left;border-bottom:1px solid #e2e8f0;padding:10px}@media print{button{display:none}}</style></head><body><h1>Student Profile</h1><p>StudyDesk · Demo record</p><h2>"+esc(student.name)+" · "+esc(student.id)+"</h2><div class=grid>"+details+"</div><h2>Membership history</h2><table><thead><tr><th>Plan</th><th>Start</th><th>End</th><th>Fee</th></tr></thead><tbody>"+rows+"</tbody></table><p>Demo record only. Not an official certificate.</p><button onclick=window.print()>Print / Save as PDF</button></body></html>");
    win.document.close(); win.focus();
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
    setAdmissionForm({ name: "", phone: "", branchId: activeBranches[0]?.id || "", plan: "Monthly", admissionDate: new Date().toISOString().slice(0, 10), photo: "", fatherName: "", dob: "", gender: "", alternatePhone: "", address: "", qualification: "", emergencyContact: "", aadhaarDoc: "", marksheetDoc: "" });
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
    const plan = plans.find((item) => item.name === admission.plan && item.active) || plans.find((item) => item.active);
    setStudents((current) => [{ id: studentId, name: admission.name, phone: admission.phone, branchId: admission.branchId, plan: admission.plan, admissionDate: admission.admissionDate, status: "Active", fatherName: admission.fatherName, dob: admission.dob, gender: admission.gender, alternatePhone: admission.alternatePhone, address: admission.address, qualification: admission.qualification, emergencyContact: admission.emergencyContact, photo: admission.photo, aadhaarDoc: admission.aadhaarDoc, marksheetDoc: admission.marksheetDoc }, ...current]);
    if (plan) { const startDate = admission.admissionDate; const end = new Date(startDate + "T12:00:00"); end.setDate(end.getDate() + plan.durationDays); const membershipId = "MEM-" + Date.now(); setMemberships((current) => [{ id: membershipId, studentId, planId: plan.id, branchId: admission.branchId, startDate, endDate: end.toISOString().slice(0,10), fee: plan.fee }, ...current]); }
    setAdmissions((current) => current.map((item) => item.id === admission.id ? { ...item, status: "Approved" } : item));
    setNotice(admission.name + " approved. Student ID generated: " + studentId);
  }

  function saveRenewal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const student = students.find(s => s.id === renewStudentId);
    const plan = plans.find(p => p.id === renewPlanId && p.active);
    if (!student || !plan) { setNotice("Select an existing student and an active plan."); return; }
    const latest = memberships.filter(m => m.studentId === student.id).sort((a,b)=>b.endDate.localeCompare(a.endDate))[0];
    const start = latest && latest.endDate >= renewStartDate ? new Date(latest.endDate + "T12:00:00") : new Date(renewStartDate + "T12:00:00");
    if (latest && latest.endDate >= renewStartDate) start.setDate(start.getDate()+1);
    const startDate = start.toISOString().slice(0,10); const end = new Date(startDate + "T12:00:00"); end.setDate(end.getDate()+plan.durationDays);
    const membershipId = "MEM-" + Date.now(); const membership: Membership = { id: membershipId, studentId: student.id, planId: plan.id, branchId: student.branchId, startDate, endDate: end.toISOString().slice(0,10), fee: plan.fee };
    const paid = Number(renewPaymentAmount || 0);
    if (!Number.isFinite(paid) || paid < 0 || paid > plan.fee) { setNotice("Enter a payment between ₹0 and the plan fee."); return; }
    setMemberships(current => [membership, ...current]); setStudents(current => current.map(s => s.id === student.id ? {...s, plan: plan.name, status: "Active"} : s));
    if (paid > 0) setPayments(current => [{ id:"PAY-"+Date.now(), membershipId, studentId:student.id, branchId:student.branchId, date:new Date().toISOString().slice(0,10), amount:paid, method:renewPaymentMethod, reference:"", note:"Membership renewal" }, ...current]);
    setShowRenewForm(false); setNotice("Membership renewed for "+student.name+". Existing student ID "+student.id+" retained.");
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
    setMembershipForm({ studentId: eligible?.id || "", planId: plans.find((p) => p.id === librarySettings.defaultPlanId && p.active)?.id || plans.find((p) => p.active)?.id || "", startDate: new Date().toISOString().slice(0, 10) });
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
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#244d73] text-[12px] font-bold text-white">{librarySettings.logoText || "SD"}</div><div><p className="text-[17px] font-bold tracking-tight text-slate-900">{librarySettings.libraryName || "StudyDesk"}</p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Library management</p></div></div>
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
          {navGroups.map((group) => <div key={group.label} className="mb-6"><p className="mb-2 px-3 text-[9px] font-bold tracking-[0.16em] text-slate-400">{group.label}</p><div className="space-y-1">{group.items.map((item) => { const Icon = item.icon; const active = activeNav === item.label; return <button key={item.label} onClick={() => navTo(item.label)} className={"group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] font-medium transition " + (active ? "bg-[#edf3f8] text-[#244d73]" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800")}><Icon size={17} /><span className="flex-1">{item.label}</span>{!["Overview", "Branches", "Students", "Admissions", "Seat management", "Memberships", "Attendance", "Fee collection", "Staff", "Reports", "Settings"].includes(item.label) && <span className="text-[9px] text-slate-300">Soon</span>}</button>; })}</div></div>)}
        </nav>
        <div className="border-t border-slate-100 p-4"><div className="mb-3 rounded-xl bg-[#f5f8fb] p-3"><div className="mb-2 flex items-center gap-2 text-[#315d84]"><Sparkles size={14} /><span className="text-[10px] font-bold">DEMO WORKSPACE</span></div><p className="text-[10px] leading-4 text-slate-500">Sample data only. Changes are saved in this browser.</p></div><div className="flex items-center gap-2 px-2 text-[10px] text-slate-400"><ShieldCheck size={13} /> Local demo mode</div></div>
      </aside>

      <div className="min-h-screen lg:pl-[258px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-7 lg:px-9">
          <div className="flex min-w-0 items-center gap-3"><button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu"><Menu size={20} /></button><div className="min-w-0"><div className="flex items-center gap-2 text-[11px] text-slate-400"><span>Workspace</span><span>/</span><span className="truncate font-semibold text-slate-600">{activeNav}</span></div><h1 className="mt-1 truncate text-[17px] font-bold tracking-tight text-slate-900">{activeNav}</h1></div></div>
          <div className="flex items-center gap-2 sm:gap-4"><div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[11px] text-slate-500 md:flex"><CalendarDays size={14} /><span>{today}</span></div><div className="hidden h-8 w-px bg-slate-200 sm:block" /><div className="flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8eef4] text-[11px] font-bold text-[#244d73]">{(librarySettings.ownerName || "Admin").slice(0,2).toUpperCase()}</div><div className="hidden sm:block"><p className="text-[11px] font-semibold text-slate-800">{librarySettings.ownerName || "Admin"}</p><p className="text-[9px] text-slate-400">Library owner</p></div></div></div>
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
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-1 text-[11px] font-medium text-slate-400">ENROLMENT WORKFLOW</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Admissions</h2><p className="mt-1.5 text-xs text-slate-500">Complete new-student admissions and renew existing memberships.</p></div><div className="flex flex-wrap gap-2"><button onClick={() => { setRenewStudentId(""); setRenewSearch(""); setRenewPlanId(plans.find(p=>p.id===librarySettings.defaultPlanId)?.id || plans[0]?.id || ""); setRenewStartDate(new Date().toISOString().slice(0,10)); setRenewPaymentAmount(""); setShowRenewForm(true); }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-[#244d73]"><Clock3 size={14}/> Renew membership</button><button onClick={openNewAdmission} disabled={activeBranches.length === 0} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#244d73] px-4 py-2.5 text-[11px] font-semibold text-white hover:bg-[#193c5e] disabled:opacity-50"><Plus size={15} /> New admission</button></div></div>
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
              <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3 sm:px-6">Student</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Plan</th><th className="px-4 py-3">Admission date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>{visibleStudents.map((student) => <tr key={student.id} className="border-t border-slate-100 hover:bg-slate-50/60"><td className="px-5 py-3 sm:px-6"><div className="flex items-center gap-2.5"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf3f8] text-[9px] font-bold text-[#315d84]">{student.name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</div><div><p className="text-[10px] font-semibold text-slate-800">{student.name}</p><p className="mt-0.5 text-[9px] text-slate-400">{student.id}</p></div></div></td><td className="px-4 py-3 text-[10px] text-slate-500">{student.phone}</td><td className="px-4 py-3 text-[10px] text-slate-500">{branchName(student.branchId)}</td><td className="px-4 py-3"><span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-600">{student.plan}</span></td><td className="px-4 py-3 text-[10px] text-slate-500">{student.admissionDate}</td><td className="px-4 py-3"><span className={"rounded-full px-2 py-1 text-[9px] font-semibold " + (student.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{student.status}</span></td><td className="px-4 py-3"><div className="flex flex-nowrap items-center gap-1.5"><button type="button" onClick={() => openStudentProfile(student)} className="shrink-0 whitespace-nowrap rounded-md border border-[#315d84] bg-[#edf3f8] px-2.5 py-1.5 text-[10px] font-bold text-[#244d73] hover:bg-[#dce8f2]">View</button><button onClick={() => editStudent(student)} className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50" aria-label={"Edit " + student.name}><Pencil size={12} /></button><button onClick={() => deleteStudent(student)} className="rounded-md border border-rose-100 p-1.5 text-rose-500 hover:bg-rose-50" aria-label={"Delete " + student.name}><Trash2 size={12} /></button></div></td></tr>)}{visibleStudents.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-[11px] text-slate-400">No student records match your filters.</td></tr>}</tbody></table></div>
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
              <div className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="text-[13px] font-bold text-slate-900">Seat utilization</h3><p className="mt-1 text-[10px] text-slate-400">Current configured seat allocations</p><div className="mt-5 flex items-end justify-between"><p className="text-[28px] font-bold text-slate-900">{reportSeatCapacity?Math.round(reportAllocatedSeats/reportSeatCapacity*100):0}%</p><p className="text-[10px] text-slate-500">{reportAllocatedSeats} allocations / {reportSeatCapacity} seat slots</p></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#47749b]" style={{width:(reportSeatCapacity?Math.min(100,reportAllocatedSeats/reportSeatCapacity*100):0)+"%"}}/></div><p className="mt-3 text-[10px] text-slate-400">Seat utilization is a current snapshot, not limited by the date filter.</p></div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h3 className="text-[13px] font-bold text-slate-900">Student attendance report</h3><p className="mt-1 text-[10px] text-slate-400">Individual attendance for the selected date range</p></div><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left"><thead><tr className="bg-slate-50/80 text-[9px] font-semibold uppercase tracking-wider text-slate-400"><th className="px-5 py-3">Student</th><th className="px-4 py-3">Branch</th><th className="px-4 py-3">Present / Late</th><th className="px-4 py-3">Total records</th><th className="px-5 py-3">Attendance</th></tr></thead><tbody>{reportStudentAttendance.map((student)=><tr key={student.id} className="border-t border-slate-100"><td className="px-5 py-3"><p className="text-[10px] font-semibold text-slate-800">{student.name}</p><p className="text-[9px] text-slate-400">{student.id}</p></td><td className="px-4 py-3 text-[10px] text-slate-500">{branchName(student.branchId)}</td><td className="px-4 py-3 text-[10px] text-slate-600">{student.present}</td><td className="px-4 py-3 text-[10px] text-slate-600">{student.total}</td><td className="px-5 py-3 text-[10px] font-semibold text-slate-700">{student.rate}%</td></tr>)}{reportStudentAttendance.length===0&&<tr><td colSpan={5} className="px-5 py-12 text-center text-[11px] text-slate-400">No attendance records in this date range.</td></tr>}</tbody></table></div></div>
            <p className="mt-3 rounded-lg bg-amber-50 px-4 py-3 text-[10px] leading-4 text-amber-800">Demo analytics: reports use records saved in this browser only. Fee totals reflect manual entries, not verified transactions. Outstanding balances are current membership balances; seat utilization is a current snapshot. CSV includes payment, admission and attendance rows for the selected period.</p>
          </section>}

          {activeNav === "Settings" && <section>
            <div className="mb-7"><p className="mb-1 text-[11px] font-medium text-slate-400">WORKSPACE CONFIGURATION</p><h2 className="text-[25px] font-bold tracking-tight text-slate-900">Settings</h2><p className="mt-1.5 text-xs text-slate-500">Configure the library profile, operating hours and default workspace preferences.</p></div>
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4"><h3 className="text-[13px] font-bold text-slate-900">Library profile</h3><p className="mt-1 text-[10px] text-slate-400">Shown as the identity of this demo workspace.</p></div><div className="space-y-3"><div className="grid grid-cols-[1fr_100px] gap-3"><div><label className={labelClass}>Library name</label><input value={librarySettings.libraryName} onChange={(e)=>setLibrarySettings({...librarySettings,libraryName:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Logo initials</label><input maxLength={3} value={librarySettings.logoText} onChange={(e)=>setLibrarySettings({...librarySettings,logoText:e.target.value.toUpperCase()})} className={inputClass}/></div></div><div><label className={labelClass}>Address</label><input value={librarySettings.address} onChange={(e)=>setLibrarySettings({...librarySettings,address:e.target.value})} className={inputClass}/></div><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className={labelClass}>Contact phone</label><input value={librarySettings.phone} onChange={(e)=>setLibrarySettings({...librarySettings,phone:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Contact email</label><input type="email" value={librarySettings.email} onChange={(e)=>setLibrarySettings({...librarySettings,email:e.target.value})} className={inputClass}/></div></div><div><label className={labelClass}>Owner / admin display name</label><input value={librarySettings.ownerName} onChange={(e)=>setLibrarySettings({...librarySettings,ownerName:e.target.value})} className={inputClass}/></div><div className="rounded-lg bg-slate-50 p-3 text-[10px] text-slate-500">Preview identity: <strong>{librarySettings.libraryName || "Your library"}</strong> · {librarySettings.address || "Add an address"}</div></div></div>
              <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4"><h3 className="text-[13px] font-bold text-slate-900">Operating hours</h3><p className="mt-1 text-[10px] text-slate-400">Default hours for this library workspace.</p></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Opening time</label><input type="time" value={librarySettings.openingTime} onChange={(e)=>setLibrarySettings({...librarySettings,openingTime:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Closing time</label><input type="time" value={librarySettings.closingTime} onChange={(e)=>setLibrarySettings({...librarySettings,closingTime:e.target.value})} className={inputClass}/></div></div><p className="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-[10px] leading-4 text-blue-800">These are workspace-wide reference hours. Separate hours for each branch are not configured in this demo.</p><div className="mt-5 border-t border-slate-100 pt-4"><div className="mb-3"><h3 className="text-[13px] font-bold text-slate-900">Attendance working days</h3><p className="mt-1 text-[10px] text-slate-400">Select the days the library normally operates.</p></div><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{weekdays.map((day)=><label key={day} className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-[10px] text-slate-600"><input type="checkbox" checked={librarySettings.workingDays.includes(day)} onChange={(e)=>setLibrarySettings({...librarySettings,workingDays:e.target.checked?[...librarySettings.workingDays,day]:librarySettings.workingDays.filter((d)=>d!==day)})} className="accent-[#244d73]"/>{day}</label>)}</div></div></div>
              <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4"><h3 className="text-[13px] font-bold text-slate-900">Default preferences</h3><p className="mt-1 text-[10px] text-slate-400">Choose the default membership plan for new assignments.</p></div><div><label className={labelClass}>Default membership plan</label><select value={librarySettings.defaultPlanId} onChange={(e)=>setLibrarySettings({...librarySettings,defaultPlanId:e.target.value})} className={inputClass}>{plans.filter((plan)=>plan.active).map((plan)=><option key={plan.id} value={plan.id}>{plan.name} · ₹{plan.fee.toLocaleString("en-IN")} · {plan.durationDays} days</option>)}</select>{plans.filter((plan)=>plan.active).length===0&&<p className="mt-2 text-[10px] text-amber-700">No active plans. Create or activate a plan in Memberships.</p>}</div><div className="mt-4 flex flex-wrap gap-2"><button onClick={()=>navTo("Memberships")} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600">Manage membership plans</button><button onClick={()=>navTo("Branches")} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600">Manage branches</button></div><div className="mt-4 rounded-lg bg-slate-50 p-3 text-[10px] leading-4 text-slate-500">The selected plan is a saved preference only. Existing membership fees and dates are not changed automatically.</div></div>
              <div className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4"><h3 className="text-[13px] font-bold text-slate-900">Data management</h3><p className="mt-1 text-[10px] text-slate-400">Back up or reset the records saved in this browser.</p></div><div className="flex flex-col gap-3 sm:flex-row"><button onClick={loadDemoData} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-[10px] font-semibold text-white">Load presentation demo data</button><button onClick={exportDemoBackup} className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Download full backup (JSON)</button><button onClick={resetDemoWorkspace} className="rounded-lg border border-rose-200 px-4 py-2.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-50">Reset demo workspace</button></div><p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800">Important: this is a browser-only demo. Backup files may contain all information entered in the demo. Use fictional data only. Reset permanently replaces the current browser records; download a backup first if needed.</p></div>
            </div>
            <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-[10px] leading-4 text-blue-800">Settings are saved automatically in this browser. They are not synchronized across devices or users. Working days and operating hours are configuration references; they do not automatically block attendance marking or control opening access.</p>
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

          {!["Overview", "Branches", "Students", "Admissions", "Seat management", "Memberships", "Attendance", "Fee collection", "Staff", "Reports", "Settings"].includes(activeNav) && <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#edf3f8] text-[#315d84]"><Sparkles size={20} /></div><h2 className="mt-4 text-[17px] font-bold text-slate-900">{activeNav} module is next</h2><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">This item is visible in the demo navigation, but its workflow has not been built yet. Branch and student management are available now.</p><button onClick={() => navTo("Overview")} className="mt-5 rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Back to overview</button></div>}

          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-[9px] text-slate-400 sm:flex-row"><p>© 2026 StudyDesk · Library Management Demo</p><p>Demo data only · Stored locally in this browser</p></footer>
        </main>
      </div>

      {showStaffForm && <Modal title={editingStaff ? "Edit staff profile" : "Add staff member"} onClose={() => setShowStaffForm(false)}><form onSubmit={saveStaff} className="space-y-3"><div><label className={labelClass}>Full name *</label><input required value={staffForm.name} onChange={(event)=>setStaffForm({...staffForm,name:event.target.value})} placeholder="Enter staff full name" className={inputClass}/></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Mobile number *</label><input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={staffForm.phone} onChange={(event)=>setStaffForm({...staffForm,phone:event.target.value.replace(/[^0-9]/g,"")})} placeholder="10-digit number" className={inputClass}/></div><div><label className={labelClass}>Email address</label><input type="email" value={staffForm.email} onChange={(event)=>setStaffForm({...staffForm,email:event.target.value})} placeholder="name@example.com" className={inputClass}/></div></div><div><label className={labelClass}>Address</label><input value={staffForm.address} onChange={(event)=>setStaffForm({...staffForm,address:event.target.value})} placeholder="Staff address (optional)" className={inputClass}/></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Branch *</label><select required value={staffForm.branchId} onChange={(event)=>setStaffForm({...staffForm,branchId:event.target.value})} className={inputClass}>{activeBranches.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></div><div><label className={labelClass}>Role *</label><select value={staffForm.role} onChange={(event)=>setStaffForm({...staffForm,role:event.target.value as StaffRole})} className={inputClass}><option>Manager</option><option>Receptionist</option><option>Librarian</option><option>Other</option></select></div></div><div><label className={labelClass}>Status</label><select value={staffForm.status} onChange={(event)=>setStaffForm({...staffForm,status:event.target.value as "Active" | "Inactive"})} className={inputClass}><option>Active</option><option>Inactive</option></select></div><p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800">Demo note: staff ID is generated automatically. Do not enter real personal information.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={()=>setShowStaffForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">{editingStaff?"Save changes":"Add staff member"}</button></div></form></Modal>}

      {showPaymentForm && <Modal title="Record fee payment" onClose={()=>setShowPaymentForm(false)}><form onSubmit={savePayment} className="space-y-3"><div><label className={labelClass}>Membership *</label><select required value={paymentForm.membershipId} onChange={(e)=>setPaymentForm({...paymentForm,membershipId:e.target.value,amount:String(dueFor(memberships.find(m=>m.id===e.target.value)!))})} className={inputClass}>{memberships.filter(m=>dueFor(m)>0).map(m=>{const student=students.find(s=>s.id===m.studentId);return <option key={m.id} value={m.id}>{student?.name||m.studentId} · Due ₹{dueFor(m).toLocaleString("en-IN")}</option>;})}</select></div><div className="grid grid-cols-2 gap-3"><div><label className={labelClass}>Amount received (₹) *</label><input required type="number" min="1" max={dueFor(memberships.find(m=>m.id===paymentForm.membershipId) || {id:"",fee:0} as Membership)} step="0.01" value={paymentForm.amount} onChange={(e)=>setPaymentForm({...paymentForm,amount:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Payment date *</label><input required type="date" value={paymentForm.date} onChange={(e)=>setPaymentForm({...paymentForm,date:e.target.value})} className={inputClass}/></div></div><div><label className={labelClass}>Payment method *</label><select value={paymentForm.method} onChange={(e)=>setPaymentForm({...paymentForm,method:e.target.value as FeePayment["method"]})} className={inputClass}><option>Cash</option><option>UPI</option><option>Bank transfer</option></select></div><div><label className={labelClass}>Transaction reference (optional)</label><input value={paymentForm.reference} onChange={(e)=>setPaymentForm({...paymentForm,reference:e.target.value})} placeholder="UPI transaction ID / bank reference" className={inputClass}/></div><div><label className={labelClass}>Note (optional)</label><input value={paymentForm.note} onChange={(e)=>setPaymentForm({...paymentForm,note:e.target.value})} placeholder="Payment note" className={inputClass}/></div><p className="rounded-lg bg-blue-50 px-3 py-2 text-[10px] leading-4 text-blue-800">Partial payments are allowed. The amount cannot exceed the outstanding balance. No payment gateway is connected.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={()=>setShowPaymentForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Save payment</button></div></form></Modal>}
      {showPlanForm && <Modal title="Create membership plan" onClose={() => setShowPlanForm(false)}><form onSubmit={savePlan} className="space-y-3"><div><label className={labelClass}>Plan name *</label><input required value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} placeholder="e.g. Weekend plan" className={inputClass} /></div><div><label className={labelClass}>Duration in days *</label><input required type="number" min="1" step="1" value={planForm.durationDays} onChange={(e) => setPlanForm({ ...planForm, durationDays: e.target.value })} className={inputClass} /></div><div><label className={labelClass}>Fee (₹) *</label><input required type="number" min="0" step="1" value={planForm.fee} onChange={(e) => setPlanForm({ ...planForm, fee: e.target.value })} placeholder="e.g. 500" className={inputClass} /></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowPlanForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Create plan</button></div></form></Modal>}
      {showMembershipForm && <Modal title="Assign membership" onClose={() => setShowMembershipForm(false)}><form onSubmit={saveMembership} className="space-y-3"><div><label className={labelClass}>Active student *</label><select required value={membershipForm.studentId} onChange={(e) => setMembershipForm({ ...membershipForm, studentId: e.target.value })} className={inputClass}><option value="">Select student</option>{students.filter((s) => s.status === "Active").map((s) => <option key={s.id} value={s.id}>{s.name} · {s.id} · {branchName(s.branchId)}</option>)}</select></div><div><label className={labelClass}>Membership plan *</label><select required value={membershipForm.planId} onChange={(e) => setMembershipForm({ ...membershipForm, planId: e.target.value })} className={inputClass}>{plans.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.durationDays} days · ₹{p.fee}</option>)}</select></div><div><label className={labelClass}>Start date *</label><input required type="date" value={membershipForm.startDate} onChange={(e) => setMembershipForm({ ...membershipForm, startDate: e.target.value })} className={inputClass} /></div><p className="rounded-lg bg-blue-50 px-3 py-2 text-[10px] leading-4 text-blue-800">Expiry is calculated automatically from the selected plan. This does not record a payment.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowMembershipForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Assign membership</button></div></form></Modal>}
      {showBranchForm && <Modal title={editingBranch ? "Edit branch" : "Add new branch"} onClose={() => setShowBranchForm(false)}><form onSubmit={saveBranch} className="space-y-4"><div><label className={labelClass}>Branch name *</label><input required value={branchForm.name} onChange={(event) => setBranchForm({ ...branchForm, name: event.target.value })} placeholder="e.g. Main Market" className={inputClass} /></div><div><label className={labelClass}>Location / address *</label><input required value={branchForm.location} onChange={(event) => setBranchForm({ ...branchForm, location: event.target.value })} placeholder="City, state" className={inputClass} /></div><div><label className={labelClass}>Total seat capacity *</label><input required min="1" type="number" value={branchForm.capacity} onChange={(event) => setBranchForm({ ...branchForm, capacity: event.target.value })} className={inputClass} /></div><div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={() => setShowBranchForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">{editingBranch ? "Save changes" : "Create branch"}</button></div></form></Modal>}

      {showAdmissionForm && <Modal title="Complete new admission form" onClose={() => setShowAdmissionForm(false)}><form onSubmit={saveAdmission} className="max-h-[78vh] space-y-4 overflow-y-auto pr-1"><div><h3 className="text-xs font-bold text-slate-800">Student details</h3><div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className={labelClass}>Full name *</label><input required value={admissionForm.name} onChange={e=>setAdmissionForm({...admissionForm,name:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Father / guardian name</label><input value={admissionForm.fatherName} onChange={e=>setAdmissionForm({...admissionForm,fatherName:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Date of birth</label><input type="date" value={admissionForm.dob} onChange={e=>setAdmissionForm({...admissionForm,dob:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Gender</label><select value={admissionForm.gender} onChange={e=>setAdmissionForm({...admissionForm,gender:e.target.value})} className={inputClass}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option><option>Prefer not to say</option></select></div><div><label className={labelClass}>Mobile number *</label><input required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={admissionForm.phone} onChange={e=>setAdmissionForm({...admissionForm,phone:e.target.value.replace(/[^0-9]/g,"")})} className={inputClass}/></div><div><label className={labelClass}>Alternate mobile</label><input inputMode="numeric" maxLength={10} value={admissionForm.alternatePhone} onChange={e=>setAdmissionForm({...admissionForm,alternatePhone:e.target.value.replace(/[^0-9]/g,"")})} className={inputClass}/></div><div className="sm:col-span-2"><label className={labelClass}>Full address</label><textarea value={admissionForm.address} onChange={e=>setAdmissionForm({...admissionForm,address:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Previous class / qualification</label><input value={admissionForm.qualification} onChange={e=>setAdmissionForm({...admissionForm,qualification:e.target.value})} className={inputClass}/></div><div><label className={labelClass}>Emergency contact</label><input value={admissionForm.emergencyContact} onChange={e=>setAdmissionForm({...admissionForm,emergencyContact:e.target.value})} className={inputClass}/></div></div></div><div><h3 className="text-xs font-bold text-slate-800">Library & membership</h3><div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3"><div><label className={labelClass}>Branch *</label><select required value={admissionForm.branchId} onChange={e=>setAdmissionForm({...admissionForm,branchId:e.target.value})} className={inputClass}>{activeBranches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></div><div><label className={labelClass}>Membership plan *</label><select value={admissionForm.plan} onChange={e=>setAdmissionForm({...admissionForm,plan:e.target.value})} className={inputClass}>{plans.filter(p=>p.active).map(p=><option key={p.id}>{p.name}</option>)}</select></div><div><label className={labelClass}>Admission date *</label><input type="date" required value={admissionForm.admissionDate} onChange={e=>setAdmissionForm({...admissionForm,admissionDate:e.target.value})} className={inputClass}/></div></div></div><div><h3 className="text-xs font-bold text-slate-800">Photo & documents (optional)</h3><div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className={labelClass}>Student photo</label><input type="file" accept="image/png,image/jpeg,image/webp" className={inputClass} onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>300*1024){setNotice("Photo must be 300 KB or smaller.");e.target.value="";return;}const reader=new FileReader();reader.onload=()=>setAdmissionForm(v=>({...v,photo:String(reader.result||"")}));reader.readAsDataURL(file);}}/>{admissionForm.photo&&<img src={admissionForm.photo} alt="Student preview" className="mt-2 h-14 w-14 rounded object-cover"/>}</div><div><label className={labelClass}>Aadhaar card (demo file)</label><input type="file" accept="image/*,.pdf" className={inputClass} onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>500*1024){setNotice("Document must be 500 KB or smaller.");e.target.value="";return;}const reader=new FileReader();reader.onload=()=>setAdmissionForm(v=>({...v,aadhaarDoc:String(reader.result||"")}));reader.readAsDataURL(file);}}/><p className="mt-1 text-[9px] text-slate-400">{admissionForm.aadhaarDoc?"Document attached":"No document attached"}</p></div><div><label className={labelClass}>Previous marksheet (demo file)</label><input type="file" accept="image/*,.pdf" className={inputClass} onChange={e=>{const file=e.target.files?.[0];if(!file)return;if(file.size>500*1024){setNotice("Document must be 500 KB or smaller.");e.target.value="";return;}const reader=new FileReader();reader.onload=()=>setAdmissionForm(v=>({...v,marksheetDoc:String(reader.result||"")}));reader.readAsDataURL(file);}}/><p className="mt-1 text-[9px] text-slate-400">{admissionForm.marksheetDoc?"Document attached":"No document attached"}</p></div></div></div><p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800">Demo only. Do not upload real Aadhaar cards, student records or sensitive documents. Files are stored in this browser and are not securely hosted.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={()=>setShowAdmissionForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white">Submit admission for review</button></div></form></Modal>}

      {showRenewForm && <Modal title="Renew existing membership" onClose={()=>setShowRenewForm(false)}><form onSubmit={saveRenewal} className="space-y-3"><div><label className={labelClass}>Find existing student</label><input value={renewSearch} onChange={e=>{setRenewSearch(e.target.value);setRenewStudentId("");}} placeholder="Search student name, ID or phone" className={inputClass}/><div className="mt-2 max-h-36 overflow-y-auto rounded-lg border border-slate-100">{students.filter(s=>s.status==="Active"&&(s.name+" "+s.id+" "+s.phone).toLowerCase().includes(renewSearch.toLowerCase())).slice(0,8).map(s=><button type="button" key={s.id} onClick={()=>{setRenewStudentId(s.id);setRenewSearch(s.name+" · "+s.id);}} className={"block w-full border-b border-slate-100 px-3 py-2 text-left text-xs hover:bg-slate-50 "+(renewStudentId===s.id?"bg-blue-50":"")}><span className="font-semibold">{s.name}</span><span className="ml-2 text-slate-400">{s.id} · {s.phone}</span></button>)}</div></div>{renewStudentId&&(()=>{const st=students.find(s=>s.id===renewStudentId);const latest=memberships.filter(m=>m.studentId===renewStudentId).sort((a,b)=>b.endDate.localeCompare(a.endDate))[0];return <div className="rounded-lg bg-slate-50 p-3 text-xs"><p className="font-semibold">{st?.name} · {st?.id}</p><p className="mt-1 text-slate-500">Branch: {branchName(st?.branchId||"")} · Current membership ends: {latest?.endDate||"No previous membership"}</p><p className="mt-1 text-slate-500">Existing profile will be retained. You can update details in Students.</p></div>;})()}<div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><div><label className={labelClass}>New membership plan</label><select required value={renewPlanId} onChange={e=>setRenewPlanId(e.target.value)} className={inputClass}>{plans.filter(p=>p.active).map(p=><option key={p.id} value={p.id}>{p.name} · ₹{p.fee.toLocaleString("en-IN")}</option>)}</select></div><div><label className={labelClass}>Renewal date</label><input type="date" required value={renewStartDate} onChange={e=>setRenewStartDate(e.target.value)} className={inputClass}/></div><div><label className={labelClass}>Payment received (optional)</label><input type="number" min="0" value={renewPaymentAmount} onChange={e=>setRenewPaymentAmount(e.target.value)} placeholder="0 for unpaid" className={inputClass}/></div><div><label className={labelClass}>Payment method</label><select value={renewPaymentMethod} onChange={e=>setRenewPaymentMethod(e.target.value as "Cash"|"UPI"|"Bank transfer")} className={inputClass}><option>Cash</option><option>UPI</option><option>Bank transfer</option></select></div></div><p className="rounded-lg bg-amber-50 px-3 py-2 text-[10px] leading-4 text-amber-800">Renewal keeps the existing student ID and personal profile. Only a new membership period is created. Demo payments are manual records.</p><div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><button type="button" onClick={()=>setShowRenewForm(false)} className="rounded-lg border border-slate-200 px-4 py-2.5 text-[10px] font-semibold text-slate-600">Cancel</button><button type="submit" disabled={!renewStudentId} className="rounded-lg bg-[#244d73] px-4 py-2.5 text-[10px] font-semibold text-white disabled:opacity-50">Confirm renewal</button></div></form></Modal>}

      {viewingStudent && (() => { const student = students.find(s => s.id === viewingStudent); if (!student) return null; const history = memberships.filter(m => m.studentId === student.id).sort((a,b)=>b.startDate.localeCompare(a.startDate)); const paymentHistory = payments.filter(p => p.studentId === student.id).sort((a,b)=>b.date.localeCompare(a.date)); const attendanceHistory = attendanceRecords.filter(a => a.studentId === student.id).sort((a,b)=>b.date.localeCompare(a.date)); const totalPaid = paymentHistory.reduce((sum,p)=>sum+p.amount,0); return <Modal title="Student profile" onClose={()=>setViewingStudent(null)}><div className="max-h-[76vh] space-y-4 overflow-y-auto pr-1"><div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">{student.photo ? <img src={student.photo} alt="" className="h-14 w-14 rounded-full object-cover"/> : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8eef4] text-sm font-bold text-[#244d73]">{student.name.split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase()}</div>}<div><h4 className="text-sm font-bold text-slate-900">{student.name}</h4><p className="text-[10px] text-slate-500">{student.id} · {branchName(student.branchId)}</p><span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">{student.status}</span></div></div><div><h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Personal information</h4><div className="grid grid-cols-2 gap-2 text-[10px]">{[["Mobile",student.phone],["Alternate",student.alternatePhone||"—"],["Father / guardian",student.fatherName||"—"],["Date of birth",student.dob||"—"],["Gender",student.gender||"—"],["Emergency contact",student.emergencyContact||"—"],["Address",student.address||"—"],["Qualification",student.qualification||"—"],["Admission date",student.admissionDate]].map(([k,v])=><div key={k} className="rounded-lg border border-slate-100 p-2"><p className="text-slate-400">{k}</p><p className="mt-1 font-medium text-slate-700">{v}</p></div>)}</div></div><div><h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Membership history</h4>{history.length ? <div className="space-y-2">{history.map(m=><div key={m.id} className="flex justify-between gap-2 rounded-lg border border-slate-100 p-2 text-[10px]"><div><p className="font-semibold text-slate-700">{plans.find(p=>p.id===m.planId)?.name||"Membership"}</p><p className="mt-1 text-slate-400">{m.startDate} to {m.endDate}</p></div><p className="font-semibold">₹{m.fee.toLocaleString("en-IN")}</p></div>)}</div>:<p className="text-[10px] text-slate-400">No membership records.</p>}</div><div className="grid grid-cols-2 gap-2"><div className="rounded-lg bg-slate-50 p-3"><p className="text-[9px] text-slate-400">Total paid</p><p className="mt-1 text-base font-bold">₹{totalPaid.toLocaleString("en-IN")}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-[9px] text-slate-400">Attendance records</p><p className="mt-1 text-base font-bold">{attendanceHistory.length}</p></div></div><div><h4 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">Recent payments</h4>{paymentHistory.length ? paymentHistory.slice(0,5).map(p=><div key={p.id} className="flex justify-between border-b border-slate-100 py-2 text-[10px]"><span>{p.date} · {p.method}</span><span className="font-semibold">₹{p.amount.toLocaleString("en-IN")}</span></div>):<p className="text-[10px] text-slate-400">No payments recorded.</p>}</div><div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-3"><button onClick={()=>printStudentSummary(student)} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600">Print profile</button><button onClick={()=>{setViewingStudent(null);editStudent(student);}} className="rounded-lg bg-[#244d73] px-3 py-2 text-[10px] font-semibold text-white">Edit student</button></div><p className="text-[9px] leading-4 text-amber-700">Demo only. Uploaded documents are stored locally in this browser and are not securely hosted.</p></div></Modal>; })()}

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
