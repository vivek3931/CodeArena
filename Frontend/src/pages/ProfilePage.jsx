import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileSidebar from '../components/ProfileSidebar';
import ProfileMiddleContent from '../components/ProfileMiddleContent';
import ProfileRightSidebar from '../components/ProfileRightSidebar';

const ProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [userStats, setUserStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auth');
                return;
            }

            try {
                const [resProfile, resStats] = await Promise.all([
                    fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch(`${import.meta.env.VITE_API_URL}/api/user/profile/stats`, { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                if (resProfile.ok && resStats.ok) {
                    const dataProfile = await resProfile.json();
                    const dataStats = await resStats.json();
                    setUserData(dataProfile);
                    setUserStats(dataStats);
                } else {
                    // Token might be expired
                    localStorage.removeItem('token');
                    navigate('/auth');
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto p-6 flex flex-col md:flex-row gap-6 custom-scrollbar">
                {/* Left Sidebar Skeleton */}
                <div className="w-full md:w-80 flex flex-col gap-6 flex-shrink-0 animate-pulse">
                    <div className="bg-[#1a1310] border border-[#2d1e16] rounded-xl p-6 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-[#2d1e16] mb-4"></div>
                        <div className="w-32 h-6 bg-[#2d1e16] rounded mb-2"></div>
                        <div className="w-24 h-4 bg-[#2d1e16] rounded mb-6"></div>
                        <div className="w-full flex justify-between px-4 border-t border-[#2d1e16] pt-4">
                            <div className="w-12 h-10 bg-[#2d1e16] rounded"></div>
                            <div className="w-12 h-10 bg-[#2d1e16] rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Main Content Skeleton (Middle + Right) */}
                <div className="flex-1 flex flex-col lg:flex-row gap-6 animate-pulse">
                    {/* Middle Content Skeleton */}
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="bg-[#1a1310] border border-[#2d1e16] rounded-xl p-6 h-64"></div>
                        <div className="bg-[#1a1310] border border-[#2d1e16] rounded-xl p-6 h-80"></div>
                    </div>

                    {/* Right Sidebar Skeleton */}
                    <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
                        <div className="bg-[#1a1310] border border-[#2d1e16] rounded-xl p-6 h-48"></div>
                        <div className="bg-[#1a1310] border border-[#2d1e16] rounded-xl p-6 flex-1 min-h-[300px]"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!userData || !userStats) return null;

    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full max-w-8xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 custom-scrollbar text-sm">

            {/* Left Sidebar */}
            <div className="w-full md:w-80 flex flex-col gap-6 flex-shrink-0">
                <ProfileSidebar user={userData} onProfileUpdate={(updated) => setUserData(updated)} />
            </div>

            {/* Main Content (Middle + Right) */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-w-0">

                {/* Middle Content */}
                <div className="flex-1 flex flex-col gap-6 min-w-0">
                    <ProfileMiddleContent user={userData} stats={userStats} />
                </div>

                {/* Right Sidebar */}
                <div className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
                    <ProfileRightSidebar stats={userStats} />
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
