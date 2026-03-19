"use client";
import { useEffect, useState } from "react";
import { BookOpen, Save, Check, Plus, Trash2 } from "lucide-react";
import { getContent, updateContent, createContent, deleteContent } from "../_lib/api";
import ImageUpload from "../_components/ImageUpload";
import { uploadPhoto } from "../_lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

interface Para {
  n: number;
  text: string;
  existsInDb: boolean;
}

const FIXED_FIELDS = [
  { key: "about_title", label: "Title" },
  { key: "about_intro", label: "Subtitle" },
];

export default function AboutPage() {
  const [fixed, setFixed] = useState<Record<string, string>>({});
  const [paras, setParas] = useState<Para[]>([]);
  const [photoUrl, setPhotoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    getContent().then((all) => {
      const aboutItems = all.filter((i) => i.section === "about");
      const map: Record<string, string> = {};
      aboutItems.forEach((i) => { map[i.key] = i.value; });

      setFixed({ about_title: map.about_title || "", about_intro: map.about_intro || "" });
      setPhotoUrl(map.about_photo_url || "");

      const pNums = aboutItems.filter((i) => /^about_p\d+$/.test(i.key)).map((i) => parseInt(i.key.match(/\d+/)![0])).sort((a, b) => a - b);
      if (pNums.length > 0) {
        setParas(pNums.map((n) => ({ n, text: map[`about_p${n}`] || "", existsInDb: true })));
      } else {
        setParas([1, 2, 3, 4, 5].map((n) => ({ n, text: map[`about_p${n}`] || "", existsInDb: false })));
      }
    });
  }, []);

  function addPara() {
    const maxN = paras.length > 0 ? Math.max(...paras.map((p) => p.n)) : 0;
    setParas((prev) => [...prev, { n: maxN + 1, text: "", existsInDb: false }]);
  }

  async function removePara(para: Para) {
    if (para.existsInDb) {
      if (!confirm("Delete this paragraph?")) return;
      await deleteContent(`about_p${para.n}`).catch(() => {});
    }
    setParas((prev) => prev.filter((p) => p.n !== para.n));
  }

  async function handleImage(file: File) {
    const photo = await uploadPhoto(file, "about");
    const url = `${API_BASE}${photo.url}`;
    setPhotoUrl(url);
    await updateContent("about_photo_url", url).catch(() => {});
  }

  async function saveAll() {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(fixed)) await updateContent(key, value);
      for (const para of paras) {
        if (para.existsInDb) {
          await updateContent(`about_p${para.n}`, para.text);
        } else {
          await createContent({ key: `about_p${para.n}`, value: para.text, section: "about", label: `Paragraph ${para.n}` });
          setParas((prev) => prev.map((p) => (p.n === para.n ? { ...p, existsInDb: true } : p)));
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
          <BookOpen className="text-neutral-400" size={20} />
          <h1 className="text-xl font-semibold text-white">About</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={addPara} className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700"><Plus size={14} /> Add paragraph</button>
          <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50">{saving ? <><Save size={14} /> Saving...</> : savedAt ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save all</>}</button>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-400">Editing</h2>
        <ImageUpload label="Image" value={photoUrl || undefined} onFile={handleImage} aspect="portrait" />
        {FIXED_FIELDS.map(({ key, label }) => (
          <div key={key} className="rounded-xl bg-neutral-900 p-4">
            <label className="mb-2 block text-xs uppercase tracking-wider text-neutral-500">{label}</label>
            <input type="text" value={fixed[key] ?? ""} onChange={(e) => setFixed((f) => ({ ...f, [key]: e.target.value }))} className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
          </div>
        ))}
        {paras.map((para) => (
          <div key={para.n} className="rounded-xl bg-neutral-900 p-4">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs uppercase tracking-wider text-neutral-500">Paragraph {para.n}</label>
              <button onClick={() => removePara(para)} className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
            <textarea rows={4} value={para.text} onChange={(e) => setParas((prev) => prev.map((p) => (p.n === para.n ? { ...p, text: e.target.value } : p)))} placeholder="Enter paragraph text..." className="w-full resize-y rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
          </div>
        ))}
        <button onClick={addPara} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-700 py-2 text-sm text-neutral-500 transition-colors hover:border-neutral-500 hover:text-white"><Plus size={14} /> Add paragraph</button>
      </div>
    </div>
  );
}
