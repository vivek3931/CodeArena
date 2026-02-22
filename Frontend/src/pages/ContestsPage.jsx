import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, ArrowRight, ShieldAlert, Flame, Zap, CalendarDays, Timer, ChevronRight, Swords, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ContestsPage = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, live, upcoming, ended
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contests`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    setContests(data);
                }
            } catch (error) {
                console.error("Failed to fetch contests", error);
            } finally {
                setLoading(false);
            }
        };

        fetchContests();
    }, []);

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const getDuration = (start, end) => {
        const diffMs = new Date(end) - new Date(start);
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${diffHrs}h ${diffMins > 0 ? diffMins + 'm' : ''}`;
    };

    const getContestStatus = (contest) => {
        const now = new Date();
        const start = new Date(contest.startTime);
        const end = new Date(contest.endTime);
        if (now > start && now < end) return 'live';
        if (now > end) return 'ended';
        return 'upcoming';
    };

    const handleRegister = async (contestId) => {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/auth'); return; }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/contests/${contestId}/register`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setContests(prevContests =>
                    prevContests.map(c => {
                        if (c._id === contestId) {
                            return { ...c, participants: [...(c.participants || []), user?._id] };
                        }
                        return c;
                    })
                );
            } else {
                const data = await res.json();
                alert(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error("Failed to register", error);
        }
    };

    const filteredContests = contests.filter(c => {
        if (filter === 'all') return true;
        return getContestStatus(c) === filter;
    });

    const liveCount = contests.filter(c => getContestStatus(c) === 'live').length;
    const upcomingCount = contests.filter(c => getContestStatus(c) === 'upcoming').length;

    return (
        <div className="flex-1 overflow-y-auto w-full mx-auto p-4 md:p-8 custom-scrollbar text-sm bg-black min-h-screen">
            <div className="max-w-6xl mx-auto flex flex-col gap-8 overflow-hidden">


                {/* Hero Header */}
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-gradient-to-br from-black/95 via-black/90 to-black/95 p-5 md:p-10 rounded-2xl border border-osu/40 shadow-2xl shadow-osu/10 hover:shadow-osu/20 transition-all duration-300 overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-primary)]/3 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] w-fit px-3 py-1 rounded-full font-bold text-xs mb-5 uppercase tracking-wider flex items-center gap-2 border border-[var(--color-primary)]/20">
                            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
                            Live & Upcoming Arena
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-3">
                            Compete and Prove <br /><span className="text-[var(--color-primary)]">Your Skills.</span>
                        </h1>
                        <p className="text-gray-400 text-sm md:text-base max-w-xl line-clamp-2">CodeArena official and company-sponsored contests. Battle against the best to raise your global rank or get hired.</p>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <Flame size={16} className="text-green-500" />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-lg leading-none">{liveCount}</div>
                                    <div className="text-green-500 text-[10px] font-bold uppercase tracking-wider">Live</div>
                                </div>
                            </div>
                            <div className="w-[1px] h-8 bg-[#2d1e16]"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Zap size={16} className="text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-lg leading-none">{upcomingCount}</div>
                                    <div className="text-blue-400 text-[10px] font-bold uppercase tracking-wider">Upcoming</div>
                                </div>
                            </div>
                            <div className="w-[1px] h-8 bg-[#2d1e16]"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                                    <Trophy size={16} className="text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <div className="text-white font-bold text-lg leading-none">{contests.length}</div>
                                    <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {user?.preference === 'company' && (
                        <button
                            onClick={() => navigate('/company/dashboard')}
                            className="relative z-10 bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-lg font-bold text-sm shadow-xl transition-all flex items-center gap-2 shrink-0"
                        >
                            Deploy New Contest <ArrowRight size={16} />
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 md:gap-2 bg-black/90 p-1.5 rounded-xl border border-osu/40 shadow-2xl shadow-osu/10 w-full md:w-fit overflow-x-auto custom-scrollbar">
                    {[
                        { key: 'all', label: 'All Contests', icon: Swords },
                        { key: 'live', label: 'Live Now', icon: Flame },
                        { key: 'upcoming', label: 'Upcoming', icon: CalendarDays },
                        { key: 'ended', label: 'Past', icon: Clock }
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${filter === key
                                ? 'bg-[var(--color-primary)] text-white shadow-[0_0_15px_rgba(246,107,21,0.2)]'
                                : 'text-gray-400 hover:text-white hover:bg-[#2d1e16]'
                                }`}
                        >
                            <Icon size={14} /> {label}
                        </button>
                    ))}
                </div>

                {/* Contests Grid */}
                <div>
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="bg-black/90 border border-osu/40 rounded-xl p-6 animate-pulse shadow-2xl shadow-osu/10">
                                    <div className="h-4 w-20 bg-[#2d1e16] rounded mb-4" />
                                    <div className="h-6 w-48 bg-[#2d1e16] rounded mb-2" />
                                    <div className="h-3 w-32 bg-[#2d1e16] rounded mb-6" />
                                    <div className="h-16 bg-[#2d1e16] rounded mb-6" />
                                    <div className="h-12 bg-[#2d1e16] rounded-lg mb-4" />
                                    <div className="h-10 bg-[#2d1e16] rounded-lg" />
                                </div>
                            ))}
                        </div>
                    ) : filteredContests.length === 0 ? (
                        <div className="bg-black/90 border border-osu/40 rounded-xl p-16 text-center shadow-2xl shadow-osu/10">
                            <Trophy size={56} className="mx-auto mb-4 text-[#2d1e16]" />
                            <p className="text-lg font-bold text-gray-400 mb-2">No contests found</p>
                            <p className="text-sm text-gray-500">{filter === 'all' ? 'Check back later for upcoming contests!' : `No ${filter} contests at the moment.`}</p>
                            {user?.preference === 'company' && (
                                <button
                                    onClick={() => navigate('/company/dashboard')}
                                    className="mt-6 bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
                                >
                                    Host the first contest
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredContests.map(contest => {
                                const status = getContestStatus(contest);
                                const isRegistered = contest.participants?.includes(user?._id);
                                const participantCount = contest.participants?.length || 0;

                                return (
                                    <div
                                        key={contest._id}
                                        className={`bg-black/90 border rounded-xl p-6 transition-all duration-300 group flex flex-col h-full relative overflow-hidden shadow-2xl ${status === 'live'
                                            ? 'border-green-500/40 hover:border-green-500/60 shadow-green-500/10 hover:shadow-green-500/20'
                                            : 'border-osu/40 hover:border-osu/70 shadow-osu/10 hover:shadow-osu/20'
                                            }`}
                                    >
                                        {/* Top Row: Status + Strict Badge */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                {status === 'live' && (
                                                    <div className="flex items-center gap-1.5 bg-green-500/10 text-green-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                        Live Now
                                                    </div>
                                                )}
                                                {status === 'upcoming' && (
                                                    <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">
                                                        <CalendarDays size={10} />
                                                        Upcoming
                                                    </div>
                                                )}
                                                {status === 'ended' && (
                                                    <div className="flex items-center gap-1.5 bg-gray-500/10 text-gray-400 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-500/20">
                                                        <Clock size={10} />
                                                        Ended
                                                    </div>
                                                )}
                                                {contest.strictValidation && (
                                                    <div className="flex items-center gap-1 bg-red-500/10 text-red-500 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-500/20">
                                                        <ShieldAlert size={10} /> Strict
                                                    </div>
                                                )}
                                            </div>
                                            {isRegistered && status !== 'ended' && (
                                                <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[10px] font-bold border border-green-500/20">
                                                    ✓ Registered
                                                </div>
                                            )}
                                        </div>

                                        {/* Title + Host */}
                                        <h3 className="text-xl font-bold text-white group-hover:text-[var(--color-primary)] transition-colors mb-1">{contest.title}</h3>
                                        <p className="text-xs text-gray-500 mb-4">By {contest.companyId?.name || "CodeArena Official"}</p>

                                        {/* Description */}
                                        <div className="mb-5 flex-1">
                                            {contest.strictValidation && status !== 'ended' ? (
                                                <p className="text-xs italic text-gray-500 flex items-center gap-1.5 p-2 bg-[#120a06] border border-[#2d1e16] rounded-lg">
                                                    <ShieldAlert size={12} className="text-red-500" />
                                                    Description hidden for strict contests.
                                                </p>
                                            ) : (
                                                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                                    {contest.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Strict Warning */}
                                        {contest.strictValidation && (
                                            <div className="text-xs text-red-400/80 font-medium bg-red-500/5 border border-red-500/10 p-3 rounded-lg flex items-start gap-2 mb-5">
                                                <ShieldAlert size={14} className="shrink-0 mt-0.5 text-red-500" />
                                                <p>AI facial tracking active. Head tilting, looking away, or camera covering triggers warnings. 3 strikes = contest terminated.</p>
                                            </div>
                                        )}

                                        {/* Info Bar */}
                                        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-gray-400 bg-[#120a06] p-3 rounded-lg border border-[#2d1e16] mb-5">
                                            <div className="flex items-center gap-1.5">
                                                <Timer size={13} className="text-gray-500" />
                                                {getDuration(contest.startTime, contest.endTime)}
                                            </div>
                                            <div className="w-[1px] h-3 bg-[#2d1e16]"></div>
                                            <div className="flex items-center gap-1.5">
                                                <CalendarDays size={13} className="text-gray-500" />
                                                {new Date(contest.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </div>
                                            <div className="w-[1px] h-3 bg-[#2d1e16]"></div>
                                            <div className="flex items-center gap-1.5">
                                                <Users size={13} className="text-gray-500" />
                                                {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
                                            </div>
                                            {contest.problems && (
                                                <>
                                                    <div className="w-[1px] h-3 bg-[#2d1e16]"></div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Sparkles size={13} className="text-gray-500" />
                                                        {contest.problems.length} {contest.problems.length === 1 ? 'problem' : 'problems'}
                                                    </div>
                                                    <div className="w-[1px] h-3 bg-[#2d1e16]"></div>
                                                    <div className="flex items-center gap-1.5 text-[var(--color-primary)] font-bold">
                                                        <Trophy size={13} />
                                                        {contest.problems.reduce((sum, p) => {
                                                            const pts = p.difficulty === 'Easy' ? 250 : p.difficulty === 'Hard' ? 650 : 400;
                                                            return sum + pts;
                                                        }, 0).toLocaleString()} pts
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Countdown for upcoming contests */}
                                        {status === 'upcoming' && (
                                            <CountdownTimer targetDate={contest.startTime} />
                                        )}

                                        {/* Action Button */}
                                        {contest.isDisqualified ? (
                                            <button
                                                disabled
                                                className="w-full py-3 bg-red-500/10 text-red-500 font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-red-500/20 cursor-not-allowed"
                                                title="You have been removed from this contest due to illegal activities"
                                            >
                                                <ShieldAlert size={16} /> Disqualified - Access Revoked
                                            </button>
                                        ) : status === 'live' ? (
                                            <button
                                                onClick={() => navigate(`/workspace/contest/${contest._id}`)}
                                                className="w-full py-3 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 border border-green-500/20 hover:border-green-500"
                                            >
                                                <Flame size={16} /> Enter Contest Arena <ChevronRight size={16} />
                                            </button>
                                        ) : status === 'ended' ? (
                                            <button
                                                onClick={() => navigate(`/workspace/contest/${contest._id}`)}
                                                className="w-full py-3 bg-[#2d1e16]/50 text-gray-400 hover:text-white hover:bg-[#2d1e16] font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                            >
                                                View Results <ChevronRight size={16} />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => isRegistered ? null : handleRegister(contest._id)}
                                                disabled={isRegistered}
                                                className={`w-full py-3 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${isRegistered
                                                    ? 'bg-green-500/10 text-green-500 cursor-default border border-green-500/20'
                                                    : 'bg-[var(--color-primary)]/10 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white border border-[var(--color-primary)]/20 hover:border-[var(--color-primary)] hover:shadow-[0_0_20px_rgba(246,107,21,0.2)]'

                                                    }`}
                                            >
                                                {isRegistered ? '✓ Registered Successfully' : <><Swords size={16} /> Register Now</>}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Countdown Timer Component
const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const target = new Date(targetDate);
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft('Starting now...');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (days > 0) {
                setTimeLeft(`${days}d ${hours}h ${minutes}m`);
            } else {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return (
        <div className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 rounded-lg px-3 py-2 mb-5">
            <Timer size={14} className="text-blue-400" />
            <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider">Starts in:</span>
            <span className="text-sm text-white font-mono font-bold">{timeLeft}</span>
        </div>
    );
};

export default ContestsPage;
