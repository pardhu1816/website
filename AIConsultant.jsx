import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit, X, MessageSquare, Send, Sparkles, User, Database, AlertCircle, TrendingUp, CheckCircle2, Gauge, Target } from 'lucide-react';

const AIConsultant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [performanceData, setPerformanceData] = useState({
        history: [],
        avgAccuracy: 0,
        recommendation: "Eye-Hand Coordination Therapy",
        improvement: 0,
        totalSessions: 0
    });

    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'assistant',
            text: "Hello! I'm your Clinical AI Assistant. Analyzing your neural patterns and performance data...",
            icon: Sparkles
        },
        {
            id: 2,
            role: 'assistant',
            text: "I'll give you a personalized recommendation once I've scanned your recent activity.",
            icon: Target
        }
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        const fetchAIData = async () => {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const userId = user.id || user.email || 'guest';
            const storageKey = `session_history_${userId}`;
            let history = [];

            try {
                const response = await fetch(`http://localhost:5000/api/user-sessions/${userId}`);
                if (response.ok) {
                    history = await response.json();
                    localStorage.setItem(storageKey, JSON.stringify(history));
                }
            } catch (err) {
                history = JSON.parse(localStorage.getItem(storageKey) || '[]');
            }

            if (history.length > 0) {
                const avg = history.reduce((acc, s) => acc + s.accuracy, 0) / history.length;

                // Calculate weekly improvement
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const recentSessions = history.filter(s => new Date(s.timestamp) > oneWeekAgo);
                const oldSessions = history.filter(s => new Date(s.timestamp) <= oneWeekAgo);

                let improvement = 0;
                if (recentSessions.length > 0 && oldSessions.length > 0) {
                    const recentAvg = recentSessions.reduce((acc, s) => acc + s.accuracy, 0) / recentSessions.length;
                    const oldAvg = oldSessions.reduce((acc, s) => acc + s.accuracy, 0) / oldSessions.length;
                    improvement = Math.round(recentAvg - oldAvg);
                } else if (recentSessions.length > 1) {
                    improvement = Math.round(recentSessions[0].accuracy - recentSessions[recentSessions.length - 1].accuracy);
                }

                const exerciseStats = {};
                history.forEach(s => {
                    if (!exerciseStats[s.title]) exerciseStats[s.title] = { total: 0, count: 0 };
                    exerciseStats[s.title].total += s.accuracy;
                    exerciseStats[s.title].count += 1;
                });

                let worstExercise = "";
                let minAcc = 101;
                Object.keys(exerciseStats).forEach(title => {
                    const acc = exerciseStats[title].total / exerciseStats[title].count;
                    if (acc < minAcc) {
                        minAcc = acc;
                        worstExercise = title;
                    }
                });

                setPerformanceData({
                    history,
                    avgAccuracy: Math.round(avg),
                    recommendation: worstExercise || "Visual Focus Training",
                    improvement,
                    totalSessions: history.length
                });

                setMessages([
                    {
                        id: 1,
                        role: 'assistant',
                        text: `Hello! I've analyzed your ${history.length} recent training sessions. Your global accuracy is maintaining at ${Math.round(avg)}%.`,
                        icon: Sparkles
                    },
                    {
                        id: 2,
                        role: 'assistant',
                        text: improvement >= 0
                            ? `I see a ${improvement}% improvement in your visual tracking! I recommend focusing on ${worstExercise || "Shape Recognition"} today.`
                            : `Let's work on ${worstExercise || "Eye-Hand Coordination"} to boost your neural adaptation.`,
                        icon: Target
                    }
                ]);
            }
        };

        fetchAIData();
    }, [scrollRef]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const iconMap = {
        Sparkles,
        Target,
        TrendingUp,
        Database,
        CheckCircle2,
        Gauge,
        MessageSquare,
        Send,
        User,
        AlertCircle
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = { id: messages.length + 1, role: 'user', text: input, icon: User };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: input,
                    performance_data: performanceData
                })
            });

            if (response.ok) {
                const data = await response.json();
                setIsTyping(false);
                setMessages(prev => [...prev, {
                    id: messages.length + 2,
                    role: 'assistant',
                    text: data.text,
                    icon: iconMap[data.icon] || Sparkles
                }]);
                return;
            }
        } catch (err) {
            console.error('AI API Error:', err);
        }

        // Simpler Fallback if API fails
        setTimeout(() => {
            setIsTyping(false);
            const aiResponse = generateAIResponse(input);
            setMessages(prev => [...prev, {
                id: messages.length + 2,
                role: 'assistant',
                text: aiResponse.text,
                icon: aiResponse.icon || Sparkles
            }]);
        }, 1500);
    };

    const generateAIResponse = (query) => {
        const lower = query.toLowerCase();

        if (lower.includes('recommend') || lower.includes('what should i do') || lower.includes('advice')) {
            return {
                text: `Based on your recent performance, you should prioritize ${performanceData.recommendation}. It's currently your highest opportunity for neural growth!`,
                icon: Target
            };
        }

        if (lower.includes('progress') || lower.includes('better') || lower.includes('accuracy')) {
            const trend = performanceData.improvement >= 0 ? "upward" : "challenging";
            return {
                text: `Your accuracy is currently ${performanceData.avgAccuracy}%. The overall trend is ${trend}. You've completed ${performanceData.totalSessions} sessions so far!`,
                icon: TrendingUp
            };
        }

        if (lower.includes('hard') || lower.includes('difficult')) {
            return {
                text: `I understand. I've noted that ${performanceData.recommendation} is challenging for you. Try doing it for just 2 minutes at a lower level to build confidence.`,
                icon: Database
            };
        }

        return {
            text: "I'm monitoring your visual-motor data in real-time. Keep practicing to provide more insights for my diagnostic engine!",
            icon: CheckCircle2
        };
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, var(--primary-blue), #60A5FA)',
                        color: 'white',
                        boxShadow: '0 12px 32px rgba(10, 102, 194, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 2s infinite',
                        border: '2px solid rgba(255,255,255,0.2)'
                    }}
                >
                    <Sparkles size={32} />
                </button>
            ) : (
                <div style={{
                    width: '380px',
                    height: '550px',
                    background: 'white',
                    borderRadius: '32px',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    border: '1px solid #E2E8F0',
                    animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '24px',
                        background: 'linear-gradient(135deg, var(--primary-blue), #7BB5FF)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <BrainCircuit size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '16px' }}>NeuroAI Assistant</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ width: '6px', height: '6px', background: '#34D399', borderRadius: '50%' }}></div>
                                    <span style={{ fontSize: '11px', opacity: 0.8 }}>Live Diagnostics Active</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', color: 'white', opacity: 0.6 }}><X size={20} /></button>
                    </div>

                    {/* Messages Area */}
                    <div
                        ref={scrollRef}
                        style={{
                            flex: 1,
                            padding: '24px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '20px',
                            background: '#F8FAFC'
                        }}
                    >
                        {messages.map(msg => (
                            <div key={msg.id} style={{
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                gap: '6px'
                            }}>
                                <div style={{
                                    padding: '12px 16px',
                                    borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    background: msg.role === 'user' ? 'var(--primary-blue)' : 'white',
                                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    boxShadow: msg.role === 'user' ? '0 4px 12px rgba(10,102,194,0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                                    display: 'flex',
                                    gap: '10px'
                                }}>
                                    {msg.icon && <msg.icon size={16} style={{ marginTop: '3px', opacity: 0.8 }} />}
                                    <span>{msg.text}</span>
                                </div>
                                <span style={{ fontSize: '10px', color: '#94A3B8' }}>{msg.role === 'user' ? 'You' : 'NeuroAI'}</span>
                            </div>
                        ))}
                        {isTyping && (
                            <div style={{
                                width: '45px',
                                padding: '12px 16px',
                                background: 'white',
                                borderRadius: '20px 20px 20px 4px',
                                display: 'flex',
                                gap: '4px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}>
                                <div className="dot" style={{ width: '4px', height: '4px', background: '#CBD5E1', borderRadius: '50%', animation: 'bounce 0.6s infinite 0.1s' }}></div>
                                <div className="dot" style={{ width: '4px', height: '4px', background: '#CBD5E1', borderRadius: '50%', animation: 'bounce 0.6s infinite 0.2s' }}></div>
                                <div className="dot" style={{ width: '4px', height: '4px', background: '#CBD5E1', borderRadius: '50%', animation: 'bounce 0.6s infinite 0.3s' }}></div>
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '20px', background: 'white', borderTop: '1px solid #E2E8F0' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            background: '#F1F5F9',
                            padding: '8px 16px',
                            borderRadius: '16px'
                        }}>
                            <input
                                placeholder="Analyze my performance..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                style={{
                                    flex: 1,
                                    background: 'none',
                                    border: 'none',
                                    padding: '8px 0',
                                    outline: 'none',
                                    fontSize: '14px',
                                    color: 'var(--text-primary)'
                                }}
                            />
                            <button
                                onClick={handleSend}
                                style={{
                                    width: '36px',
                                    height: '36px',
                                    background: 'var(--primary-blue)',
                                    color: 'white',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-4px); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px) scale(0.9); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(10, 102, 194, 0.4); }
                    70% { box-shadow: 0 0 0 20px rgba(10, 102, 194, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(10, 102, 194, 0); }
                }
            `}</style>
        </div>
    );
};

export default AIConsultant;
