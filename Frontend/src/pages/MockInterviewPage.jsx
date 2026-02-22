import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Send, Play, Square, Loader2, BrainCircuit, Code2, Sparkles, User, RefreshCw, CheckCircle2, ChevronRight, MessageSquare } from 'lucide-react';
import useSpeech from '../hooks/useSpeech';
import CodeEditorPane from '../components/CodeEditorPane';
import ReactMarkdown from 'react-markdown';

const MockInterviewPage = () => {
    const navigate = useNavigate();
    const { speak, startListening, stopListening, isSpeaking, isListening, transcript, error: speechError } = useSpeech();

    const [interviewState, setInterviewState] = useState('SETUP'); // SETUP, CHATTING, CODING, LOADING, FINISHED
    const [chatHistory, setChatHistory] = useState([]);
    const [isCodingRound, setIsCodingRound] = useState(false);
    const [dsaQuestion, setDsaQuestion] = useState(null);
    const [code, setCode] = useState('// Write your solution here...\n');
    const [finalReport, setFinalReport] = useState(null);
    const [userContext, setUserContext] = useState({ goal: 'FAANG Software Engineer', experience: 'Intermediate' });

    // Auto-scroll chat
    const chatEndRef = useRef(null);
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, transcript]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
        }
    }, [navigate]);

    const startInterview = async () => {
        setInterviewState('LOADING');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interview/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(userContext)
            });
            const data = await res.json();
            if (res.ok && data.aiResponse) {
                setChatHistory(data.chatHistory);
                handleAiResponse(data.aiResponse);
            } else {
                alert("Failed to start interview.");
                setInterviewState('SETUP');
            }
        } catch (error) {
            console.error("Error connecting to interview server", error);
            setInterviewState('SETUP');
        }
    };

    const handleAiResponse = (responseObj) => {
        if (responseObj.isInterviewOver) {
            handleFinalize();
            return;
        }

        setDsaQuestion(responseObj.dsaQuestion || null);
        setIsCodingRound(responseObj.isCodingRound || false);
        setInterviewState(responseObj.isCodingRound ? 'CODING' : 'CHATTING');

        // Speak the response, and start listening automatically if it's a chat round
        speak(responseObj.responseText, () => {
            if (!responseObj.isCodingRound && !responseObj.isInterviewOver) {
                setTimeout(() => {
                    startListening();
                }, 1000);
            }
        });
    };

    const submitAnswer = async (manualText = null) => {
        stopListening();
        setInterviewState('LOADING');

        const messageToSubmit = manualText !== null ? manualText : transcript;

        // Optimistic UI update
        const tempHistory = [...chatHistory, { role: "user", content: messageToSubmit }];
        setChatHistory(tempHistory);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interview/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ chatHistory: tempHistory, userMessage: messageToSubmit })
            });
            const data = await res.json();

            if (res.ok && data.aiResponse) {
                setChatHistory(data.chatHistory);
                handleAiResponse(data.aiResponse);
            }
        } catch (error) {
            console.error("Error submitting answer", error);
            setInterviewState('CHATTING');
        }
    };

    const submitCode = () => {
        const message = `User submitted the following code solution:\n\n\`\`\`\n${code}\n\`\`\`\nPlease review this code for time/space complexity, correctness, and provide feedback. Then ask the next question or conclude.`;
        submitAnswer(message);
    };

    const handleFinalize = async () => {
        setInterviewState('LOADING');
        stopListening();
        window.speechSynthesis?.cancel();

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/interview/finalize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ chatHistory, codeSubmission: code })
            });
            const data = await res.json();
            if (res.ok) {
                setFinalReport(data);
                setInterviewState('FINISHED');
                speak("The interview is now over. I have compiled a comprehensive feedback report for you to review. Thank you for your time.");
            }
        } catch (error) {
            console.error("Error finalizing", error);
        }
    };

    // Render Setup
    if (interviewState === 'SETUP') {
        return (
            <div className="flex-1 min-h-screen bg-black flex items-center justify-center p-6">
                <div className="bg-[#1a1310] border border-[var(--color-primary)]/30 rounded-2xl p-8 max-w-lg w-full shadow-[0_0_50px_rgba(246,107,21,0.1)]">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/20 flex items-center justify-center border border-[var(--color-primary)]/50 animate-pulse">
                            <BrainCircuit size={40} className="text-[var(--color-primary)]" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white text-center mb-2">AI Mock Interview</h1>
                    <p className="text-gray-400 text-center text-sm mb-8">An immersive, voice-based interview experience powered by Llama 3.3 70b.</p>

                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Target Role / Goal</label>
                            <input
                                type="text"
                                className="w-full bg-[#120a06] border border-[#2d1e16] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                                value={userContext.goal}
                                onChange={(e) => setUserContext(prev => ({ ...prev, goal: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Current Experience</label>
                            <select
                                className="w-full bg-[#120a06] border border-[#2d1e16] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors appearance-none"
                                value={userContext.experience}
                                onChange={(e) => setUserContext(prev => ({ ...prev, experience: e.target.value }))}
                            >
                                <option value="Beginner">Beginner (Student / Fresher)</option>
                                <option value="Intermediate">Intermediate (1-3 YOE)</option>
                                <option value="Advanced">Advanced (4+ YOE)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={startInterview}
                        className="w-full py-4 bg-[var(--color-primary)] hover:bg-[#e05a0d] text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(246,107,21,0.3)] hover:shadow-[0_0_30px_rgba(246,107,21,0.5)] flex items-center justify-center gap-2"
                    >
                        <Play size={18} fill="currentColor" /> Start Interview
                    </button>
                    <div className="mt-4 text-xs text-center text-gray-500 font-medium">
                        Ensure your microphone is connected and volume is turned up.
                    </div>
                </div>
            </div>
        );
    }

    // Render Final Report
    if (interviewState === 'FINISHED' && finalReport) {
        return (
            <div className="flex-1 min-h-screen bg-[#120a06] p-4 md:p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-[#1a1310] border border-green-500/30 rounded-2xl p-8 mb-8 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#2d1e16]">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/50">
                                <CheckCircle2 size={32} className="text-green-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold text-white">Interview Complete</h1>
                                <p className="text-gray-400">Here is your comprehensive feedback report.</p>
                            </div>
                            <div className="ml-auto text-center bg-[#120a06] border border-[#2d1e16] rounded-xl px-6 py-3">
                                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Overall Score</div>
                                <div className="text-3xl font-extrabold text-[var(--color-primary)]">{finalReport.overallScore}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center gap-2"><Sparkles size={18} /> Strengths</h3>
                                <ul className="space-y-2">
                                    {finalReport.strengths?.map((s, i) => (
                                        <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></div>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-6">
                                <h3 className="text-lg font-bold text-orange-400 mb-4 flex items-center gap-2"><RefreshCw size={18} /> Areas for Improvement</h3>
                                <ul className="space-y-2">
                                    {finalReport.areasForImprovement?.map((s, i) => (
                                        <li key={i} className="text-gray-300 text-sm flex items-start gap-2">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0"></div>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {finalReport.codeEvaluation && (
                            <div className="bg-[#120a06] border border-[#2d1e16] rounded-xl p-6">
                                <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2"><Code2 size={18} /> Code Evaluation</h3>
                                <div className="text-gray-300 text-sm leading-relaxed prose prose-invert max-w-none">
                                    <ReactMarkdown>{finalReport.codeEvaluation}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={() => navigate('/contests')}
                                className="px-6 py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl hover:bg-[#e05a0d] transition-all"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Render Active Interview (Chatting / Coding / Loading)
    return (
        <div className="flex-1 flex flex-col md:flex-row min-h-screen bg-[#0a0705] overflow-hidden">

            {/* Left Side: Chat & AI Visualization */}
            <div className={`flex flex-col flex-1 h-screen border-r border-[#2d1e16] transition-all duration-500 ${isCodingRound ? 'md:w-1/3 max-w-sm' : 'w-full max-w-3xl mx-auto border-r-0'}`}>

                {/* Visualizer Header */}
                <div className="h-64 md:h-80 bg-gradient-to-b from-[#1a1310] to-[#0a0705] border-b border-[#2d1e16] flex flex-col items-center justify-center relative overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                    {/* The AI Orb */}
                    <div className="relative z-10">
                        {isSpeaking && (
                            <div className="absolute inset-0 bg-[var(--color-primary)] rounded-full blur-[80px] opacity-40 animate-pulse"></div>
                        )}
                        {isListening && (
                            <div className="absolute inset-0 bg-blue-500 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
                        )}
                        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-2xl transition-all duration-500 ease-in-out ${isSpeaking ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] scale-110' : isListening ? 'bg-blue-500/10 border-blue-500/50 scale-100' : 'bg-[#120a06] border-[#2d1e16] scale-95'}`}>
                            {interviewState === 'LOADING' ? (
                                <Loader2 size={40} className="text-[var(--color-primary)] animate-spin" />
                            ) : (
                                <BrainCircuit size={48} className={isSpeaking ? 'text-[var(--color-primary)] animate-pulse' : 'text-gray-500'} />
                            )}
                        </div>
                    </div>

                    <div className="mt-8 relative z-10 flex flex-col items-center">
                        <div className="flex items-center gap-2 bg-[#120a06] px-4 py-1.5 rounded-full border border-[#2d1e16]">
                            <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-[var(--color-primary)] animate-ping' : isListening ? 'bg-blue-500 animate-pulse' : 'bg-gray-600'}`}></div>
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                                {isSpeaking ? 'AI is speaking...' : isListening ? 'Listening...' : interviewState === 'LOADING' ? 'Thinking...' : 'Idle'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Subtitles / Chat Log */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-[#0a0705]">
                    {chatHistory.filter(m => m.role !== 'system').map((msg, idx) => {
                        const isAi = msg.role === 'assistant';
                        const text = isAi ? JSON.parse(msg.content).responseText : msg.content;
                        return (
                            <div key={idx} className={`flex gap-3 ${isAi ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isAi ? 'bg-[var(--color-primary)]/20 border border-[var(--color-primary)]/30' : 'bg-[#2d1e16] border border-[#3d2e26]'}`}>
                                    {isAi ? <BrainCircuit size={16} className="text-[var(--color-primary)]" /> : <User size={16} className="text-gray-400" />}
                                </div>
                                <div className={`px-4 py-3 rounded-2xl text-sm prose prose-invert max-w-none leading-tight ${isAi ? 'bg-[#1a1310] text-gray-200 border border-[#2d1e16] rounded-tl-none' : 'bg-[#2d1e16] text-gray-300 border border-[#4a2e20] rounded-tr-none'}`}>
                                    <ReactMarkdown>{text}</ReactMarkdown>
                                </div>
                            </div>
                        );
                    })}

                    {/* Live Transcript Bubble */}
                    {(isListening || transcript) && !isCodingRound && (
                        <div className="flex gap-3 flex-row-reverse opacity-80 animate-fade-in">
                            <div className="w-8 h-8 rounded-lg bg-[#2d1e16] border border-[#3d2e26] flex items-center justify-center shrink-0">
                                <User size={16} className="text-gray-400" />
                            </div>
                            <div className="px-4 py-3 rounded-2xl text-sm bg-blue-500/10 text-blue-200 border border-blue-500/20 rounded-tr-none">
                                {transcript || <span className="animate-pulse">Listening...</span>}
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Microphone Controls (Only show if not coding) */}
                {!isCodingRound && (
                    <div className="p-4 bg-[#1a1310] border-t border-[#2d1e16]">
                        {speechError && <div className="text-red-500 text-xs text-center mb-2">{speechError}</div>}

                        <div className="flex items-center gap-3">
                            <button
                                onClick={isListening ? stopListening : startListening}
                                disabled={isSpeaking || interviewState === 'LOADING'}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${isListening
                                    ? 'bg-red-500/20 text-red-500 border border-red-500/40 hover:bg-red-500/30'
                                    : 'bg-[#2d1e16] text-gray-300 hover:bg-[#3d2e26] disabled:opacity-50'}`}
                            >
                                {isListening ? <><Square size={16} fill="currentColor" /> Stop Recording</> : <><Mic size={16} /> Tap to Speak</>}
                            </button>

                            <button
                                onClick={() => submitAnswer()}
                                disabled={!transcript || interviewState === 'LOADING'}
                                className="px-6 py-3 bg-[var(--color-primary)] hover:bg-[#e05a0d] text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-30 disabled:hover:bg-[var(--color-primary)] transition-all shadow-lg"
                            >
                                <Send size={16} /> Submit
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Side: DSA Coding Area */}
            {isCodingRound && (
                <div className="flex-1 flex flex-col h-screen animate-slide-in-right bg-[#0a0705]">
                    <div className="bg-[#1a1310] border-b border-[#2d1e16] p-4 flex items-center gap-3">
                        <Code2 className="text-[var(--color-primary)]" size={20} />
                        <h2 className="text-lg font-bold text-white">Technical Round</h2>
                    </div>

                    <div className="p-6 bg-[#120a06] border-b border-[#2d1e16] shrink-0">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Problem Statement</h3>
                        <div className="text-gray-200 prose prose-invert max-w-none text-sm leading-relaxed prose-code:font-bold prose-code:text-[var(--color-primary)] prose-code:bg-transparent prose-code:px-0">
                            <ReactMarkdown>{dsaQuestion}</ReactMarkdown>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative border-b border-[#2d1e16]">
                        {/* We use CodeEditorPane, injecting our local code state */}
                        <div className="absolute inset-0">
                            <CodeEditorPane code={code} setCode={setCode} disabled={interviewState === 'LOADING'} isMaximized={false} onMaximize={() => { }} />
                        </div>
                    </div>

                    <div className="p-4 bg-[#1a1310] flex justify-end shrink-0">
                        <button
                            onClick={submitCode}
                            disabled={interviewState === 'LOADING'}
                            className="px-8 py-3 bg-gradient-to-r from-[var(--color-primary)] to-orange-600 hover:from-[#e05a0d] hover:to-orange-700 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(246,107,21,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {interviewState === 'LOADING' ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                            Submit Code
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MockInterviewPage;
