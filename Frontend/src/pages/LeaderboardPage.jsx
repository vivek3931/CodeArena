import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, Users, Globe2, Clock, Check, ChevronLeft, ChevronRight, Loader2, Trophy } from 'lucide-react';

const LeaderboardPage = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const limit = 20;

    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

    const fetchLeaderboard = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit });
            if (searchQuery) params.append('search', searchQuery);
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/leaderboard?${params}`);
            const data = await res.json();
            setLeaderboard(data.leaderboard || []);
            setTotalPages(data.totalPages || 1);
            setTotalUsers(data.totalUsers || 0);
        } catch (err) {
            console.error('Leaderboard fetch failed:', err);
        } finally {
            setLoading(false);
        }
    }, [page, searchQuery]);

    useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

    useEffect(() => {
        const timer = setTimeout(() => setPage(1), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const top3 = leaderboard.length >= 3 && page === 1 && !searchQuery ? leaderboard.slice(0, 3) : [];
    const tableUsers = top3.length > 0 ? leaderboard.slice(3) : leaderboard;
    const isMe = (userId) => currentUser && currentUser._id === userId;
    const getInitial = (name) => (name || '?')[0].toUpperCase();

    return (
        <div className="flex-1 overflow-y-auto w-full mx-auto p-4 md:p-10 custom-scrollbar text-sm bg-black min-h-screen">
            <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mt-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-extrabold text-white tracking-tight">Global Ranking</h1>
                            <span className="px-3 py-1 bg-[#2a1a10] border border-[var(--color-primary)] text-[var(--color-primary)] rounded-md text-[10px] font-bold tracking-wider uppercase">
                                Official
                            </span>
                        </div>
                        <p className="text-gray-400 text-base">
                            Real-time updates • {totalUsers.toLocaleString()} Participants fighting for the top spot.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                        <Clock size={14} /> Last updated: just now
                    </div>
                </div>

                {/* Podium */}
                {top3.length === 3 && (
                    <div className="flex flex-col md:flex-row items-end justify-center gap-4 mt-12 mb-8 md:h-[250px]">

                        {/* 2nd Place */}
                        <div className="w-full md:w-[280px] bg-black/90 border border-osu/40 rounded-xl flex flex-col items-center p-6 relative md:h-[200px] mt-12 md:mt-0 hover:border-osu/70 hover:shadow-osu/20 shadow-2xl shadow-osu/10 transition-all duration-300">
                            <div className="absolute top-4 right-4 text-4xl font-black text-[#2d1e16]/50">02</div>
                            <div className="w-16 h-16 rounded-full border-4 border-[#1a1310] relative -mt-12 bg-[#2d1e16] shadow-xl overflow-hidden mb-3 flex items-center justify-center text-white font-bold text-xl">
                                {getInitial(top3[1].name)}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{top3[1].name || 'Anonymous'}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
                                {top3[1].location || 'Unknown'}
                            </div>
                            <div className="flex w-full justify-between items-center text-center px-4 border-t border-[#2d1e16] pt-4 mt-auto">
                                <div>
                                    <div className="text-[10px] text-gray-500 font-bold tracking-wider mb-1 uppercase">Solved</div>
                                    <div className="text-xl font-bold text-white tracking-tight">{top3[1].solved}</div>
                                </div>
                                <div className="w-[1px] h-8 bg-[#2d1e16]"></div>
                                <div>
                                    <div className="text-[10px] text-gray-500 font-bold tracking-wider mb-1 uppercase">Accept</div>
                                    <div className="text-base font-bold text-gray-300">{top3[1].acceptRate}<span className="text-xs text-gray-500 font-normal">%</span></div>
                                </div>
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="w-full md:w-[320px] bg-gradient-to-b from-black/95 to-black/90 border border-osu/60 rounded-xl flex flex-col items-center p-6 relative md:h-[240px] mt-16 md:mt-0 shadow-2xl shadow-osu/20 hover:shadow-osu/30 z-10 transform md:-translate-y-4 transition-all duration-300">
                            <div className="absolute -top-10">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-primary)" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                                </svg>
                            </div>
                            <div className="absolute top-4 right-4 text-5xl font-black text-[var(--color-primary)]/20">01</div>
                            <div className="w-20 h-20 rounded-full border-4 border-[#2a1a10] relative -mt-14 bg-[var(--color-primary)] shadow-[0_0_20px_rgba(246,107,21,0.5)] overflow-hidden mb-4 flex items-center justify-center text-white font-bold text-2xl">
                                {getInitial(top3[0].name)}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1">{top3[0].name || 'Anonymous'}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] mb-8 font-medium">
                                {top3[0].location || 'Unknown'}
                            </div>
                            <div className="flex w-full justify-between items-center text-center px-6 border-t border-[var(--color-primary)]/30 pt-5 mt-auto">
                                <div>
                                    <div className="text-[10px] text-[var(--color-primary)] font-bold tracking-wider mb-1 uppercase">Total Solved</div>
                                    <div className="text-3xl font-bold text-white tracking-tight">{top3[0].solved}</div>
                                </div>
                                <div className="w-[1px] h-10 bg-[var(--color-primary)]/20"></div>
                                <div>
                                    <div className="text-[10px] text-[var(--color-primary)]/70 font-bold tracking-wider mb-1 uppercase">Accept</div>
                                    <div className="text-xl font-bold text-gray-300">{top3[0].acceptRate}<span className="text-sm text-gray-500 font-normal">%</span></div>
                                </div>
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="w-full md:w-[280px] bg-black/90 border border-osu/40 rounded-xl flex flex-col items-center p-6 relative md:h-[180px] mt-12 md:mt-0 hover:border-osu/70 hover:shadow-osu/20 shadow-2xl shadow-osu/10 transition-all duration-300">
                            <div className="absolute top-4 right-4 text-4xl font-black text-[#2d1e16]/50">03</div>
                            <div className="w-14 h-14 rounded-full border-4 border-[#1a1310] relative -mt-11 bg-[#2d1e16] shadow-xl overflow-hidden mb-2 flex items-center justify-center text-white font-bold text-lg">
                                {getInitial(top3[2].name)}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">{top3[2].name || 'Anonymous'}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5">
                                {top3[2].location || 'Unknown'}
                            </div>
                            <div className="flex w-full justify-between items-center text-center px-4 border-t border-[#2d1e16] pt-3 mt-auto">
                                <div>
                                    <div className="text-[10px] text-gray-500 font-bold tracking-wider mb-1 uppercase">Solved</div>
                                    <div className="text-xl font-bold text-white tracking-tight">{top3[2].solved}</div>
                                </div>
                                <div className="w-[1px] h-8 bg-[#2d1e16]"></div>
                                <div>
                                    <div className="text-[10px] text-gray-500 font-bold tracking-wider mb-1 uppercase">Accept</div>
                                    <div className="text-base font-bold text-gray-300">{top3[2].acceptRate}<span className="text-xs text-gray-500 font-normal">%</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-black/90 p-4 rounded-xl border border-osu/40 shadow-2xl shadow-osu/10 hover:shadow-osu/20 transition-all duration-300">
                    <div className="relative w-full md:w-96">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by username, country..."
                            className="w-full bg-[#120a06] border border-[#2d1e16] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
                        <button className="flex items-center gap-2 whitespace-nowrap bg-[#120a06] border border-[#2d1e16] text-gray-300 text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-[#1f1510] transition-colors">
                            Country: All <ChevronDown size={16} className="text-gray-500" />
                        </button>
                        <button className="flex items-center gap-2 whitespace-nowrap bg-[#120a06] border border-[#2d1e16] text-gray-300 text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-[#1f1510] transition-colors">
                            Language: All <ChevronDown size={16} className="text-gray-500" />
                        </button>
                        <button className="flex items-center gap-2 whitespace-nowrap bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-sm font-bold rounded-lg px-5 py-2.5 shadow-[0_0_15px_rgba(246,107,21,0.2)] transition-all">
                            <Users size={16} className="fill-current" /> Find Friends
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-black/90 border border-osu/40 rounded-xl overflow-x-auto shadow-2xl shadow-osu/10 hover:shadow-osu/20 transition-all duration-300">
                    {loading && leaderboard.length === 0 ? (
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-[#2d1e16] bg-[#120a06]">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Rank</th>
                                    <th className="px-6 py-4 font-bold w-1/3">Contestant</th>
                                    <th className="px-6 py-4 font-bold text-center">Score</th>
                                    <th className="px-6 py-4 font-bold text-center">Attempts</th>
                                    <th className="px-6 py-4 font-bold text-center">Accept %</th>
                                    <th className="px-6 py-4 font-bold text-center">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2d1e16]">
                                {[...Array(8)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-5"><div className="h-4 w-6 bg-[#2d1e16] rounded" /></td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#2d1e16]" />
                                                <div>
                                                    <div className="h-4 w-28 bg-[#2d1e16] rounded mb-1" />
                                                    <div className="h-3 w-16 bg-[#2d1e16] rounded" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center"><div className="h-5 w-8 bg-[#2d1e16] rounded mx-auto" /></td>
                                        <td className="px-6 py-5 text-center"><div className="h-4 w-8 bg-[#2d1e16] rounded mx-auto" /></td>
                                        <td className="px-6 py-5 text-center"><div className="h-4 w-10 bg-[#2d1e16] rounded mx-auto" /></td>
                                        <td className="px-6 py-5 text-center"><div className="h-4 w-8 bg-[#2d1e16] rounded mx-auto" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : tableUsers.length === 0 && top3.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Trophy size={48} className="mb-4 text-[#2d1e16]" />
                            <p className="font-bold text-lg text-gray-400">No contestants found</p>
                            <p className="text-sm mt-1">Submit solutions to problems to appear on the leaderboard!</p>
                        </div>
                    ) : (
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="text-[10px] text-gray-500 uppercase tracking-widest border-b border-[#2d1e16] bg-[#120a06]">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Rank</th>
                                    <th className="px-6 py-4 font-bold w-1/3">Contestant</th>
                                    <th className="px-6 py-4 font-bold text-center">Points</th>
                                    <th className="px-6 py-4 font-bold text-center">Attempts</th>
                                    <th className="px-6 py-4 font-bold text-center">Accept %</th>
                                    <th className="px-6 py-4 font-bold text-center">Solved</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#2d1e16] text-sm">
                                {tableUsers.map((user) => {
                                    const isCurrent = isMe(user.userId);
                                    const avatarColors = ['bg-indigo-900 text-indigo-300', 'bg-teal-900 text-teal-300', 'bg-blue-900 text-blue-300', 'bg-purple-900 text-purple-300', 'bg-orange-900 text-orange-300', 'bg-rose-900 text-rose-300', 'bg-emerald-900 text-emerald-300', 'bg-cyan-900 text-cyan-300'];
                                    const colorClass = avatarColors[user.rank % avatarColors.length];
                                    const hoverRingColors = ['group-hover:ring-indigo-500', 'group-hover:ring-teal-500', 'group-hover:ring-blue-500', 'group-hover:ring-purple-500', 'group-hover:ring-[var(--color-primary)]', 'group-hover:ring-rose-500', 'group-hover:ring-emerald-500', 'group-hover:ring-cyan-500'];
                                    const ringHover = hoverRingColors[user.rank % hoverRingColors.length];

                                    return (
                                        <tr
                                            key={user.userId}
                                            className={`transition-colors group ${isCurrent
                                                ? 'bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 border-y border-[var(--color-primary)]/30'
                                                : 'hover:bg-[#1f1510]'
                                                }`}
                                        >
                                            <td className={`px-6 py-5 font-bold ${isCurrent ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>
                                                {user.rank}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    {isCurrent ? (
                                                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs ring-2 ring-[var(--color-primary)] shadow-[0_0_10px_rgba(246,107,21,0.5)]">You</div>
                                                    ) : (
                                                        <div className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center font-bold text-xs ring-2 ring-[#2d1e16] ${ringHover} transition-all`}>
                                                            {getInitial(user.name)}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className={`font-bold text-white ${isCurrent ? '' : 'group-hover:text-[var(--color-primary)]'} transition-colors cursor-pointer flex items-center gap-2`}>
                                                            {user.name || user.email?.split('@')[0] || 'Anonymous'}
                                                            {isCurrent && (
                                                                <span className="bg-[var(--color-primary)] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">Me</span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                                            {user.location || 'Unknown'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`px-6 py-5 font-bold text-center text-lg ${isCurrent ? 'text-[var(--color-primary)]' : 'text-white'}`}>
                                                {user.rating || 0}
                                            </td>
                                            <td className="px-6 py-5 text-gray-400 text-center">
                                                {user.totalAttempts}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className={`font-bold ${user.acceptRate >= 70 ? 'text-green-500' : user.acceptRate >= 40 ? 'text-yellow-500' : 'text-red-400'}`}>
                                                    {user.acceptRate}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-gray-300 text-center font-medium">
                                                {user.solved}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}

                    {/* Pagination */}
                    {totalPages > 0 && (
                        <div className="flex flex-col md:flex-row items-center justify-between px-6 py-4 bg-[#120a06] border-t border-[#2d1e16] gap-4">
                            <div className="text-sm text-gray-500">
                                Showing <span className="font-bold text-white">{((page - 1) * limit) + 1}</span> to <span className="font-bold text-white">{Math.min(page * limit, totalUsers)}</span> of <span className="font-bold text-white">{totalUsers.toLocaleString()}</span> entries
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white bg-[#1a1310] border border-[#2d1e16] rounded-md hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const pageNum = i + 1;
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setPage(pageNum)}
                                            className={`w-8 h-8 flex items-center justify-center text-sm font-bold rounded-md transition-colors ${page === pageNum
                                                ? 'text-white bg-[var(--color-primary)] shadow-[0_0_10px_rgba(246,107,21,0.2)]'
                                                : 'text-gray-400 hover:text-white hover:bg-[#2d1e16]'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                                {totalPages > 5 && <div className="w-8 h-8 flex items-center justify-center text-sm font-medium text-gray-500">...</div>}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white bg-[#1a1310] border border-[#2d1e16] rounded-md hover:border-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LeaderboardPage;
