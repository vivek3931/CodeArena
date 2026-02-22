import { useState, useEffect, useRef, useCallback } from "react";
import {
    Code2, Trophy, MessageCircle, Zap, Activity,
    CheckCircle, XCircle, CircleDot, HelpCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";

/* ───── Code Editor Preview ───── */
const sampleCode = `import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin });
const lines = [];

rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
    const t = parseInt(lines[0]);
    for (let i = 1; i <= t; i++) {
        const s = lines[i];
        console.log(s.split('').reverse().join(''));
    }
});`;

function CodeEditorPreview() {
    const lines = sampleCode.split("\n");
    return (
        <div className="h-[255px] w-full overflow-hidden rounded-t-xl border-x border-t border-white/10 bg-[#1e1e1e]">
            <div className="flex items-center gap-2 px-4 py-2 bg-[#252526] border-b border-white/5 text-xs text-gray-500">
                <span>solution.ts</span>
            </div>
            <pre className="p-4 text-sm font-mono leading-relaxed overflow-hidden">
                {lines.map((line, i) => (
                    <div key={i} className="flex">
                        <span className="w-8 text-right pr-4 text-gray-600 select-none text-xs">{i + 1}</span>
                        <code className="text-gray-300">{line || " "}</code>
                    </div>
                ))}
            </pre>
        </div>
    );
}

/* ───── Mock Leaderboard ───── */
const leaderboardData = [
    { rank: 1, name: "Tom Nyuma", solved: 3, time: "1h 42m", a: "1/18", b: "2/35", c: "1/49" },
    { rank: 2, name: "Otso Barron", solved: 3, time: "2h 15m", a: "2/24", b: "1/52", c: "3/59" },
    { rank: 3, name: "Jordan Brantner", solved: 2, time: "1h 58m", a: "1/31", b: "4/87", c: "5/--" },
    { rank: 4, name: "Andrew Dang", solved: 2, time: "2h 31m", a: "3/45", b: "2/--", c: "2/106" },
    { rank: 5, name: "Aisha Patel", solved: 2, time: "2h 44m", a: "4/--", b: "1/67", c: "2/97" },
    { rank: 6, name: "David Kim", solved: 1, time: "58m", a: "2/58", b: "3/--", c: null },
    { rank: 7, name: "Sofia Martinez", solved: 1, time: "1h 12m", a: "1/--", b: "1/72", c: "2/--" },
    { rank: 8, name: "Ryan O'Connor", solved: 1, time: "1h 34m", a: "5/94", b: "2/--", c: "1/--" },
    { rank: 9, name: "Luna Zhang", solved: 0, time: "--", a: "3/--", b: "1/--", c: null },
    { rank: 10, name: "Alex Thompson", solved: 0, time: "--", a: "2/--", b: null, c: "1/--" },
];

function ProblemCell({ value }) {
    if (!value) return <div className="h-5 w-12 rounded bg-gray-800" />;
    const isSolved = !value.includes("--");
    return (
        <div className={cn("flex h-5 w-12 items-center justify-center rounded text-[10px] font-medium text-white", isSolved ? "bg-emerald-600" : "bg-osu")}>
            {value}
        </div>
    );
}

function MockLeaderboard() {
    return (
        <div className="w-full overflow-x-auto rounded-md border border-osu/60 bg-black/70 text-xs shadow-sm">
            <div className="flex items-center justify-between border-b border-osu/50 px-3 py-2 bg-black/60">
                <h3 className="text-sm font-semibold text-white">Leaderboard</h3>
                <span className="rounded bg-emerald-600/30 px-1.5 py-0.5 text-[10px] text-emerald-200">42 participants</span>
            </div>
            <table className="w-full text-white min-w-[400px]">
                <thead>
                    <tr className="border-b border-osu/40 text-[10px] text-gray-300">
                        <th className="px-2 py-1.5 text-left font-medium">#</th>
                        <th className="px-2 py-1.5 text-left font-medium">Participant</th>
                        <th className="px-2 py-1.5 text-center font-medium">Solved</th>
                        <th className="px-2 py-1.5 text-center font-medium">Time</th>
                        <th className="px-2 py-1.5 text-center font-medium">A</th>
                        <th className="px-2 py-1.5 text-center font-medium">B</th>
                        <th className="px-2 py-1.5 text-center font-medium">C</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboardData.map((e) => (
                        <tr key={e.rank} className="border-b border-osu/30 text-white last:border-0 bg-black/60">
                            <td className="px-2 py-1 text-gray-300">{e.rank}</td>
                            <td className="px-2 py-1 font-medium truncate max-w-[120px]">{e.name}</td>
                            <td className="px-2 py-1 text-center">{e.solved}</td>
                            <td className="px-2 py-1 text-center text-gray-300">{e.time}</td>
                            <td className="px-2 py-1"><div className="flex justify-center"><ProblemCell value={e.a} /></div></td>
                            <td className="px-2 py-1"><div className="flex justify-center"><ProblemCell value={e.b} /></div></td>
                            <td className="px-2 py-1"><div className="flex justify-center"><ProblemCell value={e.c} /></div></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

/* ───── Mock Q&A ───── */
const questionsData = [
    { id: 1, user: "Sarah Chen", problem: "Two Sum", question: "Can we assume the input array is always sorted?", time: "2m ago", answered: true },
    { id: 2, user: "Marcus Rivera", problem: "Binary Search", question: "What should we return if the target is not found?", time: "5m ago", answered: true },
    { id: 3, user: "Emily Watson", problem: "Two Sum", question: "Is there always exactly one solution?", time: "8m ago", answered: true },
    { id: 4, user: "James Park", problem: "Graph Traversal", question: "Can the graph contain cycles?", time: "12m ago", answered: false },
    { id: 5, user: "Aisha Patel", problem: "Binary Search", question: "Should we handle duplicate values?", time: "15m ago", answered: false },
];

function MockQA() {
    return (
        <div className="flex w-full flex-col overflow-hidden rounded-md border border-osu/60 bg-black/70 text-xs shadow-sm">
            <div className="flex items-center justify-between border-b border-osu/50 px-3 py-2 bg-black/60">
                <h3 className="text-sm font-semibold text-white">Q&A</h3>
                <span className="flex items-center gap-1 text-[10px] text-gray-300">
                    <HelpCircle className="w-3 h-3" /> Ask a question
                </span>
            </div>
            <div className="flex-1 divide-y divide-osu/40 text-white">
                {questionsData.map((q) => (
                    <div key={q.id} className="flex items-start gap-2 px-3 py-2 bg-black/60">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-medium text-white text-sm">{q.user}</span>
                                <span className="shrink-0 rounded bg-osu/20 px-1 py-0.5 text-[9px] text-osu">{q.problem}</span>
                            </div>
                            <p className="mt-0.5 text-gray-300 line-clamp-1 text-xs">{q.question}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5 flex-col">
                            <span className="text-[10px] text-gray-300">{q.time}</span>
                            {q.answered ? (
                                <span className="flex items-center gap-0.5 rounded bg-emerald-600/30 px-1 py-0.5 text-[9px] text-emerald-200">
                                    <CheckCircle className="w-2.5 h-2.5" /> Answered
                                </span>
                            ) : (
                                <span className="rounded bg-neutral-700 px-1 py-0.5 text-[9px] text-gray-200">Pending</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ───── Animated Execution Feed ───── */
function AnimatedExecutionFeed() {
    const [steps, setSteps] = useState([]);
    const [result, setResult] = useState(null);
    const totalTests = 5;

    useEffect(() => {
        const timeouts = [];
        const randomTime = () => `${Math.floor(Math.random() * 50) + 5}ms`;

        setSteps([]);
        setResult(null);

        // Start compiling
        setSteps([{ label: "Compiling...", status: "running" }]);

        timeouts.push(setTimeout(() => {
            setSteps([{ label: "Compiling...", status: "completed", time: randomTime() }]);
            let currentTest = 1;
            const runNext = () => {
                if (currentTest > totalTests) {
                    setResult("success");
                    return;
                }
                setSteps((prev) => [...prev, { label: `Running test case ${currentTest}/${totalTests}`, status: "running" }]);
                timeouts.push(setTimeout(() => {
                    setSteps((prev) => {
                        const u = [...prev];
                        u[u.length - 1] = { ...u[u.length - 1], status: "completed", time: randomTime() };
                        return u;
                    });
                    currentTest++;
                    timeouts.push(setTimeout(runNext, 400 + Math.random() * 300));
                }, 500 + Math.random() * 400));
            };
            timeouts.push(setTimeout(runNext, 300));
        }, 600));

        return () => {
            timeouts.forEach(clearTimeout);
        };
    }, []);

    return (
        <div className="h-[280px] overflow-y-auto scrollbar-hide space-y-2 rounded-md border border-osu/60 bg-black/70 p-3 text-xs shadow-sm">
            {steps.map((step, i) => (
                <div key={i} className="flex items-center justify-between gap-2 bg-black/60 rounded px-2 py-1.5">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {step.status === "completed" && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        {step.status === "running" && <div className="w-3.5 h-3.5 rounded-full border-2 border-osu border-t-transparent animate-spin shrink-0" />}
                        {step.status === "error" && <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                        <span className="text-white text-xs truncate">{step.label}</span>
                    </div>
                    {step.time && <span className="text-gray-300 text-xs shrink-0">{step.time}</span>}
                </div>
            ))}
            {result === "success" && (
                <div className="mt-3 rounded-md px-3 py-2 text-center font-medium text-sm bg-emerald-600 text-white">
                    All tests passed!
                </div>
            )}
        </div>
    );
}

/* ───── Animated Submissions List ───── */
const submissionsData = [
    { id: "1", problem: "N-Queens", language: "Go", status: "TIME_LIMIT_EXCEEDED", time: "1s ago", color: "text-cyan-500" },
    { id: "2", problem: "Merge Sort", language: "Python", status: "ACCEPTED", time: "2s ago", color: "text-yellow-500" },
    { id: "3", problem: "Two Sum", language: "TypeScript", status: "ACCEPTED", time: "5s ago", color: "text-blue-500" },
    { id: "4", problem: "Binary Search", language: "Rust", status: "WRONG_ANSWER", time: "8s ago", color: "text-orange-500" },
    { id: "5", problem: "Graph Traversal", language: "Java", status: "RUNTIME_ERROR", time: "12s ago", color: "text-red-500" },
    { id: "6", problem: "Dynamic Programming", language: "C++", status: "ACCEPTED", time: "15s ago", color: "text-blue-600" },
    { id: "7", problem: "Linked List Cycle", language: "Swift", status: "ACCEPTED", time: "18s ago", color: "text-orange-400" },
];

const statusStyles = {
    ACCEPTED: { label: "Accepted", c: "bg-emerald-600 text-white" },
    WRONG_ANSWER: { label: "Wrong Answer", c: "bg-red-600 text-white" },
    RUNTIME_ERROR: { label: "Runtime Error", c: "bg-orange-600 text-white" },
    TIME_LIMIT_EXCEEDED: { label: "TLE", c: "bg-amber-600 text-white" },
    PENDING: { label: "Pending", c: "bg-neutral-700 text-gray-200" },
};

function AnimatedSubmissions() {
    const [visible, setVisible] = useState([]);

    useEffect(() => {
        const timeouts = [];
        submissionsData.forEach((_, i) => {
            timeouts.push(setTimeout(() => {
                setVisible((prev) => [submissionsData[i], ...prev]);
            }, i * 2000));
        });
        return () => timeouts.forEach(clearTimeout);
    }, []);

    return (
        <div className="relative flex h-[300px] w-full flex-col overflow-hidden px-3 py-3 select-none">
            {visible.map((s) => {
                const st = statusStyles[s.status];
                return (
                    <div key={s.id} className="mb-2 animate-slide-in rounded-xl p-3 bg-black/70 text-white border border-osu/50">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{s.problem}</span>
                                    <span className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", st.c)}>{st.label}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="flex items-center gap-1">
                                        <CircleDot className={cn("w-2.5 h-2.5", s.color)} /> {s.language}
                                    </span>
                                    <span>·</span>
                                    <span>{s.time}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ───── Countdown Timer ───── */
function CountdownTimer() {
    const units = [
        { value: "02", label: "DAYS" },
        { value: "14", label: "HOURS" },
        { value: "45", label: "MINS" },
    ];
    return (
        <div className="flex items-center gap-2">
            {units.map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-2">
                    <div className="flex flex-col items-center">
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 min-w-[56px] text-center">
                            <span className="text-white text-2xl font-bold font-mono">{unit.value}</span>
                        </div>
                        <span className="text-gray-500 text-[10px] font-medium mt-1.5 tracking-wider">{unit.label}</span>
                    </div>
                    {i < units.length - 1 && (
                        <span className="text-gray-500 text-xl font-bold mb-5">:</span>
                    )}
                </div>
            ))}
        </div>
    );
}

/* ───── Activity Chart ───── */
const chartData = [30, 45, 35, 60, 40, 75, 55, 80, 65, 90, 70, 85, 95, 78, 88, 72];

function MockActivityChart() {
    const maxV = Math.max(...chartData);
    return (
        <div className="w-full p-6">
            <div className="flex items-end gap-2 h-32 w-full mt-16">
                {chartData.map((v, i) => (
                    <div
                        key={i}
                        className="flex-1 rounded-t transition-all hover:opacity-80"
                        style={{
                            height: `${(v / maxV) * 100}%`,
                            background: `linear-gradient(to top, rgba(220,68,5,0.3), rgba(220,68,5,${0.3 + (v / maxV) * 0.5}))`,
                            border: "1px solid rgba(220,68,5,0.4)",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ───── Feature Card Wrapper ───── */
function FeatureCard({ children, className }) {
    return (
        <div className={cn(
            "group relative rounded-none shadow-zinc-950/5",
            "bg-black/80 text-white border border-osu/60 backdrop-blur",
            "w-full max-w-full overflow-hidden",
            className
        )}>
            {/* Corner decorators */}
            <span className="border-osu absolute -left-px -top-px block w-2 h-2 border-l-2 border-t-2" />
            <span className="border-osu absolute -right-px -top-px block w-2 h-2 border-r-2 border-t-2" />
            <span className="border-osu absolute -bottom-px -left-px block w-2 h-2 border-b-2 border-l-2" />
            <span className="border-osu absolute -bottom-px -right-px block w-2 h-2 border-b-2 border-r-2" />
            {children}
        </div>
    );
}

function CardHeading({ icon: Icon, title, description }) {
    return (
        <div className="p-5 md:p-6">
            <span className="text-gray-300 flex items-center gap-2 text-base">
                <Icon className="w-4 h-4" /> {title}
            </span>
            <p className="mt-6 md:mt-8 text-xl md:text-2xl font-semibold text-white">{description}</p>
        </div>
    );
}

function GradientOverlay() {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10"
            style={{
                background: "radial-gradient(125% 125% at 50% 0%, transparent 20%, rgba(0,0,0,0.75) 55%, rgba(0,0,0,0.95) 90%)"
            }}
        />
    );
}

/* ───── Main Features Export ───── */
export default function Features() {
    return (
        <section id="features" className="py-10 md:py-14 px-4 text-white overflow-x-hidden">
            <div className="relative mx-auto w-full overflow-hidden rounded-3xl">
                <div className="relative mx-auto w-full max-w-5xl px-4 md:px-6 py-10 md:py-14">
                    <h2 className="text-2xl md:text-4xl font-medium text-center w-full mx-auto max-w-3xl px-4 md:px-6 mb-8 text-white">
                        CodeArena offers all the tools you need to{" "}
                        <span className="bg-gradient-to-r from-osu to-osu-light text-transparent bg-clip-text font-serif italic font-semibold">
                            host, participate in, and organize{" "}
                        </span>
                        programming contests.
                    </h2>

                    <div className="mx-auto grid w-full gap-1 lg:grid-cols-2">
                        {/* Code Editor */}
                        <FeatureCard className="lg:col-span-2 overflow-hidden">
                            <div className="pb-3 px-4 md:px-6 pt-6">
                                <CardHeading icon={Code2} title="Code Editor" description="Powered by AI Compiler, Choice from Thousands of Programming languages of the world to code." />
                            </div>
                            <div className="relative border-t border-dashed border-white/10">
                                <div className="p-3 px-4 bg-black/70">
                                    <CodeEditorPreview />
                                </div>
                                <GradientOverlay />
                            </div>
                        </FeatureCard>

                        {/* Leaderboard */}
                        <FeatureCard>
                            <div className="pb-3">
                                <CardHeading icon={Trophy} title="Live Leaderboard" description="See how you stack up against other participants in real-time." />
                            </div>
                            <div className="relative border-t border-dashed border-white/10">
                                <div className="p-3 px-4 bg-black/70">
                                    <MockLeaderboard />
                                </div>
                                <GradientOverlay />
                            </div>
                        </FeatureCard>

                        {/* Q&A */}
                        <FeatureCard className="flex flex-col">
                            <div className="pb-3">
                                <CardHeading icon={MessageCircle} title="Contest Q&A" description="Get clarifications on problems directly from contest admins." />
                            </div>
                            <div className="relative flex-1 border-t border-dashed border-white/10">
                                <div className="flex h-full flex-col p-3 px-4 bg-black/70">
                                    <MockQA />
                                </div>
                                <GradientOverlay />
                            </div>
                        </FeatureCard>

                        {/* Why CodeArena */}
                        <div className="lg:col-span-2 py-10 md:py-14">
                            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-3">
                                Why CodeArena?
                            </h2>
                            <p className="text-center text-gray-400 text-sm md:text-base max-w-2xl mx-auto mb-10">
                                We provide the best environment for you to grow as a developer with state-of-the-art tools and community support.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    {
                                        icon: Zap,
                                        title: "Real-time Compilers",
                                        desc: "Run your code instantly in 20+ languages with our lightning fast execution engine and detailed debug info.",
                                    },
                                    {
                                        icon: Trophy,
                                        title: "Global Rankings",
                                        desc: "Compete with developers worldwide, earn badges, and showcase your algorithmic skills on global leaderboards.",
                                    },
                                    {
                                        icon: MessageCircle,
                                        title: "Mock Interviews",
                                        desc: "Practice with AI-powered mock interviews and get ready for your dream tech job.",
                                    },
                                ].map((item) => (
                                    <div
                                        key={item.title}
                                        className="bg-[#141414] border border-white/10 rounded-xl p-6 hover:border-osu/40 transition-colors"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-osu/20 flex items-center justify-center mb-4">
                                            <item.icon className="w-4 h-4 text-osu" />
                                        </div>
                                        <h3 className="text-white font-semibold text-base mb-2">{item.title}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Real-time Feedback */}
                        <FeatureCard className="overflow-hidden">
                            <div className="pb-3">
                                <CardHeading icon={Zap} title="Real-time Feedback" description="Get instant feedback on your submissions as they run." />
                            </div>
                            <div className="relative border-t border-dashed border-white/10">
                                <div className="p-3 px-4 min-h-[180px]">
                                    <AnimatedExecutionFeed />
                                </div>
                                <GradientOverlay />
                            </div>
                        </FeatureCard>

                        {/* Live Submissions */}
                        <FeatureCard className="flex flex-col overflow-hidden">
                            <div className="pb-3">
                                <CardHeading icon={Activity} title="Live Submissions" description="Watch submissions roll in from competitors worldwide." />
                            </div>
                            <div className="relative flex-1 border-t border-dashed border-white/10">
                                <div className="flex min-h-[300px] max-h-[300px] overflow-hidden scrollbar-hide">
                                    <AnimatedSubmissions />
                                </div>
                                <GradientOverlay />
                            </div>
                        </FeatureCard>

                        {/* Activity Overview */}
                        <FeatureCard className="relative lg:col-span-2 overflow-hidden">
                            <div className="absolute z-10 max-w-lg">
                                <div className="pb-3">
                                    <CardHeading icon={Activity} title="Activity Overview" description="Track submission patterns and performance. See your progress over time." />
                                </div>
                            </div>
                            <MockActivityChart />
                        </FeatureCard>

                        {/* Upcoming Contest */}
                        <FeatureCard className="lg:col-span-2 overflow-hidden">
                            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="w-2 h-2 rounded-full bg-osu animate-pulse" />
                                        <span className="text-osu text-xs font-bold uppercase tracking-wider">Upcoming Contest</span>
                                    </div>
                                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                        Weekly Code Sprint #452
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-6">
                                        Get ready to solve 4 algorithmic challenges in 90 minutes.<br />
                                        Top performers win exclusive swag and badges.
                                    </p>
                                    <CountdownTimer />
                                </div>
                                <div className="shrink-0">
                                    <a
                                        href="/contests"
                                        className="inline-block border border-white/30 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/5 transition-all text-sm"
                                    >
                                        Register Now
                                    </a>
                                </div>
                            </div>
                        </FeatureCard>
                    </div>

                    {/* Ready to Start Coding CTA */}
                    <div className="mt-16 mb-6 text-center">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Ready to start coding?
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto mb-8">
                            Join thousands of developers solving problems today. Whether you are a beginner or a pro, we have a place for you.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="/auth"
                                className="bg-osu hover:bg-osu-light text-white font-semibold px-8 py-3 rounded-lg transition-all hover:shadow-lg hover:shadow-osu/30"
                            >
                                Create Free Account
                            </a>
                            <a
                                href="/problemset"
                                className="border border-white/30 text-white font-medium px-8 py-3 rounded-lg hover:bg-white/5 transition-all"
                            >
                                Explore Problems
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
