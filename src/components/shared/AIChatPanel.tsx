'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, MessageSquare, Loader2 } from 'lucide-react';
import { aiApi } from '@/lib/api';

interface AIChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    venueData: any;
    venueType: 'dining' | 'event' | 'play';
}

export default function AIChatPanel({ isOpen, onClose, venueData, venueType }: AIChatPanelProps) {
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const hasAutoSent = useRef(false);

    const defaultQuestions = {
        dining: [
            "What's on the menu?",
            "What are the opening hours?",
            "Is there a dress code?",
            "Do they have vegetarian options?",
            "What's the best dish here?"
        ],
        event: [
            "What time does the event start?",
            "Are there age restrictions?",
            "What's the cancellation policy?",
            "Is parking available?",
            "Can I bring outside food?"
        ],
        play: [
            "What sports are available?",
            "Do they provide equipment?",
            "Is there a locker room?",
            "Can I book multiple hours?",
            "What's the surface type?"
        ]
    };

    const handleSend = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const updatedMessages = [...messages, { role: 'user' as const, content: text }];
        setMessages([...updatedMessages, { role: 'assistant', content: '' }]);
        setInput('');
        setIsLoading(true);

        // Thinking delay: 2–3 seconds before responding
        const thinkingDelay = 2000 + Math.random() * 1000;
        await new Promise(r => setTimeout(r, thinkingDelay));

        try {
            let displayedContent = '';
            const charQueue: string[] = [];
            let isTyping = false;

            const processQueue = async () => {
                if (isTyping || charQueue.length === 0) return;
                isTyping = true;

                while (charQueue.length > 0) {
                    displayedContent += charQueue.shift();
                    setMessages(prev => {
                        const next = [...prev];
                        next[next.length - 1] = { role: 'assistant', content: displayedContent };
                        return next;
                    });
                    await new Promise(r => setTimeout(r, 20));
                }
                isTyping = false;
            };

            await aiApi.chatStream(updatedMessages, venueData, (chunk) => {
                charQueue.push(...chunk.split(''));
                processQueue();
            });

            while (charQueue.length > 0) {
                await processQueue();
                await new Promise(r => setTimeout(r, 50));
            }
        } catch (error) {
            console.error('Streaming error:', error);
            setMessages(prev => {
                const next = [...prev];
                next[next.length - 1] = { role: 'assistant', content: "An error occurred. Please try again." };
                return next;
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-send first question for dining
    useEffect(() => {
        if (isOpen && venueType === 'dining' && messages.length === 0 && !hasAutoSent.current) {
            hasAutoSent.current = true;
            // Short delay for better UX
            setTimeout(() => {
                handleSend("What's the best dish here?");
            }, 800);
        }
    }, [isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] md:bottom-8 md:right-8 p-0">
            <div className="w-[420px] md:w-[500px] h-[650px] bg-white rounded-[28px] shadow-2xl flex flex-col overflow-hidden border border-purple-100 animate-in zoom-in-95 duration-300 backdrop-blur-sm">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-[#5331EA] to-[#866BFF] text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <Sparkles size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-[18px] leading-tight tracking-tight text-white">Ticpin Concierge</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm shadow-green-400/50"></div>
                                <p className="text-[11px] text-purple-100 font-bold uppercase tracking-widest opacity-90">AI Agent Active</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setMessages([]);
                            hasAutoSent.current = false;
                            onClose();
                        }}
                        className="w-11 h-11 flex items-center justify-center hover:bg-white/10 rounded-2xl transition-all active:scale-95"
                    >
                        <X size={26} />
                    </button>
                </div>

                {/* Chat Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FCFAFF]">
                    {messages.length === 0 && !isLoading && (
                        <div className="text-center py-24 px-6 space-y-5">
                            <div className="w-16 h-16 bg-[#f0ecff] rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-[#c4b5fd]">
                                <MessageSquare className="text-[#5331EA]" size={32} />
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-lg font-bold text-zinc-900 leading-tight">Ask about {venueData.name}</h4>
                                <p className="text-[13px] text-zinc-500 font-medium max-w-[280px] mx-auto">Get instant answers about menu, hours, facilities, and more.</p>
                            </div>
                        </div>
                    )}

                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm font-medium ${msg.role === 'user'
                                ? 'bg-[#5331EA] text-white rounded-br-none shadow-[#5331EA]/20'
                                : 'bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-bl-none shadow-zinc-100'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-[#f0ecff] border border-[#c4b5fd] p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 bg-[#5331EA] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-[#5331EA] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-[#5331EA] rounded-full animate-bounce"></div>
                                </div>
                                <span className="text-[12px] font-semibold text-[#5331EA] uppercase tracking-widest">Thinking...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom Section */}
                <div className="p-5 bg-white border-t border-purple-50 space-y-4">
                    {/* Quick question chips - always visible */}
                    {!isLoading && (
                        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                            {defaultQuestions[venueType].map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="whitespace-nowrap px-3.5 py-2 bg-[#f0ecff] border border-[#c4b5fd] rounded-full text-[12px] font-semibold text-[#5331EA] hover:bg-[#e4daff] hover:border-[#5331EA] transition-all shadow-sm hover:shadow-md"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
                        className="relative"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-5 pr-14 py-3 text-[14px] font-medium focus:bg-white focus:ring-2 focus:ring-[#5331EA]/20 focus:border-[#5331EA] transition-all outline-none text-zinc-900 placeholder:text-zinc-500"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-[#5331EA] text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center hover:bg-[#4020d0] hover:shadow-lg transition-all active:scale-95 shadow-md"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                    <p className="text-center text-[11px] text-zinc-500 font-medium uppercase tracking-widest opacity-70">
                        Powered by Groq AI
                    </p>
                </div>
            </div>
        </div>
    );
}
