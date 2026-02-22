import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, Loader2, RotateCcw, Target, Brain, Clock, Rocket, Code2, Trophy, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
    {
        id: 'goal',
        title: "What's your main goal?",
        subtitle: 'Choose the path that excites you the most',
        icon: Target,
        options: [
            { value: 'Master DSA for Competitive Programming', label: 'Master DSA for CP', desc: 'Dominate competitive programming contests', icon: Trophy, color: 'from-yellow-500/20 to-orange-500/20', border: 'border-yellow-500/40' },
            { value: 'Crack FAANG / Product-Based Company Interviews with DSA', label: 'Crack FAANG Interviews', desc: 'Ace DSA rounds at top tech companies', icon: Rocket, color: 'from-blue-500/20 to-purple-500/20', border: 'border-blue-500/40' },
            { value: 'Master DSA from Scratch for Placements', label: 'DSA for Placements', desc: 'Build strong DSA foundation for campus placements', icon: Code2, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/40' },
        ],
    },
    {
        id: 'experience',
        title: "What's your current level?",
        subtitle: 'Be honest — this helps us tailor the roadmap',
        icon: Brain,
        options: [
            { value: 'Complete Beginner — just starting out', label: 'Beginner', desc: 'Just getting started with programming', icon: Zap, color: 'from-green-500/20 to-lime-500/20', border: 'border-green-500/40' },
            { value: 'Know Basics — comfortable with loops, arrays, functions', label: 'Know Basics', desc: 'Comfortable with loops, arrays & functions', icon: Code2, color: 'from-blue-500/20 to-indigo-500/20', border: 'border-blue-500/40' },
            { value: 'Intermediate — solved 100+ problems, know common patterns', label: 'Intermediate', desc: 'Solved 100+ problems, know common patterns', icon: Brain, color: 'from-purple-500/20 to-violet-500/20', border: 'border-purple-500/40' },
            { value: 'Advanced — regular contest participant with strong fundamentals', label: 'Advanced', desc: 'Contest experience with strong fundamentals', icon: Trophy, color: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/40' },
        ],
    },
    {
        id: 'timeCommitment',
        title: 'How much time can you dedicate daily?',
        subtitle: "We'll pace your roadmap accordingly",
        icon: Clock,
        options: [
            { value: '1-2 hours per day', label: '1-2 hrs/day', desc: 'Balanced alongside other commitments', icon: Clock, color: 'from-teal-500/20 to-cyan-500/20', border: 'border-teal-500/40' },
            { value: '3-4 hours per day', label: '3-4 hrs/day', desc: 'Serious about consistent progress', icon: Zap, color: 'from-blue-500/20 to-sky-500/20', border: 'border-blue-500/40' },
            { value: '5-6 hours per day', label: '5-6 hrs/day', desc: 'Dedicated and focused grind', icon: Rocket, color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/40' },
            { value: '6+ hours per day (Full-time)', label: '6+ hrs/day', desc: 'Full-time commitment, maximum speed', icon: Trophy, color: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/40' },
        ],
    },
];

const AiRoadmapPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({ goal: '', experience: '', timeCommitment: '' });
    const [roadmap, setRoadmap] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
        }
    }, [navigate]);

    const currentQuestion = QUESTIONS[step];
    const isLastStep = step === QUESTIONS.length - 1;
    const allAnswered = answers.goal && answers.experience && answers.timeCommitment;

    const handleSelect = (value) => {
        setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
    };

    const handleNext = () => {
        if (isLastStep) {
            generateRoadmap();
        } else {
            setStep((s) => s + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) setStep((s) => s - 1);
    };

    const generateRoadmap = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/roadmap/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(answers),
            });
            const data = await res.json();
            if (res.ok) {
                setRoadmap(data.roadmap);
            } else {
                setError(data.error || 'Failed to generate roadmap.');
            }
        } catch (err) {
            setError('Could not connect to the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setStep(0);
        setAnswers({ goal: '', experience: '', timeCommitment: '' });
        setRoadmap('');
        setError('');
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen p-6">
                <div className="text-center space-y-6">
                    <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-[var(--color-primary)]/20"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--color-primary)] animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto text-[var(--color-primary)]" size={28} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Crafting Your Roadmap...</h3>
                        <p className="text-gray-400 text-sm">Our AI is building a personalized plan just for you</p>
                    </div>
                </div>
            </div>
        );
    }

    if (roadmap) {
        return (
            <div className="flex-1 bg-black min-h-screen p-4 md:p-8 relative">
                <div className="pointer-events-none fixed inset-0 z-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[var(--color-primary)]/8 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <div className="relative mb-8 rounded-2xl overflow-hidden">
                        <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-[var(--color-primary)] to-yellow-500"
                            style={{ backgroundSize: '200% 100%', animation: 'gradient-shift 3s ease infinite' }} />

                        <div className="bg-gradient-to-b from-[#1f1610] to-[#161010] p-6 md:p-8 border border-[#2d1e16] border-t-0 rounded-b-2xl">
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    {/* Glowing AI icon */}
                                    <div className="relative">
                                        <div className="absolute inset-0 rounded-2xl bg-[var(--color-primary)] blur-xl opacity-40 animate-pulse" />
                                        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-orange-700 flex items-center justify-center shadow-2xl shadow-[var(--color-primary)]/40 border border-orange-500/30">
                                            <Sparkles size={24} className="text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Your DSA Roadmap</h2>
                                        <p className="text-sm text-gray-400 mt-0.5">Personalized by AI · Powered by Code Arena</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-[var(--color-primary)]/40 transition-all duration-300 text-sm font-semibold backdrop-blur-sm"
                                >
                                    <RotateCcw size={14} />
                                    Start Over
                                </button>
                            </div>

                            {/* Summary pills */}
                            <div className="flex flex-wrap gap-2.5 mt-6">
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500/8 border border-yellow-500/15 text-yellow-400 text-xs font-semibold tracking-wide">
                                    <Target size={12} />
                                    {answers.goal.split(' — ')[0]}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/8 border border-purple-500/15 text-purple-400 text-xs font-semibold tracking-wide">
                                    <Brain size={12} />
                                    {answers.experience.split(' — ')[0]}
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/8 border border-cyan-500/15 text-cyan-400 text-xs font-semibold tracking-wide">
                                    <Clock size={12} />
                                    {answers.timeCommitment}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Roadmap Content Card */}
                    <div className="relative rounded-2xl overflow-hidden">
                        {/* Subtle outer glow */}
                        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-[var(--color-primary)]/20 via-transparent to-transparent pointer-events-none" />

                        <div className="relative bg-[#141010] border border-[#2a1e16] rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
                            {/* Inner top accent */}
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--color-primary)]/30 to-transparent" />

                            <div className="p-6 md:p-10">
                                <ReactMarkdown
                                    components={{
                                        h1: ({ children }) => (
                                            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-6 pb-4 border-b border-[#2d1e16] flex items-center gap-3">
                                                <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-[var(--color-primary)] to-orange-600 inline-block shrink-0" />
                                                {children}
                                            </h1>
                                        ),
                                        h2: ({ children }) => (
                                            <div className="mt-10 mb-5 first:mt-0">
                                                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-3">
                                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/25 text-[var(--color-primary)] text-xs font-bold shrink-0">
                                                        <Zap size={14} />
                                                    </span>
                                                    <span className="text-[var(--color-primary)]">{children}</span>
                                                </h2>
                                                <div className="mt-2 h-px bg-gradient-to-r from-[var(--color-primary)]/20 to-transparent" />
                                            </div>
                                        ),
                                        h3: ({ children }) => (
                                            <h3 className="text-base md:text-lg font-semibold text-gray-100 mt-6 mb-3 flex items-center gap-2">
                                                <span className="w-1 h-1 rounded-full bg-[var(--color-primary)] inline-block shrink-0" />
                                                {children}
                                            </h3>
                                        ),
                                        p: ({ children }) => (
                                            <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-4">{children}</p>
                                        ),
                                        ul: ({ children }) => (
                                            <ul className="space-y-2.5 my-4 ml-1">{children}</ul>
                                        ),
                                        ol: ({ children }) => (
                                            <ol className="space-y-2.5 my-4 ml-1 list-decimal list-inside">{children}</ol>
                                        ),
                                        li: ({ children }) => (
                                            <li className="flex items-start gap-3 text-sm md:text-base text-gray-300">
                                                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />
                                                <span className="flex-1">{children}</span>
                                            </li>
                                        ),
                                        strong: ({ children }) => (
                                            <strong className="text-white font-semibold">{children}</strong>
                                        ),
                                        em: ({ children }) => (
                                            <em className="text-gray-200 italic">{children}</em>
                                        ),
                                        code: ({ children }) => (
                                            <code className="text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-md text-sm font-medium border border-[var(--color-primary)]/15">{children}</code>
                                        ),
                                        hr: () => (
                                            <hr className="my-8 border-none h-px bg-gradient-to-r from-transparent via-[#2d1e16] to-transparent" />
                                        ),
                                        a: ({ children, href }) => (
                                            <a href={href} target="_blank" rel="noreferrer" className="text-[var(--color-primary)] hover:text-orange-300 underline underline-offset-2 transition-colors">{children}</a>
                                        ),
                                    }}
                                >
                                    {roadmap}
                                </ReactMarkdown>
                            </div>

                            {/* Bottom CTA */}
                            <div className="border-t border-[#2a1e16] px-6 md:px-10 py-5 flex items-center justify-between bg-[#120e0a]">
                                <p className="text-xs text-gray-500">Generated with AI · Results may vary</p>
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:text-white transition-colors"
                                >
                                    <RotateCcw size={14} />
                                    Generate New Roadmap
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CSS for gradient animation */}
                <style>{`
                    @keyframes gradient-shift {
                        0%, 100% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                    }
                `}</style>
            </div>
        );
    }

    // ---------- QUESTIONNAIRE ----------
    return (
        <div className="flex-1 flex items-center justify-center min-h-screen p-4 md:p-6">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-bold mb-4 tracking-wide uppercase">
                        <Sparkles size={14} />
                        AI-Powered Roadmap
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
                        Build Your Path to Mastery
                    </h1>
                    <p className="text-gray-400 text-sm">Answer 3 quick questions and get a personalized roadmap</p>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-8">
                    {QUESTIONS.map((_, i) => (
                        <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-[#2d1e16]">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${i < step ? 'bg-[var(--color-primary)] w-full'
                                    : i === step ? 'bg-gradient-to-r from-[var(--color-primary)] to-orange-400 w-full animate-pulse'
                                        : 'w-0'
                                    }`}
                                style={{ width: i <= step ? '100%' : '0%' }}
                            />
                        </div>
                    ))}
                    <span className="text-xs text-gray-500 font-mono ml-2">{step + 1}/{QUESTIONS.length}</span>
                </div>

                {/* Question card */}
                <div className="bg-[#1a1310] border border-[#2d1e16] rounded-2xl shadow-2xl overflow-hidden">
                    {/* Decorative header bar */}
                    <div className="h-1 w-full bg-gradient-to-r from-[var(--color-primary)] via-orange-400 to-yellow-500"></div>

                    <div className="p-6 md:p-8">
                        {/* Question title */}
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-9 h-9 rounded-lg bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center">
                                <currentQuestion.icon size={18} className="text-[var(--color-primary)]" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-white">{currentQuestion.title}</h2>
                        </div>
                        <p className="text-gray-400 text-sm mb-6 ml-12">{currentQuestion.subtitle}</p>

                        {/* Options */}
                        <div className="space-y-3">
                            {currentQuestion.options.map((opt) => {
                                const isSelected = answers[currentQuestion.id] === opt.value;
                                const Icon = opt.icon;
                                return (
                                    <button
                                        key={opt.value}
                                        onClick={() => handleSelect(opt.value)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 group cursor-pointer ${isSelected
                                            ? `bg-gradient-to-r ${opt.color} ${opt.border} shadow-lg`
                                            : 'bg-[#120a06] border-[#2d1e16] hover:border-gray-600 hover:bg-[#1a1310]'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected
                                                ? 'bg-white/10'
                                                : 'bg-[#1a1310] group-hover:bg-[#2d1e16]'
                                                }`}>
                                                <Icon size={18} className={isSelected ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>{opt.label}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-8">
                            <button
                                onClick={handleBack}
                                disabled={step === 0}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <ArrowLeft size={16} />
                                Back
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={!answers[currentQuestion.id]}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white shadow-[0_0_20px_rgba(246,107,21,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none group"
                            >
                                {isLastStep ? (
                                    <>
                                        <Sparkles size={16} />
                                        Generate My Roadmap
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiRoadmapPage;