import React from 'react';
import { Code2 } from 'lucide-react';

const ProfileRightSidebar = ({ stats }) => {
    const totalSolved = stats?.totalSolved || 0;
    const easyCount = stats?.difficulty?.Easy || 0;
    const medCount = stats?.difficulty?.Medium || 0;
    const hardCount = stats?.difficulty?.Hard || 0;
    const diffTotal = easyCount + medCount + hardCount;

    const getWidth = (count) => diffTotal === 0 ? '0%' : `${Math.round((count / diffTotal) * 100)}%`;

    const rawLangs = stats?.languages || {};
    const sortedLangs = Object.entries(rawLangs)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const totalLangSubmissions = sortedLangs.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="flex flex-col gap-6 w-full min-w-0">

            {/* Languages Card */}
            <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl shadow-lg p-6">
                <h3 className="text-white font-bold mb-6">Languages</h3>

                <div className="flex justify-center mb-8 relative">
                    {/* Circular Progress Placeholder */}
                    <div className="w-36 h-36 rounded-full border-[10px] border-[#333] relative flex items-center justify-center shadow-inner">
                        <svg className="absolute top-[-10px] left-[-10px] w-[154px] h-[154px] transform -rotate-90">
                            <circle
                                cx="77" cy="77" r="72"
                                fill="none"
                                stroke="var(--color-primary)"
                                strokeWidth="10"
                                strokeDasharray="450"
                                strokeDashoffset="150"
                                className="transition-all duration-1000 ease-out"
                            />
                            <circle
                                cx="77" cy="77" r="72"
                                fill="none"
                                stroke="#3b82f6"
                                strokeWidth="10"
                                strokeDasharray="450"
                                strokeDashoffset="350"
                                className="transition-all duration-1000 ease-out"
                            />
                            <circle
                                cx="77" cy="77" r="72"
                                fill="none"
                                stroke="#22c55e"
                                strokeWidth="10"
                                strokeDasharray="450"
                                strokeDashoffset="400"
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white tracking-tighter">{totalSolved}</div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-1">Total Solved</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {sortedLangs.length > 0 ? sortedLangs.map((lang, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-[var(--color-primary)]' : idx === 1 ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                <span className="text-gray-300">{lang.name}</span>
                            </div>
                            <div className="text-white font-semibold flex items-center gap-2">
                                <span>{lang.count}</span>
                                <span className="text-gray-500 text-xs w-8 text-right">{Math.round((lang.count / totalLangSubmissions) * 100)}%</span>
                            </div>
                        </div>
                    )) : (
                        <div className="text-gray-500 text-xs text-center italic">No language data yet</div>
                    )}
                </div>
            </div>

            {/* Difficulty Card */}
            <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl shadow-lg p-6">
                <h3 className="text-white font-bold mb-6">Difficulty</h3>

                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-green-500 font-semibold">Easy</span>
                            <span className="text-gray-400">{easyCount} <span className="text-gray-500 text-xs">solved</span></span>
                        </div>
                        <div className="w-full h-2 bg-[#2d2d2d] rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: getWidth(easyCount) }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-yellow-500 font-semibold">Medium</span>
                            <span className="text-gray-400">{medCount} <span className="text-gray-500 text-xs">solved</span></span>
                        </div>
                        <div className="w-full h-2 bg-[#2d2d2d] rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full transition-all duration-1000" style={{ width: getWidth(medCount) }}></div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-red-500 font-semibold">Hard</span>
                            <span className="text-gray-400">{hardCount} <span className="text-gray-500 text-xs">solved</span></span>
                        </div>
                        <div className="w-full h-2 bg-[#2d2d2d] rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: getWidth(hardCount) }}></div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default ProfileRightSidebar;
