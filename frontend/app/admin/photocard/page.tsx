"use client";
import { Image, Save, Check } from "lucide-react";
import useSectionContent from "../_lib/useSectionContent";
import ImageUpload from "../_components/ImageUpload";
import { uploadPhoto } from "../_lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

const TEXT_FIELDS = [
  { key: "photocard_line1", label: "Line 1 (WEDDING)" },
  { key: "photocard_line2", label: "Line 2 - script (Engagement)" },
  { key: "photocard_line3", label: "Line 3 (FAMILIES)" },
  { key: "photocard_tagline1", label: "Tagline line 1" },
  { key: "photocard_tagline2", label: "Tagline line 2" },
];

export default function PhotoCardPage() {
  const { values, setValue, saving, savedAt, saveAll } = useSectionContent("photocard");

  async function handleImage(file: File, key: string) {
    const photo = await uploadPhoto(file, "photocard");
    setValue(key, `${API_BASE}${photo.url}`);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image className="text-neutral-400" size={20} />
          <h1 className="text-xl font-semibold text-white">Photo Card</h1>
        </div>
        <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50">{saving ? <><Save size={14} /> Saving...</> : savedAt ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save all</>}</button>
      </div>
      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-400">Editing</h2>
        {TEXT_FIELDS.map(({ key, label }) => (
          <div key={key} className="rounded-xl bg-neutral-900 p-4">
            <label className="mb-2 block text-xs uppercase tracking-wider text-neutral-500">{label}</label>
            <input type="text" value={values[key] ?? ""} onChange={(e) => setValue(key, e.target.value)} className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
          </div>
        ))}
        <ImageUpload label="Background" value={values.photocard_bg_url} onFile={(f) => handleImage(f, "photocard_bg_url")} />
        <ImageUpload label="Portrait" value={values.photocard_portrait_url} onFile={(f) => handleImage(f, "photocard_portrait_url")} aspect="portrait" />
      </div>
    </div>
  );
}
