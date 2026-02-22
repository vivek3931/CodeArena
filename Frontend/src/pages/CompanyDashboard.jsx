import React, { useState, useEffect } from 'react';
import { Plus, ToggleLeft, X, ToggleRight, Building2, Server, Save, Loader2, Clock, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EMPTY_PROBLEM = () => ({
    title: '',
    description: '',
    difficulty: 'Medium',
    category: 'Arrays',
    timeLimit: 0,
    testCases: [{ input: '', expectedOutput: '', isHidden: false }],
    collapsed: false
});

const CompanyDashboard = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [strictValidation, setStrictValidation] = useState(false);

    // Multi-problem state
    const [problems, setProblems] = useState([EMPTY_PROBLEM()]);

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: '', type: '' });

    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user || user.preference !== 'company') {
            navigate('/profile');
        }
    }, [user, navigate]);

    // Problem array helpers
    const addProblem = () => setProblems([...problems, EMPTY_PROBLEM()]);

    const removeProblem = (idx) => {
        if (problems.length <= 1) return;
        setProblems(problems.filter((_, i) => i !== idx));
    };

    const updateProblem = (idx, field, value) => {
        const updated = [...problems];
        updated[idx] = { ...updated[idx], [field]: value };
        setProblems(updated);
    };

    const toggleCollapse = (idx) => {
        const updated = [...problems];
        updated[idx] = { ...updated[idx], collapsed: !updated[idx].collapsed };
        setProblems(updated);
    };

    // Test case helpers for a specific problem
    const addTestCase = (pIdx) => {
        const updated = [...problems];
        updated[pIdx].testCases = [...updated[pIdx].testCases, { input: '', expectedOutput: '', isHidden: false }];
        setProblems(updated);
    };

    const removeTestCase = (pIdx, tcIdx) => {
        const updated = [...problems];
        updated[pIdx].testCases = updated[pIdx].testCases.filter((_, i) => i !== tcIdx);
        setProblems(updated);
    };

    const updateTestCase = (pIdx, tcIdx, field, value) => {
        const updated = [...problems];
        updated[pIdx].testCases = [...updated[pIdx].testCases];
        updated[pIdx].testCases[tcIdx] = { ...updated[pIdx].testCases[tcIdx], [field]: value };
        setProblems(updated);
    };

    const handleDeployContest = async (e) => {
        e.preventDefault();
        setMsg({ text: '', type: '' });

        if (!title || !description || !startTime || !endTime) {
            return setMsg({ text: 'Please fill all contest fields.', type: 'error' });
        }

        // Validate each problem
        for (let i = 0; i < problems.length; i++) {
            const p = problems[i];
            if (!p.title || !p.description) {
                return setMsg({ text: `Problem ${i + 1}: Title and Description are required.`, type: 'error' });
            }
            if (p.testCases.length === 0) {
                return setMsg({ text: `Problem ${i + 1}: At least 1 test case is required.`, type: 'error' });
            }
        }

        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    title, description, startTime, endTime, strictValidation,
                    problems: problems.map(p => ({
                        title: p.title,
                        description: p.description,
                        timeLimit: p.timeLimit,
                        difficulty: p.difficulty,
                        category: p.category,
                        testCases: p.testCases
                    }))
                })
            });

            if (res.ok) {
                setMsg({ text: `Contest deployed with ${problems.length} problem${problems.length > 1 ? 's' : ''}!`, type: 'success' });
                setTimeout(() => navigate('/contests'), 1500);
            } else {
                const data = await res.json();
                setMsg({ text: data.message || 'Failed deployment', type: 'error' });
            }
        } catch (err) {
            setMsg({ text: 'Server error.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full bg-[#120a06] border border-[#2d1e16] text-white rounded-lg px-4 py-3 focus:border-[var(--color-primary)] outline-none text-sm";

    const difficultyColor = (d) => d === 'Easy' ? 'text-green-500' : d === 'Medium' ? 'text-yellow-500' : 'text-red-500';
    const pointsForDifficulty = (d) => d === 'Easy' ? 250 : d === 'Medium' ? 400 : 650;

    return (
        <div className="flex-1 overflow-y-auto w-full mx-auto p-4 md:p-8 custom-scrollbar text-sm bg-black min-h-screen">
            <div className="max-w-4xl mx-auto flex flex-col gap-6">

                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-xl">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Organization Dashboard</h1>
                        <p className="text-gray-400">Deploy Contests with Multiple Custom Problems</p>
                    </div>
                </div>

                {msg.text && (
                    <div className={`p-4 rounded-lg font-bold ${msg.type === 'error' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}>
                        {msg.text}
                    </div>
                )}

                <form onSubmit={handleDeployContest} className="space-y-6">

                    {/* ═══ Contest Details Card ═══ */}
                    <div className="bg-[#1a1310] border border-[#2d1e16] rounded-xl shadow-xl overflow-hidden">
                        <div className="p-6 border-b border-[#2d1e16] bg-[#120a06]">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2"><Server size={18} className="text-[var(--color-primary)]" /> Contest Configuration</h2>
                            <p className="text-xs text-gray-500 mt-1">Set the contest metadata and timing. Problems are added below.</p>
                        </div>
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contest Title</label>
                                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} placeholder="e.g. Weekly Coding Challenge #5" />
                                </div>
                                <div className="bg-[#120a06] border border-[#2d1e16] rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-bold text-white flex items-center gap-2">Strict Face Validation <span className="bg-red-500/20 text-red-500 text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider">PRO</span></div>
                                        <div className="text-xs text-gray-500 mt-1">Require webcam cheating prevention.</div>
                                    </div>
                                    <button type="button" onClick={() => setStrictValidation(!strictValidation)} className="text-[var(--color-primary)] hover:scale-105 transition-transform">
                                        {strictValidation ? <ToggleRight size={40} /> : <ToggleLeft size={40} className="text-gray-600" />}
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Start Time</label>
                                    <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">End Time</label>
                                    <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className={`${inputClass} [color-scheme:dark]`} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contest Description / Rules</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} min-h-[100px]`} placeholder="Describe the overall contest rules and structure..."></textarea>
                            </div>
                        </div>
                    </div>

                    {/* ═══ Problems Section ═══ */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-white">Contest Problems</h2>
                                <p className="text-xs text-gray-500 mt-0.5">Users solve these sequentially. Problem 2 unlocks after Problem 1 is accepted.</p>
                            </div>
                            <button type="button" onClick={addProblem} className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-primary)]/20 rounded-lg font-bold transition-all text-sm">
                                <Plus size={16} /> Add Problem
                            </button>
                        </div>

                        {problems.map((prob, pIdx) => (
                            <div key={pIdx} className="bg-[#1a1310] border border-[#2d1e16] rounded-xl shadow-xl overflow-hidden">
                                {/* Problem Header */}
                                <div className="p-4 px-6 border-b border-[#2d1e16] bg-[#120a06] flex items-center justify-between cursor-pointer select-none" onClick={() => toggleCollapse(pIdx)}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[var(--color-primary)] font-mono font-bold text-lg">#{pIdx + 1}</span>
                                        <h3 className="text-white font-bold">{prob.title || `Problem ${pIdx + 1}`}</h3>
                                        <span className={`text-xs font-bold ${difficultyColor(prob.difficulty)}`}>{prob.difficulty}</span>
                                        <span className="text-[10px] text-gray-600 bg-[#2d1e16] px-2 py-0.5 rounded-full">{pointsForDifficulty(prob.difficulty)} pts</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {problems.length > 1 && (
                                            <button type="button" onClick={(e) => { e.stopPropagation(); removeProblem(pIdx); }} className="text-red-500/50 hover:text-red-500 p-1 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                        {prob.collapsed ? <ChevronDown size={18} className="text-gray-500" /> : <ChevronUp size={18} className="text-gray-500" />}
                                    </div>
                                </div>

                                {/* Problem Body (collapsible) */}
                                {!prob.collapsed && (
                                    <div className="p-6 space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Problem Title</label>
                                                <input type="text" value={prob.title} onChange={e => updateProblem(pIdx, 'title', e.target.value)} className={inputClass} placeholder="e.g. Two Sum" />
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Difficulty</label>
                                                    <select value={prob.difficulty} onChange={e => updateProblem(pIdx, 'difficulty', e.target.value)} className={inputClass}>
                                                        <option>Easy</option><option>Medium</option><option>Hard</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                                                    <select value={prob.category} onChange={e => updateProblem(pIdx, 'category', e.target.value)} className={inputClass}>
                                                        <option>Arrays</option><option>Dynamic Programming</option><option>Graphs</option><option>Trees</option><option>Strings</option><option>Math</option><option>Greedy</option><option>Sorting</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1"><Clock size={10} /> TL (min)</label>
                                                    <input type="number" min="0" value={prob.timeLimit} onChange={e => updateProblem(pIdx, 'timeLimit', e.target.value)} className={inputClass} placeholder="0" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Problem Statement</label>
                                            <textarea value={prob.description} onChange={e => updateProblem(pIdx, 'description', e.target.value)} className={`${inputClass} min-h-[120px]`} placeholder="Given an array of integers..."></textarea>
                                        </div>

                                        {/* Test Cases */}
                                        <div className="bg-[#120a06] border border-[#2d1e16] rounded-lg p-5">
                                            <div className="flex justify-between items-center mb-3">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Test Cases ({prob.testCases.length})</label>
                                                <button type="button" onClick={() => addTestCase(pIdx)} className="text-xs bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-3 py-1.5 rounded flex items-center gap-1 hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                                                    <Plus size={14} /> Add Case
                                                </button>
                                            </div>
                                            <div className="space-y-3">
                                                {prob.testCases.map((tc, tcIdx) => (
                                                    <div key={tcIdx} className="p-3 bg-black border border-[#2d1e16] rounded-lg relative">
                                                        {prob.testCases.length > 1 && (
                                                            <button type="button" onClick={() => removeTestCase(pIdx, tcIdx)} className="absolute top-2 right-2 text-red-500 hover:text-red-400 p-1"><X size={14} /></button>
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            <div>
                                                                <label className="block text-[10px] text-gray-500 mb-1">Input</label>
                                                                <input type="text" value={tc.input} onChange={e => updateTestCase(pIdx, tcIdx, 'input', e.target.value)} className="w-full bg-[#1a1310] border border-[#2d1e16] text-white text-xs rounded px-3 py-2 font-mono" placeholder="[1, 2, 3]" />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-gray-500 mb-1">Expected Output</label>
                                                                <input type="text" value={tc.expectedOutput} onChange={e => updateTestCase(pIdx, tcIdx, 'expectedOutput', e.target.value)} className="w-full bg-[#1a1310] border border-[#2d1e16] text-white text-xs rounded px-3 py-2 font-mono" placeholder="6" />
                                                            </div>
                                                        </div>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <button type="button" onClick={() => updateTestCase(pIdx, tcIdx, 'isHidden', !tc.isHidden)} className="text-[var(--color-primary)]">
                                                                {tc.isHidden ? <ToggleRight size={20} /> : <ToggleLeft size={20} className="text-gray-600" />}
                                                            </button>
                                                            <span className="text-[10px] text-gray-500">Hidden (Private validation)</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Deploy Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(246,107,21,0.3)] transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Deploy Contest ({problems.length} Problem{problems.length > 1 ? 's' : ''})</>}
                    </button>

                </form>

            </div>
        </div>
    );
};

export default CompanyDashboard;
