import { useState, useEffect, useRef } from 'react';
import { MessageSquare, ChevronRight, Send } from 'lucide-react';

const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function SessionChat({ messages, onSend, currentUserId, onClose }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Session Chat</h3>
            <p className="text-[10px] text-white/30 uppercase font-bold tracking-tight">Real-time</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-white/30" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
        {messages.length === 0 ? (
          <p className="text-white/20 text-xs text-center mt-8">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="flex items-center gap-2 my-2">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-[10px] text-white/25 whitespace-nowrap">{msg.message}</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>
              );
            }
            if (msg.userId === currentUserId) {
              return (
                <div key={msg.id} className="flex flex-col items-end">
                  <div className="px-3 py-2 rounded-2xl text-xs text-white/80 max-w-[80%] bg-indigo-500/20 border border-indigo-500/30">
                    {msg.message}
                  </div>
                  <span className="text-[9px] text-white/20 mt-1">{formatTime(msg.timestamp)}</span>
                </div>
              );
            }
            return (
              <div key={msg.id} className="flex flex-col items-start">
                <span className="text-[10px] text-indigo-400 mb-1 ml-1">{msg.userName}</span>
                <div className="px-3 py-2 rounded-2xl text-xs text-white/80 max-w-[80%] bg-white/[0.03] border border-white/5">
                  {msg.message}
                </div>
                <span className="text-[9px] text-white/20 mt-1">{formatTime(msg.timestamp)}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="pt-3 border-t border-white/5">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/40 w-full transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-500 w-8 h-8 rounded-xl flex items-center justify-center hover:bg-indigo-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
