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
import { User, Settings, FolderOpen, Mail, MailCheck, ExternalLink } from "lucide-react";
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

export function ProfileSettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [recoveryEmail, setRecoveryEmail] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
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
              <div className="w-full flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium">Email</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{profile.email || "—"}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    noMotion
                    className="h-7 gap-1 text-xs"
                    onClick={() => router.push("/settings/profile/change-email")}
                  >
                    Change <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
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
