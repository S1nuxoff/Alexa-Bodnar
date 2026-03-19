"use client";
import { useRef } from "react";
import { Upload, ImageIcon } from "lucide-react";

interface Props {
  label: string;
  value?: string;
  onFile: (file: File) => void;
  aspect?: "video" | "square" | "portrait";
}

export default function ImageUpload({ label, value, onFile, aspect = "video" }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspect === "square" ? "aspect-square" : aspect === "portrait" ? "aspect-[3/4]" : "aspect-video";

  return (
    <div className="rounded-xl bg-neutral-900 p-4">
      <label className="mb-3 block text-xs uppercase tracking-wider text-neutral-500">{label}</label>
      <div
        className={`${aspectClass} relative w-48 cursor-pointer overflow-hidden rounded-lg bg-neutral-800 group`}
        onClick={() => ref.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Upload size={20} className="text-white" />
              <span className="text-xs font-medium uppercase tracking-wider text-white">Change image</span>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-neutral-700 transition-colors hover:border-neutral-500">
            <ImageIcon size={28} className="text-neutral-600" />
            <span className="text-xs uppercase tracking-wider text-neutral-500">Upload image</span>
          </div>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
      />
    </div>
  );
}
