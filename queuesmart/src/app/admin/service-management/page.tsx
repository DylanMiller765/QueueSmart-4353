"use client";
import { useState } from "react";
import Link from "next/link";
import { Bell, ChevronLeft } from "lucide-react";

interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  priority: string;
}

const initialServices: Service[] = [
  { id: 1, name: "Customer Support", description: "General customer queries and issue resolution", duration: 15, priority: "high" },
  { id: 2, name: "Technical Assistance", description: "Hardware and software technical support", duration: 30, priority: "medium" },
  { id: 3, name: "Billing Inquiry", description: "Invoice, payment, and billing questions", duration: 10, priority: "low" },
];

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>(initialServices);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", description: "", duration: "", priority: "medium" });
  const [successMsg, setSuccessMsg] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Service name is required";
    else if (form.name.length > 100) e.name = "Max 100 characters";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.duration) e.duration = "Duration is required";
    else if (Number(form.duration) <= 0) e.duration = "Must be a positive number";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    if (editingId !== null) {
      setServices(services.map(s => s.id === editingId ? { ...s, ...form, duration: Number(form.duration) } : s));
      setSuccessMsg("Service updated successfully!");
    } else {
      setServices([...services, { id: Date.now(), ...form, duration: Number(form.duration) }]);
      setSuccessMsg("Service created successfully!");
    }
    setForm({ name: "", description: "", duration: "", priority: "medium" });
    setErrors({});
    setShowForm(false);
    setEditingId(null);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleEdit = (s: Service) => {
    setForm({ name: s.name, description: s.description, duration: String(s.duration), priority: s.priority });
    setEditingId(s.id);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = (id: number) => setServices(services.filter(s => s.id !== id));

  const priorityColor = (p: string) => {
    if (p === "high") return "bg-red-100 text-red-600";
    if (p === "medium") return "bg-yellow-100 text-yellow-600";
    return "bg-green-100 text-green-600";
  };

  const inputClass = (field: string) =>
    `w-full rounded-xl border ${errors[field] ? "border-red-400" : "border-black/[0.1]"} bg-[#f5f5f7] px-4 py-2.5 text-[14px] text-foreground outline-none focus:border-accent`;

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      <nav className="sticky top-0 z-50 border-b border-black/[0.08] bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-12 max-w-[1280px] items-center justify-between px-8">
          <div className="flex items-center gap-8">
            <Link href="/admin/admin-dashboard" className="text-[15px] font-semibold tracking-tight text-foreground">
              QueueSmart
            </Link>
            <div className="hidden items-center gap-6 sm:flex">
              <Link href="/admin/admin-dashboard" className="text-[13px] text-muted transition-colors hover:text-foreground">Dashboard</Link>
              <Link href="/admin/service-management" className="text-[13px] font-medium text-foreground">Services</Link>
              <Link href="/admin/queue-management" className="text-[13px] text-muted transition-colors hover:text-foreground">Queues</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Bell size={18} strokeWidth={1.5} className="text-muted" />
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8e8ed] text-[11px] font-semibold text-muted">AD</div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1280px] px-8 py-10">
        <div className="mb-8" style={{ animation: "fadeUp 0.5s ease-out both" }}>
          <Link href="/admin/admin-dashboard" className="mb-3 flex items-center gap-1 text-[13px] text-muted hover:text-foreground">
            <ChevronLeft size={14} /> Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-[32px] font-semibold tracking-tight text-foreground">Service Management</h1>
            <button
              onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: "", description: "", duration: "", priority: "medium" }); setErrors({}); }}
              className="rounded-full bg-accent px-5 py-2 text-[13px] font-medium text-white transition-colors hover:bg-accent-hover"
            >
              + Create Service
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-3 text-[14px] text-green-700">
            {successMsg}
          </div>
        )}

        {showForm && (
          <div className="mb-6 rounded-2xl bg-white p-8" style={{ animation: "fadeUp 0.3s ease-out both" }}>
            <h2 className="mb-6 text-[18px] font-semibold text-foreground">{editingId ? "Edit Service" : "Create New Service"}</h2>
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <label className="mb-1.5 block text-[12px] font-medium text-muted">Service Name * (max 100 chars)</label>
                <input className={inputClass("name")} value={form.name} maxLength={100}
                  onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter service name" />
                {errors.name && <p className="mt-1 text-[12px] text-red-500">{errors.name}</p>}
                <p className="mt-1 text-[11px] text-muted">{form.name.length}/100</p>
              </div>
              <div className="col-span-2">
                <label className="mb-1.5 block text-[12px] font-medium text-muted">Description *</label>
                <textarea className={`${inputClass("description")} h-20 resize-none`} value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe this service" />
                {errors.description && <p className="mt-1 text-[12px] text-red-500">{errors.description}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-muted">Expected Duration (minutes) *</label>
                <input type="number" min={1} className={inputClass("duration")} value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 15" />
                {errors.duration && <p className="mt-1 text-[12px] text-red-500">{errors.duration}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-muted">Priority Level *</label>
                <select className={inputClass("priority")} value={form.priority}
                  onChange={e => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={handleSubmit}
                className="rounded-full bg-accent px-6 py-2.5 text-[14px] font-medium text-white hover:bg-accent-hover">
                {editingId ? "Update Service" : "Create Service"}
              </button>
              <button onClick={() => { setShowForm(false); setErrors({}); }}
                className="rounded-full border border-black/[0.1] bg-[#f5f5f7] px-6 py-2.5 text-[14px] font-medium text-foreground hover:bg-[#e8e8ed]">
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-8" style={{ animation: "fadeUp 0.5s ease-out 0.05s both" }}>
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">All Services</p>
          <div className="divide-y divide-black/[0.06]">
            {services.map(s => (
              <div key={s.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-[14px] font-medium text-foreground">{s.name}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${priorityColor(s.priority)}`}>{s.priority}</span>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted">{s.description}</p>
                  <p className="mt-0.5 text-[12px] text-muted">⏱ {s.duration} min avg</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(s)}
                    className="rounded-full border border-black/[0.1] px-4 py-1.5 text-[13px] font-medium text-foreground hover:bg-[#f5f5f7]">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="rounded-full bg-red-50 px-4 py-1.5 text-[13px] font-medium text-red-500 hover:bg-red-100">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}