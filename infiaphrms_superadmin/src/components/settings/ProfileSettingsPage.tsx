"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { showSuccess, showConfirm } from "@/lib/sweetalert";
import { settingsApi, API_ORIGIN } from "@/lib/api";
import { SettingsLayout } from "./SettingsLayout";
import { User, Settings, FolderOpen, ChevronRight, ChevronDown, Mail, MailCheck, ExternalLink } from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "@/context/AuthContext";

function maskEmail(email: string): string {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `*@${domain}`;
  return `${local[0]}${"*".repeat(Math.min(local.length - 2, 4))}${local[local.length - 1]}@${domain}`;
}

function resolveAvatarUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("data:") || url.startsWith("http")) return url;
  return `${API_ORIGIN}${url}`;
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

type ExpandedSection = "email" | null;

export function ProfileSettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [expandedSection, setExpandedSection] = useState<ExpandedSection>(null);
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  // ── Email change OTP state ──
  type EmailStep = "enter-email" | "verify-otp";
  const [emailStep, setEmailStep] = useState<EmailStep>("enter-email");
  const [emailChangeOtp, setEmailChangeOtp] = useState("");
  const [emailChangeMaskedCurrent, setEmailChangeMaskedCurrent] = useState("");
  const [emailChangeExpiry, setEmailChangeExpiry] = useState(0);
  const [emailChangeResendCooldown, setEmailChangeResendCooldown] = useState(0);
  const [emailChangeDevOtp, setEmailChangeDevOtp] = useState<string | null>(null);
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null);
  const [emailChangeAttemptsLeft, setEmailChangeAttemptsLeft] = useState(5);
  const { addToast } = useToast();
  const { updateUser, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await settingsApi.getProfile().catch(() => null);
        if (!cancelled && res) {
          setProfile({
            name: (res.name as string) || "",
            email: (res.email as string) || "",
            phone: (res.phone as string) || "",
          });
          setRecoveryEmail((res.recoveryEmail as string) || null);
          const profileImage = (res.profileImage as string) || null;
          setAvatarUrl(profileImage);
          updateUser({
            name: (res.name as string) || "Super Admin",
            email: (res.email as string) || "",
            phone: (res.phone as string) || "",
            profileImage,
          });
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, [updateUser]);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  useEffect(() => {
    if (emailChangeExpiry <= 0) return;
    const t = setInterval(() => setEmailChangeExpiry((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [emailChangeExpiry]);

  useEffect(() => {
    if (emailChangeResendCooldown <= 0) return;
    const t = setInterval(() => setEmailChangeResendCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [emailChangeResendCooldown]);

  function toggleSection(section: ExpandedSection) {
    const opening = expandedSection !== section;
    setExpandedSection(opening ? section : null);
    if (section === "email" && opening) {
      setNewEmail("");
      setEmailStep("enter-email");
      setEmailChangeOtp("");
      setEmailChangeError(null);
    }
  }

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    setPendingAvatarFile(file);
    setAvatarPreviewUrl(URL.createObjectURL(file));
  }

  async function uploadPendingAvatar() {
    if (!pendingAvatarFile) return avatarUrl;
    const formData = new FormData();
    formData.append("profilePicture", pendingAvatarFile);
    const data = await settingsApi.uploadAvatar(formData);
    const uploadResult = data as Record<string, unknown>;
    const uploadedUrl = data.avatar_url || uploadResult.profileImage || uploadResult.profile_image;
    if (typeof uploadedUrl !== "string") throw new Error("Avatar uploaded, but no image URL was returned");
    setAvatarUrl(uploadedUrl);
    setPendingAvatarFile(null);
    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
      setAvatarPreviewUrl(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
    return uploadedUrl;
  }

  async function handleSaveProfile() {
    if (savingProfile) return;
    try {
      setSavingProfile(true);
      const updated = await settingsApi.updateProfile({ name: profile.name, phone: profile.phone });
      const savedAvatarUrl = await uploadPendingAvatar();
      updateUser({
        name: ((updated.name as string) || profile.name || "Super Admin"),
        phone: ((updated.phone as string) || profile.phone),
        profileImage: (savedAvatarUrl || (updated.profileImage as string) || null),
      });
      addToast({ title: "Profile updated", type: "success" });
      await showSuccess("Profile Updated", "Your profile information has been saved.");
    } catch (err: unknown) {
      addToast({ title: getErrorMessage(err, "Failed to update profile"), type: "error" });
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleRequestEmailChange() {
    const email = newEmail.trim().toLowerCase();
    if (!email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setEmailChangeError("Please enter a valid email address");
      return;
    }
    setEmailChangeError(null);
    setSavingEmail(true);
    try {
      const res = await settingsApi.requestEmailChange(email);
      setEmailChangeMaskedCurrent((res as any).maskedCurrentEmail || "");
      setEmailChangeExpiry((res as any).expiresInSeconds || 300);
      setEmailChangeResendCooldown(60);
      setEmailChangeDevOtp((res as any).devOtp || null);
      setEmailChangeAttemptsLeft(5);
      setEmailChangeOtp("");
      setEmailStep("verify-otp");
    } catch (err: any) {
      const code = err.data?.code || err.code;
      if (code === "resend_too_soon") {
        setEmailChangeResendCooldown(err.data?.waitSeconds || 60);
        setEmailChangeError(`Please wait ${err.data?.waitSeconds || 60}s before resending`);
      } else {
        setEmailChangeError(err.data?.message || err.message || "Failed to send OTP");
      }
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleConfirmEmailChange() {
    const code = emailChangeOtp.trim().toUpperCase();
    if (!code || code.length !== 6 || !/^[A-Z0-9]{6}$/.test(code)) {
      setEmailChangeError("Enter a valid 6-character OTP");
      return;
    }
    setEmailChangeError(null);
    setSavingEmail(true);
    try {
      const res = await settingsApi.confirmEmailChange(code);
      const updatedEmail = (res as any).email || newEmail.trim().toLowerCase();
      setProfile((p) => ({ ...p, email: updatedEmail }));
      updateUser({ email: updatedEmail });
      setNewEmail("");
      setEmailChangeOtp("");
      setEmailChangeDevOtp(null);
      setExpandedSection(null);
      setEmailStep("enter-email");
      await Swal.fire({
        icon: "success",
        title: "Email updated!",
        html: `Your primary email has been changed to <strong>${(res as any).maskedEmail || updatedEmail}</strong>.`,
        confirmButtonText: "Done",
        confirmButtonColor: "#16a34a",
        timer: 6000,
        timerProgressBar: true,
      });
    } catch (err: any) {
      const errCode = err.data?.code || err.code;
      const msg = err.data?.message || err.message || "Verification failed";
      if (errCode === "too_many_attempts") {
        setEmailChangeError("Too many failed attempts. Please start over.");
        setEmailStep("enter-email");
        setEmailChangeAttemptsLeft(0);
      } else {
        setEmailChangeAttemptsLeft(err.data?.attemptsLeft ?? Math.max(0, emailChangeAttemptsLeft - 1));
        setEmailChangeError(errCode === "expired_otp" ? "OTP has expired. Click Resend." : msg);
      }
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleDeleteAccount() {
    const result = await showConfirm(
      "Delete Account",
      "All of your account information will be permanently deleted. This action cannot be undone.",
      "Delete Account"
    );
    if (!result.isConfirmed) return;
    try {
      setDeletingAccount(true);
      await settingsApi.deleteAccount();
      logout();
    } catch (err: unknown) {
      addToast({ title: getErrorMessage(err, "Failed to delete account"), type: "error" });
      setDeletingAccount(false);
    }
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Profile" }]} />
      <SettingsLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your SuperAdmin account details</p>
        </div>

        {/* ── Personal Information ── */}
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {avatarPreviewUrl || avatarUrl ? (
                <img
                  src={avatarPreviewUrl || resolveAvatarUrl(avatarUrl) || undefined}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover border bg-muted"
                  onError={() => {
                    if (avatarPreviewUrl) {
                      URL.revokeObjectURL(avatarPreviewUrl);
                      setAvatarPreviewUrl(null);
                      setPendingAvatarFile(null);
                    } else {
                      setAvatarUrl(null);
                    }
                  }}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  {profile.name ? profile.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "SA"}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>Change Avatar</Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>
            <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
            <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* ── Account Settings ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" /> Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">

            {/* Email row */}
            <div className="border-b last:border-b-0">
              <button
                type="button"
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent/50 transition-colors text-left"
                onClick={() => toggleSection("email")}
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{profile.email || "—"}</span>
                  {expandedSection === "email" ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {expandedSection === "email" && (
                <div className="px-6 pb-5 pt-2 bg-accent/20">
                  {emailStep === "enter-email" ? (
                    <div className="space-y-3">
                      <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 flex items-start gap-2">
                        <Mail className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-800">
                          An OTP will be sent to your current email <span className="font-semibold">{maskEmail(profile.email)}</span> to verify this change.
                        </p>
                      </div>
                      <Input
                        label="New Email Address"
                        type="email"
                        value={newEmail}
                        onChange={(e) => { setNewEmail(e.target.value); setEmailChangeError(null); }}
                        onKeyDown={(e: any) => e.key === "Enter" && !savingEmail && handleRequestEmailChange()}
                        placeholder="newaddress@example.com"
                        error={emailChangeError || undefined}
                      />
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={handleRequestEmailChange} disabled={savingEmail || !newEmail.trim()}>
                          {savingEmail ? "Sending..." : "Send OTP"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setExpandedSection(null); setEmailChangeError(null); }}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg border bg-muted/50 px-3 py-2">
                        <span className="text-xs text-muted-foreground">OTP sent to <span className="font-medium text-foreground">{emailChangeMaskedCurrent}</span></span>
                        <span className={`text-xs font-mono font-semibold ${emailChangeExpiry > 30 ? "text-green-600" : emailChangeExpiry > 0 ? "text-amber-600" : "text-red-500"}`}>
                          {emailChangeExpiry > 0 ? `${Math.floor(emailChangeExpiry / 60)}:${String(emailChangeExpiry % 60).padStart(2, "0")}` : "Expired"}
                        </span>
                      </div>
                      {emailChangeDevOtp && (
                        <div className="rounded border border-yellow-200 bg-yellow-50 p-2 text-center">
                          <p className="text-[10px] font-semibold text-yellow-700 uppercase tracking-wider mb-0.5">Dev OTP</p>
                          <p className="text-sm font-mono font-bold text-yellow-800 tracking-widest">{emailChangeDevOtp}</p>
                        </div>
                      )}
                      <Input
                        label="6-Character OTP"
                        type="text"
                        placeholder="A1B2C3"
                        maxLength={6}
                        value={emailChangeOtp}
                        onChange={(e) => { setEmailChangeOtp(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setEmailChangeError(null); }}
                        onKeyDown={(e: any) => e.key === "Enter" && !savingEmail && handleConfirmEmailChange()}
                        className="tracking-widest text-center font-mono text-lg uppercase"
                        error={emailChangeError || undefined}
                        disabled={emailChangeExpiry === 0}
                      />
                      {emailChangeAttemptsLeft < 5 && emailChangeAttemptsLeft > 0 && (
                        <p className="text-xs text-amber-600">{emailChangeAttemptsLeft} attempt(s) remaining</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" onClick={handleConfirmEmailChange} disabled={savingEmail || emailChangeOtp.length !== 6 || emailChangeExpiry === 0}>
                          {savingEmail ? "Verifying..." : "Confirm"}
                        </Button>
                        <Button size="sm" variant="outline" disabled={emailChangeResendCooldown > 0 || savingEmail} onClick={handleRequestEmailChange}>
                          {emailChangeResendCooldown > 0 ? `Resend (${emailChangeResendCooldown}s)` : "Resend"}
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEmailStep("enter-email"); setEmailChangeError(null); }}>Back</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recovery Email row — read-only; changes require OTP via Security settings */}
            <div className="border-b last:border-b-0">
              <div className="w-full flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <MailCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">Recovery email</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {recoveryEmail ? maskEmail(recoveryEmail) : "—"}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    noMotion
                    className="h-7 gap-1 text-xs"
                    onClick={() => router.push("/settings/security")}
                  >
                    Manage <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* ── Account ── */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4" /> Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="min-w-0">
                <p className="text-sm font-medium">Delete account</p>
                <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                  Keep in mind that upon deleting your account all of your account information will be deleted without the possibility of restoration.
                </p>
              </div>
              <Button
                variant="destructive"
                size="md"
                className="shrink-0 whitespace-nowrap px-5"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? "Deleting..." : "Delete account"}
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
      </SettingsLayout>
    </AdminShell>
  );
}
