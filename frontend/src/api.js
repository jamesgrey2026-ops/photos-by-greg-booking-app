const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  } catch {
    throw new Error("The booking service is unavailable. Please try again.");
  }
if (response.status === 204) return null;
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    const fieldMessage = body?.errors && Object.values(body.errors)[0];
    throw new Error(fieldMessage || body?.error || "The request could not be completed.");
  }
  return body;
}

export const bookingsApi = {
  list: () => request("/bookings"),
  create: (booking) => request("/bookings", { method: "POST", body: JSON.stringify(booking) }),
  update: (id, changes) => request(`/bookings/${id}`, { method: "PUT", body: JSON.stringify(changes) }),
  remove: (id) => request(`/bookings/${id}`, { method: "DELETE" }),
};

export const platformApi = {
  dashboard: () => request("/admin/dashboard"),
  schools: {
    list: () => request("/schools"),
    create: (data) => request("/schools", { method: "POST", body: JSON.stringify(data) }),
  },
  projects: {
    list: () => request("/yearbook-projects"),
    create: (data) => request("/yearbook-projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/yearbook-projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  students: {
    list: (projectId) => request(`/students${projectId ? `?projectId=${projectId}` : ""}`),
    create: (data) => request("/students", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  pages: {
    list: (projectId) => request(`/yearbook-pages${projectId ? `?projectId=${projectId}` : ""}`),
    create: (data) => request("/yearbook-pages", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/yearbook-pages/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  },
  profiles: {
    list: () => request("/connected-profiles"),
    create: (data) => request("/connected-profiles", { method: "POST", body: JSON.stringify(data) }),
    addLink: (data) => request("/social-links", { method: "POST", body: JSON.stringify(data) }),
    addEvent: (data) => request("/life-events", { method: "POST", body: JSON.stringify(data) }),
  },
  galleries: {
    list: (published = false) => request(`/galleries${published ? "?published=true" : ""}`),
    create: (data) => request("/galleries", { method: "POST", body: JSON.stringify(data) }),
    addPhoto: (data) => request("/photos", { method: "POST", body: JSON.stringify(data) }),
  },
  products: {
    list: () => request("/products"),
    create: (data) => request("/products", { method: "POST", body: JSON.stringify(data) }),
  },
  orders: {
    list: () => request("/orders"),
    create: (data) => request("/orders", { method: "POST", body: JSON.stringify(data) }),
  },
};
