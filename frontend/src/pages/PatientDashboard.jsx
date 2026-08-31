import { useEffect, useState } from "react";
import api from "../api/client";
import Layout from "../components/Layout";

const statusStyles = {
  BOOKED: "bg-clinic-light text-clinic-dark",
  COMPLETED: "bg-ink/10 text-ink/70",
  NO_SHOW: "bg-brick/10 text-brick",
  CANCELLED: "bg-ink/10 text-ink/50",
};

export default function PatientDashboard() {
  const [slots, setSlots] = useState([]);
  const [mine, setMine] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeService, setActiveService] = useState("All");

  async function load() {
    const [slotsRes, mineRes] = await Promise.all([
      api.get("/slots"),
      api.get("/appointments/mine"),
    ]);
    setSlots(slotsRes.data);
    setMine(mineRes.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Derived from state on every render, so they always reflect the
  // latest slots and the currently selected filter — not stale data.
  const services = ["All", ...new Set(slots.flatMap((s) => s.clinic.services))];
  const visibleSlots =
    activeService === "All"
      ? slots
      : slots.filter((s) => s.clinic.services.includes(activeService));

  async function book(slotId) {
    setMessage("");
    try {
      await api.post("/appointments", { slotId });
      setMessage("Booked. You'll get an email reminder before your visit.");
      load();
    } catch (err) {
      setMessage(
        err.response?.data?.error || "That slot is no longer available.",
      );
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-10">
        <div>
          <h1 className="font-display text-3xl text-ink">
            Book an appointment
          </h1>
          <p className="text-ink/60 mt-1">
            Pick an open slot below — it's yours the moment you book it.
          </p>
        </div>

        {message && (
          <p className="text-sm bg-clinic-light text-clinic-dark rounded-lg px-4 py-3">
            {message}
          </p>
        )}

        <section>
          <h2 className="font-display text-lg text-ink mb-4">Open slots</h2>

          {!loading && slots.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {services.map((service) => (
                <button
                  key={service}
                  onClick={() => setActiveService(service)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    activeService === service
                      ? "bg-clinic text-white border-clinic"
                      : "border-line text-ink/60 hover:border-clinic hover:text-clinic"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <p className="text-ink/50 text-sm">Loading slots…</p>
          ) : visibleSlots.length === 0 ? (
            <p className="text-ink/50 text-sm">
              No open slots right now — check back soon.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {visibleSlots.map((slot) => (
                <div key={slot.id} className="ticket p-5">
                  <p className="font-display text-base text-ink">
                    {slot.clinic.name}
                  </p>
                  <p className="text-xs text-clinic mt-0.5">
                    {slot.clinic.services.join(", ")}
                  </p>
                  <p className="text-sm text-ink/60 mt-1">
                    {new Date(slot.startTime).toLocaleString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="ticket-notch" />
                  <button
                    onClick={() => book(slot.id)}
                    className="w-full rounded-lg bg-clinic py-2 text-white text-sm font-medium hover:bg-clinic-dark transition-colors"
                  >
                    Book this slot
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-lg text-ink mb-4">
            My appointments
          </h2>
          {mine.length === 0 ? (
            <p className="text-ink/50 text-sm">Nothing booked yet.</p>
          ) : (
            <div className="space-y-3">
              {mine.map((appt) => (
                <div
                  key={appt.id}
                  className="flex items-center justify-between rounded-lg border border-line bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-ink font-medium">
                      {appt.slot.clinic.name}
                    </p>
                    <p className="text-sm text-ink/60">
                      {new Date(appt.slot.startTime).toLocaleString(undefined, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                        statusStyles[appt.status] || "bg-ink/10 text-ink/60"
                      }`}
                    >
                      {appt.status.replace("_", " ").toLowerCase()}
                    </span>
                    {appt.reminded && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-marigold/15 text-marigold">
                        Reminder sent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}