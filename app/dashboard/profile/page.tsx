"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { useSession, authClient } from "@/lib/auth-client";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getInitials(name?: string | null) {
  if (!name) return "U";

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return "U";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function getPasswordStrength(password: string) {
  if (!password) {
    return { label: "Add a new password", tone: "text-muted-foreground" };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password) && /\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return { label: "Weak", tone: "text-destructive" };
  }

  if (score <= 3) {
    return { label: "Good", tone: "text-amber-600" };
  }

  return { label: "Strong", tone: "text-green-600" };
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const [name, setName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  const currentName = session?.user?.name ?? "";
  const currentEmail = session?.user?.email ?? "";
  const username = (session?.user as Record<string, string> | undefined)?.username ?? "";
  const passwordStrength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const nameChanged = name.trim() !== "" && name.trim() !== currentName;

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  if (isPending) {
    return (
      <SidebarInset>
        <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4">
          <span className="text-xs font-medium text-muted-foreground">Profile</span>
        </header>
        <div className="flex items-center justify-center p-8">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Loading profile...
          </p>
        </div>
      </SidebarInset>
    );
  }

  async function handleUpdateName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setNameError("");
    setNameSuccess(false);

    if (!nameChanged) {
      setNameError("Enter a new display name before saving.");
      return;
    }

    setNameLoading(true);
    const { error } = await authClient.updateUser({ name: name.trim() });

    if (error) {
      const message = error.message ?? "Failed to update name.";
      setNameError(message);
      toast.error(message);
    } else {
      setNameSuccess(true);
      toast.success("Display name updated.");
    }

    setNameLoading(false);
  }

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwError("");
    setPwSuccess(false);

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }

    setPwLoading(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });

    if (error) {
      const message = error.message ?? "Failed to change password.";
      setPwError(message);
      toast.error(message);
    } else {
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed successfully.");
    }

    setPwLoading(false);
  }

  return (
    <SidebarInset>
      <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
        <span className="text-xs font-medium text-muted-foreground">Profile</span>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
        <Card className="overflow-hidden border-border/70 bg-gradient-to-r from-card via-card to-muted/30">
          <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-14">
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {getInitials(currentName || username || currentEmail)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-tight">
                    {currentName || "Your profile"}
                  </h1>
                  <Badge variant="outline">Account settings</Badge>
                </div>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Review your account details, update how your name appears, and keep your
                  sign-in secure.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm shadow-sm">
              <p className="font-medium">Signed in as</p>
              <p className="text-muted-foreground">{currentEmail || "No email available"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Profile details</CardTitle>
            <CardDescription>Your current account information at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Full name</Label>
              <Input value={currentName} readOnly className="bg-muted/60" />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={username} readOnly className="bg-muted/60" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={currentEmail} readOnly className="bg-muted/60" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="h-full">
            <form onSubmit={handleUpdateName}>
              <CardHeader className="border-b">
                <CardTitle>Update display name</CardTitle>
                <CardDescription>
                  This is the name shown across the dashboard and account menus.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Display name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setNameError("");
                      setNameSuccess(false);
                    }}
                    disabled={nameLoading}
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Keep it recognizable so teammates and accounting staff can identify your
                  requests quickly.
                </p>
                {nameError ? <p className="text-sm text-destructive">{nameError}</p> : null}
                {nameSuccess ? (
                  <p className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircleIcon size={16} />
                    Name updated successfully.
                  </p>
                ) : null}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button type="submit" className="w-full sm:w-auto" disabled={nameLoading || !nameChanged}>
                  {nameLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="size-4" />
                      Saving changes...
                    </span>
                  ) : (
                    "Save name"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card className="h-full border-border/70">
            <form onSubmit={handleChangePassword}>
              <CardHeader className="border-b">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>
                      Change your password and protect your account sessions.
                    </CardDescription>
                  </div>
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <ShieldCheckIcon size={18} weight="fill" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={pwLoading}
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                      onClick={() => setShowCurrentPassword((value) => !value)}
                    >
                      {showCurrentPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <Label htmlFor="newPassword">New password</Label>
                    <span className={`text-xs font-medium ${passwordStrength.tone}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Create a stronger password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPwError("");
                        setPwSuccess(false);
                      }}
                      disabled={pwLoading}
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                      onClick={() => setShowNewPassword((value) => !value)}
                    >
                      {showNewPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use at least 8 characters, plus a mix of letters, numbers, and symbols.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPwError("");
                        setPwSuccess(false);
                      }}
                      disabled={pwLoading}
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground"
                      onClick={() => setShowConfirmPassword((value) => !value)}
                    >
                      {showConfirmPassword ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {confirmPassword ? (
                    <p className={`text-xs ${passwordsMatch ? "text-green-600" : "text-amber-600"}`}>
                      {passwordsMatch ? "Passwords match." : "Passwords do not match yet."}
                    </p>
                  ) : null}
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
                  Changing your password will sign out your other active sessions for extra
                  protection.
                </div>

                {pwError ? (
                  <p className="flex items-center gap-2 text-sm text-destructive">
                    <WarningCircleIcon size={16} />
                    {pwError}
                  </p>
                ) : null}
                {pwSuccess ? (
                  <p className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircleIcon size={16} />
                    Password changed successfully.
                  </p>
                ) : null}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
                >
                  {pwLoading ? (
                    <span className="flex items-center gap-2">
                      <Spinner className="size-4" />
                      Updating password...
                    </span>
                  ) : (
                    "Change password"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </SidebarInset>
  );
}
