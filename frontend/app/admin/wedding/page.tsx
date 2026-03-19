"use client";
import { Heart, Save, Check } from "lucide-react";
import useSectionContent from "../_lib/useSectionContent";
import ImageUpload from "../_components/ImageUpload";
import { uploadPhoto } from "../_lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

const FIELDS = [
  { key: "wedding_price_title", label: "Title (WEDDING)" },
  { key: "wedding_begin_at", label: "Begin at text" },
  { key: "wedding_price", label: "Price ($4500)" },
  { key: "wedding_duration", label: "Duration (for 8 hours of coverage)" },
  { key: "wedding_p1", label: "Package description 1", textarea: true },
  { key: "wedding_p2", label: "Package description 2", textarea: true },
];

export default function WeddingPage() {
  const { values, setValue, saving, savedAt, saveAll } = useSectionContent("wedding");

  async function handleImage(file: File) {
    const photo = await uploadPhoto(file, "wedding_bg");
    setValue("wedding_bg_url", `${API_BASE}${photo.url}`);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Heart className="text-neutral-400" size={20} />
          <h1 className="text-xl font-semibold text-white">Wedding Pricing</h1>
        </div>
        <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50">{saving ? <><Save size={14} /> Saving...</> : savedAt ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save all</>}</button>
      </div>
      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-400">Editing</h2>
        <ImageUpload label="Background image" value={values.wedding_bg_url} onFile={handleImage} />
        {FIELDS.map(({ key, label, textarea }) => (
          <div key={key} className="rounded-xl bg-neutral-900 p-4">
            <label className="mb-2 block text-xs uppercase tracking-wider text-neutral-500">{label}</label>
            {textarea ? <textarea rows={4} value={values[key] ?? ""} onChange={(e) => setValue(key, e.target.value)} className="w-full resize-y rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" /> : <input type="text" value={values[key] ?? ""} onChange={(e) => setValue(key, e.target.value)} className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />}
          </div>
        ))}
      </div>
    </div>
  );
}
