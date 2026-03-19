"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  getInquiries, markInquiryRead, updateInquiryStatus,
  type Inquiry, type InquiryStatus,
} from "../_lib/api";
import {
  Inbox, CheckCheck, TrendingUp, Users, Check, X,
  Loader2, Mail, Phone, ArrowRight,
} from "lucide-react";

type Period = "7d" | "30d" | "90d" | "all";

const PERIODS: { value: Period; label: string; days: number | null }[] = [
  { value: "7d", label: "7 days", days: 7 },
  { value: "30d", label: "30 days", days: 30 },
  { value: "90d", label: "3 months", days: 90 },
  { value: "all", label: "All time", days: null },
];

function filterByPeriod(inquiries: Inquiry[], period: Period): Inquiry[] {
  const cfg = PERIODS.find((p) => p.value === period)!;
  if (!cfg.days) return inquiries;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - cfg.days);
  return inquiries.filter((i) => new Date(i.created_at) >= cutoff);
}

function buildChartData(inquiries: Inquiry[], period: Period) {
  const now = new Date();

  if (period === "7d") {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      const label = d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      const count = inquiries.filter((inq) => {
        const cd = new Date(inq.created_at);
        return cd.toDateString() === d.toDateString();
      }).length;
      return { label, count };
    });
  }

  if (period === "30d") {
    return Array.from({ length: 4 }, (_, i) => {
      const start = new Date(now);
      start.setDate(now.getDate() - (3 - i) * 7 - 6);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      const label = start.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      const count = inquiries.filter((inq) => {
        const d = new Date(inq.created_at);
        return d >= start && d <= end;
      }).length;
      return { label, count };
    });
  }

  if (period === "90d") {
    return Array.from({ length: 3 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (2 - i), 1);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      const count = inquiries.filter((inq) => {
        const cd = new Date(inq.created_at);
        return cd.getFullYear() === d.getFullYear() && cd.getMonth() === d.getMonth();
      }).length;
      return { label, count };
    });
  }

  if (inquiries.length === 0) return [];
  const oldest = new Date(Math.min(...inquiries.map((i) => new Date(i.created_at).getTime())));
  const months: { label: string; count: number }[] = [];
  let cur = new Date(oldest.getFullYear(), oldest.getMonth(), 1);
  while (cur <= now) {
    const label = cur.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    const count = inquiries.filter((inq) => {
      const cd = new Date(inq.created_at);
      return cd.getFullYear() === cur.getFullYear() && cd.getMonth() === cur.getMonth();
    }).length;
    months.push({ label, count });
    cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
  }
  return months;
}

function StatCard({ label, value, sub, icon: Icon, accent, delay }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-neutral-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={16} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-neutral-600">{sub}</p>}
      </div>
    </motion.div>
  );
}

function ActivityChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const H = 112;

  return (
    <div className="w-full">
      <div className="relative flex items-end gap-1.5" style={{ height: H }}>
        {data.map((d, i) => {
          const barH = Math.max(Math.round((d.count / max) * H), d.count > 0 ? 6 : 3);
          return (
            <div key={d.label} className="group relative flex h-full flex-1 items-end" title={`${d.label}: ${d.count}`}>
              {d.count > 0 && (
                <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-neutral-500 opacity-0 transition-opacity group-hover:opacity-100" style={{ bottom: barH + 4 }}>
                  {d.count}
                </span>
              )}
              <motion.div
                className="w-full rounded-t-md transition-colors group-hover:brightness-110"
                style={{ background: "#f4a7b9" }}
                initial={{ height: 0 }}
                animate={{ height: barH }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: "easeOut" }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-1.5 border-t border-neutral-800/60 pt-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center">
            <span className="text-[9px] leading-none text-neutral-700">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [allInquiries, setAllInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("30d");

  useEffect(() => {
    getInquiries().then(setAllInquiries).finally(() => setLoading(false));
  }, []);

  function handleUpdate(updated: Inquiry) {
    setAllInquiries((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  }

  const inquiries = filterByPeriod(allInquiries, period);
  const total = inquiries.length;
  const unread = allInquiries.filter((i) => !i.is_read).length;
  const accepted = inquiries.filter((i) => i.status === "accepted").length;
  const completed = inquiries.filter((i) => i.status === "completed").length;
  const conversion = total > 0 ? Math.round(((accepted + completed) / total) * 100) : 0;

  const newInquiries = allInquiries.filter((i) => i.status === "new" && !i.is_read).slice(0, 5);

  const serviceCounts: Record<string, number> = {};
  inquiries.forEach((i) => {
    if (i.service) serviceCounts[i.service] = (serviceCounts[i.service] ?? 0) + 1;
  });
  const topServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxService = topServices[0]?.[1] ?? 1;
  const chartData = buildChartData(inquiries, period);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-32 text-neutral-600">
        <Loader2 size={20} className="animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-semibold text-white md:text-2xl">Dashboard</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Overall stats</p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-neutral-800 bg-neutral-900 p-1">
          {PERIODS.map(({ value, label }) => (
            <motion.button
              key={value}
              onClick={() => setPeriod(value)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                period === value ? "bg-[#f4a7b9]/15 text-[#f4a7b9]" : "text-neutral-500 hover:text-white"
              }`}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard delay={0} label="Total inquiries" value={total} sub={`${unread} unread`} icon={Inbox} accent="bg-neutral-800 text-neutral-400" />
        <StatCard delay={0.05} label="Accepted" value={accepted} sub="active clients" icon={Check} accent="bg-green-500/10 text-green-400" />
        <StatCard delay={0.1} label="Completed" value={completed} sub="completed sessions" icon={CheckCheck} accent="bg-purple-500/10 text-purple-400" />
        <StatCard delay={0.15} label="Conversion" value={`${conversion}%`} sub="of inquiries become clients" icon={TrendingUp} accent="bg-blue-500/10 text-blue-400" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          className="lg:col-span-2 flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-white">New inquiries</p>
              <p className="mt-0.5 text-xs text-neutral-600">{newInquiries.length} unread</p>
            </div>
            <Link href="/admin/inquiries" className="flex items-center gap-1 text-xs text-neutral-500 transition-colors hover:text-white">
              All <ArrowRight size={12} />
            </Link>
          </div>

          {newInquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-800">
                <Mail size={18} className="text-neutral-600" />
              </div>
              <p className="text-sm text-neutral-600">No new inquiries</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/60">
              {newInquiries.map((inq, i) => (
                <NewInquiryRow key={inq.id} inquiry={inq} onUpdate={handleUpdate} delay={i * 0.05} />
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900"
        >
          <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
            <p className="text-sm font-medium text-white">Popular services</p>
            <Users size={14} className="text-neutral-600" />
          </div>
          {topServices.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-neutral-600">No data</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 px-5 py-4">
              {topServices.map(([service, count], i) => (
                <motion.div
                  key={service}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex flex-col gap-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate text-xs text-neutral-300">{service}</span>
                    <span className="ml-2 shrink-0 text-xs text-neutral-600">{count}</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-neutral-800">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "#f4a7b9" }}
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxService) * 100}%` }}
                      transition={{ duration: 0.6, delay: 0.35 + i * 0.06, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.3 }}
        className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Activity</p>
            <p className="mt-0.5 text-xs text-neutral-600">
              {period === "7d" && "By day over the last week"}
              {period === "30d" && "By week over the last month"}
              {period === "90d" && "By month over the last 3 months"}
              {period === "all" && "By month over all time"}
            </p>
          </div>
          <span className="text-xs text-neutral-600">{total} inquiries</span>
        </div>
        <ActivityChart key={period} data={chartData} />
      </motion.div>
    </div>
  );
}

function NewInquiryRow({ inquiry, onUpdate, delay }: {
  inquiry: Inquiry;
  onUpdate: (u: Inquiry) => void;
  delay: number;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(e: React.MouseEvent, status: InquiryStatus) {
    e.preventDefault();
    setLoading(status);
    try {
      const updated = await updateInquiryStatus(inquiry.id, status);
      if (!inquiry.is_read) await markInquiryRead(inquiry.id, true);
      onUpdate({ ...updated, is_read: true });
    } finally {
      setLoading(null);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-neutral-800/30"
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {inquiry.name}{inquiry.partner_name ? ` & ${inquiry.partner_name}` : ""}
        </p>
        {inquiry.service && <p className="truncate text-xs text-neutral-400">{inquiry.service}</p>}
        <div className="mt-0.5 flex items-center gap-3">
          <a href={`mailto:${inquiry.email}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs text-neutral-600 transition-colors hover:text-blue-400">
            <Mail size={10} />{inquiry.email}
          </a>
          {inquiry.phone && (
            <a href={`tel:${inquiry.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs text-neutral-600 transition-colors hover:text-green-400">
              <Phone size={10} />{inquiry.phone}
            </a>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={loading !== null} onClick={(e) => handleAction(e, "accepted")} className="flex items-center gap-1 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-400 transition-colors hover:bg-green-500/20 disabled:opacity-40">
          {loading === "accepted" ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
          Accept
        </motion.button>
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={loading !== null} onClick={(e) => handleAction(e, "rejected")} className="flex items-center gap-1 rounded-lg bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:opacity-40">
          <X size={11} /> Reject
        </motion.button>
      </div>
    </motion.div>
  );
}
