'use client';

import React, { useState } from 'react';
import { Send, User, Check } from 'lucide-react';

const mockTickets = [
  { id: 't-1', userName: 'Ramji B', email: 'ramjib929@gmail.com', subject: 'Refund delay', messages: [{ sender: 'user', text: 'My play slot booking got cancelled but I have not received the refund yet.' }], active: true },
  { id: 't-2', userName: 'John Doe', email: 'john@example.com', subject: 'Voucher inquiry', messages: [{ sender: 'user', text: 'How do I renew my Silver Pass?' }], active: true },
];

export default function SupportTicketsPanel() {
  const [tickets, setTickets] = useState(mockTickets);
  const [activeTicket, setActiveTicket] = useState<any>(tickets[0]);
  const [reply, setReply] = useState('');

  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;

    const updatedMessages = [...activeTicket.messages, { sender: 'admin', text: reply }];
    const updatedTicket = { ...activeTicket, messages: updatedMessages };

    setTickets(prev => prev.map(t => t.id === activeTicket.id ? updatedTicket : t));
    setActiveTicket(updatedTicket);
    setReply('');
  };

  const resolveTicket = (id: string) => {
    setTickets(prev => prev.filter(t => t.id !== id));
    setActiveTicket(tickets.find(t => t.id !== id) || null);
    alert('Ticket resolved and closed.');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 border border-zinc-200 bg-white rounded-2xl overflow-hidden shadow-sm h-[600px] animate-fade-in">
      {/* Sidebar List */}
      <div className="border-r border-zinc-100 divide-y divide-zinc-100 flex flex-col h-full bg-zinc-50/50">
        <div className="p-4 border-b border-zinc-100 bg-white">
          <h2 className="font-bold text-zinc-950">Support Inbox</h2>
          <p className="text-zinc-500 text-xs mt-0.5">Manage live user chat sessions</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tickets.length === 0 ? (
            <p className="p-4 text-center text-xs text-zinc-400">No active support tickets.</p>
          ) : (
            tickets.map(t => (
              <button 
                key={t.id}
                onClick={() => setActiveTicket(t)}
                className={`w-full p-4 text-left hover:bg-white transition-colors flex flex-col gap-1 ${
                  activeTicket && activeTicket.id === t.id ? 'bg-white border-l-2 border-indigo-600' : ''
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-900 text-sm">{t.userName}</span>
                  <span className="text-[10px] text-zinc-400">Active</span>
                </div>
                <p className="text-xs text-zinc-700 font-semibold">{t.subject}</p>
                <p className="text-xs text-zinc-400 truncate">{t.messages[t.messages.length - 1].text}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Container */}
      {activeTicket ? (
        <div className="lg:col-span-2 flex flex-col h-full bg-white">
          <div className="p-4 border-b border-zinc-100 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-zinc-900">{activeTicket.userName}</h3>
              <p className="text-xs text-zinc-400">{activeTicket.email} • {activeTicket.subject}</p>
            </div>
            <button 
              onClick={() => resolveTicket(activeTicket.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" /> Resolve Ticket
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-50/30">
            {activeTicket.messages.map((m: any, idx: number) => (
              <div key={idx} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${
                  m.sender === 'admin' ? 'bg-zinc-900 text-white rounded-tr-none' : 'bg-white border border-zinc-100 text-zinc-800 rounded-tl-none shadow-sm'
                }`}>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={sendReply} className="p-4 border-t border-zinc-100 flex gap-2">
            <input 
              type="text" 
              placeholder="Type your response to the user..."
              value={reply}
              onChange={e => setReply(e.target.value)}
              className="flex-1 px-3 py-2 border border-zinc-200 rounded-xl text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="p-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="lg:col-span-2 flex items-center justify-center text-zinc-400">
          <p className="text-sm">Select an active ticket from the inbox to start replying.</p>
        </div>
      )}
    </div>
  );
}
