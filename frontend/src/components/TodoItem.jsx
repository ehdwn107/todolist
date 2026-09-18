import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

const PRIORITY_STYLE = {
  high: { bg: "#fff1f2", color: "#f43f5e", emoji: "🔴" },
  medium: { bg: "#fffbeb", color: "#f59e0b", emoji: "🟡" },
  low: { bg: "#f0fdf4", color: "#22c55e", emoji: "🟢" },
};
const PRIORITY_LABEL = { high: "높음", medium: "보통", low: "낮음" };

export default function TodoItem({ todo, onToggle, onDelete, onUpdate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const submitEdit = async () => {
    if (title.trim() && title !== todo.title) await onUpdate(todo.id, { title: title.trim() });
    setEditing(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }) : null;
  const isOverdue = todo.due_date && !todo.completed && new Date(todo.due_date) < new Date();
  const p = PRIORITY_STYLE[todo.priority];

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, border: `2px solid ${todo.completed ? "#f3e8ff" : p.bg}` }}
      className="flex items-center gap-3 bg-white rounded-3xl px-4 py-3 shadow-sm group hover:shadow-lg transition-all"
    >
      <span {...attributes} {...listeners} className="cursor-grab select-none text-lg" style={{ color: "#d8b4fe" }}>⠿</span>

      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={submitEdit}
            onKeyDown={(e) => e.key === "Enter" && submitEdit()}
            className="w-full outline-none text-sm font-semibold bg-transparent"
            style={{ borderBottom: "2px solid #c084fc", color: "#7c3aed" }}
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            className="block truncate text-sm font-bold cursor-text"
            style={{ color: todo.completed ? "#d8b4fe" : "#6d28d9", textDecoration: todo.completed ? "line-through" : "none" }}
          >
            {todo.title}
          </span>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold"
            style={{ background: p.bg, color: p.color }}
          >
            {p.emoji} {PRIORITY_LABEL[todo.priority]}
          </span>
          {todo.due_date && (
            <span className="text-xs font-bold" style={{ color: isOverdue ? "#f43f5e" : "#c084fc" }}>
              {isOverdue ? "⚠️ " : "📅 "}{formatDate(todo.due_date)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        className="rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold transition opacity-0 group-hover:opacity-100"
        style={{ background: "#fff1f2", color: "#f43f5e" }}
      >✕</button>
    </div>
  );
}
