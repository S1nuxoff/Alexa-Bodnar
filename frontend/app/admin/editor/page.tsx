"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, Check, Monitor, Upload, Trash2, Eye, EyeOff, PanelsTopLeft, LogOut, ArrowLeft } from "lucide-react";
import { getContent, createContent, updateContent, deleteContent, getServices, getGallery, uploadPhoto, updatePhoto, deletePhoto } from "../_lib/api";
import type { Service, GalleryPhoto } from "../_lib/api";

import HeroSection from "../../_sections/HeroSection";
import AboutSection from "../../_sections/AboutSection";
import PhotoCardSection from "../../_sections/PhotoCardSection";
import PortfolioSection from "../../_sections/PortfolioSection";
import DecorBlock from "../../_sections/DecorBlock";
import GallerySection from "../../_sections/GallerySection";
import WeddingSection from "../../_sections/WeddingSection";
import InvestmentsSection from "../../_sections/InvestmentsSection";
import GiftCardSection from "../../_sections/GiftCardSection";
import FAQSection from "../../_sections/FAQSection";
import ContactSection from "../../_sections/ContactSection";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ?? "";

type C = Record<string, string>;
type FH = (k: string) => boolean;
type FT = (k: string) => void;
type SectionId = "hero" | "about" | "photocard" | "portfolio" | "decor" | "gallery" | "wedding" | "investments" | "gifts" | "faq" | "contacts";

// â”€â”€â”€ Field components with visibility toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FInput({ label, value, onChange, placeholder, fh, ft, fk }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
  fh?: FH; ft?: FT; fk?: string;
}) {
  const hidden = fh && fk ? fh(fk) : false;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className={`text-[10px] uppercase tracking-wider transition-colors ${hidden ? "text-neutral-700 line-through" : "text-neutral-500"}`}>{label}</label>
        {ft && fk && (
          <button onClick={() => ft(fk)} className={`p-0.5 transition-colors ${hidden ? "text-neutral-500 hover:text-white" : "text-neutral-700 hover:text-neutral-400"}`}>
            {hidden ? <EyeOff size={11} /> : <Eye size={11} />}
          </button>
        )}
      </div>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-neutral-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20 transition-opacity ${hidden ? "opacity-30" : ""}`} />
    </div>
  );
}

function FTextarea({ label, value, onChange, fh, ft, fk }: {
  label: string; value: string; onChange: (v: string) => void;
  fh?: FH; ft?: FT; fk?: string;
}) {
  const hidden = fh && fk ? fh(fk) : false;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className={`text-[10px] uppercase tracking-wider transition-colors ${hidden ? "text-neutral-700 line-through" : "text-neutral-500"}`}>{label}</label>
        {ft && fk && (
          <button onClick={() => ft(fk)} className={`p-0.5 transition-colors ${hidden ? "text-neutral-500 hover:text-white" : "text-neutral-700 hover:text-neutral-400"}`}>
            {hidden ? <EyeOff size={11} /> : <Eye size={11} />}
          </button>
        )}
      </div>
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-neutral-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20 resize-y transition-opacity ${hidden ? "opacity-30" : ""}`} />
    </div>
  );
}

function FImage({ label, value, onFile, portrait, fh, ft, fk }: {
  label: string; value?: string; onFile: (f: File) => void; portrait?: boolean;
  fh?: FH; ft?: FT; fk?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const hidden = fh && fk ? fh(fk) : false;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className={`text-[10px] uppercase tracking-wider transition-colors ${hidden ? "text-neutral-700 line-through" : "text-neutral-500"}`}>{label}</label>
        {ft && fk && (
          <button onClick={() => ft(fk)} className={`p-0.5 transition-colors ${hidden ? "text-neutral-500 hover:text-white" : "text-neutral-700 hover:text-neutral-400"}`}>
            {hidden ? <EyeOff size={11} /> : <Eye size={11} />}
          </button>
        )}
      </div>
      <div
        className={`bg-neutral-800 rounded-lg overflow-hidden relative group cursor-pointer transition-opacity ${portrait ? "aspect-[3/4] w-20" : "aspect-video w-full"} ${hidden ? "opacity-30" : ""}`}
        onClick={() => ref.current?.click()}
      >
        {value ? (
          <>
            <img src={value} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] uppercase tracking-wider">Change</div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-600 text-xs border-2 border-dashed border-neutral-700 rounded-lg">Image</div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
    </div>
  );
}

function FLink({ label }: { label: string }) {
  return <p className="text-xs text-neutral-500 italic">{label}</p>;
}

// â”€â”€â”€ Section panels â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type PanelBase = { c: C; set: (k: string, v: string) => void; upload: (f: File, cat: string, key: string) => void; fh: FH; ft: FT };
type PanelDyn  = PanelBase & { createField: (k: string, v: string, s: string) => Promise<void>; deleteField: (k: string) => Promise<void> };

function HeroPanel({ c, set, upload, fh, ft }: PanelBase) {
  return (
    <div className="flex flex-col gap-4">
      <FImage label="Background image" value={c.hero_bg_url} onFile={(f) => upload(f, "hero", "hero_bg_url")} fh={fh} ft={ft} fk="hero_bg_url" />
      <FInput label="Button text" value={c.hero_button_text ?? ""} onChange={(v) => set("hero_button_text", v)} placeholder="Book Now" fh={fh} ft={ft} fk="hero_button_text" />
      <FInput label="Button URL" value={c.hero_button_url ?? ""} onChange={(v) => set("hero_button_url", v)} placeholder="#contacts" fh={fh} ft={ft} fk="hero_button_url" />
    </div>
  );
}

function AboutPanel({ c, set, upload, fh, ft, createField, deleteField }: PanelDyn) {
  const paras = Object.keys(c).filter((k) => /^about_p\d+$/.test(k)).sort((a, b) =>
    parseInt(a.match(/\d+/)![0]) - parseInt(b.match(/\d+/)![0])
  );
  const maxN = paras.length > 0 ? Math.max(...paras.map((k) => parseInt(k.match(/\d+/)![0]))) : 0;

  return (
    <div className="flex flex-col gap-4">
      <FImage label="Image" value={c.about_photo_url} onFile={(f) => upload(f, "about", "about_photo_url")} portrait fh={fh} ft={ft} fk="about_photo_url" />
      <FInput label="Title" value={c.about_title ?? ""} onChange={(v) => set("about_title", v)} fh={fh} ft={ft} fk="about_title" />
      <FInput label="Subtitle" value={c.about_intro ?? ""} onChange={(v) => set("about_intro", v)} fh={fh} ft={ft} fk="about_intro" />
      {paras.map((k) => (
        <div key={k} className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className={`text-[10px] uppercase tracking-wider ${fh(k) ? "text-neutral-700 line-through" : "text-neutral-500"}`}>Paragraph {k.replace("about_p", "")}</label>
            <div className="flex gap-1">
              <button onClick={() => ft(k)} className={`p-0.5 ${fh(k) ? "text-neutral-500 hover:text-white" : "text-neutral-700 hover:text-neutral-400"}`}>{fh(k) ? <EyeOff size={11} /> : <Eye size={11} />}</button>
              <button onClick={async () => { if (!confirm("Delete this paragraph?")) return; await deleteField(k); }} className="p-0.5 text-neutral-700 hover:text-red-400"><Trash2 size={11} /></button>
            </div>
          </div>
          <textarea rows={3} value={c[k] ?? ""} onChange={(e) => set(k, e.target.value)}
            className={`w-full bg-neutral-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20 resize-y ${fh(k) ? "opacity-30" : ""}`} />
        </div>
      ))}
      <button onClick={() => createField(`about_p${maxN + 1}`, "", "about")}
        className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 hover:text-white border border-dashed border-neutral-700 hover:border-neutral-500 rounded-lg py-2 transition-colors">
        <Upload size={11} /> Add paragraph
      </button>
    </div>
  );
}

function PhotoCardPanel({ c, set, upload, fh, ft }: PanelBase) {
  const fields: [string, string][] = [
    ["photocard_line1", "Line 1 (WEDDING)"], ["photocard_line2", "Line 2 - script"],
    ["photocard_line3", "Line 3 (FAMILIES)"], ["photocard_tagline1", "Tagline 1"], ["photocard_tagline2", "Tagline 2"],
  ];
  return (
    <div className="flex flex-col gap-4">
      {fields.map(([k, l]) => <FInput key={k} label={l} value={c[k] ?? ""} onChange={(v) => set(k, v)} fh={fh} ft={ft} fk={k} />)}
      <FImage label="Background" value={c.photocard_bg_url} onFile={(f) => upload(f, "photocard", "photocard_bg_url")} fh={fh} ft={ft} fk="photocard_bg_url" />
      <FImage label="Portrait" value={c.photocard_portrait_url} onFile={(f) => upload(f, "photocard", "photocard_portrait_url")} portrait fh={fh} ft={ft} fk="photocard_portrait_url" />
    </div>
  );
}

function PortfolioPanel({ c, set, upload, fh, ft }: PanelBase) {
  const cards = [
    { name: "Wedding",    s: "portfolio_wedding_script",    sub: "portfolio_wedding_subtitle",    img: "portfolio_wedding_image" },
    { name: "Engagement", s: "portfolio_engagement_script", sub: "portfolio_engagement_subtitle", img: "portfolio_engagement_image" },
    { name: "Families",   s: "portfolio_families_script",   sub: "portfolio_families_subtitle",   img: "portfolio_families_image" },
  ];
  return (
    <div className="flex flex-col gap-5">
      {cards.map(({ name, s, sub, img }) => (
        <div key={name} className="flex flex-col gap-3 border-t border-neutral-800 pt-4 first:border-0 first:pt-0">
          <p className="text-xs text-neutral-400 font-medium uppercase tracking-wider">{name}</p>
          <FImage label="Image" value={c[img]} onFile={(f) => upload(f, "portfolio", img)} portrait fh={fh} ft={ft} fk={img} />
          <FInput label="Title (script)" value={c[s] ?? ""} onChange={(v) => set(s, v)} fh={fh} ft={ft} fk={s} />
          <FTextarea label="Subtitle" value={c[sub] ?? ""} onChange={(v) => set(sub, v)} fh={fh} ft={ft} fk={sub} />
        </div>
      ))}
    </div>
  );
}

function DecorPanel({ c, set, fh, ft }: PanelBase) {
  return (
    <div className="flex flex-col gap-4">
      <FInput label="Text" value={c.decor_text ?? ""} onChange={(v) => set("decor_text", v)} fh={fh} ft={ft} fk="decor_text" />
    </div>
  );
}

const GALLERY_PAGE = 12;

function GalleryPanel({ c, set, upload, fh, ft, photos, setPhotos }: PanelBase & {
  photos: GalleryPhoto[]; setPhotos: React.Dispatch<React.SetStateAction<GalleryPhoto[]>>;
}) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const visible = photos.slice(0, page * GALLERY_PAGE);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const photo = await uploadPhoto(file, "gallery");
        setPhotos((p) => [...p, photo]);
      }
    } finally { setUploading(false); e.target.value = ""; }
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
    <div className="flex flex-col gap-4">
      <FImage label="CTA background (parallax)" value={c.gallery_cta_bg_url} onFile={(f) => upload(f, "gallery_cta", "gallery_cta_bg_url")} fh={fh} ft={ft} fk="gallery_cta_bg_url" />
      <FInput label="Button text" value={c.gallery_button_text ?? ""} onChange={(v) => set("gallery_button_text", v)} placeholder="Portfolio" fh={fh} ft={ft} fk="gallery_button_text" />
      <FInput label="Button URL" value={c.gallery_button_url ?? ""} onChange={(v) => set("gallery_button_url", v)} placeholder="#portfolio" fh={fh} ft={ft} fk="gallery_button_url" />
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] text-neutral-500 uppercase tracking-wider">Gallery images</label>
          <button onClick={() => uploadRef.current?.click()} disabled={uploading}
            className="flex items-center gap-1 text-[10px] px-2 py-1 bg-neutral-700 text-neutral-300 rounded-md hover:bg-neutral-600 transition-colors disabled:opacity-50">
            <Upload size={10} /> {uploading ? "..." : "Add"}
          </button>
          <input ref={uploadRef} type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleUpload} />
        </div>
        {photos.length === 0 ? (
          <p className="text-neutral-600 text-xs text-center py-4">No images yet</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1.5">
              {visible.map((photo) => (
                <div key={photo.id} className="relative group aspect-square rounded-md overflow-hidden bg-neutral-800">
                  <img src={`${API_BASE}${photo.thumb_url ?? photo.url}`} alt="" loading="lazy" decoding="async" className={`w-full h-full object-cover ${!photo.is_active ? "opacity-40" : ""}`} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button onClick={() => toggleActive(photo)} className="p-1 bg-white/10 rounded text-white hover:bg-white/20">{photo.is_active ? <EyeOff size={11} /> : <Eye size={11} />}</button>
                    <button onClick={() => handleDelete(photo.id)} className="p-1 bg-white/10 rounded text-red-400 hover:bg-white/20"><Trash2 size={11} /></button>
                  </div>
                </div>
              ))}
            </div>
            {visible.length < photos.length && (
              <button onClick={() => setPage((p) => p + 1)}
                className="w-full mt-2 py-1.5 text-xs text-neutral-500 hover:text-white border border-dashed border-neutral-700 hover:border-neutral-500 rounded-lg transition-colors">
                Show more ({photos.length - visible.length})
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function WeddingPanel({ c, set, upload, fh, ft, services }: PanelBase & { services: Service[] }) {
  return (
    <div className="flex flex-col gap-4">
      <FImage label="Background image" value={c.wedding_bg_url} onFile={(f) => upload(f, "wedding_bg", "wedding_bg_url")} fh={fh} ft={ft} fk="wedding_bg_url" />
      <FInput label="Title" value={c.wedding_price_title ?? ""} onChange={(v) => set("wedding_price_title", v)} fh={fh} ft={ft} fk="wedding_price_title" />
      <FInput label="begin at" value={c.wedding_begin_at ?? ""} onChange={(v) => set("wedding_begin_at", v)} fh={fh} ft={ft} fk="wedding_begin_at" />
      <FInput label="Price" value={c.wedding_price ?? ""} onChange={(v) => set("wedding_price", v)} fh={fh} ft={ft} fk="wedding_price" />
      <FInput label="Duration" value={c.wedding_duration ?? ""} onChange={(v) => set("wedding_duration", v)} fh={fh} ft={ft} fk="wedding_duration" />
      <FTextarea label="Package description 1" value={c.wedding_p1 ?? ""} onChange={(v) => set("wedding_p1", v)} fh={fh} ft={ft} fk="wedding_p1" />
      <FTextarea label="Package description 2" value={c.wedding_p2 ?? ""} onChange={(v) => set("wedding_p2", v)} fh={fh} ft={ft} fk="wedding_p2" />
      <div className="flex flex-col gap-1">
        <label className="text-[10px] uppercase tracking-wider text-neutral-500">Button links to service</label>
        <select
          value={c.wedding_button_service ?? ""}
          onChange={(e) => set("wedding_button_service", e.target.value)}
          className="w-full bg-neutral-800 text-white rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-white/20"
        >
          <option value="">- not linked -</option>
          {services.filter((s) => s.is_active).map((s) => (
            <option key={s.id} value={s.title}>{s.title}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function InvestmentsPanel({ c, set, upload, fh, ft }: PanelBase) {
  const fields: [string, string, string][] = [
    ["investments_title", "Title", "Investments"],
    ["investments_subtitle", "Subtitle", "Every story is unique..."],
    ["investments_footer", "Footer text", "For full details..."],
    ["investments_button_text", "Button text", "Book Now"],
    ["investments_button_url", "Button URL", "#contacts"],
  ];
  return (
    <div className="flex flex-col gap-4">
      <FImage label="Background image (parallax)" value={c.investments_bg_url} onFile={(f) => upload(f, "investments", "investments_bg_url")} fh={fh} ft={ft} fk="investments_bg_url" />
      {fields.map(([k, l, p]) => <FInput key={k} label={l} value={c[k] ?? ""} onChange={(v) => set(k, v)} placeholder={p} fh={fh} ft={ft} fk={k} />)}
      <FLink label="Manage service cards and prices in the Services tab" />
    </div>
  );
}

function GiftsPanel({ c, set, upload, fh, ft }: PanelBase) {
  return (
    <div className="flex flex-col gap-4">
      <FImage label="Image" value={c.gift_photo_url} onFile={(f) => upload(f, "gifts", "gift_photo_url")} portrait fh={fh} ft={ft} fk="gift_photo_url" />
      <FTextarea label="Paragraph 1" value={c.gift_p1 ?? ""} onChange={(v) => set("gift_p1", v)} fh={fh} ft={ft} fk="gift_p1" />
      <FTextarea label="Paragraph 2" value={c.gift_p2 ?? ""} onChange={(v) => set("gift_p2", v)} fh={fh} ft={ft} fk="gift_p2" />
    </div>
  );
}

function FAQPanel({ c, set, fh, ft, createField, deleteField }: PanelDyn) {
  const nums = Object.keys(c).filter((k) => /^faq_\d+_q$/.test(k))
    .map((k) => parseInt(k.match(/\d+/)![0])).sort((a, b) => a - b);
  const maxN = nums.length > 0 ? Math.max(...nums) : 0;

  async function addPair() {
    await createField(`faq_${maxN + 1}_q`, "", "faq");
    await createField(`faq_${maxN + 1}_a`, "", "faq");
  }

  return (
    <div className="flex flex-col gap-4">
      {nums.map((n) => (
        <div key={n} className="flex flex-col gap-2 border-t border-neutral-800 pt-3 first:border-0 first:pt-0">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Question {n}</span>
            <button onClick={async () => { if (!confirm("Delete this item?")) return; await deleteField(`faq_${n}_q`); await deleteField(`faq_${n}_a`); }}
              className="p-0.5 text-neutral-700 hover:text-red-400"><Trash2 size={11} /></button>
          </div>
          <FInput label="Question" value={c[`faq_${n}_q`] ?? ""} onChange={(v) => set(`faq_${n}_q`, v)} fh={fh} ft={ft} fk={`faq_${n}_q`} />
          <FTextarea label="Answer" value={c[`faq_${n}_a`] ?? ""} onChange={(v) => set(`faq_${n}_a`, v)} fh={fh} ft={ft} fk={`faq_${n}_a`} />
        </div>
      ))}
      <button onClick={addPair} className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 hover:text-white border border-dashed border-neutral-700 hover:border-neutral-500 rounded-lg py-2 transition-colors">
        <Upload size={11} /> Add question
      </button>
    </div>
  );
}

// Predefined form fields (name/email/phone are always required â€” not listed here)
const FORM_FIELDS_PREDEFINED = [
  { key: "partner_name", label: "Partner's Name" },
  { key: "service", label: "Service selection" },
  { key: "session_date", label: "Session date" },
  { key: "venue", label: "Venue" },
  { key: "budget", label: "Budget" },
  { key: "message", label: "Message" },
  { key: "how_found", label: "How they found you" },
];

function ContactsPanel({ c, set, upload, fh, ft, createField, deleteField }: PanelDyn) {
  // custom fields: form_custom_N_label
  const customNums = Object.keys(c)
    .filter((k) => /^form_custom_\d+_label$/.test(k))
    .map((k) => parseInt(k.match(/\d+/)![0]))
    .sort((a, b) => a - b);
  const maxN = customNums.length > 0 ? Math.max(...customNums) : 0;

  function isFormFieldHidden(key: string) {
    return c[`form_hide_${key}`] === "1";
  }
  function toggleFormField(key: string) {
    set(`form_hide_${key}`, isFormFieldHidden(key) ? "" : "1");
  }

  async function addCustomField() {
    await createField(`form_custom_${maxN + 1}_label`, "New question", "contacts");
    await createField(`form_custom_${maxN + 1}_type`, "text", "contacts");
  }

  async function deleteCustomField(n: number) {
    if (!confirm("Delete this field?")) return;
    await deleteField(`form_custom_${n}_label`);
    await deleteField(`form_custom_${n}_type`);
    // also clear hide flag if exists
    if (c[`form_hide_custom_${n}`]) await deleteField(`form_hide_custom_${n}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <FImage label="Image" value={c.contact_photo_url} onFile={(f) => upload(f, "contacts", "contact_photo_url")} portrait fh={fh} ft={ft} fk="contact_photo_url" />
      <FTextarea label="Paragraph 1" value={c.contact_info_p1 ?? ""} onChange={(v) => set("contact_info_p1", v)} fh={fh} ft={ft} fk="contact_info_p1" />
      <FTextarea label="Paragraph 2" value={c.contact_info_p2 ?? ""} onChange={(v) => set("contact_info_p2", v)} fh={fh} ft={ft} fk="contact_info_p2" />
      <FTextarea label="Paragraph 3" value={c.contact_info_p3 ?? ""} onChange={(v) => set("contact_info_p3", v)} fh={fh} ft={ft} fk="contact_info_p3" />
      <FInput label="Instagram URL" value={c.contact_instagram_url ?? ""} onChange={(v) => set("contact_instagram_url", v)} fh={fh} ft={ft} fk="contact_instagram_url" />
      <FInput label="Instagram label" value={c.contact_instagram_label ?? ""} onChange={(v) => set("contact_instagram_label", v)} fh={fh} ft={ft} fk="contact_instagram_label" />
      <FInput label="Address" value={c.contact_address ?? ""} onChange={(v) => set("contact_address", v)} fh={fh} ft={ft} fk="contact_address" />
      <FInput label="Phone" value={c.contact_phone ?? ""} onChange={(v) => set("contact_phone", v)} fh={fh} ft={ft} fk="contact_phone" />
      <FInput label="Email" value={c.contact_email ?? ""} onChange={(v) => set("contact_email", v)} fh={fh} ft={ft} fk="contact_email" />

      {/* â”€â”€ Form fields management â”€â”€ */}
      <div className="border-t border-neutral-800 pt-4 flex flex-col gap-3">
        <p className="text-[10px] uppercase tracking-wider text-neutral-500">Form fields</p>

        {/* Fixed required fields â€” just labels, can't hide */}
        {[["Name", "Always"], ["Email", "Always"], ["Phone", "Always"]].map(([label, note]) => (
          <div key={label} className="flex items-center justify-between px-3 py-2 bg-neutral-800/50 rounded-lg">
            <span className="text-sm text-neutral-400">{label}</span>
            <span className="text-[10px] text-neutral-700 uppercase tracking-wider">{note}</span>
          </div>
        ))}

        {/* Predefined hideable fields */}
        {FORM_FIELDS_PREDEFINED.map(({ key, label }) => {
          const hidden = isFormFieldHidden(key);
          return (
            <div key={key} className="flex flex-col gap-2">
              <div className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${hidden ? "bg-neutral-800/30" : "bg-neutral-800/50"}`}>
                <span className={`text-sm transition-colors ${hidden ? "text-neutral-600 line-through" : "text-neutral-300"}`}>{label}</span>
                <button onClick={() => toggleFormField(key)}
                  className={`p-1 rounded transition-colors ${hidden ? "text-neutral-600 hover:text-white" : "text-neutral-400 hover:text-neutral-200"}`}
                  title={hidden ? "Show" : "Hide"}>
                  {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {/* Label editor */}
              {!hidden && (
                <input
                  type="text"
                  value={c[`form_${key}_label`] ?? ""}
                  placeholder={`Field label text...`}
                  onChange={(e) => set(`form_${key}_label`, e.target.value)}
                  className="w-full bg-neutral-800 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-white/20 placeholder-neutral-600"
                />
              )}
            </div>
          );
        })}

        {/* Custom fields */}
        {customNums.map((n) => {
          const hiddenKey = `custom_${n}`;
          const hidden = isFormFieldHidden(hiddenKey);
          return (
            <div key={n} className="flex flex-col gap-2">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hidden ? "bg-neutral-800/30" : "bg-neutral-800/50"}`}>
                <span className={`flex-1 text-sm ${hidden ? "text-neutral-600 line-through" : "text-neutral-300"}`}>
                  {c[`form_custom_${n}_label`] || `Field ${n}`}
                </span>
                <button onClick={() => toggleFormField(hiddenKey)} className="p-1 text-neutral-400 hover:text-neutral-200">
                  {hidden ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
                <button onClick={() => deleteCustomField(n)} className="p-1 text-neutral-700 hover:text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
              {!hidden && (
                <div className="flex flex-col gap-1.5 pl-2">
                  <input type="text" value={c[`form_custom_${n}_label`] ?? ""} placeholder="Question text"
                    onChange={(e) => set(`form_custom_${n}_label`, e.target.value)}
                    className="w-full bg-neutral-800 text-white rounded-lg px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-white/20" />
                  <select value={c[`form_custom_${n}_type`] ?? "text"} onChange={(e) => set(`form_custom_${n}_type`, e.target.value)}
                    className="bg-neutral-800 text-neutral-400 text-xs rounded-lg px-3 py-1.5 outline-none">
                    <option value="text">Short answer (text)</option>
                    <option value="textarea">Long answer (textarea)</option>
                  </select>
                </div>
              )}
            </div>
          );
        })}

        <button onClick={addCustomField}
          className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 hover:text-white border border-dashed border-neutral-700 hover:border-neutral-500 rounded-lg py-2 transition-colors">
          <Upload size={11} /> Add question
        </button>
      </div>
    </div>
  );
}

// â”€â”€â”€ Section wrapper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Hero", about: "About", photocard: "Photo Card", portfolio: "Portfolio",
  decor: "Decor", gallery: "Gallery", wedding: "Wedding", investments: "Investments",
  gifts: "Gift Card", faq: "FAQ", contacts: "Contacts",
};

function SectionWrapper({ id, active, hidden, onSelect, onToggleHidden, children }: {
  id: SectionId; active: boolean; hidden: boolean;
  onSelect: () => void; onToggleHidden: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <div className={`pointer-events-none transition-opacity ${hidden ? "opacity-25" : ""}`}>{children}</div>
      {hidden && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">Hidden</span>
        </div>
      )}
      <div className={`absolute inset-0 cursor-pointer transition-all border-2 ${active ? "border-blue-500 bg-blue-500/5" : "border-transparent hover:border-blue-400/40 hover:bg-blue-400/3"}`} onClick={onSelect} />
      <span className={`absolute top-2 left-2 text-[11px] px-2 py-0.5 rounded font-medium z-10 pointer-events-none transition-opacity ${active ? "bg-blue-500 text-white opacity-100" : "bg-black/70 text-white opacity-0 group-hover:opacity-100"}`}>
        {SECTION_LABELS[id]}
      </span>
      <button className="absolute top-2 right-2 z-20 p-1.5 bg-black/70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
        onClick={(e) => { e.stopPropagation(); onToggleHidden(); }} title={hidden ? "Show section" : "Hide section"}>
        {hidden ? <Eye size={13} className="text-white" /> : <EyeOff size={13} className="text-white" />}
      </button>
    </div>
  );
}

// â”€â”€â”€ Main page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function EditorPage() {
  const router = useRouter();
  const [content, setContentMap] = useState<C>({});
  const [items, setItems] = useState<{ key: string; section: string }[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [active, setActive] = useState<SectionId | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    Promise.all([getContent(), getServices(), getGallery()]).then(([allContent, svc, gallery]) => {
      const map: C = {};
      allContent.forEach((i) => { if (i.value) map[i.key] = i.value.replace(/^https?:\/\/localhost:\d+/, ""); });
      setContentMap(map);
      setItems(allContent.map((i) => ({ key: i.key, section: i.section })));
      setServices(svc.filter((s) => s.is_active));
      setGalleryPhotos(gallery.filter((p) => p.category === "gallery").sort((a, b) => a.order - b.order));
    });
  }, []);

  const setField = useCallback((key: string, value: string) => {
    setContentMap((c) => ({ ...c, [key]: value }));
    setSavedAt(null);
  }, []);

  async function upload(file: File, cat: string, key: string) {
    const photo = await uploadPhoto(file, cat);
    setField(key, `${API_BASE}${photo.url}`);
  }

  async function createField(key: string, value: string, section: string) {
    const created = await createContent({ key, value, section, label: key });
    setItems((prev) => [...prev, { key: created.key, section: created.section }]);
    setContentMap((c) => ({ ...c, [key]: value }));
  }

  async function deleteField(key: string) {
    await deleteContent(key);
    setItems((prev) => prev.filter((i) => i.key !== key));
    setContentMap((c) => { const n = { ...c }; delete n[key]; return n; });
  }

  async function saveAll() {
    setSaving(true);
    try {
      const existingKeys = new Set(items.map((i) => i.key));
      await Promise.all(
        Object.entries(content).map(([key, value]) => {
          if (existingKeys.has(key)) return updateContent(key, value);
          const section = items.find((i) => i.key === key)?.section ?? key.split("_")[0];
          return createContent({ key, value, section, label: key }).then((created) => {
            setItems((prev) => [...prev, { key: created.key, section: created.section }]);
          });
        })
      );
      setSavedAt(new Date());
    } finally { setSaving(false); }
  }

  // Field visibility helpers
  const isFieldHidden = useCallback((k: string) => content[`hidden_${k}`] === "1", [content]);
  const toggleField = useCallback((k: string) => setField(`hidden_${k}`, content[`hidden_${k}`] === "1" ? "" : "1"), [content, setField]);

  // Section visibility helpers
  const isSectionHidden = useCallback((id: SectionId) => content[`section_${id}_hidden`] === "1", [content]);
  const toggleSection = useCallback((id: SectionId) => setField(`section_${id}_hidden`, isSectionHidden(id) ? "" : "1"), [content, setField, isSectionHidden]);

  // Content with hidden fields emptied (for preview)
  const visibleContent = useMemo(() => {
    const vc: C = {};
    for (const [k, v] of Object.entries(content)) {
      if (k.startsWith("hidden_")) continue;
      vc[k] = content[`hidden_${k}`] === "1" ? "" : v;
    }
    return vc;
  }, [content]);

  const panelProps: PanelBase = { c: content, set: setField, upload, fh: isFieldHidden, ft: toggleField };
  const dynProps = { createField, deleteField };

  function selectSection(id: SectionId) {
    setActive(id);
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* â”€â”€ Left panel â”€â”€ */}
      <div className="w-[560px] shrink-0 bg-neutral-900 border-r border-neutral-800 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <Link href="/admin/dashboard"
              className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors text-sm">
              <ArrowLeft size={15} /> Back
            </Link>
          </div>
          <button onClick={saveAll} disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f4a7b9]/15 text-[#f4a7b9] hover:bg-[#f4a7b9]/25 font-medium rounded-lg text-xs disabled:opacity-50 transition-colors">
            {saving ? <><Save size={12} /> Saving</> : savedAt ? <><Check size={12} /> Saved</> : <><Save size={12} /> Save</>}
          </button>
        </div>

        {/* Section label */}
        <div className="px-4 py-2.5 border-b border-neutral-800 shrink-0">
          <span className="text-xs text-neutral-500">
            {active ? SECTION_LABELS[active] : "Click a section in the preview"}
          </span>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto p-4">
            {!active && (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
                <Monitor size={32} className="text-neutral-700" />
                <p className="text-neutral-500 text-sm">Click any section<br />in the preview</p>
              </div>
            )}
            {active && (
              <button onClick={() => toggleSection(active)}
                className={`w-full flex items-center justify-center gap-2 py-2 mb-4 rounded-lg text-xs font-medium transition-colors ${isSectionHidden(active) ? "bg-neutral-700 text-white hover:bg-neutral-600" : "bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700"}`}>
                {isSectionHidden(active) ? <><Eye size={13} /> Show section</> : <><EyeOff size={13} /> Hide section</>}
              </button>
            )}
            {active === "hero"        && <HeroPanel {...panelProps} />}
            {active === "about"       && <AboutPanel {...panelProps} {...dynProps} />}
            {active === "photocard"   && <PhotoCardPanel {...panelProps} />}
            {active === "portfolio"   && <PortfolioPanel {...panelProps} />}
            {active === "decor"       && <DecorPanel {...panelProps} />}
            {active === "gallery"     && <GalleryPanel {...panelProps} photos={galleryPhotos} setPhotos={setGalleryPhotos} />}
            {active === "wedding"     && <WeddingPanel {...panelProps} services={services} />}
            {active === "investments" && <InvestmentsPanel {...panelProps} />}
            {active === "gifts"       && <GiftsPanel {...panelProps} />}
            {active === "faq"         && <FAQPanel {...panelProps} {...dynProps} />}
            {active === "contacts"    && <ContactsPanel {...panelProps} {...dynProps} />}
          </div>
      </div>

      {/* â”€â”€ Preview â”€â”€ */}
      <div className="flex-1 overflow-auto bg-neutral-950">
        <div style={{ zoom: 0.6 }}>
          <div className="min-w-[1280px] bg-white">
            {(["hero","about","photocard","portfolio","decor","gallery","wedding","investments","gifts","faq","contacts"] as SectionId[]).map((id) => (
              <SectionWrapper key={id} id={id} active={active === id} hidden={isSectionHidden(id)} onSelect={() => selectSection(id)} onToggleHidden={() => toggleSection(id)}>
                {id === "hero"        && <HeroSection content={visibleContent} />}
                {id === "about"       && <AboutSection content={visibleContent} />}
                {id === "photocard"   && <PhotoCardSection content={visibleContent} />}
                {id === "portfolio"   && <PortfolioSection content={visibleContent} />}
                {id === "decor"       && <DecorBlock content={visibleContent} />}
                {id === "gallery"     && <GallerySection photos={galleryPhotos.filter(p => p.is_active).map(p => p.url)} content={visibleContent} />}
                {id === "wedding"     && <WeddingSection content={visibleContent} />}
                {id === "investments" && <InvestmentsSection services={services} content={visibleContent} />}
                {id === "gifts"       && <GiftCardSection content={visibleContent} />}
                {id === "faq"         && <FAQSection content={visibleContent} />}
                {id === "contacts"    && <ContactSection content={visibleContent} />}
              </SectionWrapper>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
