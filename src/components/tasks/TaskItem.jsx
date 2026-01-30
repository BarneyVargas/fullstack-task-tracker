import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Save, Ban, Pencil, Trash2, MoreHorizontal, Pen } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TaskItem({ task, onToggle, onDelete, onEditTitle }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(task.title);

  useEffect(() => {
    if (!editing) setDraft(task.title);
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

      <div className="flex-1 min-w-0 flex items-start">
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
          <div className="flex flex-wrap items-center gap-2 min-w-0 w-full">
            <p
              className={`text-sm font-medium break-words whitespace-normal min-w-0 flex-1 ${
                task.completed ? "line-through opacity-60" : ""
              }`}
            >
              {task.title}
            </p>
            {task.completed && (
              <Badge variant="secondary" className="rounded shrink-0">
                Done
              </Badge>
            )}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="secondary" aria-label="Open menu">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditing(true)}>
                <Pencil /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(task.id)}
              >
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
