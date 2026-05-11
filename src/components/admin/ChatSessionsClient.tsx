'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, MessageCircle, User } from "lucide-react";

interface ChatSession {
    id: string;
    sessionId: string;
    userName: string;
    userEmail: string;
    userType: string;
    category: string;
    status: string;
    lastMessage: string;
    createdAt: string;
    updatedAt: string;
    unreadCount?: number;
}

const categories = [
    { id: "dining", title: "Dining Support", icon: "/admin panel/chatSupport/dining-icon.svg" },
    { id: "event", title: "Event Support", icon: "/admin panel/chatSupport/guitar-icon.svg" },
    { id: "play", title: "Play Support", icon: "/admin panel/chatSupport/batmiton-icon.svg" },
];

const dateFilters = [
    { value: "all", label: "All Time" },
    { value: "yesterday", label: "Yesterday" },
    { value: "3days", label: "Last 3 Days" },
    { value: "week", label: "Last Week" },
    { value: "2weeks", label: "Last 2 Weeks" },
];

interface ChatSessionsClientProps {
    initialData: {
        sessions: ChatSession[];
        totalPages: number;
    };
    category: string;
    userType: "organizer" | "user" | null;
    dateFilter: string;
}

export default function ChatSessionsClient({ initialData, category: initialCategory, userType: initialUserType, dateFilter: initialDateFilter }: ChatSessionsClientProps) {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState(initialCategory || "dining");
    const [selectedUserType, setSelectedUserType] = useState<"organizer" | "user" | null>(initialUserType);
    const [selectedDateFilter, setSelectedDateFilter] = useState<string>(initialDateFilter || "all");
    const [sessions, setSessions] = useState<ChatSession[]>(initialData.sessions || []);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);

    useEffect(() => {
        if (selectedUserType) {
            fetchSessions(1);
            setPage(1);
        }
    }, [activeCategory, selectedUserType, selectedDateFilter]);

    const fetchSessions = async (pageNum: number = page) => {
        if (!selectedUserType) return;
        setLoading(true);
        try {
            const res = await fetch(`/backend/api/chat/sessions?category=${activeCategory}&userType=${selectedUserType}&dateFilter=${selectedDateFilter}&admin=true&limit=10&page=${pageNum}`);
            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions || []);
                setTotalPages(data.totalPages || 1);
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            fetchSessions(newPage);
        }
    };

    const handleSessionClick = (session: ChatSession) => {
        const categoryTitle = categories.find(c => c.id === session.category)?.title || "Support";
        router.push(`/admin/ChatSupportPage/reply?sessionId=${session.sessionId}&type=${encodeURIComponent(categoryTitle)}&admin=true&userEmail=${encodeURIComponent(session.userEmail)}`);
    };

    const handleAcceptTicket = async (e: React.MouseEvent, session: ChatSession) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/backend/api/chat/sessions/${session.sessionId}/accept`, {
                method: 'POST',
                credentials: 'include',
            });
            if (res.ok) {
                fetchSessions(page);
            }
        } catch (error) {
            console.error('Error accepting ticket:', error);
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (hours < 1) return "Just now";
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-[#F5F5F5] font-[family-name:var(--font-anek-latin)]">
            {/* Header */}
            <header className="w-full h-[75px] bg-white border-b border-[#D9D9D9] flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            if (selectedUserType) setSelectedUserType(null);
                            else router.push('/admin');
                        }} 
                        className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                    >
                        <ChevronLeft size={24} className="text-black" />
                    </button>
                    <h1 className="text-[20px] font-semibold text-black uppercase tracking-tight">
                        {selectedUserType ? `${selectedUserType} Chats` : "Chat Support"}
                    </h1>
                </div>
                <div className="relative w-[120px] h-[30px]">
                    <Image
                        src="/ticpin-logo-black.png"
                        alt="TICPIN"
                        fill
                        className="object-contain"
                    />
                </div>
            </header>

            {!selectedUserType ? (
                <div className="max-w-[1440px] mx-auto p-10 flex flex-col items-center">
                    <h2 className="text-[32px] font-bold text-black mb-12 uppercase tracking-tight">Select Chat Type</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full max-w-[800px]">
                        <div 
                            onClick={() => setSelectedUserType("organizer")}
                            className="bg-white rounded-[40px] p-10 border border-[#E5E5E5] flex flex-col items-center justify-center cursor-pointer hover:border-[#5331EA] hover:shadow-xl transition-all group animate-in fade-in slide-in-from-left-4 duration-500"
                        >
                            <div className="w-24 h-24 bg-[#FFD9B7]/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <User size={48} className="text-[#8B4D1A]" />
                            </div>
                            <h3 className="text-[24px] font-bold text-black uppercase">Organizer Chat</h3>
                            <p className="text-[#686868] text-center mt-2 uppercase font-medium text-xs">Manage tickets raised by event organizers</p>
                        </div>

                        <div 
                            onClick={() => setSelectedUserType("user")}
                            className="bg-white rounded-[40px] p-10 border border-[#E5E5E5] flex flex-col items-center justify-center cursor-pointer hover:border-[#5331EA] hover:shadow-xl transition-all group animate-in fade-in slide-in-from-right-4 duration-500"
                        >
                            <div className="w-24 h-24 bg-[#D1FAE5]/30 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <User size={48} className="text-[#065F46]" />
                            </div>
                            <h3 className="text-[24px] font-bold text-black uppercase">User Chat</h3>
                            <p className="text-[#686868] text-center mt-2 uppercase font-medium text-xs">Manage tickets raised by regular users</p>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Category Tabs */}
                    <div className="bg-white border-b border-[#E5E5E5]">
                        <div className="max-w-[1440px] mx-auto flex">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-4 border-b-2 transition-all ${
                                        activeCategory === cat.id
                                            ? "border-[#5331EA] text-[#5331EA] bg-[#5331EA]/5"
                                            : "border-transparent text-[#686868] hover:bg-[#F5F5F5]"
                                    }`}
                                >
                                    <Image src={cat.icon} alt={cat.title} width={24} height={24} />
                                    <span className="text-[14px] font-bold uppercase tracking-tight">{cat.title}</span>
                                    {sessions.filter(s => s.category === cat.id && (s.status === "active" || s.status === "pending")).length > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-[#5331EA] text-white text-[10px] rounded-full font-bold">
                                            {sessions.filter(s => s.category === cat.id && (s.status === "active" || s.status === "pending")).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Filter */}
                    <div className="bg-white border-b border-[#E5E5E5] px-4 py-3">
                        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-[12px] text-[#686868] font-bold uppercase tracking-widest">Filter:</span>
                                <select
                                    value={selectedDateFilter}
                                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                                    className="px-3 py-1 border border-[#E5E5E5] rounded-lg text-[12px] bg-white focus:outline-none focus:border-[#5331EA] font-bold uppercase"
                                >
                                    {dateFilters.map((filter) => (
                                        <option key={filter.value} value={filter.value}>
                                            {filter.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="text-[12px] text-zinc-400 font-bold uppercase tracking-widest">
                                {sessions.length} chats found
                            </div>
                        </div>
                    </div>

                    {/* Sessions List */}
                    <div className="max-w-[1440px] mx-auto p-4 pb-20">
                        {loading ? (
                            <div className="flex items-center justify-center h-[400px]">
                                <RefreshCw className="animate-spin text-[#5331EA]" size={32} />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[400px] text-center animate-in fade-in zoom-in-95">
                                <MessageCircle size={48} className="text-[#D9D9D9] mb-4" />
                                <p className="text-[18px] text-[#686868] font-bold uppercase">No active chats in this category</p>
                                <p className="text-[14px] text-[#999] mt-2 uppercase font-medium">When users send messages, they will appear here</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid gap-3">
                                    {sessions.map((session, idx) => (
                                        <div
                                            key={session.id}
                                            onClick={() => handleSessionClick(session)}
                                            className="bg-white rounded-[16px] p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all border border-[#E5E5E5] hover:border-[#5331EA]/30 animate-in fade-in slide-in-from-bottom-2 duration-300"
                                            style={{ animationDelay: `${idx * 50}ms` }}
                                        >
                                            {/* User Avatar */}
                                            <div className="w-[50px] h-[50px] bg-[#5331EA]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User size={24} className="text-[#5331EA]" />
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-[16px] font-bold text-black truncate uppercase">
                                                        {session.userName || session.userEmail.split("@")[0]}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 text-[9px] rounded-full font-bold uppercase tracking-tighter ${
                                                        session.userType === "organizer" 
                                                            ? "bg-[#FFD9B7] text-[#8B4D1A]" 
                                                            : "bg-[#D1FAE5] text-[#065F46]"
                                                    }`}>
                                                        {session.userType}
                                                    </span>
                                                    {session.status === "pending" && (
                                                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[9px] rounded-full font-bold uppercase tracking-tighter">
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[12px] text-[#686868] truncate font-medium uppercase">{session.userEmail}</p>
                                                <p className="text-[13px] text-[#999] mt-1 truncate italic">
                                                    {session.lastMessage || "No messages yet"}
                                                </p>
                                            </div>

                                            {/* Time & Unread */}
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-[11px] text-[#999] font-bold uppercase">{formatTime(session.updatedAt)}</p>
                                                {session.unreadCount && session.unreadCount > 0 && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#5331EA] text-white text-[10px] rounded-full font-bold">
                                                        {session.unreadCount}
                                                    </span>
                                                )}
                                                {session.status === "pending" && (
                                                    <button
                                                        onClick={(e) => handleAcceptTicket(e, session)}
                                                        className="mt-2 px-3 py-1 bg-[#5331EA] text-white text-[11px] rounded-full font-bold uppercase hover:bg-[#4529c9] transition-colors active:scale-95"
                                                    >
                                                        Accept
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-4 mt-8 pb-10">
                                        <button
                                            onClick={() => handlePageChange(page - 1)}
                                            disabled={page === 1}
                                            className="px-6 py-2 bg-white border border-[#E5E5E5] rounded-lg text-[13px] font-bold uppercase tracking-wider disabled:opacity-40 transition-all active:scale-95 shadow-sm"
                                        >
                                            Previous
                                        </button>
                                        <span className="text-[13px] text-[#686868] font-bold uppercase">
                                            {page} / {totalPages}
                                        </span>
                                        <button
                                            onClick={() => handlePageChange(page + 1)}
                                            disabled={page === totalPages}
                                            className="px-6 py-2 bg-white border border-[#E5E5E5] rounded-lg text-[13px] font-bold uppercase tracking-wider disabled:opacity-40 transition-all active:scale-95 shadow-sm"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

import { RefreshCw } from 'lucide-react';
