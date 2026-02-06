import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage({ user, profile, onProfileUpdated }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState(profile?.username ?? "");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setUsername(profile?.username ?? "");
  }, [profile?.username]);

  const trimmedUsername = username.trim();
  const isMissing = submitted && !trimmedUsername;
  const isUnchanged = trimmedUsername === (profile?.username ?? "");

  const submit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!trimmedUsername || isUnchanged) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .update({ username: trimmedUsername })
        .eq("id", user.id)
        .select("username")
        .single();

      if (error) throw error;
      await onProfileUpdated?.(data);
      toast.success("Username updated.");
      navigate("/", { replace: true });
    } catch (err) {
      const message =
        err.message?.includes("duplicate") || err.message?.includes("unique")
          ? "That username is already taken."
          : err.message || "Something went wrong.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const helperText = useMemo(() => {
    if (isMissing) return "Username is required.";
    if (isUnchanged) return "This is already your current username.";
    return null;
  }, [isMissing, isUnchanged]);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your public username for display across the app.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} className="space-y-6">
            <Field invalid={isMissing}>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={isMissing || undefined}
                required
              />
            </Field>
            {helperText && (
              <p
                className={
                  isMissing
                    ? "text-sm text-destructive"
                    : "text-sm text-muted-foreground"
                }
              >
                {helperText}
              </p>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex justify-end">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => navigate("/", { replace: true })}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={submit}
              disabled={loading || isUnchanged || !trimmedUsername}
            >
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
