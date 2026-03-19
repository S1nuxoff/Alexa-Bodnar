"use client";
import { useEffect, useState } from "react";
import { HelpCircle, Save, Check, Plus, Trash2 } from "lucide-react";
import { getContent, updateContent, createContent, deleteContent } from "../_lib/api";

interface FaqPair {
  n: number;
  q: string;
  a: string;
  existsInDb: boolean;
}

export default function FaqPage() {
  const [pairs, setPairs] = useState<FaqPair[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    getContent().then((all) => {
      const faqItems = all.filter((i) => i.section === "faq");
      const map: Record<number, { q: string; a: string }> = {};
      faqItems.forEach((i) => {
        const m = i.key.match(/^faq_(\d+)_([qa])$/);
        if (!m) return;
        const n = parseInt(m[1]);
        if (!map[n]) map[n] = { q: "", a: "" };
        map[n][m[2] as "q" | "a"] = i.value;
      });
      const loaded = Object.entries(map).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([n, { q, a }]) => ({ n: parseInt(n), q, a, existsInDb: true }));
      setPairs(loaded.length > 0 ? loaded : getDefaultPairs());
    });
  }, []);

  function getDefaultPairs(): FaqPair[] {
    return [
      { n: 1, q: "How would you describe your photography style?", a: "My style is documentary and fine-art. I focus on authentic emotion, soft natural light, and timeless compositions.", existsInDb: false },
      { n: 2, q: "Where are you based, and do you travel?", a: "I'm based in Chanhassen, Minnesota, and I love to travel.", existsInDb: false },
    ];
  }

  function addPair() {
    const maxN = pairs.length > 0 ? Math.max(...pairs.map((p) => p.n)) : 0;
    setPairs((prev) => [...prev, { n: maxN + 1, q: "", a: "", existsInDb: false }]);
  }

  async function removePair(pair: FaqPair) {
    if (pair.existsInDb) {
      if (!confirm(`Delete question ${pair.n}?`)) return;
      await deleteContent(`faq_${pair.n}_q`).catch(() => {});
      await deleteContent(`faq_${pair.n}_a`).catch(() => {});
    }
    setPairs((prev) => prev.filter((p) => p.n !== pair.n));
  }

  function update(n: number, field: "q" | "a", val: string) {
    setPairs((prev) => prev.map((p) => (p.n === n ? { ...p, [field]: val } : p)));
  }

  async function saveAll() {
    setSaving(true);
    try {
      for (const pair of pairs) {
        if (pair.existsInDb) {
          await updateContent(`faq_${pair.n}_q`, pair.q);
          await updateContent(`faq_${pair.n}_a`, pair.a);
        } else {
          await createContent({ key: `faq_${pair.n}_q`, value: pair.q, section: "faq", label: `Question ${pair.n}` });
          await createContent({ key: `faq_${pair.n}_a`, value: pair.a, section: "faq", label: `Answer ${pair.n}` });
          setPairs((prev) => prev.map((p) => (p.n === pair.n ? { ...p, existsInDb: true } : p)));
        }
      }
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HelpCircle className="text-neutral-400" size={20} />
          <h1 className="text-xl font-semibold text-white">FAQ</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={addPair} className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700"><Plus size={14} /> Add question</button>
          <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50">{saving ? <><Save size={14} /> Saving...</> : savedAt ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save all</>}</button>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-400">Questions and answers</h2>
        {pairs.map((pair) => (
          <div key={pair.n} className="space-y-3 rounded-xl bg-neutral-900 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wider text-neutral-400">Question {pair.n}</p>
              <button onClick={() => removePair(pair)} className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-600">Question</label>
              <input type="text" value={pair.q} onChange={(e) => update(pair.n, "q", e.target.value)} placeholder="Enter a question..." className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-600">Answer</label>
              <textarea rows={3} value={pair.a} onChange={(e) => update(pair.n, "a", e.target.value)} placeholder="Enter an answer..." className="w-full resize-y rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
            </div>
          </div>
        ))}
        <button onClick={addPair} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-700 py-2 text-sm text-neutral-500 transition-colors hover:border-neutral-500 hover:text-white"><Plus size={14} /> Add another question</button>
      </div>
    </div>
  );
}
