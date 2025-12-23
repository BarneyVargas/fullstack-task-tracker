import TaskItem from "./TaskItem";

export default function TaskList({ tasks, onToggle, onDelete, onEditTitle }) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskItem
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
