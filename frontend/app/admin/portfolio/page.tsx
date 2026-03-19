"use client";
import { LayoutDashboard, Save, Check } from "lucide-react";
import useSectionContent from "../_lib/useSectionContent";
import ImageUpload from "../_components/ImageUpload";
import { uploadPhoto } from "../_lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

const CARDS = [
  { name: "Wedding", scriptKey: "portfolio_wedding_script", subtitleKey: "portfolio_wedding_subtitle", imgKey: "portfolio_wedding_image" },
  { name: "Engagement", scriptKey: "portfolio_engagement_script", subtitleKey: "portfolio_engagement_subtitle", imgKey: "portfolio_engagement_image" },
  { name: "Families", scriptKey: "portfolio_families_script", subtitleKey: "portfolio_families_subtitle", imgKey: "portfolio_families_image" },
];

export default function PortfolioPage() {
  const { values, setValue, saving, savedAt, saveAll } = useSectionContent("portfolio");

  async function handleImage(file: File, key: string) {
    const photo = await uploadPhoto(file, "portfolio");
    setValue(key, `${API_BASE}${photo.url}`);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LayoutDashboard className="text-neutral-400" size={20} />
          <h1 className="text-xl font-semibold text-white">Portfolio</h1>
        </div>
        <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50">{saving ? <><Save size={14} /> Saving...</> : savedAt ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save all</>}</button>
      </div>
      <div className="space-y-4">
        <h2 className="text-xs uppercase tracking-wider text-neutral-400">Editing</h2>
        {CARDS.map(({ name, scriptKey, subtitleKey, imgKey }) => (
          <div key={name} className="space-y-3 rounded-xl bg-neutral-900 p-4">
            <p className="text-sm font-medium text-white">{name}</p>
            <ImageUpload label="Image" value={values[imgKey]} onFile={(f) => handleImage(f, imgKey)} aspect="portrait" />
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">Title (script)</label>
              <input type="text" value={values[scriptKey] ?? ""} onChange={(e) => setValue(scriptKey, e.target.value)} className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">Subtitle</label>
              <textarea rows={3} value={values[subtitleKey] ?? ""} onChange={(e) => setValue(subtitleKey, e.target.value)} className="w-full resize-y rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
