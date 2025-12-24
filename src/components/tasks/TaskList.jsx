import { memo } from "react";
import TaskItem from "./TaskItem";

const TaskItemMemo = memo(TaskItem);

export default function TaskList({ tasks, onToggle, onDelete, onEditTitle }) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItemMemo
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          onEditTitle={onEditTitle}
        />
      ))}
    </div>
  );
}
