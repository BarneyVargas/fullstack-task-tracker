import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function TaskItem({ task, onToggle, onDelete, onEditTitle }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  useEffect(() => {
    setDraft(task.title);
  }, [task.title]);

  const save = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await onEditTitle(task.id, trimmed);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(task.title);
    setEditing(false);
  };

  return (
    <div className="flex items-center justify-between rounded-md border p-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
        />

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") cancel();
                }}
                autoFocus
              />
              <Button size="sm" onClick={save}>
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={cancel}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span
                className={
                  task.completed
                    ? "truncate line-through opacity-60"
                    : "truncate"
                }
              >
                {task.title}
              </span>
              {task.completed ? (
                <Badge variant="secondary">Done</Badge>
              ) : (
                <Badge variant="outline">Open</Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {!editing && (
        <div className="ml-3 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(task.id)}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
}
