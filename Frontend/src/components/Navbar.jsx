import React, { useState, useEffect } from 'react';
import { User, Bot, Swords, Menu, X, LayoutDashboard, Target, Trophy, Network, UploadCloud, Mic } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();
    const isHome = location.pathname === '/';
    const [scrolled, setScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const baseLinks = [
        { name: 'Home', path: '/', icon: LayoutDashboard },
        { name: 'Contests', path: '/contests', icon: Swords },
        { name: 'AI Interview', path: '/mock-interview', icon: Mic },
        { name: 'Problemset', path: '/problemset', icon: Target },
        { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    ];

    let navLinks = user?.preference === 'company'
        ? [...baseLinks, { name: 'Host Contest', path: '/company/dashboard', icon: Network }]
        : baseLinks;

    if (user?.role === 'superadmin') {
        // Superadmin gets upload practice option
        navLinks = [...navLinks, { name: 'Upload Practice', path: '/superadmin', icon: UploadCloud }];
    }

    return (

        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isHome
                ? (scrolled ? 'bg-black' : 'bg-transparent')
                : 'bg-black'
                }`}
        >
            <div className="max-w-screen-2xl mx-auto px-6 lg:px-12 flex items-center justify-between h-16">
                <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img src="/code-arena_logo.png" alt="logo png" width={180} height={180} />
                </Link>

                <div className="hidden md:flex flex-1 justify-center items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${location.pathname === link.path
                                ? 'text-osu'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <link.icon size={16} />
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-3 md:gap-4 ml-auto">
                    <Link
                        to="/ai-roadmap"
                        className="w-8 h-8 md:w-auto md:h-auto flex items-center justify-center gap-1.5 md:px-3 md:py-1.5 rounded-full md:rounded-lg bg-gradient-to-r from-[var(--color-primary)]/10 to-orange-500/10 border border-[var(--color-primary)]/30 hover:border-[var(--color-primary)] text-[var(--color-primary)] hover:text-white transition-all text-xs font-bold shadow-[0_0_10px_rgba(220,68,5,0.15)] hover:shadow-[0_0_15px_rgba(220,68,5,0.3)]"
                    >
                        <Bot size={14} />
                        <span className="hidden md:inline">AI Roadmap</span>
                    </Link>

                    <div className="hidden md:flex flex-1 justify-center items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`flex items-center gap-2 text-sm font-semibold transition-all duration-300 ${location.pathname === link.path
                                    ? 'text-osu'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <link.icon size={16} />
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 ml-auto">
                        <Link
                            to="/ai-roadmap"
                            className="flex items-center justify-center gap-1.5 w-8 h-8 md:w-auto md:h-auto md:px-3 md:py-1.5 rounded-full md:rounded-lg bg-gradient-to-r from-[var(--color-primary)]/10 to-orange-500/10 border border-[var(--color-primary)]/30 hover:border-[var(--color-primary)] text-[var(--color-primary)] hover:text-white transition-all text-xs font-bold shadow-[0_0_10px_rgba(220,68,5,0.15)] hover:shadow-[0_0_15px_rgba(220,68,5,0.3)]"
                        >
                            <Bot size={14} />
                            <span className="hidden md:inline">AI Roadmap</span>
                        </Link>
                        {localStorage.getItem('token') ? (
                            <>
                                <Link
                                    to="/profile"
                                    className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center overflow-hidden border border-osu/30 hover:border-osu transition-colors shadow-[0_0_10px_rgba(220,68,5,0.2)]"
                                >
                                    <User size={16} className="text-gray-300" />
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/auth"
                                className="hidden sm:block text-sm text-gray-300 hover:text-white transition-colors"
                            >
                                Log In
                            </Link>
                        )}

                        {/* Mobile Menu Toggle Button */}
                        <button
                            className="md:hidden text-gray-300 hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>

                        {/* Desktop SignUp Button */}
                        {!localStorage.getItem('token') && (
                            <Link
                                to="/auth"
                                className="hidden md:block bg-osu hover:bg-osu-light text-white text-sm font-medium px-4 py-2 rounded-lg transition-all duration-300 shadow-[0_0_15px_rgba(220,68,5,0.3)]"
                            >
                                Sign Up
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Menu Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[40]"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Slide-out Menu (Right Side) */}
            <div
                className={`md:hidden fixed top-0 right-0 h-screen w-[280px] bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-osu/20 z-[50] shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full p-6">
                    {/* Menu Header with Close Button */}
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                        <span className="font-bold text-lg text-white">Menu</span>
                        <button
                            className="text-gray-300 hover:text-white transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X size={26} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-6 flex-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 text-lg font-semibold transition-all duration-300 ${location.pathname === link.path
                                    ? 'text-osu translate-x-2'
                                    : 'text-gray-400 hover:text-white hover:translate-x-2'
                                    }`}
                            >
                                <link.icon size={18} />
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Auth / Profile Footer inside Mobile Menu */}
                    <div className="pt-6 border-t border-white/10 mt-auto">
                        {localStorage.getItem('token') ? (
                            <Link
                                to="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-4 text-gray-300 hover:text-white font-medium group"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1a1a1a] to-[#2a2a2a] flex items-center justify-center border border-osu/30 group-hover:border-osu transition-colors">
                                    <User size={20} className="text-gray-300" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-bold">My Profile</span>
                                    <span className="text-xs text-gray-500">View performance</span>
                                </div>
                            </Link>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/auth"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="text-gray-300 hover:text-white font-medium py-2 text-center border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/auth"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="bg-osu hover:bg-osu-light text-white font-medium px-4 py-3 rounded-lg text-center shadow-[0_0_15px_rgba(220,68,5,0.3)] transition-colors"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
