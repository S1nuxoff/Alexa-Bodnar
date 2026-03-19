"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getInquiries, markInquiryRead, deleteInquiry, updateInquiryStatus,
  type Inquiry, type InquiryStatus,
} from "../_lib/api";
import {
  X, Check, CheckCheck, FolderX, Loader2, Mail, MailOpen,
  Phone, MapPin, Calendar, DollarSign, Trash2, MessageSquare,
} from "lucide-react";

function formatDateFull(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function parseSessionDate(raw: string): { day: string; month: string; year: string } | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return {
      day: d.getDate().toString().padStart(2, "0"),
      month: d.toLocaleDateString("en-US", { month: "short" }),
      year: d.getFullYear().toString(),
    };
  }
  return { day: raw, month: "", year: "" };
}

const STATUS_CFG: Record<InquiryStatus, { label: string; color: string; dot: string }> = {
  new: { label: "New", color: "bg-blue-500/15 text-blue-400", dot: "bg-blue-400" },
  accepted: { label: "Accepted", color: "bg-green-500/15 text-green-400", dot: "bg-green-400" },
  rejected: { label: "Rejected", color: "bg-red-500/15 text-red-400", dot: "bg-red-400" },
  closed: { label: "Closed", color: "bg-neutral-700 text-neutral-400", dot: "bg-neutral-500" },
  completed: { label: "Completed", color: "bg-purple-500/15 text-purple-400", dot: "bg-purple-400" },
};

const TABS: { value: InquiryStatus | "all"; label: string }[] = [
  { value: "new", label: "New" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "all", label: "All" },
  { value: "rejected", label: "Rejected" },
  { value: "closed", label: "Closed" },
];

function StatusBadge({ status }: { status: InquiryStatus }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.new;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function InquiryModal({ inquiry, onClose, onUpdate, onDelete }: {
  inquiry: Inquiry;
  onClose: () => void;
  onUpdate: (u: Inquiry) => void;
  onDelete: (id: number) => void;
}) {
  const [loading, setLoading] = useState(false);
  const s = (inquiry.status ?? "new") as InquiryStatus;

  async function setStatus(status: InquiryStatus) {
    setLoading(true);
    try { onUpdate(await updateInquiryStatus(inquiry.id, status)); }
    finally { setLoading(false); }
  }

  async function toggleRead() {
    onUpdate(await markInquiryRead(inquiry.id, !inquiry.is_read));
  }

  async function handleDelete() {
    if (!confirm("Delete this inquiry?")) return;
    await deleteInquiry(inquiry.id);
    onDelete(inquiry.id);
    onClose();
  }

  const fields: [string, string | undefined, React.ElementType?, string?][] = [
    ["Email", inquiry.email, undefined, `mailto:${inquiry.email}`],
    ["Phone", inquiry.phone, Phone, inquiry.phone ? `tel:${inquiry.phone}` : undefined],
    ["Service", inquiry.service],
    ["Session date", inquiry.session_date, Calendar],
    ["Venue", inquiry.venue, MapPin],
    ["Budget", inquiry.budget, DollarSign],
    ["How they found you", inquiry.how_found],
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <motion.div className="absolute inset-0 bg-black/70 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-neutral-800 bg-neutral-900 sm:max-w-lg sm:rounded-2xl" initial={{ y: 40, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0, scale: 0.98 }} transition={{ type: "spring", stiffness: 380, damping: 32 }}>
        <div className="flex items-start justify-between border-b border-neutral-800 px-5 pb-4 pt-5 shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold leading-tight text-white">{inquiry.name}</h2>
              {inquiry.partner_name && <span className="text-sm text-neutral-500">& {inquiry.partner_name}</span>}
              <StatusBadge status={s} />
            </div>
            <p className="mt-1 text-xs text-neutral-600">{formatDateFull(inquiry.created_at)}</p>
          </div>
          <button onClick={onClose} className="ml-3 shrink-0 rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"><X size={16} /></button>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.filter(([, v]) => v).map(([label, value, Icon, href], i) => (
              <motion.div key={label} className="flex flex-col gap-0.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.25 }}>
                <span className="text-[10px] uppercase tracking-wider text-neutral-600">{label}</span>
                {href ? (
                  <a href={href} className="flex w-fit items-center gap-1.5 text-sm text-neutral-200 transition-colors hover:text-blue-400">{Icon && <Icon size={11} className="shrink-0 text-neutral-500" />}{value}</a>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm text-neutral-200">{Icon && <Icon size={11} className="shrink-0 text-neutral-500" />}{value}</span>
                )}
              </motion.div>
            ))}
          </div>

          {inquiry.message && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.25 }}>
              <span className="mb-1.5 flex items-center gap-1 text-[10px] uppercase tracking-wider text-neutral-600"><MessageSquare size={10} /> Message</span>
              <p className="whitespace-pre-wrap rounded-xl bg-neutral-800/60 p-3 text-sm leading-relaxed text-neutral-300">{inquiry.message}</p>
            </motion.div>
          )}
        </div>

        <div className="shrink-0 flex flex-wrap items-center gap-2 border-t border-neutral-800 bg-neutral-900/80 px-5 pb-10 pt-5">
          {s === "new" && (
            <>
              <button disabled={loading} onClick={() => setStatus("accepted")} className="flex items-center gap-1.5 rounded-xl bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-40">{loading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Accept</button>
              <button disabled={loading} onClick={() => setStatus("rejected")} className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"><X size={13} /> Reject</button>
            </>
          )}
          {s === "accepted" && (
            <>
              <button disabled={loading} onClick={() => setStatus("completed")} className="flex items-center gap-1.5 rounded-xl bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/20 disabled:opacity-40"><CheckCheck size={13} /> Complete</button>
              <button disabled={loading} onClick={() => setStatus("closed")} className="flex items-center gap-1.5 rounded-xl bg-neutral-700 px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-600 disabled:opacity-40"><FolderX size={13} /> Close</button>
              <button disabled={loading} onClick={() => setStatus("rejected")} className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"><X size={13} /> Reject</button>
            </>
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <button onClick={toggleRead} title={inquiry.is_read ? "Mark as unread" : "Mark as read"} className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-neutral-300">{inquiry.is_read ? <Mail size={14} /> : <MailOpen size={14} />}</button>
            <button onClick={handleDelete} className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-red-400"><Trash2 size={14} /></button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function InquiryCard({ inquiry, onClick, onUpdate }: {
  inquiry: Inquiry;
  onClick: () => void;
  onUpdate: (u: Inquiry) => void;
}) {
  const s = (inquiry.status ?? "new") as InquiryStatus;
  const sd = parseSessionDate(inquiry.session_date);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(e: React.MouseEvent, status: InquiryStatus) {
    e.stopPropagation();
    setLoading(status);
    try { onUpdate(await updateInquiryStatus(inquiry.id, status)); }
    finally { setLoading(null); }
  }

  return (
    <motion.div onClick={onClick} layout whileHover={{ scale: 1.005 }} whileTap={{ scale: 0.998 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className={`group flex w-full cursor-pointer items-stretch gap-0 rounded-2xl border transition-colors hover:border-neutral-600 ${!inquiry.is_read ? "border-blue-500/30 bg-neutral-900" : "border-neutral-800/80 bg-neutral-900/70"}`}>
      <div className={`flex w-16 shrink-0 flex-col items-center justify-center rounded-l-2xl border-r sm:w-20 ${!inquiry.is_read ? "border-blue-500/20 bg-blue-500/5" : "border-neutral-800/60 bg-neutral-800/30"}`}>
        {sd ? sd.month ? <><span className={`text-2xl font-bold leading-none sm:text-3xl ${!inquiry.is_read ? "text-blue-300" : "text-neutral-300"}`}>{sd.day}</span><span className="mt-0.5 text-[11px] uppercase tracking-wide text-neutral-500">{sd.month}</span>{sd.year && <span className="text-[10px] text-neutral-700">{sd.year}</span>}</> : <span className="px-1 text-center text-xs leading-tight text-neutral-400">{sd.day}</span> : <div className="flex flex-col items-center gap-0.5 opacity-40"><Calendar size={16} className="text-neutral-500" /><span className="text-[9px] text-neutral-600">-</span></div>}
      </div>

      <div className="flex flex-1 min-w-0 flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            <StatusBadge status={s} />
            {!inquiry.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />}
          </div>
          <p className={`truncate text-base font-bold leading-tight ${!inquiry.is_read ? "text-white" : "text-neutral-300"}`}>{inquiry.name}{inquiry.partner_name ? ` & ${inquiry.partner_name}` : ""}</p>
          {inquiry.service && <p className="truncate text-base font-medium text-neutral-200">{inquiry.service}</p>}
          <div className="mt-0.5 flex flex-wrap items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-blue-400"><Mail size={11} />{inquiry.email}</a>
            {inquiry.phone && <a href={`tel:${inquiry.phone}`} className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-green-400"><Phone size={11} />{inquiry.phone}</a>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {s === "new" && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <motion.button disabled={loading !== null} onClick={(e) => handleAction(e, "accepted")} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="flex items-center gap-1.5 rounded-xl bg-green-500/10 px-4 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-40">{loading === "accepted" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Accept</motion.button>
              <motion.button disabled={loading !== null} onClick={(e) => handleAction(e, "rejected")} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40"><X size={13} /> Reject</motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<InquiryStatus | "all">("new");
  const [selected, setSelected] = useState<Inquiry | null>(null);

  useEffect(() => {
    getInquiries().then(setInquiries).finally(() => setLoading(false));
  }, []);

  function openModal(inquiry: Inquiry) {
    setSelected(inquiry);
    if (!inquiry.is_read) {
      markInquiryRead(inquiry.id, true).then((updated) =>
        setInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))
      );
    }
  }

  function handleUpdate(updated: Inquiry) {
    setInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    setSelected(updated);
  }

  function handleDelete(id: number) {
    setInquiries((prev) => prev.filter((i) => i.id !== id));
    setSelected(null);
  }

  function countFor(v: InquiryStatus | "all") {
    return v === "all" ? inquiries.length : inquiries.filter((i) => i.status === v).length;
  }

  const unread = inquiries.filter((i) => !i.is_read).length;
  const displayed = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);

  const emptyMessages: Record<string, string> = {
    new: "No new inquiries",
    accepted: "No accepted inquiries",
    completed: "No completed inquiries",
    rejected: "No rejected inquiries",
    closed: "No closed inquiries",
    all: "No inquiries yet",
  };

  return (
    <div className="w-full">
      <motion.div className="mb-5" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-xl font-semibold text-white md:text-2xl">Inquiries</h1>
        {!loading && <motion.p className="mt-0.5 text-sm text-neutral-500" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>{inquiries.length} total{unread > 0 && <span className="ml-2 font-medium text-blue-400">{unread} unread</span>}</motion.p>}
      </motion.div>

      <motion.div className="mb-5 flex flex-wrap gap-1.5" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
        {TABS.map(({ value, label }) => {
          const count = countFor(value);
          const active = filter === value;
          return (
            <motion.button key={value} onClick={() => setFilter(value)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm transition-colors ${active ? "bg-[#f4a7b9]/15 font-medium text-[#f4a7b9]" : "bg-neutral-800/60 text-neutral-500 hover:bg-neutral-800 hover:text-white"}`}>
              {label}
              {count > 0 && <span className={`rounded-full px-1.5 py-0.5 text-xs ${active ? "bg-[#f4a7b9]/20 text-[#f4a7b9]" : "bg-neutral-700/60 text-neutral-500"}`}>{count}</span>}
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {loading && <motion.div className="flex items-center justify-center gap-3 py-20 text-neutral-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Loader2 size={18} className="animate-spin" /><span className="text-sm">Loading...</span></motion.div>}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!loading && displayed.length === 0 && <motion.div key="empty" className="py-16 text-center" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800"><Mail size={20} className="text-neutral-600" /></div><p className="text-sm text-neutral-500">{emptyMessages[filter] ?? "No inquiries"}</p></motion.div>}
      </AnimatePresence>

      <motion.div className="flex flex-col gap-2" layout>
        <AnimatePresence initial={false}>
          {displayed.map((inquiry, i) => (
            <motion.div key={inquiry.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, scale: 0.97 }} transition={{ duration: 0.25, delay: i * 0.04 }}>
              <InquiryCard inquiry={inquiry} onClick={() => openModal(inquiry)} onUpdate={handleUpdate} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {selected && <InquiryModal inquiry={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} onDelete={handleDelete} />}
      </AnimatePresence>
    </div>
  );
}
