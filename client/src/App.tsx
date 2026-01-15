import React, { useState, useEffect } from 'react';
import {
    Users,
    BookOpen,
    GraduationCap,
    LayoutDashboard,
    PlusCircle,
    RefreshCcw,
    Database as DbIcon,
    Search,
    Bell,
    Moon,
    ShieldCheck,
    Zap,
    HardDrive,
    Cpu,
    Globe,
    Monitor,
    Hexagon,
    Terminal,
    Play,
    Table as TableIcon,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Edit2
} from 'lucide-react';
import { getStudents, getCourses, getEnrollments, executeQuery } from './api';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [students, setStudents] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currTime, setCurrTime] = useState(new Date().toLocaleTimeString());

    // SQL Console state
    const [sqlQuery, setSqlQuery] = useState('SELECT * FROM Students');
    const [queryResult, setQueryResult] = useState<any>(null);
    const [queryError, setQueryError] = useState<string | null>(null);

    // Form states
    const [studentName, setStudentName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sRes, cRes, eRes] = await Promise.all([
                getStudents(),
                getCourses(),
                getEnrollments()
            ]);
            if (sRes.success) setStudents(sRes.data || []);
            if (cRes.success) setCourses(cRes.data || []);
            if (eRes.success) setEnrollments(eRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => setCurrTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleRunSQL = async () => {
        setLoading(true);
        setQueryError(null);
        setQueryResult(null);
        try {
            const res = await executeQuery(sqlQuery);
            if (res.success) {
                setQueryResult(res.data);
                fetchData(); // Refresh underlying data if it was a mutation
            } else {
                setQueryError(res.message);
            }
        } catch (err: any) {
            setQueryError(err.message || 'Execution failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteStudent = async (id: number) => {
        if (!confirm('Delete this student and all their enrollments?')) return;
        setLoading(true);
        try {
            await executeQuery(`DELETE FROM Enrollments WHERE student_id = ${id}`);
            const res = await executeQuery(`DELETE FROM Students WHERE id = ${id}`);
            if (res.success) fetchData();
            else alert(res.message);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStudent = async (id: number, currentName: string) => {
        const newName = prompt('Enter new name for student:', currentName);
        if (!newName || newName === currentName) return;
        setLoading(true);
        try {
            const res = await executeQuery(`UPDATE Students SET name = '${newName}' WHERE id = ${id}`);
            if (res.success) fetchData();
            else alert(res.message);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEnrollment = async (studentId: number, courseId: number) => {
        setLoading(true);
        try {
            const res = await executeQuery(`DELETE FROM Enrollments WHERE student_id = ${studentId} AND course_id = ${courseId}`);
            if (res.success) fetchData();
            else alert(res.message);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderDashboard = () => (
        <div className="fade-in">
            <div className="section-title flex items-center gap-2 mb-4">
                <Zap size={18} className="text-cyan" />
                <h2 className="uppercase text-xs font-bold tracking-widest">Dashboard</h2>
                <div className="status-pill ml-auto">ACTIVE ENGINE</div>
            </div>

            <div className="overview-row">
                <div className="glass-card stat-card" style={{ gridColumn: 'span 3' }}>
                    <div className="flex justify-between items-center">
                        <span className="stat-label">Total Records</span>
                        <DatabaseIcon color="cyan" />
                    </div>
                    <div className="stat-value text-cyan">{students.length + courses.length + enrollments.length}</div>
                    <p className="text-[10px] text-dim">Active in Storage</p>
                    <div className="progress-container"><div className="progress-bar bg-cyan" style={{ width: `${Math.min(100, (students.length + courses.length + enrollments.length) * 5)}%` }}></div></div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="col-left">
                    <div className="glass-card mb-6">
                        <h3 className="mb-4 uppercase text-xs font-bold text-dim tracking-widest flex items-center gap-2">
                            <TableIcon size={16} className="text-cyan" /> Persistence Monitor
                        </h3>
                        <div className="table-container">
                            <table className="nexus-table">
                                <thead>
                                    <tr>
                                        <th>Table</th>
                                        <th>Count</th>
                                        <th>Storage Format</th>
                                        <th style={{ textAlign: 'right' }}>Integrity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="font-bold">Students</td>
                                        <td>{students.length}</td>
                                        <td>JSON / Flat</td>
                                        <td style={{ textAlign: 'right' }}><CheckCircle2 size={14} className="text-green inline" /> PK</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Courses</td>
                                        <td>{courses.length}</td>
                                        <td>JSON / Flat</td>
                                        <td style={{ textAlign: 'right' }}><CheckCircle2 size={14} className="text-green inline" /> PK</td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Enrollments</td>
                                        <td>{enrollments.length}</td>
                                        <td>JSON / Linked</td>
                                        <td style={{ textAlign: 'right' }}><CheckCircle2 size={14} className="text-green inline" /> FK</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="glass-card">
                        <h3 className="mb-4 uppercase text-xs font-bold text-dim tracking-widest flex items-center gap-2">
                            <AlertCircle size={16} className="text-purple" /> Active Join Registry (Inner Join)
                        </h3>
                        <div className="table-container" style={{ maxHeight: '250px' }}>
                            <table className="nexus-table">
                                <thead>
                                    <tr>
                                        <th>Student Relation</th>
                                        <th>Target Course</th>
                                        <th style={{ textAlign: 'right' }}>Relational Sync</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollments.length === 0 ? (
                                        <tr><td colSpan={3} className="text-center text-dim py-8">
                                            <DbIcon size={24} className="mb-2 opacity-20" />
                                            <div>No active relational JOIN data</div>
                                        </td></tr>
                                    ) : (
                                        enrollments.map((en, i) => (
                                            <tr key={i}>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 rounded-md bg-cyan/5 border border-cyan/10">
                                                            <Users size={14} className="text-cyan" />
                                                        </div>
                                                        <span className="font-medium">{en['Students.name']}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 rounded-md bg-purple/5 border border-purple/10">
                                                            <BookOpen size={14} className="text-purple" />
                                                        </div>
                                                        <span className="text-muted">{en['Courses.title']}</span>
                                                    </div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className="status-pill success">Joined & Validated</span>
                                                        <Trash2 size={14} className="text-dim hover:text-red-500 cursor-pointer" onClick={() => handleDeleteEnrollment(en['Enrollments.student_id'], en['Enrollments.course_id'])} />
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="col-right">
                    <div className="glass-card mb-6 text-center">
                        <h2 className="text-4xl font-light text-cyan mb-1">{currTime}</h2>
                        <p className="text-xs text-dim">LIVE ENGINE CONTEXT</p>
                    </div>

                    <div className="glass-card">
                        <h3 className="stat-label mb-4">Functional Checks</h3>
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_var(--accent-green)]"></div>
                                <span className="text-xs">File System Persistence</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green shadow-[0_0_8px_var(--accent-green)]"></div>
                                <span className="text-xs">Unique Key Enforcement</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-blue shadow-[0_0_8px_var(--accent-blue)]"></div>
                                <span className="text-xs">Inner Join Executor</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-cyan shadow-[0_0_8px_var(--accent-cyan)]"></div>
                                <span className="text-xs">API Query Bridge</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card mt-6">
                        <button className="btn-execute w-full justify-center" onClick={() => setActiveTab('sql')}>
                            <Terminal size={18} /> Open SQL Terminal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSQLConsole = () => (
        <div className="fade-in console-container">
            <div className="console-header">
                <div className="flex items-center gap-2">
                    <Terminal className="text-cyan" size={20} />
                    <h2 className="uppercase text-sm font-bold tracking-widest">Nexus SQL Terminal</h2>
                </div>
                <button className="btn-execute" onClick={handleRunSQL} disabled={loading}>
                    {loading ? <RefreshCcw size={16} className="spin" /> : <Play size={16} />}
                    Execute Query
                </button>
            </div>

            <div className="console-editor-wrap">
                <textarea
                    className="console-editor"
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="Type your SQL query here... (e.g., SELECT * FROM Students)"
                />
            </div>

            <div className="result-pane">
                <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-xs uppercase font-bold text-dim tracking-widest">Execution Result</span>
                    {queryResult && <span className="text-[10px] text-green">Query Successful</span>}
                    {queryError && <span className="text-[10px] text-error">Execution Error</span>}
                </div>

                {!queryResult && !queryError && (
                    <div className="flex flex-col items-center justify-center h-48 text-dim">
                        <Monitor size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">Enter a query and press Execute</p>
                    </div>
                )}

                {queryError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-error text-sm font-mono">
                        {queryError}
                    </div>
                )}

                {queryResult && (
                    <div className="table-container">
                        <table className="nexus-table">
                            <thead>
                                <tr>
                                    {Object.keys(queryResult[0] || {}).map(k => <th key={k}>{k}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {queryResult.length === 0 ? (
                                    <tr><td className="text-center py-4 text-dim">Empty Result Set</td></tr>
                                ) : (
                                    queryResult.map((row: any, i: number) => (
                                        <tr key={i}>
                                            {Object.values(row).map((v: any, j: number) => <td key={j}>{String(v)}</td>)}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
    const renderDataMgmt = () => (
        <div className="fade-in">
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="glass-card">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                        <PlusCircle size={18} className="text-cyan" /> Register Student
                    </h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        executeQuery(`INSERT INTO Students (id, name) VALUES (${studentId}, '${studentName}')`).then(res => {
                            if (res.success) {
                                setStudentId('');
                                setStudentName('');
                                fetchData();
                            } else alert(res.message);
                        });
                    }}>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-dim">Student ID (Primary Key)</label>
                                <input className="search-bar w-full py-2 px-3 text-sm" style={{ borderRadius: '8px' }} value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-dim">Full Name</label>
                                <input className="search-bar w-full py-2 px-3 text-sm" style={{ borderRadius: '8px' }} value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
                            </div>
                            <button className="btn-execute justify-center py-3">INSERT INTO Students</button>
                        </div>
                    </form>
                </div>

                <div className="glass-card">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                        <GraduationCap size={18} className="text-purple" /> Course Enrollment
                    </h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!selectedStudentId || !selectedCourseId) return;
                        const res = await executeQuery(`INSERT INTO Enrollments (student_id, course_id) VALUES (${selectedStudentId}, ${selectedCourseId})`);
                        if (res.success) fetchData();
                        else alert(res.message);
                    }}>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-dim">Student Source</label>
                                <select className="search-bar w-full py-2 px-3 text-sm bg-[#050a14]" style={{ borderRadius: '8px', appearance: 'auto' }} value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} required>
                                    <option value="">-- Select Student --</option>
                                    {students.map(s => <option key={s.id} value={s.id}>{s.name} (PK:{s.id})</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs text-dim">Target Course</label>
                                <select className="search-bar w-full py-2 px-3 text-sm bg-[#050a14]" style={{ borderRadius: '8px', appearance: 'auto' }} value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required>
                                    <option value="">-- Select Course --</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                            </div>
                            <button className="btn-execute justify-center py-3" style={{ background: 'var(--accent-purple)', color: 'white' }}>INSERT INTO Enrollments</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-8 grid-2">
                <div className="glass-card">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Table: Students</h3>
                    <div className="table-container" style={{ maxHeight: '300px' }}>
                        <table className="nexus-table">
                            <thead><tr><th>ID</th><th>Name</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                            <tbody>
                                {students.map(s => (
                                    <tr key={s.id}>
                                        <td>{s.id}</td>
                                        <td>{s.name}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div className="flex gap-2 justify-end">
                                                <Edit2 size={14} className="text-cyan cursor-pointer" onClick={() => handleUpdateStudent(s.id, s.name)} />
                                                <Trash2 size={14} className="text-error cursor-pointer" onClick={() => handleDeleteStudent(s.id)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="glass-card">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Table: Courses</h3>
                    <div className="table-container" style={{ maxHeight: '300px' }}>
                        <table className="nexus-table">
                            <thead><tr><th>ID</th><th>Title</th></tr></thead>
                            <tbody>
                                {courses.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.title}</td></tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );


    const renderConstraints = () => (
        <div className="fade-in">
            <div className="section-title flex items-center gap-2 mb-6">
                <ShieldCheck size={18} className="text-purple" />
                <h2 className="uppercase text-xs font-bold tracking-widest">Data Integrity Constraints</h2>
            </div>

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="glass-card">
                    <h3 className="text-sm font-bold text-cyan mb-4 flex items-center gap-2">
                        <CheckCircle2 size={16} /> Primary Key (PK)
                    </h3>
                    <p className="text-xs text-muted mb-4 leading-relaxed">
                        Ensures that each record in a table is unique and not null. In Nexus DB, PKs are indexed via Hash Tables for O(1) retrieval.
                    </p>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase text-dim">Tables Affected</span>
                            <span className="text-[10px] text-green">Enforced</span>
                        </div>
                        <ul className="text-xs list-disc list-inside text-cyan/80">
                            <li>Students (id)</li>
                            <li>Courses (id)</li>
                        </ul>
                    </div>
                </div>

                <div className="glass-card">
                    <h3 className="text-sm font-bold text-purple mb-4 flex items-center gap-2">
                        <AlertCircle size={16} /> Foreign Key (FK)
                    </h3>
                    <p className="text-xs text-muted mb-4 leading-relaxed">
                        Preserves referential integrity by ensuring records in child tables exist in the parent tables. Nexus DB uses manual relational sync for O(N) joins.
                    </p>
                    <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold uppercase text-dim">Tables Affected</span>
                            <span className="text-[10px] text-purple">Relational</span>
                        </div>
                        <ul className="text-xs list-disc list-inside text-purple/80">
                            <li>Enrollments (student_id \u2192 Students.id)</li>
                            <li>Enrollments (course_id \u2192 Courses.id)</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="glass-card mt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Cpu size={16} className="text-green" /> Constraint Logic Engine
                </h3>
                <div className="table-container">
                    <table className="nexus-table">
                        <thead>
                            <tr>
                                <th>Constraint Type</th>
                                <th>Verification Cycle</th>
                                <th>State</th>
                                <th style={{ textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Unique Index</td>
                                <td>Pre-Insert Hook</td>
                                <td><span className="status-pill success">Active</span></td>
                                <td style={{ textAlign: 'right' }}><RefreshCcw size={12} className="text-dim hover:text-cyan cursor-pointer" /></td>
                            </tr>
                            <tr>
                                <td>Type Validation</td>
                                <td>Schema-on-Write</td>
                                <td><span className="status-pill success">Active</span></td>
                                <td style={{ textAlign: 'right' }}><RefreshCcw size={12} className="text-dim hover:text-cyan cursor-pointer" /></td>
                            </tr>
                            <tr>
                                <td>Existence Check</td>
                                <td>Relational Sync</td>
                                <td><span className="status-pill success">Active</span></td>
                                <td style={{ textAlign: 'right' }}><RefreshCcw size={12} className="text-dim hover:text-cyan cursor-pointer" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="nexus-layout">
            <aside className="nexus-sidebar">
                <div className="sidebar-logo">
                    <Hexagon className="logo-icon" />
                    <h1 className="text-xl font-bold tracking-tight">NEXUS <span className="text-cyan">DB</span></h1>
                </div>

                <nav className="sidebar-nav">
                    <div className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </div>
                    <div className={`nav-link ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>
                        <DbIcon size={18} />
                        <span>RDBMS Engine</span>
                    </div>
                    <div className={`nav-link ${activeTab === 'sql' ? 'active' : ''}`} onClick={() => setActiveTab('sql')}>
                        <Terminal size={18} />
                        <span>SQL Terminal</span>
                    </div>
                    <div className={`nav-link ${activeTab === 'constraints' ? 'active' : ''}`} onClick={() => setActiveTab('constraints')}>
                        <ShieldCheck size={18} />
                        <span>Constraints</span>
                    </div>
                </nav>

                <div className="mt-auto p-4 flex flex-col gap-4">
                    <div>
                        <div className="stat-label mb-2">IO Throughput</div>
                        <div className="progress-container h-1"><div className="progress-bar bg-cyan" style={{ width: '64%' }}></div></div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-blue to-accent-cyan flex gap-0 items-center justify-center text-[10px] font-bold text-darkest">JD</div>
                        <div>
                            <p className="text-[10px] font-bold">Admin Root</p>
                            <p className="text-[8px] text-dim uppercase tracking-tighter">Authorized</p>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="nexus-main">
                <header className="main-header">
                    <div className="search-bar">
                        <Search size={16} className="text-dim" />
                        <input type="text" placeholder="Query schemas..." />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="time-display text-sm font-mono text-cyan bg-cyan/5 px-3 py-1 rounded-full border border-cyan/20">
                            {currTime}
                        </div>
                        <Bell size={18} className="text-dim cursor-pointer hover:text-white transition-colors" />
                        <div className="w-8 h-8 rounded-full border border-border-subtle bg-bg-card flex items-center justify-center">
                            <Monitor size={14} className="text-accent-blue" />
                        </div>
                    </div>
                </header>

                {activeTab === 'dashboard' ? renderDashboard() :
                    activeTab === 'data' ? renderDataMgmt() :
                        activeTab === 'sql' ? renderSQLConsole() :
                            renderConstraints()}
            </main>
        </div>
    );
}

// Helper icons
const DatabaseIcon = ({ color }: { color: string }) => (
    <div className={`p-2 rounded-lg bg-${color}/10`}>
        <DbIcon size={14} className={`text-${color}`} />
    </div>
);

export default App;
