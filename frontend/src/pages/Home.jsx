import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import api from "../api";
import AddTodo from "../components/AddTodo";
import TodoItem from "../components/TodoItem";

const FILTERS = ["전체", "진행중", "완료"];

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">✅ TodoList</h1>
        <div className="flex items-center gap-4">
          {user && <span className="text-sm text-gray-600">👋 {user.username}</span>}
          <button onClick={logout} className="text-sm text-gray-500 hover:text-red-500 transition">로그아웃</button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            전체 <strong className="text-gray-800">{todos.length}</strong>개 · 완료{" "}
            <strong className="text-blue-600">{done}</strong>개
          </div>
          <div className="flex gap-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <AddTodo onAdd={handleAdd} />

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filtered.length === 0 && (
                <p className="text-center text-gray-400 py-12">할 일이 없습니다 🎉</p>
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
