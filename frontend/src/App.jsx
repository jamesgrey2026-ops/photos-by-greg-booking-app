import { useCallback, useEffect, useState } from "react";
import { bookingsApi, platformApi } from "./api";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  sessionType: "Individual",
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

function BookingExperience() {
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

  const selectedType = customerTypes.find((type) => type.id === form.sessionType) || customerTypes[0];
  const sessionPrices = { Individual: 325, Family: 425, School: 1200, Organization: 650 };
  const times = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM", "6:00 PM"];

  return (
    <div className="booking-planner">
      <header className="planner-topbar"><strong>Photos by Greg</strong><div><span>☎ (555) 987-6543</span><span>▣ My Bookings</span></div></header>
      <div className="planner-layout">
        <aside className="planner-steps">
          <div className="planner-step active"><b>▣</b><span><strong>1. Service</strong><small>Choose what you need</small></span></div>
          <div className="planner-step"><b>?</b><span><strong>2. Details</strong><small>Answer a few questions</small></span></div>
          <div className="planner-step"><b>▦</b><span><strong>3. Date &amp; Time</strong><small>Pick your session time</small></span></div>
          <div className="planner-step"><b>▤</b><span><strong>4. Review</strong><small>Confirm and book</small></span></div>
          <div className="planner-help"><b>▣</b><span><strong>Have a question?</strong><small>I'm happy to help.</small><em>(555) 987-6543</em></span></div>
          <div className="planner-landscape" />
        </aside>

        <main className="planner-main">
          <div className="planner-heading"><h1>Plan Your Session</h1><p>Tell me what you're looking for and I'll help plan the perfect session.</p></div>
          {message && <div className={`notice ${message.type}`}><span>{message.text}</span><button onClick={() => setMessage(null)}>×</button></div>}
          <form className="planner-form" onSubmit={submitBooking}>
            <section className="planner-details">
              <h2>Choose a Service</h2>
              <div className="planner-services">
                {customerTypes.map((type) => <button type="button" key={type.id} className={form.sessionType === type.id ? "selected" : ""} onClick={() => selectCustomerType(type.id)}><SessionIcon name={type.icon} /><span>{type.title === "School" ? "School Photography" : type.title}</span>{form.sessionType === type.id && <i>✓</i>}</button>)}
                <button type="button" className={form.sessionType === "School" ? "selected" : ""} onClick={() => selectCustomerType("School")}><span className="book-glyph">▤</span><span>Yearbook Services</span></button>
              </div>

              <h2>Tell me more about your session</h2>
              <label>What type of session are you looking for?<select {...detailField("portraitStyle")}><option>Portrait Session</option><option>Senior Portraits</option><option>Professional Headshots</option><option>Special Event</option></select></label>
              <label>How many people will be in the photos?<div className="choice-row">{["1", "2", "3", "4", "5+"].map((count) => <button type="button" key={count} className={details.groupSize === count || (!details.groupSize && count === "1") ? "selected" : ""} onClick={() => setDetails((current) => ({ ...current, groupSize: count }))}>{count}</button>)}</div></label>
              <label>Where would you like your session to take place?<div className="location-row"><button type="button" className="selected">♧ <span>Outdoor<small>Natural light &amp; scenery</small></span><i>✓</i></button><button type="button">⌂ <span>Studio<small>Controlled lighting</small></span></button></div></label>
              <label>Do you have a preferred style or vibe?<select><option>Natural &amp; Timeless</option><option>Bright &amp; Airy</option><option>Classic Studio</option><option>Bold &amp; Editorial</option></select></label>
              <div className="planner-contact"><label>Your name<input {...field("name")} required placeholder="Full name" /></label><label>Email address<input {...field("email")} required type="email" placeholder="you@example.com" /></label><label>Phone<input {...field("phone")} type="tel" placeholder="(555) 555-5555" /></label></div>
              <p className="planner-tip">♧ I'll personalize your session based on your answers.</p>
            </section>

            <section className="planner-calendar">
              <h2>Choose an Available Time</h2>
              <label>Preferred session date<input {...field("preferredDate")} type="date" min={new Date().toISOString().split("T")[0]} required /></label>
              <div className="mini-calendar"><header><button type="button">‹</button><strong>{form.preferredDate ? formatDate(form.preferredDate) : "Select a date"}</strong><button type="button">›</button></header><div className="calendar-week">{["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-days">{Array.from({ length: 28 }, (_, index) => <span className={index === 17 ? "selected" : ""} key={index}>{index + 1}</span>)}</div></div>
              <h3>Available times</h3><div className="time-grid">{times.map((time) => <button type="button" key={time} className={details.contactRole === time ? "selected" : ""} onClick={() => setDetails((current) => ({ ...current, contactRole: time }))}>{time}{details.contactRole === time && " ✓"}</button>)}</div>
              <p className="duration">◷ Session duration: 60 minutes</p>
            </section>

            <aside className="planner-summary">
              <h2>Your Booking Summary</h2>
              <div className="summary-session"><div className="summary-photo">PBG</div><div><strong>{selectedType.title} Session</strong><span>{selectedType.title} · Natural &amp; Timeless</span><small>{details.groupSize || "1"} person{details.groupSize && details.groupSize !== "1" ? "s" : ""}</small></div></div>
              <div className="summary-block"><strong>Package <em>Essentials</em></strong><span>● 60 minute session</span><span>● 1 location</span><span>● 20 edited digital images</span><span>● Online gallery</span></div>
              <div className="summary-block"><strong>Add-ons <em>$0.00</em></strong><span>None selected</span></div>
              <div className="summary-total"><strong>Estimated Total</strong><b>${sessionPrices[form.sessionType] || 325}.00</b><small>Taxes may apply</small></div>
              <button className="planner-submit" type="submit" disabled={submitting}>{submitting ? "Saving..." : "Continue to Review →"}</button>
              <button className="planner-save" type="button">Save for Later ♧</button>
            </aside>
          </form>
        </main>
      </div>
      <footer className="planner-footer"><div><b>▣</b><span><strong>Personalized Experience</strong><small>Designed around your vision.</small></span></div><div><b>▦</b><span><strong>Flexible Scheduling</strong><small>Find a time that works for you.</small></span></div><div><b>◇</b><span><strong>Secure &amp; Easy Booking</strong><small>Your information is always protected.</small></span></div></footer>
    </div>
  );

  /* Legacy booking markup retained below during the staged migration. */

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

const viewLabels = {
  book: "Book a Session",
  portfolio: "Portfolio",
  yearbook: "Yearbook SaaS",
  connected: "Stay Connected",
  store: "Merchandise",
  admin: "Admin CRM",
};

function EmptyState({ children }) {
  return <div className="platform-empty">{children}</div>;
}

function Metric({ label, value, tone = "sage" }) {
  return (
    <article className={`metric-card ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="progress-track" aria-label={`${value}% complete`}>
      <span style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function PlatformView({ view }) {
  const [data, setData] = useState({ dashboard: {}, bookings: [], schools: [], projects: [], students: [], pages: [], profiles: [], galleries: [], products: [], orders: [] });
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [adminModule, setAdminModule] = useState("Dashboard");
  const [adminSearch, setAdminSearch] = useState("");
  const [schoolForm, setSchoolForm] = useState({ name: "", coordinatorName: "", coordinatorEmail: "", enrollment: "" });

  const load = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const [dashboard, bookings, schools, projects, students, pages, profiles, galleries, products, orders] = await Promise.all([
        platformApi.dashboard(), bookingsApi.list(), platformApi.schools.list(), platformApi.projects.list(),
        platformApi.students.list(), platformApi.pages.list(), platformApi.profiles.list(),
        platformApi.galleries.list(), platformApi.products.list(), platformApi.orders.list(),
      ]);
      setData({
        dashboard: dashboard || {},
        bookings: Array.isArray(bookings) ? bookings : [],
        schools: Array.isArray(schools) ? schools : [],
        projects: Array.isArray(projects) ? projects : [],
        students: Array.isArray(students) ? students : [],
        pages: Array.isArray(pages) ? pages : [],
        profiles: Array.isArray(profiles) ? profiles : [],
        galleries: Array.isArray(galleries) ? galleries : [],
        products: Array.isArray(products) ? products : [],
        orders: Array.isArray(orders) ? orders : [],
      });
    } catch (err) {
      setError(err.message || "Unable to load the enhanced platform.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function createSchool(event) {
    event.preventDefault();
    try {
      const school = await platformApi.schools.create({ ...schoolForm, enrollment: Number(schoolForm.enrollment || 0) });
      await platformApi.projects.create({ schoolId: school.id, schoolYear: "2026-2027", plan: "Professional", totalPages: 72 });
      setSchoolForm({ name: "", coordinatorName: "", coordinatorEmail: "", enrollment: "" });
      await load();
    } catch (err) { setError(err.message); }
  }

  if (busy) return <main className="platform-main"><EmptyState>Loading {viewLabels[view]}…</EmptyState></main>;

  if (view === "admin") {
    const d = data.dashboard || {};
    const adminModules = ["Dashboard", "Customers", "Bookings", "Calendar", "Schools", "Yearbooks", "Galleries", "Orders", "Reports", "Administration"];
    const search = adminSearch.trim().toLowerCase();
    const filteredBookings = data.bookings.filter((booking) => !search || [booking.name, booking.email, booking.sessionType, booking.status].some((value) => String(value || "").toLowerCase().includes(search)));
    const filteredProjects = data.projects.filter((project) => !search || [project.schoolName, project.schoolYear, project.plan, project.status].some((value) => String(value || "").toLowerCase().includes(search)));
    const alerts = [
      d.pendingBookings > 0 && { tone: "red", count: d.pendingBookings, title: "Booking requests need attention", detail: "Review pending customer requests", target: "Bookings" },
      d.missingPortraits > 0 && { tone: "amber", count: d.missingPortraits, title: "Student portraits are missing", detail: "Open the yearbook production queue", target: "Yearbooks" },
      d.pagesAwaitingApproval > 0 && { tone: "blue", count: d.pagesAwaitingApproval, title: "Pages await approval", detail: "Review submitted yearbook pages", target: "Yearbooks" },
      { tone: "green", count: d.merchandiseOrders || 0, title: "Merchandise orders", detail: "Monitor payment and production status", target: "Orders" },
    ].filter(Boolean);
    return (
      <main className="crm-shell">
        <aside className="crm-sidebar">
          <div className="crm-sidebar-brand"><span className="camera-mark">▣</span><div><strong>Photos by Greg</strong><small>Administration CRM</small></div></div>
          <nav>{adminModules.map((module) => <button key={module} className={adminModule === module ? "active" : ""} onClick={() => setAdminModule(module)}><span>{module.slice(0, 1)}</span>{module}</button>)}</nav>
          <div className="crm-user"><div className="avatar">GP</div><div><strong>Greg Peterson</strong><small>Administrator</small></div></div>
        </aside>
        <section className="crm-content">
          <header className="crm-topbar"><div><p className="eyebrow">{adminModule}</p><h1>{adminModule === "Dashboard" ? "Good morning, Greg" : adminModule}</h1><p>{adminModule === "Dashboard" ? "Here is what is happening across your business today." : `Manage ${adminModule.toLowerCase()} across the Photos by Greg platform.`}</p></div><div className="crm-actions"><label className="crm-search"><span>⌕</span><input value={adminSearch} onChange={(event) => setAdminSearch(event.target.value)} placeholder="Search customers, schools, projects…" /></label><button onClick={load}>↻ Refresh</button></div></header>
          {error && <div className="notice error">{error}</div>}
          <section className="crm-metrics">
            <button onClick={() => setAdminModule("Customers")}><Metric value={d.totalCustomers || 0} label="Total customers" /></button>
            <button onClick={() => setAdminModule("Bookings")}><Metric value={d.totalBookings || 0} label="Upcoming sessions" tone="amber" /></button>
            <button onClick={() => setAdminModule("Bookings")}><Metric value={d.pendingBookings || 0} label="Pending bookings" tone="red" /></button>
            <button onClick={() => setAdminModule("Yearbooks")}><Metric value={d.activeYearbookProjects || 0} label="Active yearbooks" /></button>
            <button onClick={() => setAdminModule("Galleries")}><Metric value={d.publishedGalleries || 0} label="Published galleries" tone="amber" /></button>
            <button onClick={() => setAdminModule("Orders")}><Metric value={`$${((d.merchandiseRevenueCents || 0) / 100).toFixed(2)}`} label="Merchandise revenue" /></button>
          </section>
          <section className="crm-dashboard-grid">
            <article className="crm-panel crm-bookings"><header><div><h2>Upcoming bookings</h2><span>{filteredBookings.length} records</span></div><button onClick={() => setAdminModule("Bookings")}>View all</button></header>{filteredBookings.length ? <div className="crm-table"><div className="crm-table-head"><span>Date</span><span>Customer / Event</span><span>Type</span><span>Status</span></div>{filteredBookings.slice(0, 6).map((booking) => <div className="crm-table-row" key={booking.id}><span>{formatDate(booking.preferredDate)}</span><span><strong>{booking.name}</strong><small>{booking.email}</small></span><span>{booking.sessionType}</span><span><em className={`status-chip ${booking.status}`}>{booking.status}</em></span></div>)}</div> : <EmptyState>No matching bookings yet.</EmptyState>}</article>
            <article className="crm-panel crm-calendar"><header><div><h2>Upcoming calendar</h2><span>Central Time</span></div><button onClick={() => setAdminModule("Calendar")}>View calendar</button></header>{filteredBookings.slice(0, 5).map((booking, index) => <div className="calendar-row" key={booking.id}><time><b>{formatDate(booking.preferredDate).split(" ")[1]?.replace(",", "") || index + 1}</b><small>{formatDate(booking.preferredDate).split(" ")[0]}</small></time><div><strong>{booking.name}</strong><span>{booking.sessionType}</span></div><i>{booking.status}</i></div>)}{!filteredBookings.length && <EmptyState>No scheduled sessions.</EmptyState>}</article>
            <article className="crm-panel crm-projects"><header><div><h2>Active school / yearbook projects</h2><span>{filteredProjects.length} workspaces</span></div><button onClick={() => setAdminModule("Yearbooks")}>View all projects</button></header>{filteredProjects.length ? <div className="crm-table"><div className="crm-project-head"><span>School</span><span>Plan</span><span>Progress</span><span>Portraits</span><span>Pages</span></div>{filteredProjects.map((project) => <div className="crm-project-row" key={project.id}><span><strong>{project.schoolName}</strong><small>{project.schoolYear}</small></span><span>{project.plan}</span><span><b>{project.metrics.completionPercent}%</b><ProgressBar value={project.metrics.completionPercent} /></span><span>{project.metrics.portraitsReceived} received<br/><small>{project.metrics.missingPortraits} missing</small></span><span>{project.metrics.pagesApproved} / {project.totalPages}</span></div>)}</div> : <EmptyState>No matching school projects.</EmptyState>}</article>
            <article className="crm-panel crm-alerts"><header><div><h2>Alerts</h2><span>Operational attention</span></div><button>View all</button></header>{alerts.map((alert, index) => <button className="alert-row" key={`${alert.title}-${index}`} onClick={() => setAdminModule(alert.target)}><span className={alert.tone}>{alert.count}</span><div><strong>{alert.title}</strong><small>{alert.detail}</small></div><b>›</b></button>)}</article>
          </section>
        </section>
      </main>
    );
  }

  if (view === "yearbook") {
    return (
      <main className="platform-main">
        <header className="platform-heading"><div><p className="eyebrow">Yearbook-as-a-Service</p><h1>School production workspace</h1><p>Onboard schools, track portraits, approve pages and manage deadlines.</p></div></header>
        {error && <div className="notice error">{error}</div>}
        <section className="split-grid yearbook-layout">
          <form className="data-panel onboarding-form" onSubmit={createSchool}><h2>Onboard a school</h2><label>School name<input required value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} /></label><label>Coordinator<input required value={schoolForm.coordinatorName} onChange={(e) => setSchoolForm({ ...schoolForm, coordinatorName: e.target.value })} /></label><label>Email<input required type="email" value={schoolForm.coordinatorEmail} onChange={(e) => setSchoolForm({ ...schoolForm, coordinatorEmail: e.target.value })} /></label><label>Enrollment<input type="number" min="0" value={schoolForm.enrollment} onChange={(e) => setSchoolForm({ ...schoolForm, enrollment: e.target.value })} /></label><button>Create school workspace</button></form>
          <article className="data-panel"><h2>Yearbook portfolio</h2>{data.projects.length ? data.projects.map((project) => <div className="yearbook-project" key={project.id}><div className="project-title"><div><strong>{project.schoolName}</strong><span>{project.schoolYear} · {project.plan}</span></div><b>{project.metrics.completionPercent}%</b></div><ProgressBar value={project.metrics.completionPercent} /><div className="mini-metrics"><span><b>{project.metrics.portraitsReceived}</b> portraits</span><span><b>{project.metrics.missingPortraits}</b> missing</span><span><b>{project.metrics.pagesApproved}</b> approved pages</span></div></div>) : <EmptyState>Create the first school workspace.</EmptyState>}</article>
        </section>
      </main>
    );
  }

  if (view === "portfolio") {
    const visible = data.galleries.filter((gallery) => gallery.published || gallery.galleryType === "public");
    return <main className="platform-main"><header className="platform-heading"><div><p className="eyebrow">Selected work</p><h1>Photography portfolio</h1><p>Only images with recorded portfolio permission should be published here.</p></div></header><section className="gallery-grid">{visible.length ? visible.map((gallery) => <article className="gallery-card" key={gallery.id}><div className="gallery-cover">{gallery.photos[0] ? <img src={gallery.photos[0].imageUrl} alt={gallery.photos[0].title || gallery.title} /> : <span>Photo gallery</span>}</div><p className="eyebrow">{gallery.category || "Featured work"}</p><h2>{gallery.title}</h2><span>{gallery.photos.length} photographs</span></article>) : <EmptyState>Portfolio projects will appear after a gallery is published with approved photographs.</EmptyState>}</section></main>;
  }

  if (view === "connected") {
    return <main className="platform-main"><header className="platform-heading"><div><p className="eyebrow">Living yearbook</p><h1>Stay Connected</h1><p>Privacy-controlled profiles, approved life events and optional social links.</p></div></header><section className="profile-grid">{data.profiles.length ? data.profiles.map((profile) => <article className="profile-card" key={profile.id}><div className="avatar">{profile.id}</div><div><span className={`visibility ${profile.visibility}`}>{profile.visibility}</span><h2>Yearbook member #{profile.studentId}</h2><p>{profile.bio || "No biography added yet."}</p><div className="social-row">{profile.socialLinks.map((link) => <a key={link.id} href={link.url} target="_blank" rel="noreferrer">{link.platform}</a>)}</div>{profile.lifeEvents.map((event) => <div className="life-event" key={event.id}><strong>{event.title}</strong><span>{event.approved ? "Approved" : "Pending review"}</span></div>)}</div></article>) : <EmptyState>Stay Connected profiles will appear after students opt in.</EmptyState>}</section></main>;
  }

  if (view === "store") {
    return <main className="platform-main"><header className="platform-heading"><div><p className="eyebrow">Photo merchandise</p><h1>Create something tangible</h1><p>Choose an authorized gallery image and place it on apparel, gifts or prints.</p></div></header><section className="product-grid">{data.products.length ? data.products.map((product) => <article className="product-card" key={product.id}><div className="product-art">PBG</div><span>{product.category}</span><h2>{product.name}</h2><strong>${product.price.toFixed(2)}</strong><button disabled>Select photo</button></article>) : <EmptyState>The product catalog is ready for shirts, mugs, posters and canvas prints.</EmptyState>}</section></main>;
  }

  return null;
}

export default function App() {
  const [view, setView] = useState("book");
  const navigation = [
    ["book", "▦", "Booking"],
    ["portfolio", "▧", "Portfolio"],
    ["yearbook", "▤", "Yearbook"],
    ["connected", "◎", "Stay Connected"],
    ["store", "◇", "Merchandise"],
    ["admin", "⌁", "Admin CRM"],
  ];
  return (
    <div className="workspace-shell">
      <aside className="workspace-sidebar">
        <button className="workspace-brand" onClick={() => setView("book")}>
          <span className="workspace-camera">▣</span>
          <span><strong>Photos by Greg</strong><small>Davis Digital Services</small></span>
        </button>
        <nav aria-label="Main navigation">
          {navigation.map(([id, icon, label]) => (
            <button key={id} className={view === id ? "active" : ""} onClick={() => setView(id)}>
              <span>{icon}</span>{label}
            </button>
          ))}
        </nav>
        <section className="workspace-plan"><span>◇</span><div><strong>Professional</strong><small>Platform workspace</small><button onClick={() => setView("admin")}>Manage business</button></div></section>
        <section className="workspace-help"><span>?</span><div><strong>Need Help?</strong><small>Contact Support</small></div></section>
      </aside>
      <section className="workspace-content">
        <header className="workspace-mobilebar"><button onClick={() => setView("book")}><span>▣</span> Photos by Greg</button><strong>{viewLabels[view]}</strong></header>
        {view === "book" ? <BookingExperience /> : <PlatformView view={view} />}
      </section>
    </div>
  );
}
