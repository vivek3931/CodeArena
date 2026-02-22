import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, ChevronsLeft, ChevronsRight, ArrowUpDown, Hash, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
    'All', 'Arrays', 'Strings', 'Dynamic Programming', 'Stacks', 'Graphs', 'Trees',
    'Linked List', 'Binary Search', 'Backtracking', 'Greedy', 'Math',
    'Bit Manipulation', 'Sorting', 'Two Pointers', 'Sliding Window',
    'Heap', 'Trie', 'Design',
];

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const ProblemsetPage = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [difficultyFilter, setDifficultyFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState('problemNumber');
    const [order, setOrder] = useState('asc');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [showDiffDropdown, setShowDiffDropdown] = useState(false);
    const [limit] = useState(20);
    const navigate = useNavigate();

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on search
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch problems
    const fetchProblems = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                isMock: 'true',
                page: page.toString(),
                limit: limit.toString(),
                sortBy,
                order,
            });
            if (categoryFilter !== 'All') params.set('category', categoryFilter);
            if (difficultyFilter !== 'All') params.set('difficulty', difficultyFilter);
            if (debouncedSearch) params.set('search', debouncedSearch);

            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/problems?${params}`);
            if (res.ok) {
                const data = await res.json();
                setProblems(data.problems || []);
                setTotalCount(data.totalCount || 0);
                setTotalPages(data.totalPages || 1);
            }
        } catch (error) {
            console.error('Failed to fetch problems', error);
        } finally {
            setLoading(false);
        }
    }, [page, limit, sortBy, order, categoryFilter, difficultyFilter, debouncedSearch]);

    useEffect(() => {
        fetchProblems();
    }, [fetchProblems]);

    // Reset page when filters change
    useEffect(() => { setPage(1); }, [categoryFilter, difficultyFilter]);

    // Sort handler
    const handleSort = (col) => {
        if (sortBy === col) {
            setOrder(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(col);
            setOrder('asc');
        }
        setPage(1);
    };

    const categories = ['All', ...Array.from(new Set(problems.map(p => p.category))).sort()];
    const SortIcon = ({ col }) => {
        if (sortBy !== col) return <ArrowUpDown size={13} className="ml-1 opacity-30" />;
        return order === 'asc'
            ? <ChevronUp size={13} className="ml-1 text-[var(--color-primary)]" />
            : <ChevronDown size={13} className="ml-1 text-[var(--color-primary)]" />;
    };


    // Seed button
    const handleSeedData = async () => {
        setLoading(true);
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/problems/seed`, { method: 'POST' });
            window.location.reload();
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };


    // Difficulty color
    const diffColor = (d) => d === 'Easy' ? 'text-emerald-400' : d === 'Medium' ? 'text-amber-400' : 'text-red-400';
    const diffBg = (d) => d === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/30' : d === 'Medium' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30';

    // Page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(totalPages, page + 2);
        for (let i = start; i <= end; i++) pages.push(i);
        return pages;
    };

    return (

        <div className="flex-1 overflow-y-auto w-full mx-auto bg-black p-4 md:p-8 custom-scrollbar text-sm min-h-screen">
            <div className="max-w-6xl mx-auto flex flex-col gap-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Practice Arena</h1>
                        <p className="text-gray-400 text-base">
                            Master algorithms and data structures with our curated problemset.
                            {totalCount > 0 && (
                                <span className="ml-2 text-[var(--color-primary)] font-bold">{totalCount} Problems</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col gap-4 bg-black/90 p-4 rounded-xl border border-osu/40 shadow-2xl shadow-osu/10 hover:shadow-osu/20 transition-all duration-300">
                    {/* Category Tabs */}
                    <div className="flex gap-2 w-full overflow-x-auto no-scrollbar pb-1 flex-wrap">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${categoryFilter === cat
                                    ? 'bg-[var(--color-primary)]/20 border border-[var(--color-primary)] text-[var(--color-primary)]'
                                    : 'bg-[#120a06] border border-[#2d1e16] text-gray-400 hover:text-white hover:border-gray-500'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Search + Difficulty Filter */}
                    <div className="flex flex-col md:flex-row items-center gap-3">
                        <div className="relative w-full md:flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search problems by title..."
                                className="w-full bg-[#120a06] border border-[#2d1e16] text-white text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)] transition-colors"
                            />
                        </div>

                        {/* Difficulty dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowDiffDropdown(!showDiffDropdown)}
                                className="flex items-center gap-2 px-4 py-2.5 bg-[#120a06] border border-[#2d1e16] text-gray-300 text-sm rounded-lg hover:border-gray-500 transition-colors min-w-[140px]"
                            >
                                <SlidersHorizontal size={14} />
                                <span>{difficultyFilter === 'All' ? 'Difficulty' : difficultyFilter}</span>
                                <ChevronDown size={14} className="ml-auto" />
                            </button>
                            {showDiffDropdown && (
                                <div className="absolute right-0 top-full mt-1 bg-[#1a1310] border border-[#2d1e16] rounded-lg shadow-xl z-50 overflow-hidden min-w-[140px]">
                                    {DIFFICULTIES.map(d => (
                                        <button
                                            key={d}
                                            onClick={() => { setDifficultyFilter(d); setShowDiffDropdown(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[#2d1e16] ${difficultyFilter === d ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' : d === 'All' ? 'text-gray-300' : diffColor(d)
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Problem Table */}
                <div className="bg-black/90 border border-osu/40 rounded-xl overflow-x-auto shadow-2xl shadow-osu/10 hover:shadow-osu/20 transition-all duration-300">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="text-xs text-gray-500 uppercase tracking-widest border-b border-[#2d1e16] bg-[#120a06]">
                            <tr>
                                <th className="px-4 py-3.5 font-bold w-12 text-center">Status</th>
                                <th
                                    className="px-4 py-3.5 font-bold w-16 cursor-pointer select-none hover:text-gray-300 transition-colors"
                                    onClick={() => handleSort('problemNumber')}
                                >
                                    <div className="flex items-center">
                                        # <SortIcon col="problemNumber" />
                                    </div>
                                </th>
                                <th
                                    className="px-4 py-3.5 font-bold cursor-pointer select-none hover:text-gray-300 transition-colors"
                                    onClick={() => handleSort('title')}
                                >
                                    <div className="flex items-center">
                                        Title <SortIcon col="title" />
                                    </div>
                                </th>
                                <th className="px-4 py-3.5 font-bold hidden md:table-cell">Category</th>
                                <th
                                    className="px-4 py-3.5 font-bold cursor-pointer select-none hover:text-gray-300 transition-colors"
                                    onClick={() => handleSort('difficulty')}
                                >
                                    <div className="flex items-center">
                                        Difficulty <SortIcon col="difficulty" />
                                    </div>
                                </th>
                                <th className="px-4 py-3.5 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2d1e16] text-sm">
                            {loading ? (
                                [...Array(10)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-3.5 text-center"><div className="w-5 h-5 rounded bg-[#2d1e16] mx-auto" /></td>
                                        <td className="px-4 py-3.5"><div className="w-8 h-4 bg-[#2d1e16] rounded" /></td>
                                        <td className="px-4 py-3.5"><div className="w-48 h-4 bg-[#2d1e16] rounded" /></td>
                                        <td className="px-4 py-3.5 hidden md:table-cell"><div className="w-20 h-4 bg-[#2d1e16] rounded-full" /></td>
                                        <td className="px-4 py-3.5"><div className="w-14 h-4 bg-[#2d1e16] rounded" /></td>
                                        <td className="px-4 py-3.5 text-right"><div className="w-16 h-7 bg-[#2d1e16] rounded-lg ml-auto" /></td>
                                    </tr>
                                ))
                            ) : problems.length > 0 ? (
                                problems.map((problem) => (
                                    <tr
                                        key={problem._id}
                                        className="hover:bg-[#1f1510] transition-colors group cursor-pointer"
                                        onClick={() => navigate(`/workspace/practice/${problem._id}`)}
                                    >
                                        <td className="px-4 py-3.5 text-center">
                                            <div className="w-5 h-5 rounded border border-[#2d1e16] mx-auto group-hover:border-[var(--color-primary)]/50 transition-colors flex items-center justify-center" />
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-500 font-mono text-xs">
                                            {problem.problemNumber || '-'}
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-white group-hover:text-[var(--color-primary)] transition-colors">
                                            {problem.title}
                                        </td>
                                        <td className="px-4 py-3.5 hidden md:table-cell">
                                            <div className="flex flex-wrap gap-1">
                                                {(problem.tags && problem.tags.length > 0 ? problem.tags.slice(0, 2) : [problem.category]).map((tag, i) => (
                                                    <span key={i} className="bg-[#2d1e16] text-gray-300 text-[10px] px-2 py-0.5 rounded-full">{tag}</span>
                                                ))}
                                                {problem.tags && problem.tags.length > 2 && (
                                                    <span className="text-gray-500 text-[10px] px-1">+{problem.tags.length - 2}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`font-bold text-xs px-2 py-1 rounded border ${diffBg(problem.difficulty)} ${diffColor(problem.difficulty)}`}>
                                                {problem.difficulty}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <button className="text-[var(--color-primary)] hover:text-white font-bold p-1.5 hover:bg-[var(--color-primary)] rounded-lg transition-all flex items-center gap-1 ml-auto text-xs">
                                                Solve <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="p-10 text-center text-gray-500 italic">
                                        No problems found. Try changing filters or search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between bg-black/90 border border-osu/40 rounded-xl px-4 py-3 shadow-2xl shadow-osu/10 hover:shadow-osu/20 transition-all duration-300">
                        <span className="text-gray-500 text-xs">
                            Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, totalCount)} of {totalCount}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2d1e16] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2d1e16] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            {getPageNumbers().map(pNum => (
                                <button
                                    key={pNum}
                                    onClick={() => setPage(pNum)}
                                    className={`min-w-[32px] h-8 rounded-lg text-xs font-bold transition-all ${pNum === page
                                        ? 'bg-[var(--color-primary)] text-white shadow-[0_0_10px_rgba(246,107,21,0.3)]'
                                        : 'text-gray-400 hover:text-white hover:bg-[#2d1e16]'
                                        }`}
                                >
                                    {pNum}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2d1e16] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                            <button
                                onClick={() => setPage(totalPages)}
                                disabled={page === totalPages}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#2d1e16] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronsRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ProblemsetPage;
