import { useCallback, useEffect, useState } from "react";
import { bookingsApi } from "./api";

const emptyForm = { name: "", email: "", phone: "", sessionType: "", preferredDate: "", notes: "" };
const statuses = ["pending", "confirmed", "completed", "cancelled"];

function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      setBookings(await bookingsApi.list());
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBookings(); }, [loadBookings]);

  async function submitBooking(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      await bookingsApi.create(form);
      setForm(emptyForm);
      setMessage({ type: "success", text: "Booking request saved successfully." });
      await loadBookings();
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const updated = await bookingsApi.update(id, { status });
      setBookings((items) => items.map((item) => item.id === id ? updated : item));
      setMessage({ type: "success", text: `Booking #${id} updated.` });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  async function deleteBooking(id) {
    if (!window.confirm(`Delete booking #${id}?`)) return;
    try {
      await bookingsApi.remove(id);
      setBookings((items) => items.filter((item) => item.id !== id));
      setMessage({ type: "success", text: `Booking #${id} deleted.` });
    } catch (error) {
      setMessage({ type: "error", text: error.message });
    }
  }

  const field = (name) => ({
    value: form[name],
    onChange: (event) => setForm({ ...form, [name]: event.target.value }),
  });

  return (
    <>
      <header className="hero">
        <nav><span className="brand">PHOTOS <i>by</i> GREG</span><span>Studio Management</span></nav>
        <div className="hero-copy"><p className="eyebrow">Davis Digital Services</p><h1>Moments made<br/><em>timeless.</em></h1><p>Book a photography session and manage every request from one connected studio workspace.</p></div>
      </header>
      <main>
        {message && <div className={`notice ${message.type}`} role="alert">{message.text}<button onClick={() => setMessage(null)} aria-label="Dismiss">×</button></div>}
        <section className="booking-grid">
          <div><p className="eyebrow dark">New session</p><h2>Request a booking</h2><p className="muted">Tell us what you have in mind. We will follow up to confirm availability.</p></div>
          <form onSubmit={submitBooking}>
            <label>Full name<input {...field("name")} required maxLength="100" /></label>
            <label>Email address<input {...field("email")} type="email" required maxLength="150" /></label>
            <label>Phone<input {...field("phone")} type="tel" maxLength="20" /></label>
            <label>Session type<select {...field("sessionType")} required><option value="">Select a session</option><option>Portrait Session</option><option>Family Session</option><option>Event Photography</option><option>Senior Portraits</option><option>Corporate Headshots</option></select></label>
            <label>Preferred date<input {...field("preferredDate")} type="date" min={new Date().toISOString().split("T")[0]} required /></label>
            <label className="wide">Notes<textarea {...field("notes")} rows="3" maxLength="1000" /></label>
            <button className="primary wide" disabled={submitting}>{submitting ? "Saving…" : "Request session"}</button>
          </form>
        </section>
        <section className="dashboard">
          <div className="section-title"><div><p className="eyebrow dark">Live database</p><h2>Booking dashboard</h2></div><button className="secondary" onClick={loadBookings} disabled={loading}>Refresh</button></div>
          {loading ? <p className="empty">Loading bookings…</p> : bookings.length === 0 ? <p className="empty">No bookings yet. Submit the form to create the first one.</p> :
            <div className="cards">{bookings.map((booking) => <article className="card" key={booking.id}>
              <div className="card-top"><span>#{booking.id}</span><select value={booking.status} onChange={(e) => updateStatus(booking.id, e.target.value)} aria-label={`Status for booking ${booking.id}`}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div>
              <h3>{booking.name}</h3><p>{booking.sessionType}</p><dl><div><dt>Date</dt><dd>{formatDate(booking.preferredDate)}</dd></div><div><dt>Email</dt><dd>{booking.email}</dd></div></dl>
              {booking.notes && <p className="notes">“{booking.notes}”</p>}
              <button className="danger" onClick={() => deleteBooking(booking.id)}>Delete booking</button>
            </article>)}</div>}
        </section>
      </main>
      <footer>Photos by Greg · Davis Digital Services · Chicago</footer>
    </>
  );
}
