import React, { useState } from 'react';
import { CheckCircle2, TerminalSquare, ChevronDown, Play, CloudUpload, Plus, Loader2, Bot, ArrowDown, Expand, Minimize2, ArrowRight, Trophy } from 'lucide-react';
import { marked } from 'marked';
import { useNavigate } from 'react-router-dom';

const ConsoleTestCasePane = ({
    testCases = [], code, problemId, isLoading,
    contestId, onFinishContest,
    wrongAttempts, setWrongAttempts, setShowHintOverlay,
    submissions, setSubmissions, setRequestTabChange, disabled,
    isMaximized, onMaximize
}) => {
    const navigate = useNavigate();
    const visibleCases = testCases || [];
    const [activeTab, setActiveTab] = useState(0);
    const [viewMode, setViewMode] = useState('TESTCASE'); // TESTCASE or CONSOLE
    const [loading, setLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);

    const handleSubmit = async () => {
        if (!problemId) return;

        const cleanCode = code ? code.replace('// Write your solution here', '').trim() : '';
        if (!cleanCode) {
            setViewMode('CONSOLE');
            setAiResult({ status: 'Error', message: 'Compiler input is empty. Please write your solution before submitting.' });
            return;
        }

        setLoading(true);
        setViewMode('CONSOLE');
        setAiResult(null);

        try {
            const token = localStorage.getItem('token');
            const url = contestId
                ? `${import.meta.env.VITE_API_URL}/api/submissions/${problemId}?contestId=${contestId}`
                : `${import.meta.env.VITE_API_URL}/api/submissions/${problemId}`;

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code: cleanCode })
            });

            const data = await res.json();
            setAiResult(data);

            // Record submission
            const submissionRecord = {
                id: Date.now(),
                status: data.status,
                message: data.message,
                time: new Date().toLocaleTimeString()
            };
            setSubmissions(prev => [submissionRecord, ...prev]);

            if (data.status !== 'Accepted') {
                const newAttempts = wrongAttempts + 1;
                setWrongAttempts(newAttempts);
                if (newAttempts === 3) {
                    setShowHintOverlay(true);
                    setRequestTabChange('Arena Bot');
                }
            } else {
                setWrongAttempts(0);
            }

        } catch (error) {
            console.error(error);
            setAiResult({ status: 'Error', message: 'Failed to connect to the evaluation server.' });
        } finally {
            setLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col min-h-0 bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-md overflow-hidden relative animate-pulse">
                <div className="flex items-center justify-between bg-[#1a1a1a] border-b border-[var(--color-dark-border)] h-[41px]">
                    <div className="flex gap-4 px-4 h-full items-center">
                        <div className="w-24 h-4 bg-[#2d2d2d] rounded"></div>
                        <div className="w-24 h-4 bg-[#2d2d2d] rounded"></div>
                    </div>
                </div>
                <div className="flex-1 p-4 bg-[#1e1e1e]">
                    <div className="flex gap-2 mb-6">
                        <div className="w-20 h-7 bg-[#2d2d2d] rounded"></div>
                        <div className="w-20 h-7 bg-[#2d2d2d] rounded"></div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <div className="w-16 h-3 bg-[#2d2d2d] rounded mb-2"></div>
                            <div className="w-full h-16 bg-[#2a2a2a] rounded"></div>
                        </div>
                        <div>
                            <div className="w-32 h-3 bg-[#2d2d2d] rounded mb-2 mt-4"></div>
                            <div className="w-full h-16 bg-[#2a2a2a] rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 h-full bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-md overflow-hidden relative">
            {/* Header Tabs */}
            <div className="flex items-center justify-between bg-[#1a1a1a] border-b border-[var(--color-dark-border)]">
                <div className="flex">
                    <button
                        onClick={() => setViewMode('TESTCASE')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors relative ${viewMode === 'TESTCASE' ? 'text-gray-200 bg-[#2a2a2a]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {viewMode === 'TESTCASE' && <span className="absolute top-0 left-0 w-full h-0.5 bg-green-500"></span>}
                        <CheckCircle2 size={14} className={viewMode === 'TESTCASE' ? 'text-green-500' : ''} /> TESTCASE
                    </button>
                    <button
                        onClick={() => setViewMode('CONSOLE')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-colors relative ${viewMode === 'CONSOLE' ? 'text-gray-200 bg-[#2a2a2a]' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        {viewMode === 'CONSOLE' && <span className="absolute top-0 left-0 w-full h-0.5 bg-[var(--color-primary)]"></span>}
                        <TerminalSquare size={14} className={viewMode === 'CONSOLE' ? 'text-[var(--color-primary)]' : ''} /> CONSOLE
                    </button>
                </div>
                <button
                    onClick={onMaximize}
                    className="px-4 text-gray-500 hover:text-white transition-colors h-full flex items-center justify-center border-l border-[var(--color-dark-border)]"
                    title={isMaximized ? 'Restore' : 'Maximize Console'}
                >
                    {isMaximized ? <Minimize2 size={14} /> : <Expand size={14} />}
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-[#1e1e1e] custom-scrollbar mb-14">
                {viewMode === 'TESTCASE' && (
                    <>
                        <div className="flex items-center gap-2 mb-6 text-sm overflow-x-auto no-scrollbar pb-1">
                            {visibleCases.map((tc, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`whitespace-nowrap px-4 py-1.5 rounded-md font-medium transition-colors ${activeTab === index
                                        ? 'bg-[#2a2a2a] text-[var(--color-primary)] font-semibold border border-[var(--color-primary)]/30'
                                        : 'bg-black text-gray-400 hover:text-gray-200 hover:bg-[#2a2a2a]'
                                        }`}
                                >
                                    Case {index + 1}
                                </button>
                            ))}
                            <button className="px-4 py-1.5 rounded-md bg-black text-[var(--color-primary)]/80 hover:text-[var(--color-primary)] font-medium transition-colors flex items-center gap-1 ml-auto whitespace-nowrap">
                                <Plus size={14} /> Custom
                            </button>
                        </div>

                        {visibleCases.length > 0 ? (
                            <div className="space-y-4">
                                {visibleCases[activeTab]?.isHidden ? (
                                    <div className="flex flex-col items-center justify-center p-8 bg-[#1a1a1a] border border-[#333] rounded-md text-center">
                                        <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4 border border-indigo-500/20">
                                            <Bot size={24} className="text-indigo-500" />
                                        </div>
                                        <h3 className="text-white font-bold text-lg mb-2">Hidden Test Case</h3>
                                        <p className="text-sm text-gray-500 max-w-sm mx-auto">This input and expected output are hidden to prevent hardcoding. Our AI Judge will automatically evaluate this case securely on the server upon submission.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1.5 font-mono">Input:</div>
                                            <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-gray-300 font-mono text-sm focus-within:border-[var(--color-primary)] transition-colors whitespace-pre-wrap outline-none" contentEditable suppressContentEditableWarning>
                                                {visibleCases[activeTab]?.input}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-400 mb-1.5 font-mono mt-4">Expected Output:</div>
                                            <div className="w-full bg-[#1a1a1a] border border-[#333] rounded-md px-3 py-2 text-gray-300 font-mono text-sm whitespace-pre-wrap outline-none">
                                                {visibleCases[activeTab]?.expectedOutput}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="text-gray-500 text-sm py-4 italic">No public test cases available for this problem.</div>
                        )}
                    </>
                )}

                {viewMode === 'CONSOLE' && (
                    // CONSOLE Output mode
                    <div className="h-full font-mono text-sm">
                        {loading && (
                            <div className="flex flex-col items-center justify-center text-[var(--color-primary)] h-full gap-3">
                                <Loader2 size={32} className="animate-spin" />
                                <span className="font-bold">AI is analyzing your code...</span>
                            </div>
                        )}

                        {!loading && !aiResult && (
                            <span className="text-gray-500">Run or submit code to see AI evaluation output here.</span>
                        )}

                        {!loading && aiResult && (
                            <div className="space-y-4">
                                <div className={`px-4 py-2 font-bold uppercase tracking-widest text-sm rounded ${aiResult.status === 'Accepted' ? 'bg-green-500/10 text-green-500 border border-green-500/30' :
                                    (aiResult.status === 'Wrong Answer' ? 'bg-red-500/10 text-red-500 border border-red-500/30' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30')
                                    }`}>
                                    Status: {aiResult.status}
                                </div>

                                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap bg-[#1a1a1a] p-4 rounded-md border border-[#333]">
                                    <span className="text-[var(--color-primary)] font-bold mb-2 block">AI Feedback:</span>
                                    {aiResult.message}
                                </div>

                                {/* Contest Navigation Flow */}
                                {contestId && aiResult.status === 'Accepted' && (
                                    <div className="mt-6 border-t border-[#333] pt-6 flex flex-col items-center">
                                        {aiResult.nextProblemId ? (
                                            <button
                                                onClick={() => navigate(`/workspace/contest/${contestId}/${aiResult.nextProblemId}`)}
                                                className="w-full sm:w-auto px-8 py-3 bg-[var(--color-primary)] hover:bg-[#e05a0d] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(246,107,21,0.3)] animate-pulse hover:animate-none"
                                            >
                                                Next Question <ArrowRight size={18} />
                                            </button>
                                        ) : aiResult.isLastProblem ? (
                                            <button
                                                onClick={() => onFinishContest && onFinishContest(aiResult.contestTotalPoints)}
                                                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse hover:animate-none"
                                            >
                                                <Trophy size={18} /> Finish Contest
                                            </button>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Fixed Action Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[var(--color-dark-border)] p-3 flex justify-between items-center z-10">
                <div className="text-xs text-gray-500 font-medium hidden sm:block">Ready to compile</div>
                <div className="flex items-center gap-3 ml-auto">
                    <button disabled={loading || disabled} onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2 rounded-md bg-[#2d2d2d] hover:bg-[#3d3d3d] text-gray-200 font-semibold text-sm transition-colors border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Play size={14} className="fill-current text-gray-300" /> Run
                    </button>
                    <button disabled={loading || disabled} onClick={handleSubmit} className="flex items-center gap-2 px-5 py-2 rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-semibold text-sm transition-colors shadow-[0_0_15px_rgba(246,107,21,0.25)] hover:shadow-[0_0_20px_rgba(246,107,21,0.4)] disabled:opacity-50 disabled:cursor-not-allowed">
                        <CloudUpload size={16} /> Submit
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ConsoleTestCasePane;
