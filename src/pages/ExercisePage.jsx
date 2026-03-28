import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft,
    Timer,
    Trophy,
    Eye,
    Pointer,
    Shapes,
    Gauge,
    Smile,
    BrainCircuit,
    Search,
    Palette,
    Target,
    Circle,
    Square,
    Triangle,
    Hexagon,
    Star,
    Zap,
    MousePointer2,
    Video,
    VideoOff
} from 'lucide-react';
import HandTracingController from '../components/HandTracingController';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://14.139.187.229:8081/jan2026/spic741/visualmotortrainer';

const ExercisePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [countdown, setCountdown] = useState(3);
    const [isStarted, setIsStarted] = useState(false);
    const [searchParams] = useSearchParams();
    const level = parseInt(searchParams.get('level') || '1');
    const [currentRound, setCurrentRound] = useState(1);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [startTime, setStartTime] = useState(0);
    const totalRounds = 10;

    // Game state
    const [gameData, setGameData] = useState(null);
    const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'
    const [useAIVision, setUseAIVision] = useState(false);
    const [faceScanning, setFaceScanning] = useState(false);
    const effectRan = useRef(false);

    const sessionsConfig = {
        "01": { title: "Visual Focus Training", icon: Eye, type: "REACTION_SPEED" },
        "02": { title: "Eye-Hand Coordination Therapy", icon: Pointer, type: "HAND_EYE" },
        "03": { title: "Shape Recognition Therapy", icon: Shapes, type: "SHAPE_MATCH" },
        "04": { title: "Reaction Time Assessment", icon: Gauge, type: "REACTION_TIME" },
        "05": { title: "Memory & Pattern Rehabilitation", icon: BrainCircuit, type: "MEMORY_GRID" },
        "06": { title: "AI Mood & Stress Analysis", icon: Smile, type: "FOCUS_ATTENTION" },
        "07": { title: "Color Recognition Training", icon: Palette, type: "COLOR_STROOP" },
        "08": { title: "Simon Says Memory", icon: Zap, type: "SIMON_SAYS" },
        "09": { title: "Peripheral Vision Game", icon: Target, type: "PERIPHERAL" },
        "10": { title: "Visual Scanning Exercise", icon: Search, type: "SCANNING" }
    };

    useEffect(() => {
        if (sessionsConfig[id]) {
            setSession(sessionsConfig[id]);
        } else {
            navigate('/home');
        }
    }, [id, navigate]);

    // Countdown logic
    useEffect(() => {
        if (countdown > 0 && !isStarted && !isFinished) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0 && !isStarted) {
            setIsStarted(true);
            setStartTime(Date.now());
            initNewRound();
        }
    }, [countdown, isStarted, isFinished]);

    const initNewRound = () => {
        setFeedback(null);
        const type = sessionsConfig[id].type;

        if (type === "REACTION_SPEED" || type === "REACTION_TIME") {
            setGameData({ show: false, color: 'gray' });
            // Aggressive scaling: Level reduces wait time and increases randomness
            const minDelay = 1000 / level;
            const maxDelay = 3000 / level;
            const delay = Math.random() * (maxDelay - minDelay) + minDelay;
            setTimeout(() => {
                setGameData({
                    show: true,
                    color: ['#EF4444', '#3B82F6', '#22C55E', '#EAB308', '#A855F7'][Math.floor(Math.random() * 5)],
                    startTime: Date.now(),
                    size: Math.max(80, 250 - (level * 35)) // Significantly smaller targets at high levels
                });
            }, delay);
        } else if (type === "SHAPE_MATCH") {
            const shapes = ["Circle", "Square", "Triangle", "Hexagon", "Star"];
            const target = shapes[Math.floor(Math.random() * shapes.length)];
            // Harder scaling: More options at high levels (up to 12)
            const optionCount = Math.min(12, 3 + (level * 2));
            const pool = [];
            while (pool.length < optionCount) {
                pool.push(shapes[Math.floor(Math.random() * shapes.length)]);
            }
            if (!pool.includes(target)) pool[0] = target;
            setGameData({ target, options: pool.sort(() => 0.5 - Math.random()), startTime: Date.now() });
        } else if (type === "COLOR_STROOP") {
            const colors = [
                { label: "RED", value: "#EF4444" },
                { label: "BLUE", value: "#3B82F6" },
                { label: "GREEN", value: "#22C55E" },
                { label: "YELLOW", value: "#EAB308" },
                { label: "PURPLE", value: "#A855F7" },
                { label: "ORANGE", value: "#F97316" },
                { label: "PINK", value: "#EC4899" }
            ];
            // At higher levels, more colors and faster decisions
            const colorPool = colors.slice(0, 4 + level);
            const word = colorPool[Math.floor(Math.random() * colorPool.length)];
            // Increase mismatch probability at higher levels
            const matches = Math.random() > (0.4 + (level * 0.05));
            const displayColor = matches ? word.value : colorPool.filter(c => c.value !== word.value)[Math.floor(Math.random() * (colorPool.length - 1))].value;
            setGameData({ word: word.label, displayColor, matches, startTime: Date.now() });
        } else if (type === "MEMORY_GRID") {
            // Level increases sequence length
            const seqLen = Math.floor(currentRound / 3) + 2 + level;
            const sequence = Array.from({ length: seqLen }, () => Math.floor(Math.random() * 9));
            setGameData({ sequence, userSequence: [], activeTile: null, isUserTurn: false });

            // Play sequence - Level increases playback speed
            const speed = Math.max(200, 700 - (level * 100));
            (async () => {
                for (let i = 0; i < sequence.length; i++) {
                    await new Promise(r => setTimeout(r, speed));
                    setGameData(prev => ({ ...prev, activeTile: sequence[i] }));
                    await new Promise(r => setTimeout(r, speed * 0.7));
                    setGameData(prev => ({ ...prev, activeTile: null }));
                }
                setGameData(prev => ({ ...prev, isUserTurn: true }));
            })();
        } else if (type === "HAND_EYE") {
            // Level decreases target size significantly and increases offset randomness
            const padding = 10 + (level * 2);
            setGameData({
                target: {
                    x: padding + Math.random() * (100 - padding * 2),
                    y: padding + Math.random() * (100 - padding * 2)
                },
                startTime: Date.now(),
                size: Math.max(30, 110 - (level * 16))
            });
        } else if (type === "FOCUS_ATTENTION") {
            setFaceScanning(true);
            setTimeout(() => {
                setFaceScanning(false);
                setScore(prev => prev + 150);
                setGameData({
                    mood: "RELAXED",
                    stress: "LOW",
                    focus: "OPTIMAL",
                    insight: "AI detected stable ocular fixation and consistent respiratory rate."
                });
            }, 5000);
        } else if (type === "SCANNING") {
            const symbols = ["Star", "Circle", "Square", "Triangle", "Hexagon"];
            const target = symbols[Math.floor(Math.random() * symbols.length)];
            // Level increases grid density
            const gridSize = 12 + (level * 4);
            const grid = Array.from({ length: gridSize }, () => symbols[Math.floor(Math.random() * symbols.length)]);
            if (!grid.includes(target)) grid[Math.floor(Math.random() * gridSize)] = target;
            setGameData({ target, grid, startTime: Date.now() });
        } else if (type === "PERIPHERAL") {
            setGameData({ flash: null });
            const side = Math.floor(Math.random() * 4);
            const pos = [
                { x: Math.random() * 80 + 10, y: 10 },
                { x: Math.random() * 80 + 10, y: 90 },
                { x: 10, y: Math.random() * 80 + 10 },
                { x: 90, y: Math.random() * 80 + 10 }
            ][side];
            // Level reduces flash wait time
            const delay = (Math.random() * 2000 + 1000) / (level * 0.5);
            setTimeout(() => {
                setGameData({ flash: pos, startTime: Date.now() });
            }, delay);
        } else if (type === "SIMON_SAYS") {
            const sequence = Array.from({ length: 2 + level + Math.floor(currentRound / 4) }, () => Math.floor(Math.random() * 4));
            setGameData({ sequence, userSequence: [], activeTile: null, isUserTurn: false });
            const speed = Math.max(300, 800 - (level * 100));
            (async () => {
                for (let i = 0; i < sequence.length; i++) {
                    await new Promise(r => setTimeout(r, speed));
                    setGameData(prev => ({ ...prev, activeTile: sequence[i] }));
                    await new Promise(r => setTimeout(r, speed * 0.6));
                    setGameData(prev => ({ ...prev, activeTile: null }));
                }
                setGameData(prev => ({ ...prev, isUserTurn: true }));
            })();
        }
    };

    const handleAction = (correct, reactionTime = 0) => {
        if (feedback !== null) return;

        setFeedback(correct ? 'correct' : 'wrong');
        if (correct) {
            setScore(prev => prev + (reactionTime > 0 ? Math.max(10, 100 - Math.floor(reactionTime / 10)) : 20));
        }

        setTimeout(() => {
            if (currentRound < totalRounds) {
                setCurrentRound(prev => prev + 1);
                initNewRound();
            } else {
                setIsFinished(true);
                saveResult();
            }
        }, 1000);
    };

    const saveResult = async () => {
        const accuracy = Math.round((score / (totalRounds * 100)) * 100);
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user.id || user.email || 'guest';

        const result = {
            patient_id: userId,
            exercise_type: id,
            score: score,
            accuracy: accuracy,
            duration_seconds: 60,
            is_completed: 1
        };

        // 1. Save to Backend (PHP)
        try {
            await fetch(`${API_BASE_URL}/user-sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    exerciseId: id,
                    title: session?.title,
                    score: score,
                    accuracy: accuracy,
                    durationMinutes: 1 // result.duration_seconds was 60
                })
            });
            console.log('Session saved to Node.js backend');
        } catch (err) {
            console.warn('PHP Backend not reachable, saving to local only');
        }

        // 2. Save to LocalStorage (Fallback/Cache)
        const storageKey = `session_history_${userId}`;
        const history = JSON.parse(localStorage.getItem(storageKey) || '[]');
        history.unshift({ ...result, id: Date.now() });
        localStorage.setItem(storageKey, JSON.stringify(history));
    };

    if (isFinished) {
        return (
            <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="card animate-scale-up" style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ color: 'var(--primary-blue)', marginBottom: '24px' }}>
                        <Trophy size={80} />
                    </div>
                    <h1>Session Complete!</h1>
                    <p style={{ fontSize: '20px', color: 'var(--text-secondary)', marginBottom: '32px' }}>Excellent work on your training.</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                        <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '16px' }}>
                            <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>Final Score</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: 'var(--primary-blue)' }}>{score}</div>
                        </div>
                        <div style={{ padding: '24px', background: '#F8FAFC', borderRadius: '16px' }}>
                            <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '8px' }}>Accuracy</div>
                            <div style={{ fontSize: '32px', fontWeight: 800, color: '#22C55E' }}>{Math.round((score / (totalRounds * 100)) * 100)}%</div>
                        </div>
                    </div>

                    <Button onClick={() => navigate('/home')}>Return to Dashboard</Button>
                </div>
            </div>
        );
    }

    if (!isStarted) {
        return (
            <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '120px', fontWeight: 900, color: 'white', textShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                        {countdown > 0 ? countdown : 'GO!'}
                    </div>
                    <p style={{ fontSize: '24px', color: 'rgba(255,255,255,0.8)', marginTop: '20px' }}>Get Ready...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>
            {/* Game Header */}
            <header style={{ padding: '24px 40px', background: 'white', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px' }}>{session?.title}</h2>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Round {currentRound} of {totalRounds}</span>
                            <span style={{
                                padding: '2px 8px',
                                background: 'var(--secondary-blue)',
                                color: 'var(--primary-blue)',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontWeight: 800
                            }}>LEVEL {level}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '32px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>SCORE</div>
                        <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary-blue)' }}>{score}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>ROUND</div>
                        <div style={{ fontSize: '22px', fontWeight: 800 }}>{currentRound}/{totalRounds}</div>
                    </div>
                    <button
                        onClick={() => setUseAIVision(!useAIVision)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: useAIVision ? 'var(--primary-blue)' : 'white',
                            color: useAIVision ? 'white' : 'var(--text-primary)',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            border: '1px solid #E2E8F0',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        {useAIVision ? <Video size={18} /> : <VideoOff size={18} />}
                        AI VISION {useAIVision ? 'ON' : 'OFF'}
                    </button>
                </div>
            </header>

            {/* Main Game Stage */}
            <main style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                {feedback && (
                    <div style={{
                        position: 'absolute',
                        top: '20%',
                        fontSize: '48px',
                        fontWeight: 900,
                        color: feedback === 'correct' ? '#22C55E' : '#EF4444',
                        zIndex: 10,
                        animation: 'fade-up 1s forwards'
                    }}>
                        {feedback === 'correct' ? 'CORRECT!' : 'WRONG!'}
                    </div>
                )}

                {/* Reaction Speed / Time */}
                {(session.type === "REACTION_SPEED" || session.type === "REACTION_TIME") && gameData && (
                    <div style={{ textAlign: 'center' }}>
                        {gameData.show ? (
                            <div
                                onClick={() => handleAction(true, Date.now() - gameData.startTime)}
                                style={{
                                    width: `${gameData.size}px` || '300px',
                                    height: `${gameData.size}px` || '300px',
                                    borderRadius: '50%',
                                    background: gameData.color,
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '10px solid white',
                                    animation: 'pulse 0.5s infinite'
                                }}
                            >
                                <span style={{ fontSize: '40px', fontWeight: 900, color: 'white' }}>TAP!</span>
                            </div>
                        ) : (
                            <div style={{ width: '300px', height: '300px', borderRadius: '50%', background: '#F1F5F9', border: '1px solid #E2E8F0' }}></div>
                        )}
                        <p style={{ marginTop: '40px', fontSize: '18px', color: 'var(--text-secondary)' }}>Tap the circle as soon as it changes color!</p>
                    </div>
                )}

                {/* Shape Match */}
                {session.type === "SHAPE_MATCH" && gameData && (
                    <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
                        <div style={{ padding: '40px', background: 'white', borderRadius: '32px', border: '3px solid var(--primary-blue)', display: 'inline-block', marginBottom: '60px' }}>
                            <ShapeRenderer shape={gameData.target} size={100} color="var(--primary-blue)" />
                        </div>
                        <p style={{ fontSize: '20px', marginBottom: '40px' }}>Tap the matching shape below</p>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${gameData.options.length > 4 ? 3 : 4}, 1fr)`,
                            gap: '20px'
                        }}>
                            {gameData.options.map((opt, i) => (
                                <div
                                    key={i}
                                    onClick={() => handleAction(opt === gameData.target, opt === gameData.target ? Date.now() - gameData.startTime : 0)}
                                    className="card"
                                    style={{ padding: '30px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                                >
                                    <ShapeRenderer shape={opt} size={40} color="var(--primary-blue)" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Color Recognition (Stroop) */}
                {session.type === "COLOR_STROOP" && gameData && (
                    <div style={{ textAlign: 'center', width: '100%', maxWidth: '600px' }}>
                        <div style={{
                            padding: '80px',
                            background: gameData.displayColor,
                            borderRadius: '32px',
                            color: gameData.word === 'YELLOW' && gameData.displayColor === '#EAB308' ? 'black' : 'white',
                            fontSize: '80px',
                            fontWeight: 900,
                            marginBottom: '80px'
                        }}>
                            {gameData.word}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <button
                                onClick={() => handleAction(gameData.matches)}
                                style={{ background: '#22C55E', color: 'white', border: 'none', padding: '30px', borderRadius: '20px', fontSize: '24px', fontWeight: 800, cursor: 'pointer' }}
                            >TRUE</button>
                            <button
                                onClick={() => handleAction(!gameData.matches)}
                                style={{ background: '#EF4444', color: 'white', border: 'none', padding: '30px', borderRadius: '20px', fontSize: '24px', fontWeight: 800, cursor: 'pointer' }}
                            >FALSE</button>
                        </div>
                        <p style={{ marginTop: '40px', color: 'var(--text-secondary)' }}>Does the color match the word?</p>
                    </div>
                )}

                {/* Memory Grid */}
                {session.type === "MEMORY_GRID" && gameData && (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '24px', marginBottom: '40px', fontWeight: 600 }}>
                            {gameData.isUserTurn ? "Repeat the pattern" : "Watch carefully..."}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', width: '360px' }}>
                            {Array.from({ length: 9 }).map((_, i) => (
                                <div
                                    key={i}
                                    onClick={() => {
                                        if (!gameData.isUserTurn) return;
                                        const newSeq = [...gameData.userSequence, i];
                                        const correct = newSeq.every((val, idx) => val === gameData.sequence[idx]);
                                        if (!correct) handleAction(false);
                                        else if (newSeq.length === gameData.sequence.length) handleAction(true);
                                        else setGameData({ ...gameData, userSequence: newSeq });
                                    }}
                                    style={{
                                        width: '110px',
                                        height: '110px',
                                        background: gameData.activeTile === i ? 'var(--primary-blue)' : 'white',
                                        border: '2px solid #E2E8F0',
                                        borderRadius: '16px',
                                        cursor: gameData.isUserTurn ? 'pointer' : 'default',
                                        transition: 'all 0.2s',
                                        boxShadow: gameData.activeTile === i ? '0 10px 20px rgba(10, 102, 194, 0.3)' : 'none'
                                    }}
                                ></div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Hand-Eye Coordination */}
                {session.type === "HAND_EYE" && gameData && (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <div
                            onClick={() => handleAction(true, Date.now() - gameData.startTime)}
                            style={{
                                position: 'absolute',
                                top: `${gameData.target.y}%`,
                                left: `${gameData.target.x}%`,
                                width: `${gameData.size}px`,
                                height: `${gameData.size}px`,
                                background: 'var(--primary-blue)',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-lg)',
                                border: '4px solid white',
                                transition: 'all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                        />
                    </div>
                )}

                {/* AI Mood Analysis */}
                {session.type === "FOCUS_ATTENTION" && (
                    <div style={{ textAlign: 'center', width: '100%', maxWidth: '700px' }}>
                        {faceScanning ? (
                            <div className="card animate-pulse" style={{ padding: '60px', background: 'linear-gradient(135deg, #1E293B, #0F172A)', color: 'white', border: 'none' }}>
                                <BrainCircuit size={80} style={{ margin: '0 auto 32px', color: 'var(--primary-blue)' }} />
                                <h1 style={{ color: 'white' }}>AI Neuro-Scanning...</h1>
                                <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '16px' }}>Analyzing facial micro-expressions and ocular saccades</p>
                                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '40px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: 'var(--primary-blue)', animation: 'progress 5s linear forwards' }}></div>
                                </div>
                            </div>
                        ) : gameData && (
                            <div className="card animate-fade-in" style={{ padding: '40px', background: 'white' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                                    <Sparkles size={32} color="var(--primary-blue)" />
                                    <h2 style={{ margin: 0 }}>Mood & Focus Analysis</h2>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                                    <div style={{ padding: '20px', background: '#F0FDF4', borderRadius: '16px', border: '1px solid #DCFCE7' }}>
                                        <div style={{ fontSize: '12px', color: '#166534', fontWeight: 700, marginBottom: '4px' }}>MOOD</div>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803D' }}>{gameData.mood}</div>
                                    </div>
                                    <div style={{ padding: '20px', background: '#F0F9FF', borderRadius: '16px', border: '1px solid #E0F2FE' }}>
                                        <div style={{ fontSize: '12px', color: '#075985', fontWeight: 700, marginBottom: '4px' }}>STRESS</div>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#0369A1' }}>{gameData.stress}</div>
                                    </div>
                                    <div style={{ padding: '20px', background: '#FEFCE8', borderRadius: '16px', border: '1px solid #FEF9C3' }}>
                                        <div style={{ fontSize: '12px', color: '#854D0E', fontWeight: 700, marginBottom: '4px' }}>FOCUS</div>
                                        <div style={{ fontSize: '20px', fontWeight: 800, color: '#A16207' }}>{gameData.focus}</div>
                                    </div>
                                </div>
                                <div style={{ padding: '24px', background: 'var(--secondary-blue)', borderRadius: '20px', textAlign: 'left', display: 'flex', gap: '16px' }}>
                                    <AlertCircle size={24} color="var(--primary-blue)" style={{ flexShrink: 0 }} />
                                    <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}>{gameData.insight}</p>
                                </div>
                                <Button onClick={() => handleAction(true)} style={{ marginTop: '40px' }}>Complete Assessment</Button>
                            </div>
                        )}
                    </div>
                )}

                <HandTracingController
                    active={useAIVision}
                    onMove={(coords) => {
                        // Potential logic for auto-tracking
                    }}
                    onClick={(coords) => {
                        // Simulate a click at the coordinates
                        const elem = document.elementFromPoint(coords.x, coords.y);
                        if (elem) elem.click();
                    }}
                />
            </main>

            <style>{`
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
        @keyframes fade-up {
            0% { opacity: 0; transform: translateY(20px); }
            50% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-20px); }
        }
        @keyframes progress {
            from { width: 0; }
            to { width: 100%; }
        }
      `}</style>
        </div>
    );
};

const ShapeRenderer = ({ shape, size, color }) => {
    switch (shape) {
        case "Circle": return <Circle size={size} color={color} fill={color} fillOpacity={0.1} />;
        case "Square": return <Square size={size} color={color} fill={color} fillOpacity={0.1} />;
        case "Triangle": return <Triangle size={size} color={color} fill={color} fillOpacity={0.1} />;
        case "Hexagon": return <Hexagon size={size} color={color} fill={color} fillOpacity={0.1} />;
        case "Star": return <Star size={size} color={color} fill={color} fillOpacity={0.1} />;
        default: return null;
    }
};

const Button = ({ children, onClick, style }) => (
    <button onClick={onClick} className="primary-button" style={{ width: 'auto', padding: '16px 40px', fontSize: '18px', ...style }}>{children}</button>
);

export default ExercisePage;
