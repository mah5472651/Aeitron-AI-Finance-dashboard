import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useExpenses } from '../../context/ExpenseContext';
import { useLeads } from '../../context/LeadsContext';
import { formatCurrency } from '../../utils/formatters';
import {
  calcTotalRevenue,
  calcTotalExpenses,
  calcOnboardedCount,
  calcPipelineValue,
} from '../../utils/calculations';

const WELCOME_MESSAGE = {
  role: 'bot',
  text: "Hi, I'm the **Aeitron AI Copilot**. Type **help** to see what I can do.",
};

function generateResponse(command, { clients, expenses, leads }) {
  const cmd = command.trim().toLowerCase();

  if (cmd === 'help') {
    return [
      '**Available Commands:**',
      '`revenue` — Current total revenue',
      '`clients` — Client overview',
      '`expenses` — Total expenses',
      '`leads` — Pipeline summary',
      '`help` — Show this list',
    ].join('\n');
  }

  if (cmd === 'revenue') {
    const total = calcTotalRevenue(clients);
    return `**Total Revenue:** ${formatCurrency(total)}`;
  }

  if (cmd === 'clients') {
    const onboarded = calcOnboardedCount(clients);
    return `**${clients.length}** total clients, **${onboarded}** fully onboarded.`;
  }

  if (cmd === 'expenses') {
    const total = calcTotalExpenses(expenses);
    return `**Total Expenses:** ${formatCurrency(total)}`;
  }

  if (cmd === 'leads') {
    const pipeline = calcPipelineValue(leads);
    return `**Pipeline Value:** ${formatCurrency(pipeline)} across **${leads.length}** leads.`;
  }

  return "I didn't understand that. Type **help** to see available commands.";
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMarkdown(text) {
  const parts = text.split('\n');
  return parts.map((line, i) => {
    const rendered = escapeHtml(line)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-sidebar/10 rounded text-xs font-mono">$1</code>');
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: rendered }} />
        {i < parts.length - 1 && <br />}
      </span>
    );
  });
}

export default function AICopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  const { clients } = useClients();
  const { expenses } = useExpenses();
  const { leads } = useLeads();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input.trim() };
    const botResponse = generateResponse(input, { clients, expenses, leads });
    const botMsg = { role: 'bot', text: botResponse };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[70] w-14 h-14 rounded-full bg-accent hover:bg-accent-hover text-white shadow-modal flex items-center justify-center transition-all duration-200 hover:scale-105 animate-pulse-glow"
        title="Open AI Copilot"
      >
        <Bot size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-[70] w-full sm:w-[380px] h-[calc(100vh-2rem)] sm:h-[500px] bg-bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-modal flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-sidebar">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center">
            <Sparkles size={16} className="text-accent-light" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Aeitron AI</h3>
            <p className="text-[11px] text-sidebar-text">Agency Copilot</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 text-sidebar-text hover:text-white rounded-lg hover:bg-sidebar-hover transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-br-md'
                  : 'bg-bg border border-border text-text rounded-bl-md'
              }`}
            >
              {renderMarkdown(msg.text)}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask something..."
            className="flex-1 px-3.5 py-2.5 bg-bg border border-border rounded-xl text-sm text-text placeholder:text-text-muted/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
