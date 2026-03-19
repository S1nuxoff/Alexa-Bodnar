"use client";
import { Star, Save, Check } from "lucide-react";
import useSectionContent from "../_lib/useSectionContent";
import ImageUpload from "../_components/ImageUpload";
import { uploadPhoto } from "../_lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

export default function HeroPage() {
  const { values, setValue, saving, savedAt, saveAll } = useSectionContent("hero");

  async function handleImage(file: File) {
    const photo = await uploadPhoto(file, "hero");
    setValue("hero_bg_url", `${API_BASE}${photo.url}`);
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Star className="text-neutral-400" size={20} />
          <h1 className="text-xl font-semibold text-white">Hero</h1>
        </div>
        <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50">
          {saving ? <><Save size={14} /> Saving...</> : savedAt ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save all</>}
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-400">Content</h2>
        <ImageUpload label="Background image" value={values.hero_bg_url} onFile={handleImage} />
        <div className="rounded-xl bg-neutral-900 p-4">
          <label className="mb-3 block text-xs uppercase tracking-wider text-neutral-500">Button</label>
          <div className="flex flex-col gap-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-600">Button text</label>
              <input type="text" value={values.hero_button_text ?? ""} onChange={(e) => setValue("hero_button_text", e.target.value)} placeholder="Book Now" className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-600">Button URL</label>
              <input type="text" value={values.hero_button_url ?? ""} onChange={(e) => setValue("hero_button_url", e.target.value)} placeholder="#contacts" className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
