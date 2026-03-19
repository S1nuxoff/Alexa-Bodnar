"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  createService,
  deleteService,
  getServices,
  type Service,
  updateService,
} from "../_lib/api";
import {
  Briefcase,
  Check,
  CheckCheck,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

const empty: Omit<Service, "id"> = {
  title: "",
  description: "",
  price: 0,
  currency: "$",
  is_active: true,
  order: 0,
};

function ServiceModal({
  form,
  editId,
  saving,
  saved,
  onChange,
  onToggleActive,
  onDelete,
  onClose,
  onSave,
}: {
  form: Omit<Service, "id">;
  editId: number | null;
  saving: boolean;
  saved: boolean;
  onChange: (patch: Partial<Omit<Service, "id">>) => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4">
      <motion.div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-neutral-800 bg-neutral-900 sm:max-w-xl sm:rounded-2xl"
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 380, damping: 32 }}
      >
        <div className="shrink-0 border-b border-neutral-800 px-5 pb-4 pt-5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold leading-tight text-white">
                  {editId ? form.title || "Edit service" : "New service"}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    form.is_active
                      ? "bg-green-500/15 text-green-400"
                      : "bg-neutral-700 text-neutral-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      form.is_active ? "bg-green-400" : "bg-neutral-500"
                    }`}
                  />
                  {form.is_active ? "Visible" : "Hidden"}
                </span>
              </div>
              <p className="mt-1 text-xs text-neutral-600">
                {editId ? "Update service data and visibility." : "Create a new service card."}
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-3 shrink-0 rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => onChange({ description: e.target.value })}
              className="w-full resize-none rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">
                Currency
              </label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => onChange({ currency: e.target.value })}
                className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">
                Price
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => onChange({ price: Number(e.target.value) })}
                className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs uppercase tracking-wider text-neutral-500">
                Order
              </label>
              <input
                type="number"
                value={form.order}
                onChange={(e) => onChange({ order: Number(e.target.value) })}
                className="w-full rounded-lg bg-neutral-800 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-neutral-800 bg-neutral-900/80 px-5 pb-10 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onToggleActive}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                form.is_active
                  ? "bg-neutral-700 text-neutral-200 hover:bg-neutral-600"
                  : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
              }`}
            >
              <CheckCheck size={13} />
              {form.is_active ? "Hide" : "Show"}
            </button>

            {editId !== null && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
              >
                <Trash2 size={13} />
                Delete
              </button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={saving}
                className="flex min-w-32 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : saved ? (
                  <>
                    <Check size={14} />
                    Saved
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getServices().then(setServices);
  }, []);

  function openCreate() {
    setEditId(null);
    setForm({ ...empty, order: services.length + 1 });
    setSaved(false);
    setModalOpen(true);
  }

  function openEdit(service: Service) {
    setEditId(service.id);
    setForm({
      title: service.title,
      description: service.description,
      price: service.price,
      currency: service.currency,
      is_active: service.is_active,
      order: service.order,
    });
    setSaved(false);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditId(null);
    setForm({ ...empty });
    setSaving(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editId !== null) {
        const updated = await updateService(editId, form);
        setServices((prev) => prev.map((service) => (service.id === editId ? updated : service)));
      } else {
        const created = await createService(form);
        setServices((prev) => [...prev, created]);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this service?")) return;
    await deleteService(id);
    setServices((prev) => prev.filter((service) => service.id !== id));
  }

  async function handleDeleteCurrent() {
    if (editId === null) return;
    await handleDelete(editId);
    closeModal();
  }

  async function toggleActive(service: Service) {
    const updated = await updateService(service.id, { is_active: !service.is_active });
    setServices((prev) => prev.map((item) => (item.id === service.id ? updated : item)));
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="text-neutral-400" size={20} />
          <h1 className="text-xl font-semibold text-white">Services / Investments</h1>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-100"
        >
          <Plus size={14} />
          Add service
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-neutral-400">Services</h2>

        {services.length === 0 && (
          <div className="rounded-xl bg-neutral-900 p-8 text-center">
            <p className="text-sm text-neutral-500">No services yet.</p>
            <button
              onClick={openCreate}
              className="mt-3 text-sm text-white underline transition-opacity hover:opacity-70"
            >
              Add the first one
            </button>
          </div>
        )}

        {[...services].sort((a, b) => a.order - b.order).map((service) => (
          <motion.div
            key={service.id}
            layout
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.998 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onClick={() => openEdit(service)}
            className={`flex cursor-pointer items-center gap-3 rounded-xl bg-neutral-900 p-4 transition-colors hover:bg-neutral-900/90 ${
              !service.is_active ? "opacity-40" : ""
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium text-white">{service.title}</p>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    service.is_active
                      ? "bg-green-500/15 text-green-400"
                      : "bg-neutral-700 text-neutral-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      service.is_active ? "bg-green-400" : "bg-neutral-500"
                    }`}
                  />
                  {service.is_active ? "Visible" : "Hidden"}
                </span>
              </div>
              {service.description && (
                <p className="mt-0.5 truncate text-xs text-neutral-400">{service.description}</p>
              )}
              <p className="mt-1 text-sm font-semibold text-emerald-400">
                {service.currency}
                {service.price}
              </p>
            </div>
            <div className="flex shrink-0 gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => toggleActive(service)}
                title={service.is_active ? "Hide" : "Show"}
                className="rounded-lg bg-neutral-800 px-2 py-1.5 text-xs text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-white"
              >
                {service.is_active ? "On" : "Off"}
              </button>
              <button
                onClick={() => openEdit(service)}
                className="rounded-lg bg-neutral-800 p-1.5 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-white"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="rounded-lg bg-neutral-800 p-1.5 text-neutral-400 transition-colors hover:bg-neutral-700 hover:text-red-400"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <ServiceModal
            form={form}
            editId={editId}
            saving={saving}
            saved={saved}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
            onToggleActive={() => setForm((prev) => ({ ...prev, is_active: !prev.is_active }))}
            onDelete={handleDeleteCurrent}
            onClose={closeModal}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
