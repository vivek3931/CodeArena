import React, { useState } from 'react';
import { MapPin, Building, Link as LinkIcon, Edit3, Lock, X, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── All 12 badge definitions (must match backend BADGE_DEFINITIONS exactly) ──
const ALL_BADGES = [
    { id: 'first_blood', name: 'First Blood', img: '/badges/first_blood.png', description: 'Solve your very first problem' },
    { id: 'easy_5', name: 'Warm Up', img: '/badges/warm_up.png', description: 'Solve 5 Easy problems' },
    { id: 'medium_5', name: 'Rising Star', img: '/badges/rising_star.png', description: 'Solve 5 Medium problems' },
    { id: 'hard_3', name: 'Hard Crusher', img: '/badges/hard_crusher.png', description: 'Solve 3 Hard problems' },
    { id: 'ten_solved', name: 'Dedicated', img: '/badges/dedicated.png', description: 'Solve 10 unique problems' },
    { id: 'twenty_five_solved', name: 'Warrior', img: '/badges/warrior.png', description: 'Solve 25 unique problems' },
    { id: 'fifty_solved', name: 'Veteran', img: '/badges/veteran.png', description: 'Solve 50 unique problems' },
    { id: 'century', name: 'Centurion', img: '/badges/centurion.png', description: 'Solve 100 unique problems' },
    { id: 'points_1000', name: 'Point Collector', img: '/badges/point_collector.png', description: 'Accumulate 1,000 rating' },
    { id: 'points_5000', name: 'Elite Coder', img: '/badges/elite_coder.png', description: 'Accumulate 5,000 rating' },
    { id: 'points_10000', name: 'Grandmaster', img: '/badges/grandmaster.png', description: 'Accumulate 10,000 rating' },
    { id: 'hard_10', name: 'Beast Mode', img: '/badges/beast_mode.png', description: 'Solve 10 Hard problems' },
];

const inputClass = "w-full bg-[#120a06] border border-[#2d1e16] focus:border-[var(--color-primary)] text-white text-sm rounded-lg px-3 py-2 focus:outline-none transition-colors";

const ProfileSidebar = ({ user, onProfileUpdate }) => {
    const navigate = useNavigate();
    const earnedIds = new Set((user?.badges || []).map(b => b.id));
    const unlockedCount = earnedIds.size;

    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', bio: '', location: '', github: '' });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
        window.location.reload();
    };

    const handleEdit = () => {
        setForm({
            name: user?.name || '',
            bio: user?.bio || '',
            location: user?.location || '',
            github: user?.github || ''
        });
        setEditing(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const updated = await res.json();
                localStorage.setItem('user', JSON.stringify(updated));
                if (onProfileUpdate) onProfileUpdate(updated);
                setEditing(false);
            }
        } catch (err) {
            console.error('Profile update failed:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-6">

            {/* ═══ Profile Card ═══ */}
            <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl overflow-hidden shadow-lg p-6">
                <div className="flex flex-col items-center">
                    {/* Avatar */}
                    <div className="relative mb-4">
                        <div className="w-28 h-28 rounded-full border-4 border-[#333] shadow-inner overflow-hidden bg-gradient-to-b from-[#553621] to-[#25150a] flex items-center justify-center text-3xl font-bold text-[var(--color-primary)] uppercase">
                            {(editing ? form.name : user?.name) ? (editing ? form.name : user?.name).charAt(0) : user?.email?.charAt(0)}
                            {(editing ? form.name : user?.name) ? (editing ? form.name : user?.name).charAt(0) : user?.email?.charAt(0)}
                        </div>
                        <div className="absolute bottom-1 right-2 w-4 h-4 rounded-full bg-green-500 border-2 border-[var(--color-dark-surface)]"></div>
                    </div>

                    {editing ? (
                        /* ── EDIT MODE ── */
                        <div className="w-full flex flex-col gap-4">
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">Display Name</label>
                                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" className={inputClass} maxLength={50} />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">Bio</label>
                                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell us about yourself..." className={`${inputClass} resize-none h-20`} maxLength={200} />
                                <div className="text-right text-[10px] text-gray-600 mt-0.5">{form.bio.length}/200</div>
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">Location</label>
                                <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="City, Country" className={inputClass} maxLength={100} />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 block">GitHub / Portfolio URL</label>
                                <input type="url" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/username" className={inputClass} />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Lock size={10} /> Email (cannot be changed)
                                </label>
                                <div className="w-full bg-[#120a06]/50 border border-[#2d1e16] text-gray-500 text-sm rounded-lg px-3 py-2 cursor-not-allowed select-none">
                                    {user?.email}
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2">
                                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button onClick={() => setEditing(false)} disabled={saving} className="px-4 py-2.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-gray-300 font-semibold border border-[var(--color-dark-border)] transition-colors flex items-center gap-2">
                                    <X size={16} /> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ── VIEW MODE ── */
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2 tracking-tight text-center">
                                {user?.name || user?.email.split('@')[0]}
                            </h2>
                            <div className="px-3 py-1 bg-[#2a1a10] border border-[var(--color-primary)] text-[var(--color-primary)] rounded-full text-[10px] font-bold tracking-wider mb-6 uppercase">
                                {user?.preference === 'company' ? 'ORGANIZATION' : 'NEWBIE'}
                            </div>
                            {user?.bio && (
                                <p className="text-center text-gray-400 text-sm leading-relaxed mb-8 px-2">{user.bio}</p>
                            )}
                            <div className="w-full space-y-3 mb-8">
                                {user?.location && (
                                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                                        <MapPin size={16} /><span>{user.location}</span>
                                    </div>
                                )}
                                {user?.preference === 'company' && !user?.location && !user?.github && (
                                    <div className="flex items-center gap-3 text-gray-400 text-sm">
                                        <Building size={16} /><span>Corporate Account</span>
                                    </div>
                                )}
                                {user?.github && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <LinkIcon size={16} className="text-gray-400" />
                                        <a href={user.github} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:underline decoration-[var(--color-primary)]/50 transition-all">
                                            {user.github.replace(/^https?:\/\//, '')}
                                        </a>
                                    </div>
                                )}
                            </div>
                            <button onClick={handleEdit} className="w-full py-2.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-gray-200 font-semibold border border-[var(--color-dark-border)] transition-colors flex items-center justify-center gap-2 mb-3">
                                <Edit3 size={16} /> Edit Profile
                            </button>
                            <button onClick={handleLogout} className="w-full py-2 rounded-lg text-red-500/80 hover:text-red-500 hover:bg-red-500/10 text-sm transition-colors text-center">
                                Sign Out
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ═══ Badges Showcase ═══ */}
            <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-dark-border)] bg-gradient-to-r from-[#1a1310] to-[#120a06]">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🎖️</span>
                        <h3 className="text-white font-bold text-sm">Badges</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[var(--color-primary)] font-extrabold text-lg">{unlockedCount}</span>
                        <span className="text-gray-500 text-xs font-medium">/ {ALL_BADGES.length} Unlocked</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-4 pb-2">
                    <div className="w-full h-1.5 bg-[#2d1e16] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-orange-400 rounded-full transition-all duration-700"
                            style={{ width: `${(unlockedCount / ALL_BADGES.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Badge Grid */}
                <div className="p-4">
                    <div className="grid grid-cols-4 gap-3">
                        {ALL_BADGES.map((badge) => {
                            const isUnlocked = earnedIds.has(badge.id);
                            return (
                                <div
                                    key={badge.id}
                                    className={`group relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all duration-300 cursor-default ${isUnlocked
                                            ? 'bg-gradient-to-b from-[#2a1a10] to-[#120a06] border-[var(--color-primary)]/40 shadow-[0_0_12px_rgba(246,107,21,0.15)] hover:shadow-[0_0_20px_rgba(246,107,21,0.3)] hover:border-[var(--color-primary)]/80 hover:scale-105'
                                            : 'bg-[#0a0704] border-[#1a1410] opacity-40 hover:opacity-60'
                                        }`}
                                >
                                    <div className={`relative w-12 h-12 mb-1.5 ${isUnlocked ? '' : 'grayscale'}`}>
                                        <img src={badge.img} alt={badge.name} className="w-full h-full object-contain drop-shadow-lg" />
                                        {!isUnlocked && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Lock size={14} className="text-gray-600" />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`text-[9px] font-bold text-center leading-tight w-full truncate ${isUnlocked ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {badge.name}
                                    </span>
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/95 border border-[#2d1e16] rounded-lg px-3 py-2.5 text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl min-w-[140px]">
                                        <div className="flex items-center gap-2 mb-1">
                                            <img src={badge.img} alt="" className="w-5 h-5" />
                                            <span className={`font-bold ${isUnlocked ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>{badge.name}</span>
                                        </div>
                                        <div className="text-gray-400 text-[10px] leading-relaxed">{badge.description}</div>
                                        {isUnlocked
                                            ? <div className="text-green-500 text-[10px] mt-1 font-bold">✓ Unlocked</div>
                                            : <div className="text-gray-600 text-[10px] mt-1 font-bold">🔒 Locked</div>
                                        }
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Rating Footer */}
                <div className="px-6 py-4 border-t border-[var(--color-dark-border)] bg-[#0d0806] flex items-center justify-between">
                    <div>
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Global Rating</div>
                        <div className="text-2xl font-extrabold text-[var(--color-primary)] tracking-tight">{(user?.rating || 0).toLocaleString()}</div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">Next Badge</div>
                        {unlockedCount < ALL_BADGES.length ? (
                            <div className="flex items-center gap-1.5">
                                <img src={ALL_BADGES.find(b => !earnedIds.has(b.id))?.img} alt="next" className="w-5 h-5 grayscale opacity-60" />
                                <span className="text-xs text-gray-400 font-bold">{ALL_BADGES.find(b => !earnedIds.has(b.id))?.name}</span>
                            </div>
                        ) : (
                            <span className="text-xs text-[var(--color-primary)] font-bold">All Unlocked! 🏆</span>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══ Teams Card ═══ */}
            <div className="bg-[var(--color-dark-surface)] border border-[var(--color-dark-border)] rounded-xl shadow-lg p-6">
                <h3 className="flex items-center gap-2 text-white font-bold mb-4">
                    <span className="text-[var(--color-primary)]">👥</span> Teams
                </h3>
                <div className="space-y-4">
                    <div className="text-gray-500 text-xs italic text-center py-2">
                        Not a member of any teams yet.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileSidebar;
