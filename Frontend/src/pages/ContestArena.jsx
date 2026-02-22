import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, ShieldAlert, CheckCircle, Lock, Play, Trophy } from 'lucide-react';

const POINTS = { Easy: 250, Medium: 400, Hard: 650 };

const ContestArena = () => {
    const { contestId } = useParams();
    const navigate = useNavigate();
    const [contest, setContest] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState('');
    const [isEnded, setIsEnded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/auth');
                    return;
                }

                const headers = { 'Authorization': `Bearer ${token}` };

                // Fetch contest details
                const resContest = await fetch(`${import.meta.env.VITE_API_URL}/api/contests/${contestId}`, { headers });
                if (!resContest.ok) { navigate('/contests'); return; }
                const contestData = await resContest.json();
                setContest(contestData);

                // Fetch user progress
                try {
                    const resProgress = await fetch(`${import.meta.env.VITE_API_URL}/api/contests/${contestId}/progress`, { headers });
                    if (resProgress.ok) {
                        const progressData = await resProgress.json();
                        if (progressData.isDisqualified) {
                            navigate('/contests', { state: { error: 'You have been disqualified from this contest.' } });
                            return;
                        }
                        setProgress(progressData);
                    }
                } catch (e) {
                    // Progress fetch fail is non-critical
                }
            } catch (err) {
                console.error(err);
                navigate('/contests');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [contestId, navigate]);

    // Countdown timer
    useEffect(() => {
        if (!contest || !contest.endTime) return;

        const updateTimer = () => {
            const end = new Date(contest.endTime).getTime();
            const now = new Date().getTime();
            const distance = end - now;

            if (distance <= 0) {
                setTimeLeft('00:00:00');
                setIsEnded(true);
                return true;
            } else {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft(
                    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                );
                return false;
            }
        };

        // Run immediately once
        const ended = updateTimer();
        if (ended) return;

        const timer = setInterval(() => {
            const isDone = updateTimer();
            if (isDone) clearInterval(timer);
        }, 1000);
        return () => clearInterval(timer);
    }, [contest]);

    const solvedIds = new Set(progress?.solvedProblemIds || []);
    const currentIndex = progress?.currentProblemIndex ?? 0;

    const getProblemStatus = (problem, index) => {
        if (solvedIds.has(problem._id)) return 'solved';
        if (index <= currentIndex) return 'unlocked';
        return 'locked';
    };

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto w-full mx-auto p-4 md:p-8 custom-scrollbar text-sm bg-black min-h-screen">
                <div className="max-w-5xl mx-auto flex flex-col gap-6">
                    <div className="bg-[#1a1310] border border-[#2d1e16] rounded-2xl p-8 animate-pulse">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex-1">
                                <div className="h-8 w-64 bg-[#2d1e16] rounded mb-3" />
                                <div className="h-4 w-96 bg-[#2d1e16] rounded mb-2" />
                                <div className="h-4 w-48 bg-[#2d1e16] rounded" />
                            </div>
                            <div className="bg-[#120a06] border border-[#2d1e16] p-6 rounded-xl min-w-[200px]">
                                <div className="h-3 w-24 bg-[#2d1e16] rounded mx-auto mb-3" />
                                <div className="h-10 w-36 bg-[#2d1e16] rounded mx-auto" />
                            </div>
                        </div>
                    </div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-[#1a1310] border border-[#2d1e16] rounded-xl p-6 flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="h-6 w-6 bg-[#2d1e16] rounded" />
                                <div><div className="h-5 w-44 bg-[#2d1e16] rounded mb-2" /><div className="h-3 w-32 bg-[#2d1e16] rounded" /></div>
                            </div>
                            <div className="h-10 w-32 bg-[#2d1e16] rounded-lg" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!contest) return null;

    const totalProblems = contest.problems?.length || 0;
    const solvedCount = solvedIds.size;
    const totalPoints = contest.problems?.reduce((sum, p) => {
        return sum + (solvedIds.has(p._id) ? (POINTS[p.difficulty] || 400) : 0);
    }, 0) || 0;

    return (
        <div className="flex-1 overflow-y-auto w-full mx-auto p-4 md:p-8 custom-scrollbar text-sm bg-black min-h-screen">
            <div className="max-w-5xl mx-auto flex flex-col gap-6">

                {/* Banner & Timer */}
                <div className="bg-[#1a1310] border border-[var(--color-primary)]/30 rounded-2xl p-8 shadow-[0_0_40px_rgba(246,107,21,0.1)] relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div>
                            <h1 className="text-3xl font-extrabold text-white mb-2">{contest.title}</h1>
                            <p className="text-gray-400 max-w-2xl">
                                {contest.strictValidation && !isEnded ? (
                                    <span className="italic text-gray-500 flex items-center gap-2">
                                        <ShieldAlert size={14} className="text-red-500" />
                                        Contest description is hidden to prevent early access to problem statements. Read carefully once inside the arena.
                                    </span>
                                ) : (
                                    contest.description
                                )}
                            </p>
                            <div className="flex items-center gap-4 mt-4">
                                {contest.strictValidation && (
                                    <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider">
                                        <ShieldAlert size={14} /> Strict Face Validation
                                    </div>
                                )}
                                <div className="inline-flex items-center gap-2 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] px-3 py-1.5 rounded-lg text-xs font-bold">
                                    <Trophy size={14} /> {totalProblems} Problems
                                </div>
                            </div>
                        </div>

                        <div className="shrink-0 text-center bg-[#120a06] border border-[#2d1e16] p-6 rounded-xl min-w-[200px]">
                            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                                <Clock size={14} className={isEnded ? 'text-gray-500' : 'text-[var(--color-primary)] animate-pulse'} />
                                {isEnded ? 'Contest Ended' : 'Time Remaining'}
                            </div>
                            <div className={`text-4xl font-mono font-bold tracking-tight ${isEnded ? 'text-gray-600' : 'text-white'}`}>
                                {timeLeft || '00:00:00'}
                            </div>
                        </div>
                    </div>
                </div>



                {/* Problems List */}
                <div className="bg-[#1a1310] border border-[#2d1e16] rounded-xl overflow-hidden shadow-xl">
                    <div className="p-6 border-b border-[#2d1e16] bg-[#120a06]">
                        <h2 className="text-xl font-bold text-white">Contest Problems</h2>
                        <p className="text-xs text-gray-500 mt-1">Solve sequentially — the next problem unlocks after you solve the current one!</p>
                    </div>

                    <div className="divide-y divide-[#2d1e16]">
                        {contest.problems && contest.problems.length > 0 ? (
                            contest.problems.map((problem, index) => {
                                const status = getProblemStatus(problem, index);
                                const points = POINTS[problem.difficulty] || 400;

                                return (
                                    <div
                                        key={problem._id}
                                        className={`p-6 flex items-center justify-between group transition-all ${status === 'locked' ? 'opacity-50' : 'hover:bg-[#120a06]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Status Icon */}
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${status === 'solved'
                                                ? 'bg-green-500/20 text-green-500'
                                                : status === 'unlocked'
                                                    ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)]'
                                                    : 'bg-[#2d1e16] text-gray-600'
                                                }`}>
                                                {status === 'solved' ? <CheckCircle size={18} /> :
                                                    status === 'unlocked' ? <span className="font-mono font-bold text-sm">{index + 1}</span> :
                                                        <Lock size={14} />}
                                            </div>

                                            <div>
                                                <h3 className={`text-lg font-bold mb-1 transition-colors ${status === 'solved' ? 'text-green-400' :
                                                    status === 'unlocked' ? 'text-white group-hover:text-[var(--color-primary)]' :
                                                        'text-gray-600'
                                                    }`}>
                                                    {problem.title}
                                                </h3>
                                                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider">
                                                    <span className={
                                                        problem.difficulty === 'Easy' ? 'text-green-500' :
                                                            problem.difficulty === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                                                    }>{problem.difficulty}</span>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-gray-500">{problem.category}</span>
                                                    <span className="text-gray-600">•</span>
                                                    <span className="text-[var(--color-primary)]">{points} pts</span>
                                                    {problem.timeLimit > 0 && (
                                                        <>
                                                            <span className="text-gray-600">•</span>
                                                            <span className="text-yellow-500/90 flex items-center gap-1">
                                                                <Clock size={12} /> {problem.timeLimit} min
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        {status === 'solved' ? (
                                            <button
                                                onClick={() => navigate(`/workspace/contest/${contest._id}/${problem._id}`)}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-green-500 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-all"
                                            >
                                                <CheckCircle size={16} /> Solved ✓
                                            </button>
                                        ) : status === 'unlocked' && !isEnded ? (
                                            <button
                                                onClick={() => navigate(`/workspace/contest/${contest._id}/${problem._id}`)}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-primary)]/20 transition-all animate-pulse hover:animate-none"
                                            >
                                                <Play size={16} /> Solve Challenge
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-gray-600 bg-[#120a06] border border-[#2d1e16] cursor-not-allowed">
                                                <Lock size={14} /> {isEnded ? 'Ended' : 'Locked'}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-10 text-center text-gray-500 italic">No problems have been added to this contest yet.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ContestArena;
