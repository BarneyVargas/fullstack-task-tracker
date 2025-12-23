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

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex items-center gap-3 min-w-0">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task)}
        />

        <div className="min-w-0">
          {editing ? (
            <div className="flex items-center gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") save();
                  if (e.key === "Escape") {
                    setDraft(task.title);
                    setEditing(false);
                  }
                }}
              />
              <Button size="sm" onClick={save}>
                Save
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setDraft(task.title);
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <p className="truncate">{task.title}</p>
              {task.completed ? <Badge variant="secondary">Done</Badge> : null}
            </div>
          )}
        </div>
      </div>

      {!editing ? (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setEditing(true)}
          >
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
      ) : null}
    </div>
  );
}
