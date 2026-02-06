import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const INVALID_LOGIN_MESSAGE = "Incorrect username or password";
const MISSING_CREDENTIALS_MESSAGE = "Please enter an email and password.";

export default function LoginPage() {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const cameFromReset = Boolean(location.state?.fromReset);
  const normalizedMsg = msg.toLowerCase();
  const isMissingCredentials = normalizedMsg.includes(
    "please enter an email and password"
  );
  const invalidCredentials = normalizedMsg.includes("invalid login credentials");
  const loginInvalid = isMissingCredentials || invalidCredentials;

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!email || !password) {
      setMsg(MISSING_CREDENTIALS_MESSAGE);
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      setMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const displayMessage = invalidCredentials ? INVALID_LOGIN_MESSAGE : msg;
  const messageClass = loginInvalid
    ? "text-sm text-destructive"
    : "text-sm text-muted-foreground";
  const resetMessageClass = "text-sm text-emerald-600";

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button variant="link" type="button" asChild>
              <Link to="/signup">Sign Up</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit}>
            <div className="flex flex-col gap-6">
              <Field invalid={loginInvalid}>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  aria-invalid={loginInvalid || undefined}
                  required
                />
              </Field>

              <Field invalid={loginInvalid}>
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/password-reset"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-invalid={loginInvalid || undefined}
                  required
                />
              </Field>

              {cameFromReset && (
                <p className={resetMessageClass}>
                  Password updated. Please log in.
                </p>
              )}
              {msg && <p className={messageClass}>{displayMessage}</p>}
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            onClick={submit}
          >
            {loading ? "Please wait..." : "Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
