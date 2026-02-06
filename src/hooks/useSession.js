import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem("recoveryMode") === "true";
  });
  const user = useMemo(() => session?.user ?? null, [session]);

  useEffect(() => {
    let ignore = false;

    (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!ignore) {
        setSession(data?.session ?? null);
        setLoading(false);
      }
      if (error) console.error(error);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession ?? null);
        setLoading(false);

        if (event === "PASSWORD_RECOVERY") {
          setRecoveryMode(true);
          window.sessionStorage.setItem("recoveryMode", "true");
        }

        if (!newSession) {
          setRecoveryMode(false);
          window.sessionStorage.removeItem("recoveryMode");
        }
      }
    );

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setRecoveryMode(false);
    window.sessionStorage.removeItem("recoveryMode");
  };

  return { session, user, loading, recoveryMode, signOut };
}
