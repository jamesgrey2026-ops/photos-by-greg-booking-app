const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}) {
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
