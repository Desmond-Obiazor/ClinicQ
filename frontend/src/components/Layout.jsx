import { useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-clinic text-white font-display text-sm flex items-center justify-center">
              Q
            </div>
            <span className="font-display text-lg text-ink">ClinicQ</span>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-ink/60">{user.name}</span>
              <button
                onClick={logout}
                className="text-sm font-medium text-ink/60 hover:text-brick transition-colors"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}