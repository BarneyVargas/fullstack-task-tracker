import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";

export default function TaskHeader({
  email,
  username,
  totalCount,
  openCount,
  doneCount,
}) {
  const displayName = username || email;
  const displayMeta = username && email ? `(${email})` : null;

  return (
    <CardHeader className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-xl">Task Tracker</CardTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
            <span
              className="truncate"
              title={`${displayName} ${displayMeta ?? ""}`.trim()}
            >
              Signed in as {displayName} {displayMeta}
            </span>
            <span aria-hidden="true" className="shrink-0">
              •
            </span>
            <Link to="/profile" className="shrink-0 hover:underline">
              Edit profile
            </Link>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="rounded" variant="outline">
            Total: {totalCount}
          </Badge>
          <Badge className="rounded" variant="outline">
            Open: {openCount}
          </Badge>
          <Badge className="rounded" variant="secondary">
            Done: {doneCount}
          </Badge>
        </div>
      </div>
    </CardHeader>
  );
}
