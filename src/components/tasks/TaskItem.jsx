import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { Save, Ban } from "lucide-react";

export default function TaskItem({ task, onToggle, onDelete, onEditTitle }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  useEffect(() => {
    if (!editing) {
      setDraft(task.title);
    }
  }, [task.title, editing]);

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
    <div className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task)}
        disabled={editing}
      />

      <div className="flex-1 min-w-0 flex items-center">
        {editing ? (
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            autoFocus
            className="h-9"
            placeholder="Task title..."
          />
        ) : (
          <div className="flex items-center gap-2 min-w-0 h-9">
            <p
              className={`truncate text-sm font-medium ${
                task.completed ? "line-through opacity-60" : ""
              }`}
            >
              {task.title}
            </p>
            {task.completed && <Badge variant="secondary">Done</Badge>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {editing ? (
          <>
            <Button size="sm" onClick={save}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={cancel}>
              <Ban className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setEditing(true)}
              aria-label="Edit task"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              size="icon"
              variant="destructive"
              onClick={() => onDelete(task.id)}
              aria-label="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
