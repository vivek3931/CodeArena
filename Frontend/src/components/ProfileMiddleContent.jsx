import React from 'react';
import { TrendingUp, Award, Zap } from 'lucide-react';

const ProfileMiddleContent = ({ user, stats }) => {
    // Generate real heatmap based on stats.heatmap
    const today = new Date();
    const heatmapGrid = [];
    const totalActiveDays = stats?.totalActiveDays || Object.keys(stats.heatmap).length;

    for (let c = 0; c < 52; c++) {
        const col = [];
        for (let r = 0; r < 7; r++) {
            const daysAgo = (51 - c) * 7 + (6 - r);
            const d = new Date(today);
            d.setDate(d.getDate() - daysAgo);
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            const count = stats.heatmap[dateStr] || 0;
            let bgClass = 'bg-[#2d2d2d]';
            if (count > 0 && count <= 3) bgClass = 'bg-[#783e1f]';
            else if (count >= 4) bgClass = 'bg-[var(--color-primary)]';

            col.push(<div key={r} title={`${dateStr}: ${count} submissions`} className={`w-3.5 h-3.5 rounded-sm ${bgClass}`} />);
        }
        heatmapGrid.push(<div key={c} className="flex flex-col gap-1.5">{col}</div>);
    }

    const currentRating = user?.rating || 0;
    const isUnranked = stats.totalSolved === 0 && currentRating === 0;

    const maxRating = Math.max(currentRating, 0);
    const pseudoRank = isUnranked ? 'Unranked' : Math.max(1, 15000 - (stats.totalSolved * 50));
    const currentStreak = stats?.currentStreak || 0;
    const maxStreak = stats?.maxStreak || 0;
    const recentGain = stats?.recentPoints || 0;

    return (
        <div className="flex flex-col gap-6 w-full min-w-0">

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl shadow-lg p-5">
                    <div className="text-gray-400 text-sm font-semibold mb-2">Current Rating</div>
                    <div className="text-3xl font-bold text-white mb-2">{isUnranked ? 'N/A' : currentRating.toLocaleString()}</div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className={`${recentGain > 0 ? 'text-green-500' : 'text-gray-500'} font-semibold flex items-center`}>
                            {recentGain > 0 && <TrendingUp size={12} className="mr-1" />}
                            {recentGain > 0 ? `+${recentGain}` : '0'}
                        </span>
                        <span className="text-gray-500">recently</span>
                    </div>
                </div>

                <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl shadow-lg p-5">
                    <div className="text-gray-400 text-sm font-semibold mb-2">Max Rating</div>
                    <div className="text-3xl font-bold text-white mb-2">{isUnranked ? 'N/A' : maxRating.toLocaleString()}</div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">
                            {isUnranked ? 'Unranked' : (currentRating >= 1500 ? 'Master' : (currentRating >= 1200 ? 'Specialist' : 'Novice'))}
                        </span>
                    </div>
                </div>

                <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl shadow-lg p-5">
                    <div className="text-gray-400 text-sm font-semibold mb-2">Global Rank</div>
                    <div className="text-3xl font-bold text-white mb-2">{isUnranked ? 'Unranked' : `#${pseudoRank.toLocaleString()}`}</div>
                    <div className="flex items-center gap-2 text-xs">
                        {isUnranked ? (
                            <span className="text-gray-500 font-semibold">• Not yet placed</span>
                        ) : (
                            <span className="text-green-500 font-semibold flex items-center">▲ Top {Math.max(0.1, (pseudoRank / 100000 * 100).toFixed(1))}%</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Heatmap Card */}
            <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-white font-bold">Submission History</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#2d2d2d]"></div> 0</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[#783e1f]"></div> 1-3</div>
                        <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-[var(--color-primary)]"></div> 4+</div>
                    </div>
                </div>

                {/* Dummy Heatmap Grid */}
                <div className="w-full overflow-x-auto custom-scrollbar pb-4">
                    <div className="flex gap-1.5 min-w-max">
                        {heatmapGrid}
                    </div>
                </div>

                {/* Streak Stats */}
                <div className="flex justify-between mt-6 pt-6 border-t border-[var(--color-dark-border)]">
                    <div className="text-center">
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Current Streak</div>
                        <div className="text-xl font-bold text-white">{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Active Days</div>
                        <div className="text-xl font-bold text-white">{totalActiveDays} Days</div>
                    </div>
                    <div className="text-center">
                        <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Max Streak</div>
                        <div className="text-xl font-bold text-white">{maxStreak} {maxStreak === 1 ? 'Day' : 'Days'}</div>
                    </div>
                </div>
            </div>

            {/* Recent Submissions */}
            <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl shadow-lg">
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-dark-border)]">
                    <h3 className="text-white font-bold">Recent Submissions</h3>
                    <button className="text-[var(--color-primary)] text-sm font-semibold hover:underline">View All</button>
                </div>

                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse min-w-max">
                        <thead className="text-xs text-gray-500 uppercase bg-[#1a1a1a]">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Problem</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Language</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Verdict</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--color-dark-border)]">
                            {stats.recentSubmissions.length > 0 ? stats.recentSubmissions.map((sub, i) => (
                                <tr key={i} className="hover:bg-[#252525] transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white whitespace-nowrap">{sub.problemTitle}</div>
                                        <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">{sub.category} • {sub.difficulty}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{sub.language || 'Auto'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2.5 py-1 text-xs font-bold rounded-full border inline-flex items-center gap-1.5
                                            ${sub.status === 'Accepted' ? 'text-green-500 bg-green-500/10 border-green-500/20' :
                                                sub.status === 'Wrong Answer' ? 'text-red-500 bg-red-500/10 border-red-500/20' :
                                                    'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Accepted' ? 'bg-green-500' : sub.status === 'Wrong Answer' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                            {sub.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-gray-500 font-mono text-xs whitespace-nowrap">
                                        {new Date(sub.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="text-center py-6 text-gray-500 italic">No recent submissions found. Start practicing!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default ProfileMiddleContent;
