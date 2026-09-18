import { useState, useEffect } from "react";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import AddTodo from "../components/AddTodo";
import TodoItem from "../components/TodoItem";

const FILTERS = [
  { label: "전체", emoji: "🌈" },
  { label: "진행중", emoji: "🔥" },
  { label: "완료", emoji: "✨" },
];

function loadTodos() {
  try {
    return JSON.parse(localStorage.getItem("todos") || "[]");
  } catch {
    return [];
  }
}

function saveTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

export default function Home() {
  const [todos, setTodos] = useState(loadTodos);
  const [filter, setFilter] = useState("전체");
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  const handleAdd = ({ title, priority, due_date }) => {
    const newTodo = {
      id: Date.now(),
      title,
      priority,
      due_date,
      completed: false,
      created_at: new Date().toISOString(),
      order: todos.length,
    };
    setTodos((prev) => [...prev, newTodo]);
  };

  const handleToggle = (id) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDelete = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdate = (id, body) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, ...body } : t));
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    setTodos(arrayMove(todos, oldIndex, newIndex));
  };

  const filtered = todos.filter((t) => {
    if (filter === "진행중") return !t.completed;
    if (filter === "완료") return t.completed;
    return true;
  });

  const done = todos.filter((t) => t.completed).length;
  const progress = todos.length > 0 ? Math.round((done / todos.length) * 100) : 0;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #fdf4ff 0%, #fce7f3 50%, #ede9fe 100%)" }}>
      <header className="bg-white bg-opacity-80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-10" style={{ borderBottom: "2px solid #f3e8ff" }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <h1 className="text-xl font-extrabold" style={{ color: "#a855f7" }}>Todo 리스트</h1>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#f3e8ff", color: "#a855f7" }}>
          💾 자동 저장
        </span>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
        {/* 진행률 카드 */}
        <div className="bg-white rounded-3xl p-5 shadow-md" style={{ border: "2px solid #f3e8ff" }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-bold" style={{ color: "#c084fc" }}>오늘의 달성률</p>
              <p className="text-3xl font-extrabold" style={{ color: "#a855f7" }}>{progress}%</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold" style={{ color: "#c084fc" }}>전체 {todos.length}개</p>
              <p className="text-xs font-bold" style={{ color: "#f472b6" }}>완료 {done}개 🎀</p>
            </div>
          </div>
          <div className="w-full rounded-full h-3" style={{ background: "#f3e8ff" }}>
            <div
              className="h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #c084fc, #f472b6)" }}
            />
          </div>
        </div>

        {/* 필터 */}
        <div className="flex gap-2">
          {FILTERS.map(({ label, emoji }) => (
            <button
              key={label}
              onClick={() => setFilter(label)}
              className="flex-1 py-2 rounded-2xl text-sm font-extrabold transition"
              style={
                filter === label
                  ? { background: "linear-gradient(135deg, #c084fc, #f472b6)", color: "white", boxShadow: "0 4px 15px rgba(192,132,252,0.4)" }
                  : { background: "white", color: "#c084fc", border: "2px solid #f3e8ff" }
              }
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* 추가 폼 */}
        <AddTodo onAdd={handleAdd} />

        {/* 목록 */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-5xl mb-3">🎉</div>
                  <p className="font-bold" style={{ color: "#c084fc" }}>할 일이 없어요!</p>
                  <p className="text-sm mt-1" style={{ color: "#d8b4fe" }}>새로운 할 일을 추가해보세요</p>
                </div>
              )}
              {filtered.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>
    </div>
  );
}
