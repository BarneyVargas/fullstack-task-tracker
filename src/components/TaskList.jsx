import TaskItem from "./TaskItem";

export default function TaskList({ tasks, reload }) {
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskItem key={task.id} task={task} reload={reload} />
      ))}
    </div>
  );
}
