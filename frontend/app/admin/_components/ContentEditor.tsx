"use client";
import { useState } from "react";
import { updateContent, ContentItem } from "../_lib/api";
import { Save, Check } from "lucide-react";

interface Props {
  items: ContentItem[];
  onUpdate: (updated: ContentItem) => void;
}

export default function ContentEditor({ items, onUpdate }: Props) {
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(items.map((i) => [i.key, i.value]))
  );

  async function save(item: ContentItem) {
    setSaving(item.key);
    try {
      const updated = await updateContent(item.key, values[item.key]);
      onUpdate(updated);
      setSaved(item.key);
      setTimeout(() => setSaved(null), 2000);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.key} className="rounded-xl bg-neutral-900 p-4">
          <label className="mb-2 block text-xs uppercase tracking-wider text-neutral-500">
            {item.label}
          </label>
          {(values[item.key]?.length ?? 0) > 80 ? (
            <textarea
              rows={3}
              value={values[item.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [item.key]: e.target.value }))}
              className="w-full resize-y rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
            />
          ) : (
            <input
              type="text"
              value={values[item.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [item.key]: e.target.value }))}
              className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
            />
          )}
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => save(item)}
              disabled={saving === item.key}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50"
            >
              {saved === item.key ? (
                <><Check size={12} /> Saved</>
              ) : (
                <><Save size={12} /> Save</>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
