"use client";

import { useEffect, useRef, useState } from "react";
import {
  createBroadcast,
  deleteBroadcast,
  getBroadcasts,
  getRecipientsPreview,
  uploadBroadcastImage,
  type Broadcast,
} from "../_lib/api";
import {
  CheckCircle,
  ChevronDown,
  Eye,
  ImagePlus,
  Loader,
  Mail,
  Send,
  Trash2,
  Users,
  X,
} from "lucide-react";

const DEFAULT_GREETING = "Hi {name},";
const DEFAULT_SIGNATURE = "With love,\nAlexa";

const IMAGE_POSITIONS = [
  { value: "top", label: "Top" },
  { value: "before_body", label: "Before text" },
  { value: "after_body", label: "After text" },
  { value: "bottom", label: "Bottom" },
];

const IMAGE_SIZES = [
  { value: "full", label: "Full width" },
  { value: "large", label: "70%" },
  { value: "small", label: "40%" },
];

const GROUPS = [
  { value: "all", label: "All clients" },
  { value: "accepted", label: "Accepted" },
  { value: "completed", label: "Completed" },
  { value: "new", label: "New inquiries" },
  { value: "rejected", label: "Rejected" },
];

const TABS = [
  { value: "compose", label: "New broadcast" },
  { value: "history", label: "History" },
] as const;

type TabValue = (typeof TABS)[number]["value"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function EmailPreview({
  subject,
  body,
  imageUrl,
  greeting: greetingTpl,
  signature,
  imagePosition = "top",
  imageSize = "full",
  name = "Client",
  iframeHeight = 640,
}: {
  subject: string;
  body: string;
  imageUrl: string;
  greeting: string;
  signature: string;
  imagePosition?: string;
  imageSize?: string;
  name?: string;
  iframeHeight?: number;
}) {
  const greeting = greetingTpl ? greetingTpl.replace("{name}", name) : `Hi ${name},`;
  const sizeMap: Record<string, string> = { full: "100%", large: "70%", small: "40%" };
  const imgWidth = sizeMap[imageSize] ?? "100%";
  const bodyHtml = body.replace(/\n/g, "<br/>");
  const sigHtml = signature.replace(/\n/g, "<br/>");
  const inlineImg = imageUrl
    ? `<img src="${imageUrl}" alt="" style="width:${imgWidth};border:0;border-radius:4px;display:inline-block;"/>`
    : "";
  const topImg =
    imageUrl && imagePosition === "top"
      ? imageSize === "full"
        ? `<tr><td style="padding:0"><img src="${imageUrl}" alt="" style="width:100%;display:block;border:0"/></td></tr>`
        : `<tr><td style="padding:24px 32px 0;text-align:center;">${inlineImg}</td></tr>`
      : "";
  const beforeBodyImg =
    imageUrl && imagePosition === "before_body"
      ? `<div style="margin:0 0 24px;text-align:center;">${inlineImg}</div>`
      : "";
  const afterBodyImg =
    imageUrl && imagePosition === "after_body"
      ? `<div style="margin:24px 0 0;text-align:center;">${inlineImg}</div>`
      : "";
  const bottomImg =
    imageUrl && imagePosition === "bottom"
      ? `<tr><td style="padding:0 32px 24px;text-align:center;">${inlineImg}</td></tr>`
      : "";

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
  <body style="margin:0;padding:20px;background:#f5f5f5;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:4px;overflow:hidden;max-width:560px;">
        <tr><td style="background:#141414;padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:#fff;text-transform:uppercase;">Alexa Bodnar Photography</p>
        </td></tr>
        ${topImg}
        <tr><td style="padding:32px;color:#141414;">
          <p style="margin:0 0 20px;font-size:20px;">${greeting}</p>
          ${beforeBodyImg}
          <div style="font-size:14px;line-height:1.8;color:#333;">${bodyHtml}</div>
          ${afterBodyImg}
          <p style="margin:28px 0 0;font-size:14px;color:#444;">${sigHtml}</p>
        </td></tr>
        ${bottomImg}
        <tr><td style="padding:20px 32px 28px;text-align:center;">
          <p style="margin:0;font-size:11px;letter-spacing:0.1em;color:#999;text-transform:uppercase;">Alexa Bodnar Photography</p>
        </td></tr>
      </table>
    </td></tr>
  </table></body></html>`;

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] uppercase tracking-wider text-neutral-600">
        Preview <span className="text-neutral-400">{subject || "(no subject)"}</span>
      </div>
      <div className="overflow-hidden rounded-xl border border-neutral-700 bg-neutral-100">
        <iframe
          srcDoc={html}
          title="Email preview"
          className="w-full"
          style={{ height: iframeHeight, border: "none" }}
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  sent,
  total,
}: {
  status: string;
  sent: number;
  total: number;
}) {
  if (status === "done") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-400">
        <CheckCircle size={11} /> {sent}/{total}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 rounded-full bg-yellow-500/15 px-2 py-0.5 text-xs text-yellow-400">
      <Loader size={11} className="animate-spin" /> {sent}/{total}
    </span>
  );
}

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("compose");

  const [subject, setSubject] = useState("");
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const [body, setBody] = useState("");
  const [signature, setSignature] = useState(DEFAULT_SIGNATURE);
  const [recipientGroup, setRecipientGroup] = useState("all");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePath, setImagePath] = useState("");
  const [imagePosition, setImagePosition] = useState("top");
  const [imageSize, setImageSize] = useState("full");
  const [imageUploading, setImageUploading] = useState(false);

  const [recipientInfo, setRecipientInfo] = useState<{
    count: number;
    sample: { email: string; name: string }[];
  } | null>(null);
  const [groupOpen, setGroupOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getBroadcasts().then(setBroadcasts).finally(() => setLoading(false));
    fetchRecipients("all");
  }, []);

  async function fetchRecipients(group: string) {
    const info = await getRecipientsPreview(group);
    setRecipientInfo(info);
  }

  function handleGroupChange(value: string) {
    setRecipientGroup(value);
    setGroupOpen(false);
    fetchRecipients(value);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const res = await uploadBroadcastImage(file);
      setImageUrl(res.url);
      setImagePath(res.path);
    } finally {
      setImageUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeImage() {
    setImageUrl("");
    setImagePath("");
  }

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;

    const count = recipientInfo?.count ?? 0;
    if (!confirm(`Send broadcast to ${count} recipients?`)) return;

    setSending(true);
    try {
      const broadcast = await createBroadcast({
        subject,
        body,
        recipient_group: recipientGroup,
        image_url: imageUrl || null,
        image_path: imagePath || null,
        image_position: imagePosition,
        image_size: imageSize,
        greeting: greeting || null,
        signature: signature || null,
      });

      setBroadcasts((prev) => [broadcast, ...prev]);
      setSubject("");
      setGreeting(DEFAULT_GREETING);
      setBody("");
      setSignature(DEFAULT_SIGNATURE);
      setImageUrl("");
      setImagePath("");
      setImagePosition("top");
      setImageSize("full");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setActiveTab("history");
    } finally {
      setSending(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this broadcast?")) return;
    await deleteBroadcast(id);
    setBroadcasts((prev) => prev.filter((broadcast) => broadcast.id !== id));
  }

  const groupLabel = GROUPS.find((group) => group.value === recipientGroup)?.label ?? recipientGroup;

  return (
    <div className="flex w-full flex-col items-start gap-6">
      <div className="w-full max-w-6xl">
        <h1 className="text-xl font-semibold text-white md:text-2xl">Broadcasts</h1>
        <p className="mt-1 text-sm text-neutral-500">Create and send emails to client groups.</p>
      </div>

      <div className="flex w-full max-w-6xl flex-wrap gap-1.5">
        {TABS.map((tab) => {
          const active = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                active
                  ? "bg-white text-neutral-900 font-medium"
                  : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "compose" && (
        <div className="grid w-full max-w-6xl gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
            <div className="flex items-center justify-between border-b border-neutral-800 px-4 py-3.5 md:px-6">
              <div className="flex items-center gap-2">
                <Mail size={15} className="text-neutral-400" />
                <span className="text-sm font-medium text-white">New broadcast</span>
              </div>
              <button
                onClick={() => setMobilePreviewOpen(true)}
                className="flex items-center gap-1.5 text-xs text-neutral-500 transition-colors hover:text-white xl:hidden"
              >
                <Eye size={13} />
                Preview
              </button>
            </div>

            <div className="flex flex-col gap-4 p-4 md:gap-5 md:p-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500">Recipients</label>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <button
                      onClick={() => setGroupOpen((prev) => !prev)}
                      className="flex items-center gap-2 rounded-xl bg-neutral-800 px-4 py-2.5 text-sm text-white transition-colors hover:bg-neutral-700"
                    >
                      {groupLabel}
                      <ChevronDown size={14} className="text-neutral-400" />
                    </button>

                    {groupOpen && (
                      <div className="absolute left-0 top-full z-20 mt-1 min-w-[180px] overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 shadow-xl">
                        {GROUPS.map((group) => (
                          <button
                            key={group.value}
                            onClick={() => handleGroupChange(group.value)}
                            className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-neutral-700 ${
                              recipientGroup === group.value
                                ? "font-medium text-white"
                                : "text-neutral-300"
                            }`}
                          >
                            {group.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {recipientInfo !== null && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <Users size={13} />
                      <span>{recipientInfo.count} recipients</span>
                      {recipientInfo.sample.length > 0 && (
                        <span className="hidden text-neutral-700 md:inline">
                          ({recipientInfo.sample.map((sample) => sample.email).join(", ")}
                          {recipientInfo.count > 5 ? "..." : ""})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="For example: Special offer for you"
                  className="w-full rounded-xl bg-neutral-800 px-4 py-3 text-sm text-white outline-none placeholder-neutral-600 focus:ring-1 focus:ring-white/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500">Greeting</label>
                <input
                  type="text"
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="w-full rounded-xl bg-neutral-800 px-4 py-3 font-mono text-sm text-white outline-none focus:ring-1 focus:ring-white/20"
                />
                <p className="text-[11px] text-neutral-600">
                  Use <code className="rounded bg-neutral-800 px-1 text-neutral-400">{"{name}"}</code> to insert the client name.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500">Body</label>
                <textarea
                  rows={7}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={"Hi,\n\nI wanted to share something special with you..."}
                  className="w-full resize-y rounded-xl bg-neutral-800 px-4 py-3 text-sm leading-relaxed text-white outline-none placeholder-neutral-600 focus:ring-1 focus:ring-white/20"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500">Signature</label>
                <textarea
                  rows={3}
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  className="w-full resize-y rounded-xl bg-neutral-800 px-4 py-3 font-mono text-sm leading-relaxed text-white outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] uppercase tracking-wider text-neutral-500">Image</label>

                {imageUrl ? (
                  <div className="relative w-fit">
                    <img
                      src={imageUrl}
                      alt="preview"
                      className="h-32 rounded-xl border border-neutral-700 object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute -right-2 -top-2 rounded-full border border-neutral-700 bg-neutral-900 p-0.5 text-neutral-400 transition-colors hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={imageUploading}
                    className="flex w-fit items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-neutral-400 transition-colors hover:border-neutral-600 hover:text-white disabled:opacity-50"
                  >
                    {imageUploading ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <ImagePlus size={14} />
                    )}
                    {imageUploading ? "Uploading..." : "Attach image"}
                  </button>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

                {imageUrl && (
                  <div className="mt-1 flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-600">
                        Image position
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {IMAGE_POSITIONS.map((position) => (
                          <button
                            key={position.value}
                            onClick={() => setImagePosition(position.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                              imagePosition === position.value
                                ? "bg-white font-medium text-neutral-900"
                                : "bg-neutral-800 text-neutral-400 hover:text-white"
                            }`}
                          >
                            {position.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-neutral-600">
                        Image size
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {IMAGE_SIZES.map((size) => (
                          <button
                            key={size.value}
                            onClick={() => setImageSize(size.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs transition-colors ${
                              imageSize === size.value
                                ? "bg-white font-medium text-neutral-900"
                                : "bg-neutral-800 text-neutral-400 hover:text-white"
                            }`}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSend}
                  disabled={sending || !subject.trim() || !body.trim()}
                  className="flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-40"
                >
                  {sending ? (
                    <>
                      <Loader size={14} className="animate-spin" />
                      Sending...
                    </>
                  ) : sent ? (
                    <>
                      <CheckCircle size={14} className="text-green-600" />
                      Sent
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send broadcast
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="hidden xl:block">
            <div className="sticky top-6 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
              <EmailPreview
                subject={subject}
                body={body}
                imageUrl={imageUrl}
                greeting={greeting}
                signature={signature}
                imagePosition={imagePosition}
                imageSize={imageSize}
                iframeHeight={760}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="w-full max-w-5xl">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-neutral-500">
            Broadcast history
          </h2>

          {loading && <p className="py-8 text-center text-sm text-neutral-600">Loading...</p>}

          {!loading && broadcasts.length === 0 && (
            <div className="py-12 text-center">
              <Send size={28} className="mx-auto mb-3 text-neutral-700" />
              <p className="text-sm text-neutral-600">No broadcasts yet.</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {broadcasts.map((broadcast) => (
              <div
                key={broadcast.id}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{broadcast.subject}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-neutral-500">{formatDate(broadcast.created_at)}</span>
                      <span className="text-xs text-neutral-700">
                        · {GROUPS.find((group) => group.value === broadcast.recipient_group)?.label ?? broadcast.recipient_group}
                      </span>
                      {broadcast.image_url && <span className="text-xs text-neutral-700">· image</span>}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-neutral-600">
                      {broadcast.body}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <StatusBadge
                      status={broadcast.status}
                      sent={broadcast.sent_count}
                      total={broadcast.total_recipients}
                    />
                    <button
                      onClick={() => handleDelete(broadcast.id)}
                      className="rounded-lg p-1.5 text-neutral-600 transition-colors hover:bg-neutral-800 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mobilePreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 xl:hidden">
          <button
            aria-label="Close preview"
            className="absolute inset-0"
            onClick={() => setMobilePreviewOpen(false)}
          />
          <div className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-neutral-800 bg-neutral-900 p-4 sm:max-w-2xl sm:rounded-2xl sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-white">Email preview</h2>
                <p className="mt-1 text-xs text-neutral-500">Mobile preview opens as a popup.</p>
              </div>
              <button
                onClick={() => setMobilePreviewOpen(false)}
                className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto">
              <EmailPreview
                subject={subject}
                body={body}
                imageUrl={imageUrl}
                greeting={greeting}
                signature={signature}
                imagePosition={imagePosition}
                imageSize={imageSize}
                iframeHeight={560}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

