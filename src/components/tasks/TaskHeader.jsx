import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle } from "@/components/ui/card";

export default function TaskHeader({ email, totalCount, openCount, doneCount }) {
  return (
    <CardHeader className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-xl">Task Tracker</CardTitle>
          <p className="text-xs text-muted-foreground">Signed in as {email}</p>
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
