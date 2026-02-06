import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
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

export default function PasswordResetPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const normalizedMsg = msg.toLowerCase();
  const weakPassword = normalizedMsg.includes(
    "password should be at least 6 characters"
  );
  const missingResetEmail = normalizedMsg.includes("please enter your email");
  const invalidResetEmail = normalizedMsg.includes(
    "unable to validate email address: invalid format"
  );
  const missingNewPassword = normalizedMsg.includes(
    "please enter and confirm your new password"
  );
  const passwordTooShort =
    submitted && password.length > 0 && password.length < 6;
  const urlParams = useMemo(() => {
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const searchParams = new URLSearchParams(window.location.search);
    return { hashParams, searchParams };
  }, []);
  const recoveryType =
    urlParams.hashParams.get("type") || urlParams.searchParams.get("type");
  const urlError =
    urlParams.hashParams.get("error") || urlParams.searchParams.get("error");
  const urlErrorCode =
    urlParams.hashParams.get("error_code") ||
    urlParams.searchParams.get("error_code");
  const urlErrorDescription =
    urlParams.hashParams.get("error_description") ||
    urlParams.searchParams.get("error_description");
  const showPasswordMismatch =
    submitted && password && confirm && password !== confirm;
  const showPasswordTooShort = passwordTooShort || weakPassword;
  const showMissingNewPassword = missingNewPassword;
  const suppressPasswordMsg =
    showPasswordTooShort || showPasswordMismatch || showMissingNewPassword;
  const suppressEmailMsg = missingResetEmail || invalidResetEmail;

  useEffect(() => {
    if (recoveryType === "recovery") {
      setRecoveryMode(true);
      window.sessionStorage.setItem("recoveryMode", "true");
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setRecoveryMode(true);
      }
    });

    if (urlErrorCode === "otp_expired") {
      toast.error("This reset link has expired. Request a new one.");
    } else if (urlError && urlErrorDescription) {
      const cleaned = urlErrorDescription.replace(/\+/g, " ");
      setMsg(cleaned);
    }

    if (urlError || urlErrorDescription || urlErrorCode) {
      window.history.replaceState({}, "", "/password-reset");
    }

    return () => {
      sub.subscription.unsubscribe();
    };
  }, [recoveryType, urlError, urlErrorDescription, urlErrorCode]);

  const requestReset = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!email) {
      setMsg("Please enter your email.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/password-reset`,
      });
      if (error) throw error;
      setMsg("Check your email for the password reset link.");
    } catch (err) {
      setMsg(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    setSubmitted(true);

    if (!password || !confirm) {
      setMsg("Please enter and confirm your new password.");
      return;
    }
    if (passwordTooShort) {
      setMsg("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setMsg("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      await supabase.auth.signOut();
      toast.success("Password updated. Please log in.");
      navigate("/login", { replace: true, state: { fromReset: true } });
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
          <CardTitle>
            {recoveryMode ? "Set a new password" : "Reset your password"}
          </CardTitle>
          <CardDescription>
            {recoveryMode
              ? "Enter a new password for your account"
              : "We'll email you a secure reset link"}
          </CardDescription>
          <CardAction>
            <Button
              variant="link"
              type="button"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login", { replace: true });
              }}
            >
              Back to login
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          {recoveryMode ? (
            <form onSubmit={updatePassword}>
              <div className="flex flex-col gap-6">
                <Field
                  invalid={
                    (submitted && !password) ||
                    passwordTooShort ||
                    (submitted && password && confirm && password !== confirm) ||
                    weakPassword ||
                    showMissingNewPassword
                  }
                >
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={
                      (submitted && !password) ||
                      passwordTooShort ||
                      (submitted && password && confirm && password !== confirm) ||
                      weakPassword ||
                      showMissingNewPassword ||
                      undefined
                    }
                    required
                  />
                </Field>
                <Field
                  invalid={
                    (submitted && !confirm) ||
                    (submitted && password && confirm && password !== confirm) ||
                    weakPassword ||
                    passwordTooShort ||
                    showMissingNewPassword
                  }
                >
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    aria-invalid={
                      (submitted && !confirm) ||
                      (submitted && password && confirm && password !== confirm) ||
                      weakPassword ||
                      passwordTooShort ||
                      showMissingNewPassword ||
                      undefined
                    }
                    required
                  />
                </Field>
                {showMissingNewPassword && (
                  <p className="text-sm text-destructive">
                    Please enter and confirm your new password.
                  </p>
                )}
                {showPasswordTooShort && (
                  <p className="text-sm text-destructive">
                    Password should be at least 6 characters.
                  </p>
                )}
                {showPasswordMismatch && (
                  <p className="text-sm text-destructive">
                    Passwords do not match.
                  </p>
                )}
                {msg && !suppressPasswordMsg && (
                  <p
                    className={
                      weakPassword || missingNewPassword
                        ? "text-sm text-destructive"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {msg}
                  </p>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={requestReset}>
              <div className="flex flex-col gap-6">
                <Field invalid={missingResetEmail || invalidResetEmail}>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={
                      missingResetEmail || invalidResetEmail || undefined
                    }
                    required
                  />
                </Field>
                {msg && !suppressEmailMsg && (
                  <p
                    className={
                      missingResetEmail || invalidResetEmail
                        ? "text-sm text-destructive"
                        : "text-sm text-muted-foreground"
                    }
                  >
                    {invalidResetEmail ? "Please enter a valid email address." : msg}
                  </p>
                )}
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            onClick={recoveryMode ? updatePassword : requestReset}
          >
            {loading
              ? "Please wait..."
              : recoveryMode
                ? "Update password"
                : "Send reset link"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
