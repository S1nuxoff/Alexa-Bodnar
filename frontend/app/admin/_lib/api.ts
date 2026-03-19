const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function upload<T>(path: string, formData: FormData): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method: "POST", body: formData, headers });

  if (res.status === 401) {
    localStorage.removeItem("admin_token");
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

// Auth
export async function login(email: string, password: string): Promise<{ access_token: string }> {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// Content
export interface ContentItem {
  id: number;
  key: string;
  value: string;
  section: string;
  label: string;
}

export async function getContent(): Promise<ContentItem[]> {
  return request("/content/");
}

export async function createContent(data: Omit<ContentItem, "id">): Promise<ContentItem> {
  return request("/content/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateContent(key: string, value: string): Promise<ContentItem> {
  return request(`/content/${key}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  });
}

export async function deleteContent(key: string): Promise<void> {
  return request(`/content/${key}`, { method: "DELETE" });
}

// Services
export interface Service {
  id: number;
  title: string;
  description: string;
  price: number;
  currency: string;
  is_active: boolean;
  order: number;
}

export async function getServices(): Promise<Service[]> {
  return request("/services/");
}

export async function createService(data: Omit<Service, "id">): Promise<Service> {
  return request("/services/", { method: "POST", body: JSON.stringify(data) });
}

export async function updateService(id: number, data: Partial<Service>): Promise<Service> {
  return request(`/services/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteService(id: number): Promise<void> {
  return request(`/services/${id}`, { method: "DELETE" });
}

// Gallery
export interface GalleryPhoto {
  id: number;
  filename: string;
  url: string;
  thumb_url: string | null;
  category: string;
  order: number;
  is_active: boolean;
}

export async function getGallery(): Promise<GalleryPhoto[]> {
  return request("/gallery/");
}

export async function uploadPhoto(file: File, category: string): Promise<GalleryPhoto> {
  const form = new FormData();
  form.append("file", file);
  return upload(`/gallery/upload?category=${encodeURIComponent(category)}`, form);
}

export async function updatePhoto(id: number, data: Partial<GalleryPhoto>): Promise<GalleryPhoto> {
  return request(`/gallery/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deletePhoto(id: number): Promise<void> {
  return request(`/gallery/${id}`, { method: "DELETE" });
}

// Inquiries
export type InquiryStatus = "new" | "accepted" | "rejected" | "closed" | "completed";

export interface Inquiry {
  id: number;
  name: string;
  partner_name: string;
  email: string;
  phone: string;
  session_date: string;
  venue: string;
  budget: string;
  service: string;
  message: string;
  how_found: string;
  is_read: boolean;
  status: InquiryStatus;
  created_at: string;
}

export interface InquiryCreate {
  name: string;
  partner_name?: string;
  email: string;
  phone?: string;
  session_date?: string;
  venue?: string;
  budget?: string;
  service?: string;
  message?: string;
  how_found?: string;
}

export async function submitInquiry(data: InquiryCreate): Promise<Inquiry> {
  const API = process.env.NEXT_PUBLIC_API_URL || "/api";
  const res = await fetch(`${API}/inquiries/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to submit");
  return res.json();
}

export async function getInquiries(): Promise<Inquiry[]> {
  return request("/inquiries/");
}

export async function getUnreadCount(): Promise<{ count: number }> {
  return request("/inquiries/unread-count");
}

export async function markInquiryRead(id: number, is_read: boolean): Promise<Inquiry> {
  return request(`/inquiries/${id}`, { method: "PUT", body: JSON.stringify({ is_read }) });
}

export async function updateInquiryStatus(id: number, status: InquiryStatus): Promise<Inquiry> {
  return request(`/inquiries/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
}

export async function deleteInquiry(id: number): Promise<void> {
  return request(`/inquiries/${id}`, { method: "DELETE" });
}

// Email Templates
export interface EmailTemplate {
  id: number;
  status_key: string;
  label: string;
  subject: string;
  body: string;
}

export async function getEmailTemplates(): Promise<EmailTemplate[]> {
  return request("/email-templates/");
}

export async function updateEmailTemplate(
  statusKey: string,
  data: { subject: string; body: string },
): Promise<EmailTemplate> {
  return request(`/email-templates/${statusKey}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Broadcasts
export interface Broadcast {
  id: number;
  subject: string;
  body: string;
  recipient_group: string;
  status: string;
  total_recipients: number;
  sent_count: number;
  image_url: string | null;
  created_at: string;
}

export async function getBroadcasts(): Promise<Broadcast[]> {
  return request("/broadcasts/");
}

export async function uploadBroadcastImage(file: File): Promise<{ url: string; path: string }> {
  return upload("/broadcasts/upload-image", (() => { const f = new FormData(); f.append("file", file); return f; })());
}

export async function getRecipientsPreview(
  recipient_group: string,
): Promise<{ count: number; sample: { email: string; name: string }[] }> {
  return request("/broadcasts/recipients-preview", {
    method: "POST",
    body: JSON.stringify({ recipient_group }),
  });
}

export async function createBroadcast(data: {
  subject: string;
  body: string;
  recipient_group: string;
  image_url?: string | null;
  image_path?: string | null;
  image_position?: string | null;
  image_size?: string | null;
  greeting?: string | null;
  signature?: string | null;
}): Promise<Broadcast> {
  return request("/broadcasts/", { method: "POST", body: JSON.stringify(data) });
}

export async function deleteBroadcast(id: number): Promise<void> {
  return request(`/broadcasts/${id}`, { method: "DELETE" });
}
