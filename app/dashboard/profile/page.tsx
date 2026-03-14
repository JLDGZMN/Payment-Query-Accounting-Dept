"use client";

import { useState } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();

  const [name, setName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwError, setPwError] = useState("");

  if (isPending) {
    return (
      <SidebarInset>
        <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4">
          <span className="text-xs font-medium text-muted-foreground">Profile</span>
        </header>
        <div className="flex items-center justify-center p-8">
          <p className="text-xs text-muted-foreground">Loading…</p>
        </div>
      </SidebarInset>
    );
  }

  async function handleUpdateName(e: React.SyntheticEvent) {
    e.preventDefault();
    setNameError("");
    setNameSuccess(false);
    if (!name.trim()) return;
    setNameLoading(true);

    const { error } = await authClient.updateUser({ name });
    if (error) {
      setNameError(error.message ?? "Failed to update name.");
    } else {
      setNameSuccess(true);
      setName("");
    }
    setNameLoading(false);
  }

  async function handleChangePassword(e: React.SyntheticEvent) {
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
      setPwError(error.message ?? "Failed to change password.");
    } else {
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
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

      <div className="flex flex-1 flex-col items-center justify-start gap-6 p-8">

        {/* Account Info */}
        <Card className="w-full max-w-2xl">
          <CardHeader className="border-b">
            <CardTitle>Account Info</CardTitle>
            <CardDescription>Your current account details.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <Label>Full Name</Label>
              <Input value={session?.user?.name ?? ""} readOnly className="bg-muted" />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Username</Label>
              <Input
                value={(session?.user as Record<string, string> | undefined)?.username ?? ""}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Email</Label>
              <Input value={session?.user?.email ?? ""} readOnly className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        {/* Update Name + Change Password side by side */}
        <div className="flex w-full max-w-2xl flex-col gap-6 sm:flex-row sm:items-start">

          {/* Update Name */}
          <Card className="flex-1">
            <form onSubmit={handleUpdateName}>
              <CardHeader className="border-b">
                <CardTitle>Update Name</CardTitle>
                <CardDescription>Change your display name.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="name">New Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={session?.user?.name ?? "Enter new name"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                {nameError && <p className="text-xs text-destructive">{nameError}</p>}
                {nameSuccess && <p className="text-xs text-green-600">Name updated successfully.</p>}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button type="submit" className="w-full" disabled={nameLoading}>
                  {nameLoading ? "Saving…" : "Save Name"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="flex-1">
            <form onSubmit={handleChangePassword}>
              <CardHeader className="border-b">
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 pt-4">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {pwError && <p className="text-xs text-destructive">{pwError}</p>}
                {pwSuccess && <p className="text-xs text-green-600">Password changed successfully.</p>}
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button type="submit" className="w-full" disabled={pwLoading}>
                  {pwLoading ? "Saving…" : "Change Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>

        </div>
      </div>
    </SidebarInset>
  );
}
