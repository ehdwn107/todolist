import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

const PRIORITY_STYLE = {
  high: "bg-red-100 text-red-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};
const PRIORITY_LABEL = { high: "높음", medium: "보통", low: "낮음" };

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const submitEdit = async () => {
    if (title.trim() && title !== todo.title) await onUpdate(todo.id, { title: title.trim() });
    setEditing(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : null;
  const isOverdue = todo.due_date && !todo.completed && new Date(todo.due_date) < new Date();

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-sm group hover:shadow-md transition">
      <span {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 text-lg select-none">⠿</span>

      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
        className="w-5 h-5 accent-blue-600 cursor-pointer flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={submitEdit}
            onKeyDown={(e) => e.key === "Enter" && submitEdit()}
            className="w-full border-b border-blue-500 outline-none text-gray-800 bg-transparent"
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            className={`block truncate cursor-text ${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}
          >
            {todo.title}
          </span>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLE[todo.priority]}`}>
            {PRIORITY_LABEL[todo.priority]}
          </span>
          {todo.due_date && (
            <span className={`text-xs ${isOverdue ? "text-red-500 font-semibold" : "text-gray-400"}`}>
              {isOverdue ? "⚠ " : "📅 "}{formatDate(todo.due_date)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100 text-lg"
      >✕</button>
    </div>
  );
}
