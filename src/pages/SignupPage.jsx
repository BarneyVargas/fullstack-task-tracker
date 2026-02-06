import { useState } from "react";
import { Link } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field } from "@/components/ui/field";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const normalizedMsg = msg.toLowerCase();
  const weakPassword = normalizedMsg.includes(
    "password should be at least 6 characters"
  );
  const nameMissing = submitted && !username.trim();
  const emailMissing = submitted && !email.trim();
  const emailInvalidFormat =
    submitted && email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  const nameInvalid = nameMissing;
  const emailInvalid = emailMissing || emailInvalidFormat;
  const passwordTooShort =
    submitted && password.length > 0 && password.length < 6;
  const passwordMismatch =
    submitted && password && confirm && password !== confirm;
  const passwordMissing = submitted && !password;
  const confirmMissing = submitted && !confirm;
  const passwordInvalid =
    passwordMissing || passwordMismatch || weakPassword || passwordTooShort;
  const confirmInvalid =
    confirmMissing || passwordMismatch || weakPassword || passwordTooShort;

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setSubmitted(true);

    if (
      !username.trim() ||
      !email.trim() ||
      emailInvalidFormat ||
      !password ||
      !confirm ||
      passwordTooShort ||
      password !== confirm
    ) {
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
        },
      });
      if (error) throw error;
      setMsg("Account created. Check your email to confirm.");
    } catch (err) {
      setMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
          <CardAction>
            <Button variant="link" type="button" asChild>
              <Link to="/login">Back to login</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit}>
            <div className="flex flex-col gap-6">
              <Field invalid={nameInvalid}>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  aria-invalid={nameInvalid || undefined}
                  required
                />
              </Field>

              <Field invalid={emailInvalid}>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={emailInvalid || undefined}
                  required
                />
              </Field>

              <Field invalid={passwordInvalid}>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={passwordInvalid || undefined}
                  required
                />
              </Field>

              <Field invalid={confirmInvalid}>
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  aria-invalid={confirmInvalid || undefined}
                  required
                />
              </Field>

              {nameMissing && (
                <p className="text-sm text-destructive">
                  Username is a required field.
                </p>
              )}
              {emailInvalidFormat && (
                <p className="text-sm text-destructive">
                  Please enter a valid email address.
                </p>
              )}
              {passwordTooShort && (
                <p className="text-sm text-destructive">
                  Password should be at least 6 characters.
                </p>
              )}
              {passwordMismatch && (
                <p className="text-sm text-destructive">
                  Passwords do not match.
                </p>
              )}

              {msg && (
                <p
                  className={
                    weakPassword
                      ? "text-sm text-destructive"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {msg}
                </p>
              )}
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
            {loading ? "Please wait..." : "Create account"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
