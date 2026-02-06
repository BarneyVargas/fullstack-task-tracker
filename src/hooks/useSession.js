import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
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
      (_event, newSession) => {
        setSession(newSession ?? null);
        setLoading(false);
      }
    );

    return () => {
      ignore = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { session, user, loading, signOut };
}
