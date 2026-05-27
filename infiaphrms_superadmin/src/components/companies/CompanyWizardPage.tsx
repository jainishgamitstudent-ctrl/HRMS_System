"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useToast } from "@/components/providers/ToastProvider";
import { INDUSTRIES, COMPANY_SIZES, COUNTRIES, PLANS } from "@/lib/constants";
import { companiesApi } from "@/lib/api";
import { Check, ChevronRight, ChevronLeft, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, label: "Basic Info" },
  { id: 2, label: "Branding" },
  { id: 3, label: "Plan" },
  { id: 4, label: "Admin Invite" },
  { id: 5, label: "Review" },
];

export function CompanyWizardPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    industry: "",
    size: "",
    country: "",
    logo: "",
    primaryColor: "#2563eb",
    subdomain: "",
    plan: "Free",
    adminName: "",
    adminEmail: "",
    sendInvite: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function updateField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canProceed() {
    if (step === 1) return form.name && form.email && form.industry && form.size && form.country;
    if (step === 2) return true;
    if (step === 3) return true;
    if (step === 4) return !form.sendInvite || (form.adminName && form.adminEmail);
    return true;
  }

  function handleLogoDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => updateField("logo", ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleLogoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => updateField("logo", ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  function clearLogo() {
    setLogoFile(null);
    updateField("logo", "");
  }

  async function submit() {
    setSubmitting(true);
    try {
      const company = await companiesApi.create({
        companyName: form.name,
        email: form.email,
        industry: form.industry,
        size: form.size,
        country: form.country,
        plan: form.plan,
        subdomain: form.subdomain,
        primaryColor: form.primaryColor,
        admin_name: form.adminName,
        admin_email: form.adminEmail,
        send_invite: form.sendInvite,
      });
      const companyId = (company as any).company?._id || (company as any)._id || (company as any).id;

      if (companyId && logoFile) {
        const fd = new FormData();
        fd.append("logo", logoFile);
        await companiesApi.uploadLogo(companyId, fd);
      }

      addToast({ title: "Company created successfully", type: "success" });
      router.push("/companies");
    } catch (err: any) {
      addToast({ title: err.message || "Failed to create company", type: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Companies", href: "/companies" }, { label: "Create Company" }]} />
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Company</h1>
          <p className="text-sm text-muted-foreground">Set up a new tenant company in 5 steps</p>
        </div>

        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                s.id < step ? "bg-green-100 text-green-700" : s.id === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {s.id < step ? <Check className="h-4 w-4" /> : s.id}
              </div>
              <span className={cn("hidden sm:block text-sm", s.id === step ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
              {i < steps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />}
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold">Basic Information</h2>
              <Input label="Company Name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
              <Input label="Company Email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
              <Select label="Industry" value={form.industry} onChange={(e) => updateField("industry", e.target.value)} options={INDUSTRIES.map(i => ({ value: i, label: i }))} required />
              <Select label="Company Size" value={form.size} onChange={(e) => updateField("size", e.target.value)} options={COMPANY_SIZES.map(s => ({ value: s, label: s }))} required />
              <Select label="Country" value={form.country} onChange={(e) => updateField("country", e.target.value)} options={COUNTRIES.map(c => ({ value: c, label: c }))} required />
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold">Branding</h2>
              <Input label="Primary Color" type="color" value={form.primaryColor} onChange={(e) => updateField("primaryColor", e.target.value)} />
              <Input label="Subdomain" value={form.subdomain} onChange={(e) => updateField("subdomain", e.target.value)} hint="Optional custom subdomain" />
              <div>
                <label className="text-sm font-medium">Logo Upload</label>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="logo-input"
                  onChange={handleLogoSelect}
                />
                <label htmlFor="logo-input">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleLogoDrop}
                    className={cn(
                      "mt-1.5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer",
                      dragOver ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    )}
                  >
                    {form.logo ? (
                      <div className="relative">
                        <img src={form.logo} alt="Logo preview" className="h-24 w-24 object-contain rounded-md" />
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); clearLogo(); }}
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Drop logo here or click to upload</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold">Plan Selection</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <button
                    key={plan}
                    onClick={() => updateField("plan", plan)}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors duration-200 ease-out",
                      form.plan === plan ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"
                    )}
                  >
                    <p className="font-semibold">{plan}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan === "Free" ? "₹0/month" : plan === "Pro" ? "₹99/month" : "₹499/month"}
                    </p>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 4 && (
            <>
              <h2 className="text-lg font-semibold">Admin Invite</h2>
              <Input label="Full Name" value={form.adminName} onChange={(e) => updateField("adminName", e.target.value)} />
              <Input label="Email" type="email" value={form.adminEmail} onChange={(e) => updateField("adminEmail", e.target.value)} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.sendInvite} onChange={(e) => updateField("sendInvite", e.target.checked)} className="h-4 w-4" />
                Send invitation email
              </label>
            </>
          )}
          {step === 5 && (
            <>
              <h2 className="text-lg font-semibold">Review & Confirm</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Company Name</span><span className="font-medium">{form.name}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Email</span><span className="font-medium">{form.email}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Industry</span><span className="font-medium">{form.industry}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Size</span><span className="font-medium">{form.size}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Country</span><span className="font-medium">{form.country}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Plan</span><span className="font-medium">{form.plan}</span></div>
                <div className="flex justify-between py-2 border-b border-border"><span className="text-muted-foreground">Admin</span><span className="font-medium">{form.adminName || "—"} ({form.adminEmail || "—"})</span></div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep((s) => s - 1)} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          {step < 5 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canProceed()}>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={submitting}>{submitting ? "Creating..." : "Create Company"}</Button>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
