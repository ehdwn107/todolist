import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import api from "../api";
import AddTodo from "../components/AddTodo";
import TodoItem from "../components/TodoItem";

const FILTERS = [
  { label: "전체", emoji: "🌈" },
  { label: "진행중", emoji: "🔥" },
  { label: "완료", emoji: "✨" },
];

export default function Home() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState([]);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("전체");
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    api.get("/auth/me").then(({ data }) => setUser(data)).catch(() => navigate("/login"));
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const { data } = await api.get("/todos");
    setTodos(data);
  };

  const handleAdd = async (body) => {
    const { data } = await api.post("/todos", body);
    setTodos((prev) => [...prev, data]);
  };

  const handleToggle = async (id) => {
    const { data } = await api.patch(`/todos/${id}/done`);
    setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
  };

  const handleDelete = async (id) => {
    await api.delete(`/todos/${id}`);
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleUpdate = async (id, body) => {
    const { data } = await api.put(`/todos/${id}`, body);
    setTodos((prev) => prev.map((t) => (t.id === id ? data : t)));
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(todos, oldIndex, newIndex);
    setTodos(reordered);
    await Promise.all(reordered.map((t, i) => api.put(`/todos/${t.id}`, { order: i })));
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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
      {/* 헤더 */}
      <header className="bg-white bg-opacity-80 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-10" style={{ borderBottom: "2px solid #f3e8ff" }}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <h1 className="text-xl font-extrabold" style={{ color: "#a855f7" }}>Todo 리스트</h1>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: "#f3e8ff", color: "#a855f7" }}>
              🐣 {user.username}
            </span>
          )}
          <button onClick={logout} className="text-sm font-bold px-3 py-1 rounded-full transition hover:bg-red-50" style={{ color: "#f472b6" }}>
            로그아웃
          </button>
        </div>
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
