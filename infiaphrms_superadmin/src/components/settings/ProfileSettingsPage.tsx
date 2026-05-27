"use client";

import { useState, useEffect, useRef } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/providers/ToastProvider";
import { showSuccess } from "@/lib/sweetalert";
import { settingsApi, API_ORIGIN } from "@/lib/api";
import { SettingsLayout } from "./SettingsLayout";
import { User } from "lucide-react";

export function ProfileSettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { addToast } = useToast();
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
          setAvatarUrl((res.profileImage as string) || null);
        }
      } catch {
        // ignore
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);
      console.log("[DEBUG] Uploading avatar file:", file.name, file.size);
      const data = await settingsApi.uploadAvatar(formData);
      console.log("[DEBUG] Avatar upload response:", data);
      setAvatarUrl(data.avatar_url);
      addToast({ title: "Avatar updated", type: "success" });
    } catch (err: any) {
      console.error("[DEBUG] Avatar upload error:", err);
      addToast({ title: err.message || "Failed to upload avatar", type: "error" });
    }
  }

  async function handleSaveProfile() {
    try {
      await settingsApi.updateProfile(profile);
      addToast({ title: "Profile updated", type: "success" });
      await showSuccess("Profile Updated", "Your profile information has been saved.");
    } catch (err: any) {
      addToast({ title: err.message || "Failed to update profile", type: "error" });
    }
  }

  async function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      addToast({ title: "Passwords do not match", type: "error" });
      return;
    }
    try {
      await settingsApi.changePassword(currentPassword, newPassword);
      addToast({ title: "Password updated", type: "success" });
      await showSuccess("Password Updated", "Your password has been changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      addToast({ title: err.message || "Failed to change password", type: "error" });
    }
  }

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "Profile" }]} />
      <SettingsLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your SuperAdmin account details</p>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" /> Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl.startsWith("data:") || avatarUrl.startsWith("http") ? avatarUrl : `${API_ORIGIN}${avatarUrl}`}
                  alt="Avatar"
                  className="h-16 w-16 rounded-full object-cover border bg-muted"
                  onError={(e) => { setAvatarUrl(null); }}
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
                onChange={handleAvatarUpload}
              />
            </div>
            <Input label="Full Name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
            <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required />
            <Input label="Phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input label="Current Password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
            <Input label="New Password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
            <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            <Button variant="secondary" onClick={handleChangePassword}>Update Password</Button>
          </CardContent>
        </Card>
      </div>
      </SettingsLayout>
    </AdminShell>
  );
}
