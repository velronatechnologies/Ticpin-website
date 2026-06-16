'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";
import { FileText, RefreshCw, ChevronLeft } from "lucide-react";

interface Message {
    id: string;
    message: string;
    sender: string;
    createdAt: string;
    fileUrl?: string;
    fileType?: string;
}

interface ChatSupportReplyClientProps {
    sessionId: string;
    supportType: string;
    userEmail: string;
    initialMessages: Message[];
    initialStatus: 'pending' | 'active' | 'closed';
    userId: string;
    adminEmail: string;
}

export default function ChatSupportReplyClient({
    sessionId,
    supportType,
    userEmail,
    initialMessages,
    initialStatus,
    userId,
    adminEmail
}: ChatSupportReplyClientProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages || []);
    const [inputMessage, setInputMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sessionStatus, setSessionStatus] = useState(initialStatus);
    const [accepting, setAccepting] = useState(false);
    const [ending, setEnding] = useState(false);
    const [lightboxImage, setLightboxImage] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(async () => {
            if (sessionId && sessionStatus !== 'closed') {
                try {
                    const messagesRes = await fetch(`/backend/api/chat/sessions/${sessionId}/messages`);
                    if (messagesRes.ok) {
                        const mData = await messagesRes.json();
                        setMessages(mData);
                    }
                } catch (error) {
                    console.error("Error polling messages:", error);
                }
            }
        }, 15000);

        return () => clearInterval(interval);
    }, [sessionId, sessionStatus]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || !sessionId || sending) return;

        const optimisticMsg: Message = {
            id: Date.now().toString(),
            message: inputMessage,
            sender: "admin",
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMsg]);
        const currentMsg = inputMessage;
        setInputMessage("");

        setSending(true);
        try {
            const response = await fetch(`/backend/api/chat/sessions/${sessionId}/messages?admin=true`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    userId,
                    userEmail: adminEmail,
                    userType: "admin",
                    message: currentMsg,
                    sender: "admin",
                }),
            });

            if (!response.ok) {
                console.error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleAcceptTicket = async () => {
        if (!sessionId || accepting) return;
        setAccepting(true);
        try {
            const response = await fetch(`/backend/api/chat/sessions/${sessionId}/accept`, {
                method: 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                setSessionStatus('active');
                const messagesRes = await fetch(`/backend/api/chat/sessions/${sessionId}/messages`);
                if (messagesRes.ok) {
                    const mData = await messagesRes.json();
                    setMessages(mData);
                }
            }
        } catch (error) {
            console.error('Error accepting ticket:', error);
        } finally {
            setAccepting(false);
        }
    };

    const handleEndChat = async () => {
        if (!sessionId || ending) return;
        setEnding(true);
        try {
            const response = await fetch(`/backend/api/chat/sessions/${sessionId}/end`, {
                method: 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                setSessionStatus('closed');
                const messagesRes = await fetch(`/backend/api/chat/sessions/${sessionId}/messages`);
                if (messagesRes.ok) {
                    const mData = await messagesRes.json();
                    setMessages(mData);
                }
            }
        } catch (error) {
            console.error('Error ending chat:', error);
        } finally {
            setEnding(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="w-full h-screen bg-white relative overflow-hidden font-[family-name:var(--font-anek-latin)] flex flex-col">
            <header className="w-full h-[75px] bg-white border-b border-[#D9D9D9] flex items-center justify-between px-4 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <Link href="/admin/chat-sessions" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <ChevronLeft size={24} className="text-black" />
                    </Link>
                    <div>
                        <h1 className="text-[18px] font-bold text-black uppercase tracking-tight">{supportType}</h1>
                        <p className="text-[11px] text-[#686868] font-bold uppercase">User: {userEmail}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        sessionStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        sessionStatus === 'active' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                    }`}>
                        {sessionStatus}
                    </span>
                    
                    {sessionStatus === 'pending' && (
                        <button
                            onClick={handleAcceptTicket}
                            disabled={accepting}
                            className="px-6 py-2 bg-[#5331EA] text-white rounded-full text-[12px] font-bold uppercase hover:bg-[#4529c9] transition-all active:scale-95 disabled:opacity-50"
                        >
                            {accepting ? 'Accepting...' : 'Accept Ticket'}
                        </button>
                    )}
                    
                    {sessionStatus === 'active' && (
                        <button
                            onClick={handleEndChat}
                            disabled={ending}
                            className="px-6 py-2 bg-red-500 text-white rounded-full text-[12px] font-bold uppercase hover:bg-red-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {ending ? 'Ending...' : 'End Chat'}
                        </button>
                    )}
                    
                    <div className="relative w-[120px] h-[30px]">
                        <Image src="/ticpin-logo-black.png" alt="TICPIN" fill className="object-contain" />
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-hidden flex flex-col pt-4">
                <div className="flex-1 max-w-[1440px] mx-auto w-full p-4 flex flex-col">
                    <h1 className="text-[34px] font-bold leading-[37px] text-black mb-1 uppercase tracking-tight">
                        Support Terminal
                    </h1>
                    <p className="text-[18px] font-bold text-[#5331EA] mb-6 uppercase tracking-widest">
                        {supportType} RE: {sessionId}
                    </p>

                    <div className="flex-1 bg-[#F8F8F8] border border-zinc-200 rounded-[40px] p-8 flex flex-col overflow-hidden shadow-inner">
                        <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-2 custom-scrollbar">
                            {messages.map((msg, idx) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2`}
                                    style={{ animationDelay: `${idx * 20}ms` }}
                                >
                                    {msg.sender === "admin" && (
                                        <div className="w-[44px] h-[44px] bg-[#5331EA]/10 border border-[#5331EA]/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                            <Image src="/admin panel/chatSupport/Ellipse 29.svg" alt="" width={44} height={44} className="rounded-full" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${msg.sender === "user"
                                                ? "bg-[#5331EA] text-white rounded-tr-none"
                                                : "bg-white text-zinc-800 rounded-tl-none border border-zinc-100"
                                            }`}
                                    >
                                        <p className="text-[15px] font-medium leading-relaxed">{msg.message}</p>
                                        
                                        {msg.fileUrl && (
                                            <div className="mt-3">
                                                {msg.fileType === 'image' ? (
                                                    <div className="relative group cursor-pointer overflow-hidden rounded-xl border-2 border-white/20 shadow-lg bg-zinc-900 flex items-center justify-center min-h-[180px] w-full max-w-[320px]"
                                                         onClick={() => setLightboxImage(msg.fileUrl?.startsWith('blob:') ? msg.fileUrl : msg.fileUrl?.startsWith('http') ? msg.fileUrl : `/backend${msg.fileUrl}`)}>
                                                        <img 
                                                            src={msg.fileUrl?.startsWith('blob:') ? msg.fileUrl : msg.fileUrl?.startsWith('http') ? msg.fileUrl : `/backend${msg.fileUrl}`} 
                                                            alt="Attachment" 
                                                            className="max-w-full max-h-[250px] object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
                                                                Maximize
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-xl p-4 cursor-pointer hover:bg-zinc-100 transition-all shadow-sm max-w-[280px]"
                                                         onClick={() => window.open(msg.fileUrl?.startsWith('blob:') ? msg.fileUrl : msg.fileUrl?.startsWith('http') ? msg.fileUrl : `/backend${msg.fileUrl}`, '_blank')}>
                                                        <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center flex-shrink-0 text-white shadow-md">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <span className="text-[12px] font-bold block truncate uppercase text-zinc-600">Document</span>
                                                            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-tighter">Click to open PDF</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <p className={`text-[9px] mt-2 font-bold uppercase opacity-50 ${msg.sender === "user" ? "text-white text-right" : "text-zinc-400"}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {sessionStatus === 'active' ? (
                            <div className="flex items-center gap-4 bg-white p-3 rounded-[32px] border border-zinc-200 shadow-sm">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="TYPE YOUR RESPONSE HERE..."
                                    className="flex-1 h-[52px] px-6 text-[15px] font-bold text-zinc-800 placeholder-[#5331EA]/30 outline-none"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={sending || !inputMessage.trim()}
                                    className="w-[52px] h-[52px] bg-[#5331EA] rounded-full flex items-center justify-center transition-all hover:bg-[#4529c9] hover:shadow-lg active:scale-90 disabled:opacity-30 disabled:grayscale"
                                >
                                    <Image src="/admin panel/chatSupport/send-icon.svg" alt="Send" width={24} height={24} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-6 bg-zinc-100 rounded-2xl border-2 border-dashed border-zinc-200">
                                <p className="text-[14px] font-bold text-zinc-400 uppercase tracking-widest">
                                    {sessionStatus === 'pending' 
                                        ? 'TICKET PENDING AUTHORIZATION' 
                                        : 'SYSTEM: THIS COMMUNICATION CHANNEL IS CLOSED'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {lightboxImage && (
                <div className="fixed inset-0 bg-black/98 z-[200] flex items-center justify-center animate-in fade-in duration-300"
                     onClick={() => setLightboxImage(null)}>
                    <img 
                        src={lightboxImage} 
                        alt="Full size" 
                        className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl animate-in zoom-in-95 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}

const customScrollbarStyle = `
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #E5E0FC;
        border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #5331EA;
    }
`;
