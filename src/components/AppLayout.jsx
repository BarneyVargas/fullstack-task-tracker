import { useLocation } from "react-router-dom";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export default function AppLayout({ session, onSignOut, children }) {
  const location = useLocation();
  const isAuthRoute = ["/login", "/signup", "/password-reset"].includes(
    location.pathname
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {session && (
          <Button variant="outline" size="sm" onClick={onSignOut}>
            Logout
          </Button>
        )}
        <ModeToggle />
      </div>

      <div className={isAuthRoute ? "" : "pt-20"}>{children}</div>
    </div>
  );
}
