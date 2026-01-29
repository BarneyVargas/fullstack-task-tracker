import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TaskForm({ title, onTitleChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={title}
        onChange={(event) => onTitleChange(event.target.value)}
        placeholder="Add a new task..."
      />
      <Button type="submit">Add</Button>
    </form>
  );
}
