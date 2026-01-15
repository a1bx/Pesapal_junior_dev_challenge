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
    Edit2,
    History,
    Activity,
    X,
    Info,
    HelpCircle
} from 'lucide-react';
import { getStudents, getCourses, getEnrollments, getLogs, executeQuery } from './api';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [students, setStudents] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
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

    // Modal state
    const [modal, setModal] = useState<{ show: boolean, title: string, message: string, onConfirm?: () => void, type: 'alert' | 'confirm' }>({
        show: false,
        title: '',
        message: '',
        type: 'alert'
    });

    const showAlert = (title: string, message: string) => setModal({ show: true, title, message, type: 'alert' });
    const showConfirm = (title: string, message: string, onConfirm: () => void) => setModal({ show: true, title, message, onConfirm, type: 'confirm' });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sRes, cRes, eRes, lRes] = await Promise.all([
                getStudents(),
                getCourses(),
                getEnrollments(),
                getLogs()
            ]);
            if (sRes.success) setStudents(sRes.data || []);
            if (cRes.success) setCourses(cRes.data || []);
            if (eRes.success) setEnrollments(eRes.data || []);
            if (lRes.success) setLogs(lRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => {
            setCurrTime(new Date().toLocaleTimeString());
            // Periodically refresh logs for dashboard
            if (activeTab === 'dashboard') {
                getLogs().then(res => { if (res.success) setLogs(res.data || []); });
            }
        }, 3000);
        const timeInterval = setInterval(() => setCurrTime(new Date().toLocaleTimeString()), 1000);
        return () => { clearInterval(interval); clearInterval(timeInterval); };
    }, [activeTab]);

    const handleRunSQL = async () => {
        setLoading(true);
        setQueryError(null);
        setQueryResult(null);
        try {
            const res = await executeQuery(sqlQuery);
            if (res.success) {
                setQueryResult(res.data);
                fetchData();
                showAlert('Query Successful', res.message || 'The command was executed successfully.');
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
        showConfirm('Delete Student', 'This will remove the student and all their course enrollments permanently.', async () => {
            setLoading(true);
            try {
                await executeQuery(`DELETE FROM Enrollments WHERE student_id = ${id}`);
                const res = await executeQuery(`DELETE FROM Students WHERE id = ${id}`);
                if (res.success) fetchData();
                else showAlert('Constraint Violation', res.message);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        });
    };

    const handleUpdateStudent = async (id: number, currentName: string) => {
        const newName = prompt('Enter new name for student:', currentName);
        if (!newName || newName === currentName) return;
        setLoading(true);
        try {
            const res = await executeQuery(`UPDATE Students SET name = '${newName}' WHERE id = ${id}`);
            if (res.success) fetchData();
            else showAlert('Update Failed', res.message);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEnrollment = async (studentId: number, courseId: number) => {
        showConfirm('Delete Enrollment', 'Remove this student from the course registry?', async () => {
            setLoading(true);
            try {
                const res = await executeQuery(`DELETE FROM Enrollments WHERE student_id = ${studentId} AND course_id = ${courseId}`);
                if (res.success) fetchData();
                else showAlert('Delete Failed', res.message);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        });
    };

    const renderDashboard = () => (
        <div className="fade-in">
            <div className="section-title flex items-center gap-2 mb-4">
                <Zap size={18} className="text-cyan" />
                <h2 className="uppercase text-xs font-bold tracking-widest">Dashboard</h2>
                <div className="status-pill ml-auto">ACTIVE ENGINE</div>
            </div>

            <div className="overview-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="glass-card">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-dim uppercase">Students</span>
                        <Users size={14} className="text-cyan" />
                    </div>
                    <div className="text-xl font-bold">{students.length}</div>
                </div>
                <div className="glass-card">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-dim uppercase">Courses</span>
                        <BookOpen size={14} className="text-purple" />
                    </div>
                    <div className="text-xl font-bold">{courses.length}</div>
                </div>
                <div className="glass-card">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-dim uppercase">Enrollments</span>
                        <Activity size={14} className="text-green" />
                    </div>
                    <div className="text-xl font-bold">{enrollments.length}</div>
                </div>
                <div className="glass-card">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-dim uppercase">Logs</span>
                        <History size={14} className="text-blue" />
                    </div>
                    <div className="text-xl font-bold">{logs.length}</div>
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
                                        <th>Sync</th>
                                        <th style={{ textAlign: 'right' }}>Integrity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="font-bold">Students</td>
                                        <td>{students.length}</td>
                                        <td><CheckCircle2 size={12} className="text-green inline mr-1" /> Live</td>
                                        <td style={{ textAlign: 'right' }}><span className="status-pill success text-[8px]">PK</span></td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Courses</td>
                                        <td>{courses.length}</td>
                                        <td><CheckCircle2 size={12} className="text-green inline mr-1" /> Live</td>
                                        <td style={{ textAlign: 'right' }}><span className="status-pill success text-[8px]">PK</span></td>
                                    </tr>
                                    <tr>
                                        <td className="font-bold">Enrollments</td>
                                        <td>{enrollments.length}</td>
                                        <td><CheckCircle2 size={12} className="text-green inline mr-1" /> Live</td>
                                        <td style={{ textAlign: 'right' }}><span className="status-pill success text-[8px]">FK</span></td>
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
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {enrollments.length === 0 ? (
                                        <tr><td colSpan={3} className="text-center text-dim py-8">No active relational JOIN data</td></tr>
                                    ) : (
                                        enrollments.map((en, i) => (
                                            <tr key={i}>
                                                <td><span className="font-medium">{en['name'] || en['Students.name']}</span></td>
                                                <td><span className="text-muted">{en['title'] || en['Courses.title']}</span></td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <Trash2 size={14} className="text-dim hover:text-red-500 cursor-pointer ml-auto" onClick={() => handleDeleteEnrollment(en['student_id'] || en['Enrollments.student_id'], en['course_id'] || en['Enrollments.course_id'])} />
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
                    <div className="glass-card mb-6">
                        <h3 className="mb-4 uppercase text-xs font-bold text-dim tracking-widest flex items-center gap-2">
                            <History size={16} className="text-blue" /> System Activity Logs
                        </h3>
                        <div className="log-list">
                            {logs.length === 0 ? <p className="text-xs text-dim italic">No logs recorded yet.</p> :
                                logs.map(log => (
                                    <div key={log.id} className="log-item">
                                        <div className="log-time">{log.timestamp.split('T')[1].split('.')[0]}</div>
                                        <div className="log-msg">{log.event}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div className="glass-card">
                        <h3 className="stat-label mb-4 text-xs font-bold uppercase tracking-widest">RDBMS Health</h3>
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-dim">Storage Latency</span>
                                <span className="text-xs text-cyan">2.4ms</span>
                            </div>
                            <div className="progress-container h-1"><div className="progress-bar bg-cyan" style={{ width: '12%' }}></div></div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-dim">CPU Load</span>
                                <span className="text-xs text-cyan">0.8%</span>
                            </div>
                            <div className="progress-container h-1"><div className="progress-bar bg-cyan" style={{ width: '4%' }}></div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSQLConsole = () => (
        <div className="fade-in console-container">
            <div className="console-header flex items-center justify-between mb-4">
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
                    placeholder="Type your SQL query here..."
                />
            </div>

            <div className="result-pane mt-4">
                <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-xs uppercase font-bold text-dim tracking-widest">Execution Result</span>
                </div>
                {queryError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-xs font-mono">
                        {queryError}
                    </div>
                )}
                {queryResult && (
                    <div className="table-container">
                        <table className="nexus-table">
                            <thead>
                                <tr>{Object.keys(queryResult[0] || {}).map(k => <th key={k}>{k}</th>)}</tr>
                            </thead>
                            <tbody>
                                {queryResult.map((row: any, i: number) => (
                                    <tr key={i}>{Object.values(row).map((v: any, j: number) => <td key={j}>{String(v)}</td>)}</tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderDataMgmt = () => (
        <div className="fade-in">
            <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-card">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                        <PlusCircle size={18} className="text-cyan" /> Add Student (CREATE)
                    </h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        const res = await executeQuery(`INSERT INTO Students (id, name) VALUES (${studentId}, '${studentName}')`);
                        if (res.success) { setStudentId(''); setStudentName(''); fetchData(); showAlert('Success', 'Student record created.'); }
                        else showAlert('Creation Error', res.message);
                    }}>
                        <div className="flex flex-col gap-4">
                            <input className="search-bar w-full py-2 px-3 text-sm" placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
                            <input className="search-bar w-full py-2 px-3 text-sm" placeholder="Full Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} required />
                            <button className="btn-execute justify-center py-3">INSERT RECORD</button>
                        </div>
                    </form>
                </div>

                <div className="glass-card">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                        <GraduationCap size={18} className="text-purple" /> Enrolment (JOIN)
                    </h2>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        if (!selectedStudentId || !selectedCourseId) return;
                        const res = await executeQuery(`INSERT INTO Enrollments (student_id, course_id) VALUES (${selectedStudentId}, ${selectedCourseId})`);
                        if (res.success) fetchData();
                        else showAlert('Enrollment Failed', res.message);
                    }}>
                        <div className="flex flex-col gap-4">
                            <select className="search-bar w-full py-2 px-3 text-sm bg-[#050a14]" value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} required>
                                <option value="">-- Select Student --</option>
                                {students.map(s => <option key={s.id} value={s.id}>{s.name} (ID:{s.id})</option>)}
                            </select>
                            <select className="search-bar w-full py-2 px-3 text-sm bg-[#050a14]" value={selectedCourseId} onChange={(e) => setSelectedCourseId(e.target.value)} required>
                                <option value="">-- Select Course --</option>
                                {courses.map(c => <option key={c.id} value={c.id}>{c.title} (Cap: {c.capacity || 10})</option>)}
                            </select>
                            <button className="btn-execute justify-center py-3" style={{ background: 'var(--accent-purple)', color: 'white' }}>CREATE ENROLLMENT</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mt-8 grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass-card">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">Table: Students</h3>
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
                                                <Edit2 size={13} className="text-dim hover:text-cyan cursor-pointer" onClick={() => handleUpdateStudent(s.id, s.name)} />
                                                <Trash2 size={13} className="text-dim hover:text-red-500 cursor-pointer" onClick={() => handleDeleteStudent(s.id)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className="glass-card">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4">Table: Courses</h3>
                    <div className="table-container" style={{ maxHeight: '300px' }}>
                        <table className="nexus-table">
                            <thead><tr><th>ID</th><th>Title</th><th>Capacity</th></tr></thead>
                            <tbody>
                                {courses.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.title}</td><td>{c.capacity || 10}</td></tr>)}
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
                    <h3 className="text-sm font-bold text-cyan mb-4 flex items-center gap-2"><CheckCircle2 size={16} /> Primary Key (PK)</h3>
                    <p className="text-xs text-muted leading-relaxed">Ensures that each record in a table is unique and not null. Enforced on [Students.id] and [Courses.id].</p>
                </div>
                <div className="glass-card">
                    <h3 className="text-sm font-bold text-purple mb-4 flex items-center gap-2"><AlertCircle size={16} /> Foreign Key (FK)</h3>
                    <p className="text-xs text-muted leading-relaxed">Preserves referential integrity between Enrollments and parent tables. Enforced via relational validation.</p>
                </div>
            </div>
            <div className="glass-card mt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest mb-4">Business Logic: Capacity Enforcement</h3>
                <p className="text-xs text-dim mb-4">The engine now validates course capacity during enrollment. If seats \u2265 capacity, the INSERT is rejected.</p>
                <div className="p-4 bg-cyan/5 border border-cyan/10 rounded-lg font-mono text-[10px] text-cyan">
                    if (current_enrolments \u2265 course.capacity) return ERROR_COURSE_FULL;
                </div>
            </div>
        </div>
    );

    return (
        <div className="nexus-layout">
            {modal.show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                                {modal.type === 'confirm' ? <HelpCircle className="text-purple" size={18} /> : <Info className="text-cyan" size={18} />}
                                {modal.title}
                            </h3>
                            <X size={18} className="text-dim cursor-pointer hover:text-white" onClick={() => setModal({ ...modal, show: false })} />
                        </div>
                        <p className="text-sm text-muted mb-8 leading-relaxed">{modal.message}</p>
                        <div className="flex gap-4 justify-end">
                            {modal.type === 'confirm' && (
                                <button className="btn-execute" style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'white' }} onClick={() => setModal({ ...modal, show: false })}>
                                    CANCEL
                                </button>
                            )}
                            <button className="btn-execute" onClick={() => {
                                if (modal.onConfirm) modal.onConfirm();
                                setModal({ ...modal, show: false });
                            }}>
                                {modal.type === 'confirm' ? 'PROCEED' : 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <aside className="nexus-sidebar">
                <div className="sidebar-logo">
                    <Hexagon className="logo-icon" />
                    <h1 className="text-xl font-bold tracking-tight">NEXUS <span className="text-cyan">DB</span></h1>
                </div>
                <nav className="sidebar-nav">
                    <div className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}><LayoutDashboard size={18} /><span>Dashboard</span></div>
                    <div className={`nav-link ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}><DbIcon size={18} /><span>RDBMS Engine</span></div>
                    <div className={`nav-link ${activeTab === 'sql' ? 'active' : ''}`} onClick={() => setActiveTab('sql')}><Terminal size={18} /><span>SQL Terminal</span></div>
                    <div className={`nav-link ${activeTab === 'constraints' ? 'active' : ''}`} onClick={() => setActiveTab('constraints')}><ShieldCheck size={18} /><span>Constraints</span></div>
                </nav>
            </aside>

            <main className="nexus-main">
                <header className="main-header">
                    <div className="search-bar"><Search size={16} className="text-dim" /><input type="text" placeholder="Query schemas..." /></div>
                    <div className="flex items-center gap-6">
                        <div className="time-display text-sm font-mono text-cyan bg-cyan/5 px-3 py-1 rounded-full border border-cyan/20">{currTime}</div>
                        <div className="w-8 h-8 rounded-full border border-border-subtle bg-bg-card flex items-center justify-center"><Monitor size={14} className="text-accent-blue" /></div>
                    </div>
                </header>
                <div className="content-area">
                    {activeTab === 'dashboard' ? renderDashboard() :
                        activeTab === 'data' ? renderDataMgmt() :
                            activeTab === 'sql' ? renderSQLConsole() :
                                renderConstraints()}
                </div>
            </main>
        </div>
    );
};

export default App;
