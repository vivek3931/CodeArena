import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timer, AlertCircle, ScanFace, Trophy } from 'lucide-react';
import ProblemDescription from './ProblemDescription';
import CodeEditorPane from './CodeEditorPane';
import ConsoleTestCasePane from './ConsoleTestCasePane';
import FaceRecognition from './FaceRecognition';

const CodingWorkspace = () => {
    const { problemId, contestId } = useParams();
    const navigate = useNavigate();
    const [problem, setProblem] = useState(null);
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const [localTimeLeft, setLocalTimeLeft] = useState('');
    const [localIsEnded, setLocalIsEnded] = useState(false);
    const [code, setCode] = useState('// Write your solution here\n');

    // Shared State for Left Pane Tabs & Arena Bot
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [showHintOverlay, setShowHintOverlay] = useState(false);
    const [submissions, setSubmissions] = useState([]); // track run history
    const [requestTabChange, setRequestTabChange] = useState(null); // Signal ProblemDescription to change tab

    // Strict Mode Anti-Cheat States
    const [isCheatingLocked, setIsCheatingLocked] = useState(false);
    const [violationStrikes, setViolationStrikes] = useState(0);
    const [showWarningOverlay, setShowWarningOverlay] = useState(false);
    const [violationMsg, setViolationMsg] = useState('');
    const [preContestAccepted, setPreContestAccepted] = useState(false);

    // Final Contest Summary Modal
    const [showContestSummary, setShowContestSummary] = useState(false);
    const [contestFinalPoints, setContestFinalPoints] = useState(0);

    // Pre-Contest Setup States
    const [preContestFaceVerified, setPreContestFaceVerified] = useState(false);
    const [setupStatusMsg, setSetupStatusMsg] = useState('Initializing Camera...');
    const setupVideoRef = useRef(null);
    const setupCanvasRef = useRef(null);
    const setupStreamRef = useRef(null);

    // Resizable panel states
    const [leftWidth, setLeftWidth] = useState(45); // percentage
    const [editorHeight, setEditorHeight] = useState(55); // percentage
    const [maximizedPanel, setMaximizedPanel] = useState(null); // null | 'problem' | 'editor' | 'console'
    const containerRef = useRef(null);
    const rightPaneRef = useRef(null);
    const isDraggingH = useRef(false);
    const isDraggingV = useRef(false);

    // Horizontal resize handler (left/right panes)
    const handleHMouseDown = useCallback((e) => {
        e.preventDefault();
        isDraggingH.current = true;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        const onMouseMove = (e) => {
            if (!isDraggingH.current || !containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            const pct = ((e.clientX - rect.left) / rect.width) * 100;
            setLeftWidth(Math.min(Math.max(pct, 20), 75));
        };

        const onMouseUp = () => {
            isDraggingH.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, []);

    // Vertical resize handler (editor/console in right pane)
    const handleVMouseDown = useCallback((e) => {
        e.preventDefault();
        isDraggingV.current = true;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';

        const onMouseMove = (e) => {
            if (!isDraggingV.current || !rightPaneRef.current) return;
            const rect = rightPaneRef.current.getBoundingClientRect();
            const pct = ((e.clientY - rect.top) / rect.height) * 100;
            setEditorHeight(Math.min(Math.max(pct, 20), 85));
        };

        const onMouseUp = () => {
            isDraggingV.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }, []);

    const handleMaximize = useCallback((panel) => {
        setMaximizedPanel(prev => prev === panel ? null : panel);
    }, []);

    useEffect(() => {
        const fetchWorkspaceData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/auth');
                    return;
                }

                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch Problem Data
                if (problemId) {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems/${problemId}`, { headers });
                    if (res.ok) setProblem(await res.json());
                }

                // Fetch Contest Data if in contest mode
                if (contestId) {
                    const cres = await fetch(`${import.meta.env.VITE_API_URL}/api/contests/${contestId}`, { headers });
                    if (cres.ok) {
                        const cdata = await cres.json();
                        setContest(cdata);
                    }

                    // Check if disqualified
                    const pres = await fetch(`${import.meta.env.VITE_API_URL}/api/contests/${contestId}/progress`, { headers });
                    if (pres.ok) {
                        const pdata = await pres.json();
                        if (pdata.isDisqualified) {
                            navigate('/contests', { state: { error: 'You have been disqualified from this contest due to cheating strikes.' } });
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch coding data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkspaceData();
    }, [problemId, contestId, navigate]);

    // Timer Logic for Contests
    useEffect(() => {
        if (!contest || !contest.endTime) return;

        const updateGlobalTimer = () => {
            const end = new Date(contest.endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance <= 0) {
                setTimeLeft("CONTEST ENDED");
                return true;
            }

            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
            return false;
        };

        const isEnded = updateGlobalTimer();
        if (isEnded) return;

        const interval = setInterval(() => {
            if (updateGlobalTimer()) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [contest]);

    // Problem-Specific Timer Logic
    useEffect(() => {
        if (!problem || !contest || !problem.timeLimit || problem.timeLimit === 0) return;

        // Wait for strict validation acceptance before starting local problem timer
        if (contest.strictValidation && !preContestAccepted) {
            setLocalTimeLeft(`${String(problem.timeLimit).padStart(2, '0')}:00`);
            return;
        }

        const storageKey = `codearena_timer_${contest._id}_${problem._id}`;
        let startedAt = localStorage.getItem(storageKey);
        if (!startedAt) {
            startedAt = new Date().getTime();
            localStorage.setItem(storageKey, startedAt);
        }

        const limitMs = problem.timeLimit * 60 * 1000;

        const updateLocalTimer = () => {
            const now = new Date().getTime();
            const elapsed = now - parseInt(startedAt, 10);
            const remaining = limitMs - elapsed;

            if (remaining <= 0) {
                setLocalTimeLeft("00:00:00");
                setLocalIsEnded(true);
                return true;
            }

            const m = Math.floor(remaining / (1000 * 60));
            const s = Math.floor((remaining % (1000 * 60)) / 1000);
            setLocalTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
            return false;
        };

        const isEnded = updateLocalTimer();
        if (isEnded) return;

        const interval = setInterval(() => {
            if (updateLocalTimer()) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [problem, contest, preContestAccepted]);

    // Anti-Cheat: Tab Switching / Screen Freezing Detection
    useEffect(() => {
        if (!contest || !contest.strictValidation || isCheatingLocked || localIsEnded || timeLeft === 'CONTEST ENDED') return;
        if (!preContestAccepted) return; // Don't track tab switching until they actually start

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleFaceViolation('Tab switching or window minimization detected (Screen Freeze).');
            }
        };

        const handleBlur = () => {
            handleFaceViolation('Focus lost. Clicking outside the contest window is prohibited.');
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, [contest, isCheatingLocked, localIsEnded, timeLeft, preContestAccepted]);

    // Pre-Contest Camera Setup Verification
    useEffect(() => {
        if (!contest || !contest.strictValidation || preContestAccepted || isCheatingLocked) return;

        let interval;
        let setupMounted = true;

        const startSetupCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (!setupMounted) { stream.getTracks().forEach(t => t.stop()); return; }
                setupStreamRef.current = stream;
                if (setupVideoRef.current) {
                    setupVideoRef.current.srcObject = stream;
                }
                setSetupStatusMsg('Scanning face...');
            } catch (err) {
                console.error("Setup Camera access denied:", err);
                setSetupStatusMsg('Camera access denied. Please allow camera and check privacy shutter.');
            }
        };

        startSetupCamera();

        const captureAndVerifySetup = async () => {
            if (!setupVideoRef.current || !setupCanvasRef.current) return;
            const video = setupVideoRef.current;
            const canvas = setupCanvasRef.current;
            const ctx = canvas.getContext('2d');

            if (video.readyState === video.HAVE_ENOUGH_DATA) {
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/jpeg', 0.8);

                try {
                    const response = await fetch('http://localhost:8000/verify-face', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: imageData })
                    });

                    const data = await response.json();

                    if (data.status === 'success') {
                        setPreContestFaceVerified(true);
                        setSetupStatusMsg('Identity Verified. You may begin.');
                    } else if (data.status === 'warning') {
                        setPreContestFaceVerified(false);
                        setSetupStatusMsg(`Validation Failed: ${data.message}`);
                    }
                } catch (error) {
                    console.error("Setup API Error:", error);
                    setSetupStatusMsg("Error connecting to Face Recognition server.");
                }
            }
        };

        interval = setInterval(captureAndVerifySetup, 2000);

        return () => {
            setupMounted = false;
            clearInterval(interval);
            // ALWAYS release the camera stream on cleanup
            if (setupStreamRef.current) {
                setupStreamRef.current.getTracks().forEach(track => track.stop());
                setupStreamRef.current = null;
                console.log('[PreFlight] Camera stream released');
            }
        };
    }, [contest, preContestAccepted, isCheatingLocked]);

    if (!loading && !problem) {
        return (
            <div className="flex-1 flex justify-center items-center h-full bg-[#120a06] text-red-500 font-bold">
                <AlertCircle size={24} className="mr-2" /> Problem not found or incorrect ID.
            </div>
        );
    }

    const isLocked = localIsEnded || timeLeft === 'CONTEST ENDED' || isCheatingLocked;

    // Callback from FaceRecognition if user covers camera or leaves
    const handleFaceViolation = (msg) => {
        if (isCheatingLocked) return;

        setViolationStrikes(prev => {
            const newStrikes = prev + 1;
            setViolationMsg(`Warning ${newStrikes}/3: ${msg || 'Camera tampering or absence detected.'}`);

            if (newStrikes >= 3) {
                setIsCheatingLocked(true);
                setShowWarningOverlay(false); // Hide warning, show permanent lock

                // Call backend to permanently disqualify
                if (contestId) {
                    const token = localStorage.getItem('token');
                    fetch(`${import.meta.env.VITE_API_URL}/api/contests/${contestId}/disqualify`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` }
                    }).catch(console.error);
                }
            } else {
                setShowWarningOverlay(true);
            }
            return newStrikes;
        });
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-[#120a06]">

            {/* Contest Header Toolbar */}
            {contest && (
                <div className="bg-[#1a1310] border-b border-[#2d1e16] px-4 py-3 md:py-2 flex flex-col sm:flex-row justify-between items-center gap-3 shadow-lg z-10">
                    <div className="flex items-center gap-3">
                        <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Live Contest</span>
                        <span className="text-white font-bold text-sm text-center">{contest.title}</span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Local Problem Timer */}
                        {problem?.timeLimit > 0 && (
                            <div className={`flex flex-col items-end`}>
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Problem Time Limit</div>
                                <div className={`flex items-center gap-2 px-3 py-1 rounded-md font-mono font-bold border ${localIsEnded ? 'bg-red-500/10 text-red-500 border-red-500/30' : 'bg-[#2a1a10] text-yellow-500 border-yellow-500/30'}`}>
                                    <Timer size={14} />
                                    {localIsEnded ? "TIME'S UP" : localTimeLeft || '00:00'}
                                </div>
                            </div>
                        )}

                        {/* Global Contest Timer */}
                        <div className="flex flex-col items-end">
                            <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Global Arena End</div>
                            <div className="flex items-center gap-2 bg-[#2a1a10] text-[var(--color-primary)] px-3 py-1 rounded-md font-mono font-bold border border-[#4a2311] shadow-[0_0_15px_rgba(246,107,21,0.2)]">
                                <Timer size={14} />
                                {timeLeft || '00:00:00'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={containerRef} className="flex-1 flex flex-col md:flex-row p-2 h-full overflow-hidden relative">
                {/* Left Pane: Problem Description */}
                {maximizedPanel !== 'editor' && maximizedPanel !== 'console' && (
                    <div
                        className={`flex flex-col min-h-0 rounded-md transition-all duration-200 ${showHintOverlay ? 'z-[101] ring-2 ring-indigo-500/60 shadow-[0_0_40px_rgba(99,102,241,0.2)]' : 'z-10'}`}
                        style={{
                            width: maximizedPanel === 'problem' ? '100%' : `${leftWidth}%`,
                            flexShrink: 0,
                        }}
                    >
                        <ProblemDescription
                            problem={problem}
                            isLoading={loading}
                            wrongAttempts={wrongAttempts}
                            showHintOverlay={showHintOverlay}
                            setShowHintOverlay={setShowHintOverlay}
                            submissions={submissions}
                            requestTabChange={requestTabChange}
                            isMaximized={maximizedPanel === 'problem'}
                            onMaximize={() => handleMaximize('problem')}
                        />
                    </div>
                )}

                {/* Horizontal Resize Handle */}
                {!maximizedPanel && (
                    <div
                        className="hidden md:flex w-[6px] cursor-col-resize items-center justify-center group shrink-0 mx-0 z-20 relative"
                        onMouseDown={handleHMouseDown}
                    >
                        <div className="w-[3px] h-10 rounded-full bg-[#2d1e16] group-hover:bg-[var(--color-primary)] group-active:bg-[var(--color-primary)] transition-colors" />
                    </div>
                )}

                {/* Right Pane: Code Editor and Console */}
                {maximizedPanel !== 'problem' && (
                    <div
                        ref={rightPaneRef}
                        className="flex flex-col min-h-0 z-10 h-full"
                        style={{
                            width: maximizedPanel === 'editor' || maximizedPanel === 'console' ? '100%' : `${100 - leftWidth}%`,
                            flexShrink: 0,
                        }}
                    >
                        {/* Editor */}
                        {maximizedPanel !== 'console' && (
                            <div style={{ flex: maximizedPanel === 'editor' ? '1 1 100%' : `${editorHeight} 1 0%`, minHeight: 0, overflow: 'hidden' }}>
                                <CodeEditorPane
                                    code={code}
                                    setCode={setCode}
                                    disabled={isLocked}
                                    isMaximized={maximizedPanel === 'editor'}
                                    onMaximize={() => handleMaximize('editor')}
                                />
                            </div>
                        )}

                        {/* Vertical Resize Handle */}
                        {!maximizedPanel && (
                            <div
                                className="h-[6px] cursor-row-resize flex items-center justify-center group shrink-0 my-0 z-20 relative"
                                onMouseDown={handleVMouseDown}
                            >
                                <div className="h-[3px] w-10 rounded-full bg-[#2d1e16] group-hover:bg-[var(--color-primary)] group-active:bg-[var(--color-primary)] transition-colors" />
                            </div>
                        )}

                        {/* Console */}
                        {maximizedPanel !== 'editor' && (
                            <div style={{ flex: maximizedPanel === 'console' ? '1 1 100%' : `${100 - editorHeight} 1 0%`, minHeight: 0, overflow: 'hidden' }}>
                                <ConsoleTestCasePane
                                    testCases={problem?.testCases || []}
                                    code={code}
                                    problemId={problem?._id}
                                    contestId={contestId}
                                    onFinishContest={(points) => {
                                        setContestFinalPoints(points);
                                        setShowContestSummary(true);
                                    }}
                                    isLoading={loading}
                                    wrongAttempts={wrongAttempts}
                                    setWrongAttempts={setWrongAttempts}
                                    setShowHintOverlay={setShowHintOverlay}
                                    submissions={submissions}
                                    setSubmissions={setSubmissions}
                                    setRequestTabChange={setRequestTabChange}
                                    disabled={isLocked}
                                    isMaximized={maximizedPanel === 'console'}
                                    onMaximize={() => handleMaximize('console')}
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Overall Screen Backdrop for Arena Bot Spotlight */}
                {showHintOverlay && (
                    <div
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm pointer-events-auto flex justify-center items-center"
                        onClick={() => setShowHintOverlay(false)}
                    >
                        <div className="absolute top-[200px] left-[15%] md:left-[25%] flex flex-col items-center pointer-events-none">
                            <div className="bg-[#1e1a3b] text-indigo-100 font-bold p-4 rounded-lg shadow-2xl mb-4 text-center max-w-sm border border-indigo-500/50 relative text-lg animate-bounce">
                                Arena Bot noticed you might be stuck! I've opened a hint for you on the left.
                                <div className="absolute -top-3 left-[20%] w-6 h-6 bg-[#1e1a3b] border-t border-l border-indigo-500/50 transform rotate-45"></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Pre-Contest Disclaimer Overlay */}
            {contest?.strictValidation && !preContestAccepted && !isCheatingLocked && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-[#1a1310] border border-[var(--color-primary)]/30 rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-[0_0_50px_rgba(246,107,21,0.15)] relative overflow-y-auto max-h-[90vh] custom-scrollbar">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50"></div>

                        <div className="flex items-center justify-center mb-6">
                            <div className="w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center border border-[var(--color-primary)]/20 text-[var(--color-primary)]">
                                <AlertCircle size={32} />
                            </div>
                        </div>

                        <h2 className="text-3xl font-black text-white text-center mb-2 tracking-tight">Strict Mode Enforcement</h2>
                        <p className="text-gray-400 text-center mb-8">Please read carefully before beginning your challenge.</p>

                        <div className="space-y-4 mb-8">
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-4 items-start">
                                <ScanFace className="text-red-500 shrink-0 mt-1" size={24} />
                                <div>
                                    <h3 className="text-red-500 font-bold mb-1">Live AI Facial Tracking</h3>
                                    <p className="text-red-200/70 text-sm">Your webcam is monitored by AI using real-time head pose estimation. Head tilting, looking away, face absence, or camera covering will trigger warnings. <strong className="text-red-400">3 warnings = automatic contest termination.</strong></p>
                                </div>
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex gap-4 items-start">
                                <AlertCircle className="text-red-500 shrink-0 mt-1" size={24} />
                                <div>
                                    <h3 className="text-red-500 font-bold mb-1">Screen Freezing Protocol</h3>
                                    <p className="text-red-200/70 text-sm">Tab switching, minimizing the browser, or clicking outside the interface will count as a warning strike. <strong className="text-red-400">3 total strikes across all categories ends your contest.</strong></p>
                                </div>
                            </div>
                        </div>

                        {/* Pre-Contest Camera Validation Box */}
                        <div className={`mb-8 p-4 rounded-xl border flex flex-col items-center justify-center transition-colors ${preContestFaceVerified ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                            <h3 className={`font-bold mb-3 uppercase tracking-wider text-xs ${preContestFaceVerified ? 'text-green-500' : 'text-red-500'}`}>
                                Pre-Flight Camera Check
                            </h3>

                            <div className="w-48 h-36 bg-black rounded-lg overflow-hidden border-2 border-[#2d1e16] relative mb-3">
                                <video
                                    ref={setupVideoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className={`w-full h-full object-cover transition-opacity ${preContestFaceVerified ? 'opacity-100' : 'opacity-50 grayscale'}`}
                                />
                                <canvas ref={setupCanvasRef} width={320} height={240} className="hidden" />
                            </div>

                            <p className={`text-sm text-center font-bold ${preContestFaceVerified ? 'text-green-400' : 'text-red-400 animate-pulse'}`}>
                                {setupStatusMsg}
                            </p>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => {
                                    if (setupStreamRef.current) {
                                        setupStreamRef.current.getTracks().forEach(track => track.stop());
                                    }
                                    setPreContestAccepted(true);
                                }}
                                disabled={!preContestFaceVerified}
                                className={`px-8 py-4 font-black rounded-xl transition-all shadow-lg w-full text-lg uppercase tracking-wider ${preContestFaceVerified
                                    ? 'bg-[var(--color-primary)] hover:bg-[#d55a0f] text-white hover:shadow-[var(--color-primary)]/20 hover:-translate-y-1'
                                    : 'bg-[#2d1e16] text-gray-500 cursor-not-allowed border border-[#4a2311]'
                                    }`}
                            >
                                {preContestFaceVerified ? 'I Accept & Begin Challenge' : 'Awaiting Face Verification...'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Temporary Warning Overlay (Strikes 1 & 2) */}
            {showWarningOverlay && !isCheatingLocked && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4">
                    <AlertCircle size={80} className="text-yellow-500 mb-6 animate-bounce" />
                    <h1 className="text-4xl md:text-5xl font-black text-yellow-500 tracking-tight text-center mb-4 uppercase">Warning {violationStrikes} of 3</h1>
                    <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-200 px-6 py-4 rounded-xl max-w-lg text-center font-bold text-lg mb-8 shadow-[0_0_50px_rgba(234,179,8,0.2)]">
                        {violationMsg}
                    </div>
                    <p className="text-gray-400 text-center max-w-md mb-8">
                        Please return to the contest immediately and ensure your face is clearly visible. A 3rd violation will result in immediate termination.
                    </p>
                    <button
                        onClick={() => setShowWarningOverlay(false)}
                        className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 font-black text-black rounded-xl transition-all shadow-lg text-lg uppercase tracking-wider hover:scale-105 active:scale-95"
                    >
                        I Understand, Return to Contest
                    </button>
                </div>
            )}

            {/* Anti-Cheat Lockdown Overlay (Strike 3) */}
            {isCheatingLocked && (
                <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center p-4">
                    <AlertCircle size={80} className="text-red-500 mb-6 animate-pulse" />
                    <h1 className="text-4xl md:text-5xl font-black text-red-500 tracking-tight text-center mb-4 uppercase">Contest Terminated</h1>
                    <div className="bg-red-500/10 border border-red-500/30 text-red-200 px-6 py-4 rounded-xl max-w-lg text-center font-bold text-lg mb-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                        {violationMsg}
                    </div>
                    <p className="text-gray-400 text-center max-w-md">
                        You have received 3 strikes for repeated Anti-Cheat violations. Your activity has been flagged and you can no longer interact with the workspace.
                    </p>
                    <button
                        onClick={() => window.location.href = '/contests'}
                        className="mt-8 px-6 py-3 bg-[#1a1310] hover:bg-[#2a1a10] border border-red-500/30 text-red-500 font-bold rounded-lg transition-colors"
                    >
                        Exit Workspace
                    </button>
                </div>
            )}

            {/* Final Contest Summary Modal */}
            {showContestSummary && (
                <div className="fixed inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md">
                    <div className="bg-[#1a1310] border border-green-500/30 rounded-2xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(34,197,94,0.15)] relative overflow-hidden flex flex-col items-center text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-80"></div>

                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30 text-green-500 mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                            <Trophy size={40} className="animate-bounce" />
                        </div>

                        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 uppercase">Contest Complete!</h2>
                        <p className="text-gray-400 mb-8">You successfully solved all problems in this contest.</p>

                        <div className="bg-[#120a06] border border-[#2d1e16] w-full rounded-xl p-6 mb-8">
                            <div className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Total Points Earned</div>
                            <div className="text-5xl font-mono font-black text-green-500 tracking-tighter">
                                {contestFinalPoints.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Global Rank Updated
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/contests')}
                            className="w-full py-4 bg-green-500 hover:bg-green-600 text-black font-black rounded-xl transition-all shadow-lg text-lg uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98]"
                        >
                            Return to Contests View
                        </button>
                    </div>
                </div>
            )}

            {/* Strict Validation Face Recognition Wrapper */}
            {contest?.strictValidation && preContestAccepted && !isCheatingLocked && (
                <FaceRecognition
                    active={true}
                    onViolation={handleFaceViolation}
                />
            )}

        </div>
    );
};

export default CodingWorkspace;
