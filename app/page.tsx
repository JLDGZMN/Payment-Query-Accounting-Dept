"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { AuthBackground } from "@/components/auth-background";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const AUTH_FLASH_KEY = "auth-flash";
const AUTH_FLASH_USERNAME_KEY = "auth-flash-username";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const signupSuccessMessage =
    searchParams.get("signup") === "success"
      ? searchParams.get("username")?.trim()
        ? `Account created successfully! You can sign in now.`
        : "Account created successfully. You can sign in now."
      : "";

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await authClient.signIn.username({
      username,
      password,
    });

    if (error) {
      setError(error.message ?? "Sign in failed");
    } else {
      window.sessionStorage.setItem(AUTH_FLASH_KEY, "login-success");
      window.sessionStorage.setItem(
        AUTH_FLASH_USERNAME_KEY,
        username.trim()
      );
      router.push(searchParams.get("redirect") ?? "/dashboard");
    }

    setLoading(false);
  }

  return (
    <AuthBackground>
      <Card className="w-full max-w-sm border-white/20 bg-background/88 shadow-2xl backdrop-blur-md supports-[backdrop-filter]:bg-background/80 dark:border-white/10 dark:bg-slate-950/75">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-3">
            {signupSuccessMessage && (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
                {signupSuccessMessage}
              </p>
            )}

            <div className="flex flex-col gap-1">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col gap-2 border-t-0 pt-0 px-4 pb-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : "Sign In"}
            </Button>
            <Button type="button" variant="ghost" className="w-full" asChild>
              <Link href="/signup">Don&apos;t have an account? Sign Up</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AuthBackground>
  );
}
