import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginCard() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!email || !password) return;

    try {
      setLoading(true);

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        // signup
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        setMsg(
          "Account created. Check your email to confirm (if confirmation is enabled), then sign in."
        );
        setMode("signin");
      }
    } catch (e2) {
      setErr(e2?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2">
          <CardTitle>
            {mode === "signin" ? "Sign in" : "Create account"}
          </CardTitle>

          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "signin" ? "default" : "outline"}
              className="w-full"
              onClick={() => setMode("signin")}
            >
              Sign in
            </Button>
            <Button
              type="button"
              variant={mode === "signup" ? "default" : "outline"}
              className="w-full"
              onClick={() => setMode("signup")}
            >
              Sign up
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
            />

            {err ? <p className="text-sm text-destructive">{err}</p> : null}
            {msg ? (
              <p className="text-sm text-muted-foreground">{msg}</p>
            ) : null}

            <Button className="w-full" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "signin"
                ? "Sign in"
                : "Create account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
