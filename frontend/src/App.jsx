import { useCallback, useEffect, useState } from "react";
import { bookingsApi } from "./api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  sessionType: "",
  preferredDate: "",
  notes: "",
};

const emptyDetails = {
  schoolName: "",
  schoolService: "",
  contactName: "",
  contactRole: "",
  studentCount: "",
  groupSize: "",
  portraitStyle: "",
};

const customerTypes = [
  {
    id: "Individual",
    icon: "individual",
    title: "Individual",
    description:
      "Portraits, senior photos, headshots, and personal sessions.",
  },
  {
    id: "Family",
    icon: "family",
    title: "Family",
    description:
      "Family portraits, celebrations, and multigenerational groups.",
  },
  {
    id: "School",
    icon: "school",
    title: "School",
    description:
      "Picture day, class photographs, student portraits, and yearbooks.",
  },
  {
    id: "Organization",
    icon: "organization",
    title: "Organization",
    description:
      "Teams, churches, businesses, and community groups.",
  },
];

function SessionIcon({ name }) {
  const common = {
    width: 48,
    height: 48,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "individual") {
    return (
      <svg {...common}>
        <circle cx="24" cy="15" r="7" />
        <path d="M11 40c1.5-9 6.1-14 13-14s11.5 5 13 14" />
        <path d="M17 31l7 9 7-9" />
      </svg>
    );
  }

  if (name === "family") {
    return (
      <svg {...common}>
        <circle cx="24" cy="13" r="5.5" />
        <circle cx="12.5" cy="19" r="4.5" />
        <circle cx="35.5" cy="19" r="4.5" />
        <path d="M15 39c.8-9 3.8-14 9-14s8.2 5 9 14" />
        <path d="M4 39c.6-7 3.3-11 8-11 2.1 0 3.8.8 5.2 2.2" />
        <path d="M44 39c-.6-7-3.3-11-8-11-2.1 0-3.8.8-5.2 2.2" />
      </svg>
    );
  }

  if (name === "school") {
    return (
      <svg {...common}>
        <path d="M5 20L24 8l19 12" />
        <path d="M8 20h32v21H8z" />
        <path d="M20 41V29h8v12" />
        <path d="M13 25h4M31 25h4M13 32h4M31 32h4" />
        <path d="M24 8V3m0 0h8l-2.5 3L32 9h-8" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M7 42V17h21v25M28 26h13v16" />
      <path d="M12 22h4m5 0h3m-12 7h4m5 0h3m-12 7h4m5 0h3m12-5h3m-3 6h3" />
      <path d="M4 42h40M11 17V9h13v8" />
    </svg>
  );
}

const statuses = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
];

function formatDate(value) {
  if (!value) return "Not provided";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function App() {
  const [form, setForm] = useState(emptyForm);
  const [details, setDetails] = useState(emptyDetails);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);

    try {
      const data = await bookingsApi.list();
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      setBookings([]);
      setMessage({
        type: "error",
        text: error.message || "Unable to load bookings.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  function selectCustomerType(sessionType) {
    setForm((current) => ({
      ...current,
      sessionType,
    }));

    setDetails(emptyDetails);

    window.setTimeout(() => {
      document
        .querySelector(".booking-panel")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  function buildNotes() {
    const information = [];

    if (
      form.sessionType === "Individual" &&
      details.portraitStyle
    ) {
      information.push(
        `Portrait type: ${details.portraitStyle}`
      );
    }

    if (
      form.sessionType === "Family" &&
      details.groupSize
    ) {
      information.push(
        `Number of family members: ${details.groupSize}`
      );
    }

    if (form.sessionType === "School") {
      if (details.schoolName) {
        information.push(
          `School name: ${details.schoolName}`
        );
      }

      if (details.schoolService) {
        information.push(
          `School service: ${details.schoolService}`
        );
      }

      if (details.contactRole) {
        information.push(
          `Contact role/title: ${details.contactRole}`
        );
      }

      if (details.studentCount) {
        information.push(
          `Estimated student count: ${details.studentCount}`
        );
      }
    }

    if (form.sessionType === "Organization") {
      if (details.contactName) {
        information.push(
          `Organization contact: ${details.contactName}`
        );
      }

      if (details.groupSize) {
        information.push(
          `Estimated group size: ${details.groupSize}`
        );
      }
    }

    if (form.notes.trim()) {
      information.push(
        `Additional notes: ${form.notes.trim()}`
      );
    }

    return information.join("\n");
  }

  async function submitBooking(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await bookingsApi.create({
        ...form,
        notes: buildNotes(),
      });

      setForm(emptyForm);
      setDetails(emptyDetails);

      setMessage({
        type: "success",
        text: "Booking request saved successfully.",
      });

      await loadBookings();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to save the booking.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const updated = await bookingsApi.update(id, {
        status,
      });

      setBookings((items) =>
        items.map((item) =>
          item.id === id ? updated : item
        )
      );

      setMessage({
        type: "success",
        text: `Booking #${id} updated.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to update the booking.",
      });
    }
  }

  async function deleteBooking(id) {
    const confirmed = window.confirm(
      `Delete booking #${id}?`
    );

    if (!confirmed) return;

    try {
      await bookingsApi.remove(id);

      setBookings((items) =>
        items.filter((item) => item.id !== id)
      );

      setMessage({
        type: "success",
        text: `Booking #${id} deleted.`,
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Unable to delete the booking.",
      });
    }
  }

  const field = (name) => ({
    value: form[name],
    onChange: (event) =>
      setForm((current) => ({
        ...current,
        [name]: event.target.value,
      })),
  });

  const detailField = (name) => ({
    value: details[name],
    onChange: (event) =>
      setDetails((current) => ({
        ...current,
        [name]: event.target.value,
      })),
  });

  return (
    <>
      <header className="hero">
        <nav className="nav">
          <div className="brand">
            <strong>PHOTOS by GREG</strong>
            <span>Studio Management</span>
          </div>
        </nav>

        <div className="hero-content">
          <p className="eyebrow">
            Davis Digital Services
          </p>

          <h1>
            Moments made
            <br />
            timeless.
          </h1>

          <p>
            Choose your photography experience and
            submit a personalized booking request
            through one connected studio workspace.
          </p>
        </div>
      </header>

      <main className="workspace">
        {message && (
          <div
            className={`notice ${message.type}`}
            role="alert"
          >
            <span>{message.text}</span>

            <button
              type="button"
              onClick={() => setMessage(null)}
              aria-label="Dismiss message"
            >
              X
            </button>
          </div>
        )}

        <section className="customer-section">
          <div className="customer-heading">
            <p className="eyebrow">
              Start your experience
            </p>

            <h2>
              What can we photograph for you?
            </h2>

            <p>
              Select the option that best describes
              your session.
            </p>
          </div>

          <div className="customer-options">
            {customerTypes.map((type) => {
              const selected =
                form.sessionType === type.id;

              return (
                <button
                  type="button"
                  key={type.id}
                  className={
                    selected
                      ? "customer-card selected"
                      : "customer-card"
                  }
                  onClick={() =>
                    selectCustomerType(type.id)
                  }
                  aria-pressed={selected}
                >
                  <span className="customer-icon">
                    <SessionIcon name={type.icon} />
                  </span>

                  {selected && (
                    <span className="customer-check" aria-hidden="true">
                      ✓
                    </span>
                  )}

                  <strong>{type.title}</strong>

                  <span>{type.description}</span>
                </button>
              );
            })}
          </div>
        </section>

        {form.sessionType ? (
          <>
            <div
              className="selection-prompt"
              role="status"
            >
              You are booking a{" "}
              <strong>{form.sessionType}</strong>{" "}
              session. Complete the details below.
            </div>

            <section className="booking-panel">
              <div className="section-heading">
                <p className="eyebrow">
                  {form.sessionType} session
                </p>

                <h2>
                  {form.sessionType} booking details
                </h2>

                <p>
                  We will use this information to
                  prepare your booking request and
                  confirm availability.
                </p>
              </div>

              <form onSubmit={submitBooking}>
                {form.sessionType === "School" && (
                  <>
                    <label className="wide-field">
                      School name
                      <input
                        {...detailField("schoolName")}
                        type="text"
                        maxLength="150"
                        required
                      />
                    </label>

                    <label className="wide-field">
                      School service
                      <select
                        {...detailField(
                          "schoolService"
                        )}
                        required
                      >
                        <option value="">
                          Select a school service
                        </option>

                        <option value="Picture Day">
                          Picture Day
                        </option>

                        <option value="Class Photographs">
                          Class Photographs
                        </option>

                        <option value="Student Portraits">
                          Student Portraits
                        </option>

                        <option value="Yearbook">
                          Yearbook
                        </option>
                      </select>
                    </label>
                  </>
                )}

                <label>
                  {form.sessionType === "School"
                    ? "Contact full name"
                    : "Full name"}

                  <input
                    {...field("name")}
                    type="text"
                    required
                    maxLength="100"
                  />
                </label>

                <label>
                  Email address
                  <input
                    {...field("email")}
                    type="email"
                    required
                    maxLength="150"
                  />
                </label>

                <label>
                  Phone number
                  <input
                    {...field("phone")}
                    type="tel"
                    maxLength="20"
                  />
                </label>

                <label>
                  Preferred date
                  <input
                    {...field("preferredDate")}
                    type="date"
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    required
                  />
                </label>

                {form.sessionType === "Individual" && (
                  <label className="wide-field">
                    Portrait type
                    <select
                      {...detailField(
                        "portraitStyle"
                      )}
                      required
                    >
                      <option value="">
                        Select a portrait type
                      </option>

                      <option value="Personal portrait">
                        Personal portrait
                      </option>

                      <option value="Senior portrait">
                        Senior portrait
                      </option>

                      <option value="Professional headshot">
                        Professional headshot
                      </option>

                      <option value="Creative portrait">
                        Creative portrait
                      </option>
                    </select>
                  </label>
                )}

                {form.sessionType === "Family" && (
                  <label className="wide-field">
                    Number of family members
                    <input
                      {...detailField("groupSize")}
                      type="number"
                      min="2"
                      max="100"
                      required
                    />
                  </label>
                )}

                {form.sessionType === "School" && (
                  <>
                        <label>
                          Contact role/title
                          <input
                            {...detailField(
                              "contactRole"
                            )}
                            type="text"
                            maxLength="100"
                            placeholder="Principal, administrator, or yearbook adviser"
                            required
                          />
                        </label>

                    <label>
                      Estimated student count
                      <input
                        {...detailField(
                          "studentCount"
                        )}
                        type="number"
                        min="1"
                        max="10000"
                        required
                      />
                    </label>
                  </>
                )}

                {form.sessionType ===
                  "Organization" && (
                  <>
                    <label>
                      Organization contact
                      <input
                        {...detailField(
                          "contactName"
                        )}
                        type="text"
                        maxLength="100"
                        required
                      />
                    </label>

                    <label>
                      Estimated group size
                      <input
                        {...detailField(
                          "groupSize"
                        )}
                        type="number"
                        min="1"
                        max="10000"
                        required
                      />
                    </label>
                  </>
                )}

                <label className="wide-field">
                  Additional notes
                  <textarea
                    {...field("notes")}
                    rows="4"
                    maxLength="700"
                    placeholder="Location, preferred time, accessibility needs, or special requests"
                  />
                </label>

                <p className="wide-field">
                  You will receive confirmation after
                  we review your request. No payment is
                  required at this stage.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? "Saving..."
                    : `Request ${form.sessionType.toLowerCase()} session`}
                </button>
              </form>
            </section>
          </>
        ) : (
          <div className="selection-prompt">
            Select a customer type above to open the
            booking form.
          </div>
        )}

        <section className="dashboard-panel">
          <div className="dashboard-heading">
            <div>
              <p className="eyebrow">
                Live database
              </p>

              <h2>Booking dashboard</h2>
            </div>

            <button
              type="button"
              className="secondary"
              onClick={loadBookings}
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p>
              No bookings yet. Submit the form to
              create the first one.
            </p>
          ) : (
            <div className="booking-list">
              {bookings.map((booking) => (
                <article
                  className="booking-card"
                  key={booking.id}
                >
                  <div className="booking-card-heading">
                    <span>#{booking.id}</span>

                    <select
                      value={
                        booking.status || "pending"
                      }
                      onChange={(event) =>
                        updateStatus(
                          booking.id,
                          event.target.value
                        )
                      }
                      aria-label={`Status for booking ${booking.id}`}
                    >
                      {statuses.map((status) => (
                        <option
                          value={status}
                          key={status}
                        >
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <h3>{booking.name}</h3>
                  <p>{booking.sessionType}</p>

                  <dl>
                    <div>
                      <dt>Date</dt>
                      <dd>
                        {formatDate(
                          booking.preferredDate
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>Email</dt>
                      <dd>{booking.email}</dd>
                    </div>

                    {booking.phone && (
                      <div>
                        <dt>Phone</dt>
                        <dd>{booking.phone}</dd>
                      </div>
                    )}
                  </dl>

                  {booking.notes && (
                    <blockquote>
                      {booking.notes}
                    </blockquote>
                  )}

                  <button
                    type="button"
                    className="danger"
                    onClick={() =>
                      deleteBooking(booking.id)
                    }
                  >
                    Delete booking
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer>
        Photos by Greg · Davis Digital Services ·
        Studio Booking Platform
      </footer>
    </>
  );
}