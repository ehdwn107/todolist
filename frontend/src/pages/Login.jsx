import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("token", data.access_token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #fdf4ff 0%, #fce7f3 50%, #ede9fe 100%)" }}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🌸</div>
          <h1 className="text-3xl font-extrabold" style={{ color: "#a855f7" }}>Todo 리스트</h1>
          <p className="text-pink-400 text-sm mt-1 font-semibold">오늘도 할 일을 완료해봐요!</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8" style={{ border: "2px solid #f3e8ff" }}>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#a855f7" }}>📧 이메일</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition font-semibold"
                style={{ background: "#fdf4ff", border: "2px solid #e9d5ff", color: "#7c3aed" }}
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2" style={{ color: "#a855f7" }}>🔒 비밀번호</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-2xl px-4 py-3 text-sm outline-none transition font-semibold"
                style={{ background: "#fdf4ff", border: "2px solid #e9d5ff", color: "#7c3aed" }}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="bg-red-50 rounded-2xl px-4 py-3 text-red-500 text-sm font-semibold text-center">
                😢 {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl font-extrabold text-white text-sm transition disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #c084fc, #f472b6)" }}
            >
              {loading ? "로그인 중... 🌀" : "로그인 🚀"}
            </button>
          </form>
          <p className="text-center text-sm mt-5" style={{ color: "#c084fc" }}>
            아직 계정이 없으신가요?{" "}
            <Link to="/register" className="font-extrabold hover:underline" style={{ color: "#a855f7" }}>회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
