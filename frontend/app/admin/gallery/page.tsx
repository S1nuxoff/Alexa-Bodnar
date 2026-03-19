"use client";
import { useEffect, useState } from "react";
import { getGallery, uploadPhoto, updatePhoto, deletePhoto, GalleryPhoto } from "../_lib/api";
import useSectionContent from "../_lib/useSectionContent";
import { Camera, Upload, Trash2, Eye, EyeOff, Save, Check } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:8000";

export default function GalleryPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const { values, setValue, saving, savedAt, saveAll } = useSectionContent("gallery");

  useEffect(() => {
    getGallery().then((all) => setPhotos(all.filter((p) => p.category === "gallery")));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const photo = await uploadPhoto(file, "gallery");
        setPhotos((p) => [...p, photo]);
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function toggleActive(photo: GalleryPhoto) {
    const updated = await updatePhoto(photo.id, { is_active: !photo.is_active });
    setPhotos((p) => p.map((ph) => (ph.id === photo.id ? updated : ph)));
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this image?")) return;
    await deletePhoto(id);
    setPhotos((p) => p.filter((ph) => ph.id !== id));
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="text-neutral-400" size={20} />
          <h1 className="text-xl font-semibold text-white">Gallery</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={saveAll} disabled={saving} className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50">{saving ? <><Save size={14} /> Saving...</> : savedAt ? <><Check size={14} /> Saved</> : <><Save size={14} /> Save</>}</button>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-600">
            <Upload size={14} />
            {uploading ? "Uploading..." : "Upload images"}
            <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-xl bg-neutral-900 p-4">
        <h2 className="text-xs uppercase tracking-wider text-neutral-400">See more button</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">Button text</label>
            <input type="text" value={values.gallery_button_text ?? ""} onChange={(e) => setValue("gallery_button_text", e.target.value)} placeholder="Portfolio" className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">Button URL</label>
            <input type="text" value={values.gallery_button_url ?? ""} onChange={(e) => setValue("gallery_button_url", e.target.value)} placeholder="#portfolio" className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20" />
          </div>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="rounded-2xl bg-neutral-900 p-12 text-center">
          <Camera className="mx-auto mb-3 text-neutral-600" size={32} />
          <p className="text-sm text-neutral-500">No images yet. Upload the first one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-neutral-900">
              <img src={`${API_BASE}${photo.url}`} alt="" className={`h-full w-full object-cover ${!photo.is_active ? "opacity-40" : ""}`} />
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                <button onClick={() => toggleActive(photo)} className="rounded-md bg-white/10 p-1.5 text-white backdrop-blur transition-colors hover:bg-white/20" title={photo.is_active ? "Hide" : "Show"}>{photo.is_active ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                <button onClick={() => handleDelete(photo.id)} className="rounded-md bg-white/10 p-1.5 text-red-400 backdrop-blur transition-colors hover:bg-white/20" title="Delete"><Trash2 size={14} /></button>
              </div>
              {!photo.is_active && <span className="absolute left-1.5 top-1.5 rounded-full bg-neutral-800/80 px-1.5 py-0.5 text-[10px] text-neutral-300">Hidden</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
