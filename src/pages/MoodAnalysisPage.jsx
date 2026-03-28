import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BrainCircuit, ArrowLeft, ArrowRight, Smile, Frown, Meh,
    Zap, Loader2, Download, Play, CheckCircle2, AlertCircle,
    Activity, Battery, Heart, MessageSquare
} from 'lucide-react';
import Button from '../components/Button';
import { jsPDF } from 'jspdf';

const MoodAnalysisPage = () => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://14.139.187.229:8081/jan2026/spic741/visualmotortrainer/api';
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Section 1 State: Mood & Stress
    const [selectedMood, setSelectedMood] = useState(null);
    const [stressLevel, setStressLevel] = useState(5);

    // Section 2 State: Questionnaire
    const [answers, setAnswers] = useState({
        q1: '', q2: '', q3: '', q4: '', q5: ''
    });

    // Section 3 State: Cognitive Test
    const [testState, setTestState] = useState('idle'); // idle, waiting, active, finished
    const [reactionTime, setReactionTime] = useState(null);
    const timerRef = useRef(null);
    const startTimestamp = useRef(null);

    // Section 4/5 State: Results
    const [results, setResults] = useState(null);

    const moods = [
        { id: 'happy', label: 'Happy', icon: Smile, color: '#22C55E' },
        { id: 'calm', label: 'Calm', icon: Activity, color: '#3B82F6' },
        { id: 'sad', label: 'Sad', icon: Frown, color: '#64748B' },
        { id: 'angry', label: 'Angry', icon: Zap, color: '#EF4444' },
        { id: 'stressed', label: 'Stressed', icon: Battery, color: '#F59E0B' },
        { id: 'tired', label: 'Tired', icon: Meh, color: '#A855F7' }
    ];

    const questions = [
        { id: 'q1', text: "Have you found it difficult to relax recently?" },
        { id: 'q2', text: "Do you struggle to maintain focus during complex tasks?" },
        { id: 'q3', text: "Is your sleep quality currently satisfactory?" },
        { id: 'q4', text: "Have you felt overwhelmed by small daily challenges?" },
        { id: 'q5', text: "Do you feel motivated to complete your therapy goals today?" }
    ];

    // --- Business Logic ---

    const handleNextStep = () => {
        if (step === 1 && !selectedMood) {
            alert("Please select a mood before continuing.");
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleBackStep = () => {
        setStep(prev => prev - 1);
    };

    const startCognitiveTest = () => {
        setTestState('waiting');
        const delay = Math.floor(Math.random() * 3000) + 2000;
        timerRef.current = setTimeout(() => {
            setTestState('active');
            startTimestamp.current = Date.now();
        }, delay);
    };

    const handleTestClick = () => {
        if (testState === 'active') {
            const rt = Date.now() - startTimestamp.current;
            setReactionTime(rt);
            setTestState('finished');
        } else if (testState === 'waiting') {
            clearTimeout(timerRef.current);
            alert("Too early! Wait for the circle to turn green.");
            setTestState('idle');
        }
    };

    const submitAnalysis = async () => {
        setIsLoading(true);
        setStep(4);

        const payload = {
            user_id: user.id,
            mood: selectedMood,
            stress_level: stressLevel,
            questionnaire_answers: JSON.stringify(answers),
            reaction_time: reactionTime
        };

        try {
            // Call PHP backend
            const response = await fetch(`${API_BASE_URL}/mood-analysis`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            }).then(res => res.json());

            setResults(response.data || response);
            setStep(5);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Clinical Mood & Stress Report", 20, 20);
        doc.setFontSize(14);
        doc.text(`Patient: ${user.full_name || user.username}`, 20, 35);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
        doc.line(20, 50, 190, 50);

        doc.text("Metrix Data:", 20, 65);
        doc.text(`Reported Mood: ${selectedMood}`, 30, 75);
        doc.text(`Stress Index: ${stressLevel}/10`, 30, 85);
        doc.text(`Cognitive Reaction Time: ${reactionTime}ms`, 30, 95);

        doc.text("Clinical Conclusion:", 20, 115);
        doc.text(results?.mood_status || "Stabilized", 30, 125);
        doc.text(results?.message || "Patient displays healthy homeostatic regulation.", 30, 135);

        doc.save(`Mood_Report_${user.username}.pdf`);
    };

    // --- Sub-Components ---

    const Section1 = () => (
        <div className="animate-fade-in">
            <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>AI Mood & Stress Analysis</h1>
            <p style={{ color: '#64748B', fontSize: '18px', marginBottom: '48px' }}>How are you feeling today?</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '48px' }}>
                {moods.map((m) => (
                    <div
                        key={m.id}
                        onClick={() => setSelectedMood(m.id)}
                        className="mood-card"
                        style={{
                            padding: '32px 24px',
                            background: selectedMood === m.id ? 'var(--secondary-blue)' : 'white',
                            border: `2px solid ${selectedMood === m.id ? 'var(--primary-blue)' : '#E2E8F0'}`,
                            borderRadius: '24px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: selectedMood === m.id ? '0 10px 25px rgba(10, 102, 194, 0.15)' : 'var(--shadow-sm)',
                            transform: selectedMood === m.id ? 'translateY(-4px)' : 'none'
                        }}
                    >
                        <m.icon
                            size={44}
                            color={selectedMood === m.id ? 'var(--primary-blue)' : '#94A3B8'}
                            style={{ marginBottom: '16px', transition: 'transform 0.3s' }}
                        />
                        <div style={{
                            fontWeight: 700,
                            fontSize: '18px',
                            color: selectedMood === m.id ? 'var(--primary-blue)' : '#475569'
                        }}>{m.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ background: '#F8FAFC', padding: '40px', borderRadius: '32px', marginBottom: '48px', border: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontWeight: 700, fontSize: '20px', display: 'block' }}>Current Stress Level</span>
                        <span style={{ color: '#64748B', fontSize: '14px' }}>Self-reported intensity metric</span>
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '28px', color: 'var(--primary-blue)', background: 'white', padding: '10px 20px', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>{stressLevel}/10</span>
                </div>
                <div style={{ position: 'relative', padding: '0 10px' }}>
                    <input
                        type="range" min="1" max="10"
                        value={stressLevel}
                        onChange={(e) => setStressLevel(parseInt(e.target.value))}
                        style={{
                            width: '100%',
                            height: '10px',
                            cursor: 'pointer',
                            accentColor: 'var(--primary-blue)'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', color: '#94A3B8', fontSize: '12px', fontWeight: 600 }}>
                        <span>RELAXED</span>
                        <span>MODERATE</span>
                        <span>STRESSED</span>
                    </div>
                </div>
            </div>

            <Button onClick={handleNextStep}>Next Step <ArrowRight size={20} /></Button>
        </div>
    );

    const Section2 = () => (
        <div className="animate-fade-in">
            <div style={{ width: '100%', height: '8px', background: '#E2E8F0', borderRadius: '4px', marginBottom: '32px', overflow: 'hidden' }}>
                <div style={{ width: '40%', height: '100%', background: 'var(--primary-blue)', transition: 'width 0.5s' }}></div>
            </div>
            <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>Emotional Questionnaire</h2>
            <p style={{ color: '#64748B', marginBottom: '40px' }}>Answer clinical assessments to calibrate the AI model.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', marginBottom: '48px' }}>
                {questions.map((q) => (
                    <div key={q.id} style={{ background: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #F1F5F9' }}>
                        <p style={{ fontWeight: 600, fontSize: '19px', marginBottom: '20px', color: '#334155' }}>{q.text}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                            {['Yes', 'No', 'Sometimes'].map((opt) => (
                                <div
                                    key={opt}
                                    onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                                    style={{
                                        padding: '14px',
                                        borderRadius: '12px',
                                        border: `2px solid ${answers[q.id] === opt ? 'var(--primary-blue)' : '#F1F5F9'}`,
                                        background: answers[q.id] === opt ? 'var(--secondary-blue)' : '#F8FAFC',
                                        color: answers[q.id] === opt ? 'var(--primary-blue)' : '#64748B',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        fontSize: '15px',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        boxShadow: answers[q.id] === opt ? '0 4px 12px rgba(10, 102, 194, 0.1)' : 'none'
                                    }}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '20px' }}>
                <Button onClick={handleBackStep} variant="secondary" style={{ background: '#F1F5F9', color: '#475569' }}><ArrowLeft size={20} /> Back</Button>
                <Button onClick={handleNextStep}>Continue <ArrowRight size={20} /></Button>
            </div>
        </div>
    );

    const Section3 = () => (
        <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>Cognitive Performance Test</h2>
            <p style={{ color: '#64748B', marginBottom: '60px' }}>Tap the circle as soon as it turns <span style={{ color: '#22C55E', fontWeight: 800 }}>GREEN</span>.</p>

            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '60px' }}>
                {testState === 'idle' && (
                    <div
                        onClick={startCognitiveTest}
                        style={{ width: '200px', height: '200px', borderRadius: '50%', background: 'var(--primary-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 800, cursor: 'pointer', boxShadow: '0 12px 32px rgba(10, 102, 194, 0.3)' }}
                    >
                        START TEST
                    </div>
                )}
                {(testState === 'waiting' || testState === 'active') && (
                    <div
                        onClick={handleTestClick}
                        style={{
                            width: '240px',
                            height: '240px',
                            borderRadius: '50%',
                            background: testState === 'active' ? '#22C55E' : '#E2E8F0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.1s'
                        }}
                    >
                        {testState === 'active' && <span style={{ color: 'white', fontSize: '32px', fontWeight: 900 }}>TAP!</span>}
                    </div>
                )}
                {testState === 'finished' && (
                    <div style={{ textAlign: 'center' }}>
                        <CheckCircle2 size={80} color="#22C55E" style={{ margin: '0 auto 24px' }} />
                        <div style={{ fontSize: '18px', color: '#64748B', marginBottom: '8px' }}>Reaction Time</div>
                        <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--primary-blue)' }}>{reactionTime}ms</div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                <Button onClick={handleBackStep} variant="secondary" style={{ background: '#F1F5F9', color: '#475569', width: 'auto' }}><ArrowLeft size={20} /> Back</Button>
                {testState === 'finished' && <Button onClick={submitAnalysis} style={{ width: 'auto' }}>Submit Analysis <Zap size={20} /></Button>}
            </div>
        </div>
    );

    const Section4 = () => (
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Loader2 size={80} className="animate-spin" color="var(--primary-blue)" style={{ margin: '0 auto 40px' }} />
            <h2 style={{ fontSize: '32px', marginBottom: '16px' }}>Processing Mood Analytics...</h2>
            <p style={{ color: '#64748B', maxWidth: '500px', margin: '0 auto' }}>Building your emotional profile using neural network assessment and cognitive latency metrics.</p>
        </div>
    );

    const Section5 = () => (
        <div className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <div style={{
                    width: '120px', height: '120px', background: '#F0FDF4', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px',
                    border: '1px solid #DCFCE7'
                }}>
                    <Heart size={60} color="#16A34A" fill="#16A34A" fillOpacity={0.1} />
                </div>
                <h1 style={{ fontSize: '42px', fontWeight: 900, marginBottom: '12px' }}>Analysis Complete</h1>
                <p style={{ color: '#64748B', fontSize: '20px' }}>Your clinical emotional profile is ready.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px', marginBottom: '60px' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                        <div style={{ padding: '12px', background: 'var(--secondary-blue)', borderRadius: '12px' }}>
                            <Activity size={24} color="var(--primary-blue)" />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '22px' }}>Biometric Summary</h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '20px' }}>
                            <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px', fontWeight: 600 }}>MOOD STATUS</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: '#16A34A' }}>{results?.mood_status}</div>
                        </div>
                        <div style={{ background: '#F8FAFC', padding: '24px', borderRadius: '20px' }}>
                            <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px', fontWeight: 600 }}>STRESS CATEGORY</div>
                            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary-blue)' }}>{results?.stress_category}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: '32px', padding: '24px', background: '#F0F9FF', borderRadius: '20px', display: 'flex', gap: '16px' }}>
                        <AlertCircle size={24} color="var(--primary-blue)" style={{ flexShrink: 0 }} />
                        <p style={{ margin: 0, color: '#0369A1', lineHeight: '1.6', fontWeight: 500 }}>{results?.message}</p>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ background: 'linear-gradient(135deg, #1E293B, #0F172A)', padding: '32px', borderRadius: '32px', color: 'white' }}>
                        <h4 style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 16px', fontSize: '14px', letterSpacing: '1px' }}>AI RECOMMENDED ACTION</h4>
                        <p style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Begin focused neural stabilization therapy.</p>
                        <Button
                            onClick={() => navigate(`/exercise/${results?.recommended_exercise || '01'}`)}
                            style={{ background: 'white', color: '#0F172A', border: 'none' }}
                        >
                            <Play size={18} fill="currentColor" /> Start Recommended Exercise
                        </Button>
                    </div>

                    <button
                        onClick={downloadPDF}
                        style={{
                            padding: '24px', background: 'white', border: '2px solid #E2E8F0', borderRadius: '24px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                            fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary-blue)'}
                        onMouseOut={(e) => e.currentTarget.style.borderColor = '#E2E8F0'}
                    >
                        <Download size={20} /> Download Clinical Report (PDF)
                    </button>

                    <Button variant="secondary" onClick={() => navigate('/home')} style={{ background: '#F1F5F9', color: '#475569' }}>Return to Dashboard</Button>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '60px 24px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <button
                    onClick={() => navigate('/home')}
                    style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748B', fontWeight: 600, marginBottom: '32px', cursor: 'pointer' }}
                >
                    <ArrowLeft size={20} /> Back to Dashboard
                </button>

                <div className="card" style={{ padding: '60px', borderRadius: '40px', background: 'white', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                    {step === 1 && <Section1 />}
                    {step === 2 && <Section2 />}
                    {step === 3 && <Section3 />}
                    {step === 4 && <Section4 />}
                    {step === 5 && <Section5 />}
                </div>
            </div>

            <style>{`
                @keyframes pulse-custom {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default MoodAnalysisPage;
