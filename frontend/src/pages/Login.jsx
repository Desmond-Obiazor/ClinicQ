import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/login", { phone, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate(data.user.role === "STAFF" ? "/staff" : "/book");
    } catch (err) {
      setError(err.response?.data?.error || "Log in failed. Check your phone number and password.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-clinic text-white font-display text-lg mb-3">
            Q
          </div>
          <h1 className="font-display text-2xl text-ink">ClinicQ</h1>
          <p className="text-sm text-ink/60 mt-1">No more standing in line.</p>
        </div>

        <form onSubmit={handleSubmit} className="ticket p-6 space-y-4">
          <h2 className="font-display text-xl text-ink">Log in</h2>
          {error && <p className="text-sm text-brick">{error}</p>}
          <div className="space-y-3">
            <input
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-clinic"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-clinic"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full rounded-lg bg-clinic py-2.5 text-white font-medium hover:bg-clinic-dark transition-colors">
            Log in
          </button>
          <p className="text-sm text-ink/60 text-center">
            New here?{" "}
            <Link to="/register" className="text-clinic font-medium">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}