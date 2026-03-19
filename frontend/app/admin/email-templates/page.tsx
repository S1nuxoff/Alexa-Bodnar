"use client";
import { useEffect, useState } from "react";
import { getEmailTemplates, updateEmailTemplate, type EmailTemplate } from "../_lib/api";
import { Save, Mail, Loader2, CheckCircle2, Info } from "lucide-react";

function TemplateCard({ template, onSaved }: { template: EmailTemplate; onSaved: (t: EmailTemplate) => void }) {
  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const dirty = subject !== template.subject || body !== template.body;

  async function save() {
    setSaving(true);
    try {
      const updated = await updateEmailTemplate(template.status_key, { subject, body });
      onSaved(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
      <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <Mail size={15} className="text-neutral-500" />
          <span className="text-sm font-medium text-white">{template.label}</span>
          <span className="font-mono text-xs text-neutral-600">{template.status_key}</span>
        </div>
        <button onClick={save} disabled={saving || !dirty} className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${saved ? "bg-green-500/10 text-green-400" : dirty ? "bg-[#f4a7b9]/15 text-[#f4a7b9] hover:bg-[#f4a7b9]/25" : "cursor-not-allowed bg-neutral-800 text-neutral-600"}`}>
          {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <CheckCircle2 size={12} /> : <Save size={12} />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <label className="mb-1.5 block text-[10px] uppercase tracking-wider text-neutral-600">Email subject</label>
          <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-600 transition-colors focus:border-neutral-500 focus:outline-none" />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="block text-[10px] uppercase tracking-wider text-neutral-600">Email body</label>
            <div className="relative">
              <button type="button" onClick={() => setTipOpen((v) => !v)} onBlur={() => setTipOpen(false)} className="text-neutral-600 transition-colors hover:text-[#f4a7b9] focus:outline-none"><Info size={13} /></button>
              {tipOpen && <div className="absolute bottom-full right-0 z-10 mb-2 w-56 rounded-xl border border-neutral-700 bg-neutral-800 px-3 py-2.5 text-xs leading-relaxed text-neutral-300 shadow-xl">Use <code className="rounded bg-[#f4a7b9]/10 px-1 py-0.5 font-mono text-[#f4a7b9]">{"{name}"}</code> to insert the client name into the email.</div>}
            </div>
          </div>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={7} className="w-full resize-y rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 font-mono text-sm leading-relaxed text-white placeholder-neutral-600 transition-colors focus:border-neutral-500 focus:outline-none" />
        </div>
      </div>
    </div>
  );
}

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmailTemplates().then(setTemplates).finally(() => setLoading(false));
  }, []);

  function handleSaved(updated: EmailTemplate) {
    setTemplates((prev) => prev.map((t) => (t.status_key === updated.status_key ? updated : t)));
  }

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Email Templates</h1>
        <p className="mt-1 text-sm text-neutral-500">Emails that are automatically sent to clients</p>
      </div>
      {loading && <div className="py-20 text-center text-sm text-neutral-500">Loading...</div>}
      {!loading && <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{templates.map((t) => <TemplateCard key={t.status_key} template={t} onSaved={handleSaved} />)}</div>}
    </div>
  );
}
