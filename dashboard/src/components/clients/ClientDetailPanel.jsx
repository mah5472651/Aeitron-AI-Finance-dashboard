import { useState, useMemo } from 'react';
import {
  X, MessageSquare, Send, Trash2, Clock, DollarSign,
  User, Building, Briefcase, TrendingUp, FileDown,
} from 'lucide-react';
import { useClients } from '../../context/ClientContext';
import { useClientNotes } from '../../context/ClientNotesContext';
import { useInvoices } from '../../context/InvoiceContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { BADGE_COLORS } from '../../utils/constants';
import ClientBadge from './ClientBadge';
import ClientRoadmap from './ClientRoadmap';
import ShareClientButton from './ShareClientButton';
import InvoiceGeneratorModal from './InvoiceGeneratorModal';

export default function ClientDetailPanel({ client, onClose }) {
  const { clients, dispatch: clientDispatch } = useClients();
  const { notes, dispatch: notesDispatch } = useClientNotes();
  const { invoices } = useInvoices();

  // Keep client data fresh from context
  const liveClient = clients.find((c) => c.id === client.id) || client;
  const [noteText, setNoteText] = useState('');
  const [activeTab, setActiveTab] = useState('roadmap');
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const clientNotes = useMemo(
    () =>
      notes
        .filter((n) => n.clientId === client.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [notes, client.id]
  );

  const clientInvoices = useMemo(
    () => invoices.filter((inv) => inv.clientId === client.id),
    [invoices, client.id]
  );

  const activityLog = useMemo(() => {
    const items = [];

    items.push({
      type: 'created',
      date: client.createdAt,
      text: 'Client created',
      icon: User,
      color: 'text-success',
    });

    if (client.updatedAt && client.updatedAt !== client.createdAt) {
      items.push({
        type: 'updated',
        date: client.updatedAt,
        text: 'Client details updated',
        icon: TrendingUp,
        color: 'text-info',
      });
    }

    clientNotes.forEach((note) => {
      items.push({
        type: 'note',
        date: note.createdAt,
        text: note.text,
        icon: MessageSquare,
        color: 'text-accent',
        noteId: note.id,
      });
    });

    clientInvoices.forEach((inv) => {
      items.push({
        type: 'invoice',
        date: inv.createdAt,
        text: `Invoice #${inv.invoiceNumber} created (${formatCurrency(inv.total)})`,
        icon: DollarSign,
        color: 'text-warning',
      });
    });

    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [client, clientNotes, clientInvoices]);

  function handleAddNote(e) {
    e.preventDefault();
    if (!noteText.trim()) return;
    notesDispatch({
      type: 'ADD_NOTE',
      payload: {
        id: crypto.randomUUID(),
        clientId: client.id,
        text: noteText.trim(),
        createdAt: new Date().toISOString(),
      },
    });
    setNoteText('');
  }

  const outstanding = client.totalProjectValue - client.amountPaid;

  if (!client) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-bg-card border-l border-border z-50 flex flex-col animate-slide-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold text-sm shrink-0">
              {client.clientName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-text truncate">{client.clientName}</h2>
              <div className="flex items-center gap-1.5 text-xs text-text-muted">
                <Building size={11} />
                <span className="truncate">{client.companyName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setInvoiceModalOpen(true)}
              className="p-2 text-text-muted hover:text-accent rounded-lg hover:bg-accent/10 transition-colors"
              title="Generate Invoice"
            >
              <FileDown size={16} />
            </button>
            <ShareClientButton clientId={liveClient.id} size={16} />
            <button onClick={onClose} className="p-2 text-text-muted hover:text-text rounded-lg hover:bg-bg-hover transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Client summary cards */}
        <div className="grid grid-cols-3 gap-3 p-5 border-b border-border">
          <div className="text-center">
            <p className="text-xs text-text-muted mb-0.5">Value</p>
            <p className="text-sm font-semibold text-text">{formatCurrency(client.totalProjectValue)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted mb-0.5">Paid</p>
            <p className="text-sm font-semibold text-success">{formatCurrency(client.amountPaid)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-text-muted mb-0.5">Due</p>
            <p className={`text-sm font-semibold ${outstanding > 0 ? 'text-danger' : 'text-success'}`}>
              {formatCurrency(outstanding)}
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
          <ClientBadge value={client.onboardingStatus} />
          <ClientBadge value={client.paymentCategory} />
          <span className="text-xs text-text-muted ml-auto">{client.milestones}% complete</span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {['roadmap', 'notes', 'activity'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              {tab === 'roadmap' ? 'Roadmap' : tab === 'notes' ? `Notes (${clientNotes.length})` : `Activity (${activityLog.length})`}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'roadmap' && (
            <div className="p-5">
              <ClientRoadmap client={liveClient} dispatch={clientDispatch} />
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="p-5 space-y-4">
              {/* Add note form */}
              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-muted/50 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!noteText.trim()}
                  className="p-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                </button>
              </form>

              {clientNotes.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No notes yet</p>
                  <p className="text-xs opacity-60 mt-0.5">Add your first note above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clientNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-bg rounded-lg border border-border-light group"
                    >
                      <p className="text-sm text-text">{note.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-text-muted">{formatDate(note.createdAt)}</span>
                        <button
                          onClick={() => notesDispatch({ type: 'DELETE_NOTE', payload: note.id })}
                          className="p-1 text-text-muted/0 group-hover:text-text-muted hover:!text-danger rounded transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="p-5">
              {activityLog.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <Clock size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No activity yet</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
                  <div className="space-y-4">
                    {activityLog.map((item, i) => {
                      const Icon = item.icon;
                      return (
                        <div key={i} className="flex items-start gap-3 relative">
                          <div className={`w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center shrink-0 z-10 ${item.color}`}>
                            <Icon size={13} />
                          </div>
                          <div className="pt-1 min-w-0">
                            <p className="text-sm text-text">{item.text}</p>
                            <p className="text-xs text-text-muted mt-0.5">{formatDate(item.date)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {invoiceModalOpen && (
        <InvoiceGeneratorModal
          client={liveClient}
          onClose={() => setInvoiceModalOpen(false)}
        />
      )}
    </>
  );
}
