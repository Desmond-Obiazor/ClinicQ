import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";

const statusPill = {
  BOOKED: "bg-clinic-light text-clinic-dark",
  COMPLETED: "bg-ink/10 text-ink/70",
  NO_SHOW: "bg-brick/10 text-brick",
  CANCELLED: "bg-ink/10 text-ink/50",
};

const statusBorder = {
  BOOKED: "border-l-clinic",
  COMPLETED: "border-l-ink/20",
  NO_SHOW: "border-l-brick",
  CANCELLED: "border-l-ink/10",
};

export default function StaffDashboard() {
  const [today, setToday] = useState([]);
  const [newSlot, setNewSlot] = useState({ startTime: "" });
  const [message, setMessage] = useState("");

  async function load() {
    const { data } = await api.get("/appointments/today");
    setToday(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createSlot(e) {
    e.preventDefault();
    setMessage("");
    try {
      await api.post("/slots", newSlot);
      setMessage("Slot added.");
      setNewSlot({ startTime: "" });
    } catch (err) {
      setMessage(err.response?.data?.error || "Could not add that slot.");
    }
  }

  async function setStatus(id, status) {
    await api.patch(`/appointments/${id}/status`, { status });
    load();
  }

  async function sendReminder(id) {
    await api.post(`/appointments/${id}/send-reminder`);
    setMessage("Reminder sent.");
    load();
  }

  const completed = today.filter((a) => a.status === "COMPLETED").length;
  const noShow = today.filter((a) => a.status === "NO_SHOW").length;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="font-display text-3xl text-ink">Today's bookings</h1>
          <p className="text-ink/60 mt-1">
            {today.length} booked, {completed} completed, {noShow} no-show
          </p>
        </div>

        {message && (
          <p className="text-sm bg-clinic-light text-clinic-dark rounded-lg px-4 py-3">
            {message}
          </p>
        )}

        <section className="ticket p-5">
          <h2 className="font-display text-lg text-ink mb-4">Add a slot</h2>
          <form
            onSubmit={createSlot}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              className="rounded-lg border border-line bg-white px-4 py-2.5 text-ink focus:outline-none focus:ring-2 focus:ring-clinic"
              type="datetime-local"
              value={newSlot.startTime}
              onChange={(e) =>
                setNewSlot({ ...newSlot, startTime: e.target.value })
              }
            />
            <button className="rounded-lg bg-clinic px-5 py-2.5 text-white text-sm font-medium hover:bg-clinic-dark transition-colors">
              Add slot
            </button>
          </form>
        </section>

        <section className="space-y-3">
          {today.length === 0 ? (
            <p className="text-ink/50 text-sm">Nothing booked for today yet.</p>
          ) : (
            today.map((appt) => (
              <div
                key={appt.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-line border-l-4 ${
                  statusBorder[appt.status] || "border-l-ink/10"
                } bg-white px-4 py-3`}
              >
                <div>
                  <p className="text-ink font-medium">{appt.patient.name}</p>
                  <p className="text-sm text-ink/60 mt-0.5">
                    {appt.slot.clinic.name},{" "}
                    {new Date(appt.slot.startTime).toLocaleTimeString(
                      undefined,
                      {
                        hour: "numeric",
                        minute: "2-digit",
                      },
                    )}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        statusPill[appt.status] || "bg-ink/10 text-ink/60"
                      }`}
                    >
                      {appt.status.replace("_", " ").toLowerCase()}
                    </span>
                    {appt.reminded && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-marigold/15 text-marigold">
                        Reminder sent
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => sendReminder(appt.id)}
                    className="text-xs font-medium rounded-full border border-line px-3 py-1.5 text-ink/70 hover:bg-clinic-light hover:text-clinic-dark hover:border-clinic transition-colors"
                  >
                    Send reminder
                  </button>
                  <button
                    onClick={() => setStatus(appt.id, "COMPLETED")}
                    className="text-xs font-medium rounded-full border border-line px-3 py-1.5 text-ink/70 hover:bg-clinic-light hover:text-clinic-dark hover:border-clinic transition-colors"
                  >
                    Mark completed
                  </button>
                  <button
                    onClick={() => setStatus(appt.id, "NO_SHOW")}
                    className="text-xs font-medium rounded-full border border-line px-3 py-1.5 text-ink/70 hover:bg-brick/10 hover:text-brick hover:border-brick transition-colors"
                  >
                    Mark no-show
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </Layout>
  );
}
