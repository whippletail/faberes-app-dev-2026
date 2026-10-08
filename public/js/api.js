// Shared helper for protected pages: attaches the token and handles expiry.
const token = localStorage.getItem("token");
if (!token) window.location.href = "/index.html"; // no token, back to login

async function apiGet(url) {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 401) {
    localStorage.removeItem("token"); // expired or invalid
    window.location.href = "/index.html";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

document.getElementById("logout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/index.html";
});
