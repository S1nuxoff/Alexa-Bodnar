"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "../_components/Reveal";

type C = Record<string, string>;

interface Service { id: number; title: string; is_active: boolean; }

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const inputCls = "bg-[rgba(255,255,255,0.8)] border-b-2 border-white h-[50px] px-3 w-full outline-none focus:border-[#141414] transition-colors font-serif text-[15px]";
const textareaCls = "bg-[rgba(255,255,255,0.8)] border-b-2 border-white min-h-[150px] px-3 py-3 w-full outline-none focus:border-[#141414] transition-colors font-serif text-[15px] resize-none";
const weekdayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Default labels for predefined fields
export const FORM_FIELD_DEFAULTS: Record<string, string> = {
  partner_name:  "Your Partner's Full Name:",
  service:       "Service",
  session_date:  "Estimated Session Date *",
  venue:         "Venue and Location:",
  budget:        "Estimated photography budget",
  message:       "I'd be so happy to learn more about you and your big day! What's your aesthetic, your dream vibe, and the details that inspire you?",
  how_found:     "How did you find me?",
};
 
function fieldLabel(key: string, content: C): string {
  return content[`form_${key}_label`] || FORM_FIELD_DEFAULTS[key] || key;
}

function isHidden(key: string, content: C): boolean {
  return content[`form_hide_${key}`] === "1";
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseISODate(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string): string {
  const date = parseISODate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (!/^[\d+\s()\-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const selectedDate = useMemo(() => parseISODate(value), [value]);
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState<Date>(
    selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handlePointerDown);
    }

    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!selectedDate) return;
    setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  }, [value, selectedDate]);

  const monthLabel = visibleMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const monthStart = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + index);
    return date;
  });
  const prevMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
  const canGoPrev = prevMonth >= new Date(today.getFullYear(), today.getMonth(), 1);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-[50px] w-full items-center justify-between border-b-2 border-white bg-[rgba(255,255,255,0.8)] px-4 text-left font-serif text-[15px] text-[#141414] outline-none transition-colors hover:border-[#cfcfcf] focus:border-[#141414]"
      >
        <span className={value ? "text-[#141414]" : "text-[rgba(0,0,0,0.54)]"}>
          {value ? formatDisplayDate(value) : "Select a date"}
        </span>
        <CalendarDays size={18} className="text-[#141414]" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+10px)] z-20 overflow-hidden border border-black/10 bg-[rgba(255,255,255,0.96)] p-4 shadow-[0_24px_80px_rgba(20,20,20,0.18)] backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => canGoPrev && setVisibleMonth(prevMonth)}
              disabled={!canGoPrev}
              className="flex h-9 w-9 items-center justify-center text-[#141414] transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="font-serif text-[16px] text-[#141414]">{monthLabel}</p>
            <button
              type="button"
              onClick={() => setVisibleMonth(nextMonth)}
              className="flex h-9 w-9 items-center justify-center text-[#141414] transition-colors hover:bg-black/5"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="mb-2 grid grid-cols-7 gap-1">
            {weekdayLabels.map((label) => (
              <span
                key={label}
                className="flex h-8 items-center justify-center font-label text-[11px] uppercase tracking-[0.16em] text-black/45"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((date) => {
              const iso = formatISODate(date);
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isPast = startOfDay(date) < today;
              const isSelected = value === iso;
              const isToday = formatISODate(today) === iso;

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    if (isPast) return;
                    onChange(iso);
                    setOpen(false);
                  }}
                  disabled={isPast}
                  className={`flex h-10 items-center justify-center font-serif text-[15px] transition-all ${
                    isSelected
                      ? "bg-[#141414] text-white"
                      : isToday
                        ? "border border-[#141414] text-[#141414]"
                        : isCurrentMonth
                          ? "text-[#141414] hover:bg-black/5"
                          : "text-black/25"
                  } ${isPast ? "cursor-not-allowed text-black/18" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ServicePicker({ services, value, onChange }: {
  services: Service[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-[rgba(255,255,255,0.8)] border-b-2 border-white h-[50px] px-3 w-full outline-none focus:border-[#141414] transition-colors font-serif text-[15px] text-[#141414] cursor-pointer appearance-none">
      <option value="" disabled>— Select —</option>
      {services.map((s) => (
        <option key={s.id} value={s.title}>{s.title}</option>
      ))}
      <option value="Other">Other</option>
    </select>
  );
}

export default function ContactSection({ content = {} }: { content?: C }) {
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [form, setForm] = useState<Record<string, string>>({
    name: "", partner_name: "", email: "", phone: "",
    session_date: "", venue: "", budget: "", message: "", how_found: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [dateError, setDateError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    fetch(`${API}/services/`)
      .then((r) => r.json())
      .then((data: Service[]) => setServices(data.filter((s: Service) => s.is_active)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handler(e: Event) {
      setSelectedService((e as CustomEvent<string>).detail);
    }
    window.addEventListener("contact:preselect", handler);
    return () => window.removeEventListener("contact:preselect", handler);
  }, []);

  // Collect custom fields: form_custom_N_label
  const customFields = Object.keys(content)
    .filter((k) => /^form_custom_\d+_label$/.test(k))
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)![0]);
      const nb = parseInt(b.match(/\d+/)![0]);
      return na - nb;
    })
    .map((k) => {
      const n = k.match(/\d+/)![0];
      return { key: `custom_${n}`, label: content[k], type: content[`form_custom_${n}_type`] || "text" };
    })
    .filter(({ key }) => !isHidden(key, content));

  function setField(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "session_date") setDateError("");
    if (k === "phone") setPhoneError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    if (!isValidPhone(form.phone)) {
      setPhoneError("Please enter a valid phone number.");
      return;
    }
    if (!isHidden("session_date", content) && !form.session_date) {
      setDateError("Please choose a date.");
      return;
    }
    const today = startOfDay(new Date());
    const selectedDate = parseISODate(form.session_date);
    if (selectedDate && startOfDay(selectedDate) < today) {
      setDateError("Please choose a date that is today or later.");
      return;
    }
    setStatus("sending");
    try {
      // Merge custom field answers into message or a combined field
      const customAnswers = customFields
        .map(({ label }) => `${label}: ${form[label] ?? ""}`)
        .filter((s) => s.split(": ")[1])
        .join("\n");
      const finalMessage = [form.message, customAnswers].filter(Boolean).join("\n\n");

      const res = await fetch(`${API}/inquiries/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, service: selectedService, message: finalMessage }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  const hasInfo = content.contact_info_p1 || content.contact_address || content.contact_email;
  if (!hasInfo) return null;

  return (
    <section id="contacts" className="bg-[#ededed] py-10 lg:py-[99px]">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row gap-16 lg:gap-[120px]">

        {/* Form */}
        <div className="flex flex-col gap-6 w-full lg:w-[510px]">
          <Reveal delay={20}>
            <p className="font-label text-[15px] tracking-[0.2em] text-black text-center">CONTACTS</p>
          </Reveal>

          {status === "sent" ? (
            <div className="flex flex-col items-center gap-6 py-10">
              <Reveal delay={60}>
                <p className="font-cursive text-[74px] text-[#141414] leading-[80px] text-center">Thank you</p>
              </Reveal>
              <Reveal delay={120}>
                <p className="font-serif text-[15px] text-[#141414] text-center">Your inquiry has been received.<br />I will get back to you soon!</p>
              </Reveal>
            </div>
          ) : (
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

              {/* Always: Name */}
              <div className="flex flex-col gap-3">
                <label className="font-serif text-[16px] text-black">Your Name *</label>
                <input required type="text" value={form.name} onChange={(e) => setField("name", e.target.value)} className={inputCls} />
              </div>

              {/* Partner name */}
              {!isHidden("partner_name", content) && (
                <div className="flex flex-col gap-3">
                  <label className="font-serif text-[16px] text-black">{fieldLabel("partner_name", content)}</label>
                  <input type="text" value={form.partner_name} onChange={(e) => setField("partner_name", e.target.value)} className={inputCls} />
                </div>
              )}

              {/* Always: Email */}
              <div className="flex flex-col gap-3">
                <label className="font-serif text-[16px] text-black">Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputCls} />
              </div>

              {/* Always: Phone */}
              <div className="flex flex-col gap-3">
                <label className="font-serif text-[16px] text-black">Phone *</label>
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  className={inputCls}
                />
                {phoneError && (
                  <p className="font-serif text-[13px] text-red-600">{phoneError}</p>
                )}
              </div>

              {/* Service */}
              {!isHidden("service", content) && services.length > 0 && (
                <div className="flex flex-col gap-3">
                  <label className="font-serif text-[16px] text-black">{fieldLabel("service", content)}</label>
                  <ServicePicker services={services} value={selectedService} onChange={setSelectedService} />
                </div>
              )}

              {/* Session date */}
              {!isHidden("session_date", content) && (
                <div className="flex flex-col gap-3">
                  <label className="font-serif text-[16px] text-black">{fieldLabel("session_date", content)}</label>
                  <DatePicker value={form.session_date} onChange={(v) => setField("session_date", v)} />
                  {dateError && (
                    <p className="font-serif text-[13px] text-red-600">{dateError}</p>
                  )}
                </div>
              )}

              {/* Venue */}
              {!isHidden("venue", content) && (
                <div className="flex flex-col gap-3">
                  <label className="font-serif text-[16px] text-black">{fieldLabel("venue", content)}</label>
                  <input type="text" value={form.venue} onChange={(e) => setField("venue", e.target.value)} className={inputCls} />
                </div>
              )}

              {/* Budget */}
              {!isHidden("budget", content) && (
                <div className="flex flex-col gap-3">
                  <label className="font-serif text-[16px] text-black">{fieldLabel("budget", content)}</label>
                  <input type="text" value={form.budget} onChange={(e) => setField("budget", e.target.value)} className={inputCls} />
                </div>
              )}

              {/* Message */}
              {!isHidden("message", content) && (
                <div className="flex flex-col gap-3">
                  <label className="font-serif text-[16px] text-black leading-[24px]">{fieldLabel("message", content)}</label>
                  <textarea rows={5} value={form.message} onChange={(e) => setField("message", e.target.value)} className={textareaCls} />
                </div>
              )}

              {/* How found */}
              {!isHidden("how_found", content) && (
                <div className="flex flex-col gap-3">
                  <label className="font-serif text-[16px] text-black">{fieldLabel("how_found", content)}</label>
                  <input type="text" value={form.how_found} onChange={(e) => setField("how_found", e.target.value)} className={inputCls} />
                </div>
              )}

              {/* Custom fields */}
              {customFields.map(({ key, label, type }) => (
                <div key={key} className="flex flex-col gap-3">
                  <label className="font-serif text-[16px] text-black">{label}</label>
                  {type === "textarea" ? (
                    <textarea rows={4} value={form[label] ?? ""} onChange={(e) => setField(label, e.target.value)} className={textareaCls} />
                  ) : (
                    <input type="text" value={form[label] ?? ""} onChange={(e) => setField(label, e.target.value)} className={inputCls} />
                  )}
                </div>
              ))}

              {/* Agree */}
              <div className="flex gap-2 items-start">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 shrink-0 w-4 h-4 border-2 border-black rounded-sm cursor-pointer" />
                <p className="font-serif text-[14px] text-black leading-[22px]">
                  By clicking SUBMIT, you agree to receive text messages from Alexa Bodnar Photography. Standard message and data rates may apply.*
                </p>
              </div>

              {status === "error" && (
                <p className="font-serif text-[13px] text-red-600">Something went wrong. Please try again.</p>
              )}

              <button type="submit" disabled={!agreed || status === "sending"}
                className="bg-[#141414] text-white font-sans font-bold text-[13px] tracking-[0.15em] py-4 w-full uppercase hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50">
                {status === "sending" ? "Sending..." : "Submit"}
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-[61px] lg:w-[570px]">
          <div className="flex flex-col gap-7 self-start text-left font-serif text-[14px] text-[#141414]">
            {["contact_info_p1", "contact_info_p2", "contact_info_p3"].map((key) =>
              content[key] ? (
                <Reveal key={key} delay={80}>
                  <p className="leading-[22px] lg:w-[277px]">{content[key]}</p>
                </Reveal>
              ) : null
            )}
          </div>
          <div className="flex flex-col gap-9">
            <Reveal delay={140}>
              <a href={content.contact_instagram_url || "#"} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 hover:opacity-70 transition-opacity">
                <img src="/images/instagram-icon.svg" alt="Instagram" className="w-[37.5px] h-[37.5px]" />
              </a>
            </Reveal>
            {content.contact_photo_url && (
              <Reveal delay={190} variant="softScale">
                <div className="w-full h-[208px] lg:h-[357px] rounded-[6px] overflow-hidden">
                  <img src={content.contact_photo_url} alt="" className="w-full h-full object-cover" />
                </div>
              </Reveal>
            )}
            <div className="flex flex-col gap-4 font-serif text-[16px] text-[#141414] items-center lg:items-start">
              {content.contact_address && (
                <Reveal delay={230}>
                  <a href={`https://maps.google.com/?q=${encodeURIComponent(content.contact_address)}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">{content.contact_address}</a>
                </Reveal>
              )}
              {content.contact_phone && (
                <Reveal delay={270}>
                  <a href={`tel:${content.contact_phone.replace(/\s/g, "")}`} className="hover:opacity-70 transition-opacity">{content.contact_phone}</a>
                </Reveal>
              )}
              {content.contact_email && (
                <Reveal delay={310}>
                  <a href={`mailto:${content.contact_email}`} className="hover:opacity-70 transition-opacity">{content.contact_email}</a>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
