import { useState } from "react";

export default function AddTodo({ onAdd }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd({ title: title.trim(), priority, due_date: dueDate || null });
    setTitle("");
    setPriority("medium");
    setDueDate("");
    setOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 shadow-md" style={{ border: "2px solid #f3e8ff" }}>
      <div className="flex gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="🖊 새 할 일을 입력하세요..."
          className="flex-1 outline-none text-sm font-semibold rounded-2xl px-4 py-2"
          style={{ background: "#fdf4ff", color: "#7c3aed" }}
        />
        <button
          type="submit"
          className="px-5 py-2 rounded-2xl font-extrabold text-white text-sm transition"
          style={{ background: "linear-gradient(135deg, #c084fc, #f472b6)" }}
        >
          추가 ✚
        </button>
      </div>

      {open && (
        <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: "2px dashed #f3e8ff" }}>
          <div className="flex-1">
            <label className="text-xs font-bold block mb-2" style={{ color: "#c084fc" }}>🎯 우선순위</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full rounded-2xl px-3 py-2 text-sm font-semibold outline-none"
              style={{ background: "#fdf4ff", border: "2px solid #e9d5ff", color: "#7c3aed" }}
            >
              <option value="high">🔴 높음</option>
              <option value="medium">🟡 보통</option>
              <option value="low">🟢 낮음</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold block mb-2" style={{ color: "#c084fc" }}>📅 마감일</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-2xl px-3 py-2 text-sm font-semibold outline-none"
              style={{ background: "#fdf4ff", border: "2px solid #e9d5ff", color: "#7c3aed" }}
            />
          </div>
        </div>
      )}
    </form>
  );
}
