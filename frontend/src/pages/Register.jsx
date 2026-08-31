import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/client";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", {
        ...form,
        role: "PATIENT",
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/book");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
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
          <h2 className="font-display text-xl text-ink">Create account</h2>
          {error && <p className="text-sm text-brick">{error}</p>}
          <div className="space-y-3">
            <input
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-clinic"
              placeholder="Full name"
              value={form.name}
              onChange={update("name")}
            />
            <input
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-clinic"
              placeholder="Phone number (e.g. 08012345678)"
              value={form.phone}
              onChange={update("phone")}
            />
            <input
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-clinic"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={update("email")}
            />
            <input
              className="w-full rounded-lg border border-line bg-white px-4 py-2.5 text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-clinic"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={update("password")}
            />
          </div>
          <button className="w-full rounded-lg bg-clinic py-2.5 text-white font-medium hover:bg-clinic-dark transition-colors">
            Create account
          </button>
          <p className="text-sm text-ink/60 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-clinic font-medium">
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
