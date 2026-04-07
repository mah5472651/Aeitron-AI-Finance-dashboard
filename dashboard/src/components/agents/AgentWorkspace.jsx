import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Zap, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { sendAgentMessage, isConfigured, getActiveProvider } from '../../utils/aiClient';

export default function AgentWorkspace({ agent, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const Icon = agent.icon;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function callAgent(userMessages) {
    setLoading(true);
    setError(null);
    try {
      const apiMessages = userMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const reply = await sendAgentMessage(agent.systemPrompt, apiMessages);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    callAgent(next);
  }

  function handleTrigger() {
    if (loading) return;
    const triggerMsg = {
      role: 'user',
      content: `I need your help. Introduce yourself and tell me exactly what you can do for me right now. Then ask me what I need.`,
    };
    const next = [...messages, triggerMsg];
    setMessages(next);
    callAgent(next);
  }

  const configured = isConfigured();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col h-[calc(100vh-10rem)] bg-bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg text-text-muted hover:text-text hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${agent.color}15`, color: agent.color }}
          >
            <Icon size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text">{agent.name}</h3>
            <p className="text-[11px] text-text-muted">
              {agent.role} &middot; {getActiveProvider().toUpperCase()}
            </p>
          </div>
        </div>
        <button
          onClick={handleTrigger}
          disabled={loading || !configured}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
          style={{ backgroundColor: agent.color }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
          Trigger Action
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 opacity-60">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${agent.color}10`, color: agent.color }}
            >
              <Icon size={28} />
            </div>
            <div>
              <p className="text-sm font-medium text-text">{agent.name}</p>
              <p className="text-xs text-text-muted mt-1 max-w-xs">
                Click <strong>Trigger Action</strong> to start, or type a message below.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-md'
                  : 'bg-bg border border-border text-text rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-bg border border-border text-text-muted text-sm rounded-bl-md">
              <Loader2 size={14} className="animate-spin" style={{ color: agent.color }} />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2 max-w-[80%] px-4 py-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm rounded-bl-md">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      {!configured && (
        <div className="px-5 py-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20 text-warning text-xs">
            <AlertCircle size={13} />
            <span>Set <code className="font-mono">VITE_AI_API_KEY</code> in your <code className="font-mono">.env</code> file to enable AI.</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSend} className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Message ${agent.name}...`}
            disabled={!configured}
            className="flex-1 px-4 py-2.5 bg-bg border border-border rounded-xl text-sm text-text placeholder:text-text-muted/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading || !configured}
            className="p-2.5 rounded-xl text-white transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110"
            style={{ backgroundColor: agent.color }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </motion.div>
  );
}
