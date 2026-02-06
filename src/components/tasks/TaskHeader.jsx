import { Link } from "react-router-dom";
import { CardHeader, CardTitle } from "@/components/ui/card";

export default function TaskHeader({ email, username }) {
  const displayName = username || email;
  const displayMeta = username && email ? `(${email})` : null;

  return (
    <CardHeader className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-xl">Task Tracker</CardTitle>
          <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span
              className="min-w-0 flex items-center gap-1"
              title={`${displayName} ${displayMeta ?? ""}`.trim()}
            >
              <span className="shrink-0">Signed in as</span>
              <span className="truncate font-medium text-foreground/80">
                {displayName}
              </span>
              {displayMeta && (
                <span className="max-w-[10rem] truncate text-muted-foreground/80 sm:max-w-none">
                  {displayMeta}
                </span>
              )}
            </span>
            <span aria-hidden="true" className="shrink-0">
              •
            </span>
            <Link to="/profile" className="shrink-0 hover:underline">
              Edit profile
            </Link>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
