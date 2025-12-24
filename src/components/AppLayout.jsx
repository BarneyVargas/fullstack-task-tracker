import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export default function AppLayout({ session, onSignOut, children }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute top-6 right-6 flex items-center gap-3">
        {session && (
          <Button variant="outline" size="sm" onClick={onSignOut}>
            Logout
          </Button>
        )}
        <ModeToggle />
      </div>

      <div className="pt-20">{children}</div>
    </div>
  );
}
