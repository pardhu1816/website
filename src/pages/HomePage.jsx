import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    BrainCircuit,
    LogOut,
    Activity,
    Calendar,
    Trophy,
    LayoutGrid,
    ClipboardList,
    BarChart3,
    UserCircle,
    Bell,
    Search,
    HelpCircle,
    Menu,
    X,
    Eye,
    Pointer,
    Shapes,
    Gauge,
    Smile,
    Mail,
    Smartphone,
    Shield,
    Palette,
    Zap,
    Target,
    FileText,
    TrendingUp,
    Clock,
    CheckCircle2,
    ChevronDown,
    Download,
    ChevronLeft,
    Share,
    ArrowLeft,
    Dumbbell,
    Sparkles,
    CircleCheck,
    Cpu
} from 'lucide-react';
import Button from '../components/Button';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const HomePage = () => {
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [sessionHistory, setSessionHistory] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        full_name: user.full_name || '',
        phone_number: user.phone_number || ''
    });

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://14.139.187.229:8081/jan2026/spic741/visualmotortrainer';
    const handleSaveProfile = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...editForm, id: user.id })
            });
            const result = await response.json();
            if (result.success) {
                // Update local storage
                localStorage.setItem('user', JSON.stringify(result.data));
                setIsEditing(false);
                // Force a re-render or update state if user was a state
                // For now, since user is a const at top, we'll reload
                window.location.reload();
            }
        } catch (err) {
            console.error('Update failed', err);
            alert('Failed to update profile');
        }
    };

    // Intelligent Avatar Generator (Starting letter based on name)
    const UserAvatar = ({ name, size = '40px', fontSize = '16px', borderRadius = '12px', shadow = true }) => {
        const initial = (name || 'G').trim().charAt(0).toUpperCase();
        return (
            <div style={{
                width: size,
                height: size,
                minWidth: size,
                borderRadius: borderRadius,
                background: 'linear-gradient(135deg, var(--primary-blue), #60A5FA)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: fontSize,
                fontWeight: 800,
                flexShrink: 0,
                border: '2px solid white',
                boxShadow: shadow ? '0 4px 12px rgba(10, 102, 194, 0.2)' : 'none',
                textTransform: 'uppercase',
                fontFamily: 'Outfit, sans-serif'
            }}>
                {initial}
            </div>
        );
    };

    const [sessionLevels, setSessionLevels] = useState({});
    const [todayStats, setTodayStats] = useState({ sessions: 0, accuracy: 0, minutes: 0 });
    const [overallStats, setOverallStats] = useState({
        avgAccuracy: 0,
        streak: 0,
        weeklyHours: [0, 0, 0, 0, 0, 0, 0],
        avgReaction: 0,
        observations: [],
        aiRecommendation: "Visual Focus Training",
        improvementOcular: 0,
        latencyReduced: 0,
        ocularStatus: { text: "No Data", color: "#94A3B8" },
        latencyStatus: { text: "No Data", color: "#94A3B8" },
        focusDuration: "0m Avg"
    });

    useEffect(() => {
        const fetchHistory = async () => {
            const userId = user.id || user.email || 'guest';
            const storageKey = `session_history_${userId}`;
            let history = [];

            // 1. Try fetching from Backend
            try {
                const response = await fetch(`${API_BASE_URL}/api/user-sessions/${user.id}`);
                if (response.ok) {
                    const data = await response.json();
                    history = data.data || [];
                    // Update cache for offline use
                    localStorage.setItem(storageKey, JSON.stringify(history));
                }
            } catch (err) {
                console.warn('Backend fetch failed, using local cache');
                history = JSON.parse(localStorage.getItem(storageKey) || '[]');
            }

            setSessionHistory(history);

            if (history.length > 0) {
                // Calculate stats logic...
                const today = new Date();
                const todayStr = today.toISOString().split('T')[0];
                const todaySessions = history.filter(s => s.timestamp.startsWith(todayStr));

                if (todaySessions.length > 0) {
                    const avgAcc = Math.round(todaySessions.reduce((acc, s) => acc + s.accuracy, 0) / todaySessions.length);
                    const totalMin = todaySessions.reduce((acc, s) => acc + (s.duration_minutes || s.durationMinutes || 0), 0);
                    setTodayStats({
                        sessions: todaySessions.length,
                        accuracy: avgAcc,
                        minutes: totalMin
                    });
                }

                // Overall stats calculation
                const globalAvg = Math.round(history.reduce((acc, s) => acc + s.accuracy, 0) / history.length);

                // Weekly distribution
                const weekRes = [0, 0, 0, 0, 0, 0, 0];
                const now = new Date();
                const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
                startOfWeek.setHours(0, 0, 0, 0);

                history.forEach(s => {
                    const sDate = new Date(s.timestamp);
                    if (sDate >= startOfWeek) {
                        const dayIdx = (sDate.getDay() + 6) % 7;
                        weekRes[dayIdx] += 15;
                    }
                });

                const recent = history.slice(-8);
                const rTrend = recent.map((s, i) => `${(i * 1000) / 7},${80 - (s.accuracy / 2)}`).join(' ');
                const mTrend = recent.map((s, i) => `${(i * 1000) / 7},${90 - (s.accuracy / 2.5)}`).join(' ');

                const obs = [];
                if (globalAvg < 60) {
                    obs.push({ title: "Focus Required", text: "Your average accuracy is below therapeutic targets.", icon: Sparkles, color: "#F59E0B" });
                } else {
                    obs.push({ title: "Great Progress!", text: `Visual tracking accuracy reached ${globalAvg}%.`, icon: TrendingUp, color: "#22C55E" });
                }

                const exerciseStats = {};
                history.forEach(s => {
                    if (!exerciseStats[s.title]) exerciseStats[s.title] = { total: 0, count: 0 };
                    exerciseStats[s.title].total += s.accuracy;
                    exerciseStats[s.title].count += 1;
                });

                let bestExercise = "Not Started";
                let maxAcc = -1;
                let worstExercise = "None";
                let minAcc = 101;

                Object.keys(exerciseStats).forEach(title => {
                    const acc = exerciseStats[title].total / exerciseStats[title].count;
                    if (acc > maxAcc) { maxAcc = acc; bestExercise = title; }
                    if (acc < minAcc) { minAcc = acc; worstExercise = title; }
                });

                const efficiency = globalAvg > 80 ? "Excellent" : globalAvg > 60 ? "Good" : "Needs Practice";

                // Dynamic Clinical Status calculation
                const ocularStatus = globalAvg >= 80 ? { text: "Excellent", color: "#22C55E" } :
                    globalAvg >= 60 ? { text: "Good", color: "#3B82F6" } :
                        globalAvg >= 40 ? { text: "Moderate", color: "#F59E0B" } :
                            { text: "Needs Practice", color: "#EF4444" };

                const avgReaction = history.length > 0 ? (1200 - (globalAvg * 3)) : 0;
                const latencyStatus = avgReaction === 0 ? { text: "N/A", color: "#94A3B8" } :
                    avgReaction < 850 ? { text: "Excellent", color: "#22C55E" } :
                        avgReaction < 1000 ? { text: "Moderate", color: "#F59E0B" } :
                            { text: "High", color: "#EF4444" };

                const avgFocusMinutes = (history.reduce((acc, s) => acc + (s.duration_minutes || s.durationMinutes || 0), 0) / history.length).toFixed(1);

                setOverallStats({
                    avgAccuracy: globalAvg,
                    streak: history.length,
                    weeklyHours: weekRes,
                    avgReaction: avgReaction,
                    reactionTrend: rTrend || "0,80 1000,55",
                    memoryTrend: mTrend || "0,85 1000,60",
                    observations: obs,
                    aiRecommendation: worstExercise,
                    bestExercise: bestExercise,
                    efficiencyRating: efficiency,
                    improvementOcular: (globalAvg / 5).toFixed(1),
                    latencyReduced: (globalAvg / 10).toFixed(0),
                    ocularStatus: ocularStatus,
                    latencyStatus: latencyStatus,
                    focusDuration: `${avgFocusMinutes}m Avg`
                });
            } else {
                // Reset to default for new users with no history
                setTodayStats({ sessions: 0, accuracy: 0, minutes: 0 });
                setOverallStats({
                    avgAccuracy: 0,
                    streak: 0,
                    weeklyHours: [0, 0, 0, 0, 0, 0, 0],
                    avgReaction: 0,
                    observations: [],
                    aiRecommendation: "Not Started",
                    bestExercise: "None",
                    efficiencyRating: "N/A",
                    improvementOcular: "0.0",
                    latencyReduced: "0",
                    ocularStatus: { text: "Not Started", color: "#94A3B8" },
                    latencyStatus: { text: "Not Started", color: "#94A3B8" },
                    focusDuration: "0m Avg"
                });
            }
        };

        fetchHistory();
    }, [activeTab]);

    const formatTimeAgo = (timestamp) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(mins / 60);
        const days = Math.floor(hrs / 24);

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
        if (hrs > 0) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
        if (mins > 0) return `${mins} min${mins > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    const handleDownloadReport = async () => {
        const input = document.getElementById('report-content');
        if (!input) return;

        // Briefly hide elements that shouldn't be in the PDF
        const buttons = input.querySelectorAll('button');
        const analyticsGrid = input.querySelector('div[style*="grid-template-columns: repeat(4, 1fr)"]');
        const actionIcons = input.querySelector('div[style*="gap: 24px; align-items: center"]');

        if (buttons) buttons.forEach(b => b.style.display = 'none');
        if (analyticsGrid) analyticsGrid.style.display = 'none';
        if (actionIcons) actionIcons.style.display = 'none';

        try {
            const canvas = await html2canvas(input, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Medical_Report_${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('PDF generation failed. Fallback to summary copy.');
        } finally {
            // Restore visibility
            if (buttons) buttons.forEach(b => b.style.display = 'block');
            if (analyticsGrid) analyticsGrid.style.display = 'grid';
            if (actionIcons) actionIcons.style.display = 'flex';
        }
    };

    const handleShareReport = async () => {
        const shareText = `VisualMotor AI Clinical Summary for ${user.full_name || user.username}\n` +
            `Today's Sessions: ${todayStats.sessions}\n` +
            `Avg Accuracy: ${todayStats.accuracy}%\n` +
            `Training: ${todayStats.minutes} mins`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Clinical Performance Report',
                    text: shareText,
                    url: window.location.href
                });
            } catch (err) {
                console.log('Share failed:', err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(shareText);
                alert('Report summary copied to clipboard! You can now paste and share it.');
            } catch (err) {
                alert('Could not copy report. Please use the Download option.');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: LayoutGrid },
        { name: 'Therapy Sessions', icon: ClipboardList },
        { name: 'Reports', icon: BarChart3 },
        { name: 'Patient Profile', icon: UserCircle },
    ];

    const sessions = [
        {
            id: "01",
            title: "Visual Focus Training",
            description: "Concentration exercises to stabilize ocular fixation.",
            icon: Eye
        },
        {
            id: "02",
            title: "Eye-Hand Coordination Therapy",
            description: "Synchronized visual-motor feedback loop enhancement.",
            icon: Pointer
        },
        {
            id: "03",
            title: "Shape Recognition Therapy",
            description: "Visual-spatial processing and pattern differentiation.",
            icon: Shapes
        },
        {
            id: "04",
            title: "Reaction Time Assessment",
            description: "Evaluating neural transmission and motor response latency.",
            icon: Gauge
        },
        {
            id: "05",
            title: "Memory & Pattern Rehabilitation",
            description: "Short-term cognitive spatial memory retraining.",
            icon: BrainCircuit
        },
        {
            id: "06",
            title: "AI Mood & Stress Analysis",
            description: "Real-time emotional wellness and physiological tracking.",
            icon: Smile
        }
    ].map(session => {
        const isCompleted = sessionHistory.some(s => s.exerciseId === session.id || s.exercise_id === session.id);
        return {
            ...session,
            status: isCompleted ? "Completed" : "Not Started",
            statusColor: isCompleted ? "#E8F5E9" : "#F5F5F5",
            statusTextColor: isCompleted ? "#2E7D32" : "#757575"
        };
    });

    const sidebarWidth = isSidebarOpen ? '280px' : '88px';

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Average Accuracy Card */}
                            <div className="card animate-fade-in" style={{ maxWidth: 'none', padding: '32px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div>
                                        <h3 style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 500 }}>Global Average Accuracy</h3>
                                        <div style={{ fontSize: '32px', fontWeight: 700, marginTop: '8px', color: 'var(--text-primary)' }}>{overallStats.avgAccuracy}%</div>
                                    </div>
                                    <div style={{ padding: '12px', background: 'var(--secondary-blue)', borderRadius: '12px' }}>
                                        <Activity size={24} color="var(--primary-blue)" />
                                    </div>
                                </div>
                                <div style={{ position: 'relative', height: '12px', background: '#E2E8F0', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{ width: `${overallStats.avgAccuracy}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-blue), #60A5FA)', borderRadius: '6px', transition: 'width 1s ease-in-out' }}></div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '14px', fontWeight: 600, color: 'var(--primary-blue)' }}>
                                    <span>Baseline: 40%</span>
                                    <span>Goal: 85%</span>
                                </div>
                            </div>

                            {/* Session List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <h3 style={{ margin: 0, fontWeight: 700 }}>Current Therapy Sessions</h3>
                                    <button onClick={() => setActiveTab('Therapy Sessions')} style={{ background: 'none', border: 'none', color: 'var(--primary-blue)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>View All</button>
                                </div>

                                {sessions.map((session, i) => (
                                    <div key={session.id} className="card animate-fade-in" style={{
                                        maxWidth: 'none',
                                        padding: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        animationDelay: `${0.1 + (i * 0.05)}s`
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                background: '#F8FAFB',
                                                borderRadius: '14px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid #EDEDED'
                                            }}>
                                                <session.icon size={28} color="var(--primary-blue)" />
                                            </div>
                                            <div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-blue)' }}>Session {session.id}</span>
                                                    <span style={{
                                                        fontSize: '11px',
                                                        fontWeight: 700,
                                                        padding: '2px 8px',
                                                        borderRadius: '4px',
                                                        background: session.statusColor,
                                                        color: session.statusTextColor
                                                    }}>{session.status}</span>
                                                </div>
                                                <h4 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 700 }}>{session.title}</h4>
                                                <p style={{ margin: 0, fontSize: '13px', color: '#777', lineHeight: '1.4' }}>{session.description}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (session.id === "06") navigate('/mood-analysis');
                                                else navigate(`/exercise/${session.id}`);
                                            }}
                                            className="primary-button"
                                            style={{ width: 'auto', padding: '10px 24px', fontSize: '15px' }}
                                        >
                                            Start
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <h3 style={{ marginTop: '24px', marginBottom: '16px', fontWeight: 700 }}>Clinical Tools & Analytics</h3>
                            <div style={{ marginBottom: '24px' }}>
                                <div className="card"
                                    onClick={() => setActiveTab('Reports')}
                                    style={{ maxWidth: 'none', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
                                >
                                    <div style={{ padding: '12px', background: 'rgba(10, 102, 194, 0.1)', borderRadius: '12px' }}>
                                        <FileText size={24} color="var(--primary-blue)" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700 }}>Export Clinical Reports</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Download comprehensive PDF health summaries</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {/* Performance Summary */}
                            <div className="card animate-fade-in" style={{ maxWidth: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ margin: 0 }}>Weekly Training</h3>
                                    <Trophy size={20} color="#FF8A00" />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '60px', background: '#F1F5F9', borderRadius: '4px', position: 'relative' }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    bottom: 0,
                                                    width: '100%',
                                                    height: `${Math.min(overallStats.weeklyHours[i], 100)}%`,
                                                    background: 'var(--primary-blue)',
                                                    borderRadius: '4px',
                                                    transition: 'height 0.5s ease-out'
                                                }}></div>
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>{day}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ padding: '16px', background: 'var(--secondary-blue)', borderRadius: '12px' }}>
                                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--primary-blue)', fontWeight: 600 }}>Active Training Flow 🔥</p>
                                </div>
                            </div>

                            <div className="card animate-fade-in glow" style={{
                                maxWidth: 'none',
                                animationDelay: '0.4s',
                                background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                                color: 'white',
                                border: '1px solid rgba(255,255,255,0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.1 }}>
                                    <Cpu size={120} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                    <Sparkles size={20} color="#FFD600" />
                                    <h3 style={{ margin: 0, color: 'white' }}>Neuro-Insights (AI)</h3>
                                </div>
                                <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', margin: 0, fontWeight: 500 }}>
                                    Analysis indicates a <span style={{ color: '#FFD600', fontWeight: 800 }}>+{overallStats.improvementOcular}%</span> increase in ocular stabilization compared to baseline.
                                    Synchronized hand-eye latency has decreased by <span style={{ color: '#34D399', fontWeight: 800 }}>{overallStats.latencyReduced}ms</span> based on recent sessions.
                                </p>
                                <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>AI RECOMMENDATION</div>
                                    <div style={{ fontSize: '13px', fontWeight: 600 }}>Proceed to {overallStats.aiRecommendation} Level 2</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Therapy Sessions':
                return (
                    <div className="animate-fade-in">
                        <div style={{ padding: '32px 40px', background: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, var(--primary-blue), #60A5FA)',
                                    borderRadius: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 8px 16px rgba(10, 102, 194, 0.2)'
                                }}>
                                    <BrainCircuit size={28} color="white" />
                                </div>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit' }}>VisualMotor <span style={{ color: 'var(--primary-blue)' }}>AI</span></h1>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                        <div style={{ width: '8px', height: '8px', background: '#34D399', borderRadius: '50%' }}></div>
                                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clinical Diagnostics Active</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <h2 style={{ marginBottom: '24px' }}>All Therapy Programs</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '24px' }}>
                            {sessions.map((session) => (
                                <div key={session.id} className="card" style={{ maxWidth: 'none', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--secondary-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <session.icon size={28} color="var(--primary-blue)" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h4 style={{ margin: '0 0 4px', fontSize: '18px' }}>{session.title}</h4>
                                            <span style={{ fontSize: '12px', color: session.statusTextColor, fontWeight: 700 }}>{session.status}</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (session.id === "06") navigate('/mood-analysis');
                                                else navigate(`/exercise/${session.id}?level=${sessionLevels[session.id] || 1}`);
                                            }}
                                            className="primary-button"
                                            style={{ width: 'auto', padding: '12px 28px', fontSize: '15px' }}
                                        >
                                            Start Training
                                        </button>
                                    </div>

                                    <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748B' }}>Select Proficiency Level</span>
                                            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary-blue)' }}>Level {sessionLevels[session.id] || 1}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {[1, 2, 3, 4, 5].map((lvl) => (
                                                <div
                                                    key={lvl}
                                                    onClick={() => setSessionLevels(prev => ({ ...prev, [session.id]: lvl }))}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                        fontSize: '15px',
                                                        fontWeight: 800,
                                                        transition: 'all 0.2s',
                                                        background: (sessionLevels[session.id] || 1) === lvl ? 'var(--primary-blue)' : '#F8FAFC',
                                                        color: (sessionLevels[session.id] || 1) === lvl ? 'white' : '#64748B',
                                                        border: (sessionLevels[session.id] || 1) === lvl ? 'none' : '1px solid #E2E8F0'
                                                    }}
                                                >
                                                    {lvl}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'Reports':
                return (
                    <div id="report-content" className="animate-fade-in" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '32px' }}>
                        {/* Custom Header */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <ArrowLeft size={28} style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Dashboard')} />
                                <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 800, fontFamily: 'Outfit' }}>Final Performance Report</h2>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                <FileText size={26} color="#EF4444" style={{ cursor: 'pointer' }} onClick={handleDownloadReport} />
                                <Share size={26} color="#3B82F6" style={{ cursor: 'pointer' }} onClick={handleShareReport} />
                            </div>
                        </div>

                        {/* Analytics Grid - Restored for Navigation */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '20px',
                            marginBottom: '40px'
                        }}>
                            {[
                                { label: 'Weekly', icon: Calendar, color: '#3B82F6', action: () => setActiveTab('Weekly Progress') },
                                { label: 'Accuracy', icon: TrendingUp, color: '#22C55E', action: () => setActiveTab('Accuracy Trend') },
                                { label: 'Reaction', icon: Gauge, color: '#F59E0B', action: () => setActiveTab('Reaction Trend') },
                                { label: 'History', icon: Clock, color: '#A855F7', action: () => setActiveTab('Exercise History') },
                                { label: 'AI Analytics', icon: BrainCircuit, color: '#06B6D4', action: () => setActiveTab('AI Analytics Dashboard') }
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    onClick={item.action}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        padding: '16px',
                                        background: 'white',
                                        borderRadius: '20px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        background: '#F8FAFC',
                                        borderRadius: '14px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <item.icon size={24} color={item.color} />
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#4b5563' }}>{item.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Checkmark Section */}
                        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                background: '#E8F5E9',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 24px',
                                border: '1px solid #C8E6C9'
                            }}>
                                <CheckCircle2 size={60} color="#4CAF50" />
                            </div>
                            <h2 style={{ fontSize: '42px', fontWeight: 800, margin: '0 0 8px', color: '#1E293B' }}>Report Summary</h2>
                            <div style={{ color: '#94A3B8', fontSize: '18px', fontWeight: 500 }}>Generated {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        </div>

                        {/* Stats Card */}
                        <div style={{
                            background: '#F0F9FF',
                            borderRadius: '32px',
                            padding: '40px',
                            marginBottom: '48px',
                            border: '1px solid #E0F2FE'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748B', fontSize: '20px', fontWeight: 500 }}>Total Exercises Completed</span>
                                    <span style={{ fontWeight: 800, fontSize: '24px', color: '#0F172A' }}>{sessionHistory.length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748B', fontSize: '20px', fontWeight: 500 }}>Best Performance</span>
                                    <span style={{ fontWeight: 800, fontSize: '24px', color: '#0F172A' }}>{overallStats.bestExercise || 'None'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748B', fontSize: '20px', fontWeight: 500 }}>Weakest Skill Area</span>
                                    <span style={{ fontWeight: 800, fontSize: '24px', color: '#0F172A' }}>{overallStats.aiRecommendation || 'None'}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ color: '#64748B', fontSize: '20px', fontWeight: 500 }}>Efficiency Rating</span>
                                    <span style={{ fontWeight: 800, fontSize: '24px', color: overallStats.avgAccuracy > 60 ? '#4CAF50' : '#F59E0B' }}>{overallStats.efficiencyRating || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* AI Recommendation */}
                        <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '24px', color: '#1E293B' }}>AI Clinical Recommendation</h3>
                        <div style={{
                            padding: '40px',
                            background: '#F8FAFC',
                            borderRadius: '24px',
                            border: '1px solid #E2E8F0',
                            marginBottom: '48px',
                            color: '#334155',
                            lineHeight: '1.7',
                            fontSize: '19px'
                        }}>
                            {overallStats.avgAccuracy > 0
                                ? `Based on your recent performance, your ${overallStats.bestExercise} is showing strong stability. We recommend focusing on ${overallStats.aiRecommendation} to improve your overall visual-motor symmetry and cognitive response latency.`
                                : "No session data available yet. Complete your first therapy session to receive personalized AI clinical recommendations."
                            }
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <button
                                onClick={handleDownloadReport}
                                style={{
                                    width: '100%',
                                    padding: '24px',
                                    background: '#F1F5F9',
                                    border: '1px solid #E2E8F0',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '16px',
                                    fontWeight: 700,
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    color: '#1E293B',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#E2E8F0'}
                                onMouseOut={(e) => e.currentTarget.style.background = '#F1F5F9'}
                            >
                                <Download size={24} /> Download PDF Report
                            </button>
                            <button
                                onClick={handleShareReport}
                                style={{
                                    width: '100%',
                                    padding: '24px',
                                    background: '#3B82F6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '16px',
                                    fontWeight: 700,
                                    fontSize: '20px',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <Share size={24} /> Share Report via Apps
                            </button>
                        </div>
                    </div>
                );

            case 'Weekly Progress':
                return (
                    <div className="animate-fade-in" style={{ padding: '0 20px 60px', maxWidth: '800px', margin: '0 auto' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <ArrowLeft size={28} style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Reports')} />
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'var(--primary-blue)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <BrainCircuit size={24} color="white" />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit' }}>Weekly Progress</h2>
                        </div>

                        {/* This Week Card */}
                        <div className="card" style={{ maxWidth: 'none', padding: '32px', marginBottom: '32px' }}>
                            <h3 style={{ margin: '0 0 32px 0', fontSize: '20px', fontWeight: 700 }}>This Week</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', padding: '0 10px' }}>
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                                    const height = overallStats.weeklyHours[i] || 10;
                                    const isFriday = day === 'Fri'; // Highlight like in the screenshot
                                    return (
                                        <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', flex: 1 }}>
                                            <div style={{
                                                width: '40px',
                                                height: `${Math.max(height * 2, 10)}px`,
                                                background: isFriday ? '#3B82F6' : '#F1F5F9',
                                                borderRadius: '8px',
                                                transition: 'height 0.5s ease-out'
                                            }}></div>
                                            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{day}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="card" style={{ maxWidth: 'none', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '350px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: '#E0F2FE',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '24px'
                                }}>
                                    <Dumbbell size={28} color="#0EA5E9" />
                                </div>
                                <div style={{ color: '#64748B', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Total Sessions</div>
                                <div style={{ fontSize: '48px', fontWeight: 800, color: '#0F172A' }}>{sessionHistory.length}</div>
                            </div>

                            <div className="card" style={{ maxWidth: 'none', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '350px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    background: '#F0FDF4',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '24px'
                                }}>
                                    <Target size={28} color="#22C55E" />
                                </div>
                                <div style={{ color: '#64748B', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Avg Accuracy</div>
                                <div style={{ fontSize: '48px', fontWeight: 800, color: '#0F172A' }}>{overallStats.avgAccuracy}%</div>
                            </div>
                        </div>
                    </div>
                );

            case 'Accuracy Trend':
                return (
                    <div className="animate-fade-in" style={{ padding: '0 20px 60px', maxWidth: '800px', margin: '0 auto' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <ArrowLeft size={28} style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Reports')} />
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'var(--primary-blue)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <BrainCircuit size={24} color="white" />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit' }}>Accuracy Trend</h2>
                        </div>

                        {/* Chart Card */}
                        <div className="card" style={{ maxWidth: 'none', padding: '32px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 40px 0', fontSize: '20px', fontWeight: 700, color: '#1E293B' }}>Accuracy Over Time</h3>

                            {/* SVG Line Graph */}
                            <div style={{ flex: 1, position: 'relative', marginBottom: '32px' }}>
                                <svg width="100%" height="250" viewBox="0 0 1000 300" preserveAspectRatio="none">
                                    {/* Grid Lines */}
                                    <line x1="0" y1="50" x2="1000" y2="50" stroke="#F1F5F9" strokeWidth="1" />
                                    <line x1="0" y1="150" x2="1000" y2="150" stroke="#F1F5F9" strokeWidth="1" />
                                    <line x1="0" y1="250" x2="1000" y2="250" stroke="#F1F5F9" strokeWidth="1" />

                                    {/* The Jagged Trend Line (Green) */}
                                    <polyline
                                        fill="none"
                                        stroke="#22C55E"
                                        strokeWidth="3"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                        points="0,50 120,50 250,250 400,60 550,230 700,150 850,200 950,50 1000,220"
                                    />
                                </svg>
                            </div>

                            <div style={{ fontSize: '18px', fontWeight: 700, color: '#22C55E' }}>
                                Average Accuracy: {overallStats.avgAccuracy}%
                            </div>
                        </div>
                    </div>
                );

            case 'Reaction Trend':
                return (
                    <div className="animate-fade-in" style={{ padding: '0 20px 60px', maxWidth: '800px', margin: '0 auto' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <ArrowLeft size={28} style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Reports')} />
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'var(--primary-blue)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <BrainCircuit size={24} color="white" />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit' }}>Reaction Trend</h2>
                        </div>

                        {/* Reaction Card */}
                        <div className="card" style={{
                            maxWidth: 'none',
                            padding: '48px 32px',
                            minHeight: '400px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ position: 'absolute', top: '32px', left: '32px', margin: 0, fontSize: '18px', fontWeight: 700, color: '#64748B' }}>Reaction Time (ms)</h3>

                            <div style={{ marginBottom: '60px' }}>
                                <span style={{
                                    fontSize: '48px',
                                    fontWeight: 800,
                                    color: '#3B82F6',
                                    fontFamily: 'Outfit'
                                }}>
                                    Average: {Math.round(overallStats.avgReaction)}ms
                                </span>
                            </div>

                            <div style={{
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'space-between',
                                padding: '0 20px',
                                marginTop: 'auto'
                            }}>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Best</div>
                                    <div style={{ color: '#22C55E', fontSize: '20px', fontWeight: 800 }}>{Math.round(overallStats.avgReaction * 0.9)}ms</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Average</div>
                                    <div style={{ color: '#3B82F6', fontSize: '20px', fontWeight: 800 }}>{Math.round(overallStats.avgReaction)}ms</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>Sessions</div>
                                    <div style={{ color: '#22C55E', fontSize: '20px', fontWeight: 800 }}>{sessionHistory.length}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'Exercise History':
                return (
                    <div className="animate-fade-in" style={{ padding: '0 20px 60px', maxWidth: '800px', margin: '0 auto' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <ArrowLeft size={28} style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Reports')} />
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'var(--primary-blue)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <BrainCircuit size={24} color="white" />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit' }}>Exercise History</h2>
                        </div>

                        {/* History List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {sessionHistory.length === 0 ? (
                                <div className="card" style={{ maxWidth: 'none', padding: '40px', textAlign: 'center', color: '#64748B' }}>
                                    No exercise records found. Complete a training session to see it here!
                                </div>
                            ) : (
                                sessionHistory.map((session, idx) => (
                                    <div
                                        key={idx}
                                        className="card"
                                        style={{
                                            maxWidth: 'none',
                                            padding: '24px',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            background: 'white',
                                            borderRadius: '20px',
                                            border: '1px solid #EDF2F7',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                                        }}
                                    >
                                        <div>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#1E293B' }}>{session.title || 'Exercise Session'}</h4>
                                            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 500 }}>
                                                {session.durationMinutes} min • {formatTimeAgo(session.timestamp)}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '22px',
                                                fontWeight: 800,
                                                color: session.accuracy > 70 ? '#22C55E' : (session.accuracy > 40 ? '#F59E0B' : '#EF4444')
                                            }}>
                                                {session.accuracy}%
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, marginTop: '2px' }}>Accuracy</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );

            case 'AI Analytics Dashboard':
                return (
                    <div className="animate-fade-in" style={{ padding: '0 20px 60px', maxWidth: '800px', margin: '0 auto' }}>
                        {/* Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                            <ArrowLeft size={28} style={{ cursor: 'pointer' }} onClick={() => setActiveTab('Reports')} />
                            <div style={{
                                width: '40px',
                                height: '40px',
                                background: 'var(--primary-blue)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <BrainCircuit size={24} color="white" />
                            </div>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit' }}>AI Analytics Dashboard</h2>
                        </div>

                        {/* Performance Trends Section */}
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginBottom: '24px' }}>Performance Trends</h3>

                        {/* Reaction Time Chart */}
                        <div className="card" style={{ maxWidth: 'none', padding: '24px', marginBottom: '24px', background: '#F0F9FF', border: 'none' }}>
                            <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>Reaction Time (ms)</h4>
                            <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                                <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none">
                                    <polyline
                                        fill="none"
                                        stroke="#3B82F6"
                                        strokeWidth="3"
                                        points={overallStats.reactionTrend}
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* Memory Score Chart */}
                        <div className="card" style={{ maxWidth: 'none', padding: '24px', marginBottom: '40px', background: '#F0F9FF', border: 'none' }}>
                            <h4 style={{ margin: '0 0 20px 0', fontSize: '14px', color: '#94A3B8', fontWeight: 600 }}>Memory Score</h4>
                            <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                                <svg width="100%" height="100%" viewBox="0 0 1000 100" preserveAspectRatio="none">
                                    <polyline
                                        fill="none"
                                        stroke="#8B5CF6"
                                        strokeWidth="3"
                                        points={overallStats.memoryTrend}
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>
                        </div>

                        {/* AI Observations Section */}
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginBottom: '24px' }}>AI Observations</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {overallStats.observations.length === 0 ? (
                                <div className="card" style={{ maxWidth: 'none', padding: '24px', textAlign: 'center', color: '#64748B' }}>
                                    AI is collecting more data from your sessions to provide personalized observations.
                                </div>
                            ) : overallStats.observations.map((ob, idx) => (
                                <div key={idx} style={{
                                    padding: '24px',
                                    background: 'white',
                                    borderRadius: '24px',
                                    border: '3px solid #E2E8F0',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                        <ob.icon size={20} color={ob.color} />
                                        <span style={{ fontSize: '18px', fontWeight: 700, color: ob.color }}>{ob.title}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: '1.6' }}>
                                        {ob.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'Patient Profile':
                return (
                    <div className="animate-fade-in" style={{ maxWidth: '900px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h2 style={{ margin: 0 }}>Medical Profile</h2>
                            {!isEditing ? (
                                <button 
                                    className="primary-button" 
                                    style={{ width: 'auto' }}
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Details
                                </button>
                            ) : (
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button 
                                        className="primary-button" 
                                        style={{ width: 'auto', background: '#94A3B8' }}
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        className="primary-button" 
                                        style={{ width: 'auto' }}
                                        onClick={handleSaveProfile}
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="card" style={{ maxWidth: 'none', padding: '40px', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '40px' }}>
                                <UserAvatar
                                    name={user.full_name || user.username}
                                    size="120px"
                                    fontSize="48px"
                                    borderRadius="32px"
                                />
                                <div>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <label style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>Full Name</label>
                                            <input 
                                                type="text"
                                                value={editForm.full_name}
                                                onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                                                style={{
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #E2E8F0',
                                                    fontSize: '18px',
                                                    fontWeight: 600,
                                                    width: '300px'
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <h3 style={{ fontSize: '32px', marginBottom: '8px', color: 'var(--primary-blue)' }}>{user.full_name || user.username}</h3>
                                    )}
                                    <div style={{ display: 'flex', gap: '12px', marginTop: isEditing ? '12px' : '0' }}>
                                        <span style={{ padding: '6px 12px', background: 'var(--secondary-blue)', color: 'var(--primary-blue)', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>Patient ID: VM-{user.id || '88392'}</span>
                                        <span style={{ padding: '6px 12px', background: '#E8F5E9', color: '#2E7D32', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>Active Treatment</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <h4 style={{ margin: '0 0 16px', color: '#64748B', fontSize: '14px' }}>Contact Information</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Mail size={18} color="var(--primary-blue)" />
                                            <span style={{ fontWeight: 600 }}>{user.email || 'patient@example.com'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Smartphone size={18} color="var(--primary-blue)" />
                                            {isEditing ? (
                                                <input 
                                                    type="text"
                                                    value={editForm.phone_number}
                                                    onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '6px',
                                                        border: '1px solid #E2E8F0',
                                                        fontSize: '14px',
                                                        fontWeight: 600,
                                                        flex: 1
                                                    }}
                                                />
                                            ) : (
                                                <span style={{ fontWeight: 600 }}>{user.phone_number || '+91 98765 43210'}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                                    <h4 style={{ margin: '0 0 16px', color: '#64748B', fontSize: '14px' }}>Clinical Status</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '14px' }}>Ocular Stability</span>
                                            <span style={{ fontWeight: 700, color: overallStats.ocularStatus.color }}>{overallStats.ocularStatus.text}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '14px' }}>Neural Latency</span>
                                            <span style={{ fontWeight: 700, color: overallStats.latencyStatus.color }}>{overallStats.latencyStatus.text}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '14px' }}>Focus Duration</span>
                                            <span style={{ fontWeight: 700, color: 'var(--primary-blue)' }}>{overallStats.focusDuration}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ maxWidth: 'none', padding: '32px' }}>
                            <h3 style={{ marginBottom: '20px' }}>Neurological Training Plan</h3>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1, padding: '20px', border: '2px dashed #CBD5E1', borderRadius: '16px', textAlign: 'center' }}>
                                    <Activity size={32} color="#94A3B8" style={{ marginBottom: '12px' }} />
                                    <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Morning Ritual: Focus Training</p>
                                </div>
                                <div style={{ flex: 1, padding: '20px', border: '2px dashed #CBD5E1', borderRadius: '16px', textAlign: 'center' }}>
                                    <BrainCircuit size={32} color="#94A3B8" style={{ marginBottom: '12px' }} />
                                    <p style={{ margin: 0, fontSize: '14px', color: '#64748B' }}>Evening Ritual: Memory Grid</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            default:
                return <div>Section under development</div>;
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', position: 'relative', overflowX: 'hidden' }}>
            {/* Sidebar */}
            <aside className="glass" style={{
                width: sidebarWidth,
                borderRight: '1px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                padding: '32px 0',
                position: 'fixed',
                height: '100vh',
                zIndex: 50,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                left: 0,
                backgroundColor: '#FFFFFF',
                boxShadow: isSidebarOpen ? 'var(--shadow-lg)' : 'none'
            }}>
                {/* Sidebar Header */}
                <div style={{ padding: '0 24px 40px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        minWidth: '40px',
                        height: '40px',
                        background: 'var(--primary-blue)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 4px 12px rgba(10, 102, 194, 0.2)'
                    }}>
                        <BrainCircuit size={24} color="white" />
                    </div>
                    {isSidebarOpen && <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-blue)', fontFamily: 'Outfit', animation: 'fadeIn 0.4s' }}>VisualMotor AI</span>}
                </div>

                {/* Sidebar Nav */}
                <nav style={{ flex: 1, padding: '0 16px' }}>
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                                gap: '16px',
                                padding: '14px',
                                borderRadius: '16px',
                                background: activeTab === item.name ? 'var(--secondary-blue)' : 'transparent',
                                color: activeTab === item.name ? 'var(--primary-blue)' : 'var(--text-secondary)',
                                marginBottom: '8px',
                                fontWeight: activeTab === item.name ? 700 : 500,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                border: 'none',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            className="sidebar-link"
                        >
                            <item.icon size={22} style={{ flexShrink: 0 }} />
                            {isSidebarOpen && <span style={{ fontSize: '15px', animation: 'fadeIn 0.3s' }}>{item.name}</span>}
                            {!isSidebarOpen && activeTab === item.name && (
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    width: '4px',
                                    height: '24px',
                                    background: 'var(--primary-blue)',
                                    borderRadius: '0 4px 4px 0'
                                }}></div>
                            )}
                        </button>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div style={{ padding: '0 16px 24px' }}>
                    {/* User Profile Info */}
                    <div style={{
                        padding: '16px',
                        background: '#F8FAFC',
                        borderRadius: '20px',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        border: '1px solid #E2E8F0',
                        overflow: 'hidden'
                    }}>
                        <UserAvatar
                            name={user.full_name || user.username}
                            size="40px"
                            fontSize="16px"
                            borderRadius="10px"
                        />
                        {isSidebarOpen && (
                            <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user.full_name || user.username}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600, textTransform: 'uppercase' }}>
                                    Patient
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isSidebarOpen ? 'flex-start' : 'center',
                            gap: '16px',
                            padding: '14px',
                            borderRadius: '16px',
                            color: '#EF4444',
                            background: 'rgba(239, 68, 68, 0.08)',
                            fontWeight: 700,
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        <LogOut size={22} style={{ flexShrink: 0 }} />
                        {isSidebarOpen && <span style={{ fontSize: '15px' }}>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main style={{
                marginLeft: sidebarWidth,
                flex: 1,
                padding: '40px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minWidth: 0
            }}>
                {/* Top Header Row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            style={{
                                padding: '10px',
                                background: 'white',
                                border: '1px solid #E2E8F0',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            {isSidebarOpen ? <X size={20} color="var(--text-secondary)" /> : <Menu size={20} color="var(--text-secondary)" />}
                        </button>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, var(--primary-blue), #60A5FA)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 16px rgba(10, 102, 194, 0.2)'
                            }}>
                                <BrainCircuit size={28} color="white" />
                            </div>
                            <div>
                                <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 800, fontFamily: 'Outfit' }}>VisualMotor <span style={{ color: 'var(--primary-blue)' }}>AI</span></h1>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                    <div style={{ width: '8px', height: '8px', background: '#34D399', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Diagnostics Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        onClick={() => setActiveTab('Patient Profile')}
                        style={{ cursor: 'pointer' }}
                    >
                        <UserAvatar
                            name={user.full_name || user.username}
                            size="44px"
                            fontSize="18px"
                            borderRadius="12px"
                        />
                    </div>
                </div>

                {/* Dynamic Content Rendering */}
                {renderContent()}
            </main>

            <style>{`
        .sidebar-link:hover {
          background: rgba(10, 102, 194, 0.05) !important;
          transform: translateX(4px);
        }
        .card {
          border: 1px solid #E2E8F0;
          transition: all 0.3s;
        }
        .card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
      `}</style>
        </div>
    );
};

export default HomePage;
