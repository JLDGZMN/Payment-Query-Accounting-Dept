"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
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

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      window.sessionStorage.setItem("auth-flash", "login-success");
      router.push(searchParams.get("redirect") ?? "/dashboard");
    }

    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Enter your credentials to access your account.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-3">
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
    </div>
  );
}
